<template>
  <v-container class="pa-0" fluid>
    <v-row class="ma-0">
      <v-col class="pa-0" cols="12">
        <v-toolbar class="translucent" dense height="64px">
          <ToggleButtons
            :contents="timeButtons"
            :default="'day'"
            @select-button="changeTimescale"
          />
          <v-spacer />
          <ToggleButtons
            :contents="volumeButtons"
            :default="'productivity'"
            @select-button="changeVolumetype"
          />
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row class="pa-0 ma-0">
      <v-col class="pa-4 pb-2" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent body-2 font-weight-medium" flat>
            <ToggleButtons
              ref="graphtype"
              :contents="stackButtons"
              :default="'stack'"
              @select-button="changeGraphtype"
            />
            <v-spacer />STACK LABEL
            <v-switch
              v-model="chartOptions.yAxis.stackLabels.enabled"
              inset
              class="pt-6 pl-4"
            />
          </v-toolbar>
          <highcharts :options="chartOptions" />
        </v-card>
      </v-col>
    </v-row>
    <v-row
      v-if="Object.keys(chartOptionsSingles).length > 1"
      class="ma-0 px-2 pb-2"
    >
      <v-col
        v-for="(chartOptionsSingle, plant) in chartOptionsSingles"
        :key="plant"
        class="pa-2"
        xl="4"
        lg="4"
        md="6"
        sm="12"
        cols="12"
      >
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>{{ plant }}</v-toolbar-title>
          </v-toolbar>
          <highcharts :options="chartOptionsSingle" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Chart } from "highcharts-vue";
import Highcharts from "highcharts";
import ToggleButtons from "../components/ToggleButtons";

export default {
  components: {
    highcharts: Chart,
    ToggleButtons,
  },
  data() {
    return {
      selectAll: false,
      daycount: 0,
      prodSum: 0,
      currentTime: undefined,
      currentGraphtype: "stack",
      viewdata: {},
      switchTarget: "productivity",
      chartOptions: {
        chart: {
          type: "column",
          backgroundColor: "transparent",
          style: { fontFamily: "Roboto", fontSize: "12px" },
          height: "600px",
          zoomType: "xy",
        },
        title: {
          text: "",
        },
        legend: {
          enabled: true,
        },
        series: [{ data: [] }],
        plotOptions: {
          column: {
            stacking: "normal",
          },
        },
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          labels: {
            rotation: -45,
            max: null,
            min: null,
          },
        },
        yAxis: {
          stackLabels: { enabled: false },
          title: { text: "packages" },
        },
      },
      /**
       * 個別用
       */
      chartOptionsSingles: {},
      plantColors: {
        Charlie: "rgba(255,138,128 ,1)",
        Zacconi: "rgba(140,158,255 ,1)",
        DongFeng: "rgba(130,177,255 ,1)",
        Shima: "rgba(128,216,255 ,1)",
        Hevin: "rgba(167,255,235 ,1)",
        Grey: "rgba(255,128,171 ,1)",
      },
    };
  },
  computed: {
    stateFilterData: function() {
      return this.$store.state.filterdata;
    },
    comparedata: function() {
      return this.$store.state.byplantdata;
    },
    timeButtons: function() {
      return ["day", "week", "month", "all"];
    },
    volumeButtons: function() {
      return ["productivity", "volume", "weight"];
    },
    stackButtons: function() {
      return ["normal", "stack", "ratio"];
    },
  },
  watch: {
    stateFilterData: {
      handler: function(value, oldValue) {
        this.prepareData();
        this.createViewdata();
      },
      immediate: true,
    },
  },
  methods: {
    async prepareData() {
      const funcFilter = (item, index, self) => {
        return (
          (this.stateFilterData.selectplant.length == 0 ||
            this.stateFilterData.selectplant.indexOf(item.city_plant_no) >=
              0) &&
          (!this.stateFilterData.to ||
            new Date(item.dt) < new Date(this.stateFilterData.to)) &&
          (!this.stateFilterData.from ||
            new Date(item.dt) > new Date(this.stateFilterData.from))
        );
      };

      let viewdataArr = this.comparedata.filter(funcFilter);

      //セグメントでまとめたオブジェクトに変更
      const groupBy = (xs, key) => {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      this.viewdata = groupBy(viewdataArr, "city_plant_no");
    },
    createViewdata(clickedButton) {
      let viewdataOptional = {};
      let graphRange = { max_x: null, max_y: null, min_x: null };
      let timescaleType = "";
      this.chartOptions.xAxis.type = "datetime";

      if (clickedButton) {
        //切替ボタンクリック時
        timescaleType = clickedButton;
        this.currentTime = clickedButton;
        this.controlGraphtypeButtons();
      } else {
        if (this.currentTime) {
          //フィルタ変更時
          timescaleType = this.currentTime;
          this.controlGraphtypeButtons();
        } else {
          //初期表示
          timescaleType = "day";
          this.currentTime = timescaleType;
          this.switchTarget = "productivity";
          this.chartOptions.yAxis.title.text = "%";
        }
      }

      if (this.selectAll) {
        this.showAllByPlant();
        return;
      }

      this.$_.forEach(this.viewdata, (ary, key) => {
        let current = { x: new Date(), y: null };
        let plantTimearr = [];
        this.daycount = 1;
        this.prodSum = 0;

        this.$_.forEach(ary, (value, plantdataindex) => {
          let columnValue = "";

          if (this.switchTarget === "productivity") {
            columnValue = value["dt_productivity"];
          } else if (this.switchTarget === "volume") {
            columnValue = value["sum"];
          } else if (this.switchTarget === "weight") {
            columnValue = value["weight"];
          }

          if (timescaleType === "day") {
            current.x = new Date(value["dt"]);
            current.y = columnValue;
            plantTimearr.push(Object.assign({}, current));
          } else if (timescaleType === "week") {
            let targetX = new Date(value["week_start"]);
            if (this.switchTarget === "productivity") {
              plantTimearr = this.getAverage(
                current,
                ary,
                plantdataindex,
                plantTimearr,
                targetX
              );
            } else if (
              this.switchTarget === "volume" ||
              this.switchTarget === "weight"
            ) {
              plantTimearr = this.getSum(current, value, plantTimearr, targetX);
            }
          } else if (timescaleType === "month") {
            let targetX = new Date(
              new Date(value["dt"]).getFullYear(),
              new Date(value["dt"]).getMonth()
            );

            if (this.switchTarget === "productivity") {
              plantTimearr = this.getAverage(
                current,
                ary,
                plantdataindex,
                plantTimearr,
                targetX
              );
            } else if (
              this.switchTarget === "volume" ||
              this.switchTarget === "weight"
            ) {
              plantTimearr = this.getSum(current, value, plantTimearr, targetX);
            }
          }
          //XYの最大最小を記録しておく
          if (!graphRange.max_x || graphRange.max_x < current.x)
            graphRange.max_x = current.x;
          if (!graphRange.min_x || graphRange.min_x > current.x)
            graphRange.min_x = current.x;
          if (!graphRange.max_y || graphRange.max_y < current.y)
            graphRange.max_y = current.y;
        });

        //Xが日付以外（週、月）の時
        if (timescaleType != "day") {
          //最後のcurrent入れる
          plantTimearr.push(current);
          //["",""]を除く
          plantTimearr.shift();
        }

        viewdataOptional[key] = plantTimearr;
      });

      //chartoptionのseriesに入れる
      let viewdataSet = [];
      for (let plantNo of Object.keys(viewdataOptional)) {
        viewdataSet.push({
          name: plantNo,
          data: viewdataOptional[plantNo],
          borderWidth: 0,
          color: this.plantColors[plantNo],
        });
      }
      this.chartOptions.series = viewdataSet;
      this.chartOptions.legend.enabled = true;

      //chartOptionsを元手にchartOptionsSinglesにコピーで作成
      this.chartOptionsSingles = {};
      let viewdataIndex = 0;
      for (let plantNo of Object.keys(viewdataOptional)) {
        let chartOptionsSingle = this.$_.cloneDeep(this.chartOptions);
        chartOptionsSingle.chart.height = "300px";
        chartOptionsSingle.series = [this.chartOptions.series[viewdataIndex]];
        chartOptionsSingle.plotOptions.column.stacking = "";
        chartOptionsSingle.legend.enabled = false;
        chartOptionsSingle.yAxis.max = graphRange.max_y;
        chartOptionsSingle.xAxis.max = graphRange.max_x.getTime();
        chartOptionsSingle.xAxis.min = graphRange.min_x.getTime();
        this.chartOptionsSingles[plantNo] = chartOptionsSingle;
        viewdataIndex++;
      }
    },
    changeTimescale(clickedButton) {
      if (clickedButton === "all") {
        this.selectAll = true;
      } else {
        this.selectAll = false;
      }
      this.createViewdata(clickedButton);
    },
    changeGraphtype(clickedButton) {
      let graphType = clickedButton;

      switch (graphType) {
        case "normal":
          this.currentGraphtype = "normal";
          break;
        case "stack":
          this.currentGraphtype = "stack";
          break;
        case "ratio":
          this.currentGraphtype = "ratio";
          break;
      }
      this.controlGraphtypeButtons();
    },
    changeVolumetype(clickedButton) {
      let volumeType = clickedButton;

      if (volumeType === "productivity") {
        this.switchTarget = "productivity";
        this.chartOptions.yAxis.title.text = "%";
      } else if (volumeType === "volume") {
        this.switchTarget = "volume";
        this.chartOptions.yAxis.title.text = "packages";
      } else if (volumeType === "weight") {
        this.switchTarget = "weight";
        this.chartOptions.yAxis.title.text = "kg";
      }
      this.createViewdata();
    },
    getSum(current, value, plantTimearr, targetX) {
      let columnValue = "";
      if (this.switchTarget === "volume") {
        columnValue = value["sum"];
      } else if (this.switchTarget === "weight") {
        columnValue = value["weight"];
      }

      if (current.x.getTime() != targetX.getTime()) {
        plantTimearr.push(Object.assign({}, current));
        current.x = targetX;
        current.y = columnValue;
      } else {
        current.y += columnValue;
      }
      return plantTimearr;
    },
    getAverage(current, ary, plantdataindex, plantTimearr, targetX) {
      let value = ary[plantdataindex];
      let columnValue = (columnValue = value["dt_productivity"]);

      if (current.x.getTime() != targetX.getTime()) {
        current.y = this.prodSum / this.daycount;
        plantTimearr.push(Object.assign({}, current));
        current.x = targetX;
        this.prodSum = columnValue;
        this.daycount = 1;
      } else {
        this.daycount += 1;
        this.prodSum += columnValue;
      }

      if (plantdataindex === ary.length - 1) {
        //最後のcurrent.yを平均値にする
        current.y = this.prodSum / this.daycount;
      }

      return plantTimearr;
    },
    showAllByPlant() {
      let plantTotalArr = [];
      let daycount = 0;

      this.$_.forEach(this.viewdata, (ary, key) => {
        let current = {
          name: ary[0].city_plant_no,
          y: null,
          color: null,
        };
        this.$_.forEach(ary, (value, plantdataindex) => {
          if (this.switchTarget === "productivity") {
            current.y += value.dt_productivity;
          } else if (this.switchTarget === "volume") {
            current.y += value.sum;
          } else if (this.switchTarget === "weight") {
            current.y += value.weight;
          }
          daycount = plantdataindex + 1;
        });

        if (this.switchTarget === "productivity") {
          current.y = current.y / daycount;
        }
        current.color = this.plantColors[current.name];
        plantTotalArr.push(current);
      });
      this.chartOptions.xAxis.type = "category";
      this.chartOptions.legend.enabled = false;
      this.chartOptions.series = [{ data: plantTotalArr }];
      this.chartOptionsSingles = {};
    },
    controlGraphtypeButtons() {
      const normalButton = this.$refs.graphtype.$el.childNodes[0].children[0];
      const stackButton = this.$refs.graphtype.$el.childNodes[0].children[1];
      const ratioButton = this.$refs.graphtype.$el.childNodes[0].children[2];

      if (this.selectAll) {
        //NORMALボタンのみ表示、選択
        stackButton.setAttribute("style", "display:none;");
        ratioButton.setAttribute("style", "display:none;");
        normalButton.classList.add("active");
        this.chartOptions.plotOptions.column.stacking = "";
        this.currentGraphtype = "normal";
      } else {
        //全ボタンを表示する
        stackButton.setAttribute("style", "display:inline-flex");
        ratioButton.setAttribute("style", "display:inline-flex");
        normalButton.classList.remove("active");
        stackButton.classList.remove("active");
        ratioButton.classList.remove("active");

        switch (this.currentGraphtype) {
          case "normal":
            this.chartOptions.plotOptions.column.stacking = "";
            normalButton.classList.add("active");
            break;

          case "stack":
            this.chartOptions.plotOptions.column.stacking = "normal";
            stackButton.classList.add("active");
            break;

          case "ratio":
            this.chartOptions.plotOptions.column.stacking = "percent";
            ratioButton.classList.add("active");
            break;
        }
      }
    },
  },
};
</script>

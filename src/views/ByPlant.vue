<template>
  <v-container class="pa-0" fluid>
    <v-row class="ma-0">
      <v-col class="pa-0" cols="12">
        <v-toolbar class="translucent" dense height="64px">
          <ToggleButtons
            :contents="timeButtons"
            :default="'day'"
            @select-button="change_timescale"
          />
          <v-spacer />
          <ToggleButtons
            :contents="volumeButtons"
            :default="productivity ? 'productivity' : 'volume'"
            @select-button="change_volumetype"
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
              @select-button="change_graphtype"
            />
            <v-spacer />STACK LABEL
            <v-switch v-model="chartOptions.yAxis.stackLabels.enabled" inset class="pt-6 pl-4" />
          </v-toolbar>
          <highcharts :options="chartOptions" />
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="Object.keys(chartOptions_singles).length > 1" class="ma-0 px-2 pb-2">
      <v-col
        v-for="(chartOptions_single, plant) in chartOptions_singles"
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
          <highcharts :options="chartOptions_single" />
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
    ToggleButtons
  },
  data() {
    return {
      selectAll: false,
      daycount: 0,
      prodSum: 0,
      currentTime: undefined,
      currentGraphtype: "stack",
      viewdata: {},
      switch_target: "volume",
      chartOptions: {
        chart: {
          type: "column",
          backgroundColor: "transparent",
          style: { fontFamily: "Roboto", fontSize: "12px" },
          height: "600px",
          zoomType: "xy"
        },
        title: {
          text: ""
        },
        legend: {
          enabled: true
        },
        series: [{ data: [] }],
        plotOptions: {
          column: {
            stacking: "normal"
          }
        },
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          labels: {
            rotation: -45,
            max: null,
            min: null
          }
        },
        yAxis: {
          stackLabels: { enabled: false },
          title: { text: "sheets" }
        }
      },
      /**
       * 個別用
       */
      chartOptions_singles: {},
      colors_plant: {
        Charlie: "rgba(255,138,128 ,1)",
        Zacconi: "rgba(140,158,255 ,1)",
        Shima: "rgba(130,177,255 ,1)",
        Hevin: "rgba(167,255,235 ,1)",
        Grey: "rgba(255,128,171 ,1)"
      }
    };
  },
  computed: {
    //cumputedの中ではアロー関数つかうとthisが見えないからダメ
    stateFilterData: function() {
      return this.$store.state.filterdata;
    },
    byplantdata: function() {
      return this.$store.state.byplantdata;
    },
    productivity: function() {
      return true;
    },
    unit_inch: function() {
      return true;
    },
    timeButtons: function() {
      return ["day", "week", "month", "all"];
    },
    volumeButtons: function() {
      return this.productivity
        ? ["productivity", "volume", "volume x size"]
        : ["volume", "volume x size"];
    },
    stackButtons: function() {
      return ["normal", "stack", "ratio"];
    }
  },
  watch: {
    stateFilterData: {
      handler: function(value, oldValue) {
        //★MONTH→ALLを押すとX軸がおかしくなる
        this.fillData();
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 表示データをつくるメソッド
     */
    async fillData() {
      const func_filter = (item, index, self) => {
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

      let viewdata_ary = this.byplantdata.filter(func_filter);

      //セグメントでまとめたオブジェクトに変更
      const groupBy = (xs, key) => {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      this.viewdata = groupBy(viewdata_ary, "city_plant_no");

      this.change_scatter();
    },
    /**
     * 散布図の表示変更を押したときのメソッド
     */
    change_scatter(clickedButton) {
      let view_data_optional = {};
      let graph_range = { max_x: null, max_y: null, min_x: null };
      let timescale_type = "";

      this.chartOptions.xAxis.type = "datetime";

      if (clickedButton) {
        //切替ボタンクリック時
        timescale_type = clickedButton;
        this.currentTime = clickedButton;
        this.controlGraphtypeButtons();
      } else {
        if (this.currentTime) {
          //フィルタ変更時
          timescale_type = this.currentTime;
          this.controlGraphtypeButtons();
        } else {
          //初期表示
          timescale_type = "day";
          this.currentTime = timescale_type;
          this.switch_target = this.productivity ? "productivity" : "volume";
          this.chartOptions.yAxis.title.text = this.productivity
            ? "%"
            : "sheets";
        }
      }

      if (this.selectAll) {
        this.showAllByPlant();
        return;
      }

      this.$_.forEach(this.viewdata, (ary, key) => {
        //for中対象のデータ
        let current = { x: new Date(), y: null };
        //グラフにだす配列。カレントの配列
        let plant_timeary = [];
        this.daycount = 1;
        this.prodSum = 0;

        this.$_.forEach(ary, (value, plantdataindex) => {
          let column_value = "";

          if (this.switch_target === "productivity") {
            column_value = value["dt_productivity"];
          } else if (this.switch_target === "volume") {
            column_value = value["sum"];
          } else if (this.switch_target === "volume x size") {
            column_value = this.unit_inch
              ? value["weight"] * 1550
              : value["weight"];
          }

          if (timescale_type === "day") {
            //Xが日。特に処理はしない
            current.x = new Date(value["dt"]);
            current.y = column_value;
            plant_timeary.push(Object.assign({}, current));
          } else if (timescale_type === "week") {
            //Xが週
            let target_x = new Date(value["week_start"]);
            if (this.switch_target === "productivity") {
              plant_timeary = this.getAverage(
                current,
                ary,
                plantdataindex,
                plant_timeary,
                target_x
              );
            } else if (
              this.switch_target === "volume" ||
              this.switch_target === "volume x size"
            ) {
              plant_timeary = this.getSum(
                current,
                value,
                plant_timeary,
                target_x
              );
            }
          } else if (timescale_type === "month") {
            //Xが月
            let target_x = new Date(
              new Date(value["dt"]).getFullYear(),
              new Date(value["dt"]).getMonth()
            );

            if (this.switch_target === "productivity") {
              plant_timeary = this.getAverage(
                current,
                ary,
                plantdataindex,
                plant_timeary,
                target_x
              );
            } else if (
              this.switch_target === "volume" ||
              this.switch_target === "volume x size"
            ) {
              plant_timeary = this.getSum(
                current,
                value,
                plant_timeary,
                target_x
              );
            }
          }
          //XYの最大最小を記録しておく
          if (!graph_range.max_x || graph_range.max_x < current.x)
            graph_range.max_x = current.x;
          if (!graph_range.min_x || graph_range.min_x > current.x)
            graph_range.min_x = current.x;
          if (!graph_range.max_y || graph_range.max_y < current.y)
            graph_range.max_y = current.y;
        });

        //Xが日付以外（週、月）の時
        if (timescale_type != "day") {
          //最後のcurrent入れる
          plant_timeary.push(current);
          //["",""]を除く
          plant_timeary.shift();
        }

        view_data_optional[key] = plant_timeary;
      });

      //chartoptionのseriesに入れる
      let view_data_set = [];
      for (let plant_city_no of Object.keys(view_data_optional)) {
        view_data_set.push({
          name: plant_city_no,
          data: view_data_optional[plant_city_no],
          borderWidth: 0,
          color: this.colors_plant[plant_city_no]
        });
      }
      this.chartOptions.series = view_data_set;
      this.chartOptions.legend.enabled = true;

      //chartOptionsを元手にchartOptions_singlesにコピーで作成
      this.chartOptions_singles = {};
      let i_viewdata = 0;
      for (let plant_city_no of Object.keys(view_data_optional)) {
        let chartOptions_single = this.$_.cloneDeep(this.chartOptions);
        chartOptions_single.chart.height = "300px";
        chartOptions_single.series = [this.chartOptions.series[i_viewdata]];
        chartOptions_single.plotOptions.column.stacking = "";
        chartOptions_single.legend.enabled = false;
        chartOptions_single.yAxis.max = graph_range.max_y;
        chartOptions_single.xAxis.max = graph_range.max_x.getTime();
        chartOptions_single.xAxis.min = graph_range.min_x.getTime();
        this.chartOptions_singles[plant_city_no] = chartOptions_single;
        i_viewdata++;
      }
    },
    change_timescale(clickedButton) {
      if (clickedButton === "all") {
        this.selectAll = true;
      } else {
        this.selectAll = false;
      }
      this.change_scatter(clickedButton);
    },
    change_graphtype(clickedButton) {
      let graph_type = clickedButton;

      switch (graph_type) {
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
    change_volumetype(clickedButton) {
      let volume_type = clickedButton;

      if (volume_type === "productivity") {
        this.switch_target = "productivity";
        this.chartOptions.yAxis.title.text = "%";
      } else if (volume_type === "volume") {
        this.switch_target = "volume";
        this.chartOptions.yAxis.title.text = "sheets";
      } else if (volume_type === "volume x size") {
        this.switch_target = "volume x size";
        this.chartOptions.yAxis.title.text = "kg";
      }
      this.change_scatter();
    },
    getSum(current, value, plant_timeary, target_x) {
      let column_value = "";
      if (this.switch_target === "volume") {
        column_value = value["sum"];
      } else if (this.switch_target === "volume x size") {
        column_value = this.unit_inch
          ? value["weight"] * 1550
          : value["weight"];
      }

      if (current.x.getTime() != target_x.getTime()) {
        plant_timeary.push(Object.assign({}, current));
        current.x = target_x;
        current.y = column_value;
      } else {
        current.y += column_value;
      }
      return plant_timeary;
    },
    getAverage(current, ary, plantdataindex, plant_timeary, target_x) {
      let value = ary[plantdataindex];
      let column_value = (column_value = value["dt_productivity"]);

      if (current.x.getTime() != target_x.getTime()) {
        current.y = this.prodSum / this.daycount;
        plant_timeary.push(Object.assign({}, current));
        current.x = target_x;
        this.prodSum = column_value;
        this.daycount = 1;
      } else {
        this.daycount += 1;
        this.prodSum += column_value;
      }

      if (plantdataindex === ary.length - 1) {
        //最後のcurrent.yを平均値にする
        current.y = this.prodSum / this.daycount;
      }

      return plant_timeary;
    },
    showAllByPlant() {
      let plant_totalary = [];
      let daycount = 0;

      this.$_.forEach(this.viewdata, (ary, key) => {
        let current = {
          name: ary[0].city_plant_no,
          y: null,
          color: null
        };
        this.$_.forEach(ary, (value, plantdataindex) => {
          if (this.switch_target === "productivity") {
            current.y += value.dt_productivity;
          } else if (this.switch_target === "volume") {
            current.y += value.sum;
          } else if (this.switch_target === "volume x size") {
            current.y += this.unit_inch ? value.weight * 1550 : value.weight;
          }
          daycount = plantdataindex + 1;
        });

        if (this.switch_target === "productivity") {
          current.y = current.y / daycount;
        }
        current.color = this.colors_plant[current.name];
        plant_totalary.push(current);
      });
      this.chartOptions.xAxis.type = "category";
      this.chartOptions.legend.enabled = false;
      this.chartOptions.series = [{ data: plant_totalary }];
      this.chartOptions_singles = {};
    },
    controlGraphtypeButtons() {
      const normal_button = this.$refs.graphtype.$el.childNodes[0].children[0];
      const stack_button = this.$refs.graphtype.$el.childNodes[0].children[1];
      const ratio_button = this.$refs.graphtype.$el.childNodes[0].children[2];

      if (this.selectAll) {
        //NORMALボタンのみ表示、選択
        stack_button.setAttribute("style", "display:none;");
        ratio_button.setAttribute("style", "display:none;");
        normal_button.classList.add("active");
        this.chartOptions.plotOptions.column.stacking = "";
        this.currentGraphtype = "normal";
      } else {
        //全ボタンを表示する
        stack_button.setAttribute("style", "display:inline-flex");
        ratio_button.setAttribute("style", "display:inline-flex");
        normal_button.classList.remove("active");
        stack_button.classList.remove("active");
        ratio_button.classList.remove("active");

        switch (this.currentGraphtype) {
          case "normal":
            this.chartOptions.plotOptions.column.stacking = "";
            normal_button.classList.add("active");
            break;

          case "stack":
            this.chartOptions.plotOptions.column.stacking = "normal";
            stack_button.classList.add("active");
            break;

          case "ratio":
            this.chartOptions.plotOptions.column.stacking = "percent";
            ratio_button.classList.add("active");
            break;
        }
      }
    }
  }
};
</script>

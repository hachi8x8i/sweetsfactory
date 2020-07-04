<template>
  <v-container fluid class="pa-0">
    <DonutCards :viewdata="viewdata" />
    <v-row class="mx-4 my-2">
      <v-col class="pa-0" xl="12" lg="12" md="12" sm="12" cols="12">
        <v-card class="translucent" tile>
          <v-container class="mx-0 px-4 pt-4" style="max-width:100%">
            <v-row class="mx-0 pb-2 title font-weight-regular">Order Plot</v-row>
            <v-row class="mx-0">
              <v-col class="pa-0 text-left">
                <ToggleButtons
                  :contents="toggleButtons"
                  :default="'Productivity'"
                  @select-button="renderScatterPlot"
                />
              </v-col>
            </v-row>
          </v-container>
          <highcharts :options="chartOptionsPlot" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="ma-2">
      <v-col class="pa-2" xl="3" lg="3" md="4" sm="12" cols="12">
        <v-card class="translucent overflow-y-auto" height="600px" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Order NO:{{ orderTable[0].val }}</v-toolbar-title>
          </v-toolbar>
          <v-simple-table dense class="transparent">
            <template v-slot:default>
              <tbody>
                <tr v-for="obj in orderTable" :key="obj.key">
                  <td>{{ obj.label }}</td>
                  <td v-if="obj.dig">{{ Math.round(obj.val * obj.dig * 10) / 10 + obj.unit }}</td>
                  <td v-else>{{ obj.val }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-col>

      <v-col class="pa-2" xl="9" lg="9" md="8" sm="12" cols="12">
        <v-card class="translucent" tile>
          <v-overlay :absolute="true" :value="isTimeDataloading">
            <v-progress-circular indeterminate></v-progress-circular>Timeseries
            data loading...
          </v-overlay>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Order {{ orderTable[1].val }}</v-toolbar-title>
          </v-toolbar>
          <highcharts :options="chartOptionsOrderprod" />

          <v-data-table
            :headers="tableHeader"
            :items="tableerrdata"
            :items-per-page="10"
            class="transparent px-6"
            dense
          ></v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Chart } from "highcharts-vue";
import Highcharts from "highcharts";
import DonutCards from "../components/DonutCards";
import ToggleButtons from "../components/ToggleButtons";

export default {
  components: {
    highcharts: Chart,
    DonutCards,
    ToggleButtons
  },
  data() {
    return {
      clickedButton: undefined,
      viewdata: {},
      switchScatter: "Production",
      orderTable: [
        { label: "Order NO", key: "order_no", val: null },
        { label: "Plant", key: "city_plant_no", val: null },
        { label: "Volume", key: "prod_volume", val: null },
        { label: "Weight", key: "weight", val: null },
        { label: "Start Time", key: "prod_start_time_local", val: null },
        { label: "End Time", key: "prod_end_time_local", val: null },
        { label: "Production Time", key: "prod_time", val: null },
        { label: "Stop Time", key: "stop_time", val: null },
        { label: "Stop Count", key: "stop_count", val: null },
        {
          label: "Speed Ratio",
          key: "prod_speed_ratio",
          val: null,
          dig: 100,
          unit: "%"
        },
        {
          label: "Productivity",
          key: "productivity",
          val: null,
          dig: 100,
          unit: "%"
        }
      ],
      tableerrdata: [],

      /**
       * 生産履歴
       */
      chartOptionsOrderprod: {
        chart: {
          type: "area",
          backgroundColor: "transparent",
          style: { fontFamily: "Roboto", fontSize: "12px" },
          height: "400px",
          zoomType: "xy"
        },
        time: { useUTC: false },
        title: { text: "" },
        legend: { enabled: false },
        series: [{ data: [] }],
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          labels: {
            rotation: -45,
            max: null,
            min: null
          },
          plotLines: []
        },
        yAxis: {
          max: null,
          min: 0,
          title: { text: "sheets" }
        },
        tooltip: {
          //thisにポイントデータがくる
          formatter: function() {
            if (this.x) {
              return this.point.viewx + "<br>" + "<b>" + this.y + "</b>";
            } else return this.key;
          }
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [
                  1,
                  Highcharts.Color(Highcharts.getOptions().colors[0])
                    .setOpacity(0)
                    .get("rgba")
                ]
              ]
            },
            threshold: null
          },
          series: {
            turboThreshold: 0
          }
          //series:{marker:{enabled:true}}
        }
      },
      /**
       * 散布図
       */
      chartOptionsPlot: {
        chart: {
          type: "scatter",
          backgroundColor: "transparent",
          style: { fontFamily: "Roboto", fontSize: "12px" },
          height: "400px",
          zoomType: "xy"
        },
        time: { useUTC: false },
        title: { text: "" },
        legend: { enabled: false },
        series: [{ data: [] }],
        credits: { enabled: false },
        xAxis: {
          type: "datetime",
          labels: {
            rotation: -45,
            max: null,
            min: null
          },
          allowDecimals: true,
          gridLineWidth: 1
        },
        yAxis: {
          max: null,
          min: 0,
          title: {
            text: null
          },
          allowDecimals: true
        },
        tooltip: {
          //thisにポイントデータがくる
          formatter: function() {
            return (
              "ORDER NO : " +
              this.point.order_no +
              "<br>" +
              "TERM : " +
              this.point.prod_start_time_local +
              " - " +
              this.point.prod_end_time_local +
              "<br>" +
              "<b>" +
              this.y +
              "</b>"
            );
          }
        },
        plotOptions: {
          scatter: {
            marker: {
              radius: 3.5,
              symbol: "circle",
              states: {
                hover: { enabled: true },
                select: { enabled: true }
              }
            }
          },
          series: {
            allowPointSelect: true,
            events: {
              click: e => {
                this.clickedPoint(e.point);
              }
            },
            turboThreshold: 0
          }
        }
      },
      isTimeDataloading: false,
      tableHeader: [
        { text: "Date Time", align: "left", value: "t" },
        { text: "Error", align: "left", value: "err" }
      ]
    };
  },
  computed: {
    stateFilterData: function() {
      return this.$store.state.filterdata;
    },
    firstdata: function() {
      return this.$store.state.firstdata;
    },
    isPound: function() {
      return this.$store.state.userdata.unitpound;
    },
    toggleButtons: function() {
      return ["Productivity", "Volume", "Weight"];
    }
  },
  watch: {
    stateFilterData: {
      handler: function(value) {
        if (Object.keys(this.firstdata).length > 0) {
          this.prepareData();
        }
        this.orderTable[3].label = this.isPound ? "Weight (lb)" : "Weight (g)";
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 表示データをつくるメソッド
     */
    prepareData() {
      const funcFilter = (item, index, self) => {
        return (
          (this.stateFilterData.selectplant.length == 0 ||
            this.stateFilterData.selectplant.indexOf(item.city_plant_no) >=
              0) &&
          (this.stateFilterData.selectsegment.length == 0 ||
            this.stateFilterData.selectsegment.indexOf(item.segment) >= 0) &&
          (!this.stateFilterData.to ||
            new Date(item.prod_start_time_local) <
              new Date(this.stateFilterData.to)) &&
          (!this.stateFilterData.from ||
            new Date(item.prod_start_time_local) >
              new Date(this.stateFilterData.from)) &&
          (!this.stateFilterData.selectorderno ||
            item.order_no.indexOf(this.stateFilterData.selectorderno) >= 0)
        );
      };
      let viewdataArr = this.firstdata.filter(funcFilter);

      viewdataArr.forEach(element => {
        element.x = new Date(element.x);
      });

      //セグメントでまとめたオブジェクトに変更
      const groupBy = (xs, key) => {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      this.viewdata = groupBy(viewdataArr, "segment");

      this.renderScatterPlot();
    },
    /**
     * ポイントをクリックしたときのメソッド
     */
    async clickedPoint(element) {
      if (element == null) {
        return;
      }
      this.isTimeDataloading = true;
      let orderinfo = element;
      //表描画
      this.orderTable.forEach(obj => {
        obj.val = orderinfo[obj.key];
      });

      if (this.isPound) {
        this.orderTable[3].val =
          Math.round((this.orderTable[3].val / 454) * 10) / 10;
      }
      this.getOrderProdData(orderinfo["order_id"]);

      //★ぐらふの色をスイーツっぽくしよう
      //★グラフタイトルがOrder Plant名になってるのどうなの
    },
    /**
     * 散布図クリック時に生産データとって描画する
     */
    async getOrderProdData(order_id) {
      let queries = { order: order_id };
      this.tableerrdata = [];
      await this.$axios
        .get("../api/errorseries", {
          params: queries
        })
        .then(response => {
          let errordata = response.data;
          let beforeT = "";
          let beforeErr = "";
          if (errordata) {
            for (let obj of errordata) {
              if (beforeT == obj.t) {
                beforeErr = beforeErr + ", " + obj.err;
              } else {
                beforeT != ""
                  ? this.tableerrdata.push({ t: beforeT, err: beforeErr })
                  : "";

                beforeErr = obj.err;
                beforeT = obj.t;
              }
            }
            this.tableerrdata.push({ t: beforeT, err: beforeErr });
          }
        });

      this.$axios
        .get("../api/orderprod", {
          params: queries
        })
        .then(response => {
          //グラフ描画
          let resdata = response.data;
          //オーダーIDに対応したデータがfirstprodhistにあるなら描画する
          if (resdata) {
            //末尾のyが0だったら取り除く
            if (resdata.slice(-1)[0].y == 0) resdata.pop();
            //milli秒に変換
            resdata.forEach(element => {
              element.viewx = element.x;
              element.x = new Date(element.x);
            });
            this.chartOptionsOrderprod.series[0].data = resdata;
            //縦ライン
            this.chartOptionsOrderprod.xAxis.plotLines = [];
            if (this.tableerrdata) {
              for (let obj of this.tableerrdata) {
                this.chartOptionsOrderprod.xAxis.plotLines.push({
                  color: "#FF0000",
                  value: new Date(obj.t),
                  width: 2,
                  tmp: obj.err,
                  events: {
                    mouseover: function(e) {
                      var series = this.axis.series[0],
                        chart = series.chart,
                        PointClass = series.pointClass,
                        tooltip = chart.tooltip,
                        point = new PointClass().init(series),
                        normalizedEvent = chart.pointer.normalize(e);

                      point.tooltipPos = [
                        normalizedEvent.chartX - chart.plotLeft,
                        normalizedEvent.chartY - chart.plotTop
                      ];

                      point.name = this.options.tmp;
                      tooltip.refresh(point);
                    },
                    mouseout: function(e) {
                      this.axis.chart.tooltip.hide();
                    }
                  }
                });
              }
            }
          } else this.chartOptionsOrderprod.series[0].data = [];

          this.isTimeDataloading = false;
        });
    },
    /**
     * 散布図の表示変更を押したときのメソッド
     */
    renderScatterPlot(currentButton) {
      if (currentButton) {
        //切替ボタンクリック時
        this.switchScatter = currentButton;
        this.clickedButton = currentButton;
      } else {
        if (this.clickedButton) {
          //フィルタ変更時
          this.switchScatter = this.clickedButton;
        } else {
          //初期表示
          this.switchScatter = "Productivity";
          this.clickedButton = this.switchScatter;
        }
      }

      console.log(this.viewdata);

      if (this.switchScatter === "Productivity") {
        this.chartOptionsPlot.yAxis.max = 1;
        this.chartOptionsPlot.yAxis.title.text = null;
        this.$_.forEach(this.viewdata, function(ary) {
          ary.forEach(function(value) {
            value["y"] = value["productivity"];
          });
        });
      } else if (this.switchScatter === "Volume") {
        this.chartOptionsPlot.yAxis.max = null;
        this.chartOptionsPlot.yAxis.title.text = "packages";
        this.$_.forEach(this.viewdata, function(ary) {
          ary.forEach(function(value) {
            value["y"] = value["prod_volume"];
          });
          ary["y"] = ary["prod_volume"];
        });
      } else if (this.switchScatter === "Weight") {
        this.chartOptionsPlot.yAxis.max = null;
        if (this.isPound) {
          this.$_.forEach(this.viewdata, function(ary) {
            ary.forEach(function(value) {
              value["y"] = Math.round((value["weight"] / 454) * 10) / 10;
            });
          });
          this.chartOptionsPlot.yAxis.title.text = "lb";
        } else {
          this.$_.forEach(this.viewdata, function(ary) {
            ary.forEach(function(value) {
              value["y"] = value["weight"];
            });
          });
          this.chartOptionsPlot.yAxis.title.text = "g";
        }
      }

      this.chartOptionsPlot.series = [];
      let dataarr = [];

      if (this.viewdata["Candy"]) {
        this.chartOptionsPlot.series.push({
          name: "Candy",
          color: "#4a71f4",
          data: this.viewdata["Candy"]
        });
      }
      if (this.viewdata["Chocolate"]) {
        this.chartOptionsPlot.series.push({
          name: "Chocolate",
          color: "#87c03a",
          data: this.viewdata["Chocolate"]
        });
      }
      if (this.viewdata["Cookie"]) {
        this.chartOptionsPlot.series.push({
          name: "Cookie",
          color: "#daa02a",
          data: this.viewdata["Cookie"]
        });
      }
      if (this.viewdata["Gum"]) {
        this.chartOptionsPlot.series.push({
          name: "Gum",
          color: "#da3c41",
          data: this.viewdata["Gum"]
        });
      }
    }
  }
};
</script>

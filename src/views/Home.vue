<template>
  <v-container fluid class="pa-0">
    <DonutCards :viewdata="viewdata" />
    <v-row class="mx-4 my-2">
      <v-col class="pa-0" xl="12" lg="12" md="12" sm="12" cols="12">
        <v-card class="translucent" tile>
          <v-container class="mx-0 px-4 pt-4" style="max-width:100%">
            <v-row class="mx-0 pb-2 title font-weight-regular">
              Order Plot
            </v-row>
            <v-row class="mx-0">
              <v-col cols="10" class="pa-0">
                <ToggleButtons
                  :contents="toggleButtons"
                  :default="'Productivity'"
                  @select-button="change_scatter"
                />
              </v-col>
            </v-row>
          </v-container>
          <highcharts :options="chartOptions_plot" />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="ma-2">
      <v-col class="pa-2" xl="3" lg="3" md="4" sm="12" cols="12">
        <v-card class="translucent overflow-y-auto" height="600px" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>
              Order ID:{{ prm_tabledata[0].val }}
            </v-toolbar-title>
          </v-toolbar>
          <v-simple-table dense class="transparent">
            <template v-slot:default>
              <tbody>
                <tr v-for="obj in prm_tabledata" :key="obj.key">
                  <td>{{ obj.label }}</td>
                  <td v-if="obj.dig">
                    {{ Math.round(obj.val * obj.dig * 10) / 10 + obj.unit }}
                  </td>
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
            <v-progress-circular indeterminate></v-progress-circular>
            Timeseries data loading...
          </v-overlay>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Order {{ prm_tabledata[1].val }}</v-toolbar-title>
          </v-toolbar>
          <highcharts :options="chartOptions_orderprod" />

          <v-data-table
            :headers="table_header"
            :items="tableerrdata"
            :items-per-page="10"
            class="transparent px-6"
            dense
          >
          </v-data-table>
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
      switch_scatter: "Production",
      prm_tabledata: [
        { label: "Order NO", key: "order_no", val: null },
        { label: "Plant", key: "city_plant_no", val: null },
        { label: "Volume", key: "prod_volume", val: null },
        { label: "Weight", key: "weight", val: null },
        { label: "Start Time", key: "prod_start_time_local", val: null },
        { label: "End Time", key: "prod_end_time_local", val: null },
        { label: "Production Time", key: "prod_time", val: null },
        { label: "Stop Time", key: "stop_time", val: null },
        { label: "Stop Count", key: "stop_count", val: null },
        { label: "Stop Count / Volume", key: "stop_count_per_vol", val: null },
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
      chartOptions_orderprod: {
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
      chartOptions_plot: {
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
              "ORDER ID :" +
              this.point.order_id +
              "<br>" +
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
                this.clicked_point(e.point);
              }
            },
            turboThreshold: 0
          }
        }
      },
      isTimeDataloading: false,
      table_header: [
        { text: "Date Time", align: "left", value: "t" },
        { text: "Error", align: "left", value: "err" }
      ]
    };
  },
  computed: {
    //cumputedの中ではアロー関数つかうとthisが見えないからダメ
    stateFilterData: function() {
      return this.$store.state.filterdata;
    },
    firstdata: function() {
      return this.$store.state.firstdata;
    },
    productivity: function() {
      return true;
    },
    unit_inch: function() {
      return false;
    },
    toggleButtons: function() {
      return ["Productivity", "Volume", "Weight"];
    }
  },
  watch: {
    stateFilterData: {
      handler: function(value, oldValue) {
        this.fillData();
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 表示データをつくるメソッド
     */
    fillData() {
      const func_filter = (item, index, self) => {
        return (
          (this.stateFilterData.selectregion.length == 0 ||
            this.stateFilterData.selectregion.indexOf(item.region) >= 0) &&
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
          (!this.stateFilterData.selectorderid ||
            item.order_id.indexOf(this.stateFilterData.selectorderid) >= 0) &&
          (!this.stateFilterData.selectorderno ||
            item.order_no.indexOf(this.stateFilterData.selectorderno) >= 0)
        );
      };
      let viewdata_ary = this.firstdata.filter(func_filter);
      //いったんフィルタしない

      viewdata_ary.forEach(element => {
        element.x = new Date(element.x);
      });

      //セグメントでまとめたオブジェクトに変更
      const groupBy = (xs, key) => {
        return xs.reduce(function(rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      this.viewdata = groupBy(viewdata_ary, "segment");

      this.change_scatter();
    },
    /**
     * ポイントをクリックしたときのメソッド
     */
    async clicked_point(element) {
      if (element == null) {
        return;
      }
      this.isTimeDataloading = true;
      let orderinfo = element;
      //表描画
      this.prm_tabledata.forEach(obj => {
        obj.val = orderinfo[obj.key];
      }); //グラフデータ取得＆描画
      //えらー表描画

      if (this.unit_inch) {
        //単位：inの場合
        // Volume x SizeをKインチに変換する
        let volsize = this.prm_tabledata[4];
        const volsizeIn = (volsize.val * 1550) / 1000;
        volsize.val = volsizeIn;

        // Box Sizeをインチに変換する
        let boxsize = this.prm_tabledata[7];
        const boxsizeIn = this.convertBoxsize(boxsize.val);
        boxsize.val = boxsizeIn;
      }
      /*       this.tableerrdata = []
      let before_t = ""
      let before_err = ""
      if(this.errorseries[orderinfo["order_id"]]){
        for(let obj of this.errorseries[orderinfo["order_id"]]){
          if(before_t == obj.t){
            before_err = before_err + ", " + obj.err
          }else{
            this.tableerrdata.push({t:before_t, err:before_err})
            before_err = obj.err
            before_t = obj.t
          }
        }
        this.tableerrdata.push({t:before_t, err:before_err})
      }
 */ this.getOrderProdData(
        orderinfo["order_id"]
      );

      /*       //グラフ描画
      let resdata = this.firstprodhist[orderinfo["order_id"]];
      //オーダーIDに対応したデータがfirstprodhistにあるなら描画する
      if(resdata){
      //末尾のyが0だったら取り除く
        if (resdata.slice(-1)[0].y == 0) resdata.pop()
        //milli秒に変換
        resdata.forEach(element => {
          element.viewx = element.x
          element.x = new Date(element.x)
        });
        this.chartOptions_orderprod.series[0].data = resdata
        //縦ライン
        this.chartOptions_orderprod.xAxis.plotLines = []
        if(this.tableerrdata){
          for(let obj of this.tableerrdata){
            this.chartOptions_orderprod.xAxis.plotLines.push({
                color: '#FF0000',
                value: new Date(obj.t),
                width: 2,
                tmp: obj.err,
                events: {
                  mouseover: function(e) {
                    var series = this.axis.series[0],
                    chart = series.chart,
                      PointClass = series.pointClass,
                      tooltip = chart.tooltip,
                      point = (new PointClass()).init(series),
                      normalizedEvent = chart.pointer.normalize(e);
                      
                  point.tooltipPos = [
                    normalizedEvent.chartX - chart.plotLeft,
                    normalizedEvent.chartY - chart.plotTop
                  ];

                  point.name = this.options.tmp
                  tooltip.refresh(point);
                },
                mouseout: function(e) {
                  this.axis.chart.tooltip.hide();
                }
              }
            })
          }
        }
      }else this.chartOptions_orderprod.series[0].data = []
 */
    },
    /**
     * 散布図クリック時に生産データとって描画する
     */
    async getOrderProdData(order_id) {
      //固定値分データ取り続けて、取るデータがなくなるまでやる。
      let queries = { order: order_id };
      //エラーデータ取得
      this.tableerrdata = [];
      await this.$axios
        .get("../api/errorseries", {
          params: queries
        })
        .then(response => {
          let errordata = response.data;
          let before_t = "";
          let before_err = "";
          if (errordata) {
            for (let obj of errordata) {
              if (before_t == obj.t) {
                before_err = before_err + ", " + obj.err;
              } else {
                before_t != ""
                  ? this.tableerrdata.push({ t: before_t, err: before_err })
                  : "";

                before_err = obj.err;
                before_t = obj.t;
              }
            }
            this.tableerrdata.push({ t: before_t, err: before_err });
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
            this.chartOptions_orderprod.series[0].data = resdata;
            //縦ライン
            this.chartOptions_orderprod.xAxis.plotLines = [];
            if (this.tableerrdata) {
              for (let obj of this.tableerrdata) {
                this.chartOptions_orderprod.xAxis.plotLines.push({
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
          } else this.chartOptions_orderprod.series[0].data = [];

          this.isTimeDataloading = false;
        });
    },
    /**
     * 散布図の表示変更を押したときのメソッド
     */
    change_scatter(currentButton) {
      //散布図表示制御
      if (currentButton) {
        //切替ボタンクリック時
        this.switch_scatter = currentButton;
        this.clickedButton = currentButton;
      } else {
        if (this.clickedButton) {
          //フィルタ変更時
          this.switch_scatter = this.clickedButton;
        } else {
          //初期表示
          this.productivity
            ? (this.switch_scatter = "Productivity")
            : (this.switch_scatter = "Volume");
          this.clickedButton = this.switch_scatter;
        }
      }

      if (this.switch_scatter === "Productivity") {
        this.chartOptions_plot.yAxis.max = 1;
        this.chartOptions_plot.yAxis.title.text = null;
        this.$_.forEach(this.viewdata, function(ary) {
          ary.forEach(function(value) {
            value["y"] = value["productivity"];
          });
        });
      } else if (this.switch_scatter === "Volume") {
        this.chartOptions_plot.yAxis.max = null;
        this.chartOptions_plot.yAxis.title.text = "sheets";
        this.$_.forEach(this.viewdata, function(ary) {
          ary.forEach(function(value) {
            value["y"] = value["prod_volume"];
          });
          ary["y"] = ary["prod_volume"];
        });
      } else if (this.switch_scatter === "Weight") {
        this.chartOptions_plot.yAxis.max = null;
        if (!this.unit_inch) {
          //単位：mの場合
          this.$_.forEach(this.viewdata, function(ary) {
            ary.forEach(function(value) {
              value["y"] =
                (value["prod_volume"] *
                  value["sheetsize_length_mm"] *
                  value["sheetsize_width_mm"]) /
                1000000;
            });
          });
          this.chartOptions_plot.yAxis.title.text = "㎡";
        } else {
          //単位：inの場合
          this.$_.forEach(this.viewdata, function(ary) {
            ary.forEach(function(value) {
              value["y"] =
                (((value["prod_volume"] *
                  value["sheetsize_length_mm"] *
                  value["sheetsize_width_mm"]) /
                  1000000) *
                  1550) /
                1000;
            });
          });
          this.chartOptions_plot.yAxis.title.text = "K in²";
        }
      }

      this.chartOptions_plot.series = [];
      let dataarr = [];

      if (this.viewdata["A"]) {
        if (this.productivity) {
          this.chartOptions_plot.series.push({
            name: "A",
            color: "#4a71f4",
            data: this.viewdata["A"]
          });
        } else {
          //無料会員
          dataarr = dataarr.concat(this.viewdata["A"]);
        }
      }
      if (this.viewdata["B"]) {
        if (this.productivity) {
          this.chartOptions_plot.series.push({
            name: "B",
            color: "#87c03a",
            data: this.viewdata["B"]
          });
        } else {
          dataarr = dataarr.concat(this.viewdata["B"]);
        }
      }
      if (this.viewdata["C"]) {
        if (this.productivity) {
          this.chartOptions_plot.series.push({
            name: "C",
            color: "#daa02a",
            data: this.viewdata["C"]
          });
        } else {
          dataarr = dataarr.concat(this.viewdata["C"]);
        }
      }
      if (this.viewdata["D"]) {
        if (this.productivity) {
          this.chartOptions_plot.series.push({
            name: "D",
            color: "#da3c41",
            data: this.viewdata["D"]
          });
        } else {
          dataarr = dataarr.concat(this.viewdata["D"]);
        }
      }

      if (!this.productivity) {
        //無料会員の場合セグメント区分なし
        this.chartOptions_plot.series.push({
          name: "order",
          color: "#da3c41",
          data: dataarr
        });
      }
    },

    convertBoxsize(boxsize) {
      //元々のboxsizeデータの単位はmm String型
      //単位：inの場合 (1mm = 0.0393701 inch)
      let xposition = boxsize.indexOf("x");
      let boxwidth = Math.round(
        parseInt(boxsize.substring(0, xposition)) * 0.0393701
      );
      let boxlength = Math.round(
        parseInt(boxsize.slice(xposition + 2)) * 0.0393701
      );

      let boxsizeIn =
        boxwidth.toString() + " " + "x" + " " + boxlength.toString();
      return boxsizeIn;
    }
  }
};
</script>

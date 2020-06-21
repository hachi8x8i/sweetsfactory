<template>
  <div>
    <v-row class="mx-2 mt-2 mb-0">
      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Order</v-toolbar-title>
          </v-toolbar>
          <highcharts
            v-if="Object.keys(viewdata).length > 0"
            :options="orderDonut"
          />
        </v-card>
      </v-col>

      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Volume</v-toolbar-title>
          </v-toolbar>
          <highcharts
            v-if="Object.keys(viewdata).length > 0"
            :options="volDonut"
          />
        </v-card>
      </v-col>

      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Weight</v-toolbar-title>
          </v-toolbar>
          <highcharts
            v-if="Object.keys(viewdata).length > 0"
            :options="volsizeDonut"
          />
        </v-card>
      </v-col>
      <v-col
        v-if="productivity"
        class="pa-2"
        xl="3"
        lg="3"
        md="3"
        sm="6"
        cols="12"
      >
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Productivity</v-toolbar-title>
            <v-spacer />
            <v-tooltip bottom button>
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon>help</v-icon>
                </v-btn>
              </template>
              <span> </span>
            </v-tooltip>
          </v-toolbar>

          <highcharts
            v-if="Object.keys(viewdata).length > 0"
            :options="prodDonut"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Chart } from "highcharts-vue";
import Highcharts from "highcharts";

export default {
  components: {
    highcharts: Chart
  },
  props: {
    viewdata: {
      type: Object,
      default: function() {
        return "";
      }
    }
  },
  data() {
    return {
      donuts_objs: {
        Order: {
          donut_data: {}
        },
        Volume: {
          donut_data: {}
        },
        "Volume x Size": {
          donut_data: {}
        },
        Productivity: {
          donut_data: {}
        }
      },

      //Setting for Highcharts
      orderDonut: {},
      volDonut: {},
      volsizeDonut: {},
      prodDonut: {},
      defaultOptions: {
        chart: {
          className: "donutchart",
          plotBackgroundColor: null,
          plotBorderWidth: 0,
          plotShadow: false,
          height: "300px",
          backgroundColor: "transparent"
        },
        title: {
          useHTML: true,
          text: "",
          align: "center",
          verticalAlign: "middle",
          y: 30,
          style: { fontFamily: "Roboto", fontSize: "28px" }
        },
        subtitle: {
          useHTML: true,
          fontFamily: "Roboto",
          text: "",
          align: "center",
          verticalAlign: "middle",
          fontSize: "14px",
          y: -20,
          style: { fontFamily: "Roboto" }
        },
        credits: {
          text: ""
        },
        accessibility: {
          point: {
            valueSuffix: "%"
          }
        },
        plotOptions: {
          pie: {
            borderWidth: "0",
            colors: ["#4a71f4", "#87c03a", "#daa02a", "#da3c41"],
            dataLabels: {
              enabled: true,
              crop: false,
              overflow: "allow",
              verticalAlign: "middle",
              x: 0,
              y: -5,
              useHTML: true,
              format: "{point.y}<br>{point.percentage:.0f} %",
              distance: -20,
              style: {
                fontFamily: "Roboto",
                fontSize: "67%",
                fontWeight: "none",
                color: "white",
                textOutline: "none"
              }
            },
            startAngle: 0, //円弧設定
            endAngle: 360,
            center: ["50%", "53%"], //円位置
            size: "110%"
          }
        },
        series: [
          {
            type: "pie",
            name: "",
            innerSize: "65%", //中心の空洞
            data: []
          }
        ]
      }
    };
  },
  computed: {
    orderTotal: function() {
      return this.donuts_objs.Order.donut_data.datasets[0].data.reduce(function(
        a,
        x
      ) {
        return a + x;
      });
    },
    volTotal: function() {
      return this.donuts_objs.Volume.donut_data.datasets[0].data.reduce(
        function(a, x) {
          return a + x;
        }
      );
    },
    volsizeTotal: function() {
      let volsizedata = this.donuts_objs["Volume x Size"].donut_data
        .datasets[0];
      if (!this.unit_inch) {
        //単位：mの場合
        return volsizedata.data.reduce(function(a, x) {
          return a + x;
        });
      } else {
        //単位：inの場合
        return Math.round(
          (volsizedata.data.reduce(function(a, x) {
            return a + x;
          }) *
            1550) /
            1000
        );
      }
    },
    prodTotal: function() {
      return this.donuts_objs.Productivity.donut_data.datasets[0].data[0];
    },
    productivity: function() {
      return true;
    },
    unit_inch: function() {
      return false;
    }
  },

  watch: {
    viewdata: {
      handler: function(value) {
        if (Object.keys(value).length > 0) {
          this.createDonutData();
          this.pushData();
        }
      },
      immediate: true
    }
  },
  methods: {
    createDonutData() {
      let view_A = this.viewdata["A"] ? this.viewdata["A"] : [];
      let view_B = this.viewdata["B"] ? this.viewdata["B"] : [];
      let view_C = this.viewdata["C"] ? this.viewdata["C"] : [];
      let view_D = this.viewdata["D"] ? this.viewdata["D"] : [];

      let count_a = view_A.length;
      let count_b = view_B.length;
      let count_c = view_C.length;
      let count_d = view_D.length;

      const func_sumsht = (accumulator, currentValue) => {
        return accumulator + parseInt(currentValue["prod_volume"]);
      };
      let sumsht_A = view_A.reduce(func_sumsht, 0);
      let sumsht_B = view_B.reduce(func_sumsht, 0);
      let sumsht_C = view_C.reduce(func_sumsht, 0);
      let sumsht_D = view_D.reduce(func_sumsht, 0);

      const func_sumproductivity = (accumulator, currentValue) => {
        return accumulator + parseFloat(currentValue["productivity"]);
      };
      let sump_A = view_A.reduce(func_sumproductivity, 0);
      let sump_B = view_B.reduce(func_sumproductivity, 0);
      let sump_C = view_C.reduce(func_sumproductivity, 0);
      let sump_D = view_D.reduce(func_sumproductivity, 0);

      const func_sumshtxs = (accumulator, currentValue) => {
        return (
          accumulator +
          parseInt(
            (currentValue["prod_volume"] *
              currentValue["sheetsize_length_mm"] *
              currentValue["sheetsize_width_mm"]) /
              1000000
          )
        );
      };
      let sumshtxs_A = view_A.reduce(func_sumshtxs, 0);
      let sumshtxs_B = view_B.reduce(func_sumshtxs, 0);
      let sumshtxs_C = view_C.reduce(func_sumshtxs, 0);
      let sumshtxs_D = view_D.reduce(func_sumshtxs, 0);

      this.donuts_objs["Order"].donut_data = {
        datasets: [
          {
            data: [count_a, count_b, count_c, count_d]
          }
        ],
        labels: ["A", "B", "C", "D"]
      };
      this.donuts_objs["Volume"].donut_data = {
        datasets: [
          {
            data: [sumsht_A, sumsht_B, sumsht_C, sumsht_D]
          }
        ],
        labels: ["A", "B", "C", "D"]
      };
      this.donuts_objs["Volume x Size"].donut_data = {
        datasets: [
          {
            data: [sumshtxs_A, sumshtxs_B, sumshtxs_C, sumshtxs_D]
          }
        ],
        labels: ["A", "B", "C", "D"]
      };
      let ave_productivity =
        Math.round(
          ((sump_A + sump_B + sump_C + sump_D) /
            (count_a + count_b + count_c + count_d)) *
            1000
        ) / 10;
      this.donuts_objs["Productivity"].donut_data = {
        datasets: [
          {
            data: [ave_productivity, 100 - ave_productivity]
          }
        ],
        labels: []
      };
    },
    pushData() {
      this.orderDonut = this.$_.cloneDeep(this.defaultOptions);
      this.volDonut = this.$_.cloneDeep(this.defaultOptions);
      this.volsizeDonut = this.$_.cloneDeep(this.defaultOptions);
      this.prodDonut = this.$_.cloneDeep(this.defaultOptions);

      this.orderDonut.subtitle.text =
        "<span style='position:absolute; top:47px; font-size:14px;'>orders</span>";

      this.volDonut.subtitle.text =
        "<span style='position:absolute; top:47px; left:10px; font-size:14px;'>packages</span>";

      this.volsizeDonut.subtitle.text =
        "<span style='position:absolute; top:47px; left:-10px; font-size:14px;'>kg</span>";

      this.prodDonut.subtitle.text =
        "<span style='position:absolute; top:47px; left:20px; font-size:14px;'>%</span>";

      this.prodDonut.plotOptions.pie.colors = ["#4a71f4", "#d8d8d8"];
      this.prodDonut.plotOptions.pie.dataLabels.enabled = false;

      if (this.productivity) {
        //有料会員の場合内訳も表示する
        let orderarr = [
          ["A", this.donuts_objs.Order.donut_data.datasets[0].data[0]],
          ["B", this.donuts_objs.Order.donut_data.datasets[0].data[1]],
          ["C", this.donuts_objs.Order.donut_data.datasets[0].data[2]],
          ["D", this.donuts_objs.Order.donut_data.datasets[0].data[3]]
        ];

        orderarr.forEach(el => this.orderDonut.series[0].data.push(el));
        this.orderDonut.title.text = this.orderTotal.toLocaleString();

        let volarr = [
          ["A", this.donuts_objs.Volume.donut_data.datasets[0].data[0]],
          ["B", this.donuts_objs.Volume.donut_data.datasets[0].data[1]],
          ["C", this.donuts_objs.Volume.donut_data.datasets[0].data[2]],
          ["D", this.donuts_objs.Volume.donut_data.datasets[0].data[3]]
        ];

        volarr.forEach(el => this.volDonut.series[0].data.push(el));
        this.volDonut.title.text = this.volTotal.toLocaleString();

        let volsizearr = [];

        if (!this.unit_inch) {
          //単位：mの場合
          volsizearr = [
            [
              "A",
              this.donuts_objs["Volume x Size"].donut_data.datasets[0].data[0]
            ],
            [
              "B",
              this.donuts_objs["Volume x Size"].donut_data.datasets[0].data[1]
            ],
            [
              "C",
              this.donuts_objs["Volume x Size"].donut_data.datasets[0].data[2]
            ],
            [
              "D",
              this.donuts_objs["Volume x Size"].donut_data.datasets[0].data[3]
            ]
          ];
        } else {
          //単位：inの場合
          volsizearr = [
            [
              "A",
              Math.round(
                (this.donuts_objs["Volume x Size"].donut_data.datasets[0]
                  .data[0] *
                  1550) /
                  1000
              )
            ],
            [
              "B",
              Math.round(
                (this.donuts_objs["Volume x Size"].donut_data.datasets[0]
                  .data[1] *
                  1550) /
                  1000
              )
            ],
            [
              "C",
              Math.round(
                (this.donuts_objs["Volume x Size"].donut_data.datasets[0]
                  .data[2] *
                  1550) /
                  1000
              )
            ],
            [
              "D",
              Math.round(
                (this.donuts_objs["Volume x Size"].donut_data.datasets[0]
                  .data[3] *
                  1550) /
                  1000
              )
            ]
          ];

          this.volsizeDonut.subtitle.text =
            "<span style='position:absolute; top:47px; left:-10px; font-size:14px;'>kg</span>";
        }

        volsizearr.forEach(el => this.volsizeDonut.series[0].data.push(el));
        this.volsizeDonut.title.text = this.volsizeTotal.toLocaleString();

        let prodarr = [
          ["A", this.donuts_objs.Productivity.donut_data.datasets[0].data[0]],
          ["B", this.donuts_objs.Productivity.donut_data.datasets[0].data[1]]
        ];

        prodarr.forEach(el => this.prodDonut.series[0].data.push(el));
        this.prodDonut.title.text = this.prodTotal.toLocaleString();
      } else {
        //有料会員でない場合は合計値のみ表示する
        this.orderDonut.series[0].data.push(["", null]);
        this.orderDonut.title.text = this.orderTotal.toLocaleString();
        this.orderDonut.chart.height = "100px";
        this.orderDonut.title.y = 10;
        this.orderDonut.subtitle.y = -40;

        this.volDonut.series[0].data.push(["", null]);
        this.volDonut.title.text = this.volTotal.toLocaleString();
        this.volDonut.chart.height = "100px";
        this.volDonut.title.y = 10;
        this.volDonut.subtitle.y = -40;

        this.volsizeDonut.series[0].data.push(["", null]);
        this.volsizeDonut.title.text = this.volsizeTotal.toLocaleString();
        this.volsizeDonut.chart.height = "100px";
        this.volsizeDonut.title.y = 10;
        this.volsizeDonut.subtitle.y = -40;

        if (!this.unit_inch) {
          //単位：mの場合
          this.volsizeDonut.title.text = this.volsizeTotal.toLocaleString();
        } else {
          //単位：inの場合
          this.volsizeDonut.title.text = this.volsizeTotal.toLocaleString();
          this.volsizeDonut.subtitle.text =
            "<span style='position:absolute; top:47px; left:-10px; font-size:14px;'>kg</span>";
        }
        this.prodDonut.series[0].data.push(["", null]);
        this.prodDonut.title.text = this.prodTotal.toLocaleString();
      }
    }
  }
};
</script>
<style>
.donutchart .highcharts-data-label span {
  text-align: center;
}
</style>

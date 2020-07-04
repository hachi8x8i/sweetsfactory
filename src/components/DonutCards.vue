<template>
  <div>
    <v-row class="mx-2 mt-2 mb-0">
      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Order</v-toolbar-title>
          </v-toolbar>
          <highcharts v-if="Object.keys(viewdata).length > 0" :options="orderDonut" />
        </v-card>
      </v-col>

      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Volume</v-toolbar-title>
          </v-toolbar>
          <highcharts v-if="Object.keys(viewdata).length > 0" :options="volDonut" />
        </v-card>
      </v-col>

      <v-col class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Weight</v-toolbar-title>
          </v-toolbar>
          <highcharts v-if="Object.keys(viewdata).length > 0" :options="weightDonut" />
        </v-card>
      </v-col>
      <v-col v-if="productivity" class="pa-2" xl="3" lg="3" md="3" sm="6" cols="12">
        <v-card class="translucent" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Productivity</v-toolbar-title>
            <v-spacer />
          </v-toolbar>

          <highcharts v-if="Object.keys(viewdata).length > 0" :options="prodDonut" />
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
        Weight: {
          donut_data: {}
        },
        Productivity: {
          donut_data: {}
        }
      },

      //Setting for Highcharts
      orderDonut: {},
      volDonut: {},
      weightDonut: {},
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
      return this.orderDonut.series[0].data.reduce(function(a, x) {
        return a + x[1];
      }, 0);
    },
    volTotal: function() {
      return this.volDonut.series[0].data.reduce(function(a, x) {
        return a + x[1];
      }, 0);
    },
    weightTotal: function() {
      return this.weightDonut.series[0].data.reduce(function(a, x) {
        return a + x[1];
      }, 0);
    },
    prodTotal: function() {
      return this.prodDonut.series[0].data[0][1];
    },
    productivity: function() {
      return true;
    },
    isPound: function() {
      return this.$store.state.userdata.unitpound;
    }
  },

  watch: {
    viewdata: {
      handler: function(value) {
        if (Object.keys(value).length > 0) {
          this.createDonutData();
        }
      },
      immediate: true
    }
  },
  methods: {
    createDonutData() {
      /*viewdataはorder_idごとに分かれてるのでそれをセグメントごとに合計してchartOptionsに入れればいい
       */

      this.orderDonut = this.$_.cloneDeep(this.defaultOptions);
      this.volDonut = this.$_.cloneDeep(this.defaultOptions);
      this.weightDonut = this.$_.cloneDeep(this.defaultOptions);
      this.prodDonut = this.$_.cloneDeep(this.defaultOptions);

      let prodSum = 0;
      let orderSum = 0;

      Object.values(this.viewdata).forEach(el => {
        let orderdata = [];
        let volumedata = [];
        let weightdata = [];

        let volume = el.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue["prod_volume"]),
          0
        );
        let weight = el.reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue["weight"]),
          0
        );
        if (this.isPound) {
          weight = Math.round(weight / 454);
        }

        prodSum += el.reduce(
          (accumulator, currentValue) =>
            accumulator + parseFloat(currentValue["productivity"]),
          0
        );

        orderSum += el.length;

        orderdata.push(el[0].segment, el.length);
        volumedata.push(el[0].segment, volume);
        weightdata.push(el[0].segment, weight);
        this.orderDonut.series[0].data.push(orderdata);
        this.volDonut.series[0].data.push(volumedata);
        this.weightDonut.series[0].data.push(weightdata);
      });

      let productivity = Math.round((prodSum / orderSum) * 1000) / 10;
      this.prodDonut.series[0].data = [
        ["", productivity],
        ["", 100 - productivity]
      ];

      this.orderDonut.title.text = this.orderTotal.toLocaleString();
      this.orderDonut.subtitle.text =
        "<span style='position:absolute; top:47px; font-size:14px;'>orders</span>";

      this.volDonut.title.text = this.volTotal.toLocaleString();
      this.volDonut.subtitle.text =
        "<span style='position:absolute; top:47px; font-size:14px;'>packages</span>";

      this.weightDonut.title.text = this.weightTotal.toLocaleString();
      this.weightDonut.subtitle.text = this.isPound
        ? "<span style='position:absolute; top:47px; left:20px; font-size:14px;'>lb</span>"
        : "<span style='position:absolute; top:47px; left:20px; font-size:14px;'>g</span>";

      this.prodDonut.plotOptions.pie.colors = ["#4a71f4", "#d8d8d8"];
      this.prodDonut.plotOptions.pie.dataLabels.enabled = false;
      this.prodDonut.title.text = this.prodTotal.toLocaleString();
      this.prodDonut.subtitle.text =
        "<span style='position:absolute; top:47px; left:20px; font-size:14px;'>%</span>";
    }
  }
};
</script>
<style>
.donutchart .highcharts-data-label span {
  text-align: center;
}
</style>

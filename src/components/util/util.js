import Highcharts from "highcharts";

export default {
  methods: {
    setChartOptions: function(darktheme) {
      Highcharts.normaltheme = {
        xAxis: {
          labels: { style: { color: "#666666" } },
        },
        yAxis: {
          title: { style: { color: "#666666" } },
          labels: { style: { color: "#666666" } },
          stackLabels: { style: { color: "#666666" } },
        },
        title: { style: { color: "#000000" } },
        subtitle: { style: { color: "#000000" } },
        legend: {
          itemStyle: { color: "#333333" },
          itemHoverStyle: {
            color: "#333333",
          },
          navigation: { style: { color: "#333333" } },
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          pointFormat: "{series.name}:{point.y}",
          borderRadius: 10,
          style: {
            color: "#666666",
            fontFamily: "Roboto",
          },
        },
      };

      Highcharts.darktheme = {
        xAxis: {
          labels: { style: { color: "#ffffff" } },
        },
        yAxis: {
          title: { style: { color: "#ffffff" } },
          labels: { style: { color: "#ffffff" } },
          stackLabels: { style: { color: "#ffffff" } },
        },
        title: { style: { color: "#ffffff" } },
        subtitle: { style: { color: "#ffffff" } },
        legend: {
          itemStyle: {
            color: "#ffffff",
          },
          itemHoverStyle: { color: "#ffffff" },
          navigation: { style: { color: "#ffffff" } },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          pointFormat: "{series.name}:{point.y}",
          borderRadius: 10,
          style: {
            color: "#F0F0F0",
            fontFamily: "Roboto",
          },
        },
      };

      if (darktheme) {
        Highcharts.setOptions(Highcharts.darktheme);
      } else {
        Highcharts.setOptions(Highcharts.normaltheme);
      }
    },
  },
};

<template>
  <v-container class="pa-4" fluid>
    <v-row class="ma-0">
      <v-col class="pa-0" cols="12">
        <v-card class="translucent" tile flat color="grey lighten-2">
          <v-card-title class="black--text">Setting</v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col class="px-0 pb-4 pt-0" xl="12" lg="12" md="12" sm="12" cols="12">
        <v-card class="translucent" min-height="240px" tile>
          <v-toolbar dense class="transparent" flat>
            <v-toolbar-title>Display Setting</v-toolbar-title>
          </v-toolbar>
          <v-row class="px-4 py-0 ma-0">
            <v-col class="pa-0 px-4">
              <v-toolbar-title class="subtitle-1 font-weight-bold text-left"
                >Unit for Charts</v-toolbar-title
              >
              <v-radio-group v-model="graphunit" row class="mt-2 px-4">
                <v-radio label="Gram" value="g"></v-radio>
                <v-radio label="Pond" value="p"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="px-4 py-0 ma-0">
            <v-col class="pa-0 px-4">
              <v-toolbar-title class="subtitle-1 font-weight-bold text-left"
                >Display Mode</v-toolbar-title
              >
              <v-switch
                v-model="darkmode"
                class="mt-2 px-4"
                label="Dark Mode"
                color="yellow"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="ma-0"></v-row>
  </v-container>
</template>

<script>
import Highcharts from "highcharts";
import util from "../components/util/util.js";

export default {
  mixins: [util],
  data() {
    return {
      graphunit: this.$store.state.userdata.unitpound ? "p" : "g",
      unitIsPound: false,
      darkmode: this.$vuetify.theme.dark,
    };
  },
  watch: {
    graphunit: function() {
      this.unitIsPound = this.graphunit === "p" ? true : false;
      let setting = { unitpound: this.unitIsPound, darkmode: this.darkmode };
      this.commitSetting(setting);
    },
    darkmode: function() {
      if (this.darkmode) {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }
      let setting = { unitpound: this.unitIsGram, darkmode: this.darkmode };
      util.methods.setChartOptions(this.$vuetify.theme.dark);
      this.commitSetting(setting);
    },
  },
  methods: {
    commitSetting(setting) {
      this.$store.commit("setUserdata", setting);
    },
  },
};
</script>

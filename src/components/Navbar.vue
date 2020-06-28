<template>
  <v-app-bar app clipped-left color="blue-grey darken-1" dark>
    <v-btn icon class="d-lg-none" @click.stop="cl_sidebtn">
      <v-icon large>filter_list</v-icon>
    </v-btn>
    <!--v-app-bar-nav-icon  @click.stop="cl_sidebtn" class="d-lg-none"/-->
    <v-toolbar-items>
      <v-btn text to="/">
        <v-toolbar-title>
          <!--
          <v-img
            src="../../src/assets/title.png"
            width="250px"
            height="30px"
            aspect-ratio="10"
          />
          -->
        </v-toolbar-title>
      </v-btn>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <v-toolbar-items class="d-none d-md-flex">
      <v-btn text rounded to="/" class="text-center">Production</v-btn>
      <v-btn text to="/byplant">By Plant</v-btn>
      <v-btn text to="/compare">Setting</v-btn>
    </v-toolbar-items>
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-app-bar-nav-icon class="d-md-none" v-on="on" />
      </template>
      <v-list class="text-center">
        <v-list-item to="/">
          <v-list-item-content>
            <v-list-item-title>PRODUCTION</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/byplant">
          <v-list-item-content>
            <v-list-item-title>BY PLANT</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/user">
          <v-list-item-title>SETTING</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  name: "Navber",
  computed: {
    isopen: function() {
      return this.$store.getters["drawer_flg/isopen"];
    }
  },
  methods: {
    cl_sidebtn(event) {
      this.$store.dispatch("drawer_flg/setIsopen", !this.isopen);
    }
  }
};
</script>

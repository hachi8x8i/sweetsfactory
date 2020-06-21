import Vue from "vue";
import Vuetify from "vuetify/lib";
import "material-design-icons-iconfont";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        bland_light: "#82a0aa",
        bland_dark: "#3c5d69",
        bland_black: "#3c5d69",
        bland_red: "#e31f26"
      }
    },
    dark: false
  },
  icons: {
    iconfont: "md" // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
  }
});

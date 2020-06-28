import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    filterdata: {
      selectcustomer: [],
      selectplant: [],
      from: null,
      to: null,
      selectorderno: "",
      selectalarm_type: [],
      selectsegment: [],
    },
    firstdata: [],
    byplantdata: [],
  },
  mutations: {
    setFilterdata(state, filterdata) {
      state.filterdata = filterdata;
    },
    setFirstdata(state, value) {
      state.firstdata = value;
    },
    setByplantdata(state, value) {
      state.byplantdata = value;
    },
  },
  actions: {
    setFilterdata({ commit }, filterdata) {
      commit("setFilterdata", filterdata);
    },
    setFirstdata({ commit }, firstdata) {
      commit("setFirstdata", firstdata);
    },
    setByplantdata({ commit }, byplantdata) {
      commit("setByplantdata", byplantdata);
    },
  },
});

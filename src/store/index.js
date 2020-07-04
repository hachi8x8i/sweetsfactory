import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    filterdata: {
      selectcustomer: [],
      selectplant: [],
      from: null,
      to: null,
      selectorderno: "",
      selectsegment: [],
    },
    firstdata: [],
    byplantdata: [],
    userdata: { unitpound: false, darkmode: false },
  },
  mutations: {
    setFilterdata(state, value) {
      state.filterdata = value;
    },
    setFirstdata(state, value) {
      state.firstdata = value;
    },
    setByplantdata(state, value) {
      state.byplantdata = value;
    },
    setUserdata(state, value) {
      state.userdata = value;
    },
  },
  actions: {
    setFirstdata({ commit }, firstdata) {
      commit("setFirstdata", firstdata);
    },
    setByplantdata({ commit }, byplantdata) {
      commit("setByplantdata", byplantdata);
    },
  },
  plugins: [
    createPersistedState({
      key: "FilterData",
      paths: ["filterdata"],
      storage: window.localStorage,
    }),
    createPersistedState({
      key: "Userdata",
      paths: ["userdata"],
      storage: window.localStorage,
    }),
  ],
});

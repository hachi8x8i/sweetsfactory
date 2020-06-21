import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

/*

const filter = {
  namespaced: true,
  state: {
    filterData: {
      selectregion: [],
      selectcustomer: [],
      selectplant: [],
      selectplantid: [],
      from: null,
      to: null,
      selectorderid: "",
      selectorderno: "",
      selectalarm_type: [],
      selectcomponent_note: [],
      selectmeasurement: [],
      selectsegment: []
    }
  },
  mutations: {
    setFilterData(state, filterData) {
      state.filterData = filterData;
    }
  },
  actions: {
    setFilter({ commit }, filterData) {
      commit("setFilterData", filterData);
    }
  }
};
const initial_data = {
  namespaced: true,
  state: {
    firstdata: [],
    firstprodhist: [],
    alarms: [],
    comparedata: [],
    errorseries: []
  },
  mutations: {
    setFirstdata(state, value) {
      state.firstdata = value;
    },
    setFirstprodhist(state, value) {
      state.firstprodhist = value;
    },
    setAlarms(state, value) {
      state.alarms = value;
    },
    setComparedata(state, value) {
      state.comparedata = value;
    },
    setErrorseries(state, value) {
      state.errorseries = value;
    }
  },
  actions: {
    setFirstdata({ commit }, value) {
      commit("setFirstdata", value);
    },
    setFirstprodhist({ commit }, value) {
      commit("setFirstprodhist", value);
    },
    setAlarms({ commit }, value) {
      commit("setAlarms", value);
    },
    setComparedata({ commit }, value) {
      commit("setComparedata", value);
    },
    setErrorseries({ commit }, value) {
      commit("setErrorseries", value);
    }
  }
};

const version = {
  namespaced: true,
  state: {
    packageVersion: process.env.PACKAGE_VERSION || "0"
  },
};
*/

export default new Vuex.Store({
  state: {
    filterdata: {
      selectregion: [],
      selectcustomer: [],
      selectplant: [],
      selectplantid: [],
      from: null,
      to: null,
      selectorderid: "",
      selectorderno: "",
      selectalarm_type: [],
      selectcomponent_note: [],
      selectmeasurement: [],
      selectsegment: []
    }, firstdata: []
  },
  mutations: {
    setFilterdata(state, filterdata) {
      state.filterdata = filterdata;
    },
    setFirstdata(state, value) {
      state.firstdata = value;
    },
  },
  actions: {
    setFilterdata({ commit }, filterdata) {
      commit("setFilterdata", filterdata);
    },
    setFirstdata({ commit }, firstdata) {
      commit("setFirstdata", firstdata);
    },
  }
});

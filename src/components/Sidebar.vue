<template>
  <v-navigation-drawer app mobile-breakpoint="1264">
    <v-row class="mx-3 my-3 title">Filters</v-row>
    <v-divider />
    <v-list>
      <v-list-item>
        <v-list-item-content class="py-0">
          <v-menu
            v-model="from_menu"
            :close-on-content-c\lick="true"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field v-model="from_date" label="From" readonly v-on="on"></v-text-field>
              <v-icon
                style="position:absolute; right:50px; top:20px;"
                @click="clearDate('from')"
              >cancel</v-icon>
              <v-icon
                style="position:absolute; right:20px; top:20px; z-index:-1;"
              >mdi-calendar-today</v-icon>
            </template>
            <v-date-picker
              v-model="from_date"
              no-title
              @input="from_menu = false"
              @change="edit_filter()"
            ></v-date-picker>
          </v-menu>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="py-0">
          <v-menu
            v-model="to_menu"
            :close-on-content-click="true"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field v-model="to_date" label="To" readonly v-on="on"></v-text-field>
              <v-icon
                style="position:absolute; right:50px; top:20px;"
                @click="clearDate('to')"
              >cancel</v-icon>
              <v-icon
                style="position:absolute; right:20px; top:20px; z-index:-1;"
              >mdi-calendar-today</v-icon>
            </template>
            <v-date-picker
              v-model="to_date"
              no-title
              @input="to_menu = false"
              @change="edit_filter()"
            ></v-date-picker>
          </v-menu>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="py-0">
          <v-select
            v-model="selectplant"
            :items="plants"
            label="Plant"
            multiple
            chips
            @change="edit_filter('plant')"
          ></v-select>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content class="py-0">
          <v-select
            v-model="selectsegment"
            :items="segments"
            label="Product"
            append-outer-icon="_"
            multiple
            chips
            @change="edit_filter('plant')"
          ></v-select>

          <v-tooltip bottom button>
            <template v-slot:activator="{ on }">
              <v-btn style="position:absolute; right:11px; top:14px" icon v-on="on">
                <v-icon>help</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="this.$route.path === '/'">
        <v-list-item-content class="py-0">
          <v-text-field v-model="selectorderno" label="Order NO" @change="edit_filter('plant')"></v-text-field>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="this.$route.path === '/condition'">
        <v-list-item-content class="py-0">
          <v-select
            v-model="selectalarm_type"
            :items="alarm_types"
            label="Alarm Type"
            multiple
            chips
            @change="edit_filter('alarm')"
          ></v-select>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "Sidebar",
  data() {
    return {
      from_menu: "",
      to_menu: "",
      to_date: "",
      from_date: "",
      customers: [], //選択可能顧客
      selectcustomer: [], //選択した顧客
      plants: [], //選択可能プラント
      selectplant: [], //選択したプラント
      segments: [], //選択可能プラント
      selectsegment: [], //選択したプラント
      selectorderno: "", //入力したオーダーNO
      alarm_types: [], //選択可能プラント
      selectalarm_type: [], //選択したプラント
      component_notes: [], //選択可能プラント
      selectcomponent_note: [] //選択したプラント
    };
  },
  computed: {
    //cumputedの中ではアロー関数つかうとthisが見えないからダメ
    limit_proddata: function() {
      return 70000;
    },
    limit_alarmdata: function() {
      return 7000;
    },
    limit_firstdata: function() {
      return 5000;
    },
    stateFilterData: function() {
      return this.$store.state.filterdata;
    },
    firstdata: function() {
      return this.$store.state.firstdata;
    }
  },
  async created() {
    this.convertData();

    //state割り当て
    this.selectcustomer = this.stateFilterData.selectcustomer;
    this.selectplant = this.stateFilterData.selectplant;
    this.to_date = this.stateFilterData.to;
    this.from_date = this.stateFilterData.from;
    this.selectorderno = this.stateFilterData.selectorderno;
    this.selectalarm_type = this.stateFilterData.selectalarm_type;
    this.selectsegment = this.stateFilterData.selectsegment;

    this.getByplantData();
    this.getFirstData();
  },

  methods: {
    /**
     * 画面起動時に必要なデータを取る
     */
    async getFirstData() {
      let firstdata_ary = [];
      let i = 0;

      //★データ取れなかった場合のエラー処理は？？
      while (true) {
        let queries = {
          limit: this.limit_firstdata,
          offset: this.limit_firstdata * i
        };
        let tmpdata = [];

        await this.$axios
          .get("../api/orders", {
            params: queries
          })
          .then(response => {
            tmpdata = response.data;
          });
        if (tmpdata.length) {
          firstdata_ary = firstdata_ary.concat(tmpdata);
        } else {
          break;
        }
        i++;
      }

      this.$store.dispatch("setFirstdata", firstdata_ary);

      this.edit_filter();
    },
    /**
     * 画面起動時に必要なデータを取る
     * 比較画面要
     */
    async getByplantData() {
      await this.$axios.get("../api/byplant", {}).then(response => {
        this.$store.dispatch("setByplantdata", response.data);
      });
    },
    /**
     * フィルタ変更時のメソッド
     */
    edit_filter(type) {
      if (type !== "customer" && type !== "plant" && type !== "alarm") {
        if (type !== "plant" && type !== "alarm") {
          this.create_plants();
        }
      }
      if (type !== "alarm") {
        this.create_segments();
      }

      this.$store.dispatch("setFilterdata", {
        selectplant: this.selectplant,
        from: this.from_date,
        to: this.to_date,
        selectorderno: this.selectorderno,
        selectsegment: this.selectsegment
      });
    },
    /**
     * プラントの選択肢をつくるメソッド
     */
    create_plants() {
      const func_filter = item => {
        return (
          (!this.to_date ||
            new Date(item.prod_start_time_local) < new Date(this.to_date)) &&
          (!this.from_date ||
            new Date(item.prod_start_time_local) > new Date(this.from_date))
        );
      };

      let filterddata = this.firstdata.filter(func_filter);
      let pl_array = filterddata.map(obj => obj.city_plant_no);
      this.plants = pl_array.filter(
        (item, index, self) => self.indexOf(item) === index
      );
      this.selectplant = this.selectplant.filter(
        item => this.plants.indexOf(item) >= 0
      );
    },
    /**
     * segumentの選択肢をつくるメソッド
     */
    create_segments() {
      const func_filter = item => {
        return (
          (this.selectplant.length == 0 ||
            this.selectplant.indexOf(item.city_plant_no) >= 0) &&
          (!this.to_date ||
            new Date(item.prod_start_time_local) < new Date(this.to_date)) &&
          (!this.from_date ||
            new Date(item.prod_start_time_local) > new Date(this.from_date))
        );
      };

      let filterddata = this.firstdata.filter(func_filter);
      let pl_array = filterddata.map(obj => obj.segment);
      this.segments = pl_array
        .filter((item, index, self) => self.indexOf(item) === index)
        .sort();
      this.selectsegment = this.selectsegment.filter(
        item => this.segments.indexOf(item) >= 0
      );
    },
    /**
     * アラームタイプの選択肢をつくるメソッド
     */
    create_alarmtypes() {
      const func_filter = item => {
        return (
          (this.selectcustomer.length == 0 ||
            this.selectcustomer.indexOf(item.customer) >= 0) &&
          (this.selectplant.length == 0 ||
            this.selectplant.indexOf(item.city_plant_no) >= 0) &&
          (!this.to_date ||
            new Date(item.alarm_start_time_local) < new Date(this.to_date)) &&
          (!this.from_date ||
            new Date(item.alarm_start_time_local) > new Date(this.from_date))
        );
      };

      let filterddata = this.alarms.filter(func_filter);
      let pl_array = filterddata.map(obj => obj.alarm_type);
      this.alarm_types = pl_array.filter(
        (item, index, self) => self.indexOf(item) === index
      );
      this.selectalarm_type = this.selectalarm_type.filter(
        item => this.alarm_types.indexOf(item) >= 0
      );
    },
    /**
     * フィルタの日付を初期化するメソッド
     */
    clearDate(type) {
      if (type === "from") {
        this.from_date = "";
      } else {
        this.to_date = "";
      }
      this.edit_filter();
    },
    convertData() {
      let orders = require("../../srv/orders.json");

      orders.map((order, index) => {
        delete order.order_id;
        delete order.customer;
        delete order.region;
        delete order.sheetsize_length_mm;
        delete order.sheetsize_width_mm;
        delete order.box_size_mm;
        delete order.bundle;
        delete order.actual_prod_speed;
        delete order.loss_rate;
        delete order.loss_volume;
        delete order.nominal_prod_speed;
        delete order.rcmd_speed;
        delete order.supplied_volume;

        order.weight = order.prod_volume_size;
        delete order.prod_volume_size;

        if (order.city_plant_no === "Aston(P2353)") {
          order.city_plant_no = "Charlie";
        } else if (order.city_plant_no === "Lancaster(P2368)") {
          order.city_plant_no = "Grey";
        } else if (order.city_plant_no === "JNB#3(PE0923)") {
          order.city_plant_no = "Hevin";
        } else if (order.city_plant_no === "CPT#1(PE0901)") {
          order.city_plant_no = "Zacconi";
        } else if (order.city_plant_no === "CPT#2(PE0911)") {
          order.city_plant_no = "Shima";
        } else {
          order.city_plant_no = "delete";
        }

        if (order.segment === "A") {
          order.segment = "Candy";
        } else if (order.segment === "B") {
          order.segment = "Chocolate";
        } else if (order.segment === "C") {
          order.segment = "Cookie";
        } else if (order.segment === "D") {
          order.segment = "Gum";
        }
      });
      orders = orders.filter(order => order.city_plant_no !== "delete");

      orders.map((order, index) => {
        order.order_no = (5000 + index).toString();
      });

      console.log(JSON.stringify(orders));

      /*--------------- aggvol from here--------------*/
      let aggvol = require("../../srv/aggvolPrev.json");

      aggvol.map((el, index) => {
        delete el.region;
        delete el.customer;
        el.weight = el.vxs;
        delete el.vxs;

        if (el.city_plant_no === "Aston(P2353)") {
          el.city_plant_no = "Charlie";
        } else if (el.city_plant_no === "Lancaster(P2368)") {
          el.city_plant_no = "Grey";
        } else if (el.city_plant_no === "JNB#3(PE0923)") {
          el.city_plant_no = "Hevin";
        } else if (el.city_plant_no === "CPT#1(PE0901)") {
          el.city_plant_no = "Zacconi";
        } else if (el.city_plant_no === "CPT#2(PE0911)") {
          el.city_plant_no = "Shima";
        } else {
          el.city_plant_no = "delete";
        }
      });
      aggvol = aggvol.filter(el => el.city_plant_no !== "delete");

      console.log(JSON.stringify(aggvol));
    }
  }
};
</script>

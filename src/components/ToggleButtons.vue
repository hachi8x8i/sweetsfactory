<template>
  <div v-if="darkmode">
    <v-col class="pa-0">
      <v-btn
        v-for="button in buttons"
        :key="button"
        :class="['toggle-button-dark', { active: currentButton === button }]"
        small
        rounded
        depressed
        class="mr-3"
        @click="selectButton(button)"
      >
        {{ button }}
      </v-btn>
    </v-col>
  </div>
  <div v-else>
    <v-col class="pa-0">
      <v-btn
        v-for="button in buttons"
        :key="button"
        :class="['toggle-button', { active: currentButton === button }]"
        small
        rounded
        depressed
        class="mr-3"
        @click="selectButton(button)"
      >
        {{ button }}
      </v-btn>
    </v-col>
  </div>
</template>

<script>
export default {
  props: {
    contents: {
      type: Array,
      default: function() {
        return "";
      }
    },
    default: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      currentButton: this.default
    };
  },
  computed: {
    productivity: function() {
      return true;
    },
    darkmode: function() {
      return this.$vuetify.theme.dark;
    },
    buttons: function() {
      return this.contents;
    }
  },
  methods: {
    selectButton(button) {
      this.currentButton = button;
      this.$emit("select-button", this.currentButton);
    }
  }
};
</script>
<style scoped>
.toggle-button {
  background: #f0f0f0;
  color: black !important;
}
.toggle-button.active {
  background: #cfd8dc !important;
  color: black !important;
}
.toggle-button-dark {
  background: #666666 !important;
  color: black !important;
}
.toggle-button-dark.active {
  background: white !important;
  color: black !important;
}
</style>

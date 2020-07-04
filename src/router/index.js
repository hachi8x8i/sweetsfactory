import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home";
import ByPlant from "../views/ByPlant";
import Setting from "../views/Setting";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/byplant",
    name: "ByPlant",
    component: ByPlant,
  },
  {
    path: "/setting",
    name: "Setting",
    component: Setting,
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;

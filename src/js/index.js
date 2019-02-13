import $ from "jquery";
import popper from "popper.js";
import bootstrap from "bootstrap";

import Vue from 'vue';
import App from '../components/App.vue';

new Vue({
  el: '#app',
  render: h => h(App)
});

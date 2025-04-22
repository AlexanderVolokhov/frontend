import Vue from "vue"
import App from "./App"
import VModal from "vue-js-modal"

import {BootstrapVue, IconsPlugin} from "bootstrap-vue"
import router from "./router"
import moment from "moment"
import "./assets/custom.scss"

Vue.config.productionTip = false
Vue.config.devtools = process.env.VUE_APP_DEVTOOLS
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VModal, {dialog: true})
Vue.prototype.$moment = moment

import store from "./store"


/* eslint-disable no-new */
new Vue({
    el: "#app",
    router,
    components: {App},
    template: "<App/>",
    store: store
})

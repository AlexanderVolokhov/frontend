import Vuex from "vuex"
import Vue from "vue"

import report from "./modules/report/store"

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        report
    },
    state: {
        selectedEmailType: "campaign",
        reportFilter: undefined
    },
    mutations: {
        selectEmailType(state, type) {
            state.selectedEmailType = type
        },
        setReportFilter(state, filter) {
            state.reportFilter = filter
        }
    }
})

export default store
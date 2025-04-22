import PromiseWorker from "promise-worker"

import Worker from "worker-loader!./worker.js"

const worker = new Worker()
const promiseWorker = new PromiseWorker(worker)

const sendProcessReport = payload => promiseWorker.postMessage({ type: "processReport", payload: payload })

const REPORT_MUTATION = "setReport"
const LOADING_MUTATION = "setLoading"
const ERROR_MUTATION = "setError"
const CLEAR_REPORT = "clearReport"

const state = () => ({
    reportName: null,
    reportType: null,
    loading: false,
    error: null,
    emails: [],
    locales: [],
    products: [],
})

const mutations = {
    [REPORT_MUTATION](state, report) {
        state.reportName = report.reportName
        state.reportType = report.reportType,
        state.emails = report.emails
        state.locales = report.locales
        state.products = report.products
    },

    [CLEAR_REPORT](state) {
        state.reportName = "Loading"
        state.reportType = null
        state.emails = []
        state.locales = []
        state.products = []
    },

    [LOADING_MUTATION](state, loading) {
        state.loading = loading
    },

    [ERROR_MUTATION](state, error) {
        state.error = error
    }
}

const actions = {
    async loadReport({commit}, payload) {
        commit(LOADING_MUTATION, true)
        commit(CLEAR_REPORT)
        try {
            const report = await sendProcessReport(payload)
            if (Object.prototype.hasOwnProperty.call(report, "error")) {
                commit(ERROR_MUTATION, report.error)
                return report.error
            } else {
                commit(REPORT_MUTATION, report)
            }
        } catch (error) {
            commit(ERROR_MUTATION, error)
            return error
        } finally {
            commit(LOADING_MUTATION, false)
        }
    }
}

const getters = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
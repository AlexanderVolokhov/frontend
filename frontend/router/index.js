import Vue from "vue"
import axios from "axios"
import VueAxios from "vue-axios"
import Router from "vue-router"

import NotFound from "@/components/NotFound"
import ReportListComponent from "@/components/ReportListComponent"
import ReportView from "@/components/v2/ReportView"
import AuthExpiredPage from "@/components/AuthExpiredPage"
import GmailErrorPage from "@/components/GmailErrorPage"
import ReportViewComponent from "@/components/v1/ReportViewComponent"
import DocsC4modelPage from "@/components/DocsC4modelPage"

Vue.use(Router)
Vue.use(VueAxios, axios)
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL

export default new Router({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "Mailchecker",
            component: ReportListComponent
        },
        {
            path: "/report/:reportType/:report(.*)",
            name: "ReportView",
            component: ReportView
        },
        {
            path: "/v1/report/:reportType/:report",
            redirect: "/v1/report/:reportType/:report/cart-links",
        },
        {
            path: "/v1/report/:reportType/:report/:tab",
            name: "ReportViewV1",
            component: ReportViewComponent
        },
        {
            path: "/gmail_error/:code(.*)",
            name: "GmailError",
            component: GmailErrorPage
        },
        {
            path:"/auth_expired",
            name: "AuthExpired",
            component: AuthExpiredPage
        },
        {
            path:"/tech-docs",
            name: "DocsC4model",
            component: DocsC4modelPage
        },
        {
            path: "*",
            component: NotFound
        }
    ]
})

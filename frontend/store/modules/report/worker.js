import registerPromiseWorker from "promise-worker/register"
import axios from "axios"
import Lazy from "lazy.js"
import { getReport } from "../../../helpers/api"

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL

async function processReport({ reportType, reportName }) {
    let result
    try {
        result = await getReport(axios, reportType, reportName)
    } catch (error) {
        return { error: `Failed to fetch report from backend: ${error}`}
    }

    if (result.status !== 200) {
        return { error: `Failed to fetch report from backend, status code was ${result.status}.` }
    }

    const emails = result.data.campaigns.test.emails
    const locales = Lazy(emails)
        .map(email => email.locale.value)
        .filter(locale => typeof(locale) === "string")
        .uniq()
        .sort()
        .toArray()
    const products = Lazy(emails)
        .map(email => email.cart_links)
        .flatten()
        .map(link => link.product.value)
        .filter(product => typeof(product) === "string")
        .uniq()
        .toArray()

    return {
        reportName: reportName,
        reportType: reportType,
        emails: emails,
        locales: locales,
        products: products
    }
}


registerPromiseWorker(message => {
    if (message.type === "processReport") {
        return processReport(message.payload)
    }
})


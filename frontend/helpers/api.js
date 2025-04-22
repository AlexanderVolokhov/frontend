const devUrl = "http://localhost:3000"

export function createReport(axios, reportType, reportName, body) {
    return axios.post(`/api/report/${reportType}/${reportName}`, body)
}

export function getReport(axios, reportType, reportName, reportId) {
    if (reportId === undefined) {
        return axios.get(`/api/report/${reportType}/${reportName}`)
    } else {
        return axios.get(`/api/report/${reportType}/${reportName}?reportId=${reportId}`)
    }
}

export function deleteReport(axios, reportType, reportName) {
    return axios.delete(`/api/report/${reportType}/${reportName}`)
}

export function deleteReports(axios, reportType, reportNames) {
    return axios.delete(`/api/report/${reportType}`, { data: reportNames })
}

export function cancelParsing(axios, reportType, reportName) {
    return axios.post(`/api/report/cancel/${reportType}/${reportName}`)
}

export function listReports(axios, reportType, page, count, filter) {
    let url = `/api/report/list?report_type=${reportType}&page=${page}&count=${count}`
    if (filter) {
        url = `${url}&filter=${filter}`
    }
    return axios.get(url)
}

export function isParsed(axios, reportType, reportName) {
    return axios.head(`/api/report/${reportType}/${reportName}`)
}


export function listLabels(axios, reportType) {
    return axios.get(`/api/gmail/list-labels?filter_type=${reportType}`)
}

export function getLabelDetails(axios, labelId) {
    return axios.get(`/api/gmail/label-details/${labelId}`)
}


export function emailPreviewUrl(reportType, reportName, emailId) {
    const path = `/api/email/preview/${reportType}/${reportName}/${emailId}`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

export function downloadScreenshotsUrl(reportType, reportName) {
    const path = `/api/email/screenshots/${reportType}/${reportName}`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

export function screenshotUrl(reportType, reportName, emailId) {
    const path = `/api/email/screenshot/${reportType}/${reportName}/${emailId}/default`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

export function cartSnapshotUrl(reportType, reportName, emailId, linkId) {
    const path = `/api/email/cart-snapshot/${reportType}/${reportName}/${emailId}/${linkId}`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

export function reportJsonUrl(reportType, reportName) {
    const path = `/api/report/${reportType}/${reportName}`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

/**
 *
 * @param reportName is reportName, the name of the report
 * @param reportTimestamp is an unix-formating report timestamp
 * @returns url to google logs
 */
export function logsUrl(reportName, reportTimestamp) {
    /** the Mailchecker environment */
    const env = process.env.NODE_ENV === "production" ? "prod" : "stage"
    const generalURL = "https://console.cloud.google.com/logs/query"
    const projectId = "ppp-cloudt-luft-int-ab"

    /* Building data query values */
    /** Default static part is just to make the query run faster. */
    const defaultPart = "resource.type=\"k8s_container\"\n" +
                        "resource.labels.location=\"europe-west1\"\n" +
                        "resource.labels.cluster_name=\"luft-int-euw1a-prod\"\n" +
                        "resource.labels.namespace_name=\"sales-ops-qa\"\n"

    const containerNamePart = `resource.labels.container_name="mailchecker-worker-${env}"\n`
    const projectIdPart = `resource.labels.project_id="${projectId}"\n`
    const reportNamePart = `labels.report_name="${reportName}"\n`
    const encodedQueryValue = encodeURIComponent(
        defaultPart + containerNamePart + projectIdPart + reportNamePart
    )

    /*
     * Building timestamp query value\
     * Note: The reportTimestamp will always be URL safe,
     *       so there's no need to url-encode it at all.
     */
    const moment = require("moment")
    const startTimestampValue = moment.unix(reportTimestamp).toISOString()

    return `${generalURL};query=${encodedQueryValue};startTime=${startTimestampValue}?project=${projectId}`
}

export function exportLinksUrl(reportType, reportName) {
    const path = `/api/report/links/${reportType}/${reportName}`
    return ["production", "stage"].includes(process.env.NODE_ENV) ? path : `${devUrl}/${path}`
}

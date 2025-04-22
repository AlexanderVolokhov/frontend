<template>
  <div>
    <b-table
      ref="reportsTable"
      striped
      hover
      class="reports-table"
      :items="reports"
      :fields="fields"
      :busy="tableBusy"
      head-variant="dark"
      @row-dblclicked="openReport"
    >
      <template #table-busy>
        <div class="text-center text-danger my-2">
          <b-spinner class="align-middle" />
          <strong>&nbsp;Loading...</strong>
        </div>
      </template>

      <template #head(select)>
        <b-form-checkbox
          v-if="showCheckboxes"
          v-model="selectAll"
          aria-label="Select All"
          @change="toggleSelectAll"
        />
      </template>

      <template #cell(select)="data">
        <b-form-checkbox
          v-if="showCheckboxes"
          v-model="selectedRows"
          :value="data.item.name"
          aria-label="Select Row"
        />
      </template>

      <template #cell(report_name)="row">
        {{ row.item.report_name }}
      </template>

      <template #cell(status)="row">
        <span v-if="row.item.status==='CREATED'">
          <b-icon
            icon="x-collection-fill"
          />
          Queued for processing
        </span>
        <span v-else-if="row.item.status==='STARTED'">
          Parsing emails ...
          <b-progress
            height="1.5rem"
            striped
            animated
            variant="primary"
          >
            <b-progress-bar
              :label="getProgressLabel(row.item.finished,row.item.total)"
              :value="row.item.finished"
              :max="row.item.total"
            />
          </b-progress>
        </span>
        <span v-else-if="row.item.status==='FAILED'">
          <b-icon
            icon="x-circle-fill"
            variant="danger"
          />
          Parsing emails failed:  {{ row.item.reason }}
        </span>
        <span v-else-if="row.item.status === 'SUCCESS'">
          <span v-if="row.item.errors > 0">
            <b-icon
              icon="x-circle-fill"
              variant="danger"
            />&nbsp;{{ row.item.errors }}
          </span>
          <span v-if="row.item.warnings > 0">
            <b-icon
              icon="exclamation-triangle-fill"
              variant="warning"
            />&nbsp;{{ row.item.warnings }}
          </span>
          <span v-if="row.item.errors === 0 && row.item.warnings === 0">
            <b-icon
              icon="check-circle-fill"
              variant="success"
            />
          </span>
        </span>
      </template>

      <template #cell(archived_reports)="row">
        <span v-if="row.item.archived_reports !== null && row.item.archived_reports.length > 0">
          <b-badge
            v-b-tooltip.hover
            variant="info"
            title="Contains archived reports"
          >
            {{ row.item.archived_reports.length }}
          </b-badge>
        </span>
      </template>

      <template #cell(ts_started)="row">
        <span v-if="row.item.ts_started !== null">
          {{ $moment.unix(row.item.ts_started).format("YYYY-MM-DD HH:mm:ss z") }}
        </span>
      </template>

      <template #cell(actions)="row">
        <template v-if="row.item.status==='SUCCESS'">
          <b-link
            class="btn btn-outline-primary"
            :to="openReportUrl(row.item)"
            title="View report"
          >
            <b-icon
              v-b-tooltip.hover
              icon="file-ruled"
              aria-label="View report"
            />
          </b-link>
        </template>
                &nbsp;
        <template v-if="row.item.status==='SUCCESS' || row.item.status==='FAILED'">
          <b-link
            class="btn btn-outline-info"
            :href="logsUrl(row.item.name, row.item.ts_started)"
            title="Download logs"
          >
            <b-icon
              v-b-tooltip.hover
              icon="bug"
              aria-label="Download logs"
            />
          </b-link>
        </template>
                &nbsp;
        <template v-if="row.item.status==='SUCCESS' || row.item.status==='FAILED'">
          <b-button
            variant="outline-danger"
            title="Delete report"
            @click="deleteReport(row.item.name)"
          >
            <b-icon
              v-b-tooltip.hover
              icon="trash"
              aria-label="Delete report"
            />
          </b-button>
        </template>
        <template v-if="row.item.status==='STARTED' || row.item.status==='CREATED'">
          <b-button
            variant="outline-danger"
            @click="cancelParsing((row.item.name))"
          >
            <b-icon
              v-b-tooltip.hover
              icon="x-circle"
              aria-label="Cancel"
              title="Cancel parsing"
            />
          </b-button>
        </template>
      </template>
    </b-table>
    <b-pagination-nav
      :number-of-pages="Math.max(Math.ceil(totalReports/perPage), 1)"
      :value="$route.query.page || 1"
      :link-gen="linkGen"
      align="right"
    />
  </div>
</template>

<script>
import {
    cancelParsing as apiCancelParsing,
    deleteReport as apiDeleteReport,
    listReports,
    logsUrl
} from "../helpers/api.js"
export default {
    name: "ReportsTable",
    props: {
        reportType: {
            type: String,
            required: true
        },
        reportFilter: {
            type: String,
            default: undefined
        }
    },
    data() {
        return {
            showCheckboxes: false,
            selectAll: false,
            selectedRows: [],
            tableBusy: false,
            refreshTimer: "",
            reports: [],
            perPage: 10,
            totalReports: 0,
            currentPage: 1
        }
    },
    computed: {
        fields() {
            let baseFields = [
                { key: "name", label: "Report" },
                { key: "status", label: "Status", tdClass: "status-cell" },
                { key: "archived_reports", label: "" },
                { key: "ts_started", label: "Created" },
                { key: "actions", class: "col-actions" }
            ]

            if (this.showCheckboxes) {
                baseFields.unshift({
                    key: "select",
                    label: "",
                    sortable: false,
                    headerTitle: "Select All"
                })
            }

            return baseFields
        }
    },
    watch: {
        reportType() {
            this.refreshTable(true)
        },
        reportFilter() {
            this.refreshTable(true)
        },
        $route(to) {
            if (to.query.page !== this.currentPage) {
                this.currentPage = to.query.page
                this.refreshTable(true)
            }
        },
        selectedRows(newValue) {
            if (newValue.length === this.reports.length) {
                this.selectAll = true
            } else {
                this.selectAll = false
            }
        }
    },
    created() {
        this.refreshTable(true)
        this.refreshTimer = setInterval(() => { this.refreshTable(false) }, 5000)
    },
    beforeDestroy() {
        clearInterval(this.refreshTimer)
    },
    methods: {
        ...{ logsUrl },
        linkGen (pageNumber) {
            return { query:{ ...this.$route.query, page: pageNumber } }
        },
        getProgressLabel(finished, total) {
            if (finished === 0 && total === 0) {
                return "Starting..."
            } else {
                return `${ Math.round((finished / total) * 100, 0) }%`
            }
        },
        async loadReports() {
            try {
                const response = await listReports(this.axios, this.reportType, this.currentPage || 1, this.perPage, this.reportFilter)
                this.totalReports = response.data.total
                this.reports = response.data.reports
            } catch (error) {
                this.$bvToast.toast(`Failed to load reports from the server. Server has replied: ${error}`, {
                    title: "Failed to load reports",
                    variant: "danger",
                    solid: true
                })
                this.reports = []
            }
        },
        deleteReport(reportName) {
            this.$modal.show("dialog", {
                title: "Delete Report",
                text: `Do you really want to delete report <em>${reportName}</em>?`,
                buttons: [
                    {
                        title: "Yes",
                        handler: () => {
                            apiDeleteReport(this.axios, this.reportType, reportName).then(() => {
                                this.$bvToast.toast(`Report ${reportName} has been successfully deleted`, {
                                    title: "Report deleted",
                                    variant: "success",
                                    solid: true
                                })
                                this.refreshTable(true)
                            }).catch(err => {
                                this.$$bvToast.toast(`Failed to delete report ${reportName}. Server has replied: ${err}`, {
                                    title: "Failed to delete report",
                                    variant: "danger",
                                    solid: true
                                })
                            })
                            this.$modal.hide("dialog")
                        }
                    },
                    {
                        title: "Cancel",
                        handler: () => {
                            this.$modal.hide("dialog")
                        }
                    }
                ]
            })
        },
        async refreshTable(showBusy) {
            this.tableBusy = showBusy
            await this.loadReports()
            this.tableBusy = false
        },
        cancelParsing(reportName) {
            apiCancelParsing(this.axios, this.reportType, reportName).then(() => {
                this.$bvToast.toast(`Report ${reportName} has been successfully cancelled`, {
                    title: "Report cancelled",
                    variant: "success",
                    solid: true
                })
                this.refreshTable(true)
            }).catch(err => {
                this.$bvToast.toast(`Failed to cancel report ${reportName}. Server has replied: ${err}`, {
                    title: "Failed to cancel report",
                    variant: "danger",
                    solid: true
                })
            })
        },
        openReport(report) {
            this.$router.push(this.openReportUrl(report))
        },
        openReportUrl(report) {
            return `/v1/report/${this.reportType}/${report.name}`
        },
        toggleCheckboxesVisibility() {
            this.showCheckboxes = !this.showCheckboxes
            if (!this.showCheckboxes) {
                this.clearCheckboxes()
            }
        },
        clearCheckboxes() {
            this.selectAll = false
            this.selectedRows = []
        },
        toggleSelectAll(value) {
            if (value) {
                this.selectedRows = this.reports.map(report => report.name)
            } else {
                this.selectedRows = []
            }
        }
    }
}
</script>

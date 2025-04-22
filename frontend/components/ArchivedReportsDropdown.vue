<template>
  <b-dropdown
    class="preview-dropdown"
    text="Archived Reports"
    right
    size="sm"
  >
    <b-dropdown-item
      v-for="report in archivedReports"
      :key="report.id"
      @click="openReport(report.id)"
    >
      [{{ get_index_of_report(report) }}] {{ $moment.unix(report.created_ts).format("YYYY-MM-DD HH:mm:ss z") }}
    </b-dropdown-item>
    <b-dropdown-item
      v-if="archivedReports.length !== 0"
      @click="openLastReport()"
    >
      Current report
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
    name: "ArchivedReportsDropdown",
    props: {
        reportName: {
            type: String,
            required: true
        },
        reportType: {
            type: String,
            required: true
        },
        archivedReports: {
            type: Array,
            required: true
        }
    },

    methods: {
        openReport(reportId) {
            this.$router.push({
                path: `/v1/report/${this.reportType}/${this.reportName}`,
                query: {
                    reportId: reportId,
                }
            })
            window.location.reload()
        },

        openLastReport() {
            this.$router.push({
                path: `/v1/report/${this.reportType}/${this.reportName}`,
            })
            window.location.reload()
        },

        get_index_of_report(report) {
            return this.archivedReports.indexOf(report) + 1
        }
    }
}
</script>

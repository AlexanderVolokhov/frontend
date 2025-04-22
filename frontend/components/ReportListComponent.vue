<template>
  <main-layout>
    <b-row class="my-3">
      <b-button
        variant="outline-primary"
        @click="openUploadDialog()"
      >
        <b-icon
          icon="upload"
          aria-hidden="true"
        />
        Upload Emails
      </b-button>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-group
          label="Filter reports"
          label-for="report-name-filter"
          label-cols="3"
          label-align="left"
        >
          <b-input-group>
            <b-input-group-prepend>
              <b-input-group-text><b-icon icon="search" /></b-input-group-text>
            </b-input-group-prepend>
            <b-input
              id="report-name-filter"
              type="text"
              :value="reportFilter"
              debounce="500"
              @update="setReportFilter"
            />
            <b-input-group-append>
              <b-button @click="setReportFilter('')">
                <b-icon icon="x" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col lg="4">
        <b-form-group
          label="Email Type"
          label-for="email-type-filter"
          label-cols="3"
          label-align="left"
        >
          <b-input-group>
            <email-type-select
              id="email-type-filter"
              :value="selectedEmailType"
              @input="setFilterType"
            />
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col lg="4">
        <div class="buttons">
          <b-button
            variant="outline-primary"
            title="Select reports to be deleted"
            @click="toggleDeleteButtonVisibility(); $refs.reports.toggleCheckboxesVisibility()"
          >
            <b-icon
              v-b-tooltip.hover
              icon="check-square"
              aria-hidden="true"
            />
            Select reports
          </b-button>
          <b-button
            v-show="showDeleteButton"
            variant="outline-danger"
            title="Delete selected"
            @click="deleteSelected()"
          >
            <b-icon
              v-b-tooltip.hover
              icon="trash"
              aria-label="Delete selected"
            />
            Delete selected
          </b-button>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <reports-table
          ref="reports"
          :report-type="selectedEmailType"
          :report-filter="reportFilter"
        />
      </b-col>
    </b-row>
    <v-dialog />
  </main-layout>
</template>

<script>
import MainLayout from "./MainLayout.vue"
import EmailTypeSelect from "./EmailTypeSelect.vue"
import ReportsTable from "./ReportsTable.vue"
import UploadDialog from "./UploadDialogComponent.vue"
import {mapState} from "vuex"
import {deleteReports as apiDeleteReports} from "../helpers/api.js"

export default {
    name: "ReportListComponent",
    components: {
        MainLayout,
        EmailTypeSelect,
        ReportsTable
    },
    data() {
        return {
            showDeleteButton: false,
        }
    },
    computed: mapState([
        "selectedEmailType",
        "reportFilter"
    ]),
    watch: {
        $route(to, from) {
            if (to.query.email_type !== from.query.email_type) {
                this.$store.commit("selectEmailType", to.query.email_type)
            }
            if (to.query.filter !== from.query.filter) {
                this.$store.commit("setReportFilter", to.query.filter)
            }
        }
    },
    mounted() {
        if (this.$route.query.email_type && this.$route.query.email_type !== this.selectedEmailType) {
            this.$store.commit("selectEmailType", this.$route.query.email_type)
        }
        if (this.$route.query.filter && this.$route.query.filter !== this.reportNameFilter) {
            this.$store.commit("setReportFilter", this.$route.query.filter)
        }
    },
    methods: {
        toggleDeleteButtonVisibility() {
            this.showDeleteButton = !this.showDeleteButton
        },
        deleteSelected() {
            const selectedRows = this.$refs.reports.selectedRows
            this.$modal.show("dialog", {
                title: "Delete Reports",
                text: `Do you really want to delete <em>${selectedRows.length}</em> reports?`,
                buttons: [
                    {
                        title: "Yes",
                        handler: () => {
                            apiDeleteReports(this.axios, this.$refs.reports.reportType, selectedRows).then(() => {
                                this.$bvToast.toast(`${selectedRows.length} reports has been successfully deleted`, {
                                    title: "Report deleted",
                                    variant: "success",
                                    solid: true
                                })
                                this.$refs.reports.refreshTable(true)
                                this.$refs.reports.clearCheckboxes()
                            }).catch(err => {
                                this.$$bvToast.toast(`Failed to delete ${selectedRows.length} reports. Server has replied: ${err}`, {
                                    title: "Failed to delete reports",
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
        openUploadDialog() {
            this.$modal.show(UploadDialog, {}, { "height": "auto" }, {"before-close": () => {
                this.$refs.reports.loadReports()
            }})
        },
        setFilterType(value) {
            if (value !== this.selectedEmailType && value) {
                this.$router.push({ query: { ...this.$route.query, email_type: value } })
            }
        },
        setReportFilter(value) {
            if (value !== this.reportFilter) {
                this.$router.push({ query: { ...this.$route.query, filter: value } })
            }
        }
    }
}
</script>

<style>
.table.reports-table td {
    vertical-align: middle;
}
.table.reports-table td.status-cell {
    width: 50%;
}

.buttons {
  gap: 1rem;
  display: flex;
  justify-content: flex-end;
}

</style>

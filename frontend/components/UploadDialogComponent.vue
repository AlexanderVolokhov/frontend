<template>
  <b-overlay :show="showOverlay">
    <b-card
      header="Upload Emails"
      header-tag="header"
    >
      <b-card-text>
        <b-container>
          <b-row
            class="my-3"
            align-v="center"
          >
            Select type of emails you want to process:
          </b-row>
          <b-row
            class="my-3"
            align-v="center"
          >
            <email-type-select v-model="selectedEmailType" />
          </b-row>

          <b-row
            class="my-3"
            align-v="center"
          >
            Select Gmail folder to load emails from:
          </b-row>
          <b-row
            class="my-3"
            align-v="center"
          >
            <b-form-input
              v-model="labelFilter"
              autofocus
              placeholder="Type to search"
            />
          </b-row>
          <b-row
            class="my-3"
            align-v="center"
          >
            <b-list-group class="select-list">
              <b-list-group-item
                v-for="label in filteredLabels"
                :key="label.id"
                href="#"
                :active="selectedLabelIds.includes(label.id)"
                @click="selectLabel(label.id)"
                @dblclick="selectLabel(label.id); startParsing()"
              >
                {{ baseReportName(label.name) }}
              </b-list-group-item>
            </b-list-group>
          </b-row>
          <b-row
            class="my-3"
            align-v="center"
          >
            Number of emails: {{ numberOfEmails }}
          </b-row>
          <b-row class="my-3">
            <b-form-checkbox
              id="checkbox-screenshots"
              v-model="withScreenshots"
              name="checkbox-screenshots"
            >
              With screenshots
            </b-form-checkbox>
          </b-row>
          <b-row class="my-3">
            <b-button-toolbar>
              <b-button
                variant="outline-primary"
                :disabled="selectedLabelIds.length === 0 || !Boolean(selectedEmailType)"
                class="mr-2"
                @click="startParsing()"
              >
                Start Parsing
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="$emit('close')"
              >
                Cancel
              </b-button>
            </b-button-toolbar>
          </b-row>
        </b-container>
      </b-card-text>
    </b-card>
    <v-dialog />
  </b-overlay>
</template>

<script>

import EmailTypeSelect from "./EmailTypeSelect.vue"
import { createReport, getLabelDetails, isParsed, listLabels } from "../helpers/api"

export default {
    name: "UploadDialog",
    components: {
        EmailTypeSelect
    },
    data() {
        return {
            labels: [],
            filteredLabels: [],
            selectedLabelIds: [],
            selectedEmailType: this.$store.state.selectedEmailType,
            labelFilter:"",
            reportName: null,
            numberOfEmails: 0,
            showOverlay: false,
            withScreenshots: false,
        }
    },
    watch: {
        labelFilter: function(newFilter) {
            const filters = newFilter.trim().toLowerCase().split(" ")
            this.filteredLabels = this.labels.filter(label => {
                const name = label.name.toLowerCase()
                for (const filter of filters) {
                    if (!name.includes(filter)) {
                        return false
                    }
                }
                return true
            })
        },
        selectedEmailType: function() {
            this.fetchLabels()
        }
    },
    beforeMount() {
        this.fetchLabels()
    },
    methods: {
        errorToast(title, message) {
            this.$bvToast.toast(message, { title: title, variant: "danger", solid: true })
        },
        baseReportName(name) {
            return name.split("/").splice(-1)[0]
        },
        fetchLabels() {
            this.labels = []
            listLabels(this.axios, this.selectedEmailType).then(response => {
                if (response.data.success === false) {
                    this.errorToast("Failed to load Gmail folders", `Failed to load list of folders from Gmail. Server has replied: ${response.data.message}`)
                } else {
                    this.labels = this.filteredLabels = response.data.labels
                }
            }).catch((error) => {
                this.errorToast("Failed to load Gmail folders", `Failed to load list of folders from Gmail. Server has replied: ${error}`)
            })
        },
        checkReportExists: async function () {
            const response = await isParsed(this.axios, this.selectedEmailType, this.reportName)
            return response.status === 200
        },
        selectLabel(labelId) {
            const index = this.selectedLabelIds.indexOf(labelId)
            if (index === -1) {
                this.selectedLabelIds.push(labelId)
                this.getLabelDetails(labelId)
            } else {
                this.selectedLabelIds.splice(index, 1)
                this.updateTotalEmails()
            }
        },
        getLabelDetails(labelId) {
            getLabelDetails(this.axios, labelId)
                .then(response => {
                    const currentLabel = this.labels.find(label => label.id === labelId)
                    currentLabel.messagesTotal = response.data.messagesTotal
                    this.updateTotalEmails()
                    this.reportName = currentLabel.name
                })
                .catch(error => {
                    this.errorToast("Failed to load label details", `Server replied: ${error}`)
                })
        },

        updateTotalEmails() {
            this.numberOfEmails = this.selectedLabelIds.reduce((total, labelId) => {
                const label = this.labels.find(label => label.id === labelId)
                return total + (label.messagesTotal || 0)
            }, 0)
        },
        doStartParsing() {
            this.selectedLabelIds.forEach(labelId => {
                const currentLabel = this.labels.find(label => label.id === labelId)
                if (!currentLabel) {
                    this.errorToast("Error", "Label not found.")
                    return
                }
                const currentReportName = currentLabel.name

                const params = {
                    labelId: labelId,
                    withScreenshots: this.withScreenshots
                }

                createReport(this.axios, this.selectedEmailType, currentReportName, params)
                    .then(() => {
                        this.$bvToast.toast(`Creating of report for emails in ${currentReportName} has been scheduled.`, {
                            title: "Report created",
                            variant: "success",
                            solid: true
                        })
                    })
                    .catch(err => {
                        this.errorToast("Failed to create report", `Failed to request creation of report ${currentReportName}. Server has replied: ${err}`)
                    })
            })

            this.$emit("close")
        },
        askOverwriteReport(conflictingLabels) {
            this.$modal.show("dialog", {
                title: "Report already exists!",
                text: `Reports for the following labels already exist: ${conflictingLabels.join(", ")}. Do you want to overwrite them?`,
                buttons: [
                    {
                        title: "Overwrite",
                        handler: () => {
                            this.doStartParsing()
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
            },{
                zIndex:1
            })
        },
        startParsing: async function() {
            try {
                let conflicts = [] 

                for (let labelId of this.selectedLabelIds) {
                    let label = this.labels.find(l => l.id === labelId)
                    if (!label) continue

                    let reportExists = await this.checkReportExists(label.name)
                    if (reportExists) {
                        conflicts.push(label.name)
                    }
                }

                if (conflicts.length > 0) {
                    this.askOverwriteReport(conflicts)
                } else {
                    this.doStartParsing()
                }
            } catch (error) {
                console.warn(error)
            }
        },
    }

}
</script>

<style scoped>
header {
    font-weight: bold;
}

.select-list{
    width: 100%;
    height: 250px;
    max-height: 250px;
    overflow-y: auto;
}
</style>

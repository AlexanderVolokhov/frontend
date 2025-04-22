<template>
  <div>
    <b-table
      :items="cptData"
      :fields="fields"
      primary-key="email_id"
      small
      hover
      @row-hovered="onRowHovered"
      @row-unhovered="onRowUnhovered"
    >
      <template #cell(emailPreview)="row">
        <preview-dropdown
          :report-name="reportName"
          :report-type="reportType"
          :email-id="row.item.email_id"
        />
      </template>
    </b-table>
    <issue-tooltip
      v-if="currentIssues.length > 0"
      :target="tooltipTarget"
      triggers="manual"
      :issues="currentIssues"
    />
  </div>
</template>

<script>

import IssueTooltip from "./IssueTooltip.vue"
import PreviewDropdown from "../PreviewDropdown.vue"
import { emailPreviewUrl } from "../../helpers/api"

export default {
    inherit: true,
    name: "EmailsTabTable",
    components: {
        PreviewDropdown,
        IssueTooltip
    },
    props: {
        data: {
            type: Array,
            required: true
        },
        reportName: {
            type: String,
            required: true
        },
        reportType: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            fields: [
                { key: "locale", label: "Locale" },
                { key: "email_subject", label: "Subject" },
                { key: "pre_header", label: "Pre-header" },
                { key: "browser_title", label: "Title in browser"},
                { key: "emailPreview", label: "Email Preview", thClass: "text-center", tdClass: "text-center"}
            ],
            currentIssues: [],
            tooltipTarget: null
        }
    },
    computed: {
        cptData() {
            return this.data.map((item) => {
                return Object.assign(
                    {},
                    item,
                    {
                        _cellVariants: {
                            "locale": this.getStringVariant(item.locale),
                            "email_subject": this.getStringVariant(item.email_subject),
                            "pre_header": this.getStringVariant(item.pre_header),
                            "browser_title": this.getStringVariant(item.browser_title)
                        },
                        _rowVariant: this.getRowVariant(item)
                    })
            })
        }
    },
    methods: {
        getStringVariant (str) {
            if (!str) {
                return "danger"
            } else {
                return ""
            }
        },
        getRowVariant(item) {
            const warns = item.issues.reduce((acc, issue) => {
                return acc + (issue.type === "warning" ? 1 : 0)
            }, 0)
            const errors = item.issues.length - warns
            return errors > 0 ? "danger" : warns > 0 ? "warning" : ""
        },
        showEmailPreview(emailId) {
            window.open(emailPreviewUrl(this.reportType, this.reportName, emailId))
        },
        onRowHovered(item, _, event) {
            this.currentIssues = item.issues
            this.tooltipTarget = event.target
        },
        onRowUnhovered() {
            this.currentIssues = []
        }
    }
}
</script>

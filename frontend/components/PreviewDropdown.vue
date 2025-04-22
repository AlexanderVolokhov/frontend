<template>
  <b-dropdown
    class="preview-dropdown mr-2"
    text="Preview"
    right
    size="sm"
  >
    <b-dropdown-item-button @click="showGmailPreview()">
      Gmail Preview
    </b-dropdown-item-button>
    <b-dropdown-item-button @click="showEmailPreview()">
      Email Preview
    </b-dropdown-item-button>
    <b-dropdown-item-button @click="showScreenshot()">
      Screenshot
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
import { emailPreviewUrl, screenshotUrl } from "../helpers/api"
export default {
    name: "PreviewDropdown",
    props: {
        emailId: {
            type: String,
            required: true
        },
        reportType: {
            type: String,
            required: true
        },
        reportName: {
            type: String,
            required: true
        }
    },
    methods: {
        showEmailPreview() {
            window.open(emailPreviewUrl(this.reportType, this.reportName, this.emailId))
        },
        showGmailPreview() {
            window.open(`https://mail.google.com/mail/u/${process.env.VUE_APP_ENV_GMAIL_ADDRESS}/#all/${this.emailId}`)
        },
        showScreenshot() {
            window.open(screenshotUrl(this.reportType, this.reportName, this.emailId))
        }
    }
}
</script>

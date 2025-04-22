<template>
  <b-container fluid>
    <b-row>
      <b-col
        cols="auto"
        class="mr-auto"
      >
        <email-issue-list :email="email" />
      </b-col>
      <b-col cols="auto">
        <preview-dropdown
          :email-id="email.email_id"
          :report-name="reportName"
          :report-type="reportType"
        />
      </b-col>
    </b-row>

    <b-card
      no-body
      class="mt-2"
    >
      <b-tabs
        card
        lazy
      >
        <b-tab
          title="Cart Links"
          active
          :disabled="email.cart_links.length === 0"
        >
          <email-cart-links-view :email="email" />
        </b-tab>
        <b-tab title="Links">
          <email-links-view :email="email" />
        </b-tab>
        <b-tab
          title="Images"
          :disabled="email.images.length === 0"
        >
          <email-images-view :email="email" />
        </b-tab>
      </b-tabs>
    </b-card>
  </b-container>
</template>

<script>
import EmailIssueList from "./EmailIssueList.vue"
import EmailCartLinksView from "./EmailCartLinksView.vue"
import EmailLinksView from "./EmailLinksView.vue"
import EmailImagesView from "./EmailImagesView.vue"
import PreviewDropdown from "./../PreviewDropdown.vue"
import { createNamespacedHelpers } from "vuex"

const { mapState } = createNamespacedHelpers("report")

export default {
    name: "EmailDetailView",
    components: {
        EmailIssueList,
        EmailCartLinksView,
        EmailLinksView,
        EmailImagesView,
        PreviewDropdown
    },
    props: {
        email: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState(["reportName", "reportType"])
    },
    methods: {
    }
}
</script>

<style scoped>
</style>
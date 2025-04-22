<template>
  <b-card-group deck>
    <b-card
      v-for="link in email.cart_links"
      :key="link.internal_id"
      class="link-card"
      no-body
    >
      <b-card-header
        :header-bg-variant="getCardVariant(link, 'bg')"
        :header-text-variant="getCardVariant(link, 'text')"
        header-tag="header"
        class="p-1"
      >
        <div class="d-flex">
          <div class="flex-grow-1 align-self-center">
            [{{ link.link_id }}] {{ link.title.value }}
          </div>
          <div>
            <b-button
              size="sm"
              class="mr-3"
              @click="showCartSnapshot(email.email_id, link.link_id)"
            >
              Show cart snapshot
            </b-button>
            <b-button
              v-b-toggle="`${link.internal_id}-details`"
              size="sm"
            >
              Details
              <b-icon-x-circle-fill
                v-if="countIssuesInLinkDetails(link, 'error') > 0"
                variant="danger"
                class="pl-1"
              />
              <b-icon-exclamation-triangle-fill
                v-if="countIssuesInLinkDetails(link, 'warning') > 0"
                variant="warning"
                class="pl-1"
              />
            </b-button>
          </div>
        </div>
      </b-card-header>
      <b-table-simple
        small
        borderless
        class="data-table"
      >
        <tr><th>ID:</th><td>{{ link.link_id }}</td></tr>
        <b-tr
          :id="`title-${link.internal_id}`"
          :variant="getAttributeVariant(link.title)"
        >
          <th>Title:</th><td>
            {{ link.title.value }}<br>
            <span
              v-if="link.title.value"
              class="text-secondary"
            >en_us:</span> {{ link.title_translation.value }}
          </td>
        </b-tr>
        <issue-popover
          :target="`title-${link.internal_id}`"
          :attribute="link.title"
        />

        <b-tr
          :id="`product-${link.internal_id}`"
          :variant="getAttributeVariant(link.product)"
        >
          <th>Product:</th><td>{{ link.product.value }}</td>
        </b-tr>
        <issue-popover
          :target="`product-${link.internal_id}`"
          :attribute="link.product"
        />

        <b-tr
          :id="`status_code-${link.internal_id}`"
          :variant="getAttributeVariant(link.status_code)"
        >
          <th>Status code:</th><td>{{ link.status_code.value }}</td>
        </b-tr>
        <issue-popover
          :target="`status_code-${link.internal_id}`"
          :attribute="link.status_code"
        />
      </b-table-simple>
      <b-table-simple
        small
        class="prices-table"
      >
        <b-tr>
          <th />
          <th scope="col">
            Old Price
          </th>
          <th scope="col">
            New Price
          </th>
          <th scope="col">
            Discount
          </th>
        </b-tr>
        <b-tr>
          <th scope="row">
            Email
          </th>
          <b-td
            :id="`email_price_old-${link.internal_id}`"
            :variant="getAttributeVariant(link.source_price_old)"
          >
            {{ link.source_price_old.original }}
          </b-td>
          <issue-popover
            :target="`email_price_old-${link.internal_id}`"
            :attribute="link.email_price_old"
          />

          <b-td
            :id="`email_price_new-${link.internal_id}`"
            :variant="getAttributeVariant(link.source_price_new)"
          >
            {{ link.source_price_new.original }}
          </b-td>
          <issue-popover
            :target="`email_price_new-${link.internal_id}`"
            :attribute="link.source_price_new"
          />

          <b-td variant="success">
            N/A
          </b-td><!-- Success until we support this properly //-->
        </b-tr>
        <b-tr>
          <th scope="row">
            Cart
          </th>
          <b-td
            :id="`cart_price_old-${link.internal_id}`"
            :variant="getAttributeVariant(link.cart_price_old)"
          >
            {{ link.cart_price_old.original }}
          </b-td>
          <issue-popover
            :target="`cart_price_old-${link.internal_id}`"
            :attribute="link.cart_price_old"
          />

          <b-td
            :id="`cart_price_new-${link.internal_id}`"
            :variant="getAttributeVariant(link.cart_price_new)"
          >
            {{ link.cart_price_new.original }}
          </b-td>
          <issue-popover
            :target="`cart_price_new-${link.internal_id}`"
            :attribute="link.cart_price_new"
          />

          <b-td
            :id="`cart_price_discount-${link.internal_id}`"
            :variant="getAttributeVariant(link.cart_price_discount)"
          >
            {{ link.cart_price_discount.value }}
          </b-td>
          <issue-popover
            :target="`cart_price_discount-${link.internal_id}`"
            :attribute="link.cart_price_discount"
          />
        </b-tr>
      </b-table-simple>
      <b-collapse
        :id="`${link.internal_id}-details`"
        :ref="`${link.internal_id}-details`"
      >
        <b-table-simple
          small
          borderless
          class="data-table"
        >
          <b-tr
            :id="`from_link-${link.internal_id}`"
            :variant="getAttributeVariant(link.from_link)"
          >
            <th>To link:</th>
            <td>
              <a
                :href="`${link.from_link.value}`"
                target="_blank"
                class="long-link"
              >{{ link.from_link.value }}</a>
            </td>
          </b-tr>
          <issue-popover
            :target="`from_link-${link.internal_id}`"
            :attribute="link.from_link"
          />

          <b-tr
            :id="`to_link-${link.internal_id}`"
            :variant="getAttributeVariant(link.to_link)"
          >
            <th>Final link:</th>
            <td>
              <a
                :href="`${ link.to_link.value }`"
                target="_blank"
                class="long-link"
              >{{ link.to_link.value }}</a>
            </td>
          </b-tr>
          <issue-popover
            :target="`to_link-${link.internal_id}`"
            :attribute="link.to_link"
          />
        </b-table-simple>
      </b-collapse>
    </b-card>
  </b-card-group>
</template>

<script>

import { getAttributeVariant, countIssuesInLinkDetails } from "./lib/attribute.js"
import { createNamespacedHelpers } from "vuex"
import IssuePopover from "./IssuePopover.vue"
import Lazy from "lazy.js"
import { screenshotUrl, cartSnapshotUrl, emailPreviewUrl } from "../../helpers/api.js"

const { mapState } = createNamespacedHelpers("report")

export default {
    inherit: true,
    name: "LinksTabTable",
    components: {
        IssuePopover
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
        getAttributeVariant,
        countIssuesInLinkDetails,
        getCardVariant(link, type) {
            let variant = type === "bg" ? "success" : "white"
            for (let prop in link) {
                if (typeof(link[prop]) === "object" && Object.prototype.hasOwnProperty.call(link[prop], "issues")) {
                    const issues = link[prop].issues
                    if (Lazy(issues).map(issue => issue.type).contains("error")) {
                        return type === "bg" ? "danger" : "white"
                    } else if (Lazy(issues).map(issue => issue.type).contains("warning")) {
                        variant = (type === "bg" ? "warning" : "dark")
                    }
                }
            }
            return variant
        },
        describeAttrIssues(attr) {
            // FIXME: Move the popover into a component so we can fully customize the content and use <b-icon>
            let str = "<ul class='issue-list'>"
            for (let issue of attr.issues) {
                str += `<li>${issue.title}</li>`
            }
            str += "</ul>"
            return str
        },
        showEmailPreview(emailId) {
            window.open(emailPreviewUrl(this.reportType, this.reportName, emailId))
        },
        showGmailPreview(emailId) {
            window.open(`https://mail.google.com/mail/u/${process.env.VUE_APP_ENV_GMAIL_ADDRESS}/#all/${emailId}`)
        },
        showScreenshot(emailId) {
            window.open(screenshotUrl(this.reportType, this.reportName, emailId))
        },
        showCartSnapshot(emailId, linkId) {
            window.open(cartSnapshotUrl(this.reportType, this.reportName, emailId, linkId))
        }
    }
}
</script>

<style scoped>
.link-card {
    min-width: calc(100% - 30px); /*15 + 15 px margins from b-card-group*/
    margin-bottom: 1rem !important;
}
.link-card .data-table th {
    text-align: left;
    width: 140px;
}
.link-card table {
    margin-bottom: 0;
}
.long-link {
    word-wrap: break-word;
    word-break: break-all;
}
.b-table-sticky-header {
    max-height: 90vh;
    min-height: 50vh;
}
.no-links {
    width: 100%;
    text-align: center;
}
</style>

<template>
  <b-table
    :items="cptLinks"
    :fields="fields"
    primary-key="linkInternalId"
    small
    hover
    sticky-header="60vh"
    :sort-by="'locale'"
  >
    <template #cell(cartPriceNewYear)="row">
      {{ getNewCartPrice(row.item) }}
    </template>

    <template #cell(cartPriceDiscount)="row">
      <div class="text-center">
        <span v-if="row.item.cartPriceDiscount">{{ row.item.cartPriceDiscount }}</span>
        <span v-else>N/A</span>
      </div>
    </template>

    <template #cell(statusCode)="row">
      <div class="text-center">
        <span v-if="row.item.statusCode">
          <abbr
            title="HTTP response status code

2XX: OK.
3XX: The response is further redirected (this is OK).
4XX: Error: the URL does not exist on the server.
5XX: Error: server error. Maybe try to re-create report."
          >
            {{ row.item.statusCode }}

          </abbr>
        </span>
      </div>
    </template>

    <template #cell(details)="row">
      <b-button
        size="sm"
        class="mr-2"
        @click="row.toggleDetails"
      >
        {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
      </b-button>
    </template>

    <template #cell(fromLinkEncoded)="row">
      <div class="text-center">
        <b-icon
          v-if="row.item.fromLinkEncoded === true"
          icon="check"
          variant="success"
        />
        <b-icon
          v-if="row.item.fromLinkEncoded === false"
          icon="x-circle"
          variant="danger"
        />
      </div>
    </template>
    <template #cell(toLinkUtm)="row">
      <div class="text-center">
        <b-icon
          v-if="row.item.toLinkUtm === true"
          icon="check"
          variant="success"
        />
        <b-icon
          v-if="row.item.toLinkUtm === false"
          icon="x-circle"
          variant="danger"
        />
      </div>
    </template>

    <template #cell(preview)="row">
      <div>
        <preview-dropdown
          :report-name="reportName"
          :report-type="reportType"
          :email-id="row.item.emailId"
        />
      </div>
    </template>

    <template #row-details="row">
      <div>
        <b-row>
          <b-col
            cols="1"
            class="text-sm-right"
          >
            <b>Email Link:</b>
          </b-col>
          <b-col>
            <a
              :href="`${row.item.linkFrom}`"
              target="blank"
              class="long-link"
            >{{ row.item.linkFrom }}</a>
          </b-col>
        </b-row>
        <b-row>
          <b-col
            cols="1"
            class="text-sm-right"
          >
            <b>Final Link:</b>
          </b-col>
          <b-col>
            <a
              :href="`${row.item.linkTo}`"
              target="blank"
              class="long-link"
            >{{ row.item.linkTo }}</a>
          </b-col>
        </b-row>
        <b-row v-if="reportType !== 'TRANSACTION_EMAILS'">
          <b-col>
            <b-button
              size="sm"
              @click="showCartSnapshot(row.item.emailId, row.item.linkId)"
            >
              Show Cart Snapshot
            </b-button>
          </b-col>
        </b-row>
      </div>
    </template>
  </b-table>
</template>

<script>

import PreviewDropdown from "../PreviewDropdown.vue"
import { cartSnapshotUrl, emailPreviewUrl, screenshotUrl } from "../../helpers/api"

export default {
    inherit: true,
    name: "LinksTabTable",
    components: {
        PreviewDropdown
    },
    props: {
        links: {
            type: Array,
            required: true
        },
        linkType: {
            type: String,
            required: true
        },
        reportName: {
            type: String,
            required: true
        },
        reportType: {
            type: String,
            required: true
        },
        showAllDetails: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            showLinkDetail: false,
            showLinkDetailId: null,
            isDiff: false,

            allFields: [
                { key: "linkId", label: "ID", sortable: true},
                { key: "locale", label: "Locale", sortable: true },

                { key: "sourcePriceOldYear", label: "Source Price Old Year", tdClass: "checkDiscount", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },
                { key: "cartPriceOldYear", label: "Cart Price Old Year", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },

                { key: "sourcePriceNewYear", label: "Source Price New Year", tdClass: "checkDiscount", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },
                { key: "cartPriceNewYear", label: "Cart Price New Year", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },

                { key: "sourcePriceNewMonth", label: "Source Price New Month", tdClass: "checkDiscount", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },
                { key: "cartPriceNewMonth", label: "Cart Price New Month", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },
                
                { key: "sourcePriceOldMonth", label: "Source Price Old Month", tdClass: "checkDiscount", formatter: this.getPriceText, visibleIn: [ "cartLink" ] },
                { key: "cartPriceDiscount", label: "Cart Discount", thClass: "text-center", visibleIn: [ "cartLink" ] },

                { key: "product", label: "Product", visibleIn: [ "cartLink" ], sortable: true},
                { key: "title", label: "Title", sortable: true },
                { key: "translatedTitle", label: "Translated Title", sortable: true},
                { key: "statusCode", label: "Code", thClass: "text-center", sortable: true },
                { key: "coupon", label: "Coupon", thClass: "text-center", visibleIn: [ "cartLink" ] },
                { key: "campaignMarker", label: "Campaign Marker", thClass: "text-center", visibleIn: [ "cartLink" ] },
                { key: "fromLinkEncoded", label: "Encoded", thClass: "text-center", visibleIn: [ "link", "cartLink" ] },
                { key: "toLinkUtm", label: "UTM Present", thClass: "text-center", visibleIn: ["link", "cartLink" ] },
                { key: "preview", label: "Preview", thClass: "text-center", tdClass: "text-center"},
                { key: "details", label: "Details", thClass: "text-center", tdClass: "text-center" }
            ]
        }
    },
    computed: {
        cptLinks() {
            return this.links.map((item) => {
                return Object.assign({}, item, { _cellVariants: {
                    "sourcePriceOldYear": this.getPriceVariant(item.cartPriceOldYear, item.sourcePriceOldYear),
                    "sourcePriceNewYear": this.getPriceVariantForNewPrices(item),
                    "sourcePriceOldMonth": this.getPriceVariantForOldMonthPrice(item.sourcePriceOldMonth , item.cartPriceOldYear, item.sourcePriceOldYear, item.locale),
                    "sourcePriceNewMonth": this.getMonthPriceVariant(item.sourcePriceNewMonth , item.cartPriceNewMonth, item.locale),

                    "cartPriceOldYear": this.getPriceVariant(item.sourcePriceOldYear, item.cartPriceOldYear),
                    "cartPriceNewYear": this.getPriceVariantForNewPrices(item),
                    "cartPriceNewMonth": this.getMonthPriceVariant(item.cartPriceNewMonth , item.sourcePriceNewMonth, item.locale),

                    "statusCode": this.getStatusCodeVariant(item.statusCode),
                    "cartPriceDiscount": this.getDiscountVariant(item.cartPriceDiscount),
                    "campaignMarker": this.getCampaignVariant(item.campaignMarker),
                    "coupon": this.getCampaignVariant(item.coupon)
                }}, { _showDetails: this.showAllDetails

                })
            })
        },
        fields() {
            return this.allFields.filter((field) => {
                // Field always visible
                if (field.visibleIn === undefined) {
                    return true
                }
                // List of visible fields doesn't contain 'transaction'
                if (this.reportType === "transaction" && field.visibleIn.indexOf("transaction") === -1) {
                    return false
                }

                return field.visibleIn.indexOf(this.linkType) > -1
            })
        }
    },
    methods: {
        getPriceText(price) {
            if (price === null) return "NULL"
            if (price.original !== null) {
                return price.original
            } else {
                return "N/A"
            }
        },
        
        getStatusCodeVariant(statusCode) {
            return statusCode === 200 ? "success" : "warning"
        },
        getPriceVariant(price1, price2) {
            if (!price1 || !price2) {
                return ""
            }
            if (price1.value !== null && price2.value !== null) {
                const diff = Math.abs(price1.value - price2.value)
                if (diff === 0.0) {
                    return "success"
                } else if (diff <= 1.0) {
                    return "warning"
                } else {
                    return "danger"
                }
            } else {
                return "warning"
            }
        },
        getMonthPriceVariant(price1, price2, locale){
            if (locale === "en-gb") {
                return ""
            } else {
                return this.getPriceVariant(price1, price2)
            }
        },
        getPriceVariantForOldMonthPrice(sourceOldMonthPrice, sourceOldYearPrice, cartOldYearPrice) {
            if (!sourceOldMonthPrice || sourceOldMonthPrice.value === null) { 
                return ""
            }
            // if exists sourceOldMonthPrice property then it is a CartLink and exists sourceOldYearPrice and cartOldYearPrice properties.
            const year_price = sourceOldYearPrice.value ? sourceOldYearPrice.value : cartOldYearPrice.value ? cartOldYearPrice.value : null
            const months_per_year = 12
            if (year_price !== null) {
                // We can compare with year price or 2-years price
                let diff = Math.abs(sourceOldMonthPrice.value - year_price/months_per_year)
                if (diff <= 0.5) {
                    return "success"
                }
                else{
                    diff = Math.abs(sourceOldMonthPrice.value - year_price/(months_per_year*2))
                    if (diff <= 0.5) {
                        return "success"
                    }
                }
                return "danger"
            } else {
                // When we don't now if the price is right
                return "warning"
            }
        },
        getPriceVariantForNewPrices(item) {
            let priceNew = item.cartPriceNewYear
            if (item.cartPriceTotal && item.cartPriceTotal.value) {
                priceNew = item.cartPriceTotal
            }
            return this.getPriceVariant(priceNew, item.sourcePriceNewYear)

        },
        getDiscountVariant(number) {
            if (number === null) {
                return "warning"
            }
            return (number > 0 && number <= 10) ? "danger" : ""
        },
        getCampaignVariant(value) {
            if (value === null || value === undefined) {
                return "warning"
            }
            return ""
        },
        showEmailPreview() {
            window.open(emailPreviewUrl(this.reportType, this.reportName, this.emailId))
        },
        showGmailPreview(emailId) {
            window.open(`https://mail.google.com/mail/u/${process.env.VUE_APP_ENV_GMAIL_ADDRESS}/#all/${emailId}`)
        },
        showScreenshot(emailId) {

            window.open(screenshotUrl(this.reportType, this.reportName, emailId))
        },
        showCartSnapshot(emailId, linkId) {
            window.open(cartSnapshotUrl(this.reportType, this.reportName, emailId, linkId))
        },
        getNewCartPrice(item) {
            if (!item.cartPriceTotal || !item.cartPriceTotal.value) {
                return this.getPriceText(item.cartPriceNewYear)
            } else {
                return this.getPriceText(item.cartPriceTotal)
            }
        }
    }
}
</script>

<style scoped>
.long-link {
    word-wrap: break-word;
    word-break: break-all;
}

/* Fixing the issue with sticky header with `>>>` deep-selector
 * https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors
 */
.b-table-sticky-header >>> thead {
    position: sticky;
    top: 0;
    z-index: 1;
}
</style>

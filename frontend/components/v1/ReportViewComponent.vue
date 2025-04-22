<template>
  <main-layout>
    <b-overlay :show="isLoading">
      <b-row>
        <b-col>
          <b-row class="justify-content-start align-content-center">
            <h2 class="mr-5">
              <a @click="$router.go(-1)">
                <b-icon
                  icon="arrow-left-circle"
                  variant="primary"
                />
              </a>
              {{ reportName }} Report
            </h2>
            <h4
              v-if="isExpiredLinks" 
              class="expired-links"
            >
              report contains expired links
            </h4>
          </b-row>
          <b-row>
            <span class="text-primary">Created date: {{ created_at ? created_at : "N/A" }}</span>
            <template v-if="archivedReports.length > 0">
              <div style="padding: 0.2rem;" />
              <archived-reports-dropdown
                :report-name="reportName"
                :report-type="reportType"
                :archived-reports="archivedReports"
              />
            </template>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="my-3">
        <b-col>
          <b-button @click="recreateReport">
            Recreate report
          </b-button>
                    &nbsp;
          <b-button @click="openCurrentEmailsInNewTabs()">
            View current emails in new tabs
          </b-button>
                    &nbsp;
          <b-button @click="downloadScreenshots()">
            Download all screenshots as ZIP
          </b-button>
                    &nbsp;
          <b-button @click="toggleAllDetails()">
            {{ showAllDetails ? 'Hide' : 'Show' }} all details
          </b-button>
          &nbsp;
          <b-button
            v-if="reportVersion > 1"
            @click="openInNewUI()"
          >
            Open in new UI
          </b-button>
          &nbsp;
          <b-button :href="exportLinksUrl(reportType, reportName)">
            Export links
          </b-button>
          <v-dialog />
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs
              v-model="tabIndex"
              card
              pills
            >
              <b-tab
                v-if="reportType !== 'transaction'" 
                @click="updateRoute('cart-links')"
              >
                <template #title>
                  Cart Links <b-badge pill>
                    {{ cartLinks.length }}
                  </b-badge>
                </template>
                <b-card-text>
                  <tab-controller
                    :translated-links="translatedCartLinks"
                    :locales="locales"
                    :filter.sync="filter"
                  >
                    <links-tab-table
                      :links="cartLinks"
                      :link-type="'cartLink'"
                      :report-name="reportName"
                      :report-type="reportType"
                      :show-all-details="showAllDetails"
                    />
                  </tab-controller>
                </b-card-text>
              </b-tab>
              <b-tab 
                @click="updateRoute('lp-links')"
              >
                <template #title>
                  LP Links <b-badge pill>
                    {{ lpLinks.length }}
                  </b-badge>
                </template>
                <b-card-text>
                  <tab-controller
                    :translated-links="translatedLPLinks"
                    :locales="locales"
                    :filter.sync="filter"
                  >
                    <links-tab-table
                      :links="lpLinks"
                      :link-type="'link'"
                      :report-name="reportName"
                      :report-type="reportType"
                      :show-all-details="showAllDetails"
                    />
                  </tab-controller>
                </b-card-text>
              </b-tab>
              <b-tab 
                @click="updateRoute('links')"
              >
                <template #title>
                  Links <b-badge pill>
                    {{ links.length }}
                  </b-badge>
                </template>
                <b-card-text>
                  <tab-controller
                    :translated-links="translatedLinks"
                    :locales="locales"
                    :filter.sync="filter"
                  >
                    <links-tab-table
                      :links="links"
                      :link-type="'link'"
                      :report-name="reportName"
                      :report-type="reportType"
                      :show-all-details="showAllDetails"
                    />
                  </tab-controller>
                </b-card-text>
              </b-tab>
              <b-tab @click="updateRoute('emails')">
                <template #title>
                  Emails <b-badge pill>
                    {{ filteredEmails.length }}
                  </b-badge>
                </template>
                <b-card-text>
                  <tab-controller
                    :translated-links="[]"
                    :locales="locales"
                    :filter.sync="filter"
                  >
                    <emails-tab-table
                      :data="filteredEmails"
                      :report-name="reportName"
                      :report-type="reportType"
                    />
                  </tab-controller>
                </b-card-text>
              </b-tab>
              <b-tab 
                v-if="reportType !== 'transaction'"
                @click="updateRoute('images')"
              >
                <template #title>
                  Images
                </template>
                <b-card-text>
                  <tab-controller
                    :translated-links="[]"
                    :locales="locales"
                    :filter.sync="filter"
                  >
                    <images-tab-table :data="filteredEmails" />
                  </tab-controller>
                </b-card-text>
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </b-overlay>
  </main-layout>
</template>

<script>
import MainLayout from "../MainLayout.vue"
import TabController from "./TabController"

import EmailsTabTable from "./EmailsTabTable"
import ImagesTabTable from "./ImagesTabTable"
import LinksTabTable from "./LinksTabTable"

import { convertReportFromV2} from "./converter.js"

import { createReport, downloadScreenshotsUrl, emailPreviewUrl, getReport, exportLinksUrl } from "../../helpers/api"
import ArchivedReportsDropdown from "../ArchivedReportsDropdown.vue"

export default {
    name: "ReportViewComponent",
    components: {
        MainLayout,
        TabController,
        EmailsTabTable,
        ImagesTabTable,
        LinksTabTable,
        ArchivedReportsDropdown
    },
    data() {
        return {
            tabIndex: 0,
            tabs: ["cart-links", "lp-links", "links", "emails", "images"],
            isLoading: true,
            labelId: null,
            reportName: null,
            reportType: null,
            reportId: null,
            fileRunInfo: {},
            showAllDetails: false,
            isExpiredLinks: false,
            filter: {
                locale: this.$route.hash ? this.$route.hash.substring(1) : null,
                err404: false,
                linkTranslation: null
            },

            // Source data
            allEmails: [], // Source data from backend.
            filteredEmails: [], // Calculated from allEmails on locale change.
            locales: [], // Calculated from allEmails.
            translatedCartLinks: [], // Calculated from allEmails.
            translatedLinks: [], // Calculated from allEmails.
            translatedLPLinks: [], // Calculated from allEmails.
            reportVersion: 1,

            exportLinksUrl
        }
    },
    computed: {
        links() {
            let links = []
            this.filteredEmails.forEach(email =>
                email.links.filter(link => {
                    if (this.filter.err404 && link.statusCode !== 404) {
                        return false
                    }
                    if (this.filter.linkTranslation !== null && this.filter.linkTranslation !== link.title) {
                        return false
                    }
                    return true
                }).forEach(link => {
                    links.push({
                        emailId: email.email_id,
                        linkId: link.link_id,
                        linkInternalId: link.internal_id,
                        title: link.title,
                        locale: email.locale,
                        translatedTitle: link.title_translation,
                        statusCode: link.status_code,
                        linkTo: link.to_link,
                        linkFrom: link.from_link,
                        toLinkUtm: link.to_link_utm,
                        warning: link.warning,
                        error: link.error,
                        fromLinkEncoded: link.from_link_encoded
                    })
                })
            )
            return links
        },
        lpLinks() {
            let links = []
            this.filteredEmails.forEach(email =>
                email.lp_links.filter(link => {
                    if (this.filter.err404 && link.statusCode !== 404) {
                        return false
                    }
                    if (this.filter.linkTranslation !== null && this.filter.linkTranslation !== link.title) {
                        return false
                    }
                    return true
                }).forEach(link => {
                    links.push({
                        emailId: email.email_id,
                        linkId: link.link_id,
                        linkInternalId: link.internal_id,
                        title: link.title,
                        locale: email.locale,
                        translatedTitle: link.title_translation,
                        statusCode: link.status_code,
                        linkTo: link.to_link,
                        linkFrom: link.from_link,
                        toLinkUtm: link.to_link_utm,
                        fromLinkEncoded: link.from_link_encoded,
                        warning: link.warning,
                        error: link.error
                    })
                })
            )
            return links
        },
        cartLinks() {
            let links = []
            this.filteredEmails.forEach(email => {
                const all_cart_links = [].concat.apply(email.cart_links, email.lp_links.map(l => l.cart_links))

                all_cart_links.filter(link => {
                    if (this.filter.err404 && link.statusCode !== 404) {
                        return false
                    }
                    if (this.filter.linkTranslation !== null && this.filter.linkTranslation !== link.title) {
                        return false
                    }
                    return true
                }).forEach(link => {
                    links.push({
                        emailId: email.email_id,
                        linkId: link.link_id,
                        linkInternalId: link.internal_id,
                        title: link.title,
                        locale: email.locale,
                        translatedTitle: link.title_translation,
                        statusCode: link.status_code,
                        linkTo: link.to_link,
                        linkFrom: link.from_link,

                        sourcePriceOldYear: link.source_price_old_year,
                        sourcePriceNewYear: link.source_price_new_year,
                        sourcePriceOldMonth: link.source_price_old_month,
                        sourcePriceNewMonth: link.source_price_new_month,
                        sourcePriceDiscount: link.source_price_discount,

                        cartPriceOldYear: link.cart_price_old_year,
                        cartPriceNewYear: link.cart_price_new_year,
                        cartPriceOldMonth: link.cart_price_old_month,
                        cartPriceNewMonth: link.cart_price_new_month,
                        cartPriceTotal: link.cart_price_total,
                        cartPriceDiscount: link.cart_price_discount,

                        product: link.product,
                        toLinkUtm: link.to_link_utm,
                        fromLinkEncoded: link.from_link_encoded,
                        coupon: link.coupon,
                        warning: link.warning,
                        error: link.error,
                        campaignMarker: link.campaign_marker
                    })
                })
            })
            return links
        },
    },
    watch: {
        filter: function(newFilter) {
            this.filteredEmails = this.allEmails.filter(email => newFilter.locale === null || newFilter.locale === email.locale)
        },
        allEmails: function(emails) {
            let locales = []
            let trCartLinks = []
            let trLinks = []
            let trLPLinks = []

            emails.forEach(email => {
                if (!locales.includes(email.locale)) {
                    locales.push(email.locale)
                }
                email.cart_links.forEach(link => {
                    if (link.title_translation !== "" && !trCartLinks.includes(link.title_translation)) {
                        trCartLinks.push(link.title_translation)
                    }
                })

                email.links.forEach(link => {
                    if (link.title_translation !== "" && !trLinks.includes(link.title_translation)) {
                        trLinks.push(link.title_translation)
                    }
                })

                email.lp_links.forEach(link => {
                    if (link.title_translation !== "" && !trLPLinks.includes(link.title_translation)) {
                        trLPLinks.push(link.title_translation)
                    }
                })
            })
            this.locales = locales.sort()
            this.translatedCartLinks = trCartLinks
            this.translatedLPLinks = trLPLinks
            this.translatedLinks = trLinks
        }
    },
    created() {
        this.reportName = this.$route.params.report
        document.title = `${this.reportName} | Mailchecker`
        this.reportType = this.$route.params.reportType
        this.reportId = this.$route.query.reportId
        this.loadReport()
        this.created_at = null
        this.tabIndex = this.tabs.findIndex(tab => tab === this.$route.params.tab)
        this.archivedReports = []
    },
    methods: {
        updateRoute(tabName) {
            // Update the route based on tab selection
            let locale = this.filter.locale ? this.filter.locale : ""
            this.$router.replace(`/v1/report/${this.reportType}/${this.reportName}/${tabName}?${this.reportId}#${locale}`)
        },
        loadReport() {
            this.isLoading=true
            getReport(this.axios, this.reportType, this.reportName, this.reportId)
                .then(response => {
                    this.reportVersion = response.data.version || 1
                    this.archivedReports = response.data.archived_reports || []
                    this.labelId = response.data.label_id
                    if (this.reportVersion === 2) {
                        this.filteredEmails = this.allEmails = convertReportFromV2(response.data.campaigns.test.emails)
                    } else {
                        this.filteredEmails = this.allEmails = response.data.campaigns.test.emails
                    }
                    this.fileRunInfo.date = response.data.date.date
                    this.fileRunInfo.time = response.data.date.time
                    this.created_at = response.data.created_at
                    this.locale = null
                    this.isLoading = false
                    this.filteredEmails = this.allEmails.filter(email => this.filter.locale === null || this.filter.locale === email.locale)
                    this.isExpiredLinks = response.data.expired_links
                })
                .catch(err => {
                    this.$bvToast.toast(`Failed to load report. The server has replied :${err}`, {
                        title: "Failed to load report",
                        variant: "danger",
                        solid: true
                    })
                    this.isLoading = false
                })
        },
        recreateReport() {
            this.$modal.show("dialog", {
                title: "Recreate Report",
                text: "Do you really want to parse these emails again?",
                buttons: [
                    {
                        title: "Yes",
                        handler: () => {
                            this.$modal.hide("dialog")
                            const params = { labelId: this.labelId }
                            createReport(this.axios, this.reportType, this.reportName, params).then(() => {
                                this.$bvToast.toast(`Parsing of report ${this.reportName} has been scheduled and should begin soon.`, {
                                    title: "Report parsing scheduled",
                                    variant: "success",
                                    solid: true
                                })
                            }).catch(err => {
                                this.$bvToast.toast(`Failed to schedule re-parsing of the report. Server has replied: ${err}`, {
                                    title: "Failed to recreate report",
                                    variant: "danger",
                                    solid: true
                                })
                            })
                            this.$router.back()
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
        getEmailById(emailId) {
            return this.allEmails.find(email => email.email_id === emailId)
        },
        openCurrentEmailsInNewTabs() {
            const previewList = this.filteredEmails.map(email => email.email_id)
            this.$modal.show("dialog", {
                title: "Really open emails?",
                text: `<p>You are about to open <strong>${previewList.length}</strong> emails. Do you really want to do it?</p>
                       <p>If you see only one new tab, your browser may have blocked opening multiple tabs.</p>`,
                buttons: [
                    {
                        title: "Yes",
                        handler: () => {
                            this.$modal.hide("dialog")
                            previewList.forEach((emailId) => {
                                this.showEmailPreview(emailId)
                            })
                        }
                    },
                    {
                        title: "No",
                        handler: () => {
                            this.$modal.hide("dialog")
                        }
                    }
                ]
            })
        },
        showEmailPreview(emailId) {
            window.open(emailPreviewUrl(this.reportType, this.reportName, emailId))
        },
        downloadScreenshots() {
            window.open(downloadScreenshotsUrl(this.reportType, this.reportName))
        },
        toggleAllDetails() {
            this.showAllDetails = !this.showAllDetails
        },
        openInNewUI () {
            this.$router.replace(`/report/${this.reportType}/${this.reportName}`)
        }
    }

}
</script>

<style scoped>
.expired-links {
  padding-left: 10px;
  padding-right: 10px;
  border: 2px solid #f3af2e;
  box-sizing: border-box;
  border-radius: 8px;
  background-color: #f8f2a0;
  color: #f3af2e;
}
</style>

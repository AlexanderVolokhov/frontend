<template>
  <main-layout>
    <b-overlay
      :show="loading"
      rounded="sm"
    >
      <b-row>
        <b-col
          cols="auto"
          class="mr-auto"
        >
          <h2 class="flex-grow-1 d-block">
            {{ reportName }}
          </h2>
        </b-col>
        <b-col cols="auto">
          <b-button @click="openInOldUI()">
            Open in old UI
          </b-button>
                &nbsp;
          <b-button @click="openJSON()">
            Open JSON report
          </b-button>
        </b-col>
      </b-row>

      <hr>

      <!-- Filters //-->
      <b-form-group
        label="Filters"
        label-cols-sm="2"
        label-size="lg"
        label-class="font-weight-bold pt-0"
        class="mb-0"
      >
        <b-form-row>
          <b-col>
            <b-form-group
              id="locale-filter"
              label="Locale"
              label-for="locale-filter-select"
              label-cols-sm="auto"
              label-size="sm"
              label-align-sm="right"
            >
              <b-form-select
                id="locale-filter-select"
                v-model="localeFilter"
                :options="locales"
                size="sm"
              >
                <template #first>
                  <b-form-select-option :value="null">
                    All
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              id="product-filter"
              label="Product"
              label-for="product-filter-select"
              label-cols-sm="auto"
              label-size="sm"
              label-align-sm="right"
            >
              <b-form-select
                id="product-filter-select"
                v-model="productFilter"
                :options="products"
                size="sm"
              >
                <template #first>
                  <b-form-select-option :value="null">
                    All
                  </b-form-select-option>
                </template>
              </b-form-select>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              id="status-filter"
              label="Status"
              label-for="status-filter-select"
              label-cols-sm="auto"
              label-size="sm"
              label-align-sm="right"
            >
              <b-form-select
                id="status-filter-select"
                v-model="statusFilter"
                size="sm"
              >
                <option :value="null">
                  All
                </option>
                <option value="passed">
                  Passed
                </option>
                <option value="warning">
                  Warning
                </option>
                <option value="failed">
                  Failed
                </option>
              </b-form-select>
            </b-form-group>
          </b-col>
          <b-col cols="auto">
            <b-button
              size="sm"
              @click="resetFilters"
            >
              Reset
            </b-button>
          </b-col>
        </b-form-row>
      </b-form-group>

      <!-- Sorting //-->
      <b-form-group
        label="Sorting"
        label-cols-sm="2"
        label-size="lg"
        label-class="font-weight-bold pt-0"
        class="mb-0"
      >
        <b-form-row>
          <b-col>
            <b-form-group
              id="sort-by"
              label="Sort By"
              label-for="sort-by-select"
              label-cols-sm="auto"
              label-size="sm"
              label-align-sm="right"
            >
              <b-input-group size="sm">
                <b-form-select
                  id="sort-by-select"
                  v-model="sortBy"
                  class="w-75"
                >
                  <option
                    value="issues"
                    selected
                  >
                    Issues
                  </option>
                  <option value="locale">
                    Locale
                  </option>
                </b-form-select>
                <b-form-select
                  v-model="sortDesc"
                  :disabled="!sortBy"
                  size="sm"
                  class="w-25"
                >
                  <option :value="false">
                    Asc
                  </option>
                  <option
                    :value="true"
                    selected
                  >
                    Desc
                  </option>
                </b-form-select>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-form-row>
      </b-form-group>

      <b-row>
        <b-col
          cols="auto"
          class="mr-auto"
        />
        <b-col cols="auto">
          <b-button
            size="sm"
            @click="expandAll = !expandAll"
          >
            {{ expandAll ? "Collapse" : "Expand" }} All
          </b-button>
        </b-col>
      </b-row>

      <!-- Email list //-->
      <b-row class="mt-2">
        <b-col
          class="accordion"
          role="tablist"
        >
          <b-card
            v-for="email in sortedFilteredEmails"
            :key="email.email_id"
            no-body
            bg-variant="light"
          >
            <b-card-header
              header-tag="header"
              class="p-0"
              role="tab"
            >
              <b-button
                v-b-toggle="`email-details-${email.email_id}`"
                block
                tag="div"
                :variant="getEmailVariant(email)"
                class="email-btn d-flex"
              >
                <div class="mr-1">
                  <b-icon-chevron-right class="btn-chevron" />
                </div>
                <div class="flex-grow-1">
                  [{{ email.locale.value }}] {{ email.email_subject.value }}
                </div>
                <div>
                  <span v-if="email.issue_count.errors > 0"><b-icon icon="x-circle-fill" />&nbsp;{{ email.issue_count.errors }}</span>&nbsp;
                  <span v-if="email.issue_count.warnings > 0"><b-icon icon="exclamation-triangle-fill" />&nbsp;{{ email.issue_count.warnings }}</span>
                </div>
              </b-button>
            </b-card-header>
            <b-collapse
              :id="`email-details-${email.email_id}`"
              :ref="`email-details-${email.email_id}`"
              role="tabpanel"
              :visible="expandAll"
            >
              <b-card-body>
                <email-detail-view :email="email" />
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card
            v-if="sortedFilteredEmails.length === 0"
            no-body
            class="mb-1"
          >
            <b-card-header
              header-tag="header"
              class="p-1 text-center"
              role="tab"
            >
              No results
            </b-card-header>
          </b-card>
        </b-col>
      </b-row>
    </b-overlay>
  </main-layout>
</template>

<script>
import MainLayout from "./../MainLayout.vue"
import EmailDetailView from "./EmailDetailView.vue"
import { createNamespacedHelpers } from "vuex"
import Lazy from "lazy.js"
import { reportJsonUrl } from "../../helpers/api"

const { mapState, mapActions } = createNamespacedHelpers("report")

export default {
    name: "ReportViewComponent",
    components: {
        MainLayout,
        EmailDetailView,
    },
    data() {
        return {
            localeFilter: null,
            productFilter: null,
            statusFilter: null,
            sortBy: "issues",
            sortDesc: true,
            expandAll: false
        }
    },
    computed: {
        sortedFilteredEmails() {
            const filterEmails = (email) => {
                const checkLocale = (email) => this.localeFilter === null || email.locale.value === this.localeFilter
                const checkProduct = (email) => this.productFilter === null
                                            || Lazy(email.cart_links)
                                                .contains(this.productFilter,
                                                    (link, filter) => link.product.value === filter)
                const checkStatus = (email) => this.statusFilter === null
                        || (this.statusFilter === "passed" && email.issue_count.errors === 0 && email.issue_count.warnings === 0)
                        || (this.statusFilter === "warning" && email.issue_count.warnings > 0)
                        || (this.statusFilter === "failed" && email.issue_count.errors > 0)

                return checkLocale(email) && checkProduct(email) && checkStatus(email)
            }

            const sortEmails = (e1, e2) => {
                const sortByLocale = (e1, e2, desc) => {
                    if (e1.locale.value < e2.locale.value) {
                        return desc ? 1 : -1
                    } else if (e1.locale.value === e2.locale.value) {
                        return 0
                    } else {
                        return desc ? -1 : 1
                    }
                }

                if (this.sortBy === "issues") {
                    if (e1.issue_count.errors > e2.issue_count.errors) {
                        return this.sortDesc ? -1 : 1
                    } else if (e1.issue_count.errors === e2.issue_count.errors) {
                        if (e1.issue_count.warnings > e2.issue_count.warnings) {
                            return this.sortDesc ? -1  : 1
                        } else if (e1.issue_count.warnings === e2.issue_count.warnings)  {
                            return sortByLocale(e1, e2, false)
                        } else {
                            return this.sortDesc ? 1 : -1
                        }
                    } else {
                        return this.sortDesc ? 1 : -1
                    }
                } else if (this.sortBy === "locale") {
                    return sortByLocale(e1, e2, this.sortDesc)
                }
            }

            return Lazy(this.emails)
                .filter(filterEmails)
                .sort(sortEmails)
                .toArray()
        },

        ...mapState(["loading", "reportName", "reportType", "emails", "locales", "products", "error"])
    },
    watch: {
        error(newError, oldError) {
            if (newError && newError !== oldError) {
                this.$bvToast.toast(newError, {
                    title: "Failed to load report",
                    variant: "danger",
                    solid: true
                })
            }
        }
    },
    created() {
        this.loadReport({ reportType: this.$route.params.reportType, reportName: this.$route.params.report })
        document.title = `${this.$route.params.report} | Mailchecker`
    },
    methods: {
        ...mapActions(["loadReport"]),
        openJSON() {
            window.open(reportJsonUrl(this.reportType, this.reportName), "_blank").focus()
        },
        openInOldUI () {
            this.$router.replace(`/v1/report/${this.reportType}/${this.reportName}`)
        },
        getEmailVariant(email){
            if (email.issue_count.errors > 0) {
                return "danger"
            } else if (email.issue_count.warnings > 0) {
                return "warning"
            } else {
                return "success"
            }
        },
        resetFilters() {
            this.localeFilter = null
            this.productFilter = null
            this.statusFilter = null
        },
    }
}
</script>

<style scoped>
.email-btn {
    text-align: left;
}
.card-header .collapsed .btn-chevron {
    transition: transform 0.35s ease;
}
.card-header .not-collapsed .btn-chevron {
    transform: rotate(90deg);
    /* 0.35s should be in sync with the bootstrap animation of b-collapse expanding/collapsing */
    transition: transform 0.35s ease;
}
</style>

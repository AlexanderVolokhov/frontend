<template>
  <div>
    <b-row>
      <b-col
        cols="auto"
        class="mr-auto"
      />
      <b-col
        cols="auto"
        class="mr-5"
      >
        <b-button
          size="sm"
          @click="showAllDetails = !showAllDetails"
        >
          Toggle All Details
        </b-button>
      </b-col>
    </b-row>
    <b-table
      :items="cptLinks"
      :fields="fields"
      primary-key="internal_id"
      small
      hover
      :sort-by="'link_id'"
      class="links-table mt-2"
    >
      <template #cell(details)="row">
        <b-button
          size="sm"
          class="mr-2"
          @click="row.toggleDetails"
        >
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
          <b-icon-x-circle-fill
            v-if="countIssuesInLinkDetails(row.item, 'error') > 0"
            variant="danger"
            class="pl-1"
          />
          <b-icon-exclamation-triangle-fill
            v-if="countIssuesInLinkDetails(row.item, 'warning') > 0"
            variant="warning"
            class="pl-1"
          />
        </b-button>
      </template>

      <template #cell()="data">
        <template v-if="typeof(data.value) === 'object'">
          {{ data.value.value }}
          <issue-popover
            :target="`${data.field.key}_${data.item.internal_id}`"
            :attribute="data.value"
          />
        </template>
        <template v-else>
          {{ data.value }}
        </template>
      </template>

      <template #row-details="row">
        <b-table-simple
          small
          borderless
          class="data-table"
        >
          <b-tr
            :id="`from_link-${row.item.internal_id}`"
            :variant="getAttributeVariant(row.item.from_link)"
          >
            <th>To link:</th>
            <td>
              <a
                :href="`${row.item.from_link.value}`"
                target="_blank"
                class="long-link"
              >{{ row.item.from_link.value }}</a>
            </td>
          </b-tr>
          <issue-popover
            :target="`from_link-${row.item.internal_id}`"
            :attribute="row.item.from_link"
          />

          <b-tr
            :id="`to_link-${row.item.internal_id}`"
            :variant="getAttributeVariant(row.item.to_link)"
          >
            <th>Final link:</th>
            <td>
              <a
                :href="`${ row.item.to_link.value }`"
                target="_blank"
                class="long-link"
              >{{ row.item.to_link.value }}</a>
            </td>
          </b-tr>
          <issue-popover
            :target="`to_link-${row.item.internal_id}`"
            :attribute="row.item.to_link"
          />
        </b-table-simple>
      </template>
    </b-table>
  </div>
</template>

<script>

import { getAttributeVariant, countIssuesInLinkDetails } from "./lib/attribute.js"
import { createNamespacedHelpers } from "vuex"
import IssuePopover from "./IssuePopover.vue"

const { mapState } = createNamespacedHelpers("report")

export default {
    inherit: true,
    name: "EmailLinksView",
    components: {
        IssuePopover
    },
    props: {
        email: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            showAllDetails: false,

            fields: [
                { key: "link_id", label: "ID", sortable: true, tdClass: "link-data" },
                { key: "title", label: "Title", sortable: true, tdClass: "link-data", tdAttr: this.tdAttr },
                { key: "title_translation", label: "Translated Title", sortable: true, tdClass: "link-data", tdAttr: this.tdAttr },
                { key: "status_code", label: "Code", thClass: "text-center", sortable: true, tdClass: "link-data", tdAttr: this.tdAttr },
                { key: "details", label: "Details", thClass: "text-center", tdClass: "text-center link-data" }
            ]
        }
    },
    computed: {
        cptLinks() {
            return this.email.links.map((item) => {
                return {
                    _cellVariants: {
                        "title": this.getAttributeVariant(item.title),
                        "title_translation": this.getAttributeVariant(item.title),
                        "status_code": this.getAttributeVariant(item.status_code),
                    },
                    _showDetails: this.showAllDetails,
                    ...item
                }
            })
        },
        ...mapState(["reportName"])
    },
    methods: {
        getAttributeVariant,
        countIssuesInLinkDetails,
        tdAttr: function(value, key, item) {
            return { id: `${key}_${item.internal_id}` }
        }

    }
}
</script>

<style>
td.link-data {
    vertical-align: middle;
}
</style>

<style scoped>
.long-link {
    word-wrap: break-word;
    word-break: break-all;
}
.b-table-sticky-header {
    max-height: 90vh;
    min-height: 50vh;
}
</style>

<template>
  <b-col id="imagestabTable">
    <b-card
      v-for="image in uniqueImages"
      :key="image.image_id"
    >
      <b-row no-gutters>
        <b-col
          md="4"
          class="image-preview"
        >
          <b-card-img :src="image.url" />
        </b-col>
        <b-col md="8">
          <b-card-body>
            <b-card-text>
              <b-table
                :items="imageData(image.image_id)"
                :fields="fields"
                primary-key="global_image_id"
                small
                hover
                sticky-header
                @row-hovered="onRowHovered"
                @row-unhovered="onRowUnhovered"
              />
              <issue-tooltip
                v-if="currentIssues.length > 0"
                :target="tooltipTarget"
                triggers="manual"
                :issues="currentIssues"
              />
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </b-col>
</template>

<script>
import IssueTooltip from "./IssueTooltip.vue"

export default {
    inherit: true,
    name: "ImagesTabTable",
    components: {
        IssueTooltip
    },
    props: {
        data: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            fields: [
                { key: "locale", label: "Locale" },
                { key: "alt", label: "Alt" },
                { key: "alt_en", label: "Alt (en)" },
                { key: "title", label: "Title"},
                { key: "title_en", label: "Title (en)"},
                { key: "size", label: "Size (Kb)"}
            ],
            currentIssues: [],
            tooltipTarget: null
        }
    },
    computed: {
        uniqueImages () {
            if (this.data.length > 0) {
                return this.data[0].images
            } else {
                return []
            }
        }
    },
    methods: {
        imageData (image_id) {
            return this.data.map(email => {
                const image = email.images.find(image => image.image_id === image_id)
                return Object.assign(
                    {},
                    image,
                    {
                        locale: email.locale,
                        global_image_id: email.email_id + image_id,
                        _cellVariants: {
                            "alt": this.getStringVariant(image.alt),
                            "alt_en": this.getStringVariant(image.alt_en),
                            "title": this.getStringVariant(image.title),
                            "title_en": this.getStringVariant(image.title_en),
                            "size": this.getSizeVariant(image.size),
                        },
                        _rowVariant: this.getRowVariant(image)
                    }
                )
            })
        },
        getStringVariant (str) {
            if (!str) {
                return "danger"
            } else {
                return ""
            }
        },
        getSizeVariant(size) {
            if (!size || size > 1000) {
                return "danger"
            } else if (size > 600) {
                return "warning"
            }
            return ""
        },
        getRowVariant(image) {
            const warns = image.issues.reduce((acc, issue) => {
                return acc + (issue.type === "warning" ? 1 : 0)
            }, 0)
            const errors = image.issues.length - warns

            return errors > 0 ? "danger" : warns > 0 ? "warning" : ""
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
<style scoped>
div.image-preview {
    padding: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
div.image-preview > img {
    max-width: fit-content;
}
</style>
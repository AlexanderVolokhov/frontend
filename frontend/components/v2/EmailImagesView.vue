<template>
  <b-col id="imagestabTable">
    <b-card
      v-for="image in email.images"
      :key="image.image_id"
    >
      <b-row no-gutters>
        <b-col
          md="4"
          class="image-preview"
        >
          <b-card-img :src="image.url.value" />
        </b-col>
        <b-col md="8">
          <b-card-body>
            <b-card-text>
              <b-table-simple
                small
                borderless
                class="data-table"
              >
                <tr>
                  <th>ID:</th>
                  <td>{{ image.image_id }}</td>
                </tr>
                <b-tr
                  :id="`title-${email.email_id}-${image.image_id}`"
                  :variant="getAttributeVariant(image.title)"
                >
                  <th>Title:</th>
                  <td>
                    {{ image.title.value }}<br>
                    <span
                      v-if="image.title.value"
                      class="text-secondary"
                    >en_us:</span>
                    {{ image.title_en.value }}
                  </td>
                </b-tr>
                <issue-popover
                  :target="`title-${email.email_id}-${image.image_id}`"
                  :attribute="image.title"
                />
                <b-tr
                  :id="`alt-${email.email_id}-${image.image_id}`"
                  :variant="getAttributeVariant(image.alt)"
                >
                  <th>Alt:</th>
                  <td>
                    {{ image.alt.value }}<br>
                    <span
                      v-if="image.alt.value"
                      class="text-secondary"
                    >en_us:</span>
                    {{ image.alt_en.value }}
                  </td>
                </b-tr>
                <issue-popover
                  :target="`alt-${email.email_id}-${image.image_id}`"
                  :attribute="image.alt"
                />
              </b-table-simple>
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </b-col>
</template>

<script>
import { getAttributeVariant } from "./lib/attribute.js"
import IssuePopover from "./IssuePopover.vue"

export default {
    name: "EmailImagesView",
    components: {
        IssuePopover
    },
    props: {
        email: {
            type: Object,
            required: true,
        },
    },
    computed: {},
    methods: {
        getAttributeVariant
    },
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
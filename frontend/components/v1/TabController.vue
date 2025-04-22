<template>
  <b-container fluid>
    <b-row
      v-if="translatedLinks"
      class="mb-3"
    >
      <b-col
        cols="4"
        offset="4"
      >
        <b-input-group class="justify-content-md-center">
          <template #prepend>
            <b-input-group-text>Translation Filter</b-input-group-text>
          </template>
          <b-form-select
            id="form-select"
            v-model="linkFilter"
            :options="cptTranslatedLinks"
          />
          <b-input-group-append>
            <b-button
              id="clear-filter"
              :class="filter === null ? 'disabled' : ''"
              @click="clearFilter()"
            >
              Clear filter
            </b-button>
            <b-button
              id="filter-404"
              :class="[is404FilterEnabled(), is404Active()]"
              @click="filter404()"
            >
              404
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="1">
        <b-button-group vertical>
          <b-button
            variant="secondary"
            :class="isActive(null)"
            @click="setLocaleFilter(null)"
          >
            All <b-badge pill>
              {{ locales.length }}
            </b-badge>
          </b-button>
          <b-button
            v-for="locale in locales"
            :key="locale"
            variant="secondary"
            class="target-locale"
            :class="isActive(locale)"
            @click="setLocaleFilter(locale)"
          >
            {{ locale }}
          </b-button>
        </b-button-group>
      </b-col>
      <b-col cols="11">
        <slot />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
    name: "TabController",
    props: {
        translatedLinks: {
            type: Array,
            required: true
        },
        locales: {
            type: Array,
            required: true
        },
        filter: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            linkFilter: ""
        }
    },
    computed: {
        cptTranslatedLinks() {
            let l = this.translatedLinks
            l.unshift({ text: "--- None ---", value: null })
            return l
        }
    },
    watch: {
        linkFilter: function(newFilter) {
            this.setLinkFilter(newFilter)
        }
    },
    methods: {
        isActive (locale) {
            return this.filter.locale === locale ? "active" : ""
        },
        is404Active () {
            return this.filter.err404 ? "active" : ""
        },
        is404FilterEnabled () {
            return this.filter.err404 ? "" : "disabled"
        },

        clearFilter () {
            this.$emit("update:filter", {locale: null, err404: false, linkTranslation: null})
            this.linkFilter = null
        },
        setLocaleFilter (locale) {
            this.$emit("update:filter", {locale: locale, err404: this.filter.err404, linkTranslation: this.filter.linkTranslation})
            this.updateRoute(locale)
        },
        filter404 () {
            this.$emit("update:filter", {locale: this.filter.locale, err404: true, linkTranslation: this.filter.linkTranslation})
        },
        setLinkFilter(linkFilter) {
            this.$emit("update:filter", {locale: this.filter.locale, err404: this.filter.err404, linkTranslation: linkFilter})
        },
        updateRoute(hash) {
            if (hash && this.filter.locale !== hash) {
                this.$router.replace({ hash: hash , query: this.$route.query })
            }
        },
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/custom.scss";

.active {
    background-color: $mc-purple !important;
}
</style>

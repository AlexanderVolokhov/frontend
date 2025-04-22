<template>
  <b-popover
    ref="popover"
    placement="auto"
    triggers="hover"
    :disabled="errors.length === 0 && warnings.length === 0"
    :target="target"
  >
    <template #title>
      Discovered Issues
    </template>

    <ul class="issue-list">
      <li
        v-for="error in errors"
        :key="error.title"
        class="d-flex"
      >
        <b-icon-x-circle-fill
          variant="danger"
          class="icon"
        />
        <span>{{ error.title }}</span>
      </li>
      <li
        v-for="warning in warnings"
        :key="warning.title"
        class="d-flex"
      >
        <b-icon-exclamation-triangle-fill
          variant="warning"
          class="icon"
        />
        <span>{{ warning.title }}</span>
      </li>
    </ul>
  </b-popover>
</template>

<script>
import Lazy from "lazy.js"

export default {
    name: "IssuesPopover",
    props: {
        attribute: {
            type: Object,
            required: true
        },
        target: {
            type: Object,
            required: true
        }
    },
    computed: {
        errors: function() { return Lazy(this.attribute.issues).filter(issue => issue.type === "error").toArray() },
        warnings: function() { return Lazy(this.attribute.issues).filter(issue => issue.type === "warning").toArray() }
    }
}
</script>

<style lang="sass">
.popover.b-popover
    max-width: 450px
</style>

<style lang="sass" scoped>
.issue-list
    list-style: none
    padding-left: 1em


    span
        display: inline-block
        padding-left: 1em

    .icon
        align-self: center
        margin-left: -1em
</style>
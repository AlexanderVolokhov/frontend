<template>
  <b-tooltip
    triggers="hover"
    :target="target"
    show
    style="max-width: 500px;"
    placement="left"
  >
    <table class="tooltip-table">
      <tr
        v-for="issue in issues"
        :key="issue.title"
      >
        <td>
          <b-icon
            v-if="issue.type==='warning'"
            icon="exclamation-triangle-fill"
            variant="warning"
          />
          <b-icon
            v-if="issue.type==='error'"
            icon="x-circle-fill"
            variant="danger"
          />
        </td>
        <td class="text">
          {{ issue.title }}
        </td>
      </tr>
    </table>
  </b-tooltip>
</template>

<script>

export default {
    inherit: true,
    name: "IssueTooltip",
    inheritAttrs: true,
    props: {
        issues: {
            type: Array,
            required: true
        },
        target: {
            type: [HTMLElement, Object, String],
            required: true
        }
    }
}
</script>

<style>
.tooltip>.tooltip-inner {
    max-width: 500px;
}
.tooltip-table {
    margin: 5px;
}
.tooltip-table td {
    text-align: left;
}
.tooltip-table td.text {
    padding-left: 10px;
}
</style>
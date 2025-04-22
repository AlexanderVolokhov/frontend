<template>
  <b-row v-if="errors.length > 0 || warnings.length > 0">
    <b-col>
      <h3 class="small-heading">
        Detected issues
      </h3>
      <ul class="issue-list">
        <li
          v-for="issue in errors"
          :key="issue.id"
        >
          <b-icon-x-circle-fill variant="danger" /> {{ issue.text }}
          <b-badge
            v-if="issue.count > 1"
            pill
          >
            {{ issue.count }}
          </b-badge>
        </li>
      </ul>
      <ul class="issue-list">
        <li
          v-for="issue in warnings"
          :key="issue.id"
        >
          <b-icon-exclamation-triangle-fill variant="warning" /> {{ issue.text }}
          <b-badge
            v-if="issue.count > 1"
            pill
          >
            {{ issue.count }}
          </b-badge>
        </li>
      </ul>
    </b-col>
  </b-row>
</template>

<script>
import Lazy from "lazy.js"

export default {
    name: "EmailIssueList",
    components: {

    },
    props: {
        email: {
            type: Object,
            required: true
        }
    },
    data() {
        return {

        }
    },
    computed: {
        errors() {
            return this.listIssues("error")
        },
        warnings() {
            return this.listIssues("warning")
        }
    },
    methods: {
        listIssues(issueType) {
            var issues = []
            var issueId = 0
            const traverseObject = obj => {
                if (obj === null || obj === undefined) {
                    return
                }
                Object.entries(obj).forEach(([key, value]) => {
                    if ((key === "issues") && (typeof(value) === "object")) {
                        value.forEach(issue => {
                            if (issue.type === issueType) {
                                let existing = Lazy(issues).find((val) => val.text === issue.title)
                                if (existing !== undefined) {
                                    existing.count += 1
                                } else {
                                    issueId += 1
                                    issues.push({ id: `${issueType}${issueId}`, text: issue.title, count: 1 })
                                }
                            }
                        })
                    } else if (typeof(value) === "object") {
                        traverseObject(value)
                    }
                })
            }
            traverseObject(this.email)
            return issues
        },
    }
}
</script>

<style scoped>
.issue-list {
    list-style: none;
}
.small-heading {
    font-size: 1.2rem;
    font-weight: bold;
}
</style>
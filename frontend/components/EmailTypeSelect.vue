<template>
  <b-form-select
    v-model="selection"
    :options="emailTypes"
  />
</template>

<script>
export default {
    name: "EmailTypeSelect",
    props: {
        value: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            selection: this.value
        }
    },
    computed: {
        emailTypes() {
            let options = [
                { value: "campaign", text: "Campaign Emails" },
                { value: "transaction", text: "Transaction Emails" }
            ]
            if (process.env.NODE_ENV !== "production") {
                options.push({ value: "TESTING_EMAILS", text: "Testing Emails" })
            }
            return options
        }
    },
    watch: {
        value() {
            this.selection = this.value
        },
        selection(newValue) {
            this.$emit("input", newValue)
        }
    }
}
</script>


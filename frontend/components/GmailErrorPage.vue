<template>
  <main-layout>
    <b-row>
      <b-col />
      <b-col cols="10">
        <b-jumbotron>
          <template #header>
            <b-icon
              icon="x-circle-fill"
              variant="danger"
            /> {{ header_text }}
          </template>
          <template #lead>
            {{ error_description }}
          </template>

          <hr>

          <b-button
            variant="primary"
            @click="$router.go(-1)"
          >
            Go back
          </b-button>
        </b-jumbotron>
      </b-col>
      <b-col />
    </b-row>
  </main-layout>
</template>

<script>
import MainLayout from "./MainLayout"

export default {
    name: "GmailErrorPage",
    components: {
        MainLayout,
    },
    data() {
        return {
            code:0
        }
    },
    computed: {
        header_text() {
            switch (parseInt(this.code)){
            case 404:
                return "Email not found."
            case 408:
                return "Request timeout."
            default:
                return `Gmail error ${this.code}.`
            }
        },
        error_description() {
            switch (parseInt(this.code)){
            case 404:
                return "The email no longer exists in the Gmail account."
            case 408:
                return "Timeout while talking to Gmail. Please try again later."
            default:
                return "Please contact MailChecker admins."
            }
        }
    },
    created() {
        this.code = this.$route.params.code
    }
}
</script>

<style>
.jumbotron h1.display-3 {
    font-size: 2.5rem;
}
</style>
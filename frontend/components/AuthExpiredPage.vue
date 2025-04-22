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
            /> Authentication Expired!
          </template>
          <template #lead>
            MailChecker has been signed out of Google account, so it cannot interact with Gmail. Click the button
            bellow to sign into Mailchecker Google account. Afterwards you will be redirected back to MailChecker.
          </template>

          <hr>

          <b-button
            variant="primary"
            href="/api/gmail/auth"
          >
            Login with Google
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
    name: "AuthExpired",
    components: {
        MainLayout,
    }
}
</script>

<style>
.jumbotron h1.display-3 {
    font-size: 2.5rem;
}
</style>

<template>
  <div>
    <b-navbar
      sticky
      type="dark"
    >
      <b-navbar-brand to="/">
        <img
          src="/img/mailchecker_64x64.png"
          alt="MailChecker"
          title="MailChecker"
          class="d-inline-block logo"
        >
        MailChecker
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-nav-item-dropdown 
            text="FAQ" 
            class="mr-sm-3" 
            right
          >
            <b-dropdown-item 
              href="https://confluence-act.corp.nortonlifelock.com/display/CNS/How+to+use+MailChecker+-+QA"
              target="_blank"
            >
              User documentation
            </b-dropdown-item>
            <b-dropdown-item 
              href="/tech-docs"
              target="_blank"
            >
              Technical documentation
            </b-dropdown-item>
            <b-dropdown-item
              :href="axios.defaults.baseURL + 'api'"
              target="_blank"
            >
              Swagger API documentation
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-button
            v-b-modal.config-modal
            size="sm"
            class="my-2 my-sm-0"
            type="button"
          >
            <b-icon
              icon="gear-fill"
              aria-hidden="true"
            /> Settings
          </b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>
    <b-container fluid>
      <b-row class="m-3">
        <b-col>
          <slot />
        </b-col>
      </b-row>
    </b-container>
    <config-dialog id="config-modal" />
  </div>
</template>

<script>
import ConfigDialog from "./ConfigDialog.vue"
export default {
    name: "MainLayout",
    components: {ConfigDialog},
}
</script>

<style lang="scss" scoped>
@import "../assets/custom.scss";

.navbar {
    background-color: $mc-purple;
}

.logo {
    margin-right: 1rem;
    transition: 0.8s ease-in-out;
}

.logo:hover {
    transform: rotateY(180deg);
    transform-style: preserve-3d;
    transition: 0.8s ease-in-out;
}
</style>

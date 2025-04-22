<template>
  <main-layout>
    <b-container class="wrapper">
      <b-row
        align-v="center"
        class="wrapper"
      >
        <b-col align-self="center">
          <p>Sorry, the page you are looking for does not exist.</p>
          <div class="circle">
            <img
              src="/assets/img/404.png"
              alt="404"
              class="image-error"
            >
          </div>
        </b-col>
      </b-row>
    </b-container>
  </main-layout>
</template>

<script>
import MainLayout from "./MainLayout"

export default {
    name: "NotFound",
    components: {
        MainLayout,
    }
}
</script>

<style scoped>
.image-error {
    opacity: 0.9;
    border-radius: 20%;
}

.wrapper {
    height: 100%;
    background-color: white;
}
</style>

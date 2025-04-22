<template>
  <b-modal
    id="config-modal"
    title="MailChecker Configuration"
    :ok-disabled="!enableControls"
    @ok="handleOK"
    @show="handleShow"
  >
    <form
      ref="form"
      @submit.stop.prevent="handleSubmit"
    >
      <b-form-checkbox
        id="enable-autosync"
        v-model="enableAutosync"
        name="enable-autosync"
        switch
        :disabled="!enableControls"
      >
        AutoSync {{ enableAutosync ? "Enabled" : "Disabled" }}
      </b-form-checkbox>
      <b-form-checkbox
        id="enable-autoarchive"
        v-model="enableAutoarchive"
        name="enable-autoarchive"
        switch
        :disabled="!enableControls"
      >
        AutoArchive {{ enableAutoarchive ? "Enabled" : "Disabled" }}
      </b-form-checkbox>
    </form>
  </b-modal>
</template>

<script>
export default {
    name: "CongigDialog",
    data(){
        return {
            enableAutosync: false,
            enableAutoarchive: false,
            enableControls: false
        }
    },
    methods: {
        handleShow(){
            this.enableControls = false
            this.axios.get("/api/config").then((response)=>{
                this.enableAutosync = response.data.enableAutosync
                this.enableAutoarchive = response.data.enableAutoarchive
                this.enableControls = true
            })
        },
        handleOK(event){
            event.preventDefault()
            this.handleSubmit()
        },
        handleSubmit(){
            this.axios.post("/api/config", {
                enableAutosync: this.enableAutosync,
                enableAutoarchive: this.enableAutoarchive
            }).then(() => {
                this.$bvToast.toast("Configuration has been saved", { variant: "success", solid: true })
            }).catch((error) => {
                this.$bvToast.toast(`Server has replied: ${error}`, {
                    title: "Failed to save configuration",
                    variant: "danger",
                    solid: true
                })
            })
            this.$nextTick(() => {
                this.$bvModal.hide("config-modal")
            })
        },

    }
}
</script>

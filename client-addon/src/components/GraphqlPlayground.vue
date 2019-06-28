<template>
  <div class="graphql-playground">
    <div v-if="error" class="not-running vue-ui-empty">
      <VueIcon class="huge" icon="error"/>
      <div>An error occured</div>
    </div>

    <div v-else-if="!running" class="not-running vue-ui-empty">
      <VueIcon class="huge" icon="cloud_off"/>
      <div>GraphQL server not running</div>
    </div>

    <div v-else-if="!ready" class="not-running vue-ui-empty">
      <VueLoadingIndicator
        class="accent big"
      />
      <div>Starting server...</div>
    </div>

    <div v-else class="iframe-container">
      <iframe
        ref="iframe"
        class="iframe"
        :src="urls.playground"
      />
    </div>
  </div>
</template>

<script>
function wait (time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export default {
  sharedData () {
    return mapSharedData('org.akryum.vue-apollo.', {
      urls: 'urls',
      error: 'error',
      running: 'running',
    })
  },

  data () {
    return {
      ready: false,
    }
  },

  watch: {
    urls: {
      handler: 'checkForPlayground',
      immediate: true,
      deep: true,
    },
    error (value) {
      if (!value) {
        this.checkForPlayground()
      }
    },
    running (value) {
      if (value) {
        this.checkForPlayground()
      }
    },
  },

  methods: {
    async checkForPlayground () {
      if (this.$_checking) return
      this.$_checking = true
      window._vm = this
      if (this.urls) {
        for (let t = 10; t > 0; t--) {
          try {
            const response = await fetch(this.urls.playground, {
              headers: {
                accept: 'text/html',
              },
            })
            if (response.ok) {
              this.ready = true
              break
            }
          } catch (e) {}

          await wait(300)
        }
      } else {
        this.ready = false
      }
      this.$_checking = false
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.graphql-playground
  height 100%
  overflow hidden

.iframe-container
  height 100%
  border-radius $br
  background rgba($vue-ui-color-primary, .4)
  padding 4px
  box-sizing border-box

.iframe
  width 100%
  height 100%
  border none

.not-running
  margin-top 42px
  font-size 18px

.vue-ui-loading-indicator
  margin-bottom $padding-item
</style>

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
      <VueIcon class="huge" icon="refresh"/>
      <div>Readying playground...</div>
    </div>

    <template v-else>
      <iframe class="iframe" :src="urls.playground"/>
    </template>
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
    return mapSharedData('vue-apollo-', {
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
      window._vm = this
      if (this.urls) {
        for (let t = 10; t > 0; t--) {
          try {
            const response = await fetch(this.urls.playground)
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
    },
  },
}
</script>

<style lang="stylus" scoped>
.graphql-playground
  height 100%
  overflow hidden

.iframe
  width 100%
  height 100%
  border none

.not-running
  margin-top 42px
  font-size 18px
</style>

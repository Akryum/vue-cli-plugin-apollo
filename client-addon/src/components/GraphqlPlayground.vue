<template>
  <div class="graphql-playground">
    <div v-if="!urls" class="not-running vue-ui-empty">
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
    })
  },

  data () {
    return {
      ready: false,
    }
  },

  watch: {
    '$data.$sharedData.urls': {
      async handler (data) {
        window._vm = this
        if (data) {
          for (let t = 10; t > 0; t--) {
            const response = await fetch(data.playground)
            if (response.ok) {
              this.ready = true
              break
            } else {
              await wait(300)
            }
          }
        } else {
          this.ready = false
        }
      },
      immediate: true,
      deep: true,
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

<template>
  <div class="graphql-playground">
    <div v-if="!urls" class="not-running vue-ui-empty">
      <VueIcon class="huge" icon="cloud_off"/>
      <div>GraphQL server not running</div>
    </div>

    <template v-else>
      <iframe class="iframe" :src="urls.playground"/>
    </template>
  </div>
</template>

<script>
export default {
  sharedData () {
    return mapSharedData('vue-apollo-', {
      urls: 'urls',
    })
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

<template>
  <div class="engine-key-metrics-query">
    <div class="id">{{ id }}</div>
    <div class="name">{{ query.name }}</div>
    <div class="metric">
      <span class="value">{{ formatNumber(query.value) }}</span>
      <span class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script>
import { formatNumber } from '../../utils/math'

export default {
  props: {
    query: {
      type: Object,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },
  },

  computed: {
    id () {
      return this.query.id.substr(0, 4)
    },
  },

  methods: {
    formatNumber,
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.engine-key-metrics-query
  display flex
  align-items baseline
  padding ($padding-item / 2) 0
  font-size 14px

.id
  font-family monospace
  font-size .8em
  margin-right $padding-item
  opacity .7

.metric
  flex 1
  text-align right

.unit
  opacity .6
  margin-left 4px
</style>

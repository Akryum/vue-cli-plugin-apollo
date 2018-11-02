<template>
  <div class="engine-key-metrics-view">
    <div class="top">
      <div class="infos">
        <div class="title">{{ title }}</div>

        <div class="main-stat">
          <span class="value">{{ number(mainStat.value) }}</span>
          <span class="unit">{{ unit }}</span>
        </div>

        <div class="secondary-infos">
          <div class="caption">{{ timeRangeLabel}} median</div>
        </div>
      </div>

      <SimpleGraph
        :points="points"
        class="main-graph"
      />
    </div>
  </div>
</template>

<script>
import SimpleGraph from '../SimpleGraph.vue'

export default {
  components: {
    SimpleGraph,
  },

  inject: [
    'widget',
  ],

  props: {
    title: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    mainStat: {
      type: Object,
      required: true,
    },

    points: {
      type: Array,
      required: true,
    },
  },

  computed: {
    timeRangeLabel () {
      return ({
        3600: '1h',
        86400: '24h',
        [86400 * 7]: '1 week',
        [86400 * 30]: '1 month',
      })[this.widget.data.config.timeRange]
    },
  },

  methods: {
    round (value) {
      return Math.round(value * 1000) / 1000
    },

    number (value) {
      if (Number.isNaN(value) || value == null) return 0
      let result = value
      const units = ['B', 'M', 'k']
      const l = units.length
      for (let i = 0; i < l; i++) {
        const j = l - i
        if (result > 1000 ** j) {
          result /= 1000 ** j
          return `${this.round(result)}${units[i]}`
        }
      }
      return this.round(result)
    }
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.top
  display flex
  height 120px

.title
  font-size 18px

.main-stat
  .value
    font-size 24px
    font-weight lighter
    color $vue-ui-color-accent
  .unit
    opacity .6
    margin-left 4px

.secondary-infos
  font-size 11px
  opacity .5

.main-graph
  flex 1
  height 100%
  margin-left $padding-item
</style>

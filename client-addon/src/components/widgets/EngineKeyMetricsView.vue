<template>
  <div class="engine-key-metrics-view">
    <div class="top">
      <div class="infos">
        <div class="title">{{ title }}</div>

        <div class="main-stat">
          <span class="value">{{ formatNumber(mainStat.value) }}</span>
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

    <div class="queries">
      <div class="title">{{ queriesTitle }}</div>
      <Queries
        v-if="widget.data.height >= 2"
        :queries="queries"
        :unit="unit"
      />
    </div>
  </div>
</template>

<script>
import SimpleGraph from '../SimpleGraph.vue'
import Queries from './EngineKeyMetricsQueries.vue'

import { formatNumber } from '../../utils/math'

export default {
  components: {
    SimpleGraph,
    Queries,
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

    queriesTitle: {
      type: String,
      required: true,
    },

    queries: {
      type: Array,
      required: true,
    },

    rawData: {
      type: Object,
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
    formatNumber,
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.top
  display flex
  height 120px

.infos
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

.queries
  margin-top ($padding-item * 2)
  .title
    margin-bottom ($padding-item / 2)
    opacity .7
</style>

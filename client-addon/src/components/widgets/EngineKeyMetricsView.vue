<template>
  <div
    class="engine-key-metrics-view"
    :class="{
      'small-width': widget.data.width === 2,
      'small-height': widget.data.height === 1,
      'show-queries': showQueries,
    }"
  >
    <div class="top">
      <div class="infos">
        <div class="title">{{ title }}</div>

        <div
          class="main-stat"
          v-tooltip="`${timeRangeLabel} median`"
        >
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
        :queries="queries"
        :unit="unit"
      />
    </div>

    <div class="floating-actions">
      <VueButton
        :icon-left="showQueries ? 'expand_less' : 'expand_more'"
        class="icon-button round primary"
        @click="showQueries = !showQueries"
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

  data () {
    return {
      showQueries: false,
    }
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

.floating-actions
  position absolute
  left 0
  bottom 0
  width 100%
  display flex
  box-center()
  padding 4px
  opacity 0
  &:hover
    opacity 1

.engine-key-metrics-view
  position relative

  &.small-width
    .top
      flex-direction column
    
    .infos
      display flex
      .title
        flex 1
    
    .secondary-infos
      display none

    .main-graph
      height auto
      margin-left 0

  &:not(.small-height)
    .floating-actions
      display none

  &.small-height
    .top,
    .queries
      transition opacity .15s, transform .15s

    .queries
      margin-top 12px
      .title
        display none

    &.show-queries
      .floating-actions
        bottom auto
        top 0

      .top,
      .queries
        transform translateY(-100%)

      .top
        opacity 0
</style>

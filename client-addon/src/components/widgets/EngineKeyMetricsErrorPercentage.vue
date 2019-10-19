<script>
import { median } from 'd3'

import EngineKeyMetricsView from './EngineKeyMetricsView.vue'

export default {
  inject: [
    'widget',
  ],

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  computed: {
    stats () {
      return this.data.service.stats
    },

    points () {
      return this.stats.globalStats.map(
        stat => ({
          value: this.getErrorRate(stat.metrics),
        })
      )
    },

    median () {
      return median(this.points.map(p => p.value))
    },

    queries () {
      return this.stats.queriesStats.map(
        stat => ({
          id: stat.group.queryId,
          name: stat.group.queryName,
          signature: stat.group.querySignature,
          value: this.getErrorRate(stat.metrics),
        })
      )
    },
  },

  methods: {
    getErrorRate (metrics) {
      if (metrics.requestsWithErrorsCount === 0) return 0
      return metrics.requestsWithErrorsCount /  
        (metrics.uncachedRequestsCount +
        metrics.cachedRequestsCount)
    },
  },

  render (h) {
    return <EngineKeyMetricsView
      title="Error Percentage"
      unit="%"
      mainStat={{
        value: this.median,
      }}
      points={this.points}
      queriesTitle="Highest Error Percentage"
      queries={this.queries}
      rawData={this.data}
    />
  }
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

$color = $vue-ui-color-danger

.engine-key-metrics-view
  /deep/
    .main-stat
      .value
        color $color
    .simple-graph
      .path
        stroke $color
</style>

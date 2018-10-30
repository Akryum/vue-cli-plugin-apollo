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

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
          value: stat.metrics.totalLatencyHistogram.p95Time,
        })
      )
    },

    median () {
      return median(this.points.map(p => p.value))
    },
  },

  render (h) {
    return <EngineKeyMetricsView
      title="p95 Service Time"
      unit="ms"
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

$color = $vue-ui-color-warning

.engine-key-metrics-view
  /deep/
    .main-stat
      .value
        color $color
    .simple-graph
      .path
        stroke $color
</style>

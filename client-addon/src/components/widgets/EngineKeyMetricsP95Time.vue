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

    queries () {
      return this.stats.queriesStats.map(
        stat => ({
          id: stat.group.queryId,
          name: stat.group.queryName,
          signature: stat.group.querySignature,
          value: stat.metrics.totalLatencyHistogram.p95Time,
        })
      ).sort((a, b) => b.value - a.value)
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
      queriesTitle="Slowest p95 Service Time"
      queries={this.queries}
      rawData={this.data}
    />
  },
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

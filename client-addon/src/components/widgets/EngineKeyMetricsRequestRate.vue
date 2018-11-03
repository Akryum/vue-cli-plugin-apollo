<script>
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

    totalCount () {
      let sum = 0
      for (const stat of this.stats.globalStats) {
        sum += stat.metrics.uncachedRequestsCount +
          stat.metrics.cachedRequestsCount
      }
      return sum
    },

    timeRatio () {
      return 60 / this.widget.data.config.timeRange
    },

    median () {
      return this.totalCount * this.timeRatio
    },

    points () {
      return this.stats.globalStats.map(
        stat => ({
          value: stat.metrics.uncachedRequestsCount +
            stat.metrics.cachedRequestsCount,
        })
      )
    },

    queries () {
      return this.stats.queriesStats.map(
        stat => ({
          id: stat.group.queryId,
          name: stat.group.queryName,
          value: (stat.metrics.uncachedRequestsCount +
            stat.metrics.cachedRequestsCount) * this.timeRatio,
        })
      )
    },
  },

  render (h) {
    return <EngineKeyMetricsView
      title="Request Rate"
      unit="rpm"
      mainStat={{
        value: this.median,
      }}
      points={this.points}
      queriesTitle="Highest Request Rate"
      queries={this.queries}
      rawData={this.data}
    />
  }
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

</style>

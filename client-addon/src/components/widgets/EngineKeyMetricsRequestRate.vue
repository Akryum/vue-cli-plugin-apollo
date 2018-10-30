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
  },

  render (h) {
    return <EngineKeyMetricsView
      title="Request Rate"
      unit="rpm"
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

</style>

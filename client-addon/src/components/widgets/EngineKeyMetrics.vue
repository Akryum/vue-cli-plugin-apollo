<template>
  <div class="engine-key-metrics">
    <div class="content">
      <VueLoadingBar
        v-if="loading"
        class="ghost primary"
        unknown
      />

      <div
        v-if="error"
        class="error vue-ui-empty"
      >
        <VueIcon icon="error" class="huge"/>
        <div>An error occured while fetching metrics</div>
      </div>
      
      <component
        v-else-if="data"
        :is="component"
        :data="data"
        class="engine-key-metrics-view"
      />
    </div>
  </div>
</template>

<script>
import RequestRate from './EngineKeyMetricsRequestRate.vue'
import P95Time from './EngineKeyMetricsP95Time.vue'
import ErrorPercentage from './EngineKeyMetricsErrorPercentage.vue'

const COMPONENTS = {
  requestRate: RequestRate,
  p95Time: P95Time,
  errorPercentage: ErrorPercentage,
}

export default {
  inject: [
    'widget'
  ],

  data () {
    return {
      loading: false,
      error: null,
      data: null,
    }
  },

  computed: {
    component () {
      return COMPONENTS[this.widget.data.config.type]
    }
  },

  watch: {
    'widget.data.config': {
      handler: 'fetchMetrics',
      immediate: true,
    },
  },

  created () {
    this.widget.addHeaderAction({
      id: 'refresh',
      icon: 'refresh',
      tooltip: 'Refresh',
      disabled: () => this.loading,
      onCalled: () => {
        this.fetchMetrics()
      }
    })

    this.widget.addHeaderAction({
      id: 'open-engine',
      icon: 'open_in_new',
      tooltip: 'Open Apollo Engine',
      onCalled: () => {
        window.open(`https://engine.apollographql.com/service/${this.widget.data.config.service}/metrics`, '_blank')
      }
    })
  },

  methods: {
    async fetchMetrics () {
      this.loading = true
      this.error = false

      try {
        const { results, errors } = await this.$callPluginAction('org.akryum.vue-apollo.widgets.actions.query-engine', {
          ...this.widget.data.config,
        })
        if (errors.length && errors[0]) throw new Error(errors[0])
        this.data = results[0]

        this.widget.customTitle = `Apollo Engine (${this.data.service.name})`
      } catch (e) {
        this.error = true
        console.error(e)
      }

      this.loading = false
    }
  },
}
</script>

<style lang="stylus" scoped>
@import '~@vue/cli-ui/src/style/imports'

.vue-ui-loading-bar
  opacity .5

.content,
.engine-key-metrics-view
  height 100%

.engine-key-metrics-view
  padding ($padding-item / 2) $padding-item
  box-sizing border-box
</style>

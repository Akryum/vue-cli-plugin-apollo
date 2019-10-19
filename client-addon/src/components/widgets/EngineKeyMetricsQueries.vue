<template>
  <div class="engine-key-metrics-queries">
    <div v-if="!queries.length" class="vue-ui-empty">
      No queries to display
    </div>
    <template v-else>
      <Query
        v-for="(query, index) of queries"
        :key="index"
        :query="query"
        :unit="unit"
      />
    </template>
  </div>
</template>

<script>
import Query from './EngineKeyMetricsQuery.vue'

export default {
  components: {
    Query,
  },

  props: {
    queries: {
      type: Array,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },
  },
}
</script>

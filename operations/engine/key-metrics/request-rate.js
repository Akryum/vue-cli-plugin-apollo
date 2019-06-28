const gql = require('graphql-tag')

module.exports = gql`
query requestRateKeyMetrics(
  $serviceId: ID!
  $timeFrom: Timestamp!
  $timeTo: Timestamp
  $resolution: Resolution
  $filter: ServiceQueryStatsFilter
) {
  service(id: $serviceId) {
    id
    name
    stats(from: $timeFrom, to: $timeTo, resolution: $resolution) {
      globalStats: queryStats(
        filter: $filter
      ) {
        timestamp
        metrics {
          uncachedRequestsCount
          cachedRequestsCount
        }
      }
      queriesStats: queryStats(
        limit: 4
        orderBy: [{ column: UNCACHED_REQUESTS_COUNT, direction: DESCENDING }]
        filter: $filter
      ) {
        timestamp
        group: groupBy {
          queryId
          queryName
          querySignature
        }
        metrics {
          uncachedRequestsCount
          cachedRequestsCount
        }
      }
    }
  }
}
`

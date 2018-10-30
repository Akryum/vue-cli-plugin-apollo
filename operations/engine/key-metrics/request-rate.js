const gql = require('graphql-tag')

module.exports = gql`
query requestRateKeyMetrics(
  $serviceId: ID!
  $timeFrom: Timestamp!
  $timeTo: Timestamp
  $resolution: Resolution
) {
  service(id: $serviceId) {
    id
    name
    stats(from: $timeFrom, to: $timeTo, resolution: $resolution) {
      globalStats: queryStats {
        timestamp
        metrics {
          uncachedRequestsCount
          cachedRequestsCount
        }
      }
      queriesStats: queryStats(
        limit: 4
        orderBy: [{ column: UNCACHED_REQUESTS_COUNT, direction: DESCENDING }]
      ) {
        timestamp
        group: groupBy {
          queryId
          queryName
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

const gql = require('graphql-tag')

module.exports = gql`
query errorPercentageKeyMetrics(
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
          cachedRequestsCount
          uncachedRequestsCount
          requestsWithErrorsCount
        }
      }
      queriesStats: queryStats(
        limit: 4
        orderBy: [{ column: REQUESTS_WITH_ERRORS_COUNT, direction: DESCENDING }]
        filter: $filter
      ) {
        timestamp
        group: groupBy {
          queryId
          queryName
          querySignature
        }
        metrics {
          cachedRequestsCount
          uncachedRequestsCount
          requestsWithErrorsCount
        }
      }
    }
  }
}
`

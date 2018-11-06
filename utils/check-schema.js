module.exports = async ({ endpoint, key, engineEndpoint }) => {
  const execa = require('execa')
  const { logWithSpinner, stopSpinner, done } = require('@vue/cli-shared-utils')

  logWithSpinner('📡', `Comparing schema from Engine...`)
  await execa('apollo', [
    'schema:check',
    `--endpoint=${endpoint}`,
    `--key=${key}`,
    ...(engineEndpoint ? [`--engine=${engineEndpoint}`] : []),
  ], {
    stdio: ['inherit', 'inherit', 'inherit'],
  })
  stopSpinner()
  done('Checked schema on Engine')
}

module.exports = async ({ endpoint, key, tag, engineEndpoint }) => {
  const execa = require('execa')
  const { logWithSpinner, stopSpinner, done } = require('@vue/cli-shared-utils')

  logWithSpinner('📡', `Comparing schema from Engine...`)
  await execa('apollo', [
    'client:check',
    `--endpoint=${endpoint}`,
    `--key=${key}`,
    ...(tag ? [`--tag=${tag}`] : []),
    ...(engineEndpoint ? [`--engine=${engineEndpoint}`] : []),
  ], {
    stdio: ['inherit', 'inherit', 'inherit'],
  })
  stopSpinner()
  done('Checked schema on Engine')
}

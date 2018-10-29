module.exports = async ({ endpoint, key, engineEndpoint }) => {
  const execa = require('execa')
  const { logWithSpinner, stopSpinner, done } = require('@vue/cli-shared-utils')

  logWithSpinner('⬆️', `Publishing schema to Engine...`)
  await execa('apollo', [
    'schema:publish',
    `--endpoint=${endpoint}`,
    `--key=${key}`,
    ...(engineEndpoint ? [`--engine=${engineEndpoint}`] : []),
  ], {
    stdio: ['inherit', 'inherit', 'inherit'],
  })
  stopSpinner()
  done('Published schema to Engine')
}

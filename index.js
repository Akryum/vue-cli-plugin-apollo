module.exports = (api, options) => {
  const useThreads = process.env.NODE_ENV === 'production' && options.parallel
  const cacheDirectory = api.resolve('node_modules/.cache/cache-loader')

  api.chainWebpack(webpackConfig => {
    const rule = webpackConfig.module
      .rule('gql')
      .test(/\.(gql|graphql)$/)
      .include
      .add(api.resolve('src'))
      .add(api.resolve('test'))
      .end()
      .use('cache-loader')
      .loader('cache-loader')
      .options({ cacheDirectory })
      .end()

    if (useThreads) {
      rule
        .use('thread-loader')
        .loader('thread-loader')
    }

    rule
      .use('gql-loader')
      .loader('graphql-tag/loader')
      .end()
  })

  api.registerCommand('graphql-api', args => {
    const execa = require('execa')
    const nodemonBinPath = require.resolve('nodemon/bin/nodemon')

    const argv = [
      'graphql-api/index.js',
      '--ignore',
      'graphql-api/live/',
    ]

    return new Promise((resolve, reject) => {
      const child = execa(nodemonBinPath, argv, {
        cwd: api.resolve('.'),
        stdio: 'inherit',
      })
      child.on('error', reject)
      child.on('exit', () => {
        resolve()
      })
    })
  })
}

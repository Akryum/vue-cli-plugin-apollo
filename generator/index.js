module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    dependencies: {
      'apollo-cache-inmemory': '^1.0.0',
      'apollo-client': '^2.0.1',
      'apollo-engine': '^0.8.9',
      'apollo-link': '^1.0.0',
      'apollo-link-context': '^1.0.5',
      'apollo-link-http': '^1.0.0',
      'apollo-upload-client': '^7.0.0-alpha.4',
      'apollo-link-persisted-queries': '^0.1.0',
      'apollo-link-ws': '^1.0.0',
      'apollo-utilities': '^1.0.1',
      'graphql': '^0.13.0',
      'graphql-yoga': '^1.2.5',
      'lowdb': '^1.0.0',
      'mkdirp': '^0.5.1',
      'shortid': '^2.2.8',
      'subscriptions-transport-ws': '^0.9.5',
      'vue-apollo': '^3.0.0-alpha.1',
    },
    devDependencies: {
      'graphql-tag': '^2.5.0',
    },
    scripts: {
      'graphql-api': 'vue-cli-service graphql-api',
    },
  })

  api.render('./template')

  // api.postProcessFiles(files => {
  //   const file = files['src/main.ts']
  //     ? 'src/main.ts'
  //     : 'src/main.js'
  //   const main = files[file]
  //   console.log(file, main)
  //   if (main) {
  //     const lines = main.split(/\r?\n/g).reverse()

  //     // Inject import
  //     const lastImportIndex = lines.findIndex(line => line.match(/^import/))
  //     lines[lastImportIndex] += `\nimport { apolloProvider } from './vue-apollo'`

  //     // Modify app
  //     const appIndex = lines.findIndex(line => line.match(/new Vue/))
  //     lines[appIndex] += `\n  provide: apolloProvider.provide(),`

  //     files[file] = lines.reverse().join('\n')
  //   }
  // })

  api.onCreateComplete(() => {
    // Modify main.js

    const fs = require('fs')

    const tsPath = api.resolve('./src/main.ts')
    const jsPath = api.resolve('./src/main.js')

    const mainPath = fs.existsSync(tsPath) ? tsPath : jsPath
    let main = fs.readFileSync(mainPath, { encoding: 'utf8' })

    const lines = main.split(/\r?\n/g).reverse()

    // Inject import
    const lastImportIndex = lines.findIndex(line => line.match(/^import/))
    lines[lastImportIndex] += `\nimport { apolloProvider } from './vue-apollo'`

    // Modify app
    const appIndex = lines.findIndex(line => line.match(/new Vue/))
    lines[appIndex] += `\n  provide: apolloProvider.provide(),`

    main = lines.reverse().join('\n')
    fs.writeFileSync(mainPath, main, { encoding: 'utf8' })
  })
}

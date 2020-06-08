// eslint-disable-next-line no-global-assign
require = require('esm')(module)

module.exports = function (options) {
  if (options.typescript) require('ts-node/register/transpile-only')

  return {
    load,
  }
}

function load (file) {
  const module = require(file)
  if (module.default) {
    return module.default
  }
  return module
}

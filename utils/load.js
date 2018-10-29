// eslint-disable-next-line no-global-assign
require = require('esm')(module)

exports.load = function (file) {
  const module = require(file)
  if (module.default) {
    return module.default
  }
  return module
}

function autoCall (fn, ...context) {
  if (typeof fn === 'function') {
    return fn(...context)
  }
  return fn
}

module.exports = {
  autoCall,
}

export function round (value) {
  return Math.round(value * 1000) / 1000
}

export function formatNumber (value) {
  if (Number.isNaN(value) || value == null) return 0
  let result = value
  const units = ['B', 'M', 'k']
  const l = units.length
  for (let i = 0; i < l; i++) {
    const j = l - i
    if (result > 1000 ** j) {
      result /= 1000 ** j
      return `${round(result)}${units[i]}`
    }
  }
  return round(result)
}
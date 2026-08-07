import { MAC_SPEC_CONFIGS } from '../src/data/macSpecRules.js'

const issues = []

for (const [id, config] of Object.entries(MAC_SPEC_CONFIGS)) {
  for (const group of config.groups) {
    const values = group.options.map(option => option.value)
    const uniqueValues = new Set(values)
    const baseValue = config.baseSpec[group.key]

    if (!uniqueValues.has(baseValue)) {
      issues.push(`${id}: base ${group.key}=${baseValue} is not selectable`)
    }
    if (uniqueValues.size !== values.length) {
      issues.push(`${id}: ${group.key} has duplicate selectable values`)
    }

    for (const value of values) {
      if (value === baseValue) continue
      if (!config.addons?.[group.key]?.[value]) {
        issues.push(`${id}: ${group.key}=${value} has no price adjustment`)
      }
    }
  }
}

if (issues.length) {
  console.error(issues.join('\n'))
  process.exit(1)
}

console.log(`Validated ${Object.keys(MAC_SPEC_CONFIGS).length} Mac spec configurations.`)

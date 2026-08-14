import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(rootDir, 'src', 'data', 'mockData.js'), 'utf8')

const inconsistentWatchSeNames = source.match(/name:\s*'Apple Watch SE 第\d+代'/g) || []
if (inconsistentWatchSeNames.length > 0) {
  throw new Error(`Apple Watch SE 型號必須使用數字世代格式：${inconsistentWatchSeNames.join(', ')}`)
}

console.log('[validate-product-naming] Apple Watch SE naming is consistent.')

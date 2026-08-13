import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const month = new Date().toISOString().slice(0, 7)
const changedPaths = ['src/data/marketAdjustments.json', `data/monthly-price-changelog/${month}.json`]

function run(command, args) {
  execFileSync(command, args, { cwd: rootDir, stdio: 'inherit' })
}

run('npm', ['run', 'price:update:monthly'])

const status = execFileSync('git', ['status', '--porcelain', '--', ...changedPaths], {
  cwd: rootDir,
  encoding: 'utf8',
})

if (!status.trim()) {
  console.log('[monthly-price-publish] No new monthly adjustment to publish.')
  process.exit(0)
}

run('git', ['add', ...changedPaths])
run('git', ['commit', '-m', `Update monthly market prices for ${month}`])
run('git', ['push', 'https://github.com/klland/apple-community-dashboard.git', 'HEAD:master'])
run('npm', ['run', 'deploy'])

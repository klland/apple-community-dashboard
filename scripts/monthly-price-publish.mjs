import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(command, args) {
  execFileSync(command, args, { cwd: rootDir, stdio: 'inherit' })
}

run('npm', ['run', 'price:update:monthly'])
console.log('Review proposal only. Automatic price publishing is disabled until source evidence is approved.')

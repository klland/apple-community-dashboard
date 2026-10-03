import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../src/lib/supabase.js', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/import\.meta\.env\.\w+/g, '"test"')
  .replace(/\bexport /g, '')

async function run(rpcError, insertError = null) {
  const calls = []
  const storage = new Map()
  const client = {
    rpc: async () => { calls.push('rpc'); return { error: rpcError } },
    from: () => ({ insert: async () => { calls.push('insert'); return { error: insertError } } }),
  }
  const context = vm.createContext({
    createClient: () => client,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    crypto: { randomUUID: () => 'test-device-identifier' },
  })
  vm.runInContext(source + ';this.submit = submitTransaction;', context)
  let error
  try { await context.submit({ source: 'report', model: 'Test', storage: '256G', price: 10000 }) }
  catch (e) { error = e }
  return { calls, error, storage }
}

assert.deepEqual((await run(null)).calls, ['rpc'])
const legacy = await run({ code: 'PGRST202' })
assert.deepEqual(legacy.calls, ['rpc', 'insert'])
assert(!legacy.error)
assert(legacy.storage.has('submitted_transaction_reports'))
const duplicate = await run({ code: 'P0001', message: 'duplicate' })
assert.deepEqual(duplicate.calls, ['rpc'], 'never bypass database duplicate or permission errors')
assert(duplicate.error)
const denied = await run({ code: 'PGRST202' }, { message: 'insert denied' })
assert(denied.error)
assert(!denied.storage.has('submitted_transaction_reports'))
console.log('Report submission passed: migrated RPC, legacy fallback, duplicate enforcement, insert failure.')

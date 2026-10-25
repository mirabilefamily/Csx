// README coverage check (Q-34): node scripts/check-readme.mjs
// Fails if any /src/api export, /src/components file, /src/pages file or /src/types type is missing from README.md.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const readme = readFileSync(join(root, 'README.md'), 'utf8')
const src = join(root, 'src')
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const missing = []

// API: every export of every api module, checked as `<namespace>.<name>` (namespaces from api/index.ts).
const index = readFileSync(join(src, 'api/index.ts'), 'utf8')
const ns = Object.fromEntries([...index.matchAll(/export \* as (\w+) from '\.\/(\w+)'/g)].map((m) => [m[2], m[1]]))
let apiCount = 0
for (const file of readdirSync(join(src, 'api'))) {
  if (file === 'index.ts') continue
  const mod = file.replace('.ts', '')
  const prefix = ns[mod] ?? mod
  const text = readFileSync(join(src, 'api', file), 'utf8')
  for (const m of text.matchAll(/^export (?:async )?(?:function|const|class) (\w+)/gm)) {
    apiCount++
    if (!readme.includes(`${prefix}.${m[1]}`)) missing.push(`api: ${prefix}.${m[1]} (${file})`)
  }
}

// Components and pages: every file path must be listed.
const files = [...walk(join(src, 'components')), ...walk(join(src, 'pages'))].map((f) => relative(src, f))
for (const f of files) if (!readme.includes(f)) missing.push(`file: ${f}`)

// Types: every exported interface/type must be named in backticks.
const types = [...readFileSync(join(src, 'types/index.ts'), 'utf8').matchAll(/^export (?:interface|type) (\w+)/gm)].map((m) => m[1])
for (const t of types) if (!readme.includes(`\`${t}\``) && !readme.includes(`\`${t}<`)) missing.push(`type: ${t}`)

console.log(`Checked ${apiCount} api exports, ${files.length} component/page files, ${types.length} types.`)
if (missing.length) {
  console.log(`MISSING (${missing.length}):\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
console.log('README coverage: 0 missing.')

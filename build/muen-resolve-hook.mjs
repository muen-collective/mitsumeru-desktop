// Resolve @muen/* packages from the app bundle's node_modules.
// The cordis internal ESM loader resolves bare specifiers from its own
// file location, which is inside the app bundle. The @muen packages
// are also in the app bundle's node_modules but the internal loader's
// resolution doesn't find them. This hook intercepts bare @muen/*
// specifiers and resolves them to the correct file paths.
//
// Layout (electron-builder, asar: false):
//   Resources/
//     muen-resolve-hook.mjs   ← this file (extraResource)
//     app/
//       node_modules/          ← where @muen packages live
//       out/
//       package.json
//
// So: dirname(this) / ../app/node_modules

import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { existsSync } from 'node:fs'

const SELF_DIR = dirname(fileURLToPath(import.meta.url))

// Try the electron-builder layout first (Resources/app/node_modules),
// then fall back to the two-level-up path for non-bundled environments.
const CANDIDATES = [
  join(SELF_DIR, 'app', 'node_modules'),
  join(SELF_DIR, '..', 'node_modules'),
]

const APP_NODE_MODULES = CANDIDATES.find(p => existsSync(p)) ?? CANDIDATES[0]

const PKG_CACHE = new Map()

function resolvePackage(name) {
  if (PKG_CACHE.has(name)) return PKG_CACHE.get(name)
  try {
    const pkgPath = join(APP_NODE_MODULES, name, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    const entry = pkg.exports?.['.']?.default || pkg.exports?.['.'] || pkg.main || 'index.js'
    const resolved = pathToFileURL(join(APP_NODE_MODULES, name, entry)).href
    PKG_CACHE.set(name, resolved)
    return resolved
  } catch {
    PKG_CACHE.set(name, null)
    return null
  }
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@muen/')) {
    const resolved = resolvePackage(specifier)
    if (resolved) return { url: resolved, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}

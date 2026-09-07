#!/usr/bin/env node
/**
 * One-shot installer for the @muen/mitsu-sidebar fork as a DSH desktop
 * "generation" plugin — the same mechanism dsh-market uses for community
 * plugins. Stages the swap for the NEXT cold start; never mutates the running
 * session (a new generation + desired-pointer + manifest update only).
 *
 * Usage:
 *   node tools/mitsu-sidebar-install.mjs [--home <dshHome>] [--no-publish]
 *
 * Overrides (CLI wins over env):
 *   --home / DSH_HOME          harness home (default: ~/Library/Application
 *                              Support/dsh-desktop-dev/harness)
 *   --source / MITSU_SOURCE_DIR  fork package dir (default: ../../mitsu-sidebar)
 *   MITSU_INSTALL_NODE         node binary (default: process.execPath)
 *   MITSU_INSTALL_PNPM         pnpm.cjs entry (default: Mitsumeru Dev.app
 *                              Contents/Resources/app/node_modules/pnpm/bin/pnpm.cjs)
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installGeneration } from '../generations/installer.mjs'
import {
  disableGeneration,
  isGenerationPlugin,
  listGenerations,
  readDesired,
  withRegistryLock,
  writeDesired
} from '../generations/registry.mjs'
import { publishGenerationManifest } from '../generations/projection.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const pick = (flag) => {
  const at = args.indexOf(flag)
  return at === -1 ? undefined : args[at + 1]
}

const home =
  pick('--home') ??
  process.env.DSH_HOME ??
  join(homedir(), 'Library', 'Application Support', 'dsh-desktop-dev', 'harness')
const sourceDirectory = resolve(
  pick('--source') ?? process.env.MITSU_SOURCE_DIR ?? join(here, '..', '..', 'mitsu-sidebar')
)
const nodeExecutablePath = process.env.MITSU_INSTALL_NODE ?? process.execPath
const pnpmEntryPath =
  process.env.MITSU_INSTALL_PNPM ??
  '/Applications/Mitsumeru Dev.app/Contents/Resources/app/node_modules/pnpm/bin/pnpm.cjs'
const publish = !args.includes('--no-publish')
const EXPECTED = '@muen/mitsu-sidebar'
const UPSTREAM = 'dsh-better-sidebar'

for (const [label, path] of [
  ['fork source', sourceDirectory],
  ['pnpm entry', pnpmEntryPath]
]) {
  if (!existsSync(path)) {
    console.error(`missing ${label}: ${path}`)
    process.exit(2)
  }
}

console.log(`home:   ${home}`)
console.log(`source: ${sourceDirectory}`)
console.log(`node:   ${nodeExecutablePath}`)
console.log(`pnpm:   ${pnpmEntryPath}`)

try {
  await withRegistryLock(home, async () => {
    const trace = (line) => console.log(`gen-install | ${line}`)
    const install = await installGeneration({
      dshHome: home,
      expectedPluginName: EXPECTED,
      pluginSpec: `file:${sourceDirectory}`,
      sourceDirectory,
      sourceSpec: `file:${sourceDirectory}`,
      nodeExecutablePath,
      pnpmEntryPath,
      spawnProcess: spawn,
      environment: process.env,
      onTrace: trace,
      onOutput: (chunk) => process.stdout.write(chunk)
    })
    if (!install.ok) {
      console.error(`install failed: ${install.detail}`)
      process.exit(1)
    }
    const { generation } = install
    console.log(`generation: ${generation.id} (${generation.version})`)
    console.log(`directory:  ${generation.directory}`)

    const [desired, generations] = await Promise.all([readDesired(home), listGenerations(home)])
    const byId = new Map(generations.map((g) => [g.id, g]))
    const kept = desired.filter((id) => byId.get(id)?.pluginName !== EXPECTED)
    const next = [...kept, generation.id]
    await writeDesired(home, next)
    console.log(`desired: ${JSON.stringify(next)}`)

    if (await isGenerationPlugin(home, UPSTREAM)) {
      const removed = await disableGeneration(home, UPSTREAM)
      console.log(
        `upstream ${UPSTREAM}: ${removed ? 'removed from desired' : 'already not desired (disabled)'}`
      )
    }

    if (publish) {
      const published = await publishGenerationManifest(home, 'web', { syncBundles: true })
      console.log(`bundles: ${JSON.stringify(published.bundles)}`)
    }
    console.log(
      'OK — staged for the next cold start. Quit Mitsumeru Dev, then relaunch to boot the fork.'
    )
  })
} catch (error) {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))
  process.exit(1)
}

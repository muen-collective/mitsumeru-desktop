import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(import.meta.dirname, '..')

const releaseAssets = [
  'dsh-desktop-mac-arm64.dmg',
  'dsh-desktop-mac-x64.dmg',
  'dsh-desktop-windows-x64-setup.exe'
]

describe('GitHub release contract', () => {
  it('keeps the package and lockfile versions aligned', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { version: string }
    const packageLock = JSON.parse(
      await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8')
    ) as { version: string; packages: Record<string, { version?: string }> }

    expect(packageLock.version).toBe(packageJson.version)
    expect(packageLock.packages['']?.version).toBe(packageJson.version)
  })

  it('declares required DSH peer packages as production dependencies', async () => {
    const packageLock = JSON.parse(
      await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8')
    ) as {
      packages: Record<string, { dev?: boolean; peer?: boolean }>
    }

    // A lock location is a path, so nested installs read as
    // `node_modules/<host>/node_modules/<name>`. Only the segment after the
    // last `node_modules/` names the package: without that, a third-party peer
    // that npm nested under a DSH package (rc.8 gives ui-trajectory its own
    // React 19) reads as a DSH package and trips this guard.
    const packageNameOf = (location: string): string =>
      location.slice(location.lastIndexOf('node_modules/') + 'node_modules/'.length)

    const peerOnlyRuntimePackages = Object.entries(packageLock.packages)
      .filter(
        ([location, metadata]) =>
          packageNameOf(location).startsWith('@deepseek-ai/') &&
          metadata.peer === true &&
          metadata.dev !== true
      )
      .map(([location]) => packageNameOf(location))

    expect(peerOnlyRuntimePackages).toEqual([])
  })

  it('vendors upstream-new closure packages as file: production deps with no registry resolution', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> }
    const packageLockRaw = await readFile(
      path.join(projectRoot, 'package-lock.json'),
      'utf8'
    )
    const packageLock = JSON.parse(packageLockRaw) as {
      packages: Record<string, { resolved?: string }>
    }

    // alpha.3 introduced these as transitive deps of shipped packages; they must
    // resolve from the vendored tarballs, not registry.npmmirror.com.
    const promotedClosurePackages = [
      '@deepseek-ai/dsh-client-ui-schedule',
      '@deepseek-ai/dsh-deque',
      '@deepseek-ai/dsh-session-turn-outline',
      '@deepseek-ai/dsh-util-time',
      '@deepseek-ai/dsh-util-values'
    ]

    for (const packageName of promotedClosurePackages) {
      expect(packageJson.dependencies[packageName]).toMatch(
        /^file:packages\/harness-0\.1\.2-rc\.1\/npm-dsh\/.+\.tgz$/
      )
      expect(packageLock.packages[`node_modules/${packageName}`]?.resolved).toMatch(
        /^file:packages\/harness-0\.1\.2-rc\.1\/npm-dsh\//
      )
    }

    // No @deepseek-ai/dsh-* package may resolve from a remote registry URL.
    expect(packageLockRaw).not.toMatch(
      /"resolved":\s*"https?:\/\/[^"]*deepseek-ai[/-]dsh/
    )
  })

  it('does not promote optional Harness providers and test support into the desktop runtime', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> }
    const packageLock = JSON.parse(
      await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8')
    ) as { packages: Record<string, unknown> }

    const excludedHarnessPackages = [
      '@deepseek-ai/cordis-plugin-logger-console',
      '@deepseek-ai/dsh-agent-loop-testkit',
      '@deepseek-ai/dsh-client-test-runtime',
      '@deepseek-ai/dsh-client-web',
      // upstream 0.1.2-rc.1 moved this to packages/experimental/ (out of the
      // dsh family tarball set); desktop continues not to bundle it.
      '@deepseek-ai/dsh-code-runtime-python',
      '@deepseek-ai/dsh-e2b',
      '@deepseek-ai/dsh-fs-e2b',
      '@deepseek-ai/dsh-llm-mock-server',
      '@deepseek-ai/dsh-llm-replay',
      '@deepseek-ai/dsh-loader-smoke',
      '@deepseek-ai/dsh-lsp',
      '@deepseek-ai/dsh-lsp-stdio',
      '@deepseek-ai/dsh-sdk-client',
      // NOTE: @deepseek-ai/dsh-session-persistence-sqlite was removed upstream in
      // 0.1.2-alpha.3, so its exclusion assertion is gone. dsh-storage-sqlite is
      // likewise no longer in the closure but its guard is kept defensively.
      '@deepseek-ai/dsh-session-snapshot',
      '@deepseek-ai/dsh-session-title-all-prompts-llm',
      '@deepseek-ai/dsh-storage-sqlite',
      '@deepseek-ai/dsh-subagent-acp',
      '@deepseek-ai/dsh-subagent-claude-code',
      '@deepseek-ai/dsh-subagent-codex',
      '@deepseek-ai/dsh-subagent-dsh-sdk',
      '@deepseek-ai/dsh-subprocess-e2b',
      '@deepseek-ai/dsh-tool-lsp',
      '@deepseek-ai/dsh-tool-session-query',
      '@deepseek-ai/dsh-tool-terminal',
      '@deepseek-ai/dsh-web-search-exa',
      '@deepseek-ai/dsh-web-search-perplexity'
    ]

    for (const packageName of excludedHarnessPackages) {
      expect(packageJson.dependencies[packageName]).toBeUndefined()
      expect(packageLock.packages[`node_modules/${packageName}`]).toBeUndefined()
    }
    expect(packageLock.packages['node_modules/@anthropic-ai/claude-agent-sdk']).toBeUndefined()
    expect(packageLock.packages['node_modules/@openai/codex']).toBeUndefined()
  })

  it('uses stable platform-specific artifact names', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as {
      build: {
        artifactName: string
        extraResources: Array<{ from: string; to: string }>
        win: { target: Array<{ target: string; arch: string[] }> }
        nsis: { artifactName: string; include: string }
        portable?: unknown
      }
    }
    const harnessNodeEntry = await readFile(
      path.join(projectRoot, 'build', 'harness-node-entry.mjs'),
      'utf8'
    )
    const windowsHiddenConsole = await readFile(
      path.join(projectRoot, 'build', 'windows-hidden-console.mjs'),
      'utf8'
    )

    expect(packageJson.build.artifactName).toBe('dsh-desktop-${os}-${arch}.${ext}')
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/app-icon.png',
      to: 'icon.png'
    })
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/windows-hidden-console.mjs',
      to: 'windows-hidden-console.mjs'
    })
    expect(harnessNodeEntry).toContain("await import('./windows-hidden-console.mjs')")
    expect(windowsHiddenConsole).toContain('export function createHiddenConsole')
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/windows-child-process-hide.mjs',
      to: 'windows-child-process-hide.mjs'
    })
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/splash.html',
      to: 'splash.html'
    })
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/dsh-loader.gif',
      to: 'dsh-loader.gif'
    })
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/dsh-loader-dark.gif',
      to: 'dsh-loader-dark.gif'
    })
    expect(packageJson.build.extraResources).toContainEqual({
      from: 'build/dsh-desktop.patch.yml',
      to: 'dsh-desktop.patch.yml'
    })
    expect(packageJson.build.nsis.artifactName).toBe(
      'dsh-desktop-windows-${arch}-setup.${ext}'
    )
    expect(packageJson.build.nsis.include).toBe('build/installer.nsh')
    expect(packageJson.build.win.target).toEqual([{ target: 'nsis', arch: ['x64'] }])
    expect(packageJson.build.portable).toBeUndefined()
  })

  it('keeps update metadata on the latest channel for pre-release versions', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { build: { detectUpdateChannel?: boolean } }

    // A version like 0.8.0-rc.1 would otherwise make electron-builder write
    // rc-mac.yml / rc.yml instead of latest-mac.yml / latest.yml, which every
    // downstream release step expects by name.
    expect(packageJson.build.detectUpdateChannel).toBe(false)
  })

  it('turns a selected Windows drive root into an application directory', async () => {
    const installer = await readFile(
      path.join(projectRoot, 'build', 'installer.nsh'),
      'utf8'
    )

    expect(installer).toContain('!define MUI_PAGE_CUSTOMFUNCTION_SHOW DshDirectoryPageShow')
    expect(installer).toContain('${NSD_OnChange} $DshDirectoryEdit DshDirectoryChanged')
    expect(installer).toContain('StrCpy $3 "$0\\${APP_FILENAME}"')
    expect(installer).toContain('StrCpy $3 "$0${APP_FILENAME}"')
    expect(installer).toContain('${NSD_SetText} $DshDirectoryEdit $3')
  })

  it('shows a packaged startup surface and pins the Electron directory picker surface', async () => {
    const main = await readFile(path.join(projectRoot, 'src', 'main', 'index.ts'), 'utf8')
    const splash = await readFile(path.join(projectRoot, 'build', 'splash.html'), 'utf8')
    const patch = await readFile(
      path.join(projectRoot, 'build', 'dsh-desktop.patch.yml'),
      'utf8'
    )

    expect(main).toContain("desktopResourcePath('splash.html')")
    expect(main).toContain('await showSplash()')
    expect(main).toContain("query: { theme: nativeTheme.shouldUseDarkColors ? 'dark' : 'light' }")
    expect(main).toContain('nativeTheme.themeSource = harnessThemePreference()')
    expect(splash).toContain('starting mitsumeru')
    expect(splash).toContain('src="splash-video.webm"')
    expect(splash).toContain("document.documentElement.dataset.theme = splashTheme === 'dark'")
    expect(splash).toContain('position: fixed;')
    expect(splash).toContain('html[data-platform="windows"] main { padding-top: 70px; }')
    expect(splash).not.toContain('filter: invert(1)')
    expect(splash).not.toContain('class="track"')
    expect(patch).not.toMatch(/id:\s*directory-picker/)
    expect(patch).not.toContain("name: '@deepseek-ai/dsh-host-directory-picker-native'")
    expect(patch).not.toContain("name: '@deepseek-ai/dsh-client-ui-directory-picker-native'")
  })

  it('routes manual restarts through the active plugin recovery flow', async () => {
    const main = await readFile(path.join(projectRoot, 'src', 'main', 'index.ts'), 'utf8')

    expect(main).toContain("if (failureRecoveryVisible) resolvePluginRecoveryAction('restart')")
    expect(main).toMatch(/case 'restart-harness':\s+await restartHarness\(\)/)
    expect(main).toContain('click: () => void restartHarness().catch(showUnexpectedError)')
    expect(main).toContain("} else if (action === 'restart') {")
  })

  it('replays frontend plugin failures that arrive during an active recovery', async () => {
    const main = await readFile(path.join(projectRoot, 'src', 'main', 'index.ts'), 'utf8')

    expect(main).toContain("resolvePluginRecoveryAction('refresh')")
    expect(main).toContain('if (applyPendingFrontendEvidence()) continue')
    expect(main).toMatch(
      /if \(failureRecoveryVisible\) \{\s+queuePendingFrontendPluginRecovery\(message\)/
    )
    expect(main).toContain('queueMicrotask(() => {')
    expect(main).toContain('logs: [...rendererPluginFailureLogs]')
  })

  it('keeps update metadata pointed at the official update server', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as {
      dependencies: Record<string, string>
      build: {
        publish: Array<{ provider: string; url?: string; owner?: string; repo?: string }>
        win: { verifyUpdateCodeSignature: boolean }
      }
    }

    expect(packageJson.dependencies['electron-updater']).toBeTruthy()
    expect(packageJson.build.publish).toEqual([
      { provider: 'generic', url: 'https://dshdesktop.com/updates/latest/' }
    ])
    expect(packageJson.build.win.verifyUpdateCodeSignature).toBe(false)
  })

  it('keeps builder jobs from attempting implicit tag publishing', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { scripts: Record<string, string> }

    for (const script of [
      'package:mac',
      'package:mac:arm64',
      'package:mac:x64',
      'package:win',
      'package:dev:mac:arm64',
      'package:dev:mac:x64',
      'package:dev:win'
    ]) {
      expect(packageJson.scripts[script]).toContain('--publish never')
    }
  })

  it('packages an isolated development channel from the current workspace', async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { scripts: Record<string, string> }
    const developmentConfig = await readFile(
      path.join(projectRoot, 'electron-builder.dev.cjs'),
      'utf8'
    )
    const main = await readFile(path.join(projectRoot, 'src', 'main', 'index.ts'), 'utf8')
    const targetVerifier = await readFile(
      path.join(projectRoot, 'scripts', 'verify-target.mjs'),
      'utf8'
    )

    expect(packageJson.scripts['package:dev:dir']).toContain('npm run build')
    expect(packageJson.scripts['package:dev:dir']).toContain('electron-builder.dev.cjs')
    expect(packageJson.scripts['package:dev:mac:arm64']).toContain('verify-target.mjs darwin arm64')
    expect(packageJson.scripts['package:dev:mac:arm64']).toContain('electron-builder.dev.cjs')
    expect(packageJson.scripts['package:dev:mac:x64']).toContain('verify-target.mjs darwin x64')
    expect(packageJson.scripts['package:dev:mac:x64']).toContain('electron-builder.dev.cjs')
    expect(packageJson.scripts['package:dev:win']).toContain('verify-target.mjs win32 x64')
    expect(packageJson.scripts['package:dev:win']).toContain('electron-builder.dev.cjs')
    expect(packageJson.scripts['package:dev:win']).toContain('--publish never')
    expect(developmentConfig).toContain("appId: 'io.muen.mitsumeru-dev'")
    expect(developmentConfig).toContain("productName: 'Mitsumeru Dev'")
    expect(developmentConfig).toContain("output: 'dist-dev'")
    expect(developmentConfig).toContain("dshDesktopChannel: 'development'")
    expect(developmentConfig).toContain(
      "artifactName: 'mitsumeru-dev-${os}-${arch}.${ext}'"
    )
    expect(developmentConfig).toContain(
      "artifactName: 'mitsumeru-dev-windows-${arch}-setup.${ext}'"
    )
    expect(main).toContain("app.setPath('userData', join(app.getPath('appData'), 'dsh-desktop-dev'))")
    expect(main).toContain("app.setPath('userData', join(app.getPath('appData'), 'dsh-desktop'))")
    expect(main).toContain('if (!developmentBuild)')
    expect(targetVerifier).toContain("resolve('node_modules', 'node', 'bin', executable)")
    expect(targetVerifier).toContain('Bundled Node.js runtime was not found or is not executable')
    expect(targetVerifier).toContain('spawnSync')
  })

  it('builds and publishes every supported platform', async () => {
    const workflow = await readFile(
      path.join(projectRoot, '.github', 'workflows', 'release.yml'),
      'utf8'
    )

    expect(workflow).toContain('runs-on: macos-15')
    expect(workflow).toContain('runs-on: macos-15-intel')
    expect(workflow).toContain('runs-on: windows-latest')
    expect(workflow).toContain('npm run package:mac:arm64')
    expect(workflow).toContain('npm run package:mac:x64')
    expect(workflow).toContain('npm run package:win')
    expect(workflow).toContain('npm run package:dev:mac:arm64')
    expect(workflow).toContain('npm run package:dev:mac:x64')
    expect(workflow).toContain('npm run package:dev:win')
    expect(workflow).toContain('name: macOS Apple Silicon')
    expect(workflow).toContain('name: macOS Intel')
    expect(workflow).toContain('name: Windows x64')
    expect(workflow).toContain('name: Publish')
  })
  it('signs and notarizes both macOS architectures on tag releases', async () => {
    const workflow = await readFile(
      path.join(projectRoot, '.github', 'workflows', 'release.yml'),
      'utf8'
    )

    for (const secret of [
      'DESKTOP_CSC_LINK',
      'DESKTOP_CSC_KEY_PASSWORD',
      'DESKTOP_APPLE_API_KEY',
      'DESKTOP_APPLE_API_KEY_ID',
      'DESKTOP_APPLE_API_ISSUER'
    ]) {
      expect(workflow).toContain(`secrets.${secret}`)
    }
    expect(workflow.match(/Prepare signing certificate/g)).toHaveLength(2)
    expect(workflow.match(/Prepare Apple notarization key/g)).toHaveLength(2)
    expect(workflow.match(/CSC_IDENTITY_AUTO_DISCOVERY: 'false'/g)).toHaveLength(2)
    expect(workflow.match(/CSC_LINK=\$p12/g)).toHaveLength(2)
    expect(workflow.match(/APPLE_API_KEY=\$key_path/g)).toHaveLength(2)
  })

  it('routes the published download through the official website', async () => {
    const readmes = await Promise.all(
      ['README.md', 'README.zh.md'].map((file) =>
        readFile(path.join(projectRoot, file), 'utf8')
      )
    )

    for (const readme of readmes) {
      expect(readme).not.toContain('| Platform | Package | Download |')
      expect(readme).not.toContain('| 平台 | 安装包 | 下载 |')
      expect(readme).not.toContain('Coming soon')
      expect(readme).not.toContain('即将发布')
      expect(readme).not.toContain('github.com/dataelement/dsh-desktop/releases')
      for (const asset of releaseAssets) {
        expect(readme).not.toContain(`releases/latest/download/${asset}`)
      }
    }
  })
})

describe('prerelease parity workflow', () => {
  const load = () =>
    readFile(path.join(projectRoot, '.github/workflows/release.yml'), 'utf8')

  it('replaces the windows-only prerelease input with a general one', async () => {
    const yml = await load()
    expect(yml).toContain('prerelease_tag:')
    expect(yml).not.toContain('windows_prerelease_tag')
    expect(yml).not.toContain('Publish validated Windows development pre-release')
  })

})

describe('AI-organized GitHub release body', () => {
  it('ships a RELEASE_NOTES.md style reference', async () => {
    const notes = await readFile(path.join(projectRoot, 'RELEASE_NOTES.md'), 'utf8')
    expect(notes.startsWith('# ')).toBe(true)
  })
})

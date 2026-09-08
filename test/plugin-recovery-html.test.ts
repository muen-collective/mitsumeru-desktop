import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(join(process.cwd(), 'build', 'plugin-recovery.html'), 'utf8')
const safeModeHtml = readFileSync(join(process.cwd(), 'build', 'safe-mode.html'), 'utf8')

const parseableScripts = (source: string) => {
  const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/gu)].map((m) => m[1]!)
  expect(scripts.length).toBeGreaterThan(0)
  for (const script of scripts) {
    expect(() => new Function(script), 'inline <script> must parse').not.toThrow()
  }
}

describe('plugin recovery page', () => {
  it('keeps the recovery surface focused on the next useful action', () => {
    expect(html).not.toContain('id="status"')
    expect(html).not.toContain('id="footer-note"')
    expect(html).not.toContain('处理完成后会自动返回 DSH Desktop')
    expect(html).not.toContain('DSH Desktop will reopen automatically when recovery is complete')
  })

  it('keeps diagnostics and exit access without offering a redundant restart', () => {
    expect(html).toContain('class="decision-row"')
    expect(html).not.toContain('id="restart"')
    expect(html.indexOf('id="primary"')).toBeLessThan(html.indexOf('id="safety-note"'))
    expect(html).toContain('id="advanced-label"')
    expect(html).toContain('id="show-log"')
    expect(html).toContain('id="quit"')
  })

  it('renders concise upgrade indicator directly on the plugin item without emojis', () => {
    expect(html).not.toContain('💡')
    expect(html).not.toContain('id="upgrade-card"')
    expect(html).toContain('plugin-upgrade')
    expect(html).toContain('该插件有新的兼容版本（${versionStr}）')
    expect(html).toContain("'卸载插件' : 'Uninstall plugin'")
  })

  it('ships parseable inline JavaScript (no orphan-ternary regression)', () => {
    // The whole inline <script> in both recovery surfaces must parse. A dangling
    // ': ...' continuation after a completed statement (an orphan-ternary
    // regression) leaves it unparseable and renders the surface blank.
    parseableScripts(html)
    parseableScripts(safeModeHtml)
  })
})

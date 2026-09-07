# Mitsumeru pre-promotion gates

Checklist before the first **production** release (git tag push that runs the signed path). Dev builds are the test surface and are exempt.

## 1. Strip the upstream PPT feature — do not ship

`dsh-ppt` / `dsh-ppt-composer` (the DSH PPT template packs in `packages/ppt-bundles/`,
inherited from upstream dsh-desktop) must **not** be part of Mitsumeru production.

- Upstream templates are Zara Zhang HTML-template adaptations + DSH-authored packs; the
  visual style is not Mitsumeru's and we don't want the feature attributed to us.
- Nobody on the product is expected to use it.
- Dev branches may keep them (harmless local deps); production must exclude them.

Remove path (verify at promotion time):
1. Drop the `dsh-ppt` and `dsh-ppt-composer` entries from `package.json` dependencies
   (and the `packages/ppt-bundles/` tarballs).
2. Revert the `dsh-ppt-composer` line added by the patch in
   `patches/@deepseek-ai+dsh+0.1.2-rc.1.patch`.
3. Check nothing in `src/` imports the composer; if the chat "PPT" entry is a plugin,
   disable it via the plugin/patch config (`build/dsh-desktop.patch.yml` or marketplace
   preset) instead of shipping a dead entry point.
4. Regenerate `package-lock.json`, run `npm run typecheck` + `npm test`.

## 2. Point the update feed at Mitsumeru

`package.json` → `build.publish.url` still targets upstream `https://dshdesktop.com/updates/latest/`.
A signed Mitsumeru release embeds this in `latest-mac.yml` / `app-update.yml`. Move it to the
Mitsumeru-hosted feed before any production tag (dev config already sets `publish: null`).

## 3. Signed path proven green

The signed prerelease validation run must pass end-to-end (p12 decode → Developer ID signing
→ notarization) on the exact commit being promoted. Check the latest `prerelease_tag` run
before pushing the tag.

## 4. Upstream ingested

Merge `upstream/main` first so production ships from the current upstream base (the last
ingestion was upstream's PPT/update/mobile commits, harness pinned at `0.1.2-rc.1`).

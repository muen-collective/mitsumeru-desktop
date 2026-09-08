#!/usr/bin/env bash
#
# Mitsumeru / dsh-desktop uninstaller
# Removes all local install artifacts for the Mitsumeru desktop app and its
# historical names (dsh-desktop, dsh-desktop-dev, mitsumeru, mitsumeru-dev).
#
# USAGE
#   ./mitsumeru-uninstall.sh           # dry-run: print what would be removed
#   ./mitsumeru-uninstall.sh --yes     # actually delete
#
# Safety
#   - Quits any running Mitsumeru / dsh-desktop app (macOS quits owned apps).
#   - Does NOT touch: ~/.zshrc, the source repo, or anything not listed here.
#   - Frees ~660 MB of stale install data.

set -euo pipefail

DRY_RUN=1
if [[ "${1:-}" == "--yes" ]]; then
  DRY_RUN=0
fi

HOME_DIR="${HOME:?HOME is required}"
APP_SUPPORT="$HOME_DIR/Library/Application Support"
LOGS="$HOME_DIR/Library/Logs"
PREF="$HOME_DIR/Library/Preferences"
CACHES="$HOME_DIR/Library/Caches"
APP="/Applications/Mitsumeru.app"
APP_DEV="/Applications/Mitsumeru Dev.app"

# Everything we remove, grouped by kind.
APPS=("$APP" "$APP_DEV")

APP_SUPPORT_DIRS=(
  "$APP_SUPPORT/dsh-desktop"
  "$APP_SUPPORT/dsh-desktop-dev"
  "$APP_SUPPORT/mitsumeru"
  "$APP_SUPPORT/mitsumeru-dev"
)

LOG_DIRS=(
  "$LOGS/Mitsumeru"
  "$LOGS/Mitsumeru Dev"
  "$LOGS/dsh-desktop"
)

CACHE_DIRS=(
  "$CACHES/Mitsumeru"
  "$CACHES/dsh-desktop"
  "$CACHES/mitsumeru"
)

# Preference plists (both io.muen.* and com.muen.* historical names).
PREF_GLOBS=(
  "io.muen.mitsumeru*.plist"
  "com.muen.mitsumeru*.plist"
  "io.muen.mitsumeru*.plist"
  "com.muen.dsh-desktop*.plist"
  "io.muen.dsh-desktop*.plist"
)

# LaunchAgents left behind by an Installer-style install.
LAUNCH_AGENT_GLOBS=(
  "$HOME_DIR/Library/LaunchAgents/*mitsumeru*"
  "$HOME_DIR/Library/LaunchAgents/*dsh-desktop*"
)

log()  { printf '%s\n' "$*"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }

rm_path() {
  local p="$1"
  if [[ -e "$p" || -L "$p" ]]; then
    if (( DRY_RUN )); then
      log "  would remove: $p"
    else
      rm -rf "$p"
      log "  removed: $p"
    fi
  fi
}

log "=== Mitsumeru / dsh-desktop uninstaller ==="
if (( DRY_RUN == 1 )); then
  log "mode: DRY-RUN (re-run with --yes to delete)"
else
  log "mode: DELETE"
fi
log ""

# 1. Quit running apps (macOS default is to quit owned-but-not-running). Use
#    pkill for robustness across bundle names; best-effort, ignore failures.
if (( DRY_RUN == 0 )); then
  log "--- quitting running Mitsumeru / dsh-desktop ---"
  pkill -f "Mitsumeru" 2>/dev/null || true
  pkill -f "dsh-desktop" 2>/dev/null || true
  sleep 1
fi

log "--- Applications ---"
for a in "${APPS[@]}"; do rm_path "$a"; done

log "--- Application Support (harness / profiles / workspaces) ---"
for d in "${APP_SUPPORT_DIRS[@]}"; do rm_path "$d"; done

log "--- Logs ---"
for d in "${LOG_DIRS[@]}"; do rm_path "$d"; done

log "--- Caches ---"
for d in "${CACHE_DIRS[@]}"; do rm_path "$d"; done

log "--- Saved Application State ---"
for g in "$HOME_DIR/Library/Saved Application State/"*mitsumeru* \
         "$HOME_DIR/Library/Saved Application State/"*dsh-desktop*; do
  rm_path "$g"
done

log "--- WebKit / HTTPStorages ---"
for g in "$HOME_DIR/Library/WebKit/"*mitsumeru* \
         "$HOME_DIR/Library/WebKit/"*dsh-desktop* \
         "$HOME_DIR/Library/HTTPStorages/"*mitsumeru* \
         "$HOME_DIR/Library/HTTPStorages/"*dsh-desktop*; do
  rm_path "$g"
done

log "--- Preferences ---"
for g in "${PREF_GLOBS[@]}"; do
  for p in "$PREF"/$g; do rm_path "$p"; done
done

log "--- LaunchAgents ---"
for g in "${LAUNCH_AGENT_GLOBS[@]}"; do
  for p in "$g"; do rm_path "$p"; done
done

log "--- Crash Reports (DiagnosticReports) ---"
for g in "$HOME_DIR/Library/Logs/DiagnosticReports/"*mitsumeru* \
         "$HOME_DIR/Library/Logs/DiagnosticReports/"*dsh-desktop*; do
  rm_path "$g"
done

log ""
if (( DRY_RUN == 1 )); then
  log "Dry run complete. Re-run with --yes to delete."
else
  log "Uninstall complete."
fi

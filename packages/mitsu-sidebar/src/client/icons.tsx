/**
 * Icons the sidebar needs beyond the primitives set: a terminal glyph (the
 * icon library has none), a diff glyph, and the two panel-toggle glyphs for
 * the top-right cluster. Per-tab icons live on the tab descriptors
 * (`descriptor.icon`), not in a type-keyed switch — the icon mapping was
 * registry-ized with the tab types.
 */
import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReactNode } from 'react'

/**
 * Bottom-panel toggle glyph (the "底栏" button): a frame with a filled strip
 * along its BOTTOM edge, in the app's outline style.
 */
export const IconPanelBottomOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
    <rect x="3.25" y="10" width="9.5" height="2.75" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

/**
 * Left-sessions-panel toggle glyph: a rounded frame with a filled strip along
 * its LEFT edge, matching the primitives' panel-left affordance. Used in the
 * Mitsu rail's bottom toggle slot to manually open/collapse the left sessions
 * panel. Drawn in the same 1.25 outline style as the other panel toggles.
 */
export const IconPanelLeft = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
    <rect x="2.75" y="3.25" width="2.75" height="9.5" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

/**
 * Right-panel toggle glyph for the Mitsu rail's TOP slot: the same panel
 * glyph as IconPanelLeft but mirrored horizontally (filled strip along its
 * RIGHT edge), so the top toggle optically "pulls" the right panel open.
 */
export const IconPanelRight = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
    <rect x="10.5" y="3.25" width="2.75" height="9.5" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

/**
 * Terminal glyph in the app's outline style (1.5px stroke, currentColor):
 * a rounded frame with a prompt chevron and underscore cursor.
 */
export const IconTerminalOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
    <path d="M4.5 6.25 6.75 8 4.5 9.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 10.4h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

/** Diff glyph in the app's outline style: a file frame with a plus and a minus row. */
export const IconDiffOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M4 5h3M5.5 3.5v3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M9.5 12.5h2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

/**
 * Stop glyph for the background-job kill button: a filled square in the
 * app's outline scale (16), the universal "halt this work" mark.
 */
export const IconStopOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Upload glyph in the app's outline style: an arrow rising into a tray
 *  (the file-manager "upload into the workspace" action). */
export const IconUploadOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 10V2.75M4.75 5.5 8 2.25 11.25 5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.75 10.5v2.25A1.25 1.25 0 0 0 4 14h8a1.25 1.25 0 0 0 1.25-1.25V10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

/**
 * Pin glyph in the app's outline style (1.5px stroke, currentColor): a pushpin
 * tilted to the lower-right. Used by the PinnedRail and the tab context menu's
 * pin entry (v0.17.0+).
 */
export const IconPinOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 1.5 14.5 6.5 12.5 8.5 10 6 5.5 10.5 6 12 4.5 13.5 2.5 11.5 4 10 5.5 10.5 10 6 7.5 8.5 6.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
)

// ── File-viewer inventory glyphs (Side card settings page) ────────────────

/** Image viewer glyph: a picture frame with a sun and a mountain. */
export const IconImageOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
    <circle cx="5.5" cy="6" r="1.2" stroke="currentColor" strokeWidth="1.25" />
    <path d="m3.5 12 3-3 2.25 2.25L11.5 8.5 13 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** PDF viewer glyph: a document frame with the "PDF" label. */
export const IconPdfOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 1.5h6.5L13.5 5v9.5h-10z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M9.5 1.5V5h4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M5 13.5v-3h1.4c.75 0 1.1.32 1.1.85 0 .54-.35.85-1.1.85H5.3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.3 13.5v-3h1.05c.8 0 1.35.5 1.35 1.5s-.55 1.5-1.35 1.5z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.6 13.5v-3h1.3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

/** Markdown viewer glyph: the classic "M with a down arrow" badge. */
export const IconMarkdownOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.25" />
    <path d="M4 10.5V5.5l2 2.5 2-2.5v5M9.5 10.5v-5l2 2.5 2-2.5v5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** HTML viewer glyph: a document frame with a "‹/›" tag pair. */
export const IconHtmlOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 1.5h6.5L13.5 5v9.5h-10z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M9.5 1.5V5h4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M5.6 13.2 4.2 10l1.4-3.2M7.4 6.8 8.8 10l-1.4 3.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Browser tab glyph: a globe with meridians. */
export const IconGlobeOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
    <ellipse cx="8" cy="8" rx="2.8" ry="6.5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M1.5 8h13M8 1.5c-2.4 1.8-2.4 11.2 0 13M8 1.5c2.4 1.8 2.4 11.2 0 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
)

/** History glyph (thread switcher): a clock with a counterclockwise arrow,
 *  in the app's outline style — the "past conversations" mark. */
export const IconHistoryOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.4 6.8A5.6 5.6 0 1 1 2.4 9.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M2.2 3.4v3.4h3.4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 5.4V8l1.9 1.2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Save glyph (save-as-new-session): the classic floppy disk, in the app's
 *  outline style. */
export const IconSaveOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.2 14.5h7.6a1.2 1.2 0 0 0 1.2-1.2V4.9L10.6 2.5H4.2A1.2 1.2 0 0 0 3 3.7v9.6a1.2 1.2 0 0 0 1.2 1.2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M10 2.5v2.6H5.6V2.5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M5.4 14.5v-4.2h5.2v4.2" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
  </svg>
)

/**
 * Visual Studio Code brand mark for the file-tree "open with" menu. The
 * path is the Simple Icons `visualstudiocode` glyph (CC0 1.0,
 * simple-icons@11.0.0 — later releases dropped it over Microsoft's brand
 * policy, so it is inlined here rather than pulled from react-icons),
 * rendered monochrome via currentColor to follow the active skin.
 */
export const IconVscode16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
  </svg>
)

/**
 * Free-window glyph in the app's outline style (1.5px stroke, currentColor):
 * a background frame with a detached rounded mini-window floating over its
 * top-right — the changes tab's "diff opens as a free window" setting.
 */
export const IconFloatWindowOutline16 = ({ size = 16, className }: IconProps) => (
  <svg width={size} height={size} className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="4.5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" />
    <rect x="9.5" y="1.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.25" fill="none" />
  </svg>
)

/* ── Lucide placeholder icons (24×24 viewBox) ────────────────────────────── */
/* These are TEMPORARY stand-ins, drawn from Lucide's SVG node data so the
   rail/toggle surfaces have a consistent glyph set now. At the UI-polish
   phase each is replaced by a Muen/Figma-drawn SVG. Rendered in a 24×24
   viewBox at the fork's 1.25 stroke weight so they read at the same visual
   weight as the other DSH outline icons. */

const lucideSvgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, xmlns: 'http://www.w3.org/2000/svg' }

const IconLucide = ({ size = 16, className, children }: IconProps & { children: ReactNode }) => (
  <svg width={size} height={size} className={className} {...lucideSvgProps}>{children}</svg>
)

export const LucidePanelRight = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </IconLucide>
)
export const LucidePanelBottom = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 15h18" />
  </IconLucide>
)
export const LucideFolder = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </IconLucide>
)
export const LucideCircleDashedCheck = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <path d="M10.1 2.182a10 10 0 0 1 3.8 0" />
    <path d="M13.9 21.818a10 10 0 0 1-3.8 0" />
    <path d="m16 9-5.5 5.5L8 12" />
    <path d="M17.609 3.721a10 10 0 0 1 2.69 2.7" />
    <path d="M2.182 13.9a10 10 0 0 1 0-3.8" />
    <path d="M20.279 17.609a10 10 0 0 1-2.7 2.69" />
    <path d="M21.818 10.1a10 10 0 0 1 0 3.8" />
    <path d="M3.721 6.391a10 10 0 0 1 2.7-2.69" />
    <path d="M6.391 20.279a10 10 0 0 1-2.69-2.7" />
  </IconLucide>
)
export const LucideListChecks = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <path d="M13 5h8" />
    <path d="M13 12h8" />
    <path d="M13 19h8" />
    <path d="m3 17 2 2 4-4" />
    <path d="m3 7 2 2 4-4" />
  </IconLucide>
)
export const LucideSquareTerminal = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <path d="m7 11 2-2-2-2" />
    <path d="M11 13h4" />
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
  </IconLucide>
)
export const LucideGlobe = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </IconLucide>
)
export const LucideMessageCircleMore = ({ size = 16, className }: IconProps) => (
  <IconLucide size={size} className={className}>
    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    <path d="M8 12h.01" />
    <path d="M12 12h.01" />
    <path d="M16 12h.01" />
  </IconLucide>
)

import type { ReactNode } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import clsx from 'clsx'
import type { BetterSidebarService } from './service.ts'
import {
  LucideCircleDashedCheck, LucideFolder, LucideGlobe, LucideListChecks,
  LucideMessageCircleMore, LucideSquareTerminal, IconPanelLeft, IconPanelRight,
} from './icons.tsx'
import css from './sidebar.module.css'

/** Lucide placeholder glyph per surface type (temporary; replaced at polish). */
const SURFACE_ICONS: Record<string, (size: number) => ReactNode> = {
  editor: (s) => <LucideFolder size={s} />,
  git: (s) => <LucideCircleDashedCheck size={s} />,
  diff: (s) => <LucideCircleDashedCheck size={s} />,
  subagent: (s) => <LucideListChecks size={s} />,
  sidechat: (s) => <LucideMessageCircleMore size={s} />,
  terminal: (s) => <LucideSquareTerminal size={s} />,
  browser: (s) => <LucideGlobe size={s} />,
}

export function Rail(props: {
  service: BetterSidebarService
  activeSurfaceId?: string
  onActivate: (surfaceId: string) => void
  /** Right-panel toggle (1st). */
  panelOpen: boolean
  onTogglePanel: () => void
  collapseLabel: string
  expandLabel: string
  /** Left-panel toggle (2nd). */
  onToggleLeftSidebar: () => void
  leftToggleLabel: string
}) {
  const {
    service, activeSurfaceId, onActivate, panelOpen,
    onTogglePanel, collapseLabel, expandLabel, onToggleLeftSidebar, leftToggleLabel,
  } = props
  const surfaces = service
    .getTabs()
    .filter((d) => !d.hidden)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))

  return (
    <nav className={css.rail} data-dsh-rail aria-label="Surfaces">
      {/* Order: right-panel toggle (1st) → left-panel toggle (2nd) → surfaces. */}
      <div className={css.railToggles}>
        <Tooltip label={panelOpen ? collapseLabel : expandLabel} side="bottom" delayMs={500}>
          <button
            type="button"
            className={css.railButton}
            aria-label={panelOpen ? collapseLabel : expandLabel}
            onClick={onTogglePanel}
          >
            <IconPanelRight />
          </button>
        </Tooltip>
        <Tooltip label={leftToggleLabel} side="bottom" delayMs={500}>
          <button
            type="button"
            className={css.railButton}
            aria-label={leftToggleLabel}
            onClick={onToggleLeftSidebar}
          >
            <IconPanelLeft />
          </button>
        </Tooltip>
      </div>

      {/* Surfaces below the toggles. */}
      {surfaces.map((d) => {
        const title = typeof d.title === 'function' ? d.title() : d.title
        const surfaceIcon = SURFACE_ICONS[d.id]
        const icon: ReactNode = surfaceIcon ? surfaceIcon(18) : (typeof d.icon === 'function' ? d.icon(18) : d.icon)
        const active = d.id === activeSurfaceId
        const disabled = !service.isTabEnabled(d.id)
        return (
          <Tooltip key={d.id} label={title} side="bottom" delayMs={500}>
            <button
              type="button"
              className={clsx(css.railButton, active && css.railButtonActive)}
              aria-label={title}
              title={title}
              disabled={disabled}
              onClick={() => { onActivate(d.id) }}
            >
              {icon}
            </button>
          </Tooltip>
        )
      })}
    </nav>
  )
}

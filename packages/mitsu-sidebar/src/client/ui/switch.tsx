/**
 * DSH design-system Switch (the same primitive the Plugin Market uses for its
 * "Enabled" toggle): a `<button role="switch" aria-checked>` with a thumb.
 *
 * First-class DSH control — no third-party primitive dependency. Styling uses
 * the fork's CSS module, mirroring the DSH switch's track/thumb geometry and
 * the monochrome off/on color treatment (muted border-l3 off, brand-primary
 * on).
 *
 * Controlled component: `checked` + `onChange(next: boolean)`.
 */
import { cn } from './utils'
import css from './switch.module.css'

function Switch(props: {
  checked: boolean
  onChange?: (next: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
  'aria-label'?: string
}) {
  const { checked, onChange, disabled, className, label } = props
  const ariaLabel = props['aria-label'] ?? label

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(css.switch, checked && css.switchOn, className)}
      disabled={disabled}
      onClick={() => { onChange?.(!checked) }}
    >
      <span className={css.thumb} aria-hidden="true" />
    </button>
  )
}

export { Switch }

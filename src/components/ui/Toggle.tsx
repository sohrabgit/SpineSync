import { cn } from './cn'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  tone?: 'success' | 'danger'
}

export function Toggle({ checked, onChange, label, tone = 'success' }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? (tone === 'danger' ? 'bg-danger' : 'bg-success') : 'border border-line bg-panel-2',
      )}
    >
      <span className={cn('inline-block size-5 rounded-full shadow transition-transform duration-200', checked ? 'bg-bg' : 'bg-mute', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  )
}

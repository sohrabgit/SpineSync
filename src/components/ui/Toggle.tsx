import { cn } from './cn'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  tone?: 'teal' | 'rose'
}

export function Toggle({ checked, onChange, label, tone = 'teal' }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? (tone === 'rose' ? 'bg-rose-500' : 'bg-teal-600') : 'bg-slate-300',
      )}
    >
      <span className={cn('inline-block size-5 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  )
}

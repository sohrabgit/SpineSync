import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useI18n } from '@/i18n'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Mobile bottom sheet (centred dialog column on wider screens). */
export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  const titleId = useId()
  const { m } = useI18n()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 animate-fade-in bg-[#030306]/75 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-md animate-slide-up flex-col rounded-t-[22px] border-t border-line bg-panel shadow-[0_-20px_60px_rgb(0_0_0/0.5)]"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-line-strong" aria-hidden />
        <header className="flex items-start gap-3 px-5 pt-3 pb-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-ink">
              {title}
            </h2>
            {subtitle && <div className="mt-1.5 text-sm text-mute">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-panel-2 text-ink hover:border-line-strong" aria-label={m.common.close}>
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {footer && <footer className="border-t border-line px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

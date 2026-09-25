import { useRef, useState } from 'react'
import { Download, FastForward, RotateCcw, Upload, Volume2 } from 'lucide-react'
import { selectData, useRecoveryStore } from '@/store/useRecoveryStore'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useI18n } from '@/i18n'

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const startDate = useRecoveryStore((s) => s.program.start_date)
  const offset = useRecoveryStore((s) => s.preferences.clock_offset_days)
  const sound = useRecoveryStore((s) => s.preferences.sound_enabled)
  const setSound = useRecoveryStore((s) => s.setSoundEnabled)
  const simulateNextDay = useRecoveryStore((s) => s.simulateNextDay)
  const resetProgram = useRecoveryStore((s) => s.resetProgram)
  const importData = useRecoveryStore((s) => s.importData)
  const fileRef = useRef<HTMLInputElement>(null)
  const { m, date } = useI18n()
  const t = m.settings
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const exportData = () => {
    const data = selectData(useRecoveryStore.getState())
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spinesync-${data.daily_log.date}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: t.exported })
  }

  const onImport = async (file: File) => {
    try {
      importData(JSON.parse(await file.text()))
      setMessage({ tone: 'ok', text: t.imported })
    } catch {
      setMessage({ tone: 'error', text: t.importInvalid })
    }
  }

  const close = () => {
    setConfirmReset(false)
    setMessage(null)
    onClose()
  }

  const row = 'flex items-center justify-between gap-3 py-3'

  return (
    <Sheet open={open} onClose={close} title={m.common.settings} subtitle={t.started(date(startDate, { month: 'long', day: 'numeric', year: 'numeric' }))}>
      <div className="divide-y divide-line/70">
        <div className={row}>
          <span className="text-sm font-medium text-ink">{m.common.language}</span>
          <LanguageSwitcher />
        </div>

        <label className={row}>
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Volume2 className="size-4 text-mute" /> {t.sounds}
          </span>
          <Toggle checked={sound} onChange={setSound} label={t.sounds} />
        </label>

        <section className="py-3">
          <h3 className="text-sm font-semibold text-ink">{t.dataTitle}</h3>
          <p className="mt-0.5 text-xs text-mute">{t.dataBody}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download className="size-4" /> {t.export}
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> {t.import}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onImport(f)
                e.target.value = ''
              }}
            />
          </div>
          {message && (
            <p role="status" className={`mt-2 text-xs font-medium ${message.tone === 'ok' ? 'text-success' : 'text-danger'}`}>
              {message.text}
            </p>
          )}
        </section>

        <section className="py-3">
          <h3 className="text-sm font-semibold text-ink">{t.previewTitle}</h3>
          <p className="mt-0.5 text-xs text-mute">
            {t.previewBody}
            {offset > 0 && <strong className="text-warning">{t.clockAhead(offset)}</strong>}
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={simulateNextDay}>
            <FastForward className="size-4 rtl:-scale-x-100" /> {t.simulate}
          </Button>
        </section>

        <section className="py-3">
          <h3 className="text-sm font-semibold text-danger">{t.resetTitle}</h3>
          <p className="mt-0.5 text-xs text-mute">{t.resetBody}</p>
          {confirmReset ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                {m.common.cancel}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetProgram()
                  close()
                }}
              >
                {t.resetConfirm}
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="mt-3 w-full text-danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-4" /> {t.resetTitle}
            </Button>
          )}
        </section>

        <p className="py-4 text-[11px] leading-relaxed text-dim">
          {t.footer}
        </p>
      </div>
    </Sheet>
  )
}

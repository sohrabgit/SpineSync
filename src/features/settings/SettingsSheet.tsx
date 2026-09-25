import { useRef, useState } from 'react'
import { Download, FastForward, RotateCcw, Upload, Volume2 } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { selectData, useRecoveryStore } from '@/store/useRecoveryStore'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const startDate = useRecoveryStore((s) => s.program.start_date)
  const offset = useRecoveryStore((s) => s.preferences.clock_offset_days)
  const sound = useRecoveryStore((s) => s.preferences.sound_enabled)
  const setSound = useRecoveryStore((s) => s.setSoundEnabled)
  const simulateNextDay = useRecoveryStore((s) => s.simulateNextDay)
  const resetProgram = useRecoveryStore((s) => s.resetProgram)
  const importData = useRecoveryStore((s) => s.importData)
  const fileRef = useRef<HTMLInputElement>(null)
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
    setMessage({ tone: 'ok', text: 'Backup downloaded.' })
  }

  const onImport = async (file: File) => {
    try {
      importData(JSON.parse(await file.text()))
      setMessage({ tone: 'ok', text: 'Data restored from backup.' })
    } catch (e) {
      setMessage({ tone: 'error', text: e instanceof Error ? e.message : 'Import failed.' })
    }
  }

  const close = () => {
    setConfirmReset(false)
    setMessage(null)
    onClose()
  }

  const row = 'flex items-center justify-between gap-3 py-3'

  return (
    <Sheet open={open} onClose={close} title="Settings" subtitle={`Program started ${formatDate(startDate, { month: 'long', day: 'numeric', year: 'numeric' })}`}>
      <div className="divide-y divide-line/70">
        <label className={row}>
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Volume2 className="size-4 text-mute" /> Timer sounds
          </span>
          <Toggle checked={sound} onChange={setSound} label="Timer sounds" />
        </label>

        <section className="py-3">
          <h3 className="text-sm font-semibold text-ink">Your data</h3>
          <p className="mt-0.5 text-xs text-mute">Everything is stored only on this device. Export a backup to move it to another phone or keep it safe.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={exportData}>
              <Download className="size-4" /> Export
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Import
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
          <h3 className="text-sm font-semibold text-ink">Preview mode</h3>
          <p className="mt-0.5 text-xs text-mute">
            Jump ahead one day to see how phases, NDI checkpoints and adaptive plans progress.
            {offset > 0 && <strong className="text-warning"> The demo clock is {offset} day{offset === 1 ? '' : 's'} ahead.</strong>}
          </p>
          <Button variant="secondary" className="mt-3 w-full" onClick={simulateNextDay}>
            <FastForward className="size-4" /> Simulate next day
          </Button>
        </section>

        <section className="py-3">
          <h3 className="text-sm font-semibold text-danger">Reset program</h3>
          <p className="mt-0.5 text-xs text-mute">Permanently deletes all check-ins, logs and assessments on this device.</p>
          {confirmReset ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resetProgram()
                  close()
                }}
              >
                Yes, delete all
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="mt-3 w-full text-danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-4" /> Reset program
            </Button>
          )}
        </section>

        <p className="py-4 text-[11px] leading-relaxed text-dim">
          SpineSync is a self-management tool based on a general cervical disc rehabilitation playbook. It does not diagnose conditions or replace advice from a qualified clinician. Stop any exercise that makes arm symptoms worse.
        </p>
      </div>
    </Sheet>
  )
}

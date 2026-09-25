import { describe, expect, it } from 'vitest'
import { localizeDigits } from './format'
import { fa } from './fa'

describe('localizeDigits', () => {
  it('leaves English untouched', () => {
    expect(localizeDigits('12.5%', 'en')).toBe('12.5%')
  })
  it('uses Persian digits, decimal separator and percent sign', () => {
    expect(localizeDigits(30, 'fa')).toBe('۳۰')
    expect(localizeDigits('12.5%', 'fa')).toBe('۱۲٫۵٪')
    expect(localizeDigits('07:30', 'fa')).toBe('۰۷:۳۰')
  })
  it('uses a French decimal comma and spaced percent sign', () => {
    expect(localizeDigits('12.5%', 'fr')).toBe('12,5\u202f%')
    expect(localizeDigits('07:30', 'fr')).toBe('07:30')
  })
})

describe('Persian messages', () => {
  it('format numbers inside interpolated strings', () => {
    expect(fa.header.dayOf(3, 30, 'کنترل التهاب')).toBe('روز ۳ از ۳۰ · کنترل التهاب')
    expect(fa.dose.reps(2, 10, 5, 'direction')).toBe('۲ ست ۱۰ تکراری برای هر جهت · ۵ ثانیه مکث')
  })
})

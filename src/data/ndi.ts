import type { NdiCheckpoint } from '@/types/recovery'

export interface NdiSection {
  title: string
  /** Six options scored 0 (no disability) → 5 (maximal). */
  options: [string, string, string, string, string, string]
}

/** Neck Disability Index — 10 sections (paraphrased from Vernon & Mior, 1991). */
export const NDI_SECTIONS: NdiSection[] = [
  {
    title: 'Pain intensity',
    options: ['No pain right now', 'Very mild pain', 'Moderate pain', 'Fairly severe pain', 'Very severe pain', 'Worst imaginable pain'],
  },
  {
    title: 'Personal care (washing, dressing)',
    options: [
      'Normal, without extra pain',
      'Normal, but it causes extra pain',
      'Painful — I am slow and careful',
      'I need some help but manage most',
      'I need help every day with most care',
      'I cannot dress; washing is difficult',
    ],
  },
  {
    title: 'Lifting',
    options: [
      'Heavy weights without extra pain',
      'Heavy weights, but with extra pain',
      'Only if conveniently placed (e.g. on a table)',
      'Light–medium weights if conveniently placed',
      'Only very light weights',
      'I cannot lift or carry anything',
    ],
  },
  {
    title: 'Reading',
    options: [
      'As much as I want, no neck pain',
      'As much as I want, slight pain',
      'As much as I want, moderate pain',
      'Not as much as I want — moderate pain',
      'Hardly at all — severe pain',
      'I cannot read at all',
    ],
  },
  {
    title: 'Headaches',
    options: ['None', 'Slight, infrequent', 'Moderate, infrequent', 'Moderate, frequent', 'Severe, frequent', 'Almost all the time'],
  },
  {
    title: 'Concentration',
    options: [
      'Full concentration, no difficulty',
      'Full concentration, slight difficulty',
      'A fair degree of difficulty',
      'A lot of difficulty',
      'A great deal of difficulty',
      'I cannot concentrate at all',
    ],
  },
  {
    title: 'Work',
    options: [
      'As much work as I want',
      'My usual work, but no more',
      'Most of my usual work',
      'I cannot do my usual work',
      'I can hardly do any work',
      'I cannot do any work',
    ],
  },
  {
    title: 'Driving',
    options: [
      'Without neck pain',
      'As long as I want, slight pain',
      'As long as I want, moderate pain',
      'Not as long as I want — moderate pain',
      'Hardly at all — severe pain',
      'I cannot drive at all',
    ],
  },
  {
    title: 'Sleeping',
    options: [
      'No trouble sleeping',
      'Slightly disturbed (<1 h lost)',
      'Mildly disturbed (1–2 h lost)',
      'Moderately disturbed (2–3 h lost)',
      'Greatly disturbed (3–5 h lost)',
      'Completely disturbed (5–7 h lost)',
    ],
  },
  {
    title: 'Recreation',
    options: [
      'All activities, no neck pain',
      'All activities, some neck pain',
      'Most but not all usual activities',
      'Only a few usual activities',
      'Hardly any activities',
      'No recreational activities at all',
    ],
  },
]

export const NDI_CHECKPOINTS: NdiCheckpoint[] = [1, 15, 30]

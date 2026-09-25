import type { ExerciseDefinition, ExerciseId } from '@/types/recovery'

/** Exercise library — derived from playbook §3–§4. */
export const EXERCISES: Record<ExerciseId, ExerciseDefinition> = {
  chin_tuck: {
    id: 'chin_tuck',
    name: 'Chin Tuck',
    category: 'mobility',
    target: 'Reduces anterior disc shear stress and realigns the cervical spine.',
    steps: [
      'Sit tall with feet flat and shoulders relaxed.',
      'Keep your eyes level — do not tilt the head up or down.',
      'Glide your chin straight back, creating a “double chin”.',
      'Hold, then slowly return to neutral.',
    ],
    cautions: ['Movement should be small and pain-free.', 'Stop if arm symptoms increase.'],
  },
  isometric_4way: {
    id: 'isometric_4way',
    name: '4-Way Neck Isometrics',
    category: 'isometric',
    target: 'Strengthens cervical muscles without moving the joints or disc.',
    steps: [
      'Sit upright with your chin slightly tucked.',
      'Place your hand on the side you are working (forehead, back of head, or temple).',
      'Press your head into your hand while your hand resists — the head should not move.',
      'Hold steadily, breathing normally, then release slowly.',
    ],
    cautions: ['No movement at the neck — pressure only.', 'Respect the effort level for your phase.'],
    sides: ['Forward', 'Backward', 'Right side', 'Left side'],
  },
  upper_trap_stretch: {
    id: 'upper_trap_stretch',
    name: 'Upper Trapezius Stretch',
    category: 'stretch',
    target: 'Relieves upper back and neck muscle tension.',
    steps: [
      'Sit tall and anchor one hand under your thigh.',
      'Gently side-bend your head toward the opposite shoulder.',
      'Feel a mild stretch along the side of the neck.',
      'Hold, breathe slowly, then return to centre.',
    ],
    cautions: ['A gentle stretch, never sharp pain.', 'Do not bounce.'],
    sides: ['Right side', 'Left side'],
  },
  scapular_retraction: {
    id: 'scapular_retraction',
    name: 'Scapular Retraction',
    category: 'strength',
    target: 'Strengthens rhomboids and mid-trapezius to correct slouched shoulders.',
    steps: [
      'Stand or sit tall with arms relaxed.',
      'Draw your shoulders down, away from your ears.',
      'Squeeze your shoulder blades together and back.',
      'Hold, then release with control.',
    ],
    cautions: ['Avoid shrugging.', 'Keep the chin gently tucked.'],
  },
  shoulder_rolls: {
    id: 'shoulder_rolls',
    name: 'Gentle Shoulder Rolls',
    category: 'mobility',
    target: 'Loosens the shoulder girdle and eases morning stiffness.',
    steps: [
      'Sit or stand tall.',
      'Slowly roll your shoulders up, back, and down in a smooth circle.',
      'Keep the neck still and relaxed.',
    ],
    cautions: ['Keep the range comfortable.'],
  },
  brisk_walk: {
    id: 'brisk_walk',
    name: 'Posture-Focused Walk',
    category: 'cardio',
    target: 'Low-impact conditioning that builds endurance.',
    steps: [
      'Walk on flat ground at a brisk, comfortable pace.',
      'Keep your eyes forward and chin gently tucked.',
      'Let your arms swing naturally, shoulders down and relaxed.',
    ],
    cautions: ['Avoid uneven terrain.', 'Do not carry heavy bags.'],
  },
  heat_therapy: {
    id: 'heat_therapy',
    name: 'Moist Heat Pack',
    category: 'modality',
    target: 'Relaxes muscle spasm and improves local blood flow.',
    steps: [
      'Lie down or sit supported with your neck in neutral.',
      'Wrap a warm (not hot) moist pack in a thin towel.',
      'Place it across the back of the neck and upper shoulders.',
    ],
    cautions: ['Check the skin every 5 minutes.', 'Never sleep on a heat pack.'],
  },
  cold_therapy: {
    id: 'cold_therapy',
    name: 'Cold Therapy',
    category: 'modality',
    target: 'Reduces acute inflammation and dulls sharp pain.',
    steps: [
      'Wrap an ice pack or frozen gel pack in a thin towel.',
      'Apply to the most painful area of the neck.',
      'Rest in a supported, neutral position.',
    ],
    cautions: ['Never apply ice directly to skin.', 'Stop if the skin turns white or numb.'],
  },
  supported_rest: {
    id: 'supported_rest',
    name: 'Supported Rest',
    category: 'rest',
    target: 'Unloads the cervical spine so irritated tissue can settle.',
    steps: [
      'Lie on your back with a contoured pillow supporting the neck curve.',
      'Place a pillow under your knees.',
      'Breathe slowly into your belly and let the shoulders soften.',
    ],
    cautions: ['Avoid lying on your stomach.', 'Avoid screens held above your face.'],
  },
}

export const getExercise = (id: ExerciseId): ExerciseDefinition => EXERCISES[id]

/** Effective set count once per-side/direction repetition is applied. */
export function effectiveSets(id: ExerciseId, sets: number): number {
  return sets * (EXERCISES[id].sides?.length ?? 1)
}

/** Side/direction label for a zero-based effective set index. */
export function sideForSet(id: ExerciseId, setIndex: number): string | undefined {
  const sides = EXERCISES[id].sides
  return sides ? sides[setIndex % sides.length] : undefined
}

/** Timed modalities/cardio are tracked as a single countdown rather than reps. */
export function isTimedActivity(id: ExerciseId): boolean {
  const c = EXERCISES[id].category
  return c === 'modality' || c === 'cardio' || c === 'rest'
}

/** Categories suppressed during a flare-up. */
export const FLARE_SUPPRESSED: ReadonlySet<ExerciseId> = new Set(['isometric_4way', 'scapular_retraction', 'brisk_walk'])

/** Human-readable dose, e.g. "2 × 10 each direction · 5 s hold" or "15 min". */
export function formatDose(p: { exercise_id: ExerciseId; target_sets: number; target_reps: number; hold_seconds: number }): string {
  if (isTimedActivity(p.exercise_id)) return `${Math.round(p.hold_seconds / 60)} min`
  const sides = EXERCISES[p.exercise_id].sides
  const perSide = sides ? p.target_sets / sides.length : p.target_sets
  const suffix = sides ? (sides.length > 2 ? ' each direction' : ' each side') : ''
  return `${perSide} × ${p.target_reps}${suffix} · ${p.hold_seconds} s hold`
}

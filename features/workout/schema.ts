import type { EffortLevel, WorkoutExerciseLog, WorkoutPlanExercise, WorkoutSession } from './types';

export type WorkoutSetFormValues = {
  exerciseName: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  seconds?: number;
  completed: boolean;
  memo?: string;
};

export type WorkoutSessionFormValues = {
  date: string;
  durationMinutes?: number;
  effortLevel?: EffortLevel;
  completed: boolean;
  memo?: string;
  sets: WorkoutSetFormValues[];
};

export type WorkoutValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

const EFFORT_LEVELS: EffortLevel[] = ['easy', 'normal', 'hard'];

export function createWorkoutSessionFormDefaults(exercises: WorkoutPlanExercise[], today: string): WorkoutSessionFormValues {
  return {
    date: today,
    effortLevel: 'normal',
    completed: true,
    sets: exercises.flatMap((exercise) =>
      Array.from({ length: exercise.defaultSets }, (_, index) => ({
        exerciseName: exercise.exerciseName,
        setNumber: index + 1,
        weightKg: exercise.defaultWeightKg,
        reps: exercise.defaultReps,
        seconds: exercise.defaultSeconds,
        completed: true,
      })),
    ),
  };
}

export function validateWorkoutSessionForm(values: WorkoutSessionFormValues, today: string): WorkoutValidationResult<WorkoutSessionFormValues> {
  const errors: string[] = [];

  if (!isDateString(values.date)) {
    errors.push('日付を入力してください。');
  } else if (values.date > today) {
    errors.push('未来日は記録できません。');
  }

  if (values.durationMinutes !== undefined && !isInRange(values.durationMinutes, 1, 600)) {
    errors.push('時間は1〜600分で入力してください。');
  }

  if (values.effortLevel !== undefined && !EFFORT_LEVELS.includes(values.effortLevel)) {
    errors.push('きつさを選択してください。');
  }

  if (values.memo !== undefined && values.memo.length > 300) {
    errors.push('メモは300文字以内で入力してください。');
  }

  if (values.sets.length === 0) {
    errors.push('少なくとも1セット入力してください。');
  }

  values.sets.forEach((set, index) => {
    const label = `${set.exerciseName || `セット${index + 1}`} ${set.setNumber}セット目`;
    if (set.exerciseName.trim().length === 0) {
      errors.push(`${label}の種目名を確認してください。`);
    }
    if (!Number.isInteger(set.setNumber) || set.setNumber < 1) {
      errors.push(`${label}のセット番号を確認してください。`);
    }
    if (set.weightKg !== undefined && !isInRange(set.weightKg, 0, 500)) {
      errors.push(`${label}の重量は0〜500kgで入力してください。`);
    }
    if (set.reps !== undefined && (!Number.isInteger(set.reps) || !isInRange(set.reps, 1, 500))) {
      errors.push(`${label}の回数は1〜500回で入力してください。`);
    }
    if (set.seconds !== undefined && (!Number.isInteger(set.seconds) || !isInRange(set.seconds, 1, 7200))) {
      errors.push(`${label}の秒数は1〜7200秒で入力してください。`);
    }
    if (set.reps === undefined && set.seconds === undefined) {
      errors.push(`${label}は回数または秒数を入力してください。`);
    }
    if (set.memo !== undefined && set.memo.length > 200) {
      errors.push(`${label}のメモは200文字以内で入力してください。`);
    }
  });

  return errors.length === 0 ? { success: true, data: values } : { success: false, errors };
}

export function toWorkoutSession(values: WorkoutSessionFormValues, id: string, workoutPlanId: string, dayCode: WorkoutSession['dayCode'], now: string): WorkoutSession {
  return {
    id,
    date: values.date,
    workoutPlanId,
    dayCode,
    durationMinutes: values.durationMinutes,
    effortLevel: values.effortLevel,
    completed: values.completed,
    memo: values.memo?.trim() || undefined,
    createdAt: now,
  };
}

export function toWorkoutExerciseLogs(values: WorkoutSessionFormValues, workoutSessionId: string, createId: () => string): WorkoutExerciseLog[] {
  return values.sets.map((set) => ({
    id: createId(),
    workoutSessionId,
    exerciseName: set.exerciseName.trim(),
    setNumber: set.setNumber,
    weightKg: set.weightKg,
    reps: set.reps,
    seconds: set.seconds,
    completed: set.completed,
    memo: set.memo?.trim() || undefined,
  }));
}

function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

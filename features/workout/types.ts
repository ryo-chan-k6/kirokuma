export type PlanDay = 'DAY_1' | 'DAY_2' | 'DAY_3' | 'DAY_4' | 'DAY_5';

export type WorkoutPlan = {
  id: string;
  dayCode: PlanDay;
  name: string;
  targetArea: string;
  displayOrder: number;
  isActive: boolean;
};

export type WorkoutPlanExercise = {
  id: string;
  workoutPlanId: string;
  exerciseName: string;
  defaultWeightKg?: number;
  defaultReps?: number;
  defaultSeconds?: number;
  defaultSets: number;
  displayOrder: number;
};

export type EffortLevel = 'easy' | 'normal' | 'hard';

export type WorkoutSession = {
  id: string;
  date: string;
  workoutPlanId: string;
  dayCode: PlanDay;
  durationMinutes?: number;
  effortLevel?: EffortLevel;
  completed: boolean;
  memo?: string;
  createdAt: string;
};

export type WorkoutExerciseLog = {
  id: string;
  workoutSessionId: string;
  exerciseName: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  seconds?: number;
  completed: boolean;
  memo?: string;
};

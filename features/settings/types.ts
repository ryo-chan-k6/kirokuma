export type Sex = 'male' | 'female' | 'other';
export type ActivityLevel = 'low' | 'medium' | 'high';

export type AppSettings = {
  id: string;
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDate: string;
  age?: number;
  sex?: Sex;
  activityLevel?: ActivityLevel;
  weeklyWorkoutTarget: number;
  workoutRotationMode: 'rotation';
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

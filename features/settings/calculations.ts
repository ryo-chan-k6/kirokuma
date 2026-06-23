import type { ActivityLevel, Sex } from './types';

export type CalorieTargetInput = {
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  age?: number;
  sex?: Sex;
  activityLevel?: ActivityLevel;
};

export type SettingsTargets = {
  currentBmi: number;
  targetBmi: number;
  remainingWeightKg: number;
  targetCaloriesKcal: number;
  targetProteinG: number;
};

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  low: 1.2,
  medium: 1.375,
  high: 1.55,
};

const DEFAULT_AGE = 35;
const DEFAULT_SEX: Sex = 'other';
const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'medium';

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return roundToOneDecimal(weightKg / (heightM * heightM));
}

export function calculateRemainingWeight(currentWeightKg: number, targetWeightKg: number): number {
  return roundToOneDecimal(currentWeightKg - targetWeightKg);
}

export function calculateBasalMetabolicRate(input: CalorieTargetInput): number {
  const age = input.age ?? DEFAULT_AGE;
  const sex = input.sex ?? DEFAULT_SEX;
  const base = 10 * input.currentWeightKg + 6.25 * input.heightCm - 5 * age;

  if (sex === 'male') return Math.round(base + 5);
  if (sex === 'female') return Math.round(base - 161);
  return Math.round(base - 78);
}

export function calculateTargetCalories(input: CalorieTargetInput): number {
  const activityLevel = input.activityLevel ?? DEFAULT_ACTIVITY_LEVEL;
  const maintenanceCalories = calculateBasalMetabolicRate(input) * ACTIVITY_MULTIPLIER[activityLevel];
  const isWeightLoss = input.currentWeightKg > input.targetWeightKg;
  const adjustment = isWeightLoss ? -300 : input.currentWeightKg < input.targetWeightKg ? 200 : 0;
  return roundToNearestTen(Math.max(1200, maintenanceCalories + adjustment));
}

export function calculateTargetProtein(currentWeightKg: number, targetWeightKg: number): number {
  const baseWeight = Math.min(currentWeightKg, targetWeightKg);
  return Math.round(baseWeight * 1.6);
}

export function calculateSettingsTargets(input: CalorieTargetInput): SettingsTargets {
  return {
    currentBmi: calculateBmi(input.currentWeightKg, input.heightCm),
    targetBmi: calculateBmi(input.targetWeightKg, input.heightCm),
    remainingWeightKg: calculateRemainingWeight(input.currentWeightKg, input.targetWeightKg),
    targetCaloriesKcal: calculateTargetCalories(input),
    targetProteinG: calculateTargetProtein(input.currentWeightKg, input.targetWeightKg),
  };
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundToNearestTen(value: number): number {
  return Math.round(value / 10) * 10;
}

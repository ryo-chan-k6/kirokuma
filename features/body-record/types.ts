export type FaceLineStatus = 'good' | 'normal' | 'puffy';
export type BellyStatus = 'good' | 'normal' | 'bloated';

export type BodyRecord = {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  faceLineStatus?: FaceLineStatus;
  bellyStatus?: BellyStatus;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

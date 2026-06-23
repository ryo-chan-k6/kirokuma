export type BodyRecord = {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  faceLineStatus?: 'good' | 'normal' | 'puffy';
  bellyStatus?: 'good' | 'normal' | 'bloated';
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

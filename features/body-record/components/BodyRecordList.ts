import type { BodyRecord } from '../types';
import { bellyStatusLabels, faceLineStatusLabels } from './BodyRecordForm';

export function formatBodyRecordSummary(record: BodyRecord): string {
  const bodyFat = record.bodyFatPercentage === undefined ? '体脂肪率なし' : `体脂肪率 ${record.bodyFatPercentage}%`;
  const face = record.faceLineStatus ? `顔: ${faceLineStatusLabels[record.faceLineStatus]}` : '顔: 未入力';
  const belly = record.bellyStatus ? `お腹: ${bellyStatusLabels[record.bellyStatus]}` : 'お腹: 未入力';

  return `${record.date} / ${record.weightKg}kg / ${bodyFat} / ${face} / ${belly}`;
}

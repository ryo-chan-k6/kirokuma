# きろくま アーキテクチャ設計書

## 1. 基本方針

きろくまは、まずWebブラウザ利用をメインにしたNext.jsアプリとして開発する。

ただし、将来的にReact Native + Expoへ移植しやすいよう、以下を重視する。

- UIと業務ロジックを分離する
- データアクセスをRepository interface経由にする
- IndexedDB実装をUIから隠蔽する
- 計算ロジックをUI非依存にする
- 日付・栄養計算・筋トレローテーションなどは純粋関数として実装する
- テストしやすい構成にする

---

## 2. 技術スタック

### 2.1 初期MVP

| 分類 | 採用 |
|---|---|
| フレームワーク | Next.js App Router |
| 言語 | TypeScript |
| UI | Tailwind CSS |
| UIコンポーネント | shadcn/ui |
| フォーム | React Hook Form |
| バリデーション | Zod |
| ローカルDB | IndexedDB |
| IndexedDBラッパー | Dexie.js |
| グラフ | Recharts |
| 日付処理 | date-fns |
| 単体テスト | Vitest |
| コンポーネントテスト | Testing Library |
| E2Eテスト | Playwright |
| CI | GitHub Actions |
| ホスティング | Vercelを想定 |

### 2.2 後続候補

| 分類 | 候補 |
|---|---|
| PWA | Web App Manifest / Service Worker |
| 通知 | Web Notifications / Web Push |
| スマホアプリ | React Native + Expo |
| スマホアプリDB | SQLite |
| 画像保存 | Expo FileSystem |
| モバイル通知 | Expo Notifications |

---

## 3. レイヤー構成

### 3.1 全体構成

```text
UI Layer
  ↓
Feature Hooks / Usecase Layer
  ↓
Repository Interface
  ↓
Infrastructure Layer
  ↓
IndexedDB / Dexie
```

### 3.2 各層の責務

| 層 | 責務 |
|---|---|
| UI Layer | 画面表示、ユーザー入力、イベント発火 |
| Feature Hooks | 画面単位の状態管理、usecase呼び出し |
| Usecase Layer | アプリ固有の処理、計算、保存フロー |
| Repository Interface | データアクセスの抽象化 |
| Infrastructure Layer | IndexedDB/Dexieなど具体実装 |
| Domain/Types | 型、スキーマ、純粋関数 |

### 3.3 禁止事項

- ReactコンポーネントからDexieを直接呼ばない
- `app/` 配下に複雑な業務ロジックを書かない
- 画面コンポーネントに栄養計算ロジックを書かない
- 画面コンポーネントに筋トレローテーション判定を書かない
- 外部APIを勝手に追加しない
- クラウドDBを勝手に追加しない

---

## 4. ディレクトリ構成

```text
kirokuma/
├─ app/
│  ├─ page.tsx
│  ├─ settings/
│  ├─ body-records/
│  ├─ workouts/
│  ├─ meals/
│  ├─ foods/
│  ├─ recipes/
│  └─ analytics/
├─ components/
│  ├─ layout/
│  ├─ ui/
│  └─ feature/
├─ features/
│  ├─ settings/
│  ├─ body-record/
│  ├─ workout/
│  ├─ meal/
│  ├─ food/
│  ├─ recipe/
│  └─ analytics/
├─ infrastructure/
│  └─ indexeddb/
│     ├─ db.ts
│     ├─ settings-repository.ts
│     ├─ body-record-repository.ts
│     ├─ workout-repository.ts
│     ├─ meal-repository.ts
│     ├─ food-repository.ts
│     └─ recipe-repository.ts
├─ lib/
│  ├─ date.ts
│  ├─ ids.ts
│  ├─ nutrition.ts
│  └─ workout-rotation.ts
├─ docs/
│  ├─ requirements.md
│  ├─ architecture.md
│  └─ issues.md
├─ tests/
├─ AGENTS.md
├─ README.md
└─ package.json
```

---

## 5. Feature配下の構成

各featureは、原則として以下の構成にする。

```text
features/<feature-name>/
├─ components/
├─ hooks/
├─ types.ts
├─ schema.ts
├─ usecases.ts
├─ repository.ts
└─ __tests__/
```

### 5.1 例：体重記録

```text
features/body-record/
├─ components/
│  ├─ BodyRecordForm.tsx
│  └─ BodyRecordList.tsx
├─ hooks/
│  └─ useBodyRecords.ts
├─ types.ts
├─ schema.ts
├─ usecases.ts
├─ repository.ts
└─ __tests__/
   └─ body-record.test.ts
```

---

## 6. データモデル

### 6.1 AppSettings

```ts
export type AppSettings = {
  id: string;
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDate: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
  activityLevel?: 'low' | 'medium' | 'high';
  weeklyWorkoutTarget: number;
  workoutRotationMode: 'rotation';
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 6.2 BodyRecord

```ts
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
```

### 6.3 WorkoutPlan

```ts
export type PlanDay = 'DAY_1' | 'DAY_2' | 'DAY_3' | 'DAY_4' | 'DAY_5';

export type WorkoutPlan = {
  id: string;
  dayCode: PlanDay;
  name: string;
  targetArea: string;
  displayOrder: number;
  isActive: boolean;
};
```

### 6.4 WorkoutPlanExercise

```ts
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
```

### 6.5 WorkoutSession

```ts
export type WorkoutSession = {
  id: string;
  date: string;
  workoutPlanId: string;
  dayCode: PlanDay;
  durationMinutes?: number;
  effortLevel?: 'easy' | 'normal' | 'hard';
  completed: boolean;
  memo?: string;
  createdAt: string;
};
```

### 6.6 WorkoutExerciseLog

```ts
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
```

### 6.7 CardioLog

```ts
export type CardioLog = {
  id: string;
  date: string;
  cardioType: 'walking' | 'running' | 'cycling' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned?: number;
  memo?: string;
  createdAt: string;
};
```

### 6.8 MealLog

```ts
export type MealLog = {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealSource: 'home_cooking' | 'restaurant' | 'convenience_store' | 'other';
  title: string;
  calories: number;
  proteinGrams: number;
  memo?: string;
  photoIds: string[];
  recipeId?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 6.9 MealPhoto

```ts
export type MealPhoto = {
  id: string;
  mealLogId: string;
  blob: Blob;
  createdAt: string;
};
```

### 6.10 FoodMaster

```ts
export type FoodMaster = {
  id: string;
  name: string;
  baseAmount: number;
  unit: 'g' | 'ml' | 'piece' | 'serving';
  calories: number;
  proteinGrams: number;
  memo?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 6.11 Recipe

```ts
export type Recipe = {
  id: string;
  name: string;
  servingCount: number;
  totalCalories: number;
  totalProteinGrams: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};
```

### 6.12 RecipeIngredient

```ts
export type RecipeIngredient = {
  id: string;
  recipeId: string;
  foodId: string;
  amount: number;
  unit: string;
  calories: number;
  proteinGrams: number;
};
```

---

## 7. Repository設計

### 7.1 基本方針

画面やhooksは、Dexie実装を直接知らない。

必ずRepository interfaceを経由する。

### 7.2 例：BodyRecordRepository

```ts
export type BodyRecordRepository = {
  create(input: BodyRecord): Promise<void>;
  update(id: string, input: Partial<BodyRecord>): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<BodyRecord | undefined>;
  findRecent(days: number): Promise<BodyRecord[]>;
  findByDate(date: string): Promise<BodyRecord | undefined>;
};
```

### 7.3 将来移植時の差し替え

初期MVP:

```text
BodyRecordRepository
  ↓
IndexedDB / Dexie implementation
```

将来React Native + Expo移植時:

```text
BodyRecordRepository
  ↓
SQLite implementation
```

---

## 8. 主要ロジック

### 8.1 筋トレローテーション

```ts
export type PlanDay = 'DAY_1' | 'DAY_2' | 'DAY_3' | 'DAY_4' | 'DAY_5';

const rotation: PlanDay[] = ['DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5'];

export function getNextPlanDay(lastCompletedDay?: PlanDay): PlanDay {
  if (!lastCompletedDay) {
    return 'DAY_1';
  }

  const currentIndex = rotation.indexOf(lastCompletedDay);
  const nextIndex = (currentIndex + 1) % rotation.length;

  return rotation[nextIndex];
}
```

### 8.2 レシピ栄養計算

```ts
export function calculateNutritionByAmount(input: {
  baseAmount: number;
  caloriesPerBase: number;
  proteinPerBase: number;
  amount: number;
}) {
  const ratio = input.amount / input.baseAmount;

  return {
    calories: input.caloriesPerBase * ratio,
    proteinGrams: input.proteinPerBase * ratio,
  };
}
```

### 8.3 直近7日間集計

直近7日間は、今日を含む7日間とする。

例:

- 今日が2026-06-23の場合
- 対象期間は2026-06-17〜2026-06-23

---

## 9. テスト方針

### 9.1 単体テスト

対象:

- 目標カロリー計算
- たんぱく質目標計算
- BMI計算
- 筋トレローテーション
- レシピ栄養計算
- 直近7日間集計

### 9.2 コンポーネントテスト

対象:

- 体重記録フォーム
- 食材登録フォーム
- レシピ登録フォーム
- 食事記録フォーム
- 筋トレ記録フォーム

### 9.3 E2Eテスト

対象:

- 初期設定を保存する
- 体重を記録する
- 食材を追加する
- レシピを作成する
- 食事を記録する
- 筋トレを完了する
- グラフ画面で直近7日間を確認する

---

## 10. CI方針

Pull Request作成時に以下を実行する。

```bash
npm ci
npm run lint
npm run test
npm run build
```

必要に応じて後続でPlaywright E2Eを追加する。

---

## 11. 環境方針

### 11.1 Local

自分のPCで開発・手動確認する。

### 11.2 Preview

Vercel Previewなどを利用して、PR単位でスマホ確認する。

### 11.3 Production

mainブランチを本番としてデプロイし、日常利用する。

注意:

- IndexedDBはドメイン単位で保存される
- localhost、Preview URL、Production URLのデータは別物として扱われる
- 日常利用はProduction URLに統一する

---

## 12. セキュリティ・プライバシー方針

初期MVPでは認証なし、ローカル保存のみとする。

注意:

- 公開URLを知っている人はアプリ画面自体にアクセスできる
- ただし記録データは各端末・ブラウザ内に保存される
- 後続フェーズで簡易パスコードを検討する
- 食事写真や体重データはクラウドに保存しない

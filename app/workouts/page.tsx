import { TodayWorkoutCard } from '../../features/workout/components/TodayWorkoutCard';
import { INITIAL_WORKOUT_PLANS, listInitialWorkoutExercisesByPlan } from '../../features/workout/initial-data';
import { formatWorkoutExerciseSummary, formatWorkoutPlanTitle } from '../../features/workout/components/WorkoutPlanList';

export default function WorkoutsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col gap-5 bg-orange-50 px-4 py-6 text-slate-900">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">きろくま筋トレ</p>
        <h1 className="mt-2 text-2xl font-bold">今日のメニューを確認</h1>
        <p className="mt-2 text-sm text-slate-600">最後に完了したDayの次を、今日の筋トレとして表示します。</p>
      </section>

      <TodayWorkoutCard />

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-orange-600">メニュー一覧</p>
        <h2 className="mt-2 text-xl font-bold">Day1〜Day5</h2>
        <p className="mt-2 text-sm text-slate-600">初期メニューも確認できます。</p>
      </section>

      {INITIAL_WORKOUT_PLANS.map((plan) => (
        <section key={plan.id} className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-orange-600">{plan.dayCode.replace('DAY_', 'Day')}</p>
          <h2 className="mt-1 text-lg font-bold">{formatWorkoutPlanTitle(plan)}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {listInitialWorkoutExercisesByPlan(plan.id).map((exercise) => (
              <li key={exercise.id} className="rounded-2xl bg-orange-100 p-3">
                {formatWorkoutExerciseSummary(exercise)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

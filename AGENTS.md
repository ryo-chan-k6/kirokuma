# AGENTS.md

## Project

This repository contains `きろくま`, a personal fitness and diet tracking web app.

The app is designed for one user and focuses on:

- Body weight tracking
- Body fat percentage tracking
- Strength training rotation
- Workout logs
- Cardio logs
- Meal logs
- Meal photos
- Food master data
- Recipe-based calorie and protein calculation
- Recent 7-day analytics

The initial implementation target is a Web browser app using Next.js. However, the architecture should keep future migration to React Native + Expo in mind.

---

## Product Principles

- The app should feel friendly, simple, and easy to continue using every day.
- User-facing labels and messages must be in Japanese.
- The primary target is smartphone browser usage.
- Use mobile-first layouts.
- Prioritize fast daily input over overly complex features.
- Do not add cloud sync, login, or external APIs unless explicitly requested.
- Keep the app suitable for personal local use.

---

## Tech Stack

Use the following stack unless the task explicitly says otherwise.

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Dexie.js
- IndexedDB
- Recharts
- date-fns
- Vitest
- Testing Library
- Playwright, when E2E tests are explicitly requested

---

## Architecture Rules

Follow the architecture in `docs/architecture.md`.

Important rules:

- Do not call Dexie directly from React components.
- Do not put business logic directly in `app/` page components.
- Use feature-based modules under `features/`.
- Use repository interfaces for data access.
- Put IndexedDB/Dexie implementations under `infrastructure/indexeddb/`.
- Keep domain logic and calculations independent from UI components.
- Keep reusable calculation logic under `lib/` or the relevant feature module.
- Make logic testable with Vitest.
- Prefer pure functions for:
  - BMI calculation
  - Calorie target calculation
  - Protein target calculation
  - Workout rotation
  - Recipe nutrition calculation
  - Recent 7-day aggregation

---

## Directory Guidelines

Use this directory structure as the target shape.

```text
app/
components/
features/
infrastructure/
lib/
docs/
tests/
```

Feature modules should generally look like this.

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

---

## UI Guidelines

- User-facing text must be Japanese.
- Use a friendly and familiar tone.
- Use `きろくま` as the app display name.
- Use smartphone-first layouts.
- Keep forms short and easy to input.
- Use large tap targets.
- Avoid dense tables on mobile screens.
- Prefer cards, sections, and bottom navigation for mobile usability.
- Do not over-design. Keep the MVP simple.

---

## Data Storage Rules

Initial MVP uses local browser storage only.

- Use IndexedDB via Dexie.js.
- Store meal photo data locally.
- Do not introduce Supabase, Firebase, S3, or any cloud storage unless explicitly requested.
- Do not introduce user authentication unless explicitly requested.
- Remember that data is browser/domain-specific.

---

## Testing Rules

When implementing logic, add tests where reasonable.

Prioritize tests for:

- Workout rotation
- Nutrition calculation
- BMI calculation
- Target calorie calculation
- Target protein calculation
- Recent 7-day aggregation
- Repository behavior, if practical
- Form validation schemas

Before completing an implementation task, run the following commands if available:

```bash
npm run lint
npm run test
npm run build
```

If a command does not exist yet, state that clearly in the final report instead of inventing results.

---

## Scope Control

Do not implement features outside the requested Issue or task.

Examples of out-of-scope features unless explicitly requested:

- Login
- Cloud sync
- AI food photo analysis
- Apple Health integration
- Push notifications
- React Native + Expo implementation
- App Store distribution
- Multi-user support
- Server-side database
- External nutrition APIs

---

## Git / PR Guidelines

When working on a task:

- Read the relevant docs first.
- Keep changes focused.
- Prefer one feature per PR.
- Include a short summary of changes.
- Include tests when logic is added.
- Mention commands run and their results.
- Mention any skipped checks and why.
- Do not claim that tests passed unless they were actually run.

Suggested PR summary format:

```md
## Summary

- ...

## Tests

- [ ] npm run lint
- [ ] npm run test
- [ ] npm run build

## Notes

- ...
```

---

## Current Product Decisions

- App name: きろくま
- Repository/project name: kirokuma
- Initial target: Web browser app
- Main use case: smartphone browser
- Future direction: possible React Native + Expo migration
- Login: not included in MVP
- Storage: local IndexedDB
- Primary analysis period: recent 7 days
- Workout mode: rotation-based, not weekday-fixed
- Meal photo support: included in Phase 1
- Notification: app-internal reminders first; browser/PWA notifications later

---

## Important References

Before implementation, check these files when relevant:

- `docs/requirements.md`
- `docs/architecture.md`
- `docs/issues.md`

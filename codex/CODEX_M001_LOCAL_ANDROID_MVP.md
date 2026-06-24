# Codex Prompt — M001 Local Android MVP

Use this prompt in Codex to start the implementation of the first usable Android version of Ascend System.

---

## Role

You are an expert React Native / Expo / TypeScript Android engineer.

You are working in the GitHub repository:

`aljo98/solo-leveling-app`

Build the first **local-first Android MVP** of Ascend System.

The app is an ADHD-friendly personal training and daily quest system inspired by RPG progression, but it must not copy any anime IP, names, logos, UI, or terminology from existing works.

The first target device is **Samsung Galaxy S25 Plus**. Prioritize Android. Do not spend time on web-specific polish yet.

Use stable Expo SDK 56 or newer if available in the environment. Target Android 16 / API 36 compatibility. Keep code forward-compatible with Android 17 / API 37, but do not depend on beta-only Android 17 features.

---

## Read first

Before coding, read these files:

1. `README.md`
2. `PLAN.md`
3. `ARCHITECTURE.md`
4. `SKILLS.md`
5. `MILESTONES.md`
6. `docs/ANDROID_TWO_PHASE_ROADMAP.md`

Then implement only M001 from the roadmap.

---

## Product goal

Build a local Android app that helps the user complete small daily body quests for 14 days.

The first MVP must prove this loop:

1. Open app.
2. Do daily check-in.
3. App determines day mode.
4. App proposes one main quest.
5. User starts guided quest.
6. User completes, pauses, or safely stops.
7. App logs result locally.
8. User gets XP and sees 7/14-day progress.

No cloud. No AI. No Garmin. No Google Calendar. No login.

---

## Non-negotiable UX rules

The app must be ADHD-friendly and shame-free.

Do not use language like:

- failed
- lazy
- weak
- streak broken
- missed workout
- punishment

Use language like:

- quest paused
- recovery route activated
- comeback bonus available
- minimum quest completed
- return to rhythm
- today still counts

The app must always offer a tiny next step on bad days.

---

## Required stack

If the repo has no app yet, create a new Expo app structure in the repository.

Use:

- Expo
- React Native
- TypeScript
- Expo Router
- local storage with `expo-sqlite` preferred; if this blocks progress, use `@react-native-async-storage/async-storage` temporarily behind a storage interface
- no Firebase
- no backend
- no AI provider calls
- no external health integrations

Prefer simple, testable domain modules over complex UI.

---

## Suggested folder structure

Create or adapt this structure:

```txt
app/
  _layout.tsx
  index.tsx
  quest/[id].tsx
  journal.tsx
  progress.tsx
src/
  core/
    readiness/
      dayMode.ts
      readinessEngine.ts
    quest/
      questTypes.ts
      questTemplates.ts
      questEngine.ts
    training/
      exerciseTypes.ts
      exerciseLibrary.ts
      workoutGenerator.ts
    xp/
      xpTypes.ts
      xpEngine.ts
    safety/
      safetyRules.ts
  storage/
    storage.ts
    localStore.ts
  ui/
    theme.ts
    components/
      Card.tsx
      PrimaryButton.tsx
      StatPill.tsx
      QuestCard.tsx
      CheckInForm.tsx
      WorkoutStepCard.tsx
```

If you choose a slightly different structure, keep the same domain separation.

---

## Domain models

Implement these TypeScript types or close equivalents.

```ts
export type Equipment =
  | 'none'
  | 'jump_rope'
  | 'resistance_band'
  | 'pullup_bar'
  | 'rings'
  | 'dumbbells';

export type BodyGoal = {
  primary: 'shoulders_arms_athletic_base';
  secondary: ('endurance' | 'posture' | 'confidence')[];
  constraints: string[];
  equipment: Equipment[];
};

export type CheckIn = {
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  bodyPain: boolean;
  timeAvailableMin: 5 | 10 | 20 | 40;
  note?: string;
};

export type DayMode = 'green' | 'yellow' | 'red' | 'crisis';

export type QuestCategory =
  | 'strength'
  | 'endurance'
  | 'mobility'
  | 'recovery'
  | 'journal'
  | 'minimum';

export type QuestStep = {
  id: string;
  label: string;
  instruction: string;
  targetReps?: number;
  targetSeconds?: number;
  restSeconds?: number;
};

export type Quest = {
  id: string;
  title: string;
  category: QuestCategory;
  dayMode: DayMode;
  durationMin: number;
  xpReward: number;
  reason: string;
  steps: QuestStep[];
};

export type PlayerStat =
  | 'strength'
  | 'endurance'
  | 'mobility'
  | 'recovery'
  | 'focus'
  | 'discipline'
  | 'mindset';
```

---

## Day mode rules

Implement deterministic rules:

```ts
function determineDayMode(checkIn: CheckIn): DayMode {
  if (checkIn.mood === 1 && checkIn.energy <= 2) return 'crisis';
  if (checkIn.bodyPain) return 'red';
  if (checkIn.energy <= 2 || checkIn.mood <= 2 || checkIn.focus <= 2) return 'red';
  if (checkIn.energy === 3 || checkIn.mood === 3 || checkIn.stress >= 4) return 'yellow';
  return 'green';
}
```

Do not present this as medical triage. It is only an adaptive difficulty mode.

For `crisis`, show a gentle local-only safety-support screen:

- no diagnosis
- no emergency claims unless user is in immediate danger
- suggest contacting a trusted person
- suggest a tiny grounding action
- offer a minimum quest only if the user wants it

Do not create self-harm content or detailed crisis instructions.

---

## Quest generation rules

Implement `generateDailyQuest(checkIn, profile, history): Quest`.

Initial behavior:

- `green` + 20/40 min → strength quest focused on shoulders/arms/athletic base.
- `yellow` → short 12–18 min bodyweight quest.
- `red` → 5 min minimum quest.
- `crisis` → grounding/recovery quest with no pressure.
- `bodyPain` → mobility/recovery quest.
- If yesterday was hard, avoid another high-intensity day.

First quest templates:

### Strength — Shoulders / Arms Base

Steps:

1. Warmup shoulder circles — 60 sec
2. Incline or normal push-ups — 3 sets
3. Resistance band row or inverted row — 3 sets
4. Pike push-up progression — 2 sets
5. Plank — 2 sets

### Short Strength — Yellow Day

1. 2 min easy warmup
2. Incline push-ups — 2 sets
3. Squats — 2 sets
4. Band rows / towel rows — 2 sets
5. Breath reset — 60 sec

### Minimum Quest — Red Day

1. Stand up and drink water
2. 10 wall push-ups or 5 incline push-ups
3. 20 bodyweight squats or 2 min walk
4. 3 slow breaths
5. Mark today as still counted

### Cardio — Jump Rope / Easy Run

1. Warmup walk — 3 min
2. Jump rope easy intervals or easy run — 8–15 min
3. Cooldown walk — 2 min

### Recovery

1. Neck reset
2. Shoulder mobility
3. Chest doorway stretch
4. 2 min calm breathing

---

## Screens

### Home / Daily System

Show:

- player status
- today mode
- check-in form if not done
- generated quest card
- start button
- progress summary

### Quest Detail / Workout HUD

Show:

- quest title
- reason why this quest was selected
- steps
- current step
- timer / reps
- Done button
- Pause button
- Easier version button
- Stop safely button

### Journal

Show:

- short reflection after quest
- effort 1–5
- mood after 1–5
- pain yes/no
- optional note

### Progress

Show:

- 7-day consistency
- 14-day log
- XP by stat
- completed quests
- comeback bonuses

---

## Visual style

Use a dark system UI inspired by a personal RPG overlay, but keep it clean and readable.

Design tokens:

- background: near black / obsidian
- surface: dark blue-gray
- primary accent: cyan
- secondary accent: violet
- warning: amber
- overload/red only for safety warnings, not shame

Accessibility:

- large tap targets
- readable font sizes
- reduced motion friendly
- good contrast
- no excessive animation in M001

---

## Storage

Create a storage abstraction so local implementation can later be replaced by cloud sync.

Store locally:

- player profile
- check-ins
- generated quests
- quest completion logs
- XP totals
- journal reflections

Do not store sensitive medical interpretations.

---

## Tests

Add simple unit tests for:

- `determineDayMode`
- `generateDailyQuest`
- `calculateXp`
- minimum quest generation
- comeback bonus logic

If test tooling is not yet present, add a minimal test setup compatible with the Expo/TypeScript project.

---

## Acceptance criteria

M001 is done when:

1. App runs on Android emulator and can be installed/tested on Samsung Galaxy S25 Plus.
2. User can complete onboarding.
3. User can do daily check-in.
4. App generates day mode.
5. App generates one appropriate quest.
6. User can start and complete guided quest.
7. User can pause or stop without failure language.
8. XP is calculated locally.
9. Progress screen shows 7/14-day activity.
10. App works without internet.
11. No Firebase, no AI, no Garmin, no Calendar sync in M001.
12. Code is modular enough for future M002-M009 phases.

---

## First implementation steps

1. Inspect repository structure.
2. If no app exists, initialize Expo app in-place without deleting existing docs.
3. Add TypeScript strict config.
4. Add Expo Router screens.
5. Build theme and basic components.
6. Implement domain types.
7. Implement day mode engine.
8. Implement quest templates and generator.
9. Implement local storage.
10. Implement screens.
11. Add tests.
12. Run typecheck and tests.
13. Provide a concise summary of what changed and what commands to run.

---

## Commands to prefer

Use modern package tooling available in the environment. Suggested:

```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router expo-sqlite react-native-safe-area-context react-native-screens expo-haptics expo-constants
npm install -D jest ts-jest @types/jest
```

If initializing in a non-empty repo causes conflicts, create the app structure manually or use a temporary directory and copy files carefully. Do not delete existing planning docs.

---

## Final response expected from Codex

When finished, report:

- files created/changed,
- how to run Android app,
- what works,
- what is intentionally not included,
- known limitations,
- next recommended task.

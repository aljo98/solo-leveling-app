# Ascend System — Two Phase Android Roadmap

## Namen

Ta dokument zoža prvotni širok produktni plan v dve jasni izvedbeni fazi:

1. **14-dnevni osnovni Android MVP** — lokalna aplikacija, ki mora dejansko pomagati pri konsistentnosti, treningu in vračanju v telo.
2. **Napredni sistem** — cloud, AI mentor, Garmin/Health Connect, Calendar sync, napredna periodizacija in dolgoročna osebna platforma.

Glavni cilj ni najprej zgraditi veliko platformo, ampak dokazati, da aplikacija Aljažu pomaga narediti majhen trening tudi ob ADHD, padcu volje, sramu, slabšem dnevu ali izgubi občutka prihodnosti.

---

# Tehnično izhodišče

## Ciljna naprava

- Primarna naprava: **Samsung Galaxy S25 Plus**.
- Cilj: Android aplikacija, optimizirana za Samsung / One UI okolje.
- Trenutno izvedbeno izhodišče: **Android 16 / API 36** kot stabilna ciljna platforma.
- Projekt naj bo forward-compatible za Android 17 / API 37, vendar naj se prvi MVP ne veže na beta funkcionalnosti.

## Predlagan stack za M001

- Expo SDK 56 ali novejši stabilen SDK.
- React Native + TypeScript.
- Android-first; web je kasnejši bonus, ne del M001.
- Expo Router.
- Local-first storage: `expo-sqlite` ali začasno `AsyncStorage`, če je hitrejše za prototip.
- Brez Firebase v M001.
- Brez AI v M001.
- Brez Garmin/Health Connect v M001.
- Brez Google Calendar synca v M001.

## Zakaj local-first

Prvi cilj je dokazati dnevni loop. Cloud, AI in integracije ne smejo blokirati osnovne uporabnosti.

Če aplikacija v 14 dneh ne pomaga pri osnovnem gibanju, nima smisla dodajati kompleksnih integracij.

---

# Faza 1 — M001: 14-dnevni osnovni Android MVP

## Ime faze

**M001 — Local Daily Training Loop**

## Glavni cilj

Zgraditi Android aplikacijo, ki vsak dan omogoči:

1. hitro odprtje aplikacije,
2. check-in stanja,
3. avtomatsko izbiro težavnosti dneva,
4. predlog enega glavnega questa,
5. izvedbo treninga ali minimalnega koraka,
6. zaključek z XP in kratko refleksijo,
7. pregled 14-dnevne kontinuitete.

## Ključna filozofija

Aplikacija ne sme kaznovati uporabnika.

Prepovedan je jezik:

- failed,
- broken streak,
- missed workout,
- lazy,
- weak,
- shame,
- punishment.

Uporabi raje:

- quest paused,
- recovery route activated,
- comeback bonus available,
- minimum quest completed,
- return to rhythm,
- today still counts.

## 14-dnevni dokaz uspeha

M001 je uspešen, če lahko Aljaž 14 dni uporablja aplikacijo in ima:

- vsaj 10 dni z opravljenim vsaj minimalnim questom,
- vsaj 4 realne strength treninge,
- vsaj 3 lahke cardio ali kolebnica dneve,
- vsaj 7 kratkih check-in zapisov,
- občutek, da aplikacija zmanjša trenje pri začetku.

---

## M001 funkcionalnosti

### 1. Onboarding

Minimalen onboarding, največ 5 zaslonov:

1. ime igralca / player name,
2. glavni cilj telesa,
3. oprema,
4. omejitve in bolečine,
5. stil mentor tona.

Privzeti glavni cilj:

```ts
type BodyGoal = {
  primary: 'shoulders_arms_athletic_base';
  secondary: ['endurance', 'posture', 'confidence'];
  constraints: string[];
  equipment: Equipment[];
};
```

Oprema:

```ts
type Equipment =
  | 'none'
  | 'jump_rope'
  | 'resistance_band'
  | 'pullup_bar'
  | 'rings'
  | 'dumbbells';
```

### 2. Daily check-in

Vsak dan samo hitro:

```ts
type CheckIn = {
  date: string;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  bodyPain: boolean;
  timeAvailableMin: 5 | 10 | 20 | 40;
  note?: string;
};
```

### 3. Day mode engine

Aplikacija iz check-ina določi stanje dneva:

```ts
type DayMode = 'green' | 'yellow' | 'red' | 'crisis';
```

Pravila:

- **green**: dovolj energije → glavni trening.
- **yellow**: srednji dan → krajša verzija.
- **red**: slab dan → minimum quest.
- **crisis**: zelo slab dan → brez pritiska XP, samo grounding, hoja, dihanje, kratek zapis, stik z osebo.

V M001 ni medicinske interpretacije. To je samo uporabniški način prilagoditve težavnosti.

### 4. Quest generator

Quest generator mora biti deterministicen rule engine.

```ts
type QuestCategory =
  | 'strength'
  | 'endurance'
  | 'mobility'
  | 'recovery'
  | 'journal'
  | 'minimum';

type Quest = {
  id: string;
  title: string;
  category: QuestCategory;
  dayMode: DayMode;
  durationMin: number;
  xpReward: number;
  reason: string;
  steps: QuestStep[];
};

type QuestStep = {
  id: string;
  label: string;
  instruction: string;
  targetReps?: number;
  targetSeconds?: number;
  restSeconds?: number;
};
```

Primeri:

- green → upper push/pull ali shoulders/arms trening,
- yellow → 12-minutni bodyweight circuit,
- red → 5-minutni minimum quest,
- pain → mobility/recovery,
- low mood + low energy → walk + journal + breath reset.

### 5. Osnovna knjižnica vaj

Prva knjižnica naj bo majhna.

Strength:

- push-up progression,
- incline push-up,
- pike push-up,
- inverted row / resistance band row,
- chair dip / bench dip,
- lateral raise z elastiko,
- face pull z elastiko,
- squat,
- plank,
- hollow hold.

Cardio:

- easy run,
- brisk walk,
- jump rope easy intervals.

Recovery:

- shoulder circles,
- doorway chest stretch,
- thoracic opener,
- neck reset,
- breath reset.

### 6. Workout HUD

Workout zaslon mora imeti:

- velik naslov questa,
- trenutni korak,
- timer ali reps target,
- gumb `Done`,
- gumb `Too hard → easier version`,
- gumb `Pause`,
- gumb `Stop safely`,
- brez vizualnega kaznovanja ob prekinitvi.

### 7. XP in rank MVP

XP naj bo enostaven in transparenten:

```ts
type PlayerStat =
  | 'strength'
  | 'endurance'
  | 'mobility'
  | 'recovery'
  | 'focus'
  | 'discipline'
  | 'mindset';
```

Pravila:

- minimal quest daje malo XP, ampak šteje za kontinuiteto,
- red day completion lahko da `comeback bonus`,
- prevelik trening ob slabem dnevu ne sme dati več XP samo zato, ker je težji,
- consistency > hero day.

### 8. Journal / reflection

Po questu:

- effort 1–5,
- mood after 1–5,
- pain yes/no,
- short note.

Če uporabnik noče pisati, mora biti možno samo klikniti `Skip note`.

### 9. Progress dashboard

Za M001 samo:

- today status,
- 7-day consistency,
- 14-day quest log,
- XP by stat,
- body focus progress: shoulders/arms/endurance/recovery.

---

# Faza 1 — izvedbeni vrstni red

## Dan 1–2: Project foundation

- Ustvari Expo Android app.
- TypeScript strict.
- Expo Router.
- Dark theme design tokens.
- Home screen skeleton.
- Local storage abstraction.

## Dan 3–4: Onboarding + local profile

- Player profile.
- Body goal.
- Equipment.
- Constraints.
- Persist profile locally.

## Dan 5–6: Daily check-in + day mode engine

- Check-in form.
- DayMode engine.
- Unit tests for day mode rules.

## Dan 7–8: Quest engine

- Quest templates.
- Rule-based quest generation.
- Reason text: why this quest today.
- Unit tests.

## Dan 9–10: Workout HUD

- Step-by-step execution.
- Timer / reps.
- Pause / stop / easier version.
- Completion log.

## Dan 11–12: XP + progress

- XP calculation.
- Stat progress.
- Comeback bonus.
- 7/14 day dashboard.

## Dan 13: Polish and Samsung S25+ testing

- Test on Samsung S25+.
- Check gestures, safe areas, font scaling, dark mode, battery behavior.
- Ensure quick start is fast.

## Dan 14: Real use review

- Use app for a real daily quest.
- Note friction points.
- Create backlog for next iteration.

---

# Faza 2 — Advanced Ascend System

Napredni del se začne šele, ko M001 deluje lokalno in ga Aljaž dejansko uporablja.

## M002 — Training Depth

- Več vaj.
- Progresije za ramena, roke, hrbet, prsni koš, noge.
- Periodizacija.
- Deload logika.
- Exercise assets / animacije.
- Pain-aware modifications.

## M003 — Cloud Sync and Identity

- Firebase Auth ali alternativa.
- Firestore/Supabase sync.
- Backup/restore.
- Multi-device support.
- Sensitive data boundaries.

## M004 — AI Mentor Memory

- AI mentor prek backend-a.
- Tedenski review.
- Pattern detection.
- ADHD coaching.
- Safety guardrails.
- Mentor memory z minimalnim deljenjem občutljivih podatkov.

## M005 — Calendar Integration

- Dedicated calendar: Ascend Quests.
- One-way sync app → calendar.
- Later: two-way rescheduling.

## M006 — Health Connect / Garmin

- HealthDataProvider abstraction.
- Manual input remains fallback.
- Health Connect spike.
- Garmin path only if legally/technically practical.
- Readiness model v2.

## M007 — Advanced Readiness

- Sleep / HRV / resting HR / stress / training load.
- Recovery-aware progression.
- Overload warnings.
- Better deload suggestions.

## M008 — Biomarker Module

- Manual lab input.
- PDF import.
- OCR extraction.
- Non-diagnostic explanations.
- Trends only, no medical diagnosis.

## M009 — Release Hardening

- Privacy review.
- Backup.
- Tests.
- Accessibility.
- Animations.
- Android app bundle.
- Optional Play Store internal testing.

---

# Kaj NE delamo v M001

- Ne delamo AI mentorja.
- Ne delamo Firebase.
- Ne delamo Garmin integracije.
- Ne delamo Google Calendar synca.
- Ne delamo biomarkerjev.
- Ne delamo social funkcij.
- Ne delamo web dashboarda.
- Ne delamo popolnega skill treeja.

M001 mora najprej dokazati: **ali lahko aplikacija pomaga Aljažu držati stik s telesom 14 dni?**

---

# Prva definicija uspeha

Aplikacija je uspešna, če Aljažu ne daje občutka kazni, ampak občutek:

> Danes lahko naredim majhen korak. Tudi slab dan še vedno šteje.

To je jedro Ascend Systema.

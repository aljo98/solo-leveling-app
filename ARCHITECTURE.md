# Ascend System - Architecture and Functional Flows

## Namen

Ta dokument je tehnicni blueprint za zacetek implementacije. Bralec naj po branju razume, katere komponente potrebujemo, kako podatki tecejo skozi sistem in kako se izvajajo glavne funkcionalnosti.

Primarni bralec je prihodnji razvijalec aplikacije. Glavna akcija po branju: zaceti graditi Expo/Firebase projekt brez ponovnega odpiranja produktnih odlocitev.

## Arhitekturna nacela

- Offline-first za dnevne queste, dnevnik in vodene vaje.
- Cloud sync za profil, zgodovino, XP, ranke, AI memory in web dashboard.
- Vse obcutljive zunanje integracije tecejo prek backend sloja.
- AI nikoli ne klice aplikacija direktno; klici gredo prek server-side funkcij.
- Health vir mora biti zamenljiv: rocni vnos, Health Connect, Garmin API ali kasnejsi vir.
- Quest generator zacne kot deterministicen rule engine, AI najprej razlaga in personalizira, ne odloca vsega sam.
- Anime RPG UI je predstavitveni sloj; jedro logike mora ostati testabilno in neodvisno od animacij.

## System context

```mermaid
flowchart LR
  User["User"] --> Android["Android app"]
  User --> Web["Web app"]

  Android --> Auth["Firebase Auth"]
  Web --> Auth

  Android <--> Firestore["Firestore"]
  Web <--> Firestore

  Android <--> LocalDB["Local SQLite cache"]
  Web <--> BrowserCache["Web offline cache"]

  Firestore --> Functions["Cloud Functions or Cloud Run"]
  Functions --> AI["AI provider"]
  Functions --> Calendar["Google Calendar API"]
  Functions --> Storage["Cloud Storage"]

  Android --> HealthConnect["Android Health Connect"]
  HealthConnect --> GarminApp["Garmin Connect app"]

  GarminCloud["Garmin Health API"] --> Functions
  LabApps["Lab or pee test apps"] --> Functions

  Functions --> Firestore
```

## Target architecture

```mermaid
flowchart TB
  subgraph Client["React Native / Expo clients"]
    UI["System UI and screens"]
    Navigation["Expo Router"]
    AppState["Client state"]
    LocalStore["SQLite and secure local storage"]
    SyncQueue["Offline sync queue"]
    Domain["Domain engines"]
    Animations["Reanimated motion layer"]
  end

  subgraph DomainEngines["Domain engines"]
    Readiness["Readiness engine"]
    Quest["Quest engine"]
    XP["XP and rank engine"]
    SkillTree["Skill tree engine"]
    Workout["Workout player"]
    Journal["Journal parser"]
  end

  subgraph Backend["Firebase / Google Cloud backend"]
    Auth["Firebase Auth"]
    DB["Firestore"]
    Functions["Cloud Functions or Cloud Run"]
    Files["Cloud Storage"]
    Secrets["Secret Manager"]
  end

  subgraph External["External services"]
    GoogleCal["Google Calendar"]
    Health["Health Connect or Garmin"]
    Labs["Blood work / pee test providers"]
    Model["AI model API"]
  end

  UI --> Navigation
  UI --> AppState
  AppState --> Domain
  Domain --> DomainEngines
  DomainEngines --> LocalStore
  LocalStore --> SyncQueue
  SyncQueue <--> DB
  DB --> Functions
  Functions --> Secrets
  Functions --> GoogleCal
  Functions --> Health
  Functions --> Labs
  Functions --> Model
  Functions --> Files
  Functions --> DB
```

## Client module map

```mermaid
flowchart LR
  subgraph Screens["Screens"]
    Home["Daily System"]
    QuestScreen["Quest detail"]
    WorkoutScreen["Workout HUD"]
    JournalScreen["Journal"]
    StatsScreen["Stats and ranks"]
    MentorScreen["Mentor"]
    SettingsScreen["Settings"]
  end

  subgraph Services["Client services"]
    AuthService["Auth service"]
    DataService["Data service"]
    OfflineService["Offline service"]
    HealthService["Health data service"]
    CalendarService["Calendar sync service"]
    MentorService["Mentor client"]
  end

  subgraph Core["Core logic"]
    QuestEngine["Quest engine"]
    XPSystem["XP system"]
    ReadinessEngine["Readiness engine"]
    SkillSystem["Skill system"]
    SafetyRules["Safety rules"]
  end

  Screens --> Services
  Services --> Core
  Core --> Services
```

## Backend module map

```mermaid
flowchart TB
  Trigger["HTTP call or scheduled trigger"] --> Guard["Auth and permission guard"]
  Guard --> Router["Function router"]

  Router --> MentorFn["Mentor function"]
  Router --> PlanFn["Daily plan function"]
  Router --> CalendarFn["Calendar sync function"]
  Router --> HealthFn["Health import function"]
  Router --> BiomarkerFn["Biomarker import function"]

  MentorFn --> AIGateway["AI gateway"]
  PlanFn --> Rules["Quest and readiness rules"]
  CalendarFn --> GoogleCal["Google Calendar API"]
  HealthFn --> HealthProviders["Garmin / Health provider adapters"]
  BiomarkerFn --> OCR["OCR / document extraction"]

  AIGateway --> DB["Firestore"]
  Rules --> DB
  GoogleCal --> DB
  HealthProviders --> DB
  OCR --> DB
```

## Core data model

```mermaid
erDiagram
  USER ||--|| PLAYER_PROFILE : owns
  USER ||--o{ GOAL : defines
  USER ||--o{ JOURNAL_ENTRY : writes
  USER ||--o{ HEALTH_SAMPLE : imports
  USER ||--o{ DAILY_PLAN : receives
  USER ||--o{ WORKOUT_SESSION : performs
  USER ||--o{ MENTOR_MESSAGE : receives
  USER ||--o{ BIOMARKER_RESULT : stores

  PLAYER_PROFILE ||--o{ PLAYER_STAT : has
  PLAYER_STAT ||--o{ SKILL_NODE : unlocks

  DAILY_PLAN ||--o{ QUEST_INSTANCE : contains
  QUEST_TEMPLATE ||--o{ QUEST_INSTANCE : creates
  QUEST_INSTANCE ||--o{ QUEST_STEP : includes
  QUEST_INSTANCE ||--|| WORKOUT_SESSION : may_start

  HEALTH_SAMPLE ||--o{ READINESS_SCORE : contributes
  JOURNAL_ENTRY ||--o{ READINESS_SCORE : contributes
  WORKOUT_SESSION ||--o{ READINESS_SCORE : contributes

  DAILY_PLAN ||--|| CALENDAR_SYNC_RECORD : syncs
  JOURNAL_ENTRY ||--o{ MENTOR_MEMORY : summarizes
  HEALTH_SAMPLE ||--o{ MENTOR_MEMORY : summarizes
  BIOMARKER_RESULT ||--o{ MENTOR_MEMORY : summarizes

  USER {
    string id PK
    string email
    datetime createdAt
  }

  PLAYER_PROFILE {
    string userId FK
    string displayName
    string rankScheme
    string mentorTone
  }

  QUEST_INSTANCE {
    string id PK
    string status
    string category
    int xpReward
    datetime plannedStart
  }

  HEALTH_SAMPLE {
    string id PK
    string source
    string metric
    float value
    string unit
    datetime measuredAt
  }

  READINESS_SCORE {
    string id PK
    int bodyScore
    int mindScore
    int stressScore
    string reason
  }
```

## Podatkovne meje

```mermaid
flowchart TB
  subgraph Public["Low sensitivity"]
    Theme["Theme preferences"]
    RankLabels["Custom rank labels"]
    ExerciseAssets["Exercise assets"]
  end

  subgraph Personal["Personal data"]
    Goals["Goals"]
    Quests["Quest history"]
    CalendarBlocks["Calendar plan"]
  end

  subgraph Sensitive["Sensitive data"]
    Journal["Journal text"]
    Health["Health metrics"]
    Biomarkers["Blood and pee test results"]
    MentorMemory["AI mentor memory"]
  end

  Public --> Rules1["Standard auth rules"]
  Personal --> Rules2["Per-user access only"]
  Sensitive --> Rules3["Per-user access, encryption-aware design, minimal AI sharing"]
```

## Daily plan flow

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant App as Android/Web app
  participant Local as Local store
  participant DB as Firestore
  participant Fn as Daily plan function
  participant AI as AI mentor gateway
  participant Cal as Google Calendar

  U->>App: Opens Daily System
  App->>Local: Load cached profile, goals, last plan
  App->>DB: Sync latest health, journal, quest history
  DB-->>App: Return latest available data
  App->>Fn: Request today's plan
  Fn->>Fn: Compute readiness
  Fn->>Fn: Generate quest candidates
  Fn->>AI: Ask for explanation and coaching tone
  AI-->>Fn: Mentor feedback
  Fn->>DB: Save daily plan and quest instances
  Fn->>Cal: Create or update calendar blocks
  Cal-->>Fn: Calendar sync result
  Fn-->>App: Daily plan, reasons, warnings
  App->>Local: Cache plan for offline use
  App-->>U: Shows quests and next action
```

## Readiness and quest selection

```mermaid
flowchart TD
  Start["Start daily planning"] --> Inputs["Collect inputs"]
  Inputs --> Health["Health metrics"]
  Inputs --> Journal["Journal feedback"]
  Inputs --> History["Quest and workout history"]
  Inputs --> Calendar["Calendar availability"]
  Inputs --> Goals["Current goals"]

  Health --> Score["Readiness scoring"]
  Journal --> Score
  History --> Score
  Calendar --> Score
  Goals --> Score

  Score --> CheckPain{"Pain or red signal?"}
  CheckPain -->|Yes| RecoveryPlan["Prioritize recovery, mobility, doctor-safe warning"]
  CheckPain -->|No| EnergyCheck{"Low energy or high stress?"}
  EnergyCheck -->|Yes| MinimumQuest["Generate minimum viable quest"]
  EnergyCheck -->|No| TrainingCheck{"Good recovery and available time?"}
  TrainingCheck -->|Yes| MainTraining["Generate strength or endurance quest"]
  TrainingCheck -->|No| BalancedDay["Generate mobility, focus, and light strength mix"]

  RecoveryPlan --> Explain["AI explanation"]
  MinimumQuest --> Explain
  MainTraining --> Explain
  BalancedDay --> Explain
  Explain --> Save["Save daily plan"]
```

## Quest lifecycle

```mermaid
stateDiagram-v2
  [*] --> Proposed
  Proposed --> Accepted: user starts quest
  Proposed --> Replaced: user asks for alternative
  Accepted --> InProgress: timer or first step starts
  InProgress --> Paused: user pauses
  Paused --> InProgress: user resumes
  InProgress --> Completed: completion criteria met
  InProgress --> Abandoned: user stops
  Completed --> Rewarded: XP and skill progress applied
  Abandoned --> Reflected: short feedback captured
  Replaced --> Proposed: new quest generated
  Rewarded --> [*]
  Reflected --> [*]
```

## Guided workout execution

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant App as Workout HUD
  participant Local as Local store
  participant Engine as Workout engine
  participant XP as XP engine
  participant DB as Firestore

  U->>App: Starts mobility or strength quest
  App->>Local: Load offline exercise instructions
  App->>Engine: Start workout session
  Engine-->>App: Current step, timer, cues, warnings
  U->>App: Completes set or exercise
  App->>Engine: Record reps, pain, effort, notes
  Engine->>Engine: Check safety and progression rules
  Engine-->>App: Next step or stop recommendation
  U->>App: Finishes workout
  App->>XP: Calculate XP, stat gain, rank progress
  XP-->>App: Rewards and unlocks
  App->>Local: Save session and rewards offline
  App->>DB: Sync when online
```

## Journal and mentor feedback

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant App as Journal screen
  participant Local as Local store
  participant DB as Firestore
  participant Fn as Mentor function
  participant AI as AI provider

  U->>App: Writes journal and quick ratings
  App->>Local: Save immediately
  App->>DB: Sync journal entry
  DB->>Fn: Trigger journal analysis
  Fn->>Fn: Remove irrelevant data and build safe context
  Fn->>AI: Request summary, pattern signals, next action
  AI-->>Fn: Structured mentor response
  Fn->>DB: Save mentor message and memory update
  DB-->>App: Realtime update
  App-->>U: Shows supportive and critical feedback
```

## Health data import flow

```mermaid
flowchart TD
  Start["Health sync starts"] --> SourceChoice{"Available source?"}
  SourceChoice -->|Manual MVP| Manual["User enters sleep, stress, energy, workout load"]
  SourceChoice -->|Android| HC["Read from Health Connect permissioned data"]
  SourceChoice -->|Garmin approved| Garmin["Import from Garmin Health API"]
  SourceChoice -->|File export| File["Import allowed export file"]

  Manual --> Normalize["Normalize metric names, units, timestamps"]
  HC --> Normalize
  Garmin --> Normalize
  File --> Normalize

  Normalize --> Validate["Validate ranges and detect missing data"]
  Validate --> Store["Store health samples"]
  Store --> Readiness["Update readiness input"]
  Readiness --> QuestPlan["Influence next quest plan"]
```

## Calendar sync flow

```mermaid
sequenceDiagram
  autonumber
  participant Plan as Daily plan
  participant Fn as Calendar sync function
  participant DB as Firestore
  participant Cal as Google Calendar API

  Plan->>Fn: Plan created or changed
  Fn->>DB: Load existing sync records
  alt Existing event found
    Fn->>Cal: Update event
  else No event found
    Fn->>Cal: Create event in Ascend Quests calendar
  end
  Cal-->>Fn: Event id and html link
  Fn->>DB: Save calendar sync record
```

## AI mentor decision boundaries

```mermaid
flowchart LR
  Inputs["Profile, goals, journal summaries, health summaries, quest history"] --> Policy["Safety and privacy filter"]
  Policy --> Prompt["Prompt builder"]
  Prompt --> Model["AI model"]
  Model --> Validator["Response validator"]
  Validator --> MentorMsg["Mentor message"]
  Validator --> PlanHints["Optional plan hints"]

  PlanHints --> RuleEngine["Rule engine decides final quests"]
  RuleEngine --> DailyPlan["Daily plan"]

  Validator --> Escalation{"Medical or injury risk?"}
  Escalation -->|Yes| SafeMsg["Recommend rest, caution, or professional help"]
  Escalation -->|No| MentorMsg
```

AI mentor sme predlagati in razloziti. Koncne naloge v MVP potrdi rule engine, da je obnasanje predvidljivo in testabilno.

## Biomarker future flow

```mermaid
flowchart TD
  Input{"Input source"} --> Manual["Manual biomarker entry"]
  Input --> PDF["Lab PDF or image"]
  Input --> Provider["External provider API"]

  PDF --> Extract["OCR and structured extraction"]
  Provider --> Extract
  Manual --> Normalize["Normalize value, unit, date, source"]
  Extract --> Normalize

  Normalize --> Confidence["Assign confidence score"]
  Confidence --> Review{"Needs user review?"}
  Review -->|Yes| UserConfirm["User confirms or edits"]
  Review -->|No| Store["Store biomarker result"]
  UserConfirm --> Store
  Store --> Trend["Trend analysis"]
  Trend --> Mentor["Non-diagnostic mentor explanation"]
```

## MVP implementation order

```mermaid
flowchart TD
  P1["1. Expo app foundation"] --> P2["2. Theme and navigation"]
  P2 --> P3["3. Google auth and profile"]
  P3 --> P4["4. Local store and offline queue"]
  P4 --> P5["5. Daily check-in and journal"]
  P5 --> P6["6. Quest engine"]
  P6 --> P7["7. XP, rank, skill tree"]
  P7 --> P8["8. Guided mobility and strength quests"]
  P8 --> P9["9. AI mentor backend"]
  P9 --> P10["10. Calendar sync"]
  P10 --> P11["11. Health data spike"]
```

## Najbolj kriticne odlocitve pred kodo

1. Potrditi Firebase kot MVP oblak.
2. Izbrati Garmin/Health Connect prvo integracijsko pot po preverjanju tvojega telefona in ure.
3. Izbrati ton mentorja.
4. Dati ime ali link referencne Google Play aplikacije.
5. Potrditi, ali zacetne vodene vaje temeljijo na tekstu, slikah/animacijah ali videu.

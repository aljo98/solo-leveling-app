# Ascend System - Skills and Capability Map

## Namen

Beseda "skills" ima v tem projektu dva pomena:

1. **Izvedbeni skills** - kompetence in tehnicni moduli, ki jih morava zgraditi, da aplikacija deluje.
2. **In-app skills** - sposobnosti, ki jih uporabnik levelira v aplikaciji.

Ta dokument locuje oboje, da bova pri implementaciji usklajena.

## Izvedbeni skills

### Product design

Potrebno:

- definirati dnevni loop;
- lociti MVP od kasnejsih funkcij;
- ohraniti anime RPG obcutek brez kopiranja tuje IP;
- prilagoditi UX enemu realnemu uporabniku;
- pretvoriti cilje v naloge, XP in ranke.

### ADHD-prijazen UX

Potrebno:

- en jasen naslednji korak;
- kratke naloge z "quick start" gumbom;
- minimalno odlocanja ob nizki energiji;
- forgiving streak sistem;
- fallback "minimum quest" za slabe dni;
- motivacijski, a ne sramotilen feedback;
- onboarding, ki ne zahteva prevec vnosa naenkrat.

### React Native / Expo engineering

Potrebno:

- Android in web build;
- TypeScript;
- navigacija;
- lokalni storage;
- offline-first tokovi;
- responsive layout za telefon in web;
- native permissions za health/calendar integracije.

### Cloud and authentication

Potrebno:

- Google login;
- varno shranjevanje user podatkov;
- sinhronizacija med Android in web;
- server-side funkcije za AI in zunanje API-je;
- pravila dostopa do health in dnevnik podatkov.

### Health data integration

Potrebno:

- Garmin/Health Connect raziskava;
- HealthDataProvider abstrakcija;
- normalizacija metrik iz razlicnih virov;
- rocni vnos kot fallback;
- razumevanje zamikov, manjkajocih podatkov in dovoljenj;
- varna hramba obcutljivih podatkov.

### Training logic

Potrebno:

- osnovna struktura mobility, strength, endurance in recovery treningov;
- progresija tezavnosti;
- upostevanje bolecin, utrujenosti in recovery signala;
- navodila, cues in opozorila pri vajah;
- deload in "ne pretiravaj danes" logika.

### Gamification systems

Potrebno:

- XP;
- level;
- rank;
- skill tree;
- achievements;
- titles;
- streaks;
- quest rewards;
- razlaga, zakaj je uporabnik napredoval.

### AI mentor

Potrebno:

- prompt design;
- memory model;
- dnevni in tedenski povzetki;
- povezovanje dnevnika, Garmin metrik, ciljev in koledarja;
- varnostne meje za zdravje;
- ton: spodbuden, direkten, kriticen, brez obsojanja.

### Calendar integration

Potrebno:

- OAuth dovoljenja;
- ustvarjanje namenskega koledarja;
- zapis questov kot dogodkov;
- posodobitve brez podvajanja;
- kasnejsa dvosmerna sinhronizacija.

### Biomarker module

Potrebno kasneje:

- model za blood work in pee test markerje;
- rocni vnos;
- uvoz PDF/slike;
- OCR ali AI ekstrakcija;
- enote in referencni intervali;
- trendi skozi cas;
- ne-medicinska razlaga in jasne meje.

### Visual design and motion

Potrebno:

- temna system UI identiteta;
- design tokens;
- rank-up animacije;
- quest cards;
- skill tree;
- readiness HUD;
- exercise guidance UI;
- reduce-motion alternativa.

### Testing and safety

Potrebno:

- unit testi za XP, ranke in quest generator;
- integracijski testi za sync;
- UI smoke testi za web;
- test offline scenarijev;
- privacy/security review za health podatke;
- backup/restore plan.

## In-app skills

### Strength

XP pride iz strength treningov, progresivnih setov, consistency in varne izvedbe.

Primer unlockov:

- basic bodyweight circuits;
- push/pull/squat patterns;
- loaded progression;
- deload discipline.

### Mobility

XP pride iz dnevne mobilnosti, pain-free range of motion, warmup rutin in recovery dela.

Primer unlockov:

- hip opener routines;
- shoulder control;
- spine decompression;
- ankle mobility.

### Endurance

XP pride iz hoje, cardio treningov, zone 2, intervals in consistency.

Primer unlockov:

- easy base session;
- recovery walk;
- tempo block;
- interval protocol.

### Recovery

XP pride iz spanja, deload dni, dihanja, nizkega stresa, raztezanja in pametnega pocitka.

Primer unlockov:

- sleep prep ritual;
- breath reset;
- low energy protocol;
- recovery priority override.

### Focus

XP pride iz deep work blokov, zakljucenih taskov, manj kontekstnega preklapljanja in planiranja.

Primer unlockov:

- 10-minute focus sprint;
- body doubling mode;
- distraction shield;
- calendar lock-in.

### Discipline

XP pride iz ponavljanja tudi ob slabsem dnevu, vendar brez kaznovanja.

Primer unlockov:

- minimum viable quest;
- streak shield;
- comeback bonus;
- daily reset ritual.

### Mindset

XP pride iz dnevnika, refleksije, realnega self-feedbacka in obvladovanja stresa.

Primer unlockov:

- evening debrief;
- thought pattern scan;
- confidence calibration;
- mentor challenge.

### Nutrition

XP pride iz hidracije, obrokov, protein ciljev, boljse priprave hrane in kasneje biomarker feedbacka.

Primer unlockov:

- hydration anchor;
- protein baseline;
- meal prep mini quest;
- biomarker-aware nutrition note.

### Learning

XP pride iz ucenja, branja, tecajev, skill practice in zakljucenih ucnih blokov.

Primer unlockov:

- study sprint;
- recall check;
- project learning link;
- weekly mastery review.

### Finance

XP pride iz budgetiranja, pregleda porabe, placil, varcevanja in financnih navad.

Primer unlockov:

- expense scan;
- saving streak;
- impulse delay;
- monthly finance boss.

### Projects

XP pride iz napredka na projektih, milestone-ih, taskih in zakljucenih deliverable-ih.

Primer unlockov:

- one-task assault;
- milestone tracker;
- blocker log;
- weekly project rank.

## Prva verzija skill tree-ja

MVP ne potrebuje ogromnega drevesa. Prva verzija naj ima:

- 4 glavne veje: Body, Mind, Discipline, Life;
- 2-3 skille na vejo;
- vsak skill ima level 1-10;
- vsak level odklene majhno realno korist;
- rank up se zgodi sele, ko je napredek uravnotezen in varen.

## Kaj mora uporabnik prinesti v projekt

Za dober MVP potrebujem od tebe:

- ime/link Google Play aplikacije, ki ti je vsec;
- tvoj Garmin model;
- katere health metrike zelis najprej;
- trenutne cilje za strength, mobility, body, focus in discipline;
- poskodbe ali vaje, ki jih ne zelis;
- kaksen ton mentorja zelis: bolj trener, rival, modri mentor ali strogi sistem;
- ali je Firebase sprejemljiv kot prvi oblak.

## Priporocena prva implementacijska zaporedja

1. Build skeleton: Android/web app, tema, navigacija, Google login.
2. Player profile: cilji, ranki, statsi, onboarding.
3. Daily check-in: dnevnik, mood, pain, energy, focus.
4. Quest engine: najprej pravila, nato AI razlaga.
5. XP/rank system: transparentna logika in feedback.
6. Offline workouts: mobility + strength kot prvi vodeni moduli.
7. Calendar sync.
8. Garmin/Health Connect spike.
9. AI mentor memory.
10. Blood/pee test spike.

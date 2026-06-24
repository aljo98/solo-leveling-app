# Ascend System - Plan

## Namen

Ta dokument je namenjen nama kot produktno-tehnicni uskladitvi pred zacetkom implementacije. Po branju mora biti jasno, kaj gradiva, kaj je MVP, kaj pride kasneje in katere integracije morava preveriti pred globoko izvedbo.

Delovno ime je **Ascend System**. Ime lahko kasneje spremeniva.

## Produktna vizija

Ascend System je osebni "anime RPG system" za realno zivljenje. Aplikacija uporabniku vsak dan sestavi naloge glede na cilje, pripravljenost telesa, dnevniski feedback in podatke iz ure. Naloge uporabnika vodijo skozi trening, mobilnost, fokus, okrevanje in osebni razvoj. Za opravljeno delo uporabnik dobi XP, napredek v skillih, ranke, achievemente in povratno informacijo AI mentorja.

Stil je temen, intenziven, motivacijski in "hardcore", vendar ne kaznovalen. Aplikacija mora biti ADHD-prijazna: hitra za zacetek, jasna v naslednjem koraku, prilagodljiva energiji in brez sramotenja ob slabsem dnevu.

## IP meja

Aplikacija je lahko navdihnjena z obcutkom anime "system UI", rank-up trenutki, quest kartami, temnim portalnim vizualom in napredovanjem skozi E-D-C-B-A-S-SS ranke. Ne kopiramo imen likov, zgodb, logotipov, ilustracij, terminologije ali konkretnih UI elementov iz Solo Leveling. Gradimo lasten svet, lastna imena in lasten vizualni jezik.

## Ciljni uporabnik

Prva verzija je za enega uporabnika: tebe. To je prednost, ker lahko sistem optimizirava za tvoje vzorce, treninge, Garmin podatke, dnevnik, cilje in ADHD nacin dela.

Kasneje lahko aplikacija postane javna, vendar mora MVP najprej dokazati, da osebni sistem dejansko pomaga pri vsakodnevnem napredku.

## Osnovni dnevni loop

1. Aplikacija zjutraj prebere zadnje podatke: spanje, utrip, stres, recovery, aktivnost, prejsnje naloge, dnevnik in koledar.
2. Sistem izracuna pripravljenost dneva: telo, fokus, stres, utrujenost, casovna razpolozljivost.
3. Aplikacija predlaga dnevne queste: mobilnost, strength, endurance, recovery, fokus, dnevnik ali projektni napredek.
4. Uporabnik izvede vodeno nalogo offline: navodila, animacije/vaje, timerji, opozorila in cues.
5. Po izvedbi uporabnik dobi XP, skill progress, rank progress, loot/achievement ali title.
6. Vecerni dnevnik in Garmin feedback se uporabita za AI mentorjev komentar in prilagoditev jutrisnjega plana.
7. Plan se sinhronizira z Google Calendar kot realni casovni bloki.

## Glavne funkcije

### MVP

- Android in web aplikacija z React Native/Expo.
- Google login.
- Cloud profil in sinhronizacija podatkov.
- Offline nacin za dnevne queste in vodene vaje.
- Onboarding za cilje, opremo, omejitve, rank preference in trening fokus.
- Dnevni check-in: energija, bolecine, fokus, mood, stres, spanje, misli.
- Dnevnik pocutja in misli.
- Rule-based quest generator kot prva stabilna verzija.
- AI mentor, ki razlaga plan, daje spodbuden in kriticen feedback ter prepoznava vzorce.
- XP, level, ranki in osnovni skill tree.
- Osnovna knjiznica vaj za mobilnost, strength, recovery in fokus.
- Google Calendar enosmerni sync: dnevni quest bloki v namenski koledar.
- Garmin integracijski sloj z zacetnim fallbackom na rocni vnos ali uvoz, dokler ne potrdimo najboljsih dovoljenih poti.

### Kasneje

- Polna Garmin integracija prek uradnega API-ja, Health Connect ali druge potrjene poti.
- Naprednejse modeliranje pripravljenosti po HRV, sleep score, stress, body battery, trening obremenitvi in dnevniku.
- Blood work in pee test modul.
- PDF/lab OCR uvoz, biomarker trendi, referencni intervali in opozorila za pogovor z zdravnikom.
- Adaptive deload, periodizacija treninga in cikli.
- Napredne animacije vaj, rank-up cutsceni, particles, zvok in haptic feedback.
- Custom ranki, title-i, badge-i in skill specializacije.
- Social/party mode, ce bo kdaj smiselno.
- Lasten oblak ali migracija iz Firebase, ce bo potreben vecji nadzor nad podatki.

## Vizualna smer

UI mora izgledati kot osebni sistemski overlay iz temnega anime RPG sveta:

- Osnova: obsidian/crna, globoka modra, kovinsko siva.
- Akcenti: elektricen cyan, hladna vijolicna, amber za opozorila/rank, rdeca za overload.
- Komponente: quest kartice, rank panel, skill tree, readiness orb, dnevniski terminal, workout HUD.
- Motion: rank-up reveal, quest accepted, XP fill, skill unlock, dnevni reset.
- Dostopnost: reduce motion nastavitev, dober kontrast, velike tap tarce, jasni hierarhicni poudarki.
- ADHD UX: en glavni naslednji korak, kratki taski, hitro startanje, "minimum viable quest", forgiveness za prekinjene streake.

## Sistemski modeli

### Player

Uporabnik ima profil s cilji, omejitvami, opremo, preferencami, rank sistemom, trening zgodovino in mentorjevim spominom.

### Stats

Zacetni statsi:

- Strength
- Mobility
- Endurance
- Recovery
- Focus
- Discipline
- Mindset
- Nutrition
- Learning
- Finance
- Projects

Vsak stat dobi XP iz razlicnih vrst questov. Stat lahko odklepa pasivne sposobnosti, nove treninge, bolj napredne dnevne naloge ali bolj natancne mentorjeve predloge.

### Ranks

Privzeto:

- E
- D
- C
- B
- A
- S
- SS

Ranki morajo biti prilagodljivi. Rank ni samo grind XP; upostevati mora consistency, tezavnost, recovery, realen napredek in varnost.

### Quests

Quest ima:

- namen
- kategorijo
- tezavnost
- trajanje
- offline navodila
- vaje ali korake
- pogoje za completion
- XP nagrado
- recovery vpliv
- koledarski blok
- razlog, zakaj ga je sistem izbral

### Readiness

Readiness ni medicinska diagnoza. Je uporabna ocena za dnevno odlocanje. Vkljucuje:

- spanje
- HRV/resting HR, ce je na voljo
- stress/body battery ali nadomestne metrike
- prejsnjo obremenitev
- bolecine
- mentalni feedback
- koledar in razpolozljiv cas

## Tehnicna smer

### Frontend

- React Native z Expo.
- Android kot prvi native target.
- Web build za dashboard in hitri dostop.
- TypeScript.
- Expo Router za navigacijo.
- React Native Reanimated za animacije.
- SQLite ali podoben lokalni storage za offline-first podatke.

### Cloud

Privzeta smer za MVP:

- Firebase Authentication za Google login.
- Firestore za user podatke in offline sync.
- Cloud Functions ali Cloud Run za AI mentorja, integracije in varne server-side klice.
- Cloud Storage za slike, vadbene assete, izvoze in morebitne lab dokumente.

Alternativa za kasneje:

- Supabase/Postgres ali lasten Google Cloud backend, ce bo treba vec relacijskih podatkov, boljsi SQL reporting ali vec nadzora nad health podatki.

### AI mentor

AI mentor mora:

- poznati cilje, preference, zgodovino questov, dnevnik in relevante health metrike;
- razloziti, zakaj je predlagal dnevni plan;
- biti spodbuden, ampak kriticen;
- zaznati vzorce, npr. prevec treninga ob slabem spancu ali padcu motivacije;
- predlagati majhne naslednje korake, ne velikih nerealnih planov;
- imeti varnostne meje: ne diagnosticira, ne nadomesca zdravnika, ne ignorira bolecin ali rdecih signalov.

AI klici naj tecejo prek backend-a, ne direktno iz aplikacije, da skrijemo kljuce in kontroliramo podatke.

## Integracije

### Garmin

Primarna raziskovalna pot je uradni Garmin Health API. Garminov uradni opis pravi, da Health API omogoca dostop do metrik, kot so koraki, heart rate, sleep, stress, calories, respiration, body composition, Pulse Ox in druge wellness metrike, vendar je dostop vezan na odobritev Garmin Connect Developer Program.

Ker je aplikacija najprej osebna, morava imeti fallbacke:

- Health Connect na Androidu, ce Garmin podatki pridejo tja na tvoji napravi.
- Rocni vnos kljucnih metrik za prvi prototip.
- Uvoz datotek ali eksportov, ce je prakticno in dovoljeno.
- Abstrakcija `HealthDataProvider`, da lahko vir podatkov zamenjava brez rusenja aplikacije.

### Google Calendar

Plan:

- Ustvari namenski koledar, npr. "Ascend Quests".
- Dnevne queste zapise kot calendar events.
- Uporabi event ID-je za posodabljanje namesto podvajanja.
- Zacetno enosmerno: app -> Calendar.
- Kasneje dvosmerno: ce uporabnik premakne dogodek, se plan prilagodi.

### Dnevnik

Dnevnik ni samo tekst. V MVP naj podpira:

- prosto besedilo;
- hitro oceno energije, mooda, stresa, bolecin in fokusa;
- oznake, npr. "prevec dela", "dober trening", "slab spanec";
- AI povzetke vzorcev.

### Blood work in pee testi

To je kasnejsi modul in ga morava razcleniti posebej. Mozne poti:

- rocni vnos markerjev;
- uvoz PDF laboratorijskega izvida;
- OCR/AI ekstrakcija v strukturirane biomarkerje;
- Health Connect medical records/FHIR, ce bo na tvoji napravi in pri ponudnikih uporabno;
- integracija z zunanjo aplikacijo ali laboratorijem, ce ima uraden API.

Vsak biomarker mora imeti vrednost, enoto, datum, vir, referencni interval in confidence. AI mentor lahko razlozi trende v nevtralnem jeziku, vendar ne sme postavljati diagnoz.

## Roadmap

### Phase 0 - Alignment

Rezultat:

- potrjen produktni plan;
- potrjen seznam skillov/modulov;
- izbran delovni tech stack;
- seznam odprtih vprasanj.

### Phase 1 - Project foundation

Rezultat:

- Expo/React Native projekt;
- web in Android run;
- osnovna navigacija;
- tema, design tokens in zacetni system UI;
- Google login;
- osnovni cloud profil.

### Phase 2 - Daily system MVP

Rezultat:

- onboarding;
- dnevni check-in;
- rocni health input;
- dnevni quest generator;
- XP/level/rank logika;
- offline shranjevanje;
- dashboard.

### Phase 3 - Guided training

Rezultat:

- knjiznica vaj;
- mobility in strength quest flow;
- timerji, sets/reps, navodila in opozorila;
- completion feedback;
- osnovni exercise animations/assets.

### Phase 4 - AI mentor

Rezultat:

- mentorjev dnevni feedback;
- tedenski povzetek vzorcev;
- razlaga zakaj je plan izbran;
- ADHD-prijazni predlogi;
- guardrails za zdravje in bolecine.

### Phase 5 - Calendar and health integrations

Rezultat:

- Google Calendar enosmerni sync;
- Garmin/Health Connect raziskovalni spike;
- HealthDataProvider vmesnik;
- prvi avtomatski sync vira, ki bo realno dostopen.

### Phase 6 - Advanced health intelligence

Rezultat:

- readiness model;
- recovery-aware quest generator;
- overload opozorila;
- periodizacija treninga;
- blood work/pee test raziskovalni spike.

### Phase 7 - Polish and hardening

Rezultat:

- rank-up animacije;
- boljse vaje in navodila;
- offline robustnost;
- backup/restore;
- test coverage;
- varnostni pregled health podatkov.

## Prva odprta vprasanja

1. Katera Google Play aplikacija ti je bila vsec? Ime ali link bo zelo pomagal pri primerjavi UX-a.
2. Kateri Garmin model imas in katere metrike so ti najpomembnejse: HRV, sleep score, body battery, stress, resting HR, workouts?
3. Imas poskodbe, omejitve ali vaje, ki jih ne smemo predlagati?
4. Ali zelis Firebase kot prvi oblak, ali ze od zacetka raje lastni backend?
5. Za vadbene prikaze: najprej tekst + slike/animacije ali takoj video/3D/animirane demonstracije?

## Viri za integracije

- Garmin Health API: https://developer.garmin.com/gc-developer-program/health-api/
- Garmin Health SDK overview: https://developer.garmin.com/health-sdk/overview/
- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Firebase Authentication: https://firebase.google.com/docs/auth
- Firebase Google sign-in: https://firebase.google.com/docs/auth/web/google-signin
- Firestore offline persistence: https://firebase.google.com/docs/firestore/manage-data/enable-offline
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite
- Google Calendar API overview: https://developers.google.com/workspace/calendar/api/guides/overview
- Google Calendar create events: https://developers.google.com/workspace/calendar/api/guides/create-events
- Google Calendar sync: https://developers.google.com/workspace/calendar/api/guides/sync

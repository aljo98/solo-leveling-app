# Ascend System

Osebni anime RPG "system" za napredovanje skozi realne dnevne naloge, trening, dnevnik, nosljive podatke in AI mentorja.

Projekt je "inspired by" temna rank/leveling estetika, ne kopija obstojece anime IP. Cilj je zgraditi Android in web aplikacijo, ki uporabniku pomaga napredovati skozi levele, ranke, skillse in sposobnosti na podlagi dejanskih podatkov o pocutju, treningu, dnevniku, Garmin/health metrikah in koledarju.

## Trenutni Android MVP

Trenutni build je lokalni Android MVP za dnevni check-in, generiranje dnevnega questa, XP/progress, dnevnik in AI asistenta. Aplikacija deluje brez Metro bundlerja, ker je release APK z vgrajenim JavaScript bundlom.

Zadnji preverjeni APK:

- Release: [v0.1.3-visible-ai](https://github.com/aljo98/solo-leveling-app/releases/tag/v0.1.3-visible-ai)
- APK: [Ascend-System-v0.1.3-visible-ai-android-release-arm64-v8a.apk](https://github.com/aljo98/solo-leveling-app/releases/download/v0.1.3-visible-ai/Ascend-System-v0.1.3-visible-ai-android-release-arm64-v8a.apk)
- Android package: `com.aljaz.ascendsystem`
- Version: `0.1.3`, versionCode `3`

Po namestitvi mora biti na glavnem zaslonu viden panel `AI companion` z gumboma `AI Chat` in `Minimax nastavitve`.

## Hitra uporaba

1. Namesti zadnji APK iz GitHub release-a.
2. Odpri `Daily System`.
3. Izpolni dnevni check-in: energija, razpolozenje, fokus, stres, bolecina in razpolozljiv cas.
4. Tapni `Generate quest`, da aplikacija ustvari dnevni quest.
5. Tapni `Start guided quest`, ce zelis vodeno izvedbo.
6. Tapni `AI Chat`, ce zelis pregled questa, lazjo verzijo, tezjo verzijo ali novo vajo.
7. Tapni `Minimax nastavitve`, ce zelis nastaviti govor prek Minimax.

Podrobna navodila so v [docs/USER_GUIDE.md](docs/USER_GUIDE.md).

## AI Chat in Minimax govor

AI asistent ima dva nacina:

- Lokalni coach deluje takoj, brez API kljuca. Uporaben je za pregled questa, prilagajanje tezkosti in ustvarjanje preprostih vaj.
- Zunanji AI backend je opcijski. Ce nastavis AI backend URL, aplikacija poslje sporocilo, kontekst in zgodovino na tvoj backend.

Govor ima tri poti:

- Minimax proxy URL je priporocen za produkcijo, ker API kljuc ostane na tvojem serverju.
- Neposreden Minimax API key v aplikaciji je primeren za osebno testiranje na lastni napravi.
- Ce Minimax ni nastavljen ali odpove, aplikacija uporabi lokalni govor prek `expo-speech`.

Tehnicni contract za backend in Minimax je v [docs/AI_ASSISTANT_AND_MINIMAX_PROXY.md](docs/AI_ASSISTANT_AND_MINIMAX_PROXY.md).

Za trenutno uskladitev so glavni dokumenti:

- [PLAN.md](PLAN.md) - produktni in tehnicni nacrt.
- [SKILLS.md](SKILLS.md) - sposobnosti, kompetence in moduli, ki jih aplikacija potrebuje.
- [ARCHITECTURE.md](ARCHITECTURE.md) - arhitektura, podatkovni modeli in diagrami potekov funkcionalnosti.
- [MILESTONES.md](MILESTONES.md) - milestone-i, trenutni focus in dependency line.
- [.gsd/milestones/M001/M001-ROADMAP.md](.gsd/milestones/M001/M001-ROADMAP.md) - prvi MVP milestone razbit na vertikalne slice taske.

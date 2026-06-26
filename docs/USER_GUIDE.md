# Ascend System User Guide

Ta dokument opisuje uporabo trenutnega Android MVP-ja: dnevni check-in,
generiranje questa, AI Chat, Minimax govor, progress in journal.

## Kdo naj bere ta dokument

Ta vodič je za uporabnika ali maintainerja, ki ima nameščen release APK in želi
pravilno uporabljati aplikacijo brez razvojnega okolja.

Po branju moraš znati:

- namestiti pravi APK,
- ustvariti dnevni quest,
- uporabljati AI Chat,
- nastaviti Minimax govor,
- preveriti, ali uporabljaš pravo verzijo aplikacije.

## Namestitev

Uporabi zadnji release APK:

- Release: `v0.1.3-visible-ai`
- APK ime: `Ascend-System-v0.1.3-visible-ai-android-release-arm64-v8a.apk`
- Android package: `com.aljaz.ascendsystem`
- Version: `0.1.3`
- Version code: `3`

APK je release build z vgrajenim JavaScript bundlom. Ne potrebuje Metro
bundlerja, USB povezave ali računalnika.

Če po namestitvi ne vidiš novih funkcij, najprej preveri, da si namestil APK
iz release-a `v0.1.3-visible-ai` ali novejšega. Na glavnem zaslonu mora biti
viden panel `AI companion` z badge oznako `v0.1.3`.

## Glavni zaslon

Glavni zaslon `Daily System` ima naslednje dele:

- `Player` prikazuje ime igralca in trenutni body focus.
- `AI companion` odpre AI Chat ali Minimax nastavitve.
- `Daily check-in` zbere današnji signal.
- `Main quest` se prikaže po generiranju dnevnega questa.
- `Progress pulse` vodi do progressa, journala in asistenta.

## Dnevni check-in

Vsak dan najprej izpolni check-in:

- `Energy`: koliko fizične energije imaš.
- `Mood`: trenutno razpoloženje.
- `Focus`: mentalna zbranost.
- `Stress`: obremenitev.
- `Body pain`: ali je prisotna bolečina.
- `Time available`: koliko časa imaš za vajo.
- `Optional note`: dodatna opomba za kontekst.

Ko tapneš `Generate quest`, aplikacija izbere primeren dnevni quest. Če je
signal nizek ali je prisotna bolečina, aplikacija zmanjša obremenitev in izbere
varnejšo minimalno nalogo.

## Guided quest

Ko je quest ustvarjen, tapni `Start guided quest`.

Na guided quest zaslonu lahko:

- vidiš korake,
- zaključiš posamezne korake,
- prekineš, če telo pošlje slab signal,
- odpreš asistenta za razlago ali prilagoditev.

Namen ni prisila v maksimalen trening. Sistem mora pomagati, da dan še vedno
šteje, tudi če je današnji minimum majhen.

## AI Chat

AI Chat odpreš z gumbom `AI Chat` na glavnem zaslonu ali z gumbom `Assistant`.

Chat zna:

- pregledati današnji quest,
- predlagati lažjo verzijo,
- predlagati težjo verzijo,
- ustvariti kratko mobility vajo,
- ustvariti cardio ali strength quest,
- govoriti odgovor, če je speech vklopljen.

Primeri uporabnih sporočil:

```txt
Preglej današnji quest.
```

```txt
Naredi lažje, danes imam malo energije.
```

```txt
Ustvari 10 min mobility za ramena in vrat.
```

```txt
Ustvari cardio brez opreme za 20 minut.
```

Če AI backend ni nastavljen, aplikacija uporabi lokalnega coacha. Lokalni coach
ne potrebuje interneta ali API ključev, vendar je namerno omejen in pravilen
predvsem za osnovne prilagoditve.

## Nastavitve asistenta

Zavihek `Nastavitve` odpreš z gumbom `Minimax nastavitve` na glavnem zaslonu
ali znotraj Assistant zaslona.

Tam lahko nastaviš:

- `AI backend URL`: opcijski endpoint za zunanji AI chat.
- `Minimax API key`: neposreden ključ za osebno testiranje.
- `Minimax Group ID`: GroupId iz Minimax konzole.
- `Model`: privzeto `speech-02-hd`.
- `Voice ID`: privzeto `male-qn-qingse`.
- `Proxy URL`: opcijski backend endpoint za Minimax TTS.
- `Speech`: vklop ali izklop govora.

Nastavitve se shranijo takoj ob vnosu.

## Minimax govor

Priporočena pot je Minimax proxy:

1. Na svojem serverju ustvari endpoint za text-to-speech.
2. Minimax API ključ hrani samo na serverju.
3. V aplikaciji nastavi `Proxy URL`.
4. Tapni `Test Minimax speech`.

Za osebno testiranje lahko vneseš tudi neposredno:

1. `Minimax API key`
2. `Minimax Group ID`
3. `Model`
4. `Voice ID`
5. `Test Minimax speech`

Če Minimax ne uspe, aplikacija samodejno uporabi lokalni govor naprave.

Varnostna opomba: neposreden API key v aplikaciji je praktičen za lastno testno
napravo, ni pa priporočena produkcijska rešitev. Za deljenje APK-ja drugim
uporabnikom uporabi proxy.

## Progress in Journal

`Progress` pokaže ritem aktivnih dni in XP.

`Journal` je namenjen kratkim zapisom po izvedbi ali ob dnevnem signalu. Vnosov
ni treba pisati popolno. Dovolj je kratek zapis, ki pomaga sistemu razumeti
trend.

## Kako preveriš, da imaš pravo verzijo

Na glavnem zaslonu poišči panel `AI companion`.

Pravilna verzija za te funkcije ima:

- badge `v0.1.3`,
- gumb `AI Chat`,
- gumb `Minimax nastavitve`,
- Assistant zaslon z zavihkoma `Chat` in `Nastavitve`.

Če tega ne vidiš, je na telefonu še star APK.

## Troubleshooting

### Ne vidim AI companion panela

Namesti APK `v0.1.3-visible-ai` ali novejši. Prejšnji buildi so imeli isti
Android version code kot začetni APK, zato se je lahko zdelo, da je namestitev
uspela, aplikacija pa je še vedno prikazovala star UI.

### Assistant se odpre, ampak ni interneta ali AI odgovora

To je pričakovano, če `AI backend URL` ni nastavljen. Lokalni coach še vedno
deluje za osnovne ukaze.

### Minimax ne govori

Preveri:

- `Speech` je vklopljen.
- `Minimax API key` je pravilen.
- `Minimax Group ID` je pravilen.
- `Model` in `Voice ID` sta veljavna.
- Telefon ima internetno povezavo.

Če Minimax odpove, aplikacija uporabi lokalni speech fallback.

### Vidim rdeč zaslon "Unable to load script"

To pomeni, da je nameščen debug APK ali APK brez vgrajenega JS bundla. Namesti
release APK iz GitHub release-a. Release APK ne potrebuje Metro bundlerja.


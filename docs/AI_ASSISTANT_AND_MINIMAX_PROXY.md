# AI Assistant and Minimax Speech

Ta dokument opisuje integracijo AI asistenta in Minimax govora v Android MVP.
Namenjen je maintainerju ali razvijalcu backend endpointa.

## Povzetek

Aplikacija podpira tri ravni asistence:

1. Lokalni coach deluje brez backendov in brez API ključev.
2. AI backend URL omogoči zunanji chat model.
3. Minimax omogoči govor prek proxy endpointa ali neposrednega API ključa na
   napravi.

Za produkcijo je priporočena proxy pot. Neposreden API key v aplikaciji je
namenjen osebnemu testiranju na lastni napravi.

## AI Chat

Če `AI backend URL` ni nastavljen, aplikacija uporabi lokalnega coacha. Lokalni
coach zna pregledati quest, prilagoditi težavnost in ustvariti osnovne exercise
queste.

Če je `AI backend URL` nastavljen, aplikacija pošlje `POST` request na ta URL.

### Request

```json
{
  "message": "preglej današnji quest",
  "context": {
    "playerName": "Aljaz",
    "todayQuest": {
      "id": "quest-2026-06-26",
      "title": "Minimum Quest",
      "durationMinutes": 10
    },
    "activeDays7": 3,
    "activeDays14": 6,
    "totalXp": 120
  },
  "history": [
    {
      "id": "user-1",
      "role": "user",
      "text": "Naredi lažje",
      "createdAt": "2026-06-26T08:00:00.000Z"
    }
  ]
}
```

### Response

```json
{
  "text": "Današnji quest je primeren, ampak ga lahko zmanjšaš na 5 minut mobility.",
  "suggestedQuest": null
}
```

`suggestedQuest` je opcijski. Če ga backend vrne, mora biti združljiv z obliko
questa, ki jo aplikacija že uporablja. Če backend nima zanesljivega quest
generatorja, naj vrne samo `text`.

### Priporočeno vedenje backenda

Backend naj:

- uporablja kratek, praktičen odgovor,
- spoštuje nizko energijo, stres in body pain,
- predlaga minimalne naloge, kadar je signal slab,
- ne daje medicinskih diagnoz,
- ne sili v vaje skozi bolečino,
- vrne `suggestedQuest` samo, kadar je struktura zanesljivo veljavna.

## Minimax Speech

Aplikacija poskusi govor v tem vrstnem redu:

1. `Proxy URL`, če je nastavljen.
2. Neposreden Minimax API, če sta nastavljena `Minimax API key` in `Group ID`.
3. Lokalni speech fallback naprave.

## Minimax proxy

Proxy je priporočena produkcijska pot, ker API ključ ostane na serverju.

V aplikaciji nastavi:

```txt
https://your-domain.com/api/minimax/tts
```

### Proxy request

```json
{
  "text": "Današnji quest je primeren.",
  "voiceId": "male-qn-qingse"
}
```

### Proxy response z audio URL

```json
{
  "audioUrl": "https://cdn.example.com/generated-speech.mp3"
}
```

### Proxy response z base64 audio

```json
{
  "audioBase64": "...",
  "mimeType": "audio/mpeg"
}
```

Če proxy vrne napako, neveljaven JSON ali odgovor brez audia, aplikacija pade
nazaj na naslednji speech način.

## Neposreden Minimax API na napravi

Neposredna pot je namenjena testiranju. Uporabnik v aplikaciji vnese:

- `Minimax API key`
- `Minimax Group ID`
- `Model`, privzeto `speech-02-hd`
- `Voice ID`, privzeto `male-qn-qingse`

Aplikacija kliče Minimax text-to-speech endpoint in pričakuje audio v odgovoru.
Če Minimax vrne URL, ga aplikacija predvaja. Če vrne hex audio payload, ga
aplikacija pretvori v base64 data URI in predvaja.

## Varnost

Za osebno lokalno testiranje je neposreden key v aplikaciji sprejemljiv, ker je
shranjen samo v lokalnih nastavitvah naprave.

Za produkcijo ali deljenje APK-ja drugim uporabnikom uporabi proxy:

- API key ostane na serverju.
- Na serverju lahko dodaš rate limiting.
- Na serverju lahko zamenjaš providerja brez novega APK-ja.
- Na serverju lahko vodiš audit log in stroškovne omejitve.

Ne committaj provider ključev v repozitorij, `app.json`, dokumentacijo ali
release notes.

## Testiranje v aplikaciji

1. Odpri `Daily System`.
2. Tapni `Minimax nastavitve`.
3. Vklopi `Speech`.
4. Nastavi proxy ali neposredne Minimax podatke.
5. Tapni `Test Minimax speech`.

Če slišiš testni stavek, je speech pot pravilno nastavljena. Če ne, aplikacija
poskusi lokalni speech fallback.


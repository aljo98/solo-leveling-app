# AI Assistant and Minimax Speech Proxy

The Android app does not store provider API keys in the APK.

Assistant and Minimax speech integrations are configured from the in-app
Assistant screen with optional backend URLs.

## AI assistant endpoint

Configure:

```txt
https://your-domain.com/api/assistant
```

Request:

```json
{
  "message": "preglej quest",
  "context": {
    "playerName": "Aljaz",
    "todayQuest": {},
    "activeDays7": 3,
    "activeDays14": 6,
    "totalXp": 120
  },
  "history": []
}
```

Response:

```json
{
  "text": "Pregled: današnji quest je primeren ...",
  "suggestedQuest": null
}
```

`suggestedQuest` may be omitted. If returned, it must match the app `Quest`
shape from `src/core/quest/questTypes.ts`.

## Minimax speech endpoint

Configure:

```txt
https://your-domain.com/api/minimax/tts
```

Request:

```json
{
  "text": "Današnji quest je primeren.",
  "voiceId": "male-qn-qingse"
}
```

Response option A:

```json
{
  "audioUrl": "https://cdn.example.com/generated-speech.mp3"
}
```

Response option B:

```json
{
  "audioBase64": "...",
  "mimeType": "audio/mpeg"
}
```

If the Minimax proxy is missing or fails, the app falls back to local
`expo-speech`.

## Security rule

Keep Minimax/OpenAI/provider keys only on the backend. Never place them in
`app.json`, app source, SQLite, or a committed `.env` file.

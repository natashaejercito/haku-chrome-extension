# Haku

> Your guide through the job search

Haku is a Chrome extension that saves job postings in one click, tells you if you've already saved a job, and helps you practice once an interview is booked. It's named after Haku from *Spirited Away*, who helps Chihiro through a difficult journey.

🚧 **Status:** in development

## Features

- **One-click save:** reads the title, company, location, job ID, deadline and description from job pages on LinkedIn, Greenhouse, Workday and Indeed. Every field can be edited before saving.
- **Duplicate detection:** warns you when a job is already in your journal, even if it was reposted or found through a different URL.
- **Journal:** your saved jobs, grouped by week, with filters for each status (saved, applied, interview, rejected), interview dates, and buttons to copy the description and other details.
- **This week:** a count of how many jobs you've saved in the past 7 days.
- **Interview prep:** practice questions written by AI from the job description, a few each day until the interview, with a countdown.
- **Answer out loud:** speak your practice answers and Haku turns them into text.

## Tech stack

- TypeScript, React 19
- Vite + CRXJS (Chrome Manifest V3)
- `chrome.storage`, `chrome.scripting`, Side Panel API, Web Speech API
- Node/Express server for AI features, using Google's Gemini API (hosted on Render)

## Project structure

```
├── src/
│   ├── views/          pages: job, saved, saved details, prep, splash
│   ├── components/     reusable UI pieces
│   ├── lib/            page reading, storage, duplicates, dates, prep, API calls
│   ├── background.ts   opens the side panel when you click the icon
│   └── permission.ts   asks for microphone access
├── server/             Express server that calls Gemini
├── public/             icons
├── manifest.config.ts  the extension manifest
└── PRIVACY.md
```

## Getting started

### 1. The extension

```bash
git clone https://github.com/natashaejercito/haku-chrome-extension.git
cd haku-chrome-extension
npm install
```

Create a `.env.development` file in the project root:

```
VITE_SERVER_URL=http://localhost:8787
```

Then start it:

```bash
npm run dev
```

Load it in Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and select the `dist` folder
4. Click the Haku icon in the toolbar to open the side panel

### 2. The server (needed for interview prep)

```bash
cd server
npm install
```

Create `server/.env`:

```
GEMINI_API_KEY=your-key-here
```

You can get a key from [Google AI Studio](https://aistudio.google.com/apikey). Optional settings: `PORT` (default `8787`), `GEMINI_MODEL`, and `ALLOWED_ORIGINS` (comma-separated `chrome-extension://` IDs that may call the server; if it's empty, any extension can).

Then start it:

```bash
npm run dev
```

The server needs Node 20.6 or newer.

### Building for release

```bash
npm run build
```

This uses `VITE_SERVER_URL` from `.env.production` and writes the extension to `dist/`.

## Roadmap

- [x] **Phase 1:** save jobs and detect duplicates
- [x] **Phase 2:** journal with statuses, filters and interview dates
- [x] **Phase 3:** interview prep with AI questions and spoken answers
- [ ] **Phase 4:** encouragement: optional Bible verses or quotes at meaningful moments
- [ ] **Phase 5:** autofill application forms from your saved profile, without ever submitting for you

## Privacy

Your saved jobs stay in your browser. Haku has no accounts, no analytics and no tracking. When you open interview prep, the job's title, company and description are sent to the Haku server, which passes them to Gemini to write questions. API keys live on the server, never in the extension. See [PRIVACY.md](PRIVACY.md) for the full policy.

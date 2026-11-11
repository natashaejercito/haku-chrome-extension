# Haku

> Your guide through the job search.

Haku is a Chrome extension that saves job postings in one click, tells you if you've already applied, and helps you prepare once an interview is booked. It's named after Haku from *Spirited Away*, who helps Chihiro through a difficult journey.

🚧 **Status:** in development

## Features

- **One-click save:** pulls the title, company, location and description from job pages (LinkedIn, Greenhouse, Lever, Workday and more)
- **Already-applied detection:** recognizes reposts and duplicates across sites and URLs
- **Status tracking:** saved, applied, interview, offer, rejected
- **Interview prep:** practice questions generated from the job description, spread over the days before your interview
- **Encouragement:** optional Bible verses or quotes at meaningful moments in your search
- **Autofill** *(planned)*: fills application forms from your saved profile, but never submits for you

## Tech stack

- TypeScript, React
- Vite + CRXJS (Chrome Manifest V3)
- `chrome.storage`, `chrome.alarms`, Side Panel API
- Node/Express proxy for AI features

## Getting started

```bash
git clone https://github.com/natashaejercito/haku.git
cd haku
npm install
npm run dev
```

Then load it in Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked** and select the `dist` folder

## Roadmap

- [ ] **Phase 1:** save jobs and detect duplicates
- [ ] **Phase 2:** statuses, stats and encouragement
- [ ] **Phase 3:** interview prep
- [ ] **Phase 4:** autofill

## Privacy

Your data stays in your browser. Haku doesn't store passwords or ID numbers, and AI requests go through a proxy so no API keys live in the extension.
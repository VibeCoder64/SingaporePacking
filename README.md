# Singapore Packing Planner — Deployment Guide

Real-time shared packing planner. Both you and your wife open the same URL — 
ticks, custom items, and deletions sync instantly between devices.

---

## Deploy to Railway (free, ~3 minutes)

Railway is a hosting platform with a generous free tier. No credit card required.

### Step 1 — Create a GitHub repository

1. Go to github.com and sign in (or create a free account)
2. Click the "+" icon → "New repository"
3. Name it: `sg-packing-planner`
4. Set it to **Private**
5. Click "Create repository"

### Step 2 — Upload the files

In your new repository, click "uploading an existing file" and upload:
- `server.js`
- `package.json`
- The entire `public/` folder (containing `index.html`)

Commit the files.

### Step 3 — Deploy on Railway

1. Go to railway.app and sign in with your GitHub account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `sg-packing-planner` repository
4. Railway auto-detects Node.js and runs `npm start` — no configuration needed
5. Click "Deploy"

### Step 4 — Get your public URL

1. Once deployed (takes ~1 minute), click on your project
2. Go to "Settings" → "Networking" → click "Generate Domain"
3. You'll get a URL like: `https://sg-packing-planner-production.up.railway.app`

### Step 5 — Share with your wife

Send her the URL. That's it. Both of you open it in any browser — 
changes appear on both devices within 1–2 seconds.

---

## How it works

- The server holds the shared state in memory and saves it to `state.json` on disk
- When one person ticks an item, it's sent via WebSocket to the server
- The server saves it and instantly broadcasts to all other connected devices
- The connection status dot (top of page) shows: green = synced, red = offline (cached)
- If the connection drops, it auto-reconnects every 4 seconds
- Each device also caches state locally so it loads instantly even before connecting

---

## Local testing (optional)

If you want to test it on your own computer before deploying:

```bash
npm install
npm start
```

Then open http://localhost:3000 in two browser windows — changes in one 
appear in the other immediately.

---

## Railway free tier limits

- 500 hours/month of compute (enough for continuous use by 2 people)
- State is saved to disk so it persists across restarts
- If you need more, Railway's Hobby plan is $5/month

---

## File structure

```
sg-packing-planner/
├── server.js          ← Node.js WebSocket server
├── package.json       ← Dependencies (express, ws)
├── state.json         ← Auto-created on first run (persists your data)
└── public/
    └── index.html     ← The planner app
```

# Mile Marker

A church run club gamification web app built with Next.js 14, Supabase, and Strava.

## Quick Start (Mock Data — No Backend Required)

```bash
npm install
npm run dev
```

The app runs fully with mock data when env vars are not set. Open [http://localhost:3000](http://localhost:3000).

## Full Setup

### 1. Strava App

Create a Strava app at [https://developers.strava.com](https://developers.strava.com).

- Set **Authorization Callback Domain** to your domain (e.g. `yourdomain.com` or `localhost`)

### 2. Supabase

Create a Supabase project, then run `supabase/schema.sql` in the SQL editor.

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 4. Deploy & Register Strava Webhook

After deploying, register the Strava webhook subscription:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://YOUR_DOMAIN/api/webhook \
  -F verify_token=YOUR_STRAVA_WEBHOOK_VERIFY_TOKEN
```

### 5. Invite Members

Share the app URL — members click "Connect with Strava" and everything auto-populates from their Strava activity history via webhook.

## Local Webhook Testing

Use [ngrok](https://ngrok.com) to expose your local server:

```bash
ngrok http 3000
```

Then update `callback_url` in the webhook registration to your ngrok URL.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home feed — weekly stats, highlight reel, your stats |
| `/leaderboards` | Consistency, time on feet, ministry battle |
| `/club` | Club aggregate stats and member roster |
| `/heatmap` | Mapbox community run heatmap |
| `/login` | Strava OAuth entry point |

## Tech Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** for database and session cookies
- **Strava API v3** for OAuth and activity data
- **Mapbox GL JS** for the community heatmap

## Badge System

| Badge | Trigger |
|-------|---------|
| 🌅 Dawn Treader | Activity before 6 AM |
| ⛪ Sunday Stroll | Sunday afternoon activity |
| 🤝 Fellowship | Within 5 min & 100m of another member |
| 🔥 On Fire | 4+ week streak |
| 🚶 Pilgrim | 100 miles total |
| 💛 Barnabas | 3 fellowship badges in one month |

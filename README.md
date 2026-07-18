# Upvote VC / Upvote Intelligence

Investor intelligence platform combining public discussion data (Reddit), news (NewsAPI), and market data (Massive) with Hack Club AI summaries.

## Getting Started

### 1. Environment Variables

Create a `.env.local` file in the root directory and add the following keys (do not commit this file):

```bash
REDDIT_API_KEY=your_reddit_key
NEWS_API_KEY=your_news_key
MASSIVE_API_KEY=your_massive_key
HACK_CLUB_AI_KEY=your_hack_club_ai_key
```

### 2. Installation

Install the dependencies:

```bash
npm install
```

### 3. Running the Development Server

Start the local server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Vanilla CSS (Tailwind CSS intentionally excluded to adhere to exact design tokens)
- **Data Fetching:** Next.js API Routes (`/api/signals`, `/api/insights`)
- **Design System:** ElevenLabs editorial style (Waldenburg 300 / Inter)

## Future Work

- Wire up the mock API endpoints to real data sources.
- Extend the AI analysis pipeline to generate dynamic risk factors.

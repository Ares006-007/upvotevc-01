# Upvote VC / Upvote Intelligence

Investor intelligence platform combining public discussion data (Reddit), news (NewsAPI), and market data (Massive) with Hack Club AI summaries.

## Backend Architecture

This backend follows a layered architecture focused on separation of concerns, built on top of Next.js App Router for API handling:

- `src/config/`: Zod validation for runtime environment variables. Fail-fast approach.
- `src/clients/`: External API wrappers (`reddit.ts`, `newsapi.ts`, `massive.ts`, `hackclubAi.ts`) with exponential backoff and retry logic.
- `src/domain/`: Core business logic (`signals`, `insights`) orchestrating normalization and AI aggregation.
- `src/dto/`: Zod schemas mapping to typescript interfaces to validate inputs and boundaries.
- `src/utils/`: Shared structured logger and retry implementations.
- `src/app/api/`: Thin route handlers mapping to domain functions.

## Getting Started

### 1. Environment Variables

Create a `.env.local` (or copy `.env.example`) in the root directory and add the following keys. **Do not commit real keys.**

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

## API Usage Examples

**Get Signals:**
```bash
curl -X GET "http://localhost:3000/api/signals?limit=5&query=stocks"
```

**Generate Insights:**
```bash
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -d '{
    "signals": [
      {
        "id": "reddit-123",
        "source": "reddit",
        "assetType": "stock",
        "title": "Example Post",
        "tags": ["retail"],
        "createdAt": "2024-01-01T00:00:00Z",
        "ingestedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }'
```

**Fetch Raw Reddit Subreddit (JSON API):**
```bash
curl -X GET "http://localhost:3000/api/reddit/subreddit?name=startups&sort=hot&limit=10"
```

**Fetch Raw Reddit Thread (JSON API):**
```bash
curl -X GET "http://localhost:3000/api/reddit/thread?subreddit=startups&postId=abc123"
```

## Background Processing
*Note:* Periodic fetching from these external endpoints can be orchestrated using a Vercel Cron Job hitting an internal authenticated endpoint, avoiding tying up standard synchronous API routes.

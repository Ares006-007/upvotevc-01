import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { RedditJsonClient } from '@/clients/redditJson';

const QuerySchema = z.object({
  name: z.string().min(1),
  sort: z.enum(['hot', 'new', 'top', 'rising']).default('hot'),
  limit: z.coerce.number().max(100).default(10)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.format() }, { status: 400 });
    }

    const { name, sort, limit } = parseResult.data;
    
    // Using the raw JSON fetcher to just get standard posts
    const posts = await RedditJsonClient.fetchSubredditPosts(name, sort, limit);
    
    return NextResponse.json({
      subreddit: name,
      sort,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    logger.error('Unhandled error in GET /api/reddit/subreddit', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

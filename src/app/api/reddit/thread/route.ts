import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { RedditJsonClient } from '@/clients/redditJson';

const QuerySchema = z.object({
  subreddit: z.string().min(1),
  postId: z.string().min(1)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.format() }, { status: 400 });
    }

    const { subreddit, postId } = parseResult.data;
    
    // Using the raw JSON fetcher to just get comments for a thread
    const comments = await RedditJsonClient.fetchPostComments(subreddit, postId);
    
    return NextResponse.json({
      post_id: postId,
      subreddit,
      comment_count: comments.length,
      data: comments
    });
  } catch (error) {
    logger.error('Unhandled error in GET /api/reddit/thread', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

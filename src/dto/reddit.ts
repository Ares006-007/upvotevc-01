import { z } from 'zod';
import { SignalDTO } from './schemas';

export const RedditPostSchema = z.object({
  post_id: z.string(),
  subreddit: z.string(),
  title: z.string(),
  selftext: z.string(),
  author: z.string(),
  score: z.number(),
  upvote_ratio: z.number().optional(),
  num_comments: z.number(),
  created_utc: z.number(),
  permalink: z.string(),
  url: z.string(),
  flair: z.string().nullable().optional(),
  raw_json: z.unknown()
});

export type RedditPost = z.infer<typeof RedditPostSchema>;

export const RedditCommentSchema = z.object({
  comment_id: z.string(),
  post_id: z.string(),
  author: z.string(),
  body: z.string(),
  score: z.number(),
  created_utc: z.number(),
  parent_id: z.string(),
  depth: z.number(),
  raw_json: z.unknown()
});

export type RedditComment = z.infer<typeof RedditCommentSchema>;

export const RedditThreadSchema = z.object({
  post: RedditPostSchema,
  comments: z.array(RedditCommentSchema)
});

export type RedditThread = z.infer<typeof RedditThreadSchema>;

export function mapRedditPostToSignal(post: RedditPost): SignalDTO {
  return {
    id: `reddit-${post.post_id}`,
    source: 'reddit',
    assetType: 'stock', // Default generic mapping
    subreddit: post.subreddit,
    title: post.title,
    text: post.selftext.substring(0, 1000), // Trim to a safe length for LLMs
    url: `https://reddit.com${post.permalink}`,
    sentiment: 0,
    tags: [post.subreddit, post.flair || 'Reddit'].filter(Boolean),
    createdAt: new Date(post.created_utc * 1000).toISOString(),
    ingestedAt: new Date().toISOString()
  };
}

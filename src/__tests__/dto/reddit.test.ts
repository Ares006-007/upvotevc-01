import { describe, it, expect } from 'vitest';
import { mapRedditPostToSignal, RedditPost } from '@/dto/reddit';

describe('Reddit DTO Mappers', () => {
  it('should map a valid RedditPost to a SignalDTO correctly', () => {
    const mockPost: RedditPost = {
      post_id: '123abc',
      subreddit: 'startups',
      title: 'How to test Next.js apps?',
      selftext: 'This is a long body of text that could be truncated if it was really long...',
      author: 'testuser',
      score: 150,
      upvote_ratio: 0.95,
      num_comments: 20,
      created_utc: 1700000000,
      permalink: '/r/startups/comments/123abc/how_to_test/',
      url: 'https://reddit.com/r/startups/comments/123abc/how_to_test/',
      flair: 'Discussion',
      raw_json: {}
    };

    const signal = mapRedditPostToSignal(mockPost);

    expect(signal.id).toBe('reddit-123abc');
    expect(signal.source).toBe('reddit');
    expect(signal.title).toBe('How to test Next.js apps?');
    expect(signal.subreddit).toBe('startups');
    expect(signal.tags).toContain('startups');
    expect(signal.tags).toContain('Discussion');
    expect(signal.createdAt).toBe(new Date(1700000000 * 1000).toISOString());
    expect(signal.url).toBe('https://reddit.com/r/startups/comments/123abc/how_to_test/');
  });

  it('should safely omit flair if it is null', () => {
    const mockPost: RedditPost = {
      post_id: '123',
      subreddit: 'startups',
      title: 'Title',
      selftext: 'Body',
      author: 'user',
      score: 10,
      num_comments: 1,
      created_utc: 1700000000,
      permalink: '/r/startups/comments/123',
      url: 'url',
      flair: null,
      raw_json: {}
    };

    const signal = mapRedditPostToSignal(mockPost);
    expect(signal.tags).toContain('startups');
    expect(signal.tags).not.toContain(null);
  });
});

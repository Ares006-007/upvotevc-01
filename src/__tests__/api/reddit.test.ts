import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET as SubredditGET } from '@/app/api/reddit/subreddit/route';
import { GET as ThreadGET } from '@/app/api/reddit/thread/route';
import { RedditJsonClient } from '@/clients/redditJson';

describe('API Route: /api/reddit', () => {
  beforeEach(() => {
    vi.spyOn(RedditJsonClient, 'fetchSubredditPosts').mockClear();
    vi.spyOn(RedditJsonClient, 'fetchPostComments').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/reddit/subreddit', () => {
    it('should validate missing query params', async () => {
      const request = new Request('http://localhost/api/reddit/subreddit'); // Missing 'name'
      const response = await SubredditGET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return fetched subreddit posts', async () => {
      vi.spyOn(RedditJsonClient, 'fetchSubredditPosts').mockResolvedValueOnce([
        {
          post_id: 'post1',
          subreddit: 'startups',
          title: 'Test',
          selftext: 'Body',
          author: 'user',
          score: 1,
          num_comments: 0,
          created_utc: 1,
          permalink: '/',
          url: '/',
          flair: null,
          raw_json: {}
        }
      ]);

      const request = new Request('http://localhost/api/reddit/subreddit?name=startups&sort=hot');
      const response = await SubredditGET(request);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.subreddit).toBe('startups');
      expect(json.data).toHaveLength(1);
    });

    it('should return 500 when fetch fails internally', async () => {
      vi.spyOn(RedditJsonClient, 'fetchSubredditPosts').mockRejectedValueOnce(new Error('Internal'));

      const request = new Request('http://localhost/api/reddit/subreddit?name=startups&sort=hot');
      const response = await SubredditGET(request);
      
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/reddit/thread', () => {
    it('should validate missing query params', async () => {
      const request = new Request('http://localhost/api/reddit/thread?subreddit=startups'); // Missing postId
      const response = await ThreadGET(request);
      
      expect(response.status).toBe(400);
    });

    it('should return fetched thread comments', async () => {
      vi.spyOn(RedditJsonClient, 'fetchPostComments').mockResolvedValueOnce([
        {
          comment_id: 'c1',
          post_id: 'p1',
          author: 'user',
          body: 'hello',
          score: 1,
          created_utc: 1,
          parent_id: 'p1',
          depth: 0,
          raw_json: {}
        }
      ]);

      const request = new Request('http://localhost/api/reddit/thread?subreddit=startups&postId=p1');
      const response = await ThreadGET(request);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.post_id).toBe('p1');
      expect(json.data).toHaveLength(1);
    });

    it('should return 500 when fetch fails internally', async () => {
      vi.spyOn(RedditJsonClient, 'fetchPostComments').mockRejectedValueOnce(new Error('Internal'));

      const request = new Request('http://localhost/api/reddit/thread?subreddit=startups&postId=p1');
      const response = await ThreadGET(request);
      
      expect(response.status).toBe(500);
    });
  });
});


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedditJsonClient } from '@/clients/redditJson';

describe('RedditJsonClient', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and map subreddit posts correctly', async () => {
    const mockResponse = {
      data: {
        children: [
          {
            data: {
              id: 'post1',
              subreddit: 'testsub',
              title: 'Test Title',
              selftext: 'Test Body',
              author: 'user1',
              score: 100,
              num_comments: 5,
              created_utc: 1000,
              permalink: '/r/testsub/comments/post1/',
              url: 'url'
            }
          }
        ]
      }
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const posts = await RedditJsonClient.fetchSubredditPosts('testsub', 'hot', 1);

    expect(posts).toHaveLength(1);
    expect(posts[0].post_id).toBe('post1');
    expect(posts[0].title).toBe('Test Title');
  });

  it('should handle fetch failures gracefully for subreddit posts', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('Error', { status: 500 }));

    const posts = await RedditJsonClient.fetchSubredditPosts('testsub');
    
    expect(posts).toEqual([]);
  });

  it('should fetch and recursively map post comments correctly', async () => {
    const mockResponse = [
      {}, // Post metadata block (ignored in this function)
      { // Comments block
        data: {
          children: [
            {
              kind: 't1',
              data: {
                id: 'comment1',
                author: 'user1',
                body: 'First level',
                score: 10,
                created_utc: 1000,
                parent_id: 't3_post1',
                replies: {
                  data: {
                    children: [
                      {
                        kind: 't1',
                        data: {
                          id: 'comment2',
                          author: 'user2',
                          body: 'Second level',
                          score: 5,
                          created_utc: 1001,
                          parent_id: 't1_comment1'
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ];

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

    const comments = await RedditJsonClient.fetchPostComments('testsub', 'post1');

    expect(comments).toHaveLength(2);
    
    expect(comments[0].comment_id).toBe('comment1');
    expect(comments[0].depth).toBe(0);
    
    expect(comments[1].comment_id).toBe('comment2');
    expect(comments[1].depth).toBe(1);
  });
});

import { fetchWithRetry } from '../utils/retry';
import { logger } from '../utils/logger';
import { RedditPost, RedditComment, RedditThread } from '../dto/reddit';

export class RedditJsonClient {
  /**
   * Fetches the post feed for a given subreddit.
   */
  static async fetchSubredditPosts(subreddit: string, sort: 'hot' | 'new' | 'top' | 'rising' = 'hot', limit: number = 10): Promise<RedditPost[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
      const response = await fetchWithRetry(url, {
        headers: { 'User-Agent': 'UpvoteVC/1.0.0' }
      });

      if (!response.ok) {
        logger.error(`Reddit fetchSubredditPosts error: ${response.status}`, { subreddit, sort });
        return [];
      }

      const json = await response.json();
      const children = json.data?.children || [];

      return children.map((child: any) => {
        const data = child.data;
        return {
          post_id: data.id,
          subreddit: data.subreddit,
          title: data.title,
          selftext: data.selftext || '',
          author: data.author,
          score: data.score,
          upvote_ratio: data.upvote_ratio,
          num_comments: data.num_comments,
          created_utc: data.created_utc,
          permalink: data.permalink,
          url: data.url,
          flair: data.link_flair_text || null,
          raw_json: data
        } as RedditPost;
      });
    } catch (error) {
      logger.error('Failed to fetch subreddit posts via JSON', error, { subreddit, sort });
      return [];
    }
  }

  /**
   * Fetches comments for a specific post id.
   */
  static async fetchPostComments(subreddit: string, postId: string): Promise<RedditComment[]> {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
      const response = await fetchWithRetry(url, {
        headers: { 'User-Agent': 'UpvoteVC/1.0.0' }
      });

      if (!response.ok) {
        logger.error(`Reddit fetchPostComments error: ${response.status}`, { subreddit, postId });
        return [];
      }

      const json = await response.json();
      
      // Reddit thread JSON returns an array of 2 objects: [postData, commentsData]
      if (!Array.isArray(json) || json.length < 2) return [];

      const commentsData = json[1].data?.children || [];
      const commentsList: RedditComment[] = [];

      // Helper for recursive comment parsing
      const parseComments = (children: any[], depth: number = 0) => {
        for (const child of children) {
          if (child.kind === 't1') { // t1 = comment, t3 = link/post, more = more comments stub
            const data = child.data;
            commentsList.push({
              comment_id: data.id,
              post_id: postId,
              author: data.author,
              body: data.body || '',
              score: data.score,
              created_utc: data.created_utc,
              parent_id: data.parent_id,
              depth: data.depth !== undefined ? data.depth : depth,
              raw_json: data
            });

            if (data.replies && typeof data.replies === 'object' && data.replies.data?.children) {
              parseComments(data.replies.data.children, depth + 1);
            }
          }
        }
      };

      parseComments(commentsData);

      return commentsList;
    } catch (error) {
      logger.error('Failed to fetch post comments via JSON', error, { subreddit, postId });
      return [];
    }
  }

  /**
   * Fetches posts and then fetches their corresponding comments concurrently.
   */
  static async fetchSubredditWithComments(subreddit: string, sort: 'hot' | 'new' | 'top' | 'rising' = 'hot', limit: number = 5): Promise<RedditThread[]> {
    try {
      const posts = await this.fetchSubredditPosts(subreddit, sort, limit);
      
      // Concurrently fetch comments for each post (with a generous timeout/retry handled by fetchWithRetry)
      const threads: RedditThread[] = await Promise.all(
        posts.map(async (post) => {
          const comments = await this.fetchPostComments(post.subreddit, post.post_id);
          return { post, comments };
        })
      );

      return threads;
    } catch (error) {
      logger.error('Failed to fetch subreddit with comments via JSON', error, { subreddit });
      return [];
    }
  }
}

import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
}

export async function fetchWithRetry(url: string, init?: RequestInit, options?: RetryOptions): Promise<Response> {
  const maxRetries = options?.maxRetries ?? 3;
  let delay = options?.initialDelayMs ?? 500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      
      // If successful or client error (except 429), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      if (attempt === maxRetries) {
        return response;
      }
      
      logger.warn(`Fetch attempt ${attempt} failed with status ${response.status}. Retrying in ${delay}ms...`, { url });
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger.warn(`Fetch attempt ${attempt} failed with error. Retrying in ${delay}ms...`, { url, error });
    }
    
    await new Promise(res => setTimeout(res, delay));
    delay *= 2; // exponential backoff
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

import { z } from 'zod';

const envSchema = z.object({
  REDDIT_API_KEY: z.string().optional(),
  NEWS_API_KEY: z.string().min(1, 'NEWS_API_KEY is required'),
  MASSIVE_API_KEY: z.string().min(1, 'MASSIVE_API_KEY is required'),
  HACK_CLUB_AI_KEY: z.string().min(1, 'HACK_CLUB_AI_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

let envData: z.infer<typeof envSchema>;

if (!parsed.success) {
  if (process.env.npm_lifecycle_event === 'build' || process.env.NODE_ENV === 'test') {
    console.warn("⚠️ Skipping env validation during Next.js build or test phase.");
    envData = process.env as any;
  } else {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
} else {
  envData = parsed.data;
}

export const env = envData;

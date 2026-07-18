import { NextResponse } from 'next/server';
import { SignalService } from '@/domain/signals';
import { z } from 'zod';
import { logger } from '@/utils/logger';

// Optional: basic validation on query params
const QuerySchema = z.object({
  query: z.string().optional(),
  limit: z.coerce.number().max(50).default(10)
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = QuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.format() }, { status: 400 });
    }

    const signals = await SignalService.getAggregatedSignals(parseResult.data);
    
    return NextResponse.json(signals);
  } catch (error) {
    logger.error('Unhandled error in GET /api/signals', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

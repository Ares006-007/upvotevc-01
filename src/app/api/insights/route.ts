import { NextResponse } from 'next/server';
import { InsightService } from '@/domain/insights';
import { SignalService } from '@/domain/signals';
import { SignalSchema } from '@/dto/schemas';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const RequestSchema = z.object({
  signals: z.array(SignalSchema).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = RequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: parseResult.error.format() }, { status: 400 });
    }

    let signalsToAnalyze = parseResult.data.signals || [];
    if (signalsToAnalyze.length === 0) {
      signalsToAnalyze = await SignalService.getAggregatedSignals({ limit: 10 });
    }

    const insight = await InsightService.generateInsightFromSignals(signalsToAnalyze);

    return NextResponse.json(insight);
  } catch (error) {
    logger.error('Unhandled error in POST /api/insights', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

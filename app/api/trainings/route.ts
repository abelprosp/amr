import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentId,
  listTrainings,
  createTraining,
  type CreateTrainingBody,
} from '@/app/lib/gptmaker';

type AgentParam = 'hm' | 'bm';

function parseAgent(v: string | null): AgentParam | null {
  if (v === 'hm' || v === 'bm') return v;
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const agent = parseAgent(request.nextUrl.searchParams.get('agent'));
    if (!agent) {
      return NextResponse.json(
        { error: 'Query "agent" obrigatório: hm ou bm' },
        { status: 400 }
      );
    }
    const agentId = getAgentId(agent);
    const typeParam = request.nextUrl.searchParams.get('type');
    const types = ['TEXT', 'WEBSITE', 'VIDEO', 'DOCUMENT'] as const;
    const singleType = typeParam && types.includes(typeParam as (typeof types)[number])
      ? (typeParam as (typeof types)[number])
      : null;

    let data: unknown;
    if (singleType) {
      data = await listTrainings(agentId, { type: singleType });
    } else {
      const results = await Promise.all(
        types.map((t) => listTrainings(agentId, { type: t }))
      );
      const merged = (results as unknown[][]).flat();
      data = merged;
    }
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao listar treinamentos';
    console.error('[GET /api/trainings]', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      agent?: string;
      type?: string;
      text?: string;
      image?: string;
      callbackUrl?: string;
    };
    const agent = parseAgent(body.agent ?? null);
    if (!agent) {
      return NextResponse.json(
        { error: 'Campo "agent" obrigatório: hm ou bm' },
        { status: 400 }
      );
    }
    const agentId = getAgentId(agent);
    const payload: CreateTrainingBody = {
      type: 'TEXT',
      text: body.text ?? '',
      image: body.image || undefined,
      callbackUrl: body.callbackUrl || undefined,
    };
    const data = await createTraining(agentId, payload);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar treinamento';
    console.error('[POST /api/trainings]', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

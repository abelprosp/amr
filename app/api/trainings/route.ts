import { NextRequest, NextResponse } from 'next/server';
import {
  listTrainingsFromDb,
  createTrainingInDb,
  type AgentKind,
  type TrainingType,
} from '@/app/lib/trainings-db';
import { notifyHmWebhook } from '@/app/lib/webhook-hm';

const AGENTS: AgentKind[] = ['hm', 'bm'];
const TYPES: TrainingType[] = ['TEXT', 'WEBSITE', 'VIDEO', 'DOCUMENT'];

function parseAgent(v: string | null): AgentKind | null {
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

    const typeParam = request.nextUrl.searchParams.get('type');
    const singleType: TrainingType | null =
      typeParam && TYPES.includes(typeParam as TrainingType) ? (typeParam as TrainingType) : null;

    const rows = await listTrainingsFromDb(agent, singleType ?? undefined);
    const data = rows.map((r) => ({
      id: r.id,
      type: r.type,
      text: r.text,
      image: r.image,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
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

    const type = body.type && TYPES.includes(body.type as TrainingType) ? (body.type as TrainingType) : 'TEXT';
    const row = await createTrainingInDb(agent, {
      type,
      text: body.text ?? '',
      image: body.image,
    });

    if (agent === 'hm' && process.env.WEBHOOK_HM_UPDATES?.trim()) {
      await notifyHmWebhook({
        event: 'training_created',
        agent: 'hm',
        training_id: row.id,
        type: row.type,
        text: row.text || undefined,
        image: row.image ?? undefined,
      });
    }

    return NextResponse.json({
      id: row.id,
      type: row.type,
      text: row.text,
      image: row.image,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar treinamento';
    console.error('[POST /api/trainings]', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

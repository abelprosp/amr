import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { listTrainingsFromDb } from '@/app/lib/trainings-db';
import { chatWithContext, chatWithHistory, type TrainingContext, type ChatMessage } from '@/app/lib/openai';

type AgentKind = 'hm' | 'bm';

function parseAgent(v: string | null): AgentKind | null {
  if (v === 'hm' || v === 'bm') return v;
  return null;
}

/**
 * POST /api/chat – Chat com ChatGPT e contexto dos treinamentos.
 * Body: { agent: 'hm' | 'bm', message: string, history?: { role: 'user'|'assistant', content: string }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = (await request.json()) as {
      agent?: string;
      message?: string;
      history?: { role: string; content: string }[];
    };
    const agent = parseAgent(body.agent ?? null);
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: String(m.content ?? '').trim() }))
          .filter((m) => m.content.length > 0)
      : [];

    if (!agent) {
      return NextResponse.json({ error: 'Campo "agent" obrigatório: hm ou bm' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Campo "message" obrigatório' }, { status: 400 });
    }

    const rows = await listTrainingsFromDb(agent);
    const context: TrainingContext = rows.map((r) => ({
      type: r.type,
      text: r.text,
      image: r.image,
    }));

    const answer =
      history.length > 0
        ? await chatWithHistory(message, context, history)
        : await chatWithContext(message, context);
    return NextResponse.json({ answer });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao processar pergunta';
    console.error('[POST /api/chat]', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

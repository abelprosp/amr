import { NextRequest, NextResponse } from 'next/server';
import { updateTrainingInDb, deleteTrainingInDb } from '@/app/lib/trainings-db';
import { notifyHmWebhook } from '@/app/lib/webhook-hm';

type RouteContext = { params: Promise<{ trainingId: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { trainingId } = await context.params;
    const body = (await request.json()) as {
      type?: string;
      text?: string;
      image?: string;
      agent?: string;
    };
    const row = await updateTrainingInDb(trainingId, {
      type: 'TEXT',
      text: body.text ?? '',
      image: body.image,
    });
    if (body.agent === 'hm' && process.env.WEBHOOK_HM_UPDATES?.trim()) {
      await notifyHmWebhook({
        event: 'training_updated',
        agent: 'hm',
        training_id: trainingId,
        type: 'TEXT',
        text: body.text ?? undefined,
        image: body.image ?? undefined,
      });
    }
    return NextResponse.json({
      id: row.id,
      type: row.type,
      text: row.text,
      image: row.image,
      updated_at: row.updated_at,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar treinamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { trainingId } = await context.params;
    const agent = request.nextUrl.searchParams.get('agent') ?? undefined;
    await deleteTrainingInDb(trainingId);
    if (agent === 'hm' && process.env.WEBHOOK_HM_UPDATES?.trim()) {
      await notifyHmWebhook({
        event: 'training_deleted',
        agent: 'hm',
        training_id: trainingId,
      });
    }
    return NextResponse.json({ id: trainingId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao remover treinamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

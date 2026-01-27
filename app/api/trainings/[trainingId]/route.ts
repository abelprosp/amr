import { NextRequest, NextResponse } from 'next/server';
import { updateTraining, deleteTraining, type UpdateTrainingBody } from '@/app/lib/gptmaker';

type RouteContext = { params: Promise<{ trainingId: string }> };

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { trainingId } = await context.params;
    const body = (await request.json()) as {
      type?: string;
      text?: string;
      image?: string;
    };
    const payload: UpdateTrainingBody = {
      type: 'TEXT',
      text: body.text ?? '',
      image: body.image || undefined,
    };
    const data = await updateTraining(trainingId, payload);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao atualizar treinamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { trainingId } = await context.params;
    const data = await deleteTraining(trainingId);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao remover treinamento';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

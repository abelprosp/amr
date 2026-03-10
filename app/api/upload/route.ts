import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

const BUCKET = 'trainings';
const MAX_SIZE_MB = 15;

async function extractPdfTextFromBuffer(buffer: ArrayBuffer): Promise<string | null> {
  try {
    const { getDocumentProxy, extractText } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text?.trim() || null;
  } catch (e) {
    console.warn('[upload] PDF extract failed', e);
    return null;
  }
}

/**
 * POST /api/upload – Upload para Supabase Storage. Para PDFs, extrai o texto e retorna em extractedText.
 * FormData: file (obrigatório), agent (hm ou bm).
 * Retorna { url, extractedText? }. Crie o bucket "trainings" no Supabase (Storage > Public).
 */
export async function POST(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = await createClient();
    } catch (e) {
      console.error('[upload] createClient failed', e);
      return NextResponse.json(
        { error: 'Erro ao verificar autenticação. Tente fazer login novamente.' },
        { status: 500 }
      );
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const agent = formData.get('agent') as string | null;
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Campo "file" obrigatório' }, { status: 400 });
    }
    const agentVal = agent === 'hm' || agent === 'bm' ? agent : 'hm';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Arquivo maior que ${MAX_SIZE_MB} MB` }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
    const path = `${agentVal}/${Date.now()}-${safeName}`;
    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (e) {
      console.error('[upload] arrayBuffer failed', e);
      return NextResponse.json(
        { error: 'Arquivo muito grande ou inválido. Limite: ' + MAX_SIZE_MB + ' MB.' },
        { status: 400 }
      );
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    // Usar cópia do buffer na extração para não invalidar (detach) o buffer usado no upload
    const extractedText = isPdf ? await extractPdfTextFromBuffer(buffer.slice(0)) : null;

    let admin;
    try {
      admin = createAdminClient();
    } catch (e) {
      console.error('[upload] createAdminClient failed', e);
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta (Supabase). Contate o administrador.' },
        { status: 500 }
      );
    }

    const bytesForUpload = new Uint8Array(buffer);
    const { data, error } = await admin.storage.from(BUCKET).upload(path, bytesForUpload, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) {
      console.error('[upload] storage error', error);
      const hint = error.message?.toLowerCase().includes('bucket')
        ? ' Crie o bucket "trainings" no Supabase (Storage > New bucket > nome: trainings, público).'
        : '';
      return NextResponse.json(
        { error: (error.message || 'Falha no upload.') + hint },
        { status: 500 }
      );
    }
    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(data.path);
    const url = urlData.publicUrl;
    return NextResponse.json(extractedText ? { url, extractedText } : { url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro no upload';
    console.error('[POST /api/upload]', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const supabase = await createClient();
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
    const buffer = await file.arrayBuffer();
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const extractedText = isPdf ? await extractPdfTextFromBuffer(buffer) : null;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(BUCKET).upload(path, new Uint8Array(buffer), {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) {
      console.error('[upload]', error);
      return NextResponse.json(
        { error: error.message || 'Falha no upload. Crie o bucket "trainings" no Supabase (Storage, público).' },
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

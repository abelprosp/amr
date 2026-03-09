import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { IA_SLUGS } from '@/app/lib/auth/constants';

/** PUT: atualizar acessos às IAs de um usuário. Apenas admin. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { userId } = await context.params;
  const body = await request.json();
  const slugsSet = new Set(IA_SLUGS as readonly string[]);
  const ia_slugs = Array.isArray(body.ia_slugs)
    ? (body.ia_slugs as string[]).filter((s) => typeof s === 'string' && slugsSet.has(s))
    : [];

  const admin = createAdminClient();
  await admin.from('user_ia_access').delete().eq('user_id', userId);
  if (ia_slugs.length > 0) {
    await admin.from('user_ia_access').insert(ia_slugs.map((ia_slug: string) => ({ user_id: userId, ia_slug })));
  }

  return NextResponse.json({ ok: true });
}

import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { IA_SLUGS } from '@/app/lib/auth/constants';

/** POST: criar usuário (email, password, ia_slugs). Apenas admin. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const slugsSet = new Set(IA_SLUGS as readonly string[]);
  const ia_slugs = Array.isArray(body.ia_slugs)
    ? (body.ia_slugs as string[]).filter((s) => typeof s === 'string' && slugsSet.has(s))
    : [];

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }
  if (!newUser.user) {
    return NextResponse.json({ error: 'Falha ao criar usuário' }, { status: 500 });
  }

  const userId = newUser.user.id;
  if (ia_slugs.length > 0) {
    await admin.from('user_ia_access').insert(ia_slugs.map((ia_slug: string) => ({ user_id: userId, ia_slug })));
  }

  return NextResponse.json({ id: userId, email: newUser.user.email });
}

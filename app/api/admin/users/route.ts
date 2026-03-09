import { createClient } from '@/app/lib/supabase/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { NextResponse } from 'next/server';

/** GET: lista usuários (profiles + acessos). Apenas admin. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: profiles } = await admin.from('profiles').select('id, email, role, created_at').order('created_at', { ascending: false });
  const { data: access } = await admin.from('user_ia_access').select('user_id, ia_slug');

  const accessByUser = (access ?? []).reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push(row.ia_slug);
    return acc;
  }, {});

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    role: p.role,
    created_at: p.created_at,
    ia_slugs: accessByUser[p.id] ?? [],
  }));

  return NextResponse.json(users);
}

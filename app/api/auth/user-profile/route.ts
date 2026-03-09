import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

export type ProfileWithAccess = {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  ia_slugs: string[];
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { profile: { id: user.id, email: user.email ?? null, role: 'user' as const, ia_slugs: [] } },
      { status: 200 }
    );
  }

  const isAdmin = profile.role === 'admin';
  let ia_slugs: string[] = [];
  if (!isAdmin) {
    const { data: access } = await supabase
      .from('user_ia_access')
      .select('ia_slug')
      .eq('user_id', user.id);
    ia_slugs = (access ?? []).map((r) => r.ia_slug);
  } else {
    ia_slugs = ['dashboard', 'bluemilk', 'usoulimpou', 'treinamento', 'treinamento_hm', 'treinamento_bm', 'chat_bluemilk', 'chat_usoulimpou'];
  }

  const result: ProfileWithAccess = {
    id: profile.id,
    email: profile.email ?? user.email ?? null,
    role: profile.role as 'admin' | 'user',
    ia_slugs,
  };
  return NextResponse.json(result);
}

-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Tabela de perfis: role 'admin' tem acesso total; demais usuários têm acesso por user_ia_access
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Acesso por IA (ignorado se profiles.role = 'admin')
create table if not exists public.user_ia_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ia_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, ia_slug)
);

create index if not exists user_ia_access_user_id_idx on public.user_ia_access(user_id);

-- Trigger: criar perfil ao inserir usuário no auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_ia_access enable row level security;

-- Perfis: usuário vê só o próprio; admin pode ser definido manualmente no Supabase (update profiles set role = 'admin' where email = 'seu@email.com')
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile (limited)" on public.profiles for update using (auth.uid() = id);

-- Acesso IAs: usuário vê só os próprios
create policy "Users can read own ia access" on public.user_ia_access for select using (auth.uid() = user_id);

-- Serviço admin (criar usuários e acessos) será feito via API route com service_role key
-- Não exponha a service_role no client; use apenas em getServerSideProps/Route Handlers.

-- Treinamentos (conteúdo por agente HM/BM) – usado como contexto para ChatGPT
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  agent text not null check (agent in ('hm', 'bm')),
  type text not null default 'TEXT' check (type in ('TEXT', 'WEBSITE', 'VIDEO', 'DOCUMENT')),
  text text not null default '',
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists trainings_agent_idx on public.trainings(agent);

alter table public.trainings enable row level security;
-- Leitura para usuários autenticados; escrita via API com service_role (ignora RLS)
create policy "Allow read for authenticated" on public.trainings for select using (auth.role() = 'authenticated');

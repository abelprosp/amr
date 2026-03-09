-- Criar tabela de treinamentos (rode no SQL Editor do Supabase: Dashboard > SQL Editor > New query)
-- Cole este bloco e execute (Run).

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

create policy "Allow read for authenticated"
  on public.trainings
  for select
  using (auth.role() = 'authenticated');

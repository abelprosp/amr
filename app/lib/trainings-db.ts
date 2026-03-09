/**
 * Treinamentos armazenados no Supabase (substitui GPT Maker).
 * Usados como contexto para a API do ChatGPT.
 */

import { createAdminClient } from '@/app/lib/supabase/admin';

export type AgentKind = 'hm' | 'bm';
export type TrainingType = 'TEXT' | 'WEBSITE' | 'VIDEO' | 'DOCUMENT';

export type TrainingRow = {
  id: string;
  agent: string;
  type: string;
  text: string;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export async function listTrainingsFromDb(agent: AgentKind, type?: TrainingType): Promise<TrainingRow[]> {
  const supabase = createAdminClient();
  let q = supabase.from('trainings').select('*').eq('agent', agent).order('created_at', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingRow[];
}

export async function createTrainingInDb(agent: AgentKind, row: { type?: string; text?: string; image?: string }): Promise<TrainingRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('trainings')
    .insert({
      agent,
      type: row.type ?? 'TEXT',
      text: row.text ?? '',
      image: row.image || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as TrainingRow;
}

export async function updateTrainingInDb(
  id: string,
  row: { type?: string; text?: string; image?: string }
): Promise<TrainingRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('trainings')
    .update({
      type: row.type ?? 'TEXT',
      text: row.text ?? '',
      image: row.image ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as TrainingRow;
}

export async function deleteTrainingInDb(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('trainings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

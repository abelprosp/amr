const BASE = 'https://api.gptmaker.ai/v2';

function getAuthHeaders(): HeadersInit {
  const token = process.env.GPTMAKER_TOKEN;
  if (!token) throw new Error('GPTMAKER_TOKEN não configurado no .env');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function getAgentId(agent: 'hm' | 'bm'): string {
  const key = agent === 'hm' ? 'AGENT_ID_HM' : 'AGENT_ID_BM';
  const id = process.env[key];
  if (!id) throw new Error(`${key} não configurado no .env`);
  return id;
}

const TRAINING_TYPES = ['TEXT', 'WEBSITE', 'VIDEO', 'DOCUMENT'] as const;

export async function listTrainings(
  agentId: string,
  opts?: { type?: (typeof TRAINING_TYPES)[number] }
): Promise<unknown> {
  const type = opts?.type ?? 'TEXT';
  const url = new URL(`${BASE}/agent/${agentId}/trainings`);
  url.searchParams.set('type', type);
  const res = await fetch(url.toString(), {
    headers: { Authorization: (getAuthHeaders() as Record<string, string>).Authorization },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`list trainings: ${res.status} ${t}`);
  }
  return res.json();
}

export type CreateTrainingBody = {
  type: 'TEXT';
  text?: string;
  image?: string;
  callbackUrl?: string;
};

export async function createTraining(
  agentId: string,
  body: CreateTrainingBody
): Promise<unknown> {
  const res = await fetch(`${BASE}/agent/${agentId}/trainings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`create training: ${res.status} ${t}`);
  }
  return res.json();
}

export type UpdateTrainingBody = {
  type: 'TEXT';
  text?: string;
  image?: string;
};

export async function updateTraining(
  trainingId: string,
  body: UpdateTrainingBody
): Promise<unknown> {
  const res = await fetch(`${BASE}/training/${trainingId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`update training: ${res.status} ${t}`);
  }
  return res.json();
}

export async function deleteTraining(trainingId: string): Promise<unknown> {
  const h = getAuthHeaders() as Record<string, string>;
  const res = await fetch(`${BASE}/training/${trainingId}`, {
    method: 'DELETE',
    headers: { Authorization: h.Authorization },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`delete training: ${res.status} ${t}`);
  }
  return res.json();
}

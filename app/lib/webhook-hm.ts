/**
 * Notifica o webhook externo quando o agente HM tem treinamentos criados/atualizados/removidos.
 * URL configurável em WEBHOOK_HM_UPDATES no .env.
 */

export type HmWebhookEvent = 'training_created' | 'training_updated' | 'training_deleted';

export type HmWebhookPayload = {
  event: HmWebhookEvent;
  agent: 'hm';
  training_id?: string;
  type?: string;
  text?: string;
  image?: string;
  at: string; // ISO timestamp
};

const WEBHOOK_URL = process.env.WEBHOOK_HM_UPDATES;

const TRAININGS_GET_URL = process.env.WEBHOOK_HM_TRAININGS_GET || WEBHOOK_URL;

/**
 * Tenta obter a lista de treinamentos HM via GET (WEBHOOK_HM_TRAININGS_GET ou WEBHOOK_HM_UPDATES).
 * Retorna null se não houver URL, GET falhar ou a resposta não for um array.
 */
export async function fetchHmTrainingsFromWebhook(): Promise<unknown[] | null> {
  const url = TRAININGS_GET_URL?.trim();
  if (!url) return null;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray((data as { data?: unknown })?.data) ? (data as { data: unknown[] }).data : null;
  } catch {
    return null;
  }
}

/** Envia payload para o webhook HM (não bloqueia; ignora erros). */
export async function notifyHmWebhook(payload: Omit<HmWebhookPayload, 'at'>): Promise<void> {
  if (!WEBHOOK_URL?.trim()) return;
  const body: HmWebhookPayload = {
    ...payload,
    at: new Date().toISOString(),
  };
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn('[webhook-hm]', res.status, await res.text());
    }
  } catch (e) {
    console.warn('[webhook-hm]', e);
  }
}

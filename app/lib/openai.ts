/**
 * Cliente da API OpenAI (ChatGPT) para respostas com contexto dos treinamentos.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

export type TrainingContext = { type: string; text: string; image?: string | null }[];

const SYSTEM_RULES = `Regras obrigatórias:
- Para cumprimentos, agradecimentos ou despedidas (ex.: "olá", "oi", "obrigado", "tchau"), responda de forma breve e natural, sem exigir isso do material.
- Para qualquer PERGUNTA ou pedido de INFORMAÇÃO/CONTEÚDO, responda SOMENTE com base no material de treinamento abaixo. Não use conhecimento externo.
- Se a pergunta não puder ser respondida com o material, responda apenas: "Essa informação não consta no meu treinamento."
- Não invente, não deduza e não complemente com informações de fora do material.`;

function getSystemMessage(context: TrainingContext): string {
  if (context.length === 0) {
    return `${SYSTEM_RULES}\n\nNão há material de treinamento disponível. Diga ao usuário que não há conteúdo treinado para consultar e que ele deve adicionar treinamentos primeiro.`;
  }
  const parts = context.map((t) => (t.text?.trim() ? `[${t.type}]\n${t.text}` : '')).filter(Boolean);
  return `${SYSTEM_RULES}\n\n--- Material de treinamento (use APENAS isto para responder) ---\n\n${parts.join('\n\n---\n\n')}`;
}

export async function chatWithContext(
  userMessage: string,
  context: TrainingContext,
  options?: { model?: string }
): Promise<string> {
  if (!OPENAI_API_KEY?.trim()) throw new Error('OPENAI_API_KEY não configurado no .env');
  const model = options?.model || DEFAULT_MODEL;
  const systemContent = getSystemMessage(context);
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content ?? 'Sem resposta.';
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Chat com histórico de conversa (multi-turn) e contexto dos treinamentos.
 */
export async function chatWithHistory(
  userMessage: string,
  context: TrainingContext,
  history: ChatMessage[],
  options?: { model?: string }
): Promise<string> {
  if (!OPENAI_API_KEY?.trim()) throw new Error('OPENAI_API_KEY não configurado no .env');
  const model = options?.model || DEFAULT_MODEL;
  const systemContent = getSystemMessage(context);
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemContent },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content ?? 'Sem resposta.';
}

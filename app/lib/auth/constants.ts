/**
 * Slugs das IAs que podem ser concedidos aos usuários.
 * Admin tem acesso a todos sem precisar de registros em user_ia_access.
 */
export const IA_SLUGS = [
  'dashboard',
  'bluemilk',
  'usoulimpou',
  'treinamento',
  'treinamento_hm',
  'treinamento_bm',
  'chat_bluemilk',
  'chat_usoulimpou',
] as const;

export type IaSlug = (typeof IA_SLUGS)[number];

export const IA_LABELS: Record<IaSlug, string> = {
  dashboard: 'Dashboard',
  bluemilk: 'IA BlueMilk',
  usoulimpou: 'IA UsouLimpou',
  treinamento: 'Treinamento',
  treinamento_hm: 'Treinamento HM',
  treinamento_bm: 'Treinamento BM',
  chat_bluemilk: 'Chat BlueMilk',
  chat_usoulimpou: 'Chat UsouLimpou',
};

export type ProfileRole = 'admin' | 'user';

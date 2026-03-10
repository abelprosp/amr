export type AgentKind = 'hm' | 'bm';

export const CHAT_CONFIG = {
  bluemilk: {
    label: 'Chat BlueMilk',
    agent: 'bm' as AgentKind,
    logo: '/bm.png',
  },
  usoulimpou: {
    label: 'Chat UsouLimpou',
    agent: 'hm' as AgentKind,
    logo: '/hm.png',
  },
} as const;

export type ChatSlug = keyof typeof CHAT_CONFIG;

export const CHAT_SLUGS: ChatSlug[] = ['bluemilk', 'usoulimpou'];

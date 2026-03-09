export type AgentKind = 'hm' | 'bm';

export const CHAT_CONFIG = {
  bluemilk: {
    label: 'Chat BlueMilk',
    agent: 'hm' as AgentKind,
  },
  usoulimpou: {
    label: 'Chat UsouLimpou',
    agent: 'hm' as AgentKind,
  },
} as const;

export type ChatSlug = keyof typeof CHAT_CONFIG;

export const CHAT_SLUGS: ChatSlug[] = ['bluemilk', 'usoulimpou'];

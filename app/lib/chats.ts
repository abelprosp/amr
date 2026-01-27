export const CHAT_CONFIG = {
  bluemilk: {
    label: 'IA BlueMilk',
    iframeSrc: 'https://app.gptmaker.ai/widget/3ED9B41F212FF3B0AB29EE45785CCB51/iframe',
  },
  usoulimpou: {
    label: 'IA UsouLimpou',
    iframeSrc: 'https://app.gptmaker.ai/widget/3ED9B439BC19B10D4A241AC4C59CD28F/iframe',
  },
} as const;

export type ChatSlug = keyof typeof CHAT_CONFIG;

export const CHAT_SLUGS: ChatSlug[] = ['bluemilk', 'usoulimpou'];

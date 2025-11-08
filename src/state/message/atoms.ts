import { atom } from 'jotai';

export const messagesAtom = atom<unknown[]>([]);
export const messageDraftAtom = atom<string>('');
export const sendingStateAtom = atom<'idle' | 'sending' | 'error'>('idle');

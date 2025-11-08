import { atom } from 'jotai';

export const templatesAtom = atom<unknown[]>([]);
export const activeTemplateAtom = atom<unknown | null>(null);

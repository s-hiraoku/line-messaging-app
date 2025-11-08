import { atom } from 'jotai';

export const sidebarOpenAtom = atom<boolean>(true);
export const modalStateAtom = atom<string | null>(null);

import { atom } from 'jotai';

export const usersAtom = atom<unknown[]>([]);
export const selectedUserAtom = atom<unknown | null>(null);
export const userFilterAtom = atom<string>('');

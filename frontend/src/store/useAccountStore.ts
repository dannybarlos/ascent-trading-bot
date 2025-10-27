import { create } from 'zustand';
import { AccountStore, Account, Position, Activity } from '../types';

export const useAccountStore = create<AccountStore>((set) => ({
  account: null,
  positions: [],
  activities: [],

  setAccount: (account: Account) => set({ account }),

  setPositions: (positions: Position[]) => set({ positions }),

  setActivities: (activities: Activity[]) => set({ activities }),
}));

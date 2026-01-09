import { create } from 'zustand';
export type AppState = {
  lastVisitedFlowId?: string;
  theme?: 'light' | 'dark';
};
export const useAppStore = create<AppState>()((set, get) => ({}));
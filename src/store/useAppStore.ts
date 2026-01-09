import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flow } from '@/types/schema';
interface AppState {
  flows: Flow[];
  setFlows: (flows: Flow[]) => void;
  addFlow: (flow: Flow) => void;
  updateFlowState: (id: string, updates: Partial<Flow>) => void;
  removeFlow: (id: string) => void;
}
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      flows: [],
      setFlows: (flows) => set({ flows }),
      addFlow: (flow) => set((state) => ({ flows: [flow, ...state.flows] })),
      updateFlowState: (id, updates) =>
        set((state) => ({
          flows: state.flows.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)),
        })),
      removeFlow: (id) =>
        set((state) => ({
          flows: state.flows.filter((f) => f.id !== id),
        })),
    }),
    {
      name: 'rednox-storage-v2',
    }
  )
);
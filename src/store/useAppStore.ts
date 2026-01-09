import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Flow } from '@/types/schema';
interface AppState {
  flows: Flow[];
  addFlow: (flow: Flow) => void;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
  deleteFlow: (id: string) => void;
  toggleFlowStatus: (id: string) => void;
}
const MOCK_FLOWS: Flow[] = [
  {
    id: '1',
    name: 'Order Processor',
    description: 'Handles incoming webhook orders and saves to database.',
    status: 'active',
    lastExecuted: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Slack Notifier',
    description: 'Sends alerts when system errors are detected.',
    status: 'error',
    lastExecuted: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Backup Script',
    description: 'Nightly backup of serverless KV store.',
    status: 'disabled',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      flows: MOCK_FLOWS,
      addFlow: (flow) => set((state) => ({ flows: [flow, ...state.flows] })),
      updateFlow: (id, updates) =>
        set((state) => ({
          flows: state.flows.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)),
        })),
      deleteFlow: (id) =>
        set((state) => ({
          flows: state.flows.filter((f) => f.id !== id),
        })),
      toggleFlowStatus: (id) =>
        set((state) => ({
          flows: state.flows.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: f.status === 'active' ? 'disabled' : 'active',
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        })),
    }),
    {
      name: 'rednox-storage',
    }
  )
);
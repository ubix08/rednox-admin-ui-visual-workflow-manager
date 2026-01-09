import { ApiResponse, Flow, ExecutionResult, ExecutionLog } from '@/types/schema';
const BASE_URL = 'https://rednox.ubixsnow08.workers.dev';
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || response.statusText };
    }
    const data = await response.json();
    return { success: true, data: data.data || data };
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown network error' };
  }
}
export const workflowApi = {
  list: () => apiFetch<Flow[]>('/admin/flows'),
  create: (flowData: Partial<Flow>) => 
    apiFetch<Flow>('/admin/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    }),
  get: (id: string) => apiFetch<Flow>(`/admin/flows/${id}`),
  update: (id: string, flowData: Partial<Flow>) =>
    apiFetch<Flow>(`/admin/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flowData),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/admin/flows/${id}`, {
      method: 'DELETE',
    }),
  enable: (id: string) =>
    apiFetch<void>(`/admin/flows/${id}/enable`, {
      method: 'POST',
    }),
  disable: (id: string) =>
    apiFetch<void>(`/admin/flows/${id}/disable`, {
      method: 'POST',
    }),
  execute: (id: string, body: { nodeId?: string | null; payload: any }) =>
    apiFetch<ExecutionResult>(`/admin/flows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getDebugLogs: (id: string, limit: number = 50) =>
    apiFetch<ExecutionLog[]>(`/admin/flows/${id}/debug?limit=${limit}`),
  export: (id: string) => apiFetch<any>(`/admin/flows/${id}/export`),
  import: (data: any) =>
    apiFetch<Flow>('/admin/flows/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
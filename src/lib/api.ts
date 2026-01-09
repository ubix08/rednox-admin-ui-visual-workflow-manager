import { ApiResponse } from '@/types/schema';
const BASE_URL = import.meta.env.DEV ? '' : '';
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
    return { success: true, data: data.data };
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown network error' };
  }
}
export const workflowApi = {
  execute: (flowId: string, payload: any) => 
    apiFetch<{ success: boolean; logs: any[] }>(`/api/flows/execute`, {
      method: 'POST',
      body: JSON.stringify({ flowId, payload }),
    }),
  save: (flowId: string, flowData: any) =>
    apiFetch<void>(`/api/flows/${flowId}`, {
      method: 'PUT',
      body: JSON.stringify(flowData),
    }),
  get: (flowId: string) =>
    apiFetch<any>(`/api/flows/${flowId}`),
};
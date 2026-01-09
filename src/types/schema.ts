import { z } from 'zod';
export type FlowStatus = 'active' | 'draft' | 'error' | 'disabled';
export const NODE_CATEGORIES = ['input', 'output', 'function', 'storage', 'social', 'utility'] as const;
// Using z.enum with the readonly array directly is the standard way to handle this in Zod
export const NodeCategorySchema = z.enum(NODE_CATEGORIES);
export type NodeCategory = z.infer<typeof NodeCategorySchema>;
export const NodeConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  path: z.string().optional(),
  code: z.string().optional(),
  key: z.string().optional(),
  value: z.string().optional(),
  retries: z.number().min(0).max(5).default(0),
  timeout: z.number().min(100).max(30000).default(5000),
}).passthrough();
export type NodeConfig = z.infer<typeof NodeConfigSchema>;
export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: NodeCategorySchema.optional().default('function'),
  label: z.string(),
  description: z.string().optional(),
  config: NodeConfigSchema.default({
    retries: 0,
    timeout: 5000
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()).optional(),
});
export type Node = z.infer<typeof NodeSchema>;
export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});
export type Edge = z.infer<typeof EdgeSchema>;
export const FLOW_STATUS_VALUES = ['active', 'draft', 'error', 'disabled'] as const;
export const FlowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(FLOW_STATUS_VALUES).default('draft'),
  lastExecuted: z.string().optional().nullable(),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Flow = z.infer<typeof FlowSchema>;
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
}
export interface ExecutionResult {
  success: boolean;
  logs: ExecutionLog[];
  executedAt: string;
  result?: any;
}
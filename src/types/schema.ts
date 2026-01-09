import { z } from 'zod';
export type FlowStatus = 'active' | 'draft' | 'error' | 'disabled';
export const NODE_CATEGORIES = ['input', 'output', 'function', 'storage', 'social', 'utility'] as const;
// Fix: Zod enum requires a non-empty tuple [string, ...string[]]
export const NodeCategorySchema = z.enum(['input', 'output', 'function', 'storage', 'social', 'utility'] as [string, ...string[]]);
export type NodeCategory = z.infer<typeof NodeCategorySchema>;
export const NodeFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'select', 'boolean', 'json', 'code', 'password'] as [string, ...string[]]),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  default: z.any().optional(),
  required: z.boolean().optional().default(false),
  options: z.array(z.object({
    label: z.string(),
    value: z.any()
  })).optional(),
  rows: z.number().optional()
});
export type NodeField = z.infer<typeof NodeFieldSchema>;
export const NodeDefinitionSchema = z.object({
  type: z.string(),
  category: NodeCategorySchema,
  label: z.string(),
  paletteLabel: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(), 
  color: z.string().optional(),
  fields: z.array(NodeFieldSchema).default([]),
  defaultConfig: z.record(z.any()).optional(),
  inputs: z.number().default(1),
  outputs: z.number().default(1)
});
export type NodeDefinition = z.infer<typeof NodeDefinitionSchema>;
export const NodeConfigSchema = z.record(z.any()).default({});
export type NodeConfig = z.infer<typeof NodeConfigSchema>;
export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: NodeCategorySchema.optional().default('function'),
  label: z.string(),
  description: z.string().optional(),
  config: NodeConfigSchema,
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
  status: z.enum(FLOW_STATUS_VALUES as unknown as [string, ...string[]]).default('draft'),
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
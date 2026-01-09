import { z } from 'zod';
export type FlowStatus = 'active' | 'draft' | 'error' | 'disabled';
export const NODE_CATEGORIES = ['input', 'output', 'function', 'storage', 'social', 'utility'] as const;
// Environment-specific Zod requires nested unions for more than 3 arguments
export const NodeCategorySchema = z.union([
  z.union([z.literal('input'), z.literal('output'), z.literal('function')]),
  z.union([z.literal('storage'), z.literal('social'), z.literal('utility')])
]);
export type NodeCategory = z.infer<typeof NodeCategorySchema>;
export const NodeFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.union([
    z.union([z.literal('text'), z.literal('number'), z.literal('select')]),
    z.union([z.literal('boolean'), z.literal('json'), z.literal('code')]),
    z.literal('password')
  ]),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  default: z.any().optional(),
  required: z.boolean().default(false),
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
  sourceHandle: z.string().optional().nullable(),
  targetHandle: z.string().optional().nullable(),
});
export type Edge = z.infer<typeof EdgeSchema>;
export const FLOW_STATUS_VALUES = ['active', 'draft', 'error', 'disabled'] as const;
export const FlowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  status: z.union([
    z.union([z.literal('active'), z.literal('draft'), z.literal('error')]),
    z.literal('disabled')
  ]).default('draft'),
  lastExecuted: z.string().optional().nullable(),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Flow = z.infer<typeof FlowSchema>;
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
export type ExecutionLog = {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  nodeId?: string;
};
export type ExecutionResult = {
  success: boolean;
  logs: ExecutionLog[];
  executedAt: string;
  result?: any;
};
import { z } from 'zod';
export type FlowStatus = 'active' | 'draft' | 'error' | 'disabled';
export const NodeCategorySchema = z.enum(['input', 'output', 'function', 'storage', 'social', 'utility'] as const);
export type NodeCategory = z.infer<typeof NodeCategorySchema>;
export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  category: NodeCategorySchema,
  label: z.string(),
  description: z.string().optional(),
  config: z.record(z.any()).default({}),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()).optional(), // Compatibility with React Flow's data prop
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
export const FlowSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'draft', 'error', 'disabled'] as const).default('draft'),
  lastExecuted: z.string().optional(),
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
import { create } from 'zustand';
import {
  Connection,
  Edge,
  Node,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  OnNodesDelete,
  OnEdgesDelete,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionLog, NodeDefinition } from '@/types/schema';
type EditorState = {
  nodes: Node[];
  edges: Edge[];
  currentFlowId: string | null;
  selectedNodeId: string | null;
  logs: ExecutionLog[];
  nodeDefs: NodeDefinition[];
  isExecuting: boolean;
  isDirty: boolean;
  initialize: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onNodesDelete: OnNodesDelete;
  onEdgesDelete: OnEdgesDelete;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (definition: NodeDefinition, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setNodeDefs: (defs: NodeDefinition[]) => void;
  addLog: (log: Pick<ExecutionLog, 'level' | 'message' | 'nodeId'>) => void;
  clearLogs: () => void;
  setExecuting: (status: boolean) => void;
  setDirty: (dirty: boolean) => void;
};
export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  currentFlowId: null,
  selectedNodeId: null,
  logs: [],
  nodeDefs: [],
  isExecuting: false,
  isDirty: false,
  initialize: (flowId, nodes, edges) => {
    set({
      currentFlowId: flowId,
      nodes,
      edges,
      selectedNodeId: null,
      logs: [],
      isExecuting: false,
      isDirty: false
    });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true
    });
  },
  onNodesDelete: (deletedNodes) => {
    const deletedIds = new Set(deletedNodes.map(n => n.id));
    set({
      nodes: get().nodes.filter(n => !deletedIds.has(n.id)),
      selectedNodeId: get().selectedNodeId && deletedIds.has(get().selectedNodeId!) ? null : get().selectedNodeId,
      isDirty: true
    });
  },
  onEdgesDelete: (deletedEdges) => {
    const deletedIds = new Set(deletedEdges.map(e => e.id));
    set({
      edges: get().edges.filter(e => !deletedIds.has(e.id)),
      isDirty: true
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
      isDirty: true
    });
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  addNode: (def, position) => {
    const newNode: Node = {
      id: uuidv4(),
      type: 'flowNode',
      position,
      data: {
        label: def.label,
        type: def.type,
        category: def.category,
        icon: def.icon,
        color: def.color,
        config: {
          retries: 0,
          timeout: 5000,
          ...(def.defaultConfig || {})
        },
      },
    };
    set({
      nodes: [...get().nodes, newNode],
      isDirty: true
    });
  },
  updateNodeData: (id, newData) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                ...newData,
                config: newData.config 
                  ? { ...(node.data?.config as Record<string, any> || {}), ...newData.config } 
                  : (node.data?.config as Record<string, any> || {})
              }
            }
          : node
      ),
      isDirty: true
    });
  },
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      isDirty: true
    });
  },
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  addLog: (log) => {
    const newLog: ExecutionLog = {
      level: log.level,
      message: log.message,
      nodeId: log.nodeId,
      id: uuidv4(),
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 50)
    }));
  },
  clearLogs: () => set({ logs: [] }),
  setExecuting: (status) => set({ isExecuting: status }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setNodeDefs: (defs) => set({ nodeDefs: defs })
}));
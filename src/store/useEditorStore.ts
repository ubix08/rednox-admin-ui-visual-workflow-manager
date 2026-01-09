import { create } from 'zustand';
import {
  Connection,
  Edge,
  Node,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionLog, NodeDefinition } from '@/types/schema';
interface EditorState {
  nodes: Node[];
  edges: Edge[];
  currentFlowId: string | null;
  selectedNodeId: string | null;
  logs: ExecutionLog[];
  isExecuting: boolean;
  initialize: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (definition: NodeDefinition, position: { x: number, y: number }) => void;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setExecuting: (status: boolean) => void;
}
export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  currentFlowId: null,
  selectedNodeId: null,
  logs: [],
  isExecuting: false,
  initialize: (flowId, nodes, edges) => {
    set({ currentFlowId: flowId, nodes, edges, selectedNodeId: null, logs: [], isExecuting: false });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
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
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (id, newData) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      ),
    });
  },
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addLog: (log) => {
    const newLog: ExecutionLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date().toLocaleTimeString(),
    };
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 50)
    }));
  },
  clearLogs: () => set({ logs: [] }),
  setExecuting: (status) => set({ isExecuting: status }),
}));
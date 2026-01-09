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
interface EditorState {
  nodes: Node[];
  edges: Edge[];
  currentFlowId: string | null;
  selectedNodeId: string | null;
  initialize: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (type: string, position: { x: number, y: number }, label: string) => void;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}
export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  currentFlowId: null,
  selectedNodeId: null,
  initialize: (flowId, nodes, edges) => {
    set({ currentFlowId: flowId, nodes, edges, selectedNodeId: null });
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
  addNode: (type, position, label) => {
    const categoryMap: Record<string, string> = {
      'HTTP In': 'input',
      'Webhook': 'input',
      'HTTP Response': 'output',
      'Slack Post': 'output',
      'KV Put': 'storage',
      'KV Get': 'storage',
    };
    const newNode: Node = {
      id: uuidv4(),
      type: 'flowNode',
      position,
      data: {
        label,
        type,
        category: categoryMap[type] || 'function',
        config: {},
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
}));
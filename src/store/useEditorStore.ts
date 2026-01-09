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
  initialize: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: string, position: { x: number, y: number }, label: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}
export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  currentFlowId: null,
  initialize: (flowId, nodes, edges) => {
    set({ currentFlowId: flowId, nodes, edges });
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
  addNode: (type, position, label) => {
    const newNode: Node = {
      id: uuidv4(),
      type: 'flowNode',
      position,
      data: { 
        label, 
        type, 
        category: type === 'HTTP In' || type === 'Webhook' ? 'input' : 'function' 
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
}));
import React, { useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import { FlowNode } from './FlowNode';
import { Layers, MousePointer2 } from 'lucide-react';
const nodeTypes = {
  flowNode: FlowNode,
};
export function WorkflowCanvas() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onConnect = useEditorStore((s) => s.onConnect);
  const addNode = useEditorStore((s) => s.addNode);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      addNode(type, position, type);
    },
    [addNode]
  );
  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-muted/30"
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap zoomable pannable />
        <Panel position="top-right" className="bg-background/80 backdrop-blur-md border p-1 rounded-md shadow-sm flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-muted-foreground border-r pr-2">
            <Layers className="h-3 w-3" />
            {nodes.length} Nodes
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-muted-foreground">
            <MousePointer2 className="h-3 w-3" />
            Canvas Ready
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
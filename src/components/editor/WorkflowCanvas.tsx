import React, { useCallback, useRef, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Panel, 
  OnSelectionChangeParams,
  useReactFlow,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditorStore } from '@/store/useEditorStore';
import { FlowNode } from './FlowNode';
import { Layers, MousePointer2, AlertCircle, ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from 'lucide-react';
import { NodeDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function WorkflowCanvas() {
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onNodesDelete = useEditorStore((s) => s.onNodesDelete);
  const onEdgesDelete = useEditorStore((s) => s.onEdgesDelete);
  const onConnect = useEditorStore((s) => s.onConnect);
  const addNode = useEditorStore((s) => s.addNode);
  const setSelectedNodeId = useEditorStore((s) => s.setSelectedNodeId);
  const isDirty = useEditorStore((s) => s.isDirty);
  
  const [isLocked, setIsLocked] = React.useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  
  const nodeTypes = useMemo(() => ({
    flowNode: FlowNode,
  }), []);
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current) return;
      
      const definitionRaw = event.dataTransfer.getData('application/reactflow-def');
      if (!definitionRaw) return;
      
      try {
        const definition = JSON.parse(definitionRaw) as NodeDefinition;
        
        // Convert screen coordinates to flow coordinates correctly
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        addNode(definition, position);
      } catch (err) {
        console.error("Failed to parse node definition during drop", err);
      }
    },
    [addNode, screenToFlowPosition]
  );
  
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNode = params.nodes[0];
    setSelectedNodeId(selectedNode?.id || null);
  }, [setSelectedNodeId]);
  
  // Get connection color based on edge state
  const getEdgeColor = (edge: any) => {
    if (edge.animated) return 'hsl(var(--state-executing))';
    return 'hsl(var(--canvas-line))';
  };
  
  // Calculate node color for minimap
  const getMinimapNodeColor = (node: any) => {
    const category = node.data?.category as string;
    const colorMap: Record<string, string> = {
      'input': '#10b981',
      'output': '#ef4444',
      'function': '#3b82f6',
      'utility': '#8b5cf6',
      'storage': '#f59e0b',
    };
    return colorMap[category] || '#3b82f6';
  };
  
  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
        className="bg-muted/20"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { strokeWidth: 2 }
        }}
      >
        {/* Enhanced Background with dot pattern */}
        <Background 
          gap={20} 
          size={1.5} 
          color="hsl(var(--canvas-dot))" 
          variant={BackgroundVariant.Dots}
          className="opacity-60"
        />
        
        {/* Custom Controls Panel - Bottom Left */}
        <Panel position="bottom-left" className="flex flex-col gap-2 m-4">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg overflow-hidden">
            <TooltipProvider>
              {/* Zoom In */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="h-9 w-9 rounded-none border-b hover:bg-accent"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Zoom In</p>
                  <p className="text-[10px] text-muted-foreground">+</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Zoom Out */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="h-9 w-9 rounded-none border-b hover:bg-accent"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Zoom Out</p>
                  <p className="text-[10px] text-muted-foreground">-</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Fit View */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fitView({ padding: 0.2, duration: 400 })}
                    className="h-9 w-9 rounded-none border-b hover:bg-accent"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Fit View</p>
                  <p className="text-[10px] text-muted-foreground">Ctrl+0</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Lock Canvas */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLocked(!isLocked)}
                    className={cn(
                      "h-9 w-9 rounded-none hover:bg-accent",
                      isLocked && "bg-accent text-primary"
                    )}
                  >
                    {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">{isLocked ? 'Unlock' : 'Lock'} Canvas</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isLocked ? 'Enable editing' : 'Prevent changes'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Panel>
        
        {/* Enhanced MiniMap - Bottom Right */}
        <MiniMap
          zoomable
          pannable
          nodeColor={getMinimapNodeColor}
          maskColor="hsl(var(--muted) / 0.1)"
          className="border rounded-lg shadow-lg bg-background/95 backdrop-blur-sm"
          style={{ 
            width: 180, 
            height: 120,
            borderColor: 'hsl(var(--border))'
          }}
        />
        
        {/* Info Panel - Top Right */}
        <Panel position="top-right" className="m-4">
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-sm flex items-center divide-x overflow-hidden">
            {isDirty && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-amber-600 animate-pulse">
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Unsaved</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium text-muted-foreground">
              <Layers className="h-3 w-3" />
              <span>{nodes.length}</span>
              <span className="hidden sm:inline">Nodes</span>
            </div>
            
            {isLocked && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium text-primary">
                <Lock className="h-3 w-3" />
                <span className="hidden sm:inline">Locked</span>
              </div>
            )}
            
            {!isLocked && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium text-emerald-600">
                <MousePointer2 className="h-3 w-3" />
                <span className="hidden sm:inline">Ready</span>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

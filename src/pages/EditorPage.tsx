import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ChevronLeft, Save, Play, Settings2, Terminal, Box, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { useEditorStore } from '@/store/useEditorStore';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import { NodePalette } from '@/components/editor/NodePalette';
import { toast } from 'sonner';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const flows = useAppStore((s) => s.flows);
  const updateFlowInStore = useAppStore((s) => s.updateFlow);
  const initializeEditor = useEditorStore((s) => s.initialize);
  const editorNodes = useEditorStore((s) => s.nodes);
  const editorEdges = useEditorStore((s) => s.edges);
  const flow = flows.find(f => f.id === id);
  useEffect(() => {
    if (flow) {
      // Initialize editor state from global store
      // In a real app we'd map our custom node schema to RF nodes
      const initialNodes = flow.nodes.map(n => ({
        id: n.id,
        type: 'flowNode',
        position: n.position,
        data: { label: n.label, type: n.type, category: n.category },
      }));
      initializeEditor(flow.id, initialNodes as any, flow.edges as any);
    }
  }, [flow, initializeEditor]);
  const handleSave = () => {
    if (!id) return;
    // Map RF nodes back to our schema
    const nodesToSave = editorNodes.map(n => ({
      id: n.id,
      type: (n.data?.type as string) || 'unknown',
      category: (n.data?.category as any) || 'function',
      label: (n.data?.label as string) || 'Node',
      position: n.position,
      config: {},
    }));
    updateFlowInStore(id, {
      nodes: nodesToSave as any,
      edges: editorEdges as any,
    });
    toast.success('Workflow saved', {
      description: 'Changes have been committed to the serverless backend.'
    });
  };
  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-xl font-bold text-foreground">Flow not found</h2>
        <Button asChild><Link to="/">Return to Dashboard</Link></Button>
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <AppNavbar />
      {/* Editor Header */}
      <div className="h-14 border-b px-4 flex items-center justify-between bg-card z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-sm font-semibold leading-none">{flow.name}</h2>
            <span className="text-[10px] text-muted-foreground">ID: {flow.id.slice(0, 8)}...</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <Play className="h-3 w-3 fill-current" />
            Test Run
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 h-8 text-xs bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            <Save className="h-3 w-3" />
            Deploy
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Palette */}
        <aside className="hidden md:flex w-64 border-r flex-col z-10 shadow-sm">
          <NodePalette />
        </aside>
        {/* Center: Canvas Area */}
        <main className="flex-1 relative overflow-hidden bg-muted/10">
          <WorkflowCanvas />
        </main>
        {/* Right: Properties / Debug */}
        <aside className="hidden lg:flex w-80 border-l flex-col bg-card/50 z-10 shadow-sm">
          <Tabs defaultValue="properties" className="flex-1 flex flex-col">
            <div className="px-2 pt-2 border-b">
              <TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-1">
                <TabsTrigger value="properties" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs">
                  <Settings2 className="h-3.5 w-3.5 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="debug" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs">
                  <Terminal className="h-3.5 w-3.5 mr-2" />
                  Debug
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="properties" className="flex-1 p-4 m-0 overflow-auto">
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-3 p-6 border-2 border-dashed rounded-lg border-muted">
                <Settings2 className="h-10 w-10 opacity-10" />
                <div>
                  <p className="text-xs font-medium text-foreground">No node selected</p>
                  <p className="text-[10px] mt-1">Select a node on the canvas to configure its specialized parameters.</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="debug" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="flex-1 p-4 font-mono text-xs overflow-auto space-y-2">
                <div className="text-blue-500 flex items-center gap-2">
                  <Terminal className="h-3 w-3" />
                  <span>[System] Environment ready.</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>[Flow] Waiting for trigger...</span>
                </div>
              </div>
              <div className="p-2 border-t bg-muted/20">
                <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase tracking-widest h-7 hover:bg-background">Clear Logs</Button>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden border-t h-14 grid grid-cols-3 bg-card z-20">
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1">
          <Box className="h-4 w-4" />
          <span className="text-[10px]">Nodes</span>
        </Button>
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1 text-primary bg-primary/5">
          <Layers className="h-4 w-4" />
          <span className="text-[10px]">Canvas</span>
        </Button>
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1">
          <Settings2 className="h-4 w-4" />
          <span className="text-[10px]">Config</span>
        </Button>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ChevronLeft, Save, Play, Settings2, Terminal, Box, Layers, Trash2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/useAppStore';
import { useEditorStore } from '@/store/useEditorStore';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import { NodePalette } from '@/components/editor/NodePalette';
import { PropertyEditor } from '@/components/editor/PropertyEditor';
import { ExecutionModal } from '@/components/editor/ExecutionModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const [activeMobileTab, setActiveMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas');
  const [isExecutionModalOpen, setExecutionModalOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const flows = useAppStore((s) => s.flows);
  const updateFlowInStore = useAppStore((s) => s.updateFlow);
  const initializeEditor = useEditorStore((s) => s.initialize);
  const editorNodes = useEditorStore((s) => s.nodes);
  const editorEdges = useEditorStore((s) => s.edges);
  const logs = useEditorStore((s) => s.logs);
  const clearLogs = useEditorStore((s) => s.clearLogs);
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const flow = flows.find(f => f.id === id);
  useEffect(() => {
    if (flow) {
      const initialNodes = flow.nodes.map(n => ({
        id: n.id,
        type: 'flowNode',
        position: n.position,
        data: {
          label: n.label,
          type: n.type,
          category: n.category,
          config: n.config || {}
        },
      }));
      initializeEditor(flow.id, initialNodes as any, flow.edges as any);
    }
  }, [flow?.id, initializeEditor]); // Safe stable dependency
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  const handleSave = () => {
    if (!id) return;
    const nodesToSave = editorNodes.map(n => ({
      id: n.id,
      type: (n.data?.type as string) || 'unknown',
      category: (n.data?.category as any) || 'function',
      label: (n.data?.label as string) || 'Node',
      position: n.position,
      config: n.data?.config || {},
    }));
    updateFlowInStore(id, {
      nodes: nodesToSave as any,
      edges: editorEdges as any,
    });
    toast.success('Workflow deployed successfully', {
      description: 'The changes are now live on the serverless edge.'
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
      {/* Action Toolbar */}
      <div className="h-14 border-b px-4 flex items-center justify-between bg-card z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent h-8 w-8">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-sm font-semibold leading-none">{flow.name}</h2>
            <span className="text-[10px] text-muted-foreground">ID: {flow.id.slice(0, 8)}...</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-8 text-xs" 
            onClick={() => setExecutionModalOpen(true)}
            disabled={isExecuting}
          >
            {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            <span className="hidden sm:inline">Test Run</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 h-8 text-xs bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            <Save className="h-3 w-3" />
            <span className="hidden sm:inline">Deploy</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Palette */}
        <aside className={cn(
          "absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-64 md:border-r md:shadow-sm",
          activeMobileTab === 'palette' ? "translate-x-0" : "-translate-x-full"
        )}>
          <NodePalette />
        </aside>
        {/* Center: Canvas Area */}
        <main className="flex-1 relative overflow-hidden bg-muted/10">
          <WorkflowCanvas />
        </main>
        {/* Right: Properties / Debug */}
        <aside className={cn(
          "absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-80 md:border-l md:shadow-sm",
          activeMobileTab === 'properties' ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <Tabs defaultValue="properties" className="flex-1 flex flex-col">
            <div className="px-2 pt-2 border-b">
              <TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-1">
                <TabsTrigger value="properties" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs">
                  <Settings2 className="h-3.5 w-3.5 mr-2" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="debug" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs relative">
                  <Terminal className="h-3.5 w-3.5 mr-2" />
                  Debug
                  {isExecuting && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="properties" className="flex-1 p-0 m-0 overflow-hidden">
              <PropertyEditor />
            </TabsContent>
            <TabsContent value="debug" className="flex-1 p-0 m-0 overflow-hidden flex flex-col bg-slate-950 text-slate-300">
              <div className="flex-1 p-4 font-mono text-[11px] overflow-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <Terminal className="h-8 w-8 mb-2" />
                    <p>No execution logs yet.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border-l-2 border-slate-800 pl-3 py-1 animate-in fade-in slide-in-from-left-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "uppercase text-[9px] font-bold px-1 rounded",
                          log.level === 'info' && "bg-blue-500/20 text-blue-400",
                          log.level === 'warn' && "bg-amber-500/20 text-amber-400",
                          log.level === 'error' && "bg-red-500/20 text-red-400"
                        )}>
                          {log.level}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{log.message}</p>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
              <div className="p-2 border-t border-slate-800 bg-slate-900 flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-[10px] uppercase tracking-widest h-7 text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={clearLogs}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear Logs
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden border-t h-14 grid grid-cols-3 bg-card z-40 shrink-0">
        <Button
          variant="ghost"
          onClick={() => setActiveMobileTab('palette')}
          className={cn("flex-col h-full rounded-none gap-1 py-1", activeMobileTab === 'palette' && "text-primary bg-primary/5")}
        >
          <Box className="h-4 w-4" />
          <span className="text-[10px]">Nodes</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveMobileTab('canvas')}
          className={cn("flex-col h-full rounded-none gap-1 py-1", activeMobileTab === 'canvas' && "text-primary bg-primary/5")}
        >
          <Layers className="h-4 w-4" />
          <span className="text-[10px]">Canvas</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveMobileTab('properties')}
          className={cn("flex-col h-full rounded-none gap-1 py-1", activeMobileTab === 'properties' && "text-primary bg-primary/5")}
        >
          <Settings2 className="h-4 w-4" />
          <span className="text-[10px]">Config</span>
        </Button>
      </div>
      <ExecutionModal 
        open={isExecutionModalOpen} 
        onOpenChange={setExecutionModalOpen} 
        flowId={flow.id} 
      />
    </div>
  );
}
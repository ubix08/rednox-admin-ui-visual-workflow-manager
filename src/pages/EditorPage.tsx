import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ChevronLeft, Save, Play, Settings2, Terminal, Box, Layers, Trash2, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEditorStore } from '@/store/useEditorStore';
import { WorkflowCanvas } from '@/components/editor/WorkflowCanvas';
import { NodePalette } from '@/components/editor/NodePalette';
import { PropertyEditor } from '@/components/editor/PropertyEditor';
import { ExecutionModal } from '@/components/editor/ExecutionModal';
import { workflowApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Flow } from '@/types/schema';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeMobileTab, setActiveMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas');
  const [isExecutionModalOpen, setExecutionModalOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  // Zustand Store Selectors (One per call)
  const initializeEditor = useEditorStore((s) => s.initialize);
  const editorNodes = useEditorStore((s) => s.nodes);
  const editorEdges = useEditorStore((s) => s.edges);
  const logs = useEditorStore((s) => s.logs);
  const clearLogs = useEditorStore((s) => s.clearLogs);
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const { data: flow, error, isError, isLoading } = useQuery({
    queryKey: ['flow', id],
    queryFn: async () => {
      const response = await workflowApi.get(id!);
      if (!response.success) throw new Error(response.error);
      const rawFlow = response.data as any;
      
      const getCategory = (type: string): string => {
        if (type.includes('http-in') || type.includes('http')) return 'input';
        if (type.includes('response') || type.includes('out')) return 'output';
        if (type.includes('kv') || type.includes('memory')) return 'storage';
        if (type.includes('gemini') || type.includes('javascript') || type.includes('condition') || type.includes('-model-')) return 'function';
        return 'utility';
      };
      
      const apiNodes = rawFlow.config?.nodes || rawFlow.nodes || [];
      const parsedNodes = apiNodes.map((n: any) => ({
        id: n.id,
        type: n.type || 'unknown',
        label: n.name || n.label || n.type || 'Node',
        category: n.category || getCategory(n.type),
        position: { x: Number(n.x ?? n.position?.x ?? 250), y: Number(n.y ?? n.position?.y ?? 100) },
        config: Object.fromEntries(Object.entries(n).filter(([k]) => !['id','type','name','label','category','x','y','position','wires','source','target','handle'].includes(k))),
      }));
      
      return {
        id: rawFlow.id,
        name: rawFlow.name || 'Untitled Flow',
        description: rawFlow.description || '',
        status: rawFlow.enabled === 1 ? 'active' : (rawFlow.status || 'draft'),
        createdAt: rawFlow.created_at || rawFlow.createdAt || new Date().toISOString(),
        updatedAt: rawFlow.updated_at || rawFlow.updatedAt || new Date().toISOString(),
        nodes: parsedNodes,
        edges: rawFlow.config?.edges || rawFlow.edges || []
      } as Flow;
    },
    enabled: !!id,
    retry: false
  });
  const saveMutation = useMutation({
    mutationFn: () => {
      if (editorNodes.length === 0) {
        throw new Error('Flow must have at least one node');
      }
      const currentFlow = queryClient.getQueryData(['flow', id]) as Flow | undefined;
      const nodesToSave = editorNodes.map(n => ({
        id: n.id,
        type: (n.data?.type as string) || 'unknown',
        category: (n.data?.category as any) || 'function',
        label: (n.data?.label as string) || 'Node',
        position: n.position,
        config: n.data?.config || {},
      }));
      return workflowApi.update(id!, {
        name: currentFlow?.name ?? 'Untitled Flow',
        nodes: nodesToSave as any,
        edges: editorEdges as any,
        status: currentFlow?.status ?? 'draft'
      });
    },
    onSuccess: (_, variables) => {
      toast.success('Workflow deployed');
      queryClient.invalidateQueries({ queryKey: ['flow', id] });
      queryClient.invalidateQueries({ queryKey: ['flows'] });
    },
    onError: (err: any) => toast.error(err.message || 'Save failed'),
  });

  const createNewMutation = useMutation({
    mutationFn: () => workflowApi.create({ name: `New Flow #${Date.now().toString().slice(-6)}`, description: '', status: 'draft' as const, nodes: [], edges: [] }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('New flow created');
      navigate(`/flow/${response.data.id}`);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create new flow')
  });
  const pollLogs = useCallback(async () => {
    if (!id || !isExecuting) return;
    const response = await workflowApi.getDebugLogs(id, 10);
    if (response.success && Array.isArray(response.data)) {
      // Snapshot current logs for stable deduplication during this poll cycle
      const currentLogs = useEditorStore.getState().logs;
      response.data.reverse().forEach(log => {
        // Deduplicate logs before adding to prevent duplicates from polling
        if (!currentLogs.find(l => l.id === log.id)) useEditorStore.getState().addLog(log);
      });
    }
  }, [id, isExecuting]);

  useEffect(() => {
    if (isError && error instanceof Error && error.message?.includes('not found')) {
      createNewMutation.mutate();
    } else if (isError && error instanceof Error && (error.message?.includes('Flow validation') || error.message?.includes('validation'))) {
      toast('Loaded as draft (API validation)');
      initializeEditor(id!, [], []);
    }
  }, [isError, error, createNewMutation, initializeEditor, id]);
  useEffect(() => {
    if (!flow?.id) return;
    const initialNodes = (flow.nodes ?? []).map((n: any) => ({
      id: n.id,
      type: 'flowNode',
      position: { x: (n.position?.x ?? 0) as number, y: (n.position?.y ?? 0) as number },
      data: {
        label: n.label || 'Node',
        type: n.type || 'unknown',
        category: n.category || 'function',
        config: n.config || {}
      },
    })) as any[];

    let initialEdges = flow.edges ?? [];

    // Generate demo flow if canvas is empty
    if (initialNodes.length === 0 && initialEdges.length === 0) {
      const httpInId = uuidv4();
      const functionId = uuidv4();
      const httpOutId = uuidv4();

      initialNodes.push(
        {
          id: httpInId,
          type: 'flowNode',
          position: { x: 200, y: 100 },
          data: {
            label: 'HTTP In',
            type: 'HTTP In',
            category: 'input',
            config: { method: 'POST', path: '/webhook' }
          }
        },
        {
          id: functionId,
          type: 'flowNode',
          position: { x: 450, y: 100 },
          data: {
            label: 'JavaScript',
            type: 'JavaScript',
            category: 'function',
            config: { code: '// Demo\nreturn { msg: "processed" };' }
          }
        },
        {
          id: httpOutId,
          type: 'flowNode',
          position: { x: 700, y: 100 },
          data: {
            label: 'HTTP Response',
            type: 'HTTP Response',
            category: 'output',
            config: {}
          }
        }
      );

      initialEdges.push(
        {
          id: uuidv4(),
          source: httpInId,
          target: functionId
        },
        {
          id: uuidv4(),
          source: functionId,
          target: httpOutId
        }
      );
    }

    initializeEditor(flow.id, initialNodes, initialEdges);
  }, [flow?.id, initializeEditor]);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isExecuting) {
      interval = setInterval(pollLogs, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExecuting, pollLogs]);
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (createNewMutation.isError) return <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background"><h2>Failed to create flow</h2><Link to="/dashboard"><Button>Back to Dashboard</Button></Link></div>;
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <AppNavbar />
      <div className="h-14 border-b px-4 flex items-center justify-between bg-card z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-accent h-8 w-8">
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-sm font-semibold leading-none">{flow?.name || 'Untitled Flow'}</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{flow?.status || 'draft'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setExecutionModalOpen(true)} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
            <span className="hidden sm:inline">Test Run</span>
          </Button>
          <Button variant="default" size="sm" className="gap-2 h-8 text-xs bg-primary hover:opacity-90" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            <span className="hidden sm:inline">Deploy</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <aside className={cn("absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-64 md:border-r md:shadow-sm", activeMobileTab === 'palette' ? "translate-x-0" : "-translate-x-full")}>
          <NodePalette />
        </aside>
        <main className="flex-1 relative overflow-hidden bg-muted/10">
          <WorkflowCanvas />
        </main>
        <aside className={cn("absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-80 md:border-l md:shadow-sm", activeMobileTab === 'properties' ? "translate-x-0" : "translate-x-full lg:translate-x-0")}>
          <Tabs defaultValue="properties" className="flex-1 flex flex-col h-full">
            <div className="px-2 pt-2 border-b">
              <TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-1">
                <TabsTrigger value="properties" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs">
                  <Settings2 className="h-3.5 w-3.5 mr-2" /> Properties
                </TabsTrigger>
                <TabsTrigger value="debug" className="data-[state=active]:bg-background data-[state=active]:border border-transparent px-3 py-1 text-xs relative">
                  <Terminal className="h-3.5 w-3.5 mr-2" /> Debug
                  {isExecuting && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="properties" className="flex-1 p-0 m-0 overflow-hidden">
              <PropertyEditor />
            </TabsContent>
            <TabsContent value="debug" className="flex-1 p-0 m-0 overflow-hidden flex flex-col bg-slate-950 text-slate-300">
              <div className="flex-1 p-4 font-mono text-[11px] overflow-auto space-y-2">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <Terminal className="h-8 w-8 mb-2" />
                    <p>No execution logs yet.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border-l-2 border-slate-800 pl-3 py-1">
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
                          <Clock className="h-3 w-3" /> {log.timestamp}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{log.message}</p>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
              <div className="p-2 border-t border-slate-800 bg-slate-900">
                <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase h-7 text-slate-400 hover:text-white" onClick={clearLogs}>
                  <Trash2 className="h-3 w-3 mr-2" /> Clear Logs
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <div className="md:hidden border-t h-14 grid grid-cols-3 bg-card z-40 shrink-0">
        <Button variant="ghost" onClick={() => setActiveMobileTab('palette')} className={cn("flex-col h-full gap-1 py-1", activeMobileTab === 'palette' && "text-primary bg-primary/5")}>
          <Box className="h-4 w-4" /><span className="text-[10px]">Nodes</span>
        </Button>
        <Button variant="ghost" onClick={() => setActiveMobileTab('canvas')} className={cn("flex-col h-full gap-1 py-1", activeMobileTab === 'canvas' && "text-primary bg-primary/5")}>
          <Layers className="h-4 w-4" /><span className="text-[10px]">Canvas</span>
        </Button>
        <Button variant="ghost" onClick={() => setActiveMobileTab('properties')} className={cn("flex-col h-full gap-1 py-1", activeMobileTab === 'properties' && "text-primary bg-primary/5")}>
          <Settings2 className="h-4 w-4" /><span className="text-[10px]">Config</span>
        </Button>
      </div>
      <ExecutionModal open={isExecutionModalOpen} onOpenChange={setExecutionModalOpen} flowId={flow?.id || ''} />
    </div>
  );
}
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { ChevronLeft, Save, Play, Settings2, Terminal, Box, Layers, Trash2, Loader2, Clock, CheckCircle2 } from 'lucide-react';
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
import { Flow } from '@/types/schema';
import { ReactFlowProvider, type Edge, type Node } from '@xyflow/react';
import type { NodeDefinition } from '@/types/schema';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeMobileTab, setActiveMobileTab] = useState<'palette' | 'canvas' | 'properties'>('canvas');
  const [isExecutionModalOpen, setExecutionModalOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  // Zustand Store Selectors
  const initializeEditor = useEditorStore((s) => s.initialize);
  const editorNodes = useEditorStore((s) => s.nodes);
  const editorEdges = useEditorStore((s) => s.edges);
  const logs = useEditorStore((s) => s.logs);
  const clearLogs = useEditorStore((s) => s.clearLogs);
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const setDirty = useEditorStore((s) => s.setDirty);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setNodeDefs = useEditorStore((s) => s.setNodeDefs);
  const { data: nodeDefinitions, isLoading: isLoadingNodes } = useQuery({
    queryKey: ['node-definitions'],
    queryFn: async () => {
      const resp = await workflowApi.listNodes();
      return resp.success ? (Array.isArray(resp.data) ? resp.data : []) : [];
    }
  });
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['node-categories'],
    queryFn: async () => {
      const resp = await workflowApi.listNodeCategories();
      return resp.success ? (Array.isArray(resp.data) ? resp.data : []) : [];
    }
  });
  const { data: flow, error, isError, isLoading: isLoadingFlow } = useQuery({
    queryKey: ['flow', id],
    queryFn: async () => {
      const response = await workflowApi.get(id!);
      if (!response.success) throw new Error(response.error);
      console.log(`[Flow Load] Received flow ${id}:`, response.data);
      const rawFlow = response.data as any;
      const apiNodes = rawFlow.config?.nodes || rawFlow.nodes || [];
      const parsedNodes = apiNodes.map((n: any) => ({
        id: n.id,
        type: 'flowNode',
        position: {
          x: Number(n.x ?? n.position?.x ?? 250),
          y: Number(n.y ?? n.position?.y ?? 100)
        },
        data: {
          id: n.id,
          label: n.label || n.name || n.type || 'Node',
          type: n.type,
          category: n.category || 'function',
          config: n.config || {},
        },
      }));

      // Parse Node-RED wires format into ReactFlow edges
      const nodeIdSet = new Set(parsedNodes.map((n: any) => n.id));
      
      // Collect raw connections first
      const rawConnections: Array<{srcId: string, tgtId: string, outPort: number}> = [];
      apiNodes.forEach((srcNode: any) => {
        const srcId = srcNode.id;
        const wires = srcNode.wires || [];
        wires.forEach((outPortWires: string[], outPort: number) => {
          outPortWires.forEach((tgtId: string) => {
            if (nodeIdSet.has(tgtId)) {
              rawConnections.push({ srcId, tgtId, outPort });
            }
          });
        });
      });

      // Build incoming connections map for stable inPort assignment
      const incomingMap: Record<string, Array<{srcId: string, outPort: number}>> = {};
      rawConnections.forEach(({srcId, tgtId, outPort}) => {
        if (!incomingMap[tgtId]) incomingMap[tgtId] = [];
        incomingMap[tgtId].push({srcId, outPort});
      });

      // Create parsed edges with stable sequential inPorts
      const parsedEdges: Edge[] = rawConnections.map(({srcId, tgtId, outPort}) => {
        const inConns = incomingMap[tgtId]!;
        inConns.sort((a, b) => a.srcId.localeCompare(b.srcId) || a.outPort - b.outPort);
        const inPort = inConns.findIndex(c => c.srcId === srcId && c.outPort === outPort);
        return {
          id: `edge-${srcId}-${tgtId}-${outPort}-${inPort}`,
          source: srcId,
          target: tgtId,
          sourceHandle: `${srcId}-o${outPort}`,
          targetHandle: `${tgtId}-i${inPort}`
        };
      });

      return {
        id: rawFlow.id,
        name: rawFlow.name || 'Untitled Flow',
        description: rawFlow.description || '',
        status: rawFlow.enabled === 1 ? 'active' : (rawFlow.status || 'draft'),
        createdAt: rawFlow.created_at || rawFlow.createdAt || new Date().toISOString(),
        updatedAt: rawFlow.updated_at || rawFlow.updatedAt || new Date().toISOString(),
        nodes: parsedNodes,
        edges: parsedEdges
      } as Flow;
    },
    enabled: !!id,
    retry: false
  });
  const saveMutation = useMutation({
    mutationFn: () => {
      const currentFlow = queryClient.getQueryData(['flow', id]) as Flow | undefined;
      const nodeDefs = queryClient.getQueryData(['node-definitions']) || [];
      const defsMap = new Map((nodeDefs as any[]).map(d => [d.type, d]));
      const currentNodes = useEditorStore.getState().nodes as Node[];
      const currentEdges = useEditorStore.getState().edges as Edge[];

      const noderedNodes = currentNodes.map((n) => {
        const def = defsMap.get(n.data.type as string) || { outputs: 1 };
        const wires: string[][] = Array.from({length: def.outputs || 1}, () => []);
        const outEdges = currentEdges.filter((e) => e.source === n.id);
        outEdges.forEach((e) => {
          const port = parseInt((e.sourceHandle || 'o0').match(/o(\d+)/)?.[1] || '0');
          if (port >= 0 && port < wires.length) {
            wires[port].push(e.target);
          }
        });
        return {
          id: n.id,
          type: (n.data as any)?.type || 'unknown',
          name: (n.data as any)?.label || n.id,
          x: Math.round(n.position.x),
          y: Math.round(n.position.y),
          z: 1,
          wires,
          ...((n.data as any)?.config || {})
        };
      });

      const payload = {
        name: currentFlow?.name ?? 'Untitled Flow',
        nodes: noderedNodes,
        status: currentFlow?.status ?? 'draft'
      };
      console.log(`[Flow Save] Sending update for ${id}:`, payload);
      return workflowApi.update(id!, payload as any);
    },
    onSuccess: (resp) => {
      if (resp.success) {
        const nodes = useEditorStore.getState().nodes;
        const edges = useEditorStore.getState().edges;
        toast.success('Workflow Deployed', {
          description: `Persisted ${nodes.length} nodes and ${edges.length} connections.`
        });
        setDirty(false);
        queryClient.invalidateQueries({ queryKey: ['flow', id] });
      } else {
        toast.error('Save failed', { description: resp.error });
      }
    },
    onError: (err: any) => toast.error('Persistence Error', { description: err.message }),
  });
  const pollLogs = useCallback(async () => {
    if (!id || !isExecuting) return;
    const response = await workflowApi.getDebugLogs(id, 10);
    if (response.success && Array.isArray(response.data)) {
      const currentLogs = useEditorStore.getState().logs;
      response.data.reverse().forEach(log => {
        if (!currentLogs.find(l => l.id === log.id)) useEditorStore.getState().addLog(log);
      });
    }
  }, [id, isExecuting]);
  useEffect(() => {
    if (isError && error instanceof Error && error.message?.includes('not found')) {
      navigate('/');
    }
  }, [isError, error, navigate]);
  useEffect(() => {
    if (!flow?.id) return;
    initializeEditor(flow.id, flow.nodes as any[], flow.edges as any[]);
    document.title = `${flow.name} | RedNox Editor`;
  }, [flow, initializeEditor]);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isExecuting) {
      interval = setInterval(pollLogs, 2500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isExecuting, pollLogs]);
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (nodeDefinitions && Array.isArray(nodeDefinitions)) setNodeDefs(nodeDefinitions);
  }, [nodeDefinitions, setNodeDefs]);
  if (isLoadingFlow) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <AppNavbar />
        <div className="h-14 border-b px-4 flex items-center justify-between bg-card z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-accent h-8 w-8">
              <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold leading-none">{flow?.name || 'Untitled Flow'}</h2>
                {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />}
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{flow?.status || 'draft'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setExecutionModalOpen(true)} disabled={isExecuting}>
              {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-current" />}
              <span className="hidden sm:inline">Test Run</span>
            </Button>
            <Button variant="default" size="sm" className={cn("gap-2 h-8 text-xs transition-all", isDirty ? "bg-primary shadow-glow" : "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30")} onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              <span className="hidden sm:inline">Deploy</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden relative">
          <aside className={cn("absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-64 md:border-r md:shadow-sm", activeMobileTab === 'palette' ? "translate-x-0" : "-translate-x-full")}>
            <NodePalette definitions={nodeDefinitions} categories={categories} isLoading={isLoadingNodes || isLoadingCategories} />
          </aside>
          <main className="flex-1 relative overflow-hidden bg-muted/10">
            <WorkflowCanvas />
          </main>
          <aside className={cn("absolute inset-0 z-30 bg-background transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-80 md:border-l md:shadow-sm", activeMobileTab === 'properties' ? "translate-x-0" : "translate-x-full lg:translate-x-0")}>
            <Tabs defaultValue="properties" className="flex-1 flex flex-col h-full">
              <div className="px-2 pt-2 border-b">
                <TabsList className="w-full justify-start h-9 bg-transparent p-0 gap-1">
                  <TabsTrigger value="properties" className="data-[state=active]:bg-background px-3 py-1 text-xs">
                    <Settings2 className="h-3.5 w-3.5 mr-2" /> Properties
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="data-[state=active]:bg-background px-3 py-1 text-xs relative">
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
    </ReactFlowProvider>
  );
}
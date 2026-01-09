import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Play, Database, Zap, Terminal, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditorStore } from '@/store/useEditorStore';
const categoryConfig: Record<string, { color: string, icon: React.ElementType }> = {
  input: { color: 'bg-emerald-500', icon: Play },
  output: { color: 'bg-red-500', icon: Zap },
  function: { color: 'bg-blue-500', icon: Terminal },
  storage: { color: 'bg-amber-500', icon: Database },
  utility: { color: 'bg-slate-500', icon: Box },
};
export const FlowNode = memo(({ id, data, selected }: NodeProps) => {
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const logs = useEditorStore((s) => s.logs);
  const category = (data.category as string) || 'function';
  const label = (data.label as string) || 'Node';
  const config = (data.config as any) || {};
  const theme = categoryConfig[category] || categoryConfig.function;
  const Icon = theme.icon;
  // Derive node status from logs
  const nodeLogs = logs.filter(l => l.nodeId === id);
  const hasError = nodeLogs.some(l => l.level === 'error');
  const isSuccess = nodeLogs.length > 0 && !hasError;
  const isLastExecuted = logs[0]?.nodeId === id;
  return (
    <div
      className={cn(
        "relative flex items-center min-w-[160px] max-w-[240px] bg-card border border-border rounded-md shadow-sm transition-all overflow-hidden group",
        selected && "ring-2 ring-primary ring-offset-2 shadow-md border-primary/50",
        isExecuting && isLastExecuted && "ring-2 ring-blue-400 ring-offset-2 scale-[1.02]",
        hasError && "border-red-500 shadow-red-500/20",
        isSuccess && "border-emerald-500/50"
      )}
    >
      {/* Left accent bar */}
      <div className={cn("w-2 h-full absolute left-0 top-0", theme.color)} />
      <div className="flex items-center gap-3 px-3 py-2.5 ml-2 w-full">
        <div className={cn("p-1.5 rounded-sm text-white shrink-0 shadow-sm transition-transform", isExecuting && isLastExecuted && "scale-110", theme.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-semibold text-foreground truncate">{label}</span>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground capitalize">{category}</span>
            {config.method && (
              <>
                <span className="text-[9px] text-muted-foreground/30">•</span>
                <span className="text-[9px] font-bold text-primary/80">{config.method}</span>
              </>
            )}
            {config.path && (
              <>
                <span className="text-[9px] text-muted-foreground/30">•</span>
                <span className="text-[9px] font-mono truncate max-w-[60px]">{config.path}</span>
              </>
            )}
          </div>
        </div>
        {/* Runtime Indicators */}
        <div className="flex items-center gap-1 absolute top-1 right-1">
          {isExecuting && isLastExecuted && (
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          )}
          {hasError && (
            <AlertCircle className="h-3 w-3 text-red-500" />
          )}
          {isSuccess && !isExecuting && (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -left-1.5 bg-background border-2 border-muted-foreground hover:scale-125 transition-transform"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -right-1.5 bg-background border-2 border-muted-foreground hover:scale-125 transition-transform"
      />
    </div>
  );
});
FlowNode.displayName = 'FlowNode';
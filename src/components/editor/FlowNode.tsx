import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Play, Database, Zap, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditorStore } from '@/store/useEditorStore';
const DEFAULT_ICONS: Record<string, React.ElementType> = {
  input: Play,
  output: Zap,
  function: Terminal,
  storage: Database,
  utility: Box,
};
export const FlowNode = memo(({ id, data, selected }: NodeProps) => {
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const logs = useEditorStore((s) => s.logs);
  const category = (data.category as string) || 'function';
  const label = (data.label as string) || 'Node';
  const icon = data.icon as string;
  const color = data.color as string;
  const config = (data.config as any) || {};
  const IconComponent = DEFAULT_ICONS[category] || DEFAULT_ICONS.function;
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
      {/* Dynamic Left accent bar */}
      <div className={cn("w-1.5 h-full absolute left-0 top-0", color || "bg-primary/20")} />
      <div className="flex items-center gap-3 px-3 py-2.5 ml-1 w-full">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded shrink-0 shadow-sm transition-transform text-lg",
          isExecuting && isLastExecuted && "scale-110",
          color || "bg-muted"
        )}>
          {icon && icon.length < 3 ? icon : <IconComponent className="h-4 w-4" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-semibold text-foreground truncate leading-tight">{label}</span>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground capitalize font-medium">{category}</span>
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
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
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
        className="w-2.5 h-2.5 -left-1.25 bg-background border-2 border-muted-foreground/50 hover:border-primary transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 -right-1.25 bg-background border-2 border-muted-foreground/50 hover:border-primary transition-colors"
      />
    </div>
  );
});
FlowNode.displayName = 'FlowNode';
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Play, Database, Zap, Terminal, AlertCircle, CheckCircle2, Globe, MessageSquare, ShieldCheck } from 'lucide-react';
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
  // Contextual data display
  const getContextInfo = () => {
    if (config.url) return config.url;
    if (config.topic) return config.topic;
    if (config.path) return config.path;
    if (config.method) return config.method;
    return null;
  };
  const contextInfo = getContextInfo();
  return (
    <div
      className={cn(
        "relative flex items-center min-w-[180px] max-w-[260px] bg-card border border-border rounded-md shadow-sm transition-all overflow-hidden group select-none",
        selected && "ring-2 ring-primary ring-offset-2 shadow-md border-primary/50",
        isExecuting && isLastExecuted && "ring-2 ring-blue-400 ring-offset-2 scale-[1.02]",
        hasError && "border-red-500 shadow-red-500/20 bg-red-50/5",
        isSuccess && !isExecuting && "border-emerald-500/50 bg-emerald-50/5"
      )}
    >
      {/* Dynamic Left accent bar */}
      <div className={cn("w-1.5 h-full absolute left-0 top-0", color || "bg-primary/20")} />
      <div className="flex items-center gap-3 px-3 py-3 ml-1 w-full">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded shrink-0 shadow-sm transition-transform text-lg",
          isExecuting && isLastExecuted && "scale-110",
          color || "bg-muted"
        )}>
          {icon && icon.length < 3 ? icon : <IconComponent className="h-5 w-5" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[11px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                  {label}
                </span>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] text-muted-foreground/80 capitalize font-semibold tracking-wide">
              {category}
            </span>
            {contextInfo && (
              <>
                <span className="text-[9px] text-muted-foreground/30">•</span>
                <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[100px]">
                  {contextInfo}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Runtime Indicators */}
        <div className="flex items-center gap-1 absolute top-1.5 right-1.5">
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
        className="w-3 h-3 -left-1.5 bg-background border-2 border-muted-foreground/50 hover:border-primary hover:scale-125 transition-all z-10"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -right-1.5 bg-background border-2 border-muted-foreground/50 hover:border-primary hover:scale-125 transition-all z-10"
      />
    </div>
  );
});
FlowNode.displayName = 'FlowNode';
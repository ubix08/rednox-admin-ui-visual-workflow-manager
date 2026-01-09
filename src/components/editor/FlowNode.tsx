import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Play, Database, Zap, Terminal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
const categoryConfig: Record<string, { color: string, icon: React.ElementType }> = {
  input: { color: 'bg-emerald-500', icon: Play },
  output: { color: 'bg-red-500', icon: Zap },
  function: { color: 'bg-blue-500', icon: Terminal },
  storage: { color: 'bg-amber-500', icon: Database },
  utility: { color: 'bg-slate-500', icon: Box },
};
export const FlowNode = memo(({ data, selected }: NodeProps) => {
  const category = (data.category as string) || 'function';
  const label = (data.label as string) || 'Node';
  const config = categoryConfig[category] || categoryConfig.function;
  const Icon = config.icon;
  return (
    <div 
      className={cn(
        "relative flex items-center min-w-[160px] max-w-[240px] bg-card border border-border rounded-md shadow-sm transition-all overflow-hidden",
        selected && "ring-2 ring-primary ring-offset-2 shadow-md border-primary/50"
      )}
      role="button"
      aria-label={`${category} node: ${label}`}
    >
      {/* Left accent bar */}
      <div className={cn("w-2 h-full absolute left-0 top-0", config.color)} />
      <div className="flex items-center gap-3 px-3 py-2.5 ml-2 w-full">
        <div className={cn("p-1.5 rounded-sm text-white", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground truncate">{label}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{category}</span>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-muted-foreground border-2 border-background"
      />
    </div>
  );
});
FlowNode.displayName = 'FlowNode';
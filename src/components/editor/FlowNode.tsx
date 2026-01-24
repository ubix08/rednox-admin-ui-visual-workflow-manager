import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeDefinition } from '@/types/schema';
import { Box, Play, Database, Zap, Terminal, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
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
  const nodeDefs = useEditorStore((s) => s.nodeDefs);
  
  const category = (data.category as string) || 'function';
  
  const def = React.useMemo(() => 
    nodeDefs.find((d: NodeDefinition) => d.type === data.type) || { inputs: 1, outputs: 1 },
    [nodeDefs, data.type]
  );
  
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
  const isNodeExecuting = isExecuting && isLastExecuted;
  
  // Contextual data display
  const getContextInfo = () => {
    if (config.url) return config.url;
    if (config.topic) return config.topic;
    if (config.path) return config.path;
    if (config.method) return config.method;
    return null;
  };
  
  const contextInfo = getContextInfo();
  
  // Determine if this is a trigger node (input category)
  const isTriggerNode = category === 'input';
  
  return (
    <div className="relative group">
      {/* Selection/Execution Glow Background */}
      {(selected || isNodeExecuting) && (
        <div 
          className={cn(
            "absolute inset-0 rounded-lg blur-xl transition-all duration-300 -z-10",
            isNodeExecuting && "animate-pulse",
            selected && !isNodeExecuting && "opacity-50",
            isNodeExecuting && "opacity-70"
          )}
          style={{
            background: isNodeExecuting 
              ? 'hsl(var(--state-executing))' 
              : 'hsl(var(--primary))',
            transform: 'scale(1.05)'
          }}
        />
      )}
      
      {/* Main Node Container */}
      <div
        className={cn(
          "relative flex items-center min-w-[200px] max-w-[280px] bg-card rounded-lg shadow-sm transition-all duration-200 overflow-hidden select-none",
          "border-2",
          // Border states
          !selected && !isNodeExecuting && !hasError && !isSuccess && "border-border",
          selected && !isNodeExecuting && "border-primary shadow-lg",
          isNodeExecuting && "border-blue-400 shadow-lg node-executing",
          hasError && "border-red-500 shadow-red-500/20 node-error",
          isSuccess && !isExecuting && "border-emerald-500/50 node-success",
          // Hover effect
          "hover:shadow-md hover:-translate-y-0.5",
          // Trigger node special shape
          isTriggerNode && "rounded-l-full"
        )}
      >
        {/* Left Accent Bar */}
        <div 
          className={cn(
            "w-1 h-full absolute left-0 top-0 transition-all",
            isTriggerNode && "w-2"
          )} 
          style={{ backgroundColor: color || 'hsl(var(--primary) / 0.3)' }}
        />
        
        {/* Node Content */}
        <div className="flex items-center gap-3 px-4 py-3 ml-1 w-full relative">
          {/* Node Icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg shrink-0 shadow-sm transition-all duration-200",
                    "text-lg font-semibold",
                    isNodeExecuting && "scale-110 shadow-md",
                    "group-hover:scale-105"
                  )}
                  style={{ backgroundColor: color || 'hsl(var(--muted))' }}
                >
                  {icon && icon.length < 3 ? (
                    <span className="text-xl">{icon}</span>
                  ) : (
                    <IconComponent className="h-5 w-5 text-white/90" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs font-medium">{data.type as string}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Node Text Content */}
          <div className="flex flex-col min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-xs font-bold text-foreground truncate leading-tight transition-colors",
                    "group-hover:text-primary"
                  )}>
                    {label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Category and Context Info */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] text-muted-foreground/80 capitalize font-semibold tracking-wide">
                {category}
              </span>
              {contextInfo && (
                <>
                  <span className="text-[9px] text-muted-foreground/30">•</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[100px]">
                          {contextInfo}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{contextInfo}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          
          {/* Status Indicators - Top Right */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {isNodeExecuting && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Executing...</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {hasError && !isNodeExecuting && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">Execution Error</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {isSuccess && !isExecuting && !hasError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">Executed Successfully</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {/* Input Handles */}
        {def.inputs > 0 && Array.from({ length: def.inputs }, (_, i) => {
          const handleId = `${id}-i${i}`;
          const topPosition = def.inputs === 1 
            ? 50 
            : 20 + (i * (60 / Math.max(1, def.inputs - 1)));
          
          return (
            <Handle
              key={handleId}
              type="target"
              position={Position.Left}
              id={handleId}
              style={{ 
                top: `${topPosition}%`,
                left: '-6px'
              }}
              className={cn(
                "w-3 h-3 bg-background border-2 border-muted-foreground/50",
                "hover:border-primary hover:scale-125 transition-all z-10 rounded-full",
                "hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
              )}
            />
          );
        })}
        
        {/* Output Handles */}
        {def.outputs > 0 && Array.from({ length: def.outputs }, (_, i) => {
          const handleId = `${id}-o${i}`;
          const topPosition = def.outputs === 1 
            ? 50 
            : 20 + (i * (60 / Math.max(1, def.outputs - 1)));
          
          return (
            <Handle
              key={handleId}
              type="source"
              position={Position.Right}
              id={handleId}
              style={{ 
                top: `${topPosition}%`,
                right: '-6px'
              }}
              className={cn(
                "w-3 h-3 bg-background border-2 border-muted-foreground/50",
                "hover:border-primary hover:scale-125 transition-all z-10 rounded-full",
                "hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
              )}
            />
          );
        })}
      </div>
    </div>
  );
});

FlowNode.displayName = 'FlowNode';

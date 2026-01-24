import React, { useState, useMemo } from 'react';
import { Search, Box, Loader2, Info, X, Plus, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NodeDefinition, NodeCategory } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NodePaletteProps {
  definitions?: NodeDefinition[];
  categories?: NodeCategory[];
  isLoading?: boolean;
}

export function NodePalette({ definitions = [], categories = [], isLoading }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const [recentlyUsed] = useState<string[]>([]);
  
  const onDragStart = (event: React.DragEvent, definition: NodeDefinition) => {
    event.dataTransfer.setData('application/reactflow-def', JSON.stringify(definition));
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const groupedNodes = useMemo(() => {
    const query = search.toLowerCase();
    const result: Record<string, NodeDefinition[]> = {};
    
    (definitions ?? []).forEach(def => {
      if (!def.label.toLowerCase().includes(query) &&
          !def.type.toLowerCase().includes(query) &&
          !def.description?.toLowerCase().includes(query)) return;
      
      if (!result[def.category]) result[def.category] = [];
      result[def.category].push(def);
    });
    
    return result;
  }, [definitions, search]);
  
  const activeCategories = (categories ?? []).filter(cat => groupedNodes[cat]);
  
  // Get recently used nodes
  const recentNodes = useMemo(() => {
    return definitions.filter(def => recentlyUsed.includes(def.type)).slice(0, 5);
  }, [definitions, recentlyUsed]);
  
  return (
    <div className="flex flex-col h-full bg-card/50">
      {/* Header */}
      <div className="p-4 border-b space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Node Library</h3>
          <Badge variant="outline" className="text-[10px] font-mono">
            {definitions.length}
          </Badge>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-9 pl-9 pr-9 text-xs bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-accent"
              onClick={() => setSearch('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-xs">Loading Nodes...</span>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Recently Used Section */}
            {recentNodes.length > 0 && !search && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                    Recently Used
                  </h4>
                </div>
                <div className="space-y-1">
                  {recentNodes.map((node) => (
                    <NodeItem key={`recent-${node.type}`} node={node} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Categories Accordion */}
            {activeCategories.length > 0 ? (
              <Accordion 
                type="multiple" 
                defaultValue={activeCategories.slice(0, 2)} 
                className="space-y-2"
              >
                {activeCategories.map((cat) => (
                  <AccordionItem key={cat} value={cat} className="border-none">
                    <AccordionTrigger className={cn(
                      "flex gap-2 py-2 px-2 hover:bg-accent/50 rounded-md transition-all",
                      "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
                      "hover:no-underline hover:text-foreground"
                    )}>
                      <div className="flex items-center gap-2 flex-1">
                        <span>{cat}</span>
                        <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5">
                          {groupedNodes[cat]?.length || 0}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-1 space-y-1">
                      {(groupedNodes[cat] ?? []).map((node) => (
                        <NodeItem key={node.type} node={node} onDragStart={onDragStart} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">No nodes found</p>
                <p className="text-[10px] mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t bg-muted/20 shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Box className="h-3 w-3" />
          <span>Drag to canvas to add</span>
        </div>
      </div>
    </div>
  );
}

// Node Item Component
interface NodeItemProps {
  node: NodeDefinition;
  onDragStart: (event: React.DragEvent, definition: NodeDefinition) => void;
}

function NodeItem({ node, onDragStart }: NodeItemProps) {
  const IconComponent = node.icon && node.icon.length < 3 ? null : Box;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, node)}
      className={cn(
        "group flex items-center gap-3 p-2.5 rounded-lg transition-all duration-150",
        "border border-border bg-background hover:border-primary/50 hover:bg-primary/5",
        "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md",
        "hover:-translate-y-0.5"
      )}
    >
      {/* Color Accent */}
      <div 
        className="w-1 h-8 rounded-full shrink-0"
        style={{ backgroundColor: node.color || 'hsl(var(--primary) / 0.3)' }}
      />
      
      {/* Node Icon */}
      <div 
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-md shrink-0 transition-all",
          "group-hover:scale-110"
        )}
        style={{ backgroundColor: node.color || 'hsl(var(--muted))' }}
      >
        {node.icon && node.icon.length < 3 ? (
          <span className="text-base">{node.icon}</span>
        ) : IconComponent ? (
          <IconComponent className="h-4 w-4 text-white/90" />
        ) : null}
      </div>
      
      {/* Node Info */}
      <div className="flex-1 min-w-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                {node.label}
              </p>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="space-y-1">
                <p className="text-xs font-medium">{node.label}</p>
                {node.description && (
                  <p className="text-[10px] text-muted-foreground max-w-[200px]">
                    {node.description}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] text-muted-foreground font-medium">
            {node.inputs || 0} in
          </span>
          <span className="text-[9px] text-muted-foreground/50">•</span>
          <span className="text-[9px] text-muted-foreground font-medium">
            {node.outputs || 0} out
          </span>
        </div>
      </div>
      
      {/* Quick Add Button - Hidden by default, shown on hover */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                // Add node to center of canvas
                console.log('Quick add:', node.type);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">Add to center</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

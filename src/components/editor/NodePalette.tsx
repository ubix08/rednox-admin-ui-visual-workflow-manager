import React, { useState, useMemo } from 'react';
import { Search, Box, Loader2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NodeDefinition, NodeCategory } from '@/types/schema';
import { cn } from '@/lib/utils';
interface NodePaletteProps {
  definitions?: NodeDefinition[];
  categories?: NodeCategory[];
  isLoading?: boolean;
}
export function NodePalette({ definitions = [], categories = [], isLoading }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const onDragStart = (event: React.DragEvent, definition: NodeDefinition) => {
    event.dataTransfer.setData('application/reactflow-def', JSON.stringify(definition));
    event.dataTransfer.effectAllowed = 'move';
  };
  const groupedNodes = useMemo(() => {
    const query = search.toLowerCase();
    const result: Record<string, NodeDefinition[]> = {};
    definitions.forEach(def => {
      if (!def.label.toLowerCase().includes(query) && 
          !def.type.toLowerCase().includes(query) && 
          !def.description?.toLowerCase().includes(query)) return;
      if (!result[def.category]) result[def.category] = [];
      result[def.category].push(def);
    });
    return result;
  }, [definitions, search]);
  const activeCategories = categories.filter(cat => groupedNodes[cat]);
  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-8 pl-8 text-xs bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-xs">Loading Nodes...</span>
          </div>
        ) : activeCategories.length > 0 ? (
          <Accordion type="multiple" defaultValue={activeCategories} className="p-2 space-y-1">
            {activeCategories.map((cat) => (
              <AccordionItem key={cat} value={cat} className="border-none">
                <AccordionTrigger className="flex gap-2 py-2 px-2 hover:bg-accent/50 rounded-md transition-all text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:no-underline">
                  {cat}
                </AccordionTrigger>
                <AccordionContent className="pt-1 space-y-1">
                  {groupedNodes[cat].map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, node)}
                      className="flex items-center gap-3 p-2.5 rounded-md border bg-background hover:border-primary/50 hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-colors shadow-sm group"
                    >
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded text-lg", node.color || "bg-muted")}>
                        {node.icon && node.icon.length < 3 ? node.icon : <Box className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium truncate">{node.label}</span>
                        <span className="text-[9px] text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {node.outputs} out • {node.inputs} in
                        </span>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Info className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs font-medium">No nodes found</p>
            <p className="text-[10px] mt-1">Try a different search term or check connectivity.</p>
          </div>
        )}
      </ScrollArea>
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Box className="h-3 w-3" />
          <span>Server-driven node library</span>
        </div>
      </div>
    </div>
  );
}
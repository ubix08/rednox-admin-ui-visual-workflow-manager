import React, { useState } from 'react';
import { Search, Box, Play, Terminal, Database, Send, Settings, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
const NODE_TEMPLATES = [
  { category: 'Triggers', icon: Play, color: 'text-emerald-500', nodes: ['HTTP In', 'Cron Timer', 'Webhook'] },
  { category: 'Functions', icon: Terminal, color: 'text-blue-500', nodes: ['JavaScript', 'Condition', 'JSON Parser', 'Switch'] },
  { category: 'Storage', icon: Database, color: 'text-amber-500', nodes: ['KV Put', 'KV Get', 'D1 Query'] },
  { category: 'Output', icon: Send, color: 'text-red-500', nodes: ['HTTP Response', 'Slack Post', 'Email'] },
];
export function NodePalette() {
  const [search, setSearch] = useState('');
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  const filteredTemplates = NODE_TEMPLATES.map(group => ({
    ...group,
    nodes: group.nodes.filter(node => node.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.nodes.length > 0);
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
        <Accordion type="multiple" defaultValue={['Triggers', 'Functions']} className="p-2 space-y-1">
          {filteredTemplates.map((group) => (
            <AccordionItem key={group.category} value={group.category} className="border-none">
              <AccordionTrigger className="flex gap-2 py-2 px-2 hover:bg-accent/50 rounded-md transition-all text-xs font-bold uppercase tracking-wider text-muted-foreground hover:no-underline">
                <group.icon className={cn("h-3.5 w-3.5", group.color)} />
                {group.category}
              </AccordionTrigger>
              <AccordionContent className="pt-1 space-y-1">
                {group.nodes.map((node) => (
                  <div
                    key={node}
                    draggable
                    onDragStart={(e) => onDragStart(e, node)}
                    className="flex items-center gap-3 p-2.5 rounded-md border bg-background hover:border-primary/50 hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-colors shadow-sm"
                  >
                    <Box className={cn("h-4 w-4", group.color)} />
                    <span className="text-xs font-medium">{node}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          <span>All nodes run in isolation</span>
        </div>
      </div>
    </div>
  );
}
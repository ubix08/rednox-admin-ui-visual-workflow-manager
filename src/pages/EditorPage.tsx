import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { 
  ChevronLeft, 
  Save, 
  Play, 
  Layers, 
  Settings2, 
  Terminal, 
  Search,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const flows = useAppStore((s) => s.flows);
  const flow = flows.find(f => f.id === id);
  if (!flow) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-xl font-bold">Flow not found</h2>
        <Button asChild><Link to="/">Return to Dashboard</Link></Button>
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <AppNavbar />
      {/* Editor Header */}
      <div className="h-14 border-b px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ChevronLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-sm font-semibold leading-none">{flow.name}</h2>
            <span className="text-xs text-muted-foreground">Edited 2m ago</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="h-3.5 w-3.5 fill-current" />
            Test Run
          </Button>
          <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="h-3.5 w-3.5" />
            Deploy
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Palette */}
        <aside className="hidden md:flex w-64 border-r flex-col bg-card/50">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                className="w-full bg-muted border-none rounded-md py-1 pl-8 text-xs focus:ring-1 focus:ring-primary" 
                placeholder="Search nodes..."
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <Accordion type="multiple" defaultValue={['common']} className="p-2">
              <AccordionItem value="common" className="border-none">
                <AccordionTrigger className="text-xs font-bold py-2 hover:no-underline uppercase tracking-wider text-muted-foreground">
                  Triggers
                </AccordionTrigger>
                <AccordionContent className="pt-1 space-y-1">
                  {['HTTP In', 'Cron Timer', 'Webhook'].map((item) => (
                    <div key={item} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-grab active:cursor-grabbing border bg-background text-sm">
                      <Box className="h-4 w-4 text-primary" />
                      {item}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="logic" className="border-none">
                <AccordionTrigger className="text-xs font-bold py-2 hover:no-underline uppercase tracking-wider text-muted-foreground">
                  Functions
                </AccordionTrigger>
                <AccordionContent className="pt-1 space-y-1">
                  {['JavaScript', 'Condition', 'JSON Parser'].map((item) => (
                    <div key={item} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-grab border bg-background text-sm">
                      <Box className="h-4 w-4 text-orange-500" />
                      {item}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </aside>
        {/* Center: Canvas Area */}
        <main className="flex-1 relative bg-muted/30 overflow-hidden">
          {/* Visual Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ 
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2 opacity-40">
              <Layers className="h-12 w-12 mx-auto mb-4" />
              <p className="text-sm font-medium">Visual Flow Canvas</p>
              <p className="text-xs">Drag nodes here to start building</p>
            </div>
          </div>
        </main>
        {/* Right: Properties / Debug */}
        <aside className="hidden lg:flex w-80 border-l flex-col bg-card/50">
          <Tabs defaultValue="properties" className="flex-1 flex flex-col">
            <div className="px-2 pt-2 border-b">
              <TabsList className="w-full justify-start h-9 bg-transparent">
                <TabsTrigger value="properties" className="data-[state=active]:bg-background gap-2 text-xs">
                  <Settings2 className="h-3.5 w-3.5" />
                  Properties
                </TabsTrigger>
                <TabsTrigger value="debug" className="data-[state=active]:bg-background gap-2 text-xs">
                  <Terminal className="h-3.5 w-3.5" />
                  Debug
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="properties" className="flex-1 p-4 m-0">
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                <Settings2 className="h-8 w-8 opacity-20" />
                <p className="text-xs">Select a node to edit its properties</p>
              </div>
            </TabsContent>
            <TabsContent value="debug" className="flex-1 p-0 m-0">
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 font-mono text-xs text-muted-foreground">
                  <div className="mb-2 text-blue-500">[System] Editor ready.</div>
                  <div className="mb-2">[Flow] Listening for events...</div>
                </div>
                <div className="p-2 border-t bg-muted/20">
                  <Button variant="ghost" size="sm" className="w-full text-2xs uppercase tracking-widest h-7">Clear Logs</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden border-t h-14 grid grid-cols-3 bg-card">
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1">
          <Box className="h-4 w-4" />
          <span className="text-[10px]">Nodes</span>
        </Button>
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1 text-primary bg-primary/5">
          <Layers className="h-4 w-4" />
          <span className="text-[10px]">Canvas</span>
        </Button>
        <Button variant="ghost" className="flex-col h-full rounded-none gap-1 py-1">
          <Settings2 className="h-4 w-4" />
          <span className="text-[10px]">Setup</span>
        </Button>
      </div>
    </div>
  );
}
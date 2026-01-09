import React, { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Settings2, Trash2, Info, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function PropertyEditor() {
  const selectedId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const node = nodes.find((n) => n.id === selectedId);
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Settings2 className="h-6 w-6 opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No node selected</p>
          <p className="text-xs">Select a node on the canvas to configure its logic and settings.</p>
        </div>
      </div>
    );
  }
  const { label, category, type, config = {} } = node.data;
  const handleUpdate = (updates: any) => {
    updateNodeData(node.id, {
      config: { ...config, ...updates }
    });
  };
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Settings2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold">Properties</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive hover:bg-destructive/10" 
          onClick={() => deleteNode(node.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Metadata Section */}
          <section className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="node-label">Display Name</Label>
              <Input 
                id="node-label" 
                value={label} 
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block">Type</span>
                <span className="font-mono font-medium">{type}</span>
              </div>
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block">Category</span>
                <span className="font-mono font-medium capitalize">{category}</span>
              </div>
            </div>
          </section>
          <Separator />
          {/* Configuration Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Node Configuration
            </div>
            {/* HTTP Triggers */}
            {category === 'input' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Method</Label>
                  <Select 
                    value={config.method || 'GET'} 
                    onValueChange={(val) => handleUpdate({ method: val })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Path</Label>
                  <Input 
                    placeholder="/api/v1/trigger" 
                    value={config.path || ''} 
                    onChange={(e) => handleUpdate({ path: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}
            {/* JavaScript/Function nodes */}
            {category === 'function' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Script Code</Label>
                    <Code className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <Textarea 
                    placeholder="return msg;" 
                    className="min-h-[120px] font-mono text-xs bg-muted/50 resize-y"
                    value={config.code || ''} 
                    onChange={(e) => handleUpdate({ code: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Available: <code>msg</code>, <code>env</code>, <code>context</code>
                  </p>
                </div>
              </div>
            )}
            {/* Storage Nodes */}
            {category === 'storage' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>KV Namespace Key</Label>
                  <Input 
                    placeholder="user_profile_123" 
                    value={config.key || ''} 
                    onChange={(e) => handleUpdate({ key: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                {type === 'KV Put' && (
                  <div className="space-y-1.5">
                    <Label>Value (JSON supported)</Label>
                    <Textarea 
                      placeholder='{"active": true}'
                      value={config.value || ''} 
                      onChange={(e) => handleUpdate({ value: e.target.value })}
                      className="h-20 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            )}
            {/* General Utilities */}
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-1.5">
                <Label>Execution Timeout (ms)</Label>
                <Input 
                  type="number"
                  value={config.timeout || 5000} 
                  onChange={(e) => handleUpdate({ timeout: parseInt(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>Changes are auto-saved to current draft.</span>
        </div>
      </div>
    </div>
  );
}
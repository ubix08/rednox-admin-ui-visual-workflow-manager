import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEditorStore } from '@/store/useEditorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Settings2, Trash2, Info, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { workflowApi } from '@/lib/api';
import { NodeField } from '@/types/schema';
import { cn } from '@/lib/utils';
export function PropertyEditor() {
  const selectedId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const node = nodes.find((n) => n.id === selectedId);
  const nodeType = node?.data?.type as string;
  const { data: definition, isLoading, isError } = useQuery({
    queryKey: ['node-definition', nodeType],
    queryFn: async () => {
      if (!nodeType) return null;
      const resp = await workflowApi.getNodeDefinition(nodeType);
      return resp.success ? resp.data : null;
    },
    enabled: !!nodeType,
  });
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Settings2 className="h-6 w-6 opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No node selected</p>
          <p className="text-xs">Select a node on the canvas to configure its properties.</p>
        </div>
      </div>
    );
  }
  const nodeData = (node.data || {}) as Record<string, any>;
  const config = (nodeData.config || {}) as Record<string, any>;
  const handleFieldChange = (name: string, value: any) => {
    updateNodeData(node.id, {
      config: { ...config, [name]: value }
    });
  };
  const renderField = (field: NodeField) => {
    const value = config[field.name] ?? field.default ?? '';
    switch (field.type) {
      case 'text':
      case 'number':
      case 'password':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
            className="h-8 text-xs"
          />
        );
      case 'select':
        return (
          <Select value={String(value)} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={field.placeholder || 'Select option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
            <span className="text-xs text-muted-foreground">Enabled</span>
            <Switch checked={!!value} onCheckedChange={(checked) => handleFieldChange(field.name, checked)} />
          </div>
        );
      case 'json':
      case 'code':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              let val = e.target.value;
              if (field.type === 'json') {
                try { 
                  val = JSON.parse(e.target.value); 
                } catch (err) {
                  // Fallback to raw string if JSON parsing fails during editing
                  val = e.target.value;
                }
              }
              handleFieldChange(field.name, val);
            }}
            className="min-h-[120px] font-mono text-xs bg-muted/30 resize-y p-3"
            rows={field.rows || 5}
          />
        );
      default:
        return <Input disabled placeholder="Unsupported field type" className="h-8 text-xs italic" />;
    }
  };
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={cn("p-1.5 rounded-md shrink-0", nodeData.color || "bg-primary/10 text-primary")}>
            <Settings2 className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold truncate">{nodeData.label}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
          onClick={() => deleteNode(node.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <section className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold">Node Label</Label>
              <Input
                value={nodeData.label as string}
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="h-8 text-xs font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block">Type</span>
                <span className="font-mono font-medium truncate block">{nodeType}</span>
              </div>
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block">Category</span>
                <span className="font-mono font-medium capitalize block">{nodeData.category as string}</span>
              </div>
            </div>
          </section>
          <Separator />
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Configuration
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <span className="text-[10px]">Fetching field definitions...</span>
              </div>
            ) : isError || !definition ? (
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-center">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                <p className="text-[10px] font-medium">Failed to load definitions</p>
                <p className="text-[9px] opacity-80">Manual config required</p>
              </div>
            ) : definition.fields?.length > 0 ? (
              definition.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{field.label}{field.required && '*'}</Label>
                    {field.description && (
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    )}
                  </div>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-[10px] text-muted-foreground leading-tight">{field.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-md border border-dashed text-center">
                <p className="text-[10px] text-muted-foreground italic">No specific configuration available for this node.</p>
              </div>
            )}
          </section>
          <Separator />
          <section className="space-y-4 pb-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Lifecycle
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px]">Retries</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={Number(config.retries ?? 0)}
                  onChange={(e) => handleFieldChange('retries', parseInt(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px]">Timeout (ms)</Label>
                <Input
                  type="number"
                  min={100}
                  max={30000}
                  value={Number(config.timeout ?? 5000)}
                  onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      <div className="p-3 border-t bg-muted/20 shrink-0">
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Node schema v2.0 �� Real-time synchronization
        </p>
      </div>
    </div>
  );
}
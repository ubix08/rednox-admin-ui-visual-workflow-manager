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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings2, Trash2, Info, Loader2, AlertCircle, ArrowDownToLine, ArrowUpFromLine, Cog, ChevronDown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { workflowApi } from '@/lib/api';
import { NodeField } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Settings2 className="h-8 w-8 opacity-20" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">No node selected</p>
          <p className="text-xs leading-relaxed max-w-[240px]">
            Select a node on the canvas to view and configure its properties.
          </p>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select value={String(value)} onValueChange={(val) => handleFieldChange(field.name, val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={field.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium cursor-pointer">
                {field.label}
              </Label>
              {field.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Switch 
              checked={!!value} 
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
          </div>
        );
        
      case 'json':
      case 'code':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
                <Badge variant="outline" className="text-[9px] font-mono h-4 px-1">
                  {field.type.toUpperCase()}
                </Badge>
              </Label>
              {field.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">{field.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
          </div>
        );
        
      default:
        return (
          <Input 
            disabled 
            placeholder="Unsupported field type" 
            className="h-9 text-xs italic opacity-50" 
          />
        );
    }
  };
  
  return (
    <Tabs defaultValue="config" className="flex flex-col h-full">
      {/* Header with Node Info */}
      <div className="p-4 border-b bg-muted/20 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <div 
              className="p-2 rounded-lg shrink-0 shadow-sm" 
              style={{ backgroundColor: nodeData.color || 'hsl(var(--primary) / 0.15)' }}
            >
              <Settings2 className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate">{nodeData.label}</h3>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                {nodeType}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => deleteNode(node.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Delete Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Tabs Navigation */}
        <TabsList className="w-full h-8 bg-transparent p-0 gap-1">
          <TabsTrigger 
            value="config" 
            className="flex-1 h-7 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings2 className="h-3 w-3 mr-1.5" />
            Config
          </TabsTrigger>
          <TabsTrigger 
            value="io" 
            className="flex-1 h-7 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ArrowDownToLine className="h-3 w-3 mr-1.5" />
            I/O
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex-1 h-7 text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Cog className="h-3 w-3 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>
      
      {/* Tab Contents */}
      <ScrollArea className="flex-1">
        {/* Configuration Tab */}
        <TabsContent value="config" className="p-4 m-0 space-y-6">
          {/* Basic Info Section */}
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Basic Information
            </h4>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Node Label</Label>
              <Input
                value={nodeData.label as string}
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="h-9 text-xs font-medium"
                placeholder="Enter node label..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/50 border">
                <span className="text-[9px] text-muted-foreground block mb-1">Type</span>
                <span className="text-[10px] font-mono font-medium truncate block">
                  {nodeType}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50 border">
                <span className="text-[9px] text-muted-foreground block mb-1">Category</span>
                <span className="text-[10px] font-mono font-medium capitalize block">
                  {nodeData.category as string}
                </span>
              </div>
            </div>
          </section>
          
          <Separator />
          
          {/* Dynamic Fields Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Configuration
            </h4>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-3" />
                <span className="text-xs">Loading configuration...</span>
              </div>
            ) : isError || !definition ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-2">
                <AlertCircle className="h-6 w-6 mx-auto text-destructive" />
                <div>
                  <p className="text-xs font-medium text-destructive">Failed to load configuration</p>
                  <p className="text-[10px] text-destructive/80 mt-1">
                    Manual configuration required
                  </p>
                </div>
              </div>
            ) : definition.fields?.length > 0 ? (
              <div className="space-y-4">
                {definition.fields.map((field) => (
                  <div key={field.name}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-dashed text-center">
                <Info className="h-6 w-6 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">
                  No specific configuration available for this node type.
                </p>
              </div>
            )}
          </section>
        </TabsContent>
        
        {/* I/O Tab */}
        <TabsContent value="io" className="p-4 m-0 space-y-4">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold">Input Ports</span>
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {definition?.inputs || 0}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2">
              <p className="text-xs text-muted-foreground px-3">
                This node accepts {definition?.inputs || 0} input connection{(definition?.inputs || 0) !== 1 ? 's' : ''}.
              </p>
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-accent transition-colors">
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold">Output Ports</span>
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {definition?.outputs || 0}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2">
              <p className="text-xs text-muted-foreground px-3">
                This node provides {definition?.outputs || 0} output connection{(definition?.outputs || 0) !== 1 ? 's' : ''}.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="p-4 m-0 space-y-6">
          <section className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Execution Settings
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  Retries
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Number of retry attempts on failure</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={Number(config.retries ?? 0)}
                  onChange={(e) => handleFieldChange('retries', parseInt(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  Timeout (ms)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Maximum execution time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  type="number"
                  min={100}
                  max={30000}
                  value={Number(config.timeout ?? 5000)}
                  onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </section>
        </TabsContent>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t bg-muted/20 shrink-0">
        <p className="text-[9px] text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3 w-3" />
          Real-time synchronization enabled
        </p>
      </div>
    </Tabs>
  );
}

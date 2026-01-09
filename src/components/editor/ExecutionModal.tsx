import React, { useState } from 'react';
import { Play, Code, Send, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/useEditorStore';
import { workflowApi } from '@/lib/api';
interface ExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
}
const SAMPLES = {
  webhook: { event: "order_created", data: { id: "123", amount: 49.99 } },
  http: { method: "POST", headers: { "content-type": "application/json" }, body: { user: "demo" } },
};
export function ExecutionModal({ open, onOpenChange, flowId }: ExecutionModalProps) {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLES.webhook, null, 2));
  const setExecuting = useEditorStore((s) => s.setExecuting);
  const addLog = useEditorStore((s) => s.addLog);
  const clearLogs = useEditorStore((s) => s.clearLogs);
  const isExecuting = useEditorStore((s) => s.isExecuting);
  const handleRun = async () => {
    try {
      const parsed = JSON.parse(payload);
      setExecuting(true);
      clearLogs();
      onOpenChange(false);
      toast.info("Triggering workflow...");
      const result = await workflowApi.execute(flowId, parsed);
      if (result.success && result.data) {
        result.data.logs.forEach((l: any) => addLog(l));
        if (result.data.success) {
          toast.success("Workflow finished successfully");
        } else {
          toast.error("Workflow failed during execution");
        }
      } else {
        toast.error(result.error || "Execution failed");
      }
    } catch (e) {
      toast.error("Invalid JSON payload");
    } finally {
      setExecuting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Manual Execution
          </DialogTitle>
          <DialogDescription>
            Trigger this workflow manually with a custom JSON payload.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="payload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payload">JSON Payload</TabsTrigger>
            <TabsTrigger value="samples">Quick Samples</TabsTrigger>
          </TabsList>
          <TabsContent value="payload" className="py-4">
            <div className="relative group">
              <div className="absolute right-3 top-3 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                <Code className="h-4 w-4" />
              </div>
              <Textarea
                className="font-mono text-xs min-h-[250px] bg-muted/50 p-4 leading-relaxed"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{ "key": "value" }'
              />
            </div>
          </TabsContent>
          <TabsContent value="samples" className="py-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-12"
              onClick={() => {
                setPayload(JSON.stringify(SAMPLES.webhook, null, 2));
                toast.success("Loaded Webhook sample");
              }}
            >
              <Send className="h-4 w-4" />
              Webhook Event Sample
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 h-12"
              onClick={() => {
                setPayload(JSON.stringify(SAMPLES.http, null, 2));
                toast.success("Loaded HTTP sample");
              }}
            >
              <Play className="h-4 w-4" />
              HTTP Request Sample
            </Button>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleRun} disabled={isExecuting} className="gap-2">
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Trigger Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
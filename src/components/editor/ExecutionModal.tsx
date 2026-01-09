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
  const nodes = useEditorStore((s) => s.nodes);
  const handleRun = async () => {
    try {
      const parsed = JSON.parse(payload);
      setExecuting(true);
      clearLogs();
      onOpenChange(false);
      toast.info("Triggering workflow execution...");
      // Try to find a trigger node or just pass null
      const triggerNode = nodes.find(n => n.data?.category === 'input');
      const response = await workflowApi.execute(flowId, {
        nodeId: triggerNode?.id || null,
        payload: parsed
      });
      if (response.success && response.data) {
        response.data.logs.forEach(log => addLog(log));
        if (response.data.success) {
          toast.success("Workflow execution finished");
        } else {
          toast.error("Execution encountered errors (Check Debug)");
        }
      } else {
        toast.error(response.error || "Execution failed");
      }
    } catch (e) {
      toast.error("Invalid JSON payload");
    } finally {
      // Keep executing status for polling a bit longer if needed, 
      // but here we toggle based on immediate response
      setTimeout(() => setExecuting(false), 3000);
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
            Trigger this workflow on the serverless edge with a custom payload.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="payload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payload">JSON Payload</TabsTrigger>
            <TabsTrigger value="samples">Quick Samples</TabsTrigger>
          </TabsList>
          <TabsContent value="payload" className="py-4">
            <Textarea
              className="font-mono text-xs min-h-[250px] bg-muted/50 p-4 leading-relaxed"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='{ "key": "value" }'
            />
          </TabsContent>
          <TabsContent value="samples" className="py-4 space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={() => setPayload(JSON.stringify(SAMPLES.webhook, null, 2))}>
              <Send className="h-4 w-4" /> Webhook Event Sample
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-12" onClick={() => setPayload(JSON.stringify(SAMPLES.http, null, 2))}>
              <Play className="h-4 w-4" /> HTTP Request Sample
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
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Edit3, Trash2, Clock, Activity, AlertCircle, PauseCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flow, FlowStatus } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { toast } from 'sonner';
interface FlowCardProps {
  flow: Flow;
}
const statusConfig: Record<FlowStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', icon: Activity },
  draft: { label: 'Draft', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400', icon: Edit3 },
  error: { label: 'Error', color: 'bg-red-500/15 text-red-600 dark:text-red-400', icon: AlertCircle },
  disabled: { label: 'Disabled', color: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400', icon: PauseCircle },
};
export function FlowCard({ flow }: FlowCardProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => workflowApi.delete(flow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success('Workflow deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete flow'),
  });
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (flow.status === 'active') return workflowApi.disable(flow.id);
      return workflowApi.enable(flow.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'] });
      toast.success(`Workflow ${flow.status === 'active' ? 'disabled' : 'enabled'}`);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to toggle flow status'),
  });
  const config = statusConfig[flow.status];
  const StatusIcon = config.icon;
  return (
    <Card className="group border-border/50 hover:border-primary/50 transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className={cn("mb-2 gap-1 px-2 py-0.5 font-medium", config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Flow</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          <Link to={`/flow/${flow.id}`}>{flow.name}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {flow.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDistanceToNow(new Date(flow.updatedAt))} ago</span>
          </div>
          {flow.lastExecuted && (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Ran {formatDistanceToNow(new Date(flow.lastExecuted))} ago</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button variant="default" className="flex-1 gap-2" asChild>
          <Link to={`/flow/${flow.id}`}>
            <Edit3 className="h-4 w-4" />
            Edit Flow
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={toggleMutation.isPending}
          className={cn(flow.status === 'active' ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50")}
          onClick={() => toggleMutation.mutate()}
        >
          {toggleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            flow.status === 'active' ? <PauseCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { CreateFlowDialog } from '@/components/dashboard/CreateFlowDialog';
import { workflowApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FolderKanban, RefreshCw, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flow } from '@/types/schema';
export function DashboardPage() {
  const [search, setSearch] = useState('');
  const { data: flows, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const response = await workflowApi.list();
      if (!response.success) throw new Error(response.error || 'Failed to fetch flows');
      const apiData: any = response.data;
      if (Array.isArray(apiData)) return apiData;
      if (apiData?.flows && Array.isArray(apiData.flows)) {
        return apiData.flows.map((f: any) => ({
          ...f,
          status: f.enabled === 1 ? 'active' : 'disabled',
          createdAt: f.created_at || '',
          updatedAt: f.updated_at || '',
          lastExecuted: undefined,
          nodes: [],
          edges: []
        })) as Flow[];
      }
      return [];
    }
  });
  // Robustly handle cases where 'flows' might not be an array despite our queryFn efforts
  const safeFlows = Array.isArray(flows) ? flows : [];
  const filteredFlows = safeFlows.filter(f =>
    f?.name?.toLowerCase().includes(search.toLowerCase()) ||
    f?.description?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Flow Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor your serverless workflows on RedNox.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
              >
                <RefreshCw className={isRefetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              </Button>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flows..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <CreateFlowDialog />
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Connection Error</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                We couldn't connect to the RedNox API. Please check your network and try again.
              </p>
              <Button onClick={() => refetch()} className="mt-6 gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          ) : filteredFlows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl border-muted bg-muted/20">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No workflows found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                {search ? "No flows match your search criteria." : "You haven't created any flows yet."}
              </p>
              {!search && (
                <div className="mt-6">
                  <CreateFlowDialog />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-muted-foreground">
          <p>© 2024 RedNox Systems</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Documentation</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
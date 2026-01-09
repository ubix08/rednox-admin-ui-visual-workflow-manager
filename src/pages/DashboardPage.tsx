import React, { useState } from 'react';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { CreateFlowDialog } from '@/components/dashboard/CreateFlowDialog';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Search, Filter, FolderKanban } from 'lucide-react';
export function DashboardPage() {
  const flows = useAppStore((s) => s.flows);
  const [search, setSearch] = useState('');
  const filteredFlows = flows.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.description?.toLowerCase().includes(search.toLowerCase())
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
                Manage and monitor your serverless workflows.
              </p>
            </div>
            <div className="flex items-center gap-3">
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
          {filteredFlows.length > 0 ? (
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
                {search ? "No flows match your search criteria." : "You haven't created any flows yet. Start by creating your first workflow."}
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
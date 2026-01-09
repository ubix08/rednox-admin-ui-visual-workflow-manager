import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ChevronRight, LayoutDashboard, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function AppNavbar() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/flow/');
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              Red<span className="text-primary">Nox</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link 
              to="/" 
              className={cn(
                "hover:text-foreground transition-colors",
                !isEditor && "text-foreground font-medium"
              )}
            >
              Dashboard
            </Link>
            {isEditor && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium">Editor</span>
              </>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
            <Link
              to="/"
              className={cn(
                "p-1.5 rounded-sm transition-all",
                !isEditor ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
            <div className="p-1.5 rounded-sm text-muted-foreground cursor-not-allowed">
              <Settings className="h-4 w-4" />
            </div>
          </div>
          <ThemeToggle className="static" />
        </div>
      </div>
    </nav>
  );
}
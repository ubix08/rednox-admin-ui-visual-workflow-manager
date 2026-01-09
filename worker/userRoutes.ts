import { Hono } from "hono";
import { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Simple health check for the frontend to confirm it's hitting the right worker proxy if needed
  app.get('/api/status', (c) => c.json({ 
    success: true, 
    data: { 
      status: 'online', 
      version: '1.0.0', 
      target: 'https://rednox.ubixsnow08.workers.dev' 
    } 
  }));
}
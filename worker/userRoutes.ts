import { Hono } from "hono";
import { Env } from './core-utils';
// Mock storage for the phase demo
const flowStorage = new Map<string, any>();
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'RedNox Edge v1.0' }}));
  // Workflow Execution Simulation
  app.post('/api/flows/execute', async (c) => {
    const body = await c.req.json();
    const { flowId, payload } = body;
    // Simulate node execution logic
    const logs = [
      { level: 'info', message: `Initializing workflow execution: ${flowId}` },
      { level: 'info', message: `Incoming payload validated. Size: ${JSON.stringify(payload).length} bytes` },
      { level: 'info', message: 'Step 1: Input Triggered [HTTP In]', nodeId: 'trigger-1' },
      { level: 'info', message: 'Step 2: Processing Logic [JavaScript]', nodeId: 'logic-1' },
    ];
    // Mock random failure for "realism"
    const success = Math.random() > 0.1;
    if (success) {
      logs.push({ level: 'info', message: 'Execution completed successfully.' });
    } else {
      logs.push({ level: 'error', message: 'Step 3: Storage Failure [KV Put] - Write Quota Exceeded', nodeId: 'storage-1' });
    }
    return c.json({ 
      success: true, 
      data: { 
        success,
        logs,
        executedAt: new Date().toISOString()
      } 
    });
  });
  // Workflow Persistence (Mock)
  app.get('/api/flows/:id', (c) => {
    const id = c.req.param('id');
    const flow = flowStorage.get(id);
    if (!flow) return c.json({ success: false, error: 'Not found' }, 404);
    return c.json({ success: true, data: flow });
  });
  app.put('/api/flows/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    flowStorage.set(id, body);
    return c.json({ success: true, data: { saved: true } });
  });
}
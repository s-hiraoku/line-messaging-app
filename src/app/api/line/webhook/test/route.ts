import { NextResponse } from 'next/server';
import { addLog } from '@/lib/dev/logger';

/**
 * GET /api/line/webhook/test
 * Simple test endpoint to verify webhook is accessible
 */
export async function GET() {
  addLog('info', 'webhook:test:called', {
    timestamp: new Date().toISOString(),
    endpoint: '/api/line/webhook/test'
  });

  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    hint: 'Check /dashboard/dev for logs'
  });
}

/**
 * POST /api/line/webhook/test
 * Test POST requests (simulating webhook)
 */
export async function POST() {
  addLog('info', 'webhook:test:post', {
    timestamp: new Date().toISOString(),
    endpoint: '/api/line/webhook/test'
  });

  return NextResponse.json({
    status: 'ok',
    message: 'POST request received',
    timestamp: new Date().toISOString()
  });
}

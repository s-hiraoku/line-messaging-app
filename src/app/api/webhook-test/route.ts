import { NextResponse } from 'next/server';
import { addLog } from '@/lib/dev/logger';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/webhook-test
 * Webhook診断用エンドポイント
 * LINE Developersの「検証」ボタンでアクセスされるエンドポイント
 */
export async function GET() {
  addLog('info', 'webhook-test:get', {
    timestamp: new Date().toISOString(),
    message: 'Webhook test endpoint accessed via GET'
  });

  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}

/**
 * POST /api/webhook-test
 * LINE Webhookのテスト用
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    addLog('info', 'webhook-test:post', {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      bodyLength: body.length,
      message: 'Webhook test POST received'
    });

    // チャネル設定を確認
    const config = await prisma.channelConfig.findUnique({
      where: { id: 'primary' }
    });

    return NextResponse.json({
      status: 'ok',
      message: 'Webhook POST received',
      timestamp: new Date().toISOString(),
      method: 'POST',
      hasSignature: !!signature,
      channelConfigured: !!(config?.channelSecret),
      hint: 'Check /dashboard/dev for detailed logs'
    });
  } catch (error) {
    addLog('error', 'webhook-test:error', {
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

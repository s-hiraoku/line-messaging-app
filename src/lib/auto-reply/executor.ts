import type { Client, MessageEvent } from '@line/bot-sdk';
import { prisma } from '@/lib/prisma';
import { addLog } from '@/lib/dev/logger';
import { findMatchingReply } from './matcher';

/**
 * Execute auto-reply for a text message event
 * @param client - LINE Messaging API client
 * @param event - LINE message event
 * @param userId - Internal user ID
 */
export async function executeAutoReply(
  client: Client,
  event: MessageEvent,
  userId: string
): Promise<void> {
  // Only process text messages
  if (event.message.type !== 'text') {
    addLog('debug', 'auto-reply:skip', { reason: 'not-text', messageType: event.message.type });
    return;
  }

  const messageText = event.message.text;
  addLog('info', 'auto-reply:processing', { userId, messageText });

  // Find matching auto-reply rule
  const matchResult = await findMatchingReply(messageText);

  addLog('info', 'auto-reply:match-result', {
    matched: matchResult.matched,
    ruleId: matchResult.autoReply?.id,
    ruleName: matchResult.autoReply?.name,
    matchedKeyword: matchResult.matchedKeyword
  });

  if (!matchResult.matched || !matchResult.autoReply) {
    // No matching rule found and no default reply
    addLog('debug', 'auto-reply:no-match', { messageText });
    return;
  }

  const { autoReply, matchedKeyword } = matchResult;

  try {
    // Send reply message
    await client.replyMessage(event.replyToken, [
      {
        type: 'text',
        text: autoReply.replyText,
      },
    ]);

    // Log successful reply
    await prisma.autoReplyLog.create({
      data: {
        autoReplyId: autoReply.id,
        userId: userId,
        inboundMessage: messageText,
        matchedKeyword: matchedKeyword,
        replySent: true,
      },
    });

    addLog('info', 'auto-reply:sent', {
      userId,
      ruleId: autoReply.id,
      ruleName: autoReply.name,
      matchedKeyword,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failed reply
    await prisma.autoReplyLog.create({
      data: {
        autoReplyId: autoReply.id,
        userId: userId,
        inboundMessage: messageText,
        matchedKeyword: matchedKeyword,
        replySent: false,
        errorMessage: errorMessage,
      },
    });

    addLog('error', 'auto-reply:failed', {
      userId,
      ruleId: autoReply.id,
      ruleName: autoReply.name,
      error: errorMessage,
    });

    // Don't throw the error - we want the webhook to complete successfully
    // even if the auto-reply fails
  }
}

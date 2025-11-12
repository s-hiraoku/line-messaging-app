import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatchType } from '@prisma/client';
import { executeAutoReply } from './executor';
import { findMatchingReply } from './matcher';
import { prisma } from '@/lib/prisma';
import { addLog } from '@/lib/dev/logger';
import type { Client, MessageEvent } from '@line/bot-sdk';

// Mock dependencies
vi.mock('./matcher');
vi.mock('@/lib/prisma', () => ({
  prisma: {
    autoReplyLog: {
      create: vi.fn(),
    },
  },
}));
vi.mock('@/lib/dev/logger', () => ({
  addLog: vi.fn(),
}));

describe('executeAutoReply', () => {
  let mockClient: Client;
  let mockEvent: MessageEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      replyMessage: vi.fn().mockResolvedValue({}),
    } as any;

    mockEvent = {
      type: 'message',
      message: {
        type: 'text',
        id: 'msg123',
        text: 'Hello',
        quoteToken: 'quote123',
      },
      webhookEventId: 'webhook123',
      deliveryContext: {
        isRedelivery: false,
      },
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: 'user123',
      },
      replyToken: 'reply123',
      mode: 'active',
    } as MessageEvent;
  });

  it('should not process non-text messages', async () => {
    const imageEvent = {
      ...mockEvent,
      message: {
        type: 'image',
        id: 'img123',
        contentProvider: {
          type: 'line' as const,
        },
      },
    } as MessageEvent;

    await executeAutoReply(mockClient, imageEvent, 'user123');

    expect(findMatchingReply).not.toHaveBeenCalled();
    expect(mockClient.replyMessage).not.toHaveBeenCalled();
  });

  it('should not send reply when no rule matches', async () => {
    vi.mocked(findMatchingReply).mockResolvedValue({
      matched: false,
    });

    await executeAutoReply(mockClient, mockEvent, 'user123');

    expect(mockClient.replyMessage).not.toHaveBeenCalled();
    expect(prisma.autoReplyLog.create).not.toHaveBeenCalled();
  });

  it('should send reply and log when rule matches', async () => {
    const mockAutoReply = {
      id: 'rule123',
      name: 'Test Rule',
      keywords: ['hello'],
      replyText: 'Hello! How can I help you?',
      priority: 100,
      isActive: true,
      matchType: MatchType.CONTAINS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(findMatchingReply).mockResolvedValue({
      matched: true,
      autoReply: mockAutoReply,
      matchedKeyword: 'hello',
    });

    await executeAutoReply(mockClient, mockEvent, 'user123');

    // Verify reply message was sent
    expect(mockClient.replyMessage).toHaveBeenCalledWith('reply123', [
      {
        type: 'text',
        text: 'Hello! How can I help you?',
      },
    ]);

    // Verify log was created
    expect(prisma.autoReplyLog.create).toHaveBeenCalledWith({
      data: {
        autoReplyId: 'rule123',
        userId: 'user123',
        inboundMessage: 'Hello',
        matchedKeyword: 'hello',
        replySent: true,
      },
    });

    // Verify success log
    expect(addLog).toHaveBeenCalledWith('info', 'auto-reply:sent', {
      userId: 'user123',
      ruleId: 'rule123',
      ruleName: 'Test Rule',
      matchedKeyword: 'hello',
    });
  });

  it('should log error when reply fails', async () => {
    const mockAutoReply = {
      id: 'rule123',
      name: 'Test Rule',
      keywords: ['hello'],
      replyText: 'Hello!',
      priority: 100,
      isActive: true,
      matchType: MatchType.CONTAINS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(findMatchingReply).mockResolvedValue({
      matched: true,
      autoReply: mockAutoReply,
      matchedKeyword: 'hello',
    });

    const error = new Error('Network error');
    vi.mocked(mockClient.replyMessage).mockRejectedValue(error);

    await executeAutoReply(mockEvent, mockEvent, 'user123');

    // Verify error log was created
    expect(prisma.autoReplyLog.create).toHaveBeenCalledWith({
      data: {
        autoReplyId: 'rule123',
        userId: 'user123',
        inboundMessage: 'Hello',
        matchedKeyword: 'hello',
        replySent: false,
        errorMessage: 'Network error',
      },
    });

    // Verify error log
    expect(addLog).toHaveBeenCalledWith('error', 'auto-reply:failed', {
      userId: 'user123',
      ruleId: 'rule123',
      ruleName: 'Test Rule',
      error: 'Network error',
    });
  });

  it('should handle default reply', async () => {
    const mockDefaultReply = {
      id: 'default',
      name: 'Default Reply',
      keywords: [],
      replyText: 'Thanks for your message!',
      priority: 999,
      isActive: true,
      matchType: MatchType.CONTAINS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(findMatchingReply).mockResolvedValue({
      matched: true,
      autoReply: mockDefaultReply,
      matchedKeyword: undefined,
    });

    await executeAutoReply(mockClient, mockEvent, 'user123');

    expect(mockClient.replyMessage).toHaveBeenCalledWith('reply123', [
      {
        type: 'text',
        text: 'Thanks for your message!',
      },
    ]);

    expect(prisma.autoReplyLog.create).toHaveBeenCalledWith({
      data: {
        autoReplyId: 'default',
        userId: 'user123',
        inboundMessage: 'Hello',
        matchedKeyword: undefined,
        replySent: true,
      },
    });
  });

  it('should handle non-Error exceptions', async () => {
    const mockAutoReply = {
      id: 'rule123',
      name: 'Test Rule',
      keywords: ['hello'],
      replyText: 'Hello!',
      priority: 100,
      isActive: true,
      matchType: MatchType.CONTAINS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(findMatchingReply).mockResolvedValue({
      matched: true,
      autoReply: mockAutoReply,
      matchedKeyword: 'hello',
    });

    vi.mocked(mockClient.replyMessage).mockRejectedValue('String error');

    await executeAutoReply(mockClient, mockEvent, 'user123');

    expect(prisma.autoReplyLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        replySent: false,
        errorMessage: 'String error',
      }),
    });
  });
});

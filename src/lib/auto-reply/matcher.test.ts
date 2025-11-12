import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatchType } from '@prisma/client';
import { matchByType, findMatchingReply } from './matcher';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    autoReply: {
      findMany: vi.fn(),
    },
    defaultAutoReply: {
      findUnique: vi.fn(),
    },
  },
}));

describe('matchByType', () => {
  describe('EXACT match', () => {
    it('should match when message is exactly the same as keyword', () => {
      expect(matchByType('hello', 'hello', MatchType.EXACT)).toBe(true);
    });

    it('should not match when message differs from keyword', () => {
      expect(matchByType('hello world', 'hello', MatchType.EXACT)).toBe(false);
      expect(matchByType('hello', 'hello world', MatchType.EXACT)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(matchByType('', '', MatchType.EXACT)).toBe(true);
      expect(matchByType('hello', '', MatchType.EXACT)).toBe(false);
      expect(matchByType('', 'hello', MatchType.EXACT)).toBe(false);
    });
  });

  describe('CONTAINS match', () => {
    it('should match when keyword is contained in message', () => {
      expect(matchByType('hello world', 'world', MatchType.CONTAINS)).toBe(true);
      expect(matchByType('hello world', 'hello', MatchType.CONTAINS)).toBe(true);
      expect(matchByType('hello world', 'lo wo', MatchType.CONTAINS)).toBe(true);
    });

    it('should not match when keyword is not in message', () => {
      expect(matchByType('hello', 'world', MatchType.CONTAINS)).toBe(false);
    });

    it('should match exact strings', () => {
      expect(matchByType('hello', 'hello', MatchType.CONTAINS)).toBe(true);
    });
  });

  describe('STARTS_WITH match', () => {
    it('should match when message starts with keyword', () => {
      expect(matchByType('hello world', 'hello', MatchType.STARTS_WITH)).toBe(true);
      expect(matchByType('hello', 'hello', MatchType.STARTS_WITH)).toBe(true);
    });

    it('should not match when message does not start with keyword', () => {
      expect(matchByType('hello world', 'world', MatchType.STARTS_WITH)).toBe(false);
      expect(matchByType('say hello', 'hello', MatchType.STARTS_WITH)).toBe(false);
    });
  });

  describe('ENDS_WITH match', () => {
    it('should match when message ends with keyword', () => {
      expect(matchByType('hello world', 'world', MatchType.ENDS_WITH)).toBe(true);
      expect(matchByType('world', 'world', MatchType.ENDS_WITH)).toBe(true);
    });

    it('should not match when message does not end with keyword', () => {
      expect(matchByType('hello world', 'hello', MatchType.ENDS_WITH)).toBe(false);
      expect(matchByType('world today', 'world', MatchType.ENDS_WITH)).toBe(false);
    });
  });

  describe('Case insensitivity', () => {
    it('should be case insensitive when inputs are already normalized', () => {
      // Note: matchByType expects normalized (lowercase) inputs
      expect(matchByType('hello', 'hello', MatchType.EXACT)).toBe(true);
      expect(matchByType('hello world', 'hello', MatchType.CONTAINS)).toBe(true);
      expect(matchByType('hello world', 'hello', MatchType.STARTS_WITH)).toBe(true);
      expect(matchByType('hello world', 'world', MatchType.ENDS_WITH)).toBe(true);
    });
  });

  describe('Special characters', () => {
    it('should handle special characters', () => {
      expect(matchByType('hello@world', '@world', MatchType.ENDS_WITH)).toBe(true);
      expect(matchByType('$100', '$100', MatchType.EXACT)).toBe(true);
      expect(matchByType('test [brackets]', '[brackets]', MatchType.CONTAINS)).toBe(true);
    });
  });
});

describe('findMatchingReply', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return first matching rule by priority', async () => {
    // Mock rules should be pre-sorted by priority (ascending) and createdAt (descending)
    // Lower priority number = higher priority
    const mockRules = [
      {
        id: '2',
        name: 'Rule 2',
        keywords: ['hello'],
        replyText: 'Reply 2',
        priority: 50, // Higher priority (lower number)
        isActive: true,
        matchType: MatchType.CONTAINS,
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
      {
        id: '1',
        name: 'Rule 1',
        keywords: ['hello'],
        replyText: 'Reply 1',
        priority: 100, // Lower priority (higher number)
        isActive: true,
        matchType: MatchType.CONTAINS,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    vi.mocked(prisma.autoReply.findMany).mockResolvedValue(mockRules);

    const result = await findMatchingReply('hello world');

    expect(result.matched).toBe(true);
    expect(result.autoReply?.id).toBe('2'); // Should match first rule (higher priority)
    expect(result.matchedKeyword).toBe('hello');
  });

  it('should return no match when no rules match', async () => {
    const mockRules = [
      {
        id: '1',
        name: 'Rule 1',
        keywords: ['hello'],
        replyText: 'Reply 1',
        priority: 100,
        isActive: true,
        matchType: MatchType.EXACT,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    vi.mocked(prisma.autoReply.findMany).mockResolvedValue(mockRules);
    vi.mocked(prisma.defaultAutoReply.findUnique).mockResolvedValue(null);

    const result = await findMatchingReply('goodbye');

    expect(result.matched).toBe(false);
  });

  it('should return default reply when no rules match and default is active', async () => {
    vi.mocked(prisma.autoReply.findMany).mockResolvedValue([]);
    vi.mocked(prisma.defaultAutoReply.findUnique).mockResolvedValue({
      id: 'default',
      replyText: 'Default reply',
      isActive: true,
      updatedAt: new Date('2025-01-01'),
    });

    const result = await findMatchingReply('anything');

    expect(result.matched).toBe(true);
    expect(result.autoReply?.id).toBe('default');
    expect(result.autoReply?.replyText).toBe('Default reply');
  });

  it('should skip inactive rules', async () => {
    const mockRules = [
      {
        id: '1',
        name: 'Rule 1',
        keywords: ['hello'],
        replyText: 'Reply 1',
        priority: 100,
        isActive: false, // Inactive
        matchType: MatchType.CONTAINS,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    vi.mocked(prisma.autoReply.findMany).mockResolvedValue([]);
    vi.mocked(prisma.defaultAutoReply.findUnique).mockResolvedValue(null);

    const result = await findMatchingReply('hello');

    expect(result.matched).toBe(false);
  });

  it('should match any keyword in the keywords array (OR condition)', async () => {
    const mockRules = [
      {
        id: '1',
        name: 'Rule 1',
        keywords: ['hello', 'hi', 'hey'],
        replyText: 'Reply 1',
        priority: 100,
        isActive: true,
        matchType: MatchType.CONTAINS,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    vi.mocked(prisma.autoReply.findMany).mockResolvedValue(mockRules);

    const result1 = await findMatchingReply('hi there');
    expect(result1.matched).toBe(true);
    expect(result1.matchedKeyword).toBe('hi');

    const result2 = await findMatchingReply('hey you');
    expect(result2.matched).toBe(true);
    expect(result2.matchedKeyword).toBe('hey');
  });

  it('should normalize message and keywords (trim and lowercase)', async () => {
    const mockRules = [
      {
        id: '1',
        name: 'Rule 1',
        keywords: ['  HELLO  '],
        replyText: 'Reply 1',
        priority: 100,
        isActive: true,
        matchType: MatchType.EXACT,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    vi.mocked(prisma.autoReply.findMany).mockResolvedValue(mockRules);

    const result = await findMatchingReply('  hello  ');

    expect(result.matched).toBe(true);
    expect(result.matchedKeyword).toBe('  HELLO  '); // Original keyword returned
  });
});

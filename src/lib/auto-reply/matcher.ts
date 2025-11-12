import { AutoReply, MatchType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { addLog } from '@/lib/dev/logger';

export interface MatchResult {
  matched: boolean;
  autoReply?: AutoReply;
  matchedKeyword?: string;
}

/**
 * Find a matching auto-reply rule for the given message
 * @param message - The inbound message text
 * @returns Match result with the matched rule and keyword
 */
export async function findMatchingReply(message: string): Promise<MatchResult> {
  // 1. Get active auto-reply rules ordered by priority (asc) and creation date (desc)
  const rules = await prisma.autoReply.findMany({
    where: { isActive: true },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  });

  addLog('debug', 'auto-reply:matcher:rules-loaded', {
    rulesCount: rules.length,
    ruleIds: rules.map(r => r.id),
    ruleNames: rules.map(r => r.name)
  });

  // 2. Normalize the message (lowercase and trim)
  const normalizedMessage = message.toLowerCase().trim();

  addLog('debug', 'auto-reply:matcher:normalized', {
    original: message,
    normalized: normalizedMessage
  });

  // 3. Try to match each rule
  for (const rule of rules) {
    addLog('debug', 'auto-reply:matcher:checking-rule', {
      ruleId: rule.id,
      ruleName: rule.name,
      keywords: rule.keywords,
      matchType: rule.matchType
    });

    for (const keyword of rule.keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();

      const isMatch = matchByType(normalizedMessage, normalizedKeyword, rule.matchType);

      addLog('debug', 'auto-reply:matcher:keyword-check', {
        keyword,
        normalizedKeyword,
        normalizedMessage,
        matchType: rule.matchType,
        isMatch
      });

      if (isMatch) {
        addLog('info', 'auto-reply:matcher:matched', {
          ruleId: rule.id,
          ruleName: rule.name,
          matchedKeyword: keyword
        });

        return {
          matched: true,
          autoReply: rule,
          matchedKeyword: keyword,
        };
      }
    }
  }

  // 4. Check for default reply if no rule matched
  addLog('debug', 'auto-reply:matcher:checking-default', {});

  const defaultReply = await prisma.defaultAutoReply.findUnique({
    where: { id: 'default' },
  });

  addLog('debug', 'auto-reply:matcher:default-reply', {
    exists: !!defaultReply,
    isActive: defaultReply?.isActive,
    hasReplyText: !!defaultReply?.replyText
  });

  if (defaultReply?.isActive && defaultReply.replyText) {
    addLog('info', 'auto-reply:matcher:using-default', {});

    // Create a pseudo AutoReply object for the default reply
    const pseudoAutoReply: AutoReply = {
      id: 'default',
      name: 'Default Reply',
      keywords: [],
      replyText: defaultReply.replyText,
      priority: 999,
      isActive: true,
      matchType: MatchType.CONTAINS,
      createdAt: new Date(),
      updatedAt: defaultReply.updatedAt,
    };

    return {
      matched: true,
      autoReply: pseudoAutoReply,
      matchedKeyword: undefined,
    };
  }

  addLog('debug', 'auto-reply:matcher:no-match-final', {});

  return { matched: false };
}

/**
 * Match a message against a keyword using the specified match type
 * @param message - Normalized message
 * @param keyword - Normalized keyword
 * @param matchType - Type of matching to perform
 * @returns True if the message matches the keyword
 */
export function matchByType(message: string, keyword: string, matchType: MatchType): boolean {
  switch (matchType) {
    case MatchType.EXACT:
      return message === keyword;
    case MatchType.CONTAINS:
      return message.includes(keyword);
    case MatchType.STARTS_WITH:
      return message.startsWith(keyword);
    case MatchType.ENDS_WITH:
      return message.endsWith(keyword);
    default:
      return false;
  }
}

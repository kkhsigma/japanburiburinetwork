// ─── AI Content Moderation ──────────────────────────────────

const BLOCK_PATTERNS = [
  /(?:where|how)\s+(?:to\s+)?(?:buy|purchase|get|order|find|score)\s+(?:drugs?|lsd|mdma|dmt|cocaine|heroin|meth|fentanyl|mushrooms?|weed|marijuana)/i,
  /(?:darknet|dark\s*web|tor)\s+(?:market|shop|vendor|site|link)/i,
  /(?:how\s+to|guide\s+(?:to|for)|instructions?\s+(?:to|for)|steps?\s+(?:to|for))\s+(?:synthe[sz]i[sz]e?|make|cook|manufacture|extract|produce|grow)\s+(?:drugs?|lsd|mdma|dmt|meth|cocaine|heroin|fentanyl|ghb)/i,
  /(?:sell|selling|vendor|deal|dealing|traffic|trafficking|smuggl)/i,
  /(?:dose|dosage|dosing)\s+(?:guide|instructions?|how\s+much|schedule).{0,40}(?:lethal|maximum|heroic|mega|extreme)/i,
  /(?:buy|sell|trade)\s+(?:on|via|through)\s+(?:telegram|signal|wickr|dark)/i,
];

const REVIEW_PATTERNS = [
  /(?:personal|my)\s+(?:experience|trip|journey)\s+(?:with|on|using)\s+(?:lsd|mdma|dmt|mushrooms?|ayahuasca|ketamine|psilocybin)/i,
  /(?:dose|dosage|dosing)\s+(?:guide|information|protocol)/i,
  /(?:trip)\s+(?:report|story|diary)/i,
  /(?:microdose|microdosing)\s+(?:guide|protocol|schedule|how)/i,
];

export type ModerationResult = "SAFE" | "REVIEW" | "BLOCK";

export interface ModerationResponse {
  result: ModerationResult;
  reason: string | null;
  flaggedPatterns: string[];
}

export function checkPostSafety(content: string): ModerationResponse {
  const normalised = content.toLowerCase();
  const flaggedPatterns: string[] = [];

  // Check BLOCK patterns
  for (const pattern of BLOCK_PATTERNS) {
    const match = normalised.match(pattern);
    if (match) {
      flaggedPatterns.push(match[0]);
      return {
        result: "BLOCK",
        reason: "コンテンツが違法行為または危険な内容に関連しています。",
        flaggedPatterns,
      };
    }
  }

  // Check REVIEW patterns
  for (const pattern of REVIEW_PATTERNS) {
    const match = normalised.match(pattern);
    if (match) {
      flaggedPatterns.push(match[0]);
    }
  }

  if (flaggedPatterns.length > 0) {
    return {
      result: "REVIEW",
      reason: "コンテンツにレビューが必要な表現が含まれています。",
      flaggedPatterns,
    };
  }

  return {
    result: "SAFE",
    reason: null,
    flaggedPatterns: [],
  };
}

export type ReportReason = "illegal_activity" | "misinformation" | "unsafe_advice";

export interface Report {
  postId: string;
  reason: ReportReason;
  details: string;
  reportedAt: string;
}

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: "illegal_activity",
    label: "違法行為",
    description: "薬物の売買、密売、違法な活動の促進に関する内容",
  },
  {
    value: "misinformation",
    label: "誤情報",
    description: "科学的根拠のない虚偽の情報や誤解を招く内容",
  },
  {
    value: "unsafe_advice",
    label: "危険なアドバイス",
    description: "健康や安全を脅かす可能性のある危険な助言",
  },
];

// Compound name dictionary for rule-based entity extraction
// Maps various names, aliases, and Japanese names to canonical compound names

export const COMPOUND_DICTIONARY: Record<string, string> = {
  // CBD
  'cbd': 'CBD',
  'cannabidiol': 'CBD',
  'カンナビジオール': 'CBD',

  // CBN
  'cbn': 'CBN',
  'cannabinol': 'CBN',
  'カンナビノール': 'CBN',

  // CBG
  'cbg': 'CBG',
  'cannabigerol': 'CBG',
  'カンナビゲロール': 'CBG',

  // CBC
  'cbc': 'CBC',
  'cannabichromene': 'CBC',
  'カンナビクロメン': 'CBC',

  // CBL
  'cbl': 'CBL',
  'cannabicyclol': 'CBL',
  'カンナビシクロール': 'CBL',

  // THC
  'thc': 'THC',
  'δ9-thc': 'THC',
  'delta-9-thc': 'THC',
  'delta-9 thc': 'THC',
  'Δ9-THC': 'THC',
  'tetrahydrocannabinol': 'THC',
  'テトラヒドロカンナビノール': 'THC',

  // THCV
  'thcv': 'THCV',
  'tetrahydrocannabivarin': 'THCV',
  'テトラヒドロカンナビバリン': 'THCV',

  // THCP
  'thcp': 'THCP',
  'tetrahydrocannabiphorol': 'THCP',
  'テトラヒドロカンナビフォロール': 'THCP',

  // HHC
  'hhc': 'HHC',
  'hexahydrocannabinol': 'HHC',
  'ヘキサヒドロカンナビノール': 'HHC',

  // HHCH
  'hhch': 'HHCH',
  'hexahydrocannabihexol': 'HHCH',
  'ヘキサヒドロカンナビヘキソール': 'HHCH',

  // HHCP
  'hhcp': 'HHCP',
  'hexahydrocannabiphorol': 'HHCP',
  'ヘキサヒドロカンナビフォロール': 'HHCP',

  // H4CBD
  'h4cbd': 'H4CBD',
  'hydrogenated cbd': 'H4CBD',
  '水素化cbd': 'H4CBD',

  // THCA
  'thca': 'THCA',
  'tetrahydrocannabinolic acid': 'THCA',
};

// Legal action keywords (Japanese) for rule-based classification
export const LEGAL_ACTION_KEYWORDS: Record<string, string> = {
  '指定薬物追加': 'designated_substance_addition',
  '指定薬物': 'designated_substance_addition',
  '麻薬指定': 'narcotic_designation',
  '麻薬として': 'narcotic_designation',
  'パブコメ開始': 'public_comment_open',
  'パブリックコメント': 'public_comment_open',
  '公布': 'promulgation',
  '施行': 'enforcement_date_confirmed',
  '注意喚起': 'administrative_warning',
  '行政調査': 'administrative_warning',
  '回収': 'recall',
  '終売': 'recall',
  '輸入確認手続変更': 'import_procedure_change',
  '残留限度値': 'thc_threshold_change',
  '使用罪': 'use_crime',
  '省令': 'ministerial_ordinance',
  '非該当性確認': 'import_procedure_change',
  '買い上げ調査': 'administrative_warning',
};

export function extractCompoundsFromText(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const [key, canonical] of Object.entries(COMPOUND_DICTIONARY)) {
    if (lowerText.includes(key.toLowerCase()) || text.includes(key)) {
      found.add(canonical);
    }
  }

  return Array.from(found);
}

export function extractLegalActionsFromText(text: string): string[] {
  const found = new Set<string>();

  for (const [keyword, action] of Object.entries(LEGAL_ACTION_KEYWORDS)) {
    if (text.includes(keyword)) {
      found.add(action);
    }
  }

  return Array.from(found);
}

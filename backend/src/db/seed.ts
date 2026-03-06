import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const COMPOUNDS = [
  {
    name: 'CBD',
    aliases: ['Cannabidiol', 'カンナビジオール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'effective',
    risk_level: 'SAFE',
    effects_summary: 'Non-psychoactive cannabinoid. Legal in Japan when THC levels are below residual limits. Widely used in oils, edibles, and cosmetics.',
    notes: 'Import requires NCD non-correspondence confirmation. THC residual limits enforced since Dec 12, 2024.',
  },
  {
    name: 'CBN',
    aliases: ['Cannabinol', 'カンナビノール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'under_review',
    risk_level: 'HIGH',
    effects_summary: 'Mildly psychoactive oxidation product of THC. Currently under regulatory review for possible designated substance classification.',
    notes: 'MHLW has published guidance for "if CBN is designated." Industry reports suggest delayed enforcement. HIGH WATCH priority.',
  },
  {
    name: 'CBG',
    aliases: ['Cannabigerol', 'カンナビゲロール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'effective',
    risk_level: 'SAFE',
    effects_summary: 'Non-psychoactive precursor cannabinoid. Legal in Japan under same framework as CBD.',
    notes: 'Subject to same THC residual testing requirements as CBD products.',
  },
  {
    name: 'CBC',
    aliases: ['Cannabichromene', 'カンナビクロメン'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'effective',
    risk_level: 'LOW',
    effects_summary: 'Non-psychoactive cannabinoid found in hemp. Legal in Japan.',
    notes: 'Less common in products but subject to same regulations as CBD.',
  },
  {
    name: 'CBL',
    aliases: ['Cannabicyclol', 'カンナビシクロール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'unknown',
    risk_level: 'LOW',
    effects_summary: 'Rare non-psychoactive cannabinoid. Degradation product of CBC.',
    notes: 'Minimal regulatory attention. Very few products contain this.',
  },
  {
    name: 'THC',
    aliases: ['Δ9-THC', 'Delta-9-THC', 'Tetrahydrocannabinol', 'テトラヒドロカンナビノール', 'delta-9 THC'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'effective',
    risk_level: 'ILLEGAL',
    effects_summary: 'Primary psychoactive compound in cannabis. Strictly regulated in Japan. Products exceeding residual limits are treated as narcotics.',
    notes: 'Residual limits: Oil/Fat/Powder = 10ppm, Aqueous Solution = 0.1ppm. Enforced since Dec 12, 2024. "Use crimes" now applicable.',
  },
  {
    name: 'THCV',
    aliases: ['Tetrahydrocannabivarin', 'テトラヒドロカンナビバリン'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'under_review',
    risk_level: 'MEDIUM',
    effects_summary: 'Structurally similar to THC with different effects profile. Regulatory status uncertain.',
    notes: 'Monitor for possible designated substance classification alongside CBN review.',
  },
  {
    name: 'THCP',
    aliases: ['Tetrahydrocannabiphorol', 'テトラヒドロカンナビフォロール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'natural',
    legal_status_japan: 'effective',
    risk_level: 'ILLEGAL',
    effects_summary: 'Extremely potent THC analog. Designated substance in Japan.',
    notes: 'Designated as controlled substance. Possession and use are criminal offenses.',
  },
  {
    name: 'HHC',
    aliases: ['Hexahydrocannabinol', 'ヘキサヒドロカンナビノール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'synthetic',
    legal_status_japan: 'effective',
    risk_level: 'ILLEGAL',
    effects_summary: 'Hydrogenated form of THC. Designated substance in Japan since 2023.',
    notes: 'Was widely sold before designation. Now fully illegal.',
  },
  {
    name: 'HHCH',
    aliases: ['Hexahydrocannabihexol', 'ヘキサヒドロカンナビヘキソール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'synthetic',
    legal_status_japan: 'effective',
    risk_level: 'ILLEGAL',
    effects_summary: 'Synthetic cannabinoid. Designated substance causing health incidents.',
    notes: 'Linked to "cannabis gummy" incidents. Emergency designated substance.',
  },
  {
    name: 'HHCP',
    aliases: ['Hexahydrocannabiphorol', 'ヘキサヒドロカンナビフォロール'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'synthetic',
    legal_status_japan: 'effective',
    risk_level: 'ILLEGAL',
    effects_summary: 'Potent synthetic cannabinoid. Designated substance in Japan.',
    notes: 'Part of the HHC-family wave of designations.',
  },
  {
    name: 'H4CBD',
    aliases: ['Hydrogenated CBD', '水素化CBD'],
    chemical_family: 'Cannabinoid',
    natural_or_synthetic: 'synthetic',
    legal_status_japan: 'under_review',
    risk_level: 'HIGH',
    effects_summary: 'Hydrogenated form of CBD with reportedly stronger effects. Regulatory status uncertain.',
    notes: 'Monitor closely. May follow HHC designation path.',
  },
];

const SOURCES = [
  { name: 'MHLW Press Releases (Medical Affairs Bureau)', url: 'https://www.mhlw.go.jp/stf/houdou/houdou_list.html', source_type: 'official_html', tier: '1', fetch_frequency: 3600 },
  { name: 'Designated Substances List PDF', url: 'https://www.mhlw.go.jp/content/11120000/shiteiyakubutu.pdf', source_type: 'official_pdf', tier: '1', fetch_frequency: 86400 },
  { name: 'Pharmaceutical Affairs Council (Designated Substances Subcommittee)', url: 'https://www.mhlw.go.jp/stf/shingi/shingi-yakuji_127869.html', source_type: 'committee_page', tier: '1', fetch_frequency: 86400 },
  { name: 'Cannabis Control Act Amendment Page', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000193406_00001.html', source_type: 'official_html', tier: '1', fetch_frequency: 86400 },
  { name: 'THC Residual Limit Notice PDF', url: 'https://www.mhlw.go.jp/content/thc_zanryuu.pdf', source_type: 'official_pdf', tier: '1', fetch_frequency: 86400 },
  { name: 'NCD CBD Import Page', url: 'https://www.ncd.mhlw.go.jp/cbd.html', source_type: 'official_html', tier: '1', fetch_frequency: 43200 },
  { name: 'CBD Import Manual PDF', url: 'https://www.ncd.mhlw.go.jp/dl/cbd_tebiki.pdf', source_type: 'official_pdf', tier: '1', fetch_frequency: 86400 },
  { name: 'Product Category Classification PDF', url: 'https://www.ncd.mhlw.go.jp/dl/cbd_kubun.pdf', source_type: 'official_pdf', tier: '1', fetch_frequency: 86400 },
  { name: 'Consumer Affairs Agency Press Briefings', url: 'https://www.caa.go.jp/notice/statement/', source_type: 'official_html', tier: '2', fetch_frequency: 43200 },
  { name: 'Wellness Daily News', url: 'https://www.wellness-news.co.jp/', source_type: 'industry_article', tier: '4', fetch_frequency: 21600 },
];

const SAMPLE_ALERTS = [
  {
    title: '4 New Substances Designated as Controlled Substances (Shitei Yakubutsu)',
    category: 'designated_substance',
    severity: 'critical',
    status: 'official_confirmed',
    source_tier: '1',
    confidence_level: 'official',
    published_at: '2026-03-04',
    effective_at: '2026-03-14',
    summary_what: 'MHLW officially designated 4 new synthetic cannabinoid substances as "Designated Substances" (Shitei Yakubutsu) effective March 14, 2026.',
    summary_why: 'Possession, sale, import, and use of these substances will become criminal offenses after the effective date.',
    summary_who: 'All consumers, retailers, and importers of cannabinoid products in Japan.',
    compounds: ['Substance A', 'Substance B', 'Substance C', 'Substance D'],
    product_forms: ['oil', 'vape', 'gummy', 'powder'],
    agencies: ['MHLW'],
    diff_before: 'Designated Substances List: 2,456 substances',
    diff_after: 'Designated Substances List: 2,460 substances (+4 new)',
    diff_type: 'status',
    primary_source_url: 'https://www.mhlw.go.jp/stf/houdou/0000193406_00001.html',
    importance_score: 95,
  },
  {
    title: 'CBN Regulatory Review: Designation Timeline Under Discussion',
    category: 'regulation',
    severity: 'high',
    status: 'pending',
    source_tier: '1',
    confidence_level: 'verified',
    published_at: '2026-02-15',
    effective_at: null,
    summary_what: 'MHLW published guidance page for "if CBN is designated as a controlled substance," including transition procedures for existing inventory.',
    summary_why: 'CBN is one of the most widely used legal cannabinoids in Japan. Designation would affect the entire CBD/CBN product market.',
    summary_who: 'CBN product manufacturers, importers, retailers, and consumers.',
    compounds: ['CBN'],
    product_forms: ['oil', 'gummy', 'capsule', 'vape'],
    agencies: ['MHLW', 'NCD'],
    diff_before: 'CBN: No regulatory guidance page',
    diff_after: 'CBN: MHLW published "If CBN is designated" transition guide',
    diff_type: 'status',
    primary_source_url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/cbn_guidance.html',
    importance_score: 85,
  },
  {
    title: 'THC Residual Limit Enforcement Now Active',
    category: 'threshold',
    severity: 'critical',
    status: 'official_confirmed',
    source_tier: '1',
    confidence_level: 'official',
    published_at: '2024-12-12',
    effective_at: '2024-12-12',
    summary_what: 'THC residual limits for cannabis-derived products are now legally enforced. Oil/Fat/Powder: 10ppm. Aqueous Solution: 0.1ppm.',
    summary_why: 'Products exceeding these limits are now legally classified as narcotics. This is the strictest standard globally.',
    summary_who: 'All CBD/cannabinoid product importers, manufacturers, and retailers in Japan.',
    compounds: ['THC', 'CBD', 'CBN', 'CBG'],
    product_forms: ['oil', 'powder', 'aqueous_solution', 'capsule', 'gummy'],
    agencies: ['MHLW'],
    diff_before: 'THC in Oil/Fat/Powder: No enforced limit\nTHC in Aqueous Solution: No enforced limit',
    diff_after: 'THC in Oil/Fat/Powder: 10ppm (enforced)\nTHC in Aqueous Solution: 0.1ppm (enforced)',
    diff_type: 'threshold',
    primary_source_url: 'https://www.mhlw.go.jp/content/thc_zanryuu.pdf',
    importance_score: 98,
  },
  {
    title: 'Cannabis Control Act Amendment: "Use Crimes" Now Enforceable',
    category: 'regulation',
    severity: 'critical',
    status: 'official_confirmed',
    source_tier: '1',
    confidence_level: 'official',
    published_at: '2024-12-12',
    effective_at: '2024-12-12',
    summary_what: 'The amended Cannabis Control Act now criminalizes the "use" of cannabis/THC, not just possession. This closes a long-standing legal gap.',
    summary_why: 'Previously, using cannabis was not explicitly illegal (only possession was). This amendment aligns cannabis enforcement with other controlled substances.',
    summary_who: 'All individuals in Japan. Particularly affects consumers who previously relied on the "use is not a crime" interpretation.',
    compounds: ['THC'],
    product_forms: [],
    agencies: ['MHLW'],
    diff_before: 'Cannabis Control Act: "Use" not criminalized',
    diff_after: 'Cannabis Control Act: "Use" is now a criminal offense (使用罪)',
    diff_type: 'status',
    primary_source_url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000193406_00001.html',
    importance_score: 99,
  },
  {
    title: 'Upcoming: Public Comment Period for New Substance Review',
    category: 'regulation',
    severity: 'medium',
    status: 'verified',
    source_tier: '1',
    confidence_level: 'verified',
    published_at: '2026-03-01',
    effective_at: '2026-04-15',
    summary_what: 'e-Gov public comment period opening for proposed review of additional cannabinoid substances.',
    summary_why: 'Public comments can influence the scope and timeline of new substance designations.',
    summary_who: 'Industry stakeholders, advocacy groups, and informed consumers.',
    compounds: [],
    product_forms: [],
    agencies: ['MHLW'],
    diff_before: 'No active public comment period',
    diff_after: 'Public comment period open until April 15, 2026',
    diff_type: 'date',
    primary_source_url: 'https://public-comment.e-gov.go.jp/',
    importance_score: 55,
  },
];

const THC_REGULATIONS = [
  { product_category: 'Oil / Fat / Powder (油脂・粉末)', max_thc_level: '10ppm', measurement_method: 'GC-MS/MS or LC-MS/MS', effective_date: '2024-12-12', source_url: 'https://www.mhlw.go.jp/content/thc_zanryuu.pdf', is_current: true },
  { product_category: 'Aqueous Solution (水溶液)', max_thc_level: '0.1ppm', measurement_method: 'GC-MS/MS or LC-MS/MS', effective_date: '2024-12-12', source_url: 'https://www.mhlw.go.jp/content/thc_zanryuu.pdf', is_current: true },
  { product_category: 'Hemp Seeds (for cultivation)', max_thc_level: '0.3% (seed standard)', measurement_method: 'Seed THC content', effective_date: '2024-12-12', source_url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000193406_00001.html', is_current: true },
];

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/jbn',
  });

  await client.connect();
  console.log('Connected to database for seeding');

  // Seed compounds
  for (const compound of COMPOUNDS) {
    await client.query(
      `INSERT INTO compounds (name, aliases, chemical_family, natural_or_synthetic, legal_status_japan, risk_level, effects_summary, notes, legal_status_updated_at)
       VALUES ($1, $2, $3, $4, $5::legal_status, $6::risk_level, $7, $8, NOW())
       ON CONFLICT (name) DO UPDATE SET
         aliases = $2, legal_status_japan = $5::legal_status, risk_level = $6::risk_level,
         effects_summary = $7, notes = $8, updated_at = NOW()`,
      [
        compound.name,
        JSON.stringify(compound.aliases),
        compound.chemical_family,
        compound.natural_or_synthetic,
        compound.legal_status_japan,
        compound.risk_level,
        compound.effects_summary,
        compound.notes,
      ]
    );
  }
  console.log(`Seeded ${COMPOUNDS.length} compounds`);

  // Seed sources
  for (const source of SOURCES) {
    await client.query(
      `INSERT INTO sources (name, url, source_type, tier, fetch_frequency)
       VALUES ($1, $2, $3::source_type, $4::source_tier, $5)
       ON CONFLICT DO NOTHING`,
      [source.name, source.url, source.source_type, source.tier, source.fetch_frequency]
    );
  }
  console.log(`Seeded ${SOURCES.length} sources`);

  // Seed sample alerts
  for (const alert of SAMPLE_ALERTS) {
    await client.query(
      `INSERT INTO alerts (title, category, severity, status, source_tier, confidence_level, published_at, effective_at, summary_what, summary_why, summary_who, compounds, product_forms, agencies, diff_before, diff_after, diff_type, primary_source_url, importance_score)
       VALUES ($1, $2::alert_category, $3::alert_severity, $4::alert_status, $5::source_tier, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        alert.title, alert.category, alert.severity, alert.status, alert.source_tier,
        alert.confidence_level, alert.published_at, alert.effective_at,
        alert.summary_what, alert.summary_why, alert.summary_who,
        JSON.stringify(alert.compounds), JSON.stringify(alert.product_forms), JSON.stringify(alert.agencies),
        alert.diff_before, alert.diff_after, alert.diff_type, alert.primary_source_url, alert.importance_score,
      ]
    );
  }
  console.log(`Seeded ${SAMPLE_ALERTS.length} sample alerts`);

  // Seed THC regulations
  for (const reg of THC_REGULATIONS) {
    await client.query(
      `INSERT INTO thc_regulations (product_category, max_thc_level, measurement_method, effective_date, source_url, is_current)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [reg.product_category, reg.max_thc_level, reg.measurement_method, reg.effective_date, reg.source_url, reg.is_current]
    );
  }
  console.log(`Seeded ${THC_REGULATIONS.length} THC regulations`);

  // Create a default anonymous user
  await client.query(
    `INSERT INTO users (device_id, notification_preference, language)
     VALUES ('default', 'critical_only', 'ja')
     ON CONFLICT (device_id) DO NOTHING`
  );
  console.log('Seeded default user');

  await client.end();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

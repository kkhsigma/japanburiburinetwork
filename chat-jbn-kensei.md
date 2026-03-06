# ChatGPT Conversation Export
> Exported on 2026/3/6 12:26:13 — 14 turns

---

## User

i want to create an app called japanese buriburi network, aka JBN, app where it collect all the latest news regarding sometyhjing like CBN, and other kinds of i would say legal psychedelic, weed in japan. i want to update user with the latest news including when it will get law enforcement, and latest product moreover detailed feedback of the product, trip blog, and so on.

---

## ChatGPT

JBN（Japanese Buriburi Network）めっちゃ “Burilarのテーマを、合法グレー地帯じゃなく「合法・規制の変化が激しい領域」に最適化” って感じで相性いいです。

ただこの領域は 法律・指定薬物・THC基準が頻繁に更新されるので、JBNのコアは「ニュース収集」より “規制の差分検知 + 一次情報リンク” に寄せるのが勝ち筋です。

1) JBNが追うべき「情報カテゴリ」設計（最重要）
A. 規制・法執行（一次情報が最優先）

厚労省（MHLW）の告知・Q&A・省令・パブコメ

「指定薬物（Designated Substances）」の更新（PDF/Excelで出る） 
Ministry of Health, Labour and Welfare
+1

大麻取締法・麻薬及び向精神薬取締法の施行段階（例：2025/3/1施行の内容など） 
Ministry of Health, Labour and Welfare

“使用罪” など刑事罰の変更点（報道ソースも参照） 
The Japan Times

JBNの価値：
「結局CBN/CBDは今どう扱われるの？」「どの成分が指定薬物化しそう？」を、公式文書→要点→影響→施行日→対象製品タイプの順で即読みにする。

B. 成分・製品の“合法性ライン”（THC基準が鬼）

日本は CBD等の扱いが “THC残留” を軸にどんどん厳密化していて、報道でも「世界で最も厳しい水準」級として扱われています 
The Japan Times
。
なのでJBNは「おすすめ」より先に、

THC基準・試験方法・製品カテゴリ別の扱い
を常に最新化するのが信用になります。制度変更の解説記事も参考にはなる 
DIA Global Forum
+1
。

C. “合法っぽい新規カンナビノイド”の規制強化ウォッチ

日本は体感として「流行 → 健康被害/社会問題 → 指定薬物化」が速い。実際にHHCH等が指定薬物として問題化・規制された流れが報道されています 
Mainichi
+1
。
さらに CBNが規制対象になり得るという業界報道も出ています（この手は一次情報で裏取り必須） 
HempToday®
。

D. 研究・健康（医療情報は慎重に）

新しい安全性評価（例：欧州EFSAのCBD摂取量の暫定目安のニュースなど） 
Reuters

医薬品（カンナビノイド医薬）の制度・市場動向 
DIA Global Forum
+1

※ここは「治る/効く」断定は避けて、研究の要約 + 限界 + 注意点で。

E. 体験談（レビュー/旅行/ブログ）

体験談はJBNの滞在時間を伸ばせるけど、違法使用を助長しない線引きが必要。

「購入方法」「キマり方」「抜け道」みたいな投稿はNG寄り（アプリ規約で弾く）。

2) JBNの差別化：ニュースアプリじゃなく「差分検知アラート」

あなたのBurilar文脈のまま、JBNはこういう出し方が強いです：

差分カード：「昨日まで合法扱いだった論点が、今日この一文で変わった」

施行日カウントダウン：「○月○日施行／猶予期間／パブコメ締切」

影響マップ：「オイル/粉末/食品/電子タバコ等、どのカテゴリに波及？」

一次情報リンク固定：厚労省PDF/告示/ページを最上段に

これやると「まとめサイト」じゃなく「意思決定インフラ」になります。

3) MVP（v0 / v1 / v2）おすすめ実装方針
v0（最速で出す：2〜4週間で形）

収集：RSS + 手動追加（厚労省、主要メディア、業界団体）

表示：カテゴリ別タイムライン

LLM要約：3行要約 + 重要日付 + 対象成分 + 一次情報リンク

通知：キーワードウォッチ（CBN / CBD / THC / 指定薬物 / 省令 / パブコメ）

v1（JBNらしさ＝差分検知を自動化）

監視対象ページのスナップショット保存（厚労省ページ、指定薬物リスト）

差分抽出（段落単位）→「重要度スコア」→ユーザーにだけ通知

「法令・行政」タブは 一次情報→解説→影響 の順で固定

v2（コミュニティ＋レビュー＋旅行を“安全に”拡張）

製品DB：銘柄・成分表・検査証明（COA）・販売停止/注意情報

レビュー：効果ではなく 味/匂い/体感以外のUX/梱包/価格/継続性中心に設計

旅行：海外での規制も絡むので、国別ページ（ただし違法行為ハウツーは排除）

4) 事故らないための「運用ポリシー」（ここが9割）

この領域はアプリが伸びても、法的・ストア審査・レピュテーションで死にやすいです。最初から：

免責：医療/法律アドバイスではない

一次情報優先：厚労省等のリンクを必ず添付

違法助長禁止：購入方法・使用法・検出回避・密輸などは投稿/生成しない

年齢ゲート & コンテンツフィルタ

通報→即時非表示のモデレーション導線

これで「規制ウォッチ/消費者安全/産業インフラ」に寄せられます。

5) すぐ作れる “JBNの情報カード” フォーマット（テンプレ）

見出し：何が起きた

重要日付：施行日 / 締切 / 発表日

対象：成分 / 製品形状 / 行為（製造・輸入・販売・所持・使用など）

要点3つ

影響（ユーザー/事業者/店舗）

一次情報リンク

信頼度（公式=高 / 報道=中 / 業界噂=低）

もし「最初に監視するソース」をJBN用に20〜30個に絞るなら、**厚労省（指定薬物リスト、制度施行ページ）**を軸に、次に全国紙/業界紙、最後にコミュニティ…の順が鉄板です。
必要なら、その“最初の監視リスト（日本語・URL付き）”と「カテゴリ分け（DBスキーマ案）」を、JBN向けにそのままコピペできる形で作るよ。

---

## User

もっと詳細に詰めていこう。
まず、１について

---

## ChatGPT

OK。まず 「1. JBNが追うべき情報カテゴリ設計」 をかなり具体的に詰めます。
ここは JBNのコア設計なので、最初に情報構造を間違えると後で全部作り直しになります。

結論から言うと、JBNのカテゴリは ニュース分類ではなく「意思決定分類」 にする必要があります。

つまり

普通のニュースサイト
→ 政治 / 社会 / 科学

JBN
→ 合法性 / 成分 / 市場 / 体験

この4レイヤーで設計します。

1. JBN 情報カテゴリ設計（詳細）
Layer 1
Legal / Regulation（最重要）

これは JBNのコア機能です。
ここが他のサイトと一番差別化できます。

ユーザーが一番知りたいのは

「結局これ合法なの？」

なので

このカテゴリは さらに5つに分解します。

1-A 法律変更

例

大麻取締法改正

麻薬及び向精神薬取締法

医療大麻制度

使用罪

施行日

DB構造

LawUpdate

title
law_name
change_type
announcement_date
effective_date
summary
impact_level
source

impact_level

LOW
MEDIUM
HIGH
CRITICAL
1-B 指定薬物更新

これは 日本のカンナビノイド界隈で最重要

例

HHCH

THCP

HHC

HHC-O

これが指定薬物になると

即違法

だからJBNでは

「指定薬物ウォッチャー」

を作ります。

DB

DesignatedSubstance

name
chemical_family
designation_date
previous_status
legal_status
source
1-C THC基準

日本はここが世界一厳しい。

例

THC 0.001%
THC検出基準
食品 / オイル / VAPE

DB

THCRegulation

product_category
max_thc_level
measurement_method
effective_date
source
1-D 行政通達

法律じゃなくても重要

例

厚労省通知

消費者庁注意喚起

警察コメント

DB

GovernmentNotice

agency
title
date
summary
risk_level
source
1-E 取締ニュース

例

CBDショップ摘発

違法商品押収

警察警告

DB

EnforcementEvent

location
date
product_type
chemical
charges
source
Layer 2
Compound Intelligence

ここは 成分データベース

ユーザーは

「CBNって何？」
「THCV合法？」

これを調べる。

DB

Compound

name
category
natural_or_synthetic
effects_summary
legal_status_japan
legal_status_global
risk_level
first_detected
notes

例

CBD
CBN
CBG
THCV
HHC
HHCP
THCP
Layer 3
Product Intelligence

日本はカンナビノイド製品が大量にある

例

グミ

オイル

VAPE

花

カプセル

DB

Product

name
brand
compound
product_type
thc_level
price
country
lab_test
legal_status
Layer 4
Experience / Trip Logs

これはコミュニティ部分

ただし

違法助長にならない設計

にする必要がある。

レビュー内容

OK

taste

smell

packaging

relaxation level

sleep quality

NG

ハイの方法

違法使用

検出回避

DB

TripReport

product_id
experience_type
duration
rating
notes
country
Layer 5
Market / Industry

これは意外と面白い。

例

CBD市場

新ブランド

規制の影響

投資

DB

MarketNews

company
announcement
date
impact
source
2
JBNで一番重要な概念

ここはかなり重要。

JBNは

普通のニュースアプリではなく

Legal Intelligence System

にする。

つまり

ニュース

ではなく

合法性トラッカー

3
JBNホーム画面

おすすめ構造

Home

Legal Alerts
Regulation Changes
Compound Updates
Product News
Community Reports
4
JBNの最大の差別化

普通のニュース

CBDニュース

JBN

CBD

LEGAL STATUS
SAFE LEVEL
RECENT LAW CHANGE
RISK SCORE
5
JBNのRisk Score

ユーザーが一瞬で理解できるように

SAFE
LOW RISK
MEDIUM
HIGH
ILLEGAL

これをAIが計算

6
最初に追うべき成分（重要）
CBD
CBN
CBG
CBC
CBL
THCV
THCP
HHC
HHCH
HHCP
H4CBD
7
JBNの最大ユーザー層

日本だと

1

CBDユーザー

2

合法カンナビノイドユーザー

3

研究者

4

投資家

8
JBNがバズるポイント

日本では

規制が急すぎる

だから

「指定薬物アラート」

はかなり需要ある。

次に詰めるべき超重要な部分

ここが実は一番大事です。

JBNの情報収集システム

つまり

どこからニュースを取るか

これを設計しないと

アプリが成立しません。

次に詰めるべきは

2. JBN情報ソース設計

ここを作ると

ほぼプロダクトの骨格が完成します。

希望があれば次は

JBNの情報ソース30個

AIニュース収集パイプライン

法改正差分検知アルゴリズム

まで一気に設計します。
ここが Burilar型プロダクトの核心部分です。

---

## User

JBNの情報ソース30個

AIニュース収集パイプライン

法改正差分検知アルゴリズム

---

## ChatGPT

いい。ここはJBNの心臓部。
しかもこの領域は、2025年12月12日に大麻由来製品のTHC残留限度値が施行済みで、2026年3月4日にも厚労省が新たな指定薬物4物質を公布しているので、JBNは「雑にニュースを集めるアプリ」ではなく、制度変更を最速で拾って、意味のある差分だけ通知するプロダクトとして設計した方が強いです。加えて、厚労省の現行ページには CBNが指定薬物に指定された場合の継続使用手続の案内が載っており、少なくともJBNではCBNを「単なる体験成分」ではなく、規制ウォッチ対象の最上位として扱うべきです。 
Ministry of Health, Labour and Welfare
+3
NCD MHLW
+3
Ministry of Health, Labour and Welfare
+3

1. JBNの情報ソース30個

結論として、30個を 5階層 に分けます。

Tier 1: 規制の一次情報

Tier 2: 準一次情報・行政周辺

Tier 3: 国内報道

Tier 4: 業界・専門メディア

Tier 5: コミュニティ・商品・レビュー

JBNでは、Tier 1 > Tier 2 > Tier 3 > Tier 4 > Tier 5 の順で信用スコアを付けるべきです。
特に日本では、THC残留限度値、指定薬物、省令施行日、輸入実務は公式文書でないと危ないです。実際、厚労省はCBD/CBN/CBG製品の輸入確認、形状区分、分析書の要件まで具体的に示しています。 
NCD MHLW
+2
NCD MHLW
+2

Tier 1: 規制の一次情報 12個

これはJBNの最重要ソース群。

厚生労働省「報道発表資料 医薬局」
指定薬物追加、麻薬指定、通知発出の最速監視元。 
Ministry of Health, Labour and Welfare
+1

厚生労働省「薬物乱用防止に関する情報」総合ページ
CBN関連案内や重要ページへのハブになる。 
Ministry of Health, Labour and Welfare

厚生労働省「指定薬物一覧（PDF）」
物質の正本。JBNはここを正規データソース化する。 
Ministry of Health, Labour and Welfare

厚生労働省「薬事審議会（指定薬物部会）」
“施行前の予兆” を拾える。議事録・開催案内は差分検知対象。 
Ministry of Health, Labour and Welfare
+1

厚生労働省「大麻取締法及び麻薬及び向精神薬取締法 改正施行ページ」
施行段階、栽培区分、0.3%種子基準などの制度整理元。 
Ministry of Health, Labour and Welfare

厚生労働省「Δ9-THC残留限度値・分析法通知PDF」
THC限度値ロジックの中核。 
Ministry of Health, Labour and Welfare

麻薬取締部「CBDオイル等のCBD関連製品の輸入について」
輸入可否、非該当性確認、対象成分の整理。 
NCD MHLW
+1

麻薬取締部「CBD関連製品輸入手引きPDF」
形状分類、分析書、ロット、LOQ/LODまで載る実務ソース。 
NCD MHLW

麻薬取締部「区分及び具体例PDF」
オイル・粉末・水溶液・その他の分類に必須。 
NCD MHLW

厚労省 個別注意喚起ページ（THC検出製品公表）
実際にどの製品が問題化したかを見る。 
Ministry of Health, Labour and Welfare

e-Gov / パブリックコメント（省令案）
“指定前”の最強ソース。CBNのような案件はここが超重要。
※今回の検索ではe-Gov自体は直接開いていないが、厚労省・業界報道の双方が意見募集を参照している。JBN実装では必須クロール先に入れるべき。 
Wellness Daily News
+1

官報
最終的な公布・施行確認の最終ソース。
※今回の検索では官報本文は未取得だが、JBNの法令確定フラグは官報確認後に立てる設計が安全。これは実装方針としての提案。

Tier 2: 準一次情報・行政周辺 6個

政府広報オンライン
一般向けに改正法の意味を平易に確認できる。 
Gov Online
+1

消費者庁 長官記者会見要旨
合法/違法の消費者目線整理や注意喚起の補助線になる。 
Japan's Cabinet Office
+1

消費者庁 消費者安全関連ページ
“大麻グミ” 型の注意喚起を追う。 
Japan's Cabinet Office

警察庁 白書・注意喚起
流通実態、SNS悪用、薬物犯罪文脈の監視。 
National Police Agency

あやしいヤクブツ連絡ネット
個人輸入、相談、通報、健康被害系の周辺情報。 
Yakubutsu
+2
Yakubutsu
+2

都道府県・東京都の買い上げ調査／注意喚起
地方発で先に火が出ることがある。東京都調査は業界でも大きな材料になっている。 
Wellness Daily News
+1

Tier 3: 国内報道 5個

日本経済新聞
大手企業や制度変更の経済インパクト監視向け。
※今回の検索では日経本文未取得。JBN運用上の推奨。

Reuters Japan / Reuters
大企業事件や規制影響の対外的整理に強い。サントリー元CEO件などのように市場インパクトが大きい。 
Reuters

AP News
日本発事案の英語圏整理。海外向け見せ方を比較できる。 
AP News

The Japan Times
英語での日本法改正解説に使いやすい。
※今回のターンでは本文再取得していないので、JBN候補としての提案。

毎日新聞 / NHK / 朝日 / 読売のいずれか
摘発・健康被害・社会面の一次報道補完。
※今回のターンでは直接本文未取得。JBN候補としての提案。

Tier 4: 業界・専門メディア 5個

Wellness Daily News / Wellness News
CBN規制、東京都調査、業界反応がかなり早い。2026年2月時点でCBN規制の延期報道も出している。 
Wellness Daily News
+2
Wellness Daily News
+2

CBD Library
事業者向けニュース集約に向く。 
note（ノート）
+1

Cannabis Insight Japan
国内外の週刊まとめ向け。 
CANNABIS INSIGHT

CBD部
日本語コミュニティ寄り。イベントも拾いやすい。 
CBD部

MAJICなど業界団体の発表
事業者団体の声明・会見を拾える。 
MAJIC

Tier 5: コミュニティ・商品・レビュー 2個 + 2系統

楽天・Amazon等のEC商品ページ
成分訴求、表現、レビュー変化、販売停止を監視。
例としてNaturecanはCBN販売終了告知を出している。 
楽天市場
+1

ブランド公式アナウンス / 展示会・イベント
製品終売、自主回収、分析対応、展示会の出展カテゴリを拾う。JBNでは商品DB更新に使う。例としてJIHEやTHC分析サービス開始の報道がある。 
JIHE 2026
+1

2. AIニュース収集パイプライン

ここは Burilar流の差分検知パイプライン にする。

全体像

Source ingest → Normalize → Classify → Verify → Diff → Score → Summarize → Notify

JBNでは「記事を集める」より、
“規制対象 / 施行日 / 影響製品 / 信頼度” を構造化する のが重要です。

Step 1. Source ingest

取得方法をソースごとに分ける。

RSSがあるものはRSS

ないものはHTMLクロール

PDFは定期取得

表や一覧はファイル差分

パブコメは案件ページ単位で監視

ECやブランドは商品ページ・カテゴリページを監視

設計ポイント
JBNでは URL をそのまま保存するだけでは弱い。
必ず source_type を持つ。

例:

official_html

official_pdf

committee_page

news_article

industry_article

product_page

review_page

forum_post

Step 2. Normalize

各ソースを共通スキーマに落とす。

最低限この形。

doc_id

source_name

source_tier

fetched_at

published_at

title

body_text

canonical_url

content_type

jurisdiction

language

raw_hash

さらにJBN専用で

compounds_detected

product_forms_detected

legal_actions_detected

agencies_detected

dates_detected

risk_signals

を抽出する。

compounds_detected 例

CBD

CBN

CBG

HHC

HHCH

THCP

Δ9-THC

THCA

legal_actions_detected 例

指定薬物追加

麻薬指定

パブコメ開始

公布

施行

注意喚起

行政調査

回収

終売

輸入確認手続変更

Step 3. Classify

LLMで雑に分類するのでなく、ルール + LLM併用にする。

まずルールベース

たとえばタイトルや本文に

「指定薬物」

「省令」

「公布」

「施行」

「パブリックコメント」

「麻薬として指定」

「残留限度値」

「非該当性確認」

「輸入」

「買い上げ調査」

があれば、規制カテゴリの候補を立てる。

次にLLMで補正

LLMには最終的にこういう JSON を返させる。

JSON
{
  "category_primary": "regulation",
  "category_secondary": "designated_substance",
  "jurisdiction": "Japan",
  "compounds": ["CBN", "CBD"],
  "forms": ["oil", "gummy"],
  "action": "planned_designation",
  "confidence": 0.92,
  "effective_dates": ["2026-02-xx"],
  "summary_ja": "..."
}
Step 4. Verify

ここがJBNの信用を決める。

同じニュースでも、Tier 1 が確認できるまで確定扱いしない。

ステータスは3段階。

rumor

reported

official_confirmed

例:

業界紙だけ出た → reported

厚労省ページ or 官報確認 → official_confirmed

2026年3月6日時点のCBNみたいな案件は、JBNでは
「規制方針あり / 施行未確定 / 高注意」
のように出すのが安全です。厚労省の総合ページには「CBNが指定薬物に指定された場合」の案内があり、業界報道では2月中旬予定の見送りが報じられているため、JBN上の表記は “確定済み違法” ではなく “pending high-risk” が妥当です。 
Ministry of Health, Labour and Welfare
+1

Step 5. Diff

これがJBNの本丸。

比較対象は3種類。

前回取得した同一URL

同一トピックの直近公式文書

同一物質の最新規制ステータス

差分の種類は

text_added

text_removed

status_changed

date_changed

threshold_changed

scope_changed

たとえば

「CBNが指定薬物に指定された場合」ページ追加

THC限度値の表記変更

施行日が確定

製品形状区分が追加

指定薬物一覧PDFに新物質追加

は別イベントとして出す。

Step 6. Score

通知する価値があるかを数値化。

例のスコア式

importance_score = source_score + legal_score + date_score + user_match_score + novelty_score

source_score

Tier1: 40

Tier2: 25

Tier3: 15

Tier4: 10

Tier5: 5

legal_score

指定薬物追加: +40

麻薬指定: +40

公布: +35

施行日確定: +35

THC限度値変更: +30

回収/注意喚起: +25

レビュー増加: +5

date_score

施行日が30日以内: +20

施行日が7日以内: +35

user_match_score

ユーザーがCBNフォロー中: +15

VAPEだけフォロー: その形状に関係する場合 +10

novelty_score

完全新規: +20

既知案件の軽微修正: +3

80点以上でPush、50点以上でDigest、49点以下はDB保存のみ。

Step 7. Summarize

要約は “記事要約” ではなく 意思決定要約 にする。

JBNカードは固定フォーマットがいい。

何が起きたか

いつ効くか

何が対象か

何が変わったか

ユーザーへの影響

事業者への影響

一次情報

信頼度

現在のステータス

Step 8. Notify

通知は3層。

1. Flash Alert

重大な制度変更だけ

指定薬物追加

施行日確定

麻薬指定

THC基準変更

2. Watchlist Update

フォロー物質の状態変化

CBN

CBD

HHC系

THCV

3. Daily / Weekly Digest

今週の法改正

今週の行政・摘発

今週の新製品

今週の口コミ急増

3. 法改正差分検知アルゴリズム

ここは普通のスクレイピングでは足りない。
JBNは「文面差分」ではなく「法的意味差分」を取る必要がある。

アルゴリズムの基本思想

差分には3種類ある。

A. 表面差分

文言が変わっただけ

句読点修正

レイアウト変更

PDF更新日だけ変更

これは通知しない。

B. 構造差分

重要フィールドが変わった

表の行追加

施行日追加

物質名追加

しきい値変更

これは通知候補。

C. 意味差分

法的効果が変わった

“検討中” → “公布”

“公布” → “施行”

“対象外” → “対象”

“0.1 ppm” → “10 ppm”

“油脂のみ” → “グミ等その他も対象”

これは即通知。

入力データ

ソースごとに DocumentSnapshot を作る。

JSON
{
  "doc_id": "mhlw_cbd_import_page",
  "fetched_at": "2026-03-06T01:00:00+09:00",
  "title": "...",
  "plain_text": "...",
  "tables": [...],
  "entities": {
    "compounds": ["CBD", "CBN", "Δ9-THC"],
    "agencies": ["厚生労働省"],
    "actions": ["注意喚起", "輸入確認"],
    "dates": ["2024-12-12"]
  },
  "legal_state": {
    "status": "official_guidance",
    "effective_dates": ["2024-12-12"],
    "thresholds": {
      "oil_fat_powder": "10ppm",
      "aqueous_solution": "0.1ppm"
    }
  },
  "raw_hash": "..."
}
3-1. Snapshot diff

まず同一ソースの前回版と比較する。

title hash

body hash

normalized text hash

table hash

ここで変化がなければ終了。

3-2. Semantic chunking

本文を意味単位に分ける。

分割単位:

見出し

箇条書き

表の行

注意書き

FAQ項目

法令系ページは段落ではなく
「条項」「表の1行」「注意書き1ブロック」
で持つ方が強い。

3-3. Legal entity extraction

各チャンクから以下を抽出。

物質名

同義語

行政行為

効力発生日

対象行為

対象形状

数値基準

例外条件

例:
「令和6年12月12日以降、Δ9-THCの含有量が残留限度値を超えて検出されたものは…麻薬として取り扱われます」
なら

JSON
{
  "compound": "Δ9-THC",
  "action": "treated_as_narcotic_if_over_limit",
  "effective_date": "2024-12-12",
  "scope": "all cannabis-derived products",
  "threshold_type": "residual_limit"
}

この抽出は公式ページで実際に可能です。 
NCD MHLW

3-4. State machine 化

JBNは各物質・各ルールを状態遷移で持つ。

物質の状態例

unknown

under_review

public_comment_open

scheduled_for_designation

promulgated

effective

rescinded

製品の状態例

marketed

watchlisted

investigated

noncompliant

sales_suspended

recalled

規則の状態例

draft

guidance_only

official_notice

law_enforced

CBNなら、2026年3月6日時点では
under_review / high-risk / pending
のように持つのが自然。厚労省ページが継続使用手続を案内している一方、業界報道では施行見送りとされているからです。 
Ministry of Health, Labour and Welfare
+1

3-5. Meaning diff 判定

前回状態と今回状態を比較して、イベント化する。

例:

JSON
{
  "entity_type": "compound",
  "entity": "CBN",
  "previous_state": "public_comment_open",
  "current_state": "scheduled_for_designation",
  "event_type": "status_upgraded",
  "severity": "high"
}

または

JSON
{
  "entity_type": "threshold",
  "entity": "Δ9-THC in aqueous_solution",
  "previous_value": "0.5ppm",
  "current_value": "0.1ppm",
  "event_type": "threshold_tightened",
  "severity": "critical"
}
3-6. False positive 抑制

法令差分検知は誤報が一番危ない。
だから以下を入れる。

ルール1

数値・日付・対象語が変わっていない変更は原則無視

ルール2

“予定”“検討”“案” を “確定” にしない

ルール3

Tier 4単独では違法判定を更新しない

ルール4

物質名の別表記を統一

delta-9 THC

Δ9-THC

THC

tetrahydrocannabinol

ルール5

表の1行追加は重大扱い
指定薬物一覧PDFの1行追加は、そのまま重大イベント。厚労省は2026年1月21日版の一覧PDFを公開しており、2026年3月4日にはさらに4物質追加を公表しているので、JBNではPDF/通知の双方を監視すべきです。 
Ministry of Health, Labour and Welfare
+1

3-7. 出力

最終的なイベント出力はこう。

JSON
{
  "event_id": "evt_20260304_mhlw_designated_4",
  "title": "危険ドラッグの成分4物質を新たに指定薬物に指定",
  "category": "regulation.designated_substance",
  "severity": "critical",
  "status": "official_confirmed",
  "published_at": "2026-03-04",
  "effective_at": "2026-03-14",
  "compounds": ["...4物質名..."],
  "impact_scope": ["manufacture", "import", "sale", "possession", "use"],
  "summary_ja": "...",
  "primary_source": "厚生労働省",
  "source_tier": 1
}

これは実際に現在の厚労省発表から作れるタイプのイベントです。 
Ministry of Health, Labour and Welfare

4. JBN向けの実装優先順位

ここはかなり大事。

v0

Tier 1だけ監視

PDF/HTMLの取得

物質名辞書

施行日・数値・行為の抽出

手動レビュー付き通知

v1

Tier 2, 3追加

同一トピッククラスタリング

official_confirmed / reported の状態管理

ユーザー別ウォッチリスト

v2

商品DB

ブランド発表

ECレビュー

trip/blogの安全設計付きコミュニティ

“この商品は今どの法的リスク帯か” を表示

5. 今の時点でのおすすめ

JBNは最初から30ソース全部を均等に見るより、まずはこの 10個だけ で始めるのがいい。

厚労省報道発表

指定薬物一覧PDF

指定薬物部会

改正法施行ページ

THC残留限度値通知

麻薬取締部CBD輸入ページ

CBD輸入手引きPDF

区分具体例PDF

消費者庁会見要旨

Wellness News

これで 法改正・輸入実務・注意喚起・業界反応 の骨格がほぼ揃う。

次はそのまま
JBNのDBスキーマ（tables設計） と
画面設計（Home / Alert / Compound / Product / Law Timeline）
まで落とし込める。

---

## User

2) JBNの差別化：ニュースアプリじゃなく「差分検知アラート」
3) MVP（v0 / v1 / v2）おすすめ実装方針
4) 事故らないための「運用ポリシー」（ここが9割）
次これ、これはもう考えた？

---

## ChatGPT

うん、かなり考えてる。
ただ、まだ 概念レベル だったから、ここで JBNとして実装判断できる粒度 まで落とすべき段階。

この3つは実は全部つながっていて、

差別化

MVP

運用ポリシー

を別々に考えると失敗する。
JBNはこの領域上、「何を出すか」より「何を出さないか」 の設計が超重要だから。

なので、ここでは3つを一体で詰める。

2) JBNの差別化
ニュースアプリじゃなく「差分検知アラート」

結論からいうと、JBNの差別化は

“情報量” ではなく “意思決定価値”

です。

普通のニュースアプリは

新しい記事が出た

まとめた

おすすめした

で終わる。

でもJBNでユーザーが知りたいのはそうじゃなくて、

これ今合法なのか

いつ危なくなるのか

何が変わったのか

自分が見てる成分や製品に影響あるのか

公式にはどこまで確定してるのか

ここ。

つまりJBNの本質は
news aggregation ではなく regulatory intelligence。

JBNが提供するべき“差分”は5種類
1. Status Diff

状態が変わった差分

例

検討中 → パブコメ

パブコメ → 公布予定

公布 → 施行

取扱注意 → 実質販売停止

合法グレー → 指定薬物

これは最重要。

2. Date Diff

日付が変わった差分

例

施行日確定

施行日延期

パブコメ締切追加

猶予期間終了日追加

この領域では、日付差分だけでも通知価値が高い。

3. Scope Diff

影響範囲が変わった差分

例

オイルだけ対象 → グミも対象

国内販売のみ影響 → 輸入も影響

一部成分だけ → 類似成分も含む

ユーザーは本文を全部読まないので、JBNはここを構造化して出すべき。

4. Threshold Diff

基準値差分

例

THC残留基準の変更

測定方法の変更

製品カテゴリごと基準追加

これも「読むニュース」じゃなく「運用判断」に直結する。

5. Sentiment / Field Diff

市場や現場の変化

例

ブランドが終売告知

レビュー急増

ネガティブ報告増加

店舗が自主回収

展示会で急にCBN出展が減る

これは規制そのものではないが、予兆検知として重要。

JBNのユーザー体験は「記事一覧」ではなく「変化一覧」

ホームで見るべきものはこれ。

Home上位

今日の重大変化

7日以内に効くルール変更

フォロー物質の状態変化

今週の新製品 / 終売 / 注意喚起

信頼度別まとめ

つまりUIとしては

Feedではなく Alert Dashboard

にするべき。

JBNの差別化メッセージ

外向けに一言で言うなら

“JBN is not a cannabis news app. It is a Japan regulatory change radar for cannabinoids and adjacent products.”

日本語なら

「ニュースを集めるアプリではなく、日本のカンナビノイド規制変化を追跡するレーダー」

JBNが勝てる理由

この市場で強いのは、
記事を一番多く集めた人じゃない。

「昨日と今日で何が変わったか」を最短で説明できる人。

Burilarっぽく言うと

記事単位ではなく

状態遷移単位

差分単位

意思決定単位

で出すのがJBN。

3) MVP（v0 / v1 / v2）おすすめ実装方針

ここはかなり大事。
JBNは最初からコミュニティや商品レビューまで全部やると、ほぼ確実に散る。

順番としては

v0 = 規制レーダー

v1 = 物質・製品レイヤー追加

v2 = コミュニティ / 商品DB / 体験談

が自然。

v0
「規制差分検知」だけで成立する最小プロダクト
目的

JBNが本当に価値を出せるか検証する。

ユーザー価値

重要な法改正だけ見逃さない

公式情報ベースで変化が分かる

自分の見ている成分だけ追える

必須機能

監視対象ソース10個前後

差分抽出

イベント生成

3行要約

物質別ウォッチリスト

通知

信頼度ラベル

画面

Home

Alert detail

Compound watchlist

Source viewer

Settings

通知対象

指定薬物追加

パブコメ開始

公布

施行日確定

THC基準変更

行政注意喚起

まだやらないもの

商品レビュー

EC連携

trip report

投稿コミュニティ

市場分析ダッシュボード

v0の成功条件

「JBNを毎日開く」ではなく

“重要な変更が来たときに絶対見る”
になれるか

つまり daily active product ではなく
mission-critical alert product として成立するかを見る。

v1
「規制 + 物質 + 製品リスク」まで広げる
目的

ユーザーが「ニュース」ではなく「対象物」ベースで見られるようにする。

追加機能

Compound page

Product type page

Legal state machine

reported / official_confirmed の二層表示

関連ニュースクラスタ

タイムライン表示

たとえばCBNページ

現在の法的ステータス

直近90日の動き

関連公式文書

業界報道

関連商品カテゴリ

リスク帯

たとえばProduct Typeページ

oil

gummy

vape

powder

capsule

ごとに

規制影響

注意喚起

検査関連

新商品

終売

を表示。

v1の価値

ここでJBNは初めて
“調べるためのアプリ” になる。

v0は受動的通知。
v1は能動的調査。

v2
「市場・商品・コミュニティ」まで広げる
目的

JBNをインフラからプラットフォームへ拡張する。

追加機能

Product DB

ブランドページ

レビュー投稿

trip / experience logs

販売停止 / 回収 / 終売ウォッチ

トレンド分析

ユーザー生成コンテンツのモデレーション

ただし大前提

v2でも主役はコミュニティではなく
Regulatory context付きコミュニティ

ただのレビューサイトにしたら終わる。

JBN上のレビューは常に

その製品カテゴリの規制状態

成分リスク

注意喚起有無

信頼度

とセットで出すべき。

v2の成功条件

投稿が増えることではない

JBNの文脈の中で投稿が意味を持つこと

どこで出すべきか

現実的には

v0公開

2〜4週間で使い方観察

次にv1

v2はかなり後

がいい。

この領域は規制変更が本体なので、
最初からレビュー機能に行くと、価値の重心がズレる。

4) 事故らないための運用ポリシー
ここが9割

これは本当にそう。
JBNで一番難しいのは技術じゃなくて 運用設計。

なぜならこの領域では

法的リスク

プラットフォーム規約リスク

誤情報リスク

違法助長リスク

レピュテーションリスク

が全部同時に来るから。

なので、JBNは最初から
“何を載せるか” ではなく “何を禁止するか” を明文化しないといけない。

運用ポリシーの基本原則
原則1

JBNは購入・使用を推奨するサービスではない

位置づけは

規制情報

製品情報

注意喚起

市場監視

一次情報整理

に置く。

原則2

法的ステータスは常に段階表示する
禁止。

「合法」

「違法」

の二択だけで雑に出すこと。

代わりに

official_confirmed

reported

under_review

pending

unclear

high-risk

のように出す。

原則3

一次情報を最上位に置く
JBN内で最も大事なUI原則。

どのページにも

primary source

published date

last checked

confidence level

を出す。

原則4

違法行為・回避行為・抜け道の助長禁止
これは絶対。

NG例

どうやってハイになるか

どの製品ならバレないか

検査回避

個人輸入の抜け道

税関回避

所持・使用のリスク回避

違法成分の代替提案

JBNがここに触れた瞬間、かなり危ない。

原則5

医療効果の断定禁止
OKなのは

研究の紹介

論文の要約

安全性注意

一般的な市場・制度情報

NGなのは

治る

効く

不眠に確実

不安にベスト

医薬品的効果の断定

原則6

UGCは事前/事後モデレーション前提
v2で投稿を入れるなら必須。

投稿は少なくとも

自動フィルタ

リスクワード検知

通報

一時非表示

手動確認

を入れる。

原則7

商品ページにも安全帯を明示する
たとえば各商品に

current legal confidence

source coverage

last verified

red flags

を表示。

単に「人気商品」みたいな出し方は危険。

原則8

“未確定情報” は未確定と分かるUIにする
たとえば

予定

見込み

業界観測

事業者発表のみ

官報未確認

を明確に区別する。

JBNで禁止した方がいい投稿カテゴリ

かなり重要なので明確に切る。

完全NG

違法使用の方法

摂取量アドバイス

強い体感を求める指南

所持/輸入回避

検査回避

未成年向け訴求

他人にすすめる使用指南

危険な混用アドバイス

条件付きOK

味

匂い

梱包

購入後のカスタマー対応

終売情報

公式分析書の有無

ラベルの分かりやすさ

一般的感想

慎重扱い

眠気

リラックス感

体感

継続性

これは薬効訴求や違法助長に近づきやすいから、文言制限が必要。

JBN内部のラベル設計

ポリシーを運用に落とすなら、投稿や記事にラベルを持たせる。

content_safety_label

safe

caution

restricted

blocked

legal_confidence_label

official

high-confidence

medium-confidence

low-confidence

unverified

intent_label

regulation

safety

market

review

research

prohibited

こうするとモデレーションしやすい。

ストア・対外的な見せ方

JBNは外向き説明も大事。

見せ方としては

cannabis app

get high app

legal weed finder

みたいに見えると危ない。

むしろ

regulatory monitoring

consumer safety intelligence

Japan compliance tracker

product transparency platform

の方向に寄せるべき。

まとめると

はい、考えてはいた。
でも今の段階で言うと、まだ「方向性」だったので、今みたいに

JBNの本質は差分検知アラート

v0は規制通知だけに絞る

v1で物質・製品の状態管理

v2でコミュニティを慎重に追加

運用は最初から強く制限する

まで落とし切るのが正解。

次にやるべきなのはかなり明確で、
この方針をそのまま機能一覧に落とすこと。
つまり次は

JBNの画面設計と機能一覧（Home / Alert / Compound / Product / Admin / Moderation）

を詰める段階。

---

## User

JBNの画面設計と機能一覧（Home / Alert / Compound / Product / Admin / Moderation）

これめちゃくちゃ詳細に詰めよう

---

## ChatGPT

いい。ここはかなり重要。
この段階では「画面名を並べる」ではなく、JBNというプロダクトの行動導線そのものを設計するつもりで詰めたほうがいい。

JBNは普通のメディアでも、普通のレビューアプリでもなく、

規制変化を見逃さない

その変化が何に影響するか分かる

未確定情報と確定情報が分かる

危ない投稿や危ない見せ方を制御できる

という、かなり特殊なUI要件がある。
だから今回は、単なる画面一覧ではなく、各画面の役割 / 主要情報 / コンポーネント / 操作 / 状態 / 管理画面まで 詳細に詰める。

全体設計の前提

まずJBNの画面は、機能別ではなく 意思決定フロー別 に分ける。

ユーザーの行動は基本この流れ。

何か変化があったと知る

その変化の確度と重要度を確認する

自分が気にしている成分・製品への影響を見る

必要なら元情報に飛ぶ

継続的にウォッチ対象に登録する

なので主要画面はこの6つでよい。

Home

Alert

Compound

Product

Admin

Moderation

ただし実際には、その下にかなり細かいサブ画面が必要になる。

0. 情報アーキテクチャ全体像

まず全画面の親子構造を先に置く。

User Side

Home

Today

Watchlist

Upcoming enforcement

Recent status changes

Official updates

Alert

Alert feed

Alert detail

Alert timeline

Source compare

Compound

Compound list

Compound detail

Compound timeline

Related products

Related alerts

Product

Product list

Product detail

Brand page

Product status history

Related regulation

Search

Search results

Filter panel

Settings

Watchlist settings

Notification settings

Risk preference

Language / display settings

Ops Side

Admin

Dashboard

Source monitor

Alert review queue

Entity manager

Product verification

User reports

Audit log

Moderation

Content review queue

Safety classifier results

Escalation view

Rule management

Enforcement history

1. Home

Homeは一番大事。
ここをニュース一覧にするとJBNは死ぬ。

Homeは 「最新記事を見る場所」ではなく「今、自分に関係ある変化を優先順で見る場所」 にする。

1-1. Homeの目的

Homeの役割は5つだけ。

今日の重大変化を一目で分かる

フォローしている成分・製品の状態変化を分かる

近い施行日を見逃さない

未確定と確定を区別できる

どこを深掘りするべきか分かる

つまり Home は dashboard であって feed ではない。

1-2. Homeのレイアウト

おすすめは3カラムではなく、縦の優先度型レイアウト。

上から順に:

Critical Alerts

Watchlist Changes

Upcoming Dates

Category Overview

Recent Verified Updates

Field Signals

Footer / Compliance disclaimer

1-3. Home上部ヒーロー領域
セクション名

JBN Radar

表示要素

今日の重大変化件数

今週の施行予定件数

Watchlist変化件数

未確認報告件数

最終チェック時刻

例

Critical: 2

Effective within 7 days: 1

Watchlist changes: 4

Unverified updates: 3

Last checked: 03:10 JST

CTA

Watchlistを見る

Criticalだけ見る

未確定だけ見る

1-4. Critical Alerts セクション

ここは最優先。

何を出すか

指定薬物追加

公布

施行日確定

THC基準変更

行政の強い注意喚起

販売停止 / 回収 / 違反公表

カード項目

タイトル

severity

status

affected compounds

affected product forms

effective date

last updated

source tier

「何が変わったか」1行

「誰に影響あるか」1行

例

CBN関連ページ更新
Status: pending / high-risk
What changed: 継続使用手続案内が掲載
Impact: CBN関連事業者・利用者は継続監視推奨

視覚ラベル

Critical

High

Medium

Low

ただし色だけに頼らず、テキストでも明示。

1-5. Watchlist Changes

JBNの継続利用理由になる場所。

表示単位

ユーザーがフォローしている

Compound

Product form

Brand

Topic

Agency

1カードの中身

entity name

current legal state

前回から何が変わったか

変化時刻

confidence

quick action

quick action

詳細を見る

通知を強化

フォロー解除

関連製品を見る

例

CBN
Previous: under_review
Current: pending high-risk
Change: 行政ページ更新 / 業界報道追加

1-6. Upcoming Dates

このアプリでかなり重要。

表示すべき日付タイプ

施行日

公布日

パブコメ締切

行政会議日

猶予終了日

自主回収期限

販売終了日

UI

カレンダーではなく、countdown list がいい。

例:

In 2 days

In 7 days

Today

Passed yesterday

カード項目

date

event type

related compounds/products

consequence

source

1-7. Category Overview

Homeの中腹では全体像を見せる。

カテゴリ

Regulation

Compounds

Products

Reviews

Market signals

各カテゴリで見せるもの

新着件数

verified件数

pending件数

high-risk件数

目的

ユーザーに「今どの領域が動いているか」を見せる。

1-8. Recent Verified Updates

ここはニュースフィードに最も近いが、ただの一覧にはしない。

表示条件

official_confirmed のみ

source tier 1 or 2中心

時系列

項目

title

source

date

change type

impacted entity

open detail

1-9. Field Signals

これは v1 後半か v2 で強くなる。

含めるもの

終売告知

自主回収

レビュー急増

ネガティブ報告増加

ブランド発表

展示会トレンド

注意

ここは規制情報より下に置く。
JBNの重心を守るため。

1-10. Homeのフィルタ

最低限必要。

status

confidence

severity

compounds

product forms

source tier

verified only

upcoming only

2. Alert

Alert画面はJBNの中核。
ここは「通知詳細画面」ではなく、一つの変化を完全に理解する画面 にする。

2-1. Alert一覧画面
目的

すべての重要イベントを時系列で見られる。

タブ

All

Critical

Verified

Pending

Upcoming

Watchlist only

フィードアイテム項目

title

change type

severity

legal confidence

impacted entities

published date

effective date

source count

compare badge

並び順

デフォルトは importance desc
時系列だけではなく重要度順。

2-2. Alert詳細画面

ここはかなり重要なので、1ページの構造を固定する。

上部ヘッダー

alert title

severity

current status

published date

effective date

last checked

source confidence

follow / mute button

直下サマリー

3つの固定ブロックにする。

1. What changed

何が変わったか

2. Why it matters

なぜ重要か

3. Who is affected

誰に影響するか

2-3. Alert detail の詳細ブロック
A. Change summary

previous state

current state

change type

effective timing

verification state

B. Affected entities

compounds

product forms

brands

agencies

regions

C. Legal interpretation layer

official wording

normalized interpretation

uncertainty note

not legal advice disclaimer

D. Timeline

first detected

reported

official confirmation

next expected milestone

E. Sources

Primary source

Supporting source

Industry commentary

Archived snapshot

Diff view

F. Related alerts

同じ成分

同じ省令

同じブランド

同じ product form

2-4. Source compare view

JBNらしさが最も出る場所。

画面用途

「前回と今回で何が変わったか」を比較表示する。

比較対象

old snapshot

new snapshot

見せ方

added text

removed text

changed dates

changed thresholds

changed scope

changed status

重要

本文全文差分ではなく、意味差分要約 を上に置く。

上部に:

施行日が追加された

対象範囲が拡大した

物質が追加された

表の数値が変更された

下部に実テキスト差分。

2-5. Alert timeline view

1件のアラートがどう発展してきたかを示す。

マイルストーン例

初出報道

パブコメ開始

部会開催

公布

施行

回収

終売

目的

ユーザーが「今どの段階か」を誤解しないようにする。

3. Compound

Compound画面は、ニュースの集合ではなく 対象物の状態管理ページ にする。

3-1. Compound一覧画面
目的

成分ごとに今の状態を一覧できる。

表示単位

1行1 compound

項目

name

aliases

current legal state

risk level

last change date

related alert count

affected products count

verification level

フィルタ

official only

high-risk only

under review

product form affected

alphabetical

recent change

3-2. Compound詳細画面

この画面はめちゃくちゃ重要。

上から順に:

Header

Current status

Legal timeline

Related alerts

Affected product forms

Related brands/products

Source map

Notes / uncertainty

3-3. Compound header

compound name

aliases

category

follow button

share

report issue

補足表示

natural / synthetic / semi-synthetic

canonical normalization name

Japan status

3-4. Current status card

一番重要。

項目

current state

legal confidence

risk level

last officially checked

enforcement relevance

summary sentence

例

CBN
Status: pending / high-risk
Confidence: medium
Reason: 行政関連案内あり、最終確定は未確認

3-5. Legal timeline

成分単位での時間軸。

イベント例

初検知

業界報道

パブコメ言及

部会議題

厚労省掲載

公布

施行

UI

縦タイムラインがよい。

3-6. Related alerts

この成分に関連するアラートを一覧。

ソート

newest

highest severity

verified first

表示

title

date

source confidence

change type

3-7. Affected product forms

重要。
「成分」と「製品形状」は分ける必要がある。

表示項目

oil

gummy

vape

powder

capsule

beverage

cosmetic

others

各 form ごとに

current sensitivity

guidance available

threshold relevance

related incidents

3-8. Source map
何を見せるか

official sources count

industry sources count

news sources count

latest source date

目的

このページの確度をユーザーが自分で判断できるようにする。

3-9. Compound page actions

Follow compound

Set alerts level

Add note

Export timeline

View related products

View related laws

4. Product

Productはv1後半〜v2で強くなるが、設計は今から固めるべき。

JBNのProductはECサイトではない。
規制文脈のついた製品透明化ページ にする。

4-1. Product一覧画面
単位

1行1商品、または1カード1商品

項目

product name

brand

compounds detected/claimed

product form

legal status

verification status

last checked

red flags

related alerts

フィルタ

brand

compound

form

verified

flagged

discontinued

recalled

under review

4-2. Product詳細画面

構造は固定した方がいい。

Header

Verification summary

Product identity

Legal relevance

Related alerts

Review summary

History

Source evidence

Reporting section

4-3. Product header

product name

brand

product form

primary compounds

watch button

report problem

4-4. Verification summary

最重要。

項目

verification status

legal confidence

source coverage

last checked

red flags

availability state

verification status 例

verified from official recall notice

verified from brand page

detected from marketplace only

user-submitted only

archived / unavailable

4-5. Product identity

manufacturer / seller

form

advertised compounds

thc statement

lab report presence

country of origin

first seen date

last seen date

4-6. Legal relevance

JBN独自にかなり重要。

項目

related compounds legal states

form-specific guidance

threshold-sensitive

import-sensitive

enforcement-linked

表示例

Contains/claims CBN

Related risk: high

Form: oil

Guidance availability: yes

Legal certainty: pending

4-7. Related alerts

その商品に関係ある法令・行政・業界アラート。

表示理由

ユーザーは商品単位で来る場合が多いから。

4-8. Review summary

かなり慎重に設計。

許可するレビュー分類

packaging

taste

smell

price satisfaction

customer support

shipping

labeling clarity

lab transparency

慎重分類

relaxation

sleep-related impression

body-feel

repeatability

禁止分類

how to get high

dose hacks

avoiding detection

illegal use guidance

UI

自由記述だけにしない。
カテゴリ選択 + 制限付き短文 の方が安全。

4-9. Product history

first indexed

brand updated label

recall notice

discontinued

marketplace removed

legal context changed

目的

製品の状態遷移を見る。

4-10. Source evidence

official notice

brand page

marketplace listing

archived snapshots

user upload

admin verification note

4-11. Product report section

ユーザーが報告できる内容。

incorrect info

product unavailable

suspicious labeling

possible recall

legal concern

unsafe review

other

5. Admin

AdminはJBNの信頼の源。
ここが弱いと誤報アプリになる。

5-1. Admin dashboard
表示KPI

new docs fetched today

docs awaiting parsing

alerts generated

alerts pending human review

alerts published

flagged content count

unresolved reports

source failures

entity merge suggestions

上位カード

Critical events pending review

Source fetch errors

High-risk compounds updated today

Products with red flag surge

5-2. Source monitor

ここはかなり重要。

機能

source list

last fetch time

fetch status

parse status

snapshot count

diff detected

failure logs

retry

priority score

source detail で見るもの

URL

source type

tier

polling frequency

parser type

last content hash

last meaningful diff

archived snapshots

5-3. Alert review queue

AIが作ったアラートを人が最終確認する場所。

一覧項目

title

severity

source tier

legal confidence

affected entities

auto-summary

diff type

suggested publish status

reviewer actions

approve

approve with edit

downgrade severity

mark pending

reject

merge

escalate legal review

detailで編集するもの

title

summary

what changed

impacted entities

dates

status label

uncertainty note

5-4. Entity manager

JBNでは entity normalization が超重要。

管理対象

compound aliases

product forms

brands

agencies

laws

product-product duplicates

できること

merge alias

set canonical name

split wrong merge

assign category

add risk tags

5-5. Product verification panel
一覧項目

product name

claim compounds

source count

official source presence

brand confirmation

lab document presence

risk flags

actions

verify

mark unverified

archive

flag for review

link to related compound

attach admin note

5-6. User reports panel

reports by type

severity

target content

submitter count

resolution status

actions

resolve

escalate

hide content

ask moderation

attach rationale

5-7. Audit log

信頼性のために必須。

記録内容

who changed what

old value

new value

timestamp

reason

affected users

6. Moderation

これはv2で必須だが、今から設計しないと後で崩れる。

6-1. Moderationの目的

違法助長を防ぐ

誤情報を抑える

医療断定を防ぐ

レビューを安全に保つ

ストア/外部規約リスクを下げる

6-2. Moderation queue
対象

user reviews

user reports

brand descriptions

imported community posts

AI generated summaries with risk labels

一覧項目

content type

risk score

reason flags

detected prohibited terms

target entity

user history

preview

6-3. Risk flags
自動検知タグ

illegal_use_guidance

dosage_advice

detection_evasion

import_evasion

medical_claim

minor_targeting

harmful_combination

unverified_legal_claim

marketplace_spam

6-4. Moderation detail view
表示内容

full content

highlighted risky spans

policy match

related entity

user history

similar past cases

suggested action

action

approve

redact

soft-hide

hard-remove

warn user

suspend posting

escalate admin/legal

6-5. Rule management

ルールはコードに埋めすぎない。
管理画面から更新できた方がいい。

管理項目

blocked keywords

risky phrase patterns

allowed review templates

medical claim phrases

geo-sensitive terms

escalation thresholds

6-6. Enforcement history

後から説明責任を持つために必要。

記録

content id

action taken

moderator

timestamp

rationale

appeal status

7. 横断機能

この6画面の上に乗る共通機能もかなり重要。

7-1. Search

検索対象は記事ではなく entity 横断。

検索できるもの

compounds

products

alerts

brands

agencies

laws

product forms

検索結果のタブ

All

Compounds

Products

Alerts

Sources

Brands

7-2. Notification settings

ユーザーごとに通知強度を変えられるようにする。

通知設定

Critical only

Watchlist changes

Verified only

Upcoming dates

Product recalls

Daily digest

Weekly digest

7-3. User trust indicators

JBNは信頼の見せ方が大事。

どこでも表示すべき指標

official / reported / pending

source tier

last checked

uncertainty note

archived source available

7-4. Saved / Watchlist
watch対象

compound

product

brand

agency

keyword

画面に必要なこと

current state

last change

alert level

mute

remove

8. 状態設計

各画面で共通して使う status 設計も先に決めるべき。

8-1. Legal status

unknown

under_review

pending

reported

official_confirmed

promulgated

effective

recalled

discontinued

archived

8-2. Confidence

official

high

medium

low

unverified

8-3. Severity

critical

high

medium

low

info

8-4. Moderation state

clean

caution

restricted

blocked

escalated

9. 初期実装で本当に必要な画面

全部一気に作ると重いから、優先順位も明確にする。

v0で必要

Home

Alert list

Alert detail

Compound detail

Watchlist settings

Admin dashboard

Alert review queue

Source monitor

v1で追加

Compound list

Product list

Product detail

Entity manager

Search

Upcoming dates view

v2で追加

Review summary

User posting UI

Moderation queue

Rule management

Enforcement history

Brand page

10. 一番大事な設計原則

最後にここ。
JBNの画面設計で最も重要なのは、

“コンテンツを増やす設計” ではなく “誤解を減らす設計”

にすること。

だから各画面で必ず必要なのは、

いまの状態

何が変わったか

どこまで確定しているか

誰に影響するか

次に何が起こりそうか

元情報は何か

この6つ。

ここが揃えば、JBNは単なるニュースまとめではなく、かなり強い。

次はこれをさらに一段落として、
各画面ごとのコンポーネント一覧とユーザーフロー まで分解するのが正解。

---

## User

animation conversation.md
File

---

## ChatGPT

ファイル確認しました。
内容はこれですね → 

animation conversation

要約するとあなたの案は：

初回 or 24時間以上空いた時だけイントロ表示

アニメーション案

草が徐々に生えて画面を埋める

草原を駆け抜けて光 → ホーム

これは かなり良い方向ですが、JBNのプロダクトとして考えると
もう一段レベルを上げた方がいいです。

理由は1つ。

このアニメーションは「JBNとは何か」を1秒で伝える場所だから。

つまり
ただのローディングではなく プロダクト説明 にするべき。

改良版：JBN Intro Animation 設計

JBNのコンセプトは

情報の芽 → 規制の森 → 意思決定

なのでアニメーションをこの構造にする。

1. アニメーション構造（最終版）
Phase 1

データの点

黒背景

.   .   .   .
   .   .   .

点が現れる

意味
→ 世界中の情報

Phase 2

芽が生える

🌱
🌱 🌱
🌱 🌱 🌱

意味

→ 情報が構造化される

Phase 3

草原形成

画面が草で埋まる

🌱🌱🌱🌱🌱
🌱🌱🌱🌱🌱
🌱🌱🌱🌱🌱

意味

→ 情報のエコシステム

Phase 4

レーダー

草の上にUIが浮く

CBD status changed
New regulation detected
Import guideline updated
Phase 5

JBNロゴ

JBN

Japan Botanical Network
Regulatory Intelligence
Phase 6

フェード
→ HOME

2. 表示条件ロジック

これはあなたの案でOK。

JavaScript
const lastVisit = localStorage.getItem("jbn_last_visit");
const now = Date.now();

if (!lastVisit || now - lastVisit > 24 * 60 * 60 * 1000) {
  showIntro();
  localStorage.setItem("jbn_last_visit", now);
} else {
  loadHome();
}

追加すると良い条件

?skipIntro=true

URLでスキップ可能。

3. アニメーション時間

重要。

長いとUX死ぬ。

おすすめ

Phase1 0.7s
Phase2 0.7s
Phase3 0.9s
Phase4 0.6s
Logo 0.5s

合計

3.4秒

4. 24時間後の短縮版

再訪ユーザーは短縮版。

🌱 growing...
25%
75%
100%

JBN

1.2秒

5. 技術スタック

Claude Codeで作るなら

フロント
Next.js
React
Framer Motion
Canvas

理由

Canvas → 草アニメ

Framer → UIトランジション

6. フォルダ設計

Claude Code向け。

/components
   IntroAnimation.tsx
   GrassField.tsx
   RadarOverlay.tsx
/hooks
   useIntroGate.ts
/pages
   index.tsx
7. Grassアルゴリズム

草は単純なラインでいい。

JavaScript
class Grass {
  constructor(x) {
    this.x = x;
    this.height = 0;
    this.maxHeight = 30 + Math.random()*40;
  }

  grow() {
    if(this.height < this.maxHeight) {
      this.height += 1;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, canvas.height);
    ctx.lineTo(this.x, canvas.height - this.height);
    ctx.stroke();
  }
}
8. Radar Overlay

草の上に出るカード。

例

Regulation detected
CBN status update
THC guideline revised

0.5秒で消える。

9. ブランドカラー

JBNは

black #0b0b0b
green #2f8f4e
light green #79c37c
white #ffffff
10. モバイル最適化

モバイルでは草を減らす。

Desktop grass: 500
Mobile grass: 200
11. 非表示設定

ユーザー設定

☑ Disable intro animation

これ必須。

12. 実はもう一つ重要なUX

アニメーション終了後

Homeの最初の画面も連動させる

例

草 → Home

Homeのヒーローに

Regulatory Radar

と出る。

一貫性が出る。

次にやるべきこと

この段階で

もう1つ超重要な設計があります。

それは

JBNのナビゲーション構造

つまり

Home
Alerts
Compounds
Products
Search
Watchlist

をどう配置するか。

ここが間違うと
どんなに機能が良くても使われない。

もしよければ次に

AppleレベルのJBNナビゲーション設計（かなり重要）

を作ります。

---

## User

AppleレベルのJBNナビゲーション設計

---

## ChatGPT

いい。
ここはかなり本質です。

JBNは機能が多くなりやすいので、ナビゲーションを間違えると一気に

何のアプリか分からない

情報が多いのに使いにくい

“ただのニュースサイト” に見える

になります。

Appleレベルで考えるなら、原則はこれです。

機能を並べるのではなく、ユーザーの頭の中の順番を並べる。

JBNのユーザーがしたいことは本質的にこの4つしかない。

今何が変わったか知る

自分が気にしている対象を見る

必要な対象を調べる

信頼できる根拠を確認する

なので、JBNのナビは “多機能っぽさ” を見せるのではなく、
変化 → 対象 → 探索 → 信頼 の流れを極限まで滑らかにするべきです。

前に詰めたイントロ設計ともつながっていて、JBNは最初から「規制レーダー」として入るべきです。アニメーション案でも “情報の芽→草原→ホーム” の流れがありましたが、ナビもその延長線上に置くべきです。 

animation conversation

1. 結論

Appleレベルで行くなら、JBNのグローバルナビは 5個まで に絞る。

おすすめはこれ。

Home

Alerts

Watchlist

Explore

Profile

これが一番強い。

一見すると
Compound や Product がトップにないのが不思議に見えるけど、
Appleっぽい設計では 情報構造をそのままナビに出さない。

ユーザーは「Compoundページに行きたい」と思っているわけではない。
実際は

何か変化を見たい

自分が追ってるものを見たい

CBNとか商品を調べたい

だけです。

だから Product や Compound は
Explore の中の対象タイプ として扱う方が洗練されます。

2. ナビゲーションの設計原則
原則1

名詞ではなく目的で切る

悪い例:

Home

Compounds

Products

Laws

Sources

Admin

これはデータベースっぽい。

良い例:

Home

Alerts

Watchlist

Explore

Profile

これは行動ベース。

原則2

一番大事なものを最短1タップにする

JBNで一番大事なのは
“今、何が変わったか” なので、

Alerts は下層ではなくトップレベル

Home からも Critical Alert に即行ける

Watchlist 変化も1タップ

にするべき。

原則3

深い構造は見せない

Appleっぽさは
「裏では複雑だが、表では少ない」。

JBNの裏側は

compound

product

law

source

alert

timeline

diff

agency

brand

など超複雑でいい。

でもユーザーには見せない。

原則4

現在地が常に分かる

JBNは情報密度が高いから、
今いる場所が曖昧になると一気に疲れる。

なので各画面で必ず

上部タイトル

サブコンテキスト

フィルタ状態

対象名

が必要。

3. グローバルナビ構造
推奨構造
1. Home

役割:

全体の状況を一目で見る

今日の重大変化を見る

次に何を見るべきか判断する

Home は dashboard。
ニュース一覧ではない。

2. Alerts

役割:

すべての変化を追う

差分の意味を理解する

verified / pending を分けて見る

JBNのコア。

3. Watchlist

役割:

自分が追っている対象だけを見る

Compound / Product / Brand / Topic を追う

通知設定をする

継続利用の中心。

4. Explore

役割:

自分から調べる

Compound / Product / Brand / Law / Source に横断で行く

検索のハブ

情報の深掘り場所。

5. Profile

役割:

通知設定

表示設定

安全設定

アニメーション設定

ログ / 保存 / フィードバック

地味だけど必要。

4. モバイル版のAppleレベル設計

モバイルなら、基本は 下部タブバー 5個。

タブバー

Home

Alerts

Watchlist

Explore

Profile

アイコンの考え方

過剰に装飾しない。

Home: シンプルなグリッド or house

Alerts: ベルではなく pulse / radar 系

Watchlist: star か bookmark

Explore: search or compass

Profile: person

ただしJBNなら Alerts はベルより
レーダー円 or signal icon の方がブランドに合う。

モバイルでの挙動
Home

下部タブから1タップ

Alerts

タップで一覧
上部セグメントで

Critical

Verified

Pending

Upcoming

Watchlist

タップでフォロー対象一覧
上部で

All

Compounds

Products

Brands

Explore

最初から検索バーが最上部
下に

Trending compounds

Recently updated products

Agencies

Laws

Sources

Profile

Notifications

Appearance

Intro animation

Safety preferences

Saved items

5. デスクトップ版のAppleレベル設計

デスクトップは下タブではなく、
左サイドバー + 上部コンテキストバー が最も強い。

左サイドバー

JBN logo

Home

Alerts

Watchlist

Explore

Divider

Admin（権限者のみ）

Moderation（権限者のみ）

Settings / Profile

特徴

Appleっぽくするなら、サイドバーは

余白多め

アイコンは細い

文字は短い

選択中だけごく淡く背景がつく

上部コンテキストバー

各ページ上部に置く。

例:

Alertsページ

Title: Alerts

Search

Filter chips

Date range

Verified only toggle

Exploreページ

Search field

Scope selector

Recent searches

Suggested topics

Compound詳細

breadcrumb: Explore / Compounds / CBN

Follow button

Share

Last checked

6. 情報の深さごとの導線

JBNは深い情報を持つので、階層設計が重要。

おすすめは 3階層まで に抑える。

Layer 1: Overview

Home

Alerts list

Watchlist

Explore top

Layer 2: Entity list / filtered view

Compound list

Product list

Brand list

Filtered alert list

Layer 3: Detail

Alert detail

Compound detail

Product detail

Law detail

Source compare

これ以上深くしない。

たとえば

Home → Alerts → Alert detail → Related compound → Related product → Source archive

みたいに6段階行くと死ぬ。
だから 関連情報は遷移ではなく、同一画面内カードで見せる のがAppleっぽい。

7. Exploreの中身

Explore は単なる検索画面にしない。
ここを美しく作ると “Apple感” が出る。

Exploreトップ

上から順に

A. Universal Search

検索対象:

Compounds

Products

Brands

Alerts

Laws

Sources

B. Quick Explore

Compounds

Products

Brands

Agencies

Laws

C. Trending

Most changed this week

Most followed

Newly added

High-risk updates

D. Curated collections

Recently updated cannabinoids

Upcoming enforcement

Official notices this week

Products under review

つまり Explore は
検索 + 発見 の両方を持つ。

8. AlertsのAppleレベル設計

AlertsはJBNの核なので、ただの一覧では弱い。

Alerts上部の構成

大きいタイトル

“What changed”

セグメント切替

フィルタボタン

検索

右上に「Verified only」

セグメント

All

Critical

Verified

Pending

Upcoming

このセグメントは Apple の segmented control 的に
シンプルに、横並び、強調しすぎない。

Alertカード

Appleっぽくするなら、カードは “盛りすぎない”。

表示項目は厳選。

タイトル

What changed 1行

Affected entities

Status

Effective date

Confidence

これだけでいい。

全文要約を一覧で見せない。

9. WatchlistのAppleレベル設計

Watchlistは “管理画面” に見せない方がいい。
むしろ 自分専用のレーダー に見せる。

上部

Your Radar

All changes since last visit

Notification level

タブ

All

Compounds

Products

Brands

Topics

各項目

名前

状態

前回から何が変わったか

最終変化

mute / unfollow

Appleっぽさを出すなら、
右側に小さい補助情報、左側に主情報を置く。

10. 詳細画面の共通ルール

Alert detail / Compound detail / Product detail は別物に見えて、
ナビ上は同じルールで作るべき。

共通ヘッダー

タイトル

ステータス

Follow

Share

Last checked

共通本文構造

現在の状態

何が変わったか

タイムライン

関連情報

ソース

この順を崩さない。

11. 検索の扱い

Appleレベルで重要なのは、
検索を “別機能” にしないこと。

JBNでは Explore の中心に検索を置くが、
実際はどのページからでも検索に入れるべき。

仕様

上部に常時検索アクセス

/ で検索起動

recent search 保存

entity suggestion

search result に type label

例:

CBN — Compound

Naturecan CBN Oil — Product

THC residual limits — Law

March 4 designated substances — Alert

12. Admin / Moderation の分離

一般ユーザー用ナビと運用用ナビは完全に分ける。

Appleっぽさのためにも、
一般ユーザーUIに運営臭を混ぜない。

一般ユーザー

Home

Alerts

Watchlist

Explore

Profile

運営権限あり

左サイドバー下部に追加表示

Admin

Moderation

これで十分。

13. アニメーションとの接続

前のイントロからホーム遷移まで一貫させるとかなり強い。 

animation conversation

おすすめはこう。

Intro終わり

白 or 黒の余韻
↓
Homeヒーローにそのまま接続
↓
最上部に

Today’s changes

Your radar

Upcoming enforcement

つまり、イントロが単独演出で終わらず
そのままナビの最初の文脈に入る ようにする。

14. 具体的な画面遷移
基本フロー
フロー1

Intro
→ Home
→ Critical Alert
→ Alert detail
→ Related Compound
→ Follow

フロー2

Home
→ Watchlist
→ CBN
→ Related Alerts
→ Source compare

フロー3

Explore
→ Search “CBN”
→ Compound detail
→ Related Products
→ Product detail

フロー4

Alerts
→ Pending
→ Specific alert
→ Timeline
→ Primary source

全部かなり自然。

15. 実際の文言

Appleレベルにするなら、ラベルも短くする。

良い

Home

Alerts

Watchlist

Explore

Profile

避けたい

Regulatory Alert Management

Substance Intelligence

Product Monitoring

Legal Source Database

内部では正しくても、表に出すと重い。

16. 最終提案
モバイル

下部タブバー

Home

Alerts

Watchlist

Explore

Profile

デスクトップ

左サイドバー

Home

Alerts

Watchlist

Explore

Profile
権限者のみ

Admin

Moderation

深い対象

Compound

Product

Brand

Law

Source

はトップレベルに出さず、Explore と詳細遷移に入れる。

17. 一番大事なこと

JBNのナビで最も重要なのは、

“データ構造を見せないこと”

です。

裏側では超複雑でいい。
でも表では

今なにが起きたか

自分に関係あるか

深掘りするにはどこに行くか

だけが見えればいい。

これがAppleレベル。

次に詰めるなら、かなり良い順番は
このナビ構造を前提に、各画面のワイヤーフレームをテキストで作ること です。

---

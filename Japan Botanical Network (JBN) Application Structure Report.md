### Japan Botanical Network (JBN) Application Structure Report

#### 1\. Product Vision and Core Philosophy

The Japan Botanical Network (JBN) is a  **Regulatory Intelligence System**  engineered to provide mission-critical compliance data for the Japanese cannabinoid market. Unlike traditional news aggregators that prioritize narrative, JBN utilizes a  **"Difference Detection Radar"**  philosophy. The system is designed to shift user behavior from passive consumption to active verification of legal status changes—specifically comparing "Before" vs. "After" states.The platform delivers value through four core pillars:

* **Legality Status:**  Definitive clarity on the current legal standing of substances and products.  
* **Change Timeline:**  Precise tracking of the window between announcement (promulgation) and enforcement.  
* **Impact Scope:**  Granular mapping of how changes affect specific product categories (e.g., the transition from "Oil" to "Aqueous Solution" standards).  
* **Source Reliability:**  A weighted trust architecture based on the proximity of information to primary regulatory bodies.

#### 2\. Global Information Architecture: The Five-Tab Navigation

JBN employs an "Apple-level" action-based navigation system. This moves the interface away from static, noun-based categorization (e.g., "Compounds") toward high-velocity, intent-based actions.

##### JBN Global Navigation Structure

Tab Name,Core Purpose,Primary User Action  
Home,Decision-making dashboard,Assess daily risks and critical updates.  
Alerts,Regulatory difference feed,Review specific legal changes and semantic diffs.  
Watchlist,Personal compliance monitoring,Track followed compounds and specific brand risks.  
Explore,Verification & entity search,"Verify substances and audit product ""Red Flags."""  
Profile,Safety & personalization,Configure notification intensity and safety filters.

#### 3\. Tab 1: Home – The Intelligence Dashboard

The Home screen serves as a vertical priority list, directing the user’s attention to the highest-severity regulatory shifts.

* **JBN Radar (Hero):**  A high-level visualization of the current landscape. It displays the count of active Critical Alerts, the number of substances reaching "Effective" status within 7 days, and state-machine transitions in the user’s Watchlist.  
* **Critical Alerts:**  High-severity updates prioritized at the top.  
* *Example:*  The March 4, 2026, official designation of 4 new substances as "Designated Substances" (Shitei Yakubutsu).  
* **Upcoming Dates:**  A countdown timer for legal deadlines.  
* *Example:*  A countdown to the December 12, 2024, THC residual limit enforcement deadline, or e-Gov/Public Comment closing dates.  
* **Watchlist Highlights:**  Real-time status changes (e.g., "Under Review" → "Promulgated") for entities followed by the user.

#### 4\. Tab 2: Alerts – Regulatory Difference Radar

An "Alert" is the atomic unit of the system, representing a verifiable change in the legal landscape.

##### Alert Feed Categorization

* **Critical:**  Immediate legal designations or enforcement of criminal penalties (e.g., "Use Crimes").  
* **Verified:**  Updates confirmed by Tier 1 or Tier 2 official sources.  
* **Pending:**  Reported changes appearing in Tier 3/4 sources but awaiting official government confirmation.  
* **Upcoming:**  Advance notice of enforcement dates and grace period expirations.

##### Alert Detail View Components

1. **Summary Block:**  Three standardized sections: "What Changed," "Why it Matters," and "Who is Affected."  
2. **Source Verification:**  A Tier 1–5 hierarchy to establish maximum data integrity:  
3. **Tier 1: Official Government:**  MHLW (Ministry of Health, Labour and Welfare), NCD (Narcotics Control Department), e-Gov/Public Comments, and the Official Gazette (Kanpō).  
4. **Tier 2: Quasi-official:**  Consumer Affairs Agency, National Police Agency, and administrative notices.  
5. **Tier 3: Domestic News:**  National newspapers (Nikkei, Asahi) and NHK.  
6. **Tier 4: Industry Media:**  Specialized publications like Wellness Daily News or HempToday.  
7. **Tier 5: Community:**  Social media and unofficial reports.  
8. **The Semantic Diff:**  A GitHub-style interface for legal data. It highlights changes in  **THC thresholds**  (e.g., 0.5ppm ➔ 0.1ppm) and  **Legal State Machine**  transitions (e.g., shifting from "Reported" to "Official Confirmed") with green/red visual indicators.

#### 5\. Tab 3: Watchlist – Personalized Monitoring

The Watchlist provides a focused compliance view for the entities most relevant to the user’s operations or consumption.

* **Entity Tracking:**  Users monitor  **Compounds**  (CBD, CBN, THC, etc.),  **Product Forms**  (Oil, VAPE, Gummies, Edibles),  **Brands** , and  **Agencies**  (NCD, MHLW).  
* **Status Change Logic:**  Notifications are triggered when a watched entity moves between the 8 states of the Legal State Machine. For example, if CBN moves from "Unknown" to "Under Review," users receive a high-priority push notification.

#### 6\. Tab 4: Explore – Entity Verification Hub

The Explore tab functions as the gateway to the JBN database, focusing on  **Verification**  rather than simple discovery.

* **Compounds (Substances):**  A directory featuring historical legal timelines and current risk scores for cannabinoids.  
* **Product Database:**  A compliance-first directory. It prioritizes  **"Red Flag" logic** : flagging products with missing COAs (Certificates of Analysis), suspicious labeling, or brands that have received MHLW/NCD warnings.  
* **Laws & Agencies:**  A library of direct links to primary documentation, including NCD import manuals, CBD/CBN non-correspondence forms, and MHLW Q\&A PDFs.  
* **Universal Search:**  Real-time suggestions categorized by type (Compound vs. Product vs. Alert) to ensure rapid data retrieval.

#### 7\. Tab 5: Profile – Safety and Preferences

* **Notification Intensity:**  Users choose between "Critical Alerts Only" or "All Changes."  
* **Safety Filters:**  Controls to hide or flag user-generated content that violates safety policies.  
* **Intro Animation Toggle:**  Option to disable the system initialization sequence.  
* **Language/Display:**  Options for technical vs. simplified legal terminology.

#### 8\. The Operational Layer: Admin and Moderation Ecosystem

A strict partition separates the public UI from the back-office verification infrastructure.

##### Admin Dashboard

* **Source Monitoring:**  AI-driven logs tracking fetch status from MHLW PDFs and e-Gov updates.  
* **Alert Review Queue:**  A human-in-the-loop system where experts verify AI-summarized legal diffs before they are published as "Verified."  
* **Entity Management:**  Merging compound aliases and updating the global "Legal State Machine."

##### Moderation Dashboard

JBN employs a  **Content Safety Classifier**  to enforce strict community boundaries.

* **Approved Content (OK):**  Reviews regarding taste, smell, packaging, brand responsiveness, and price.  
* **Prohibited Content (NG):**  
* **Dosage Advice:**  Specific instructions on how much to consume.  
* **Detection Evasion:**  Methods to avoid police detection or bypass customs.  
* **Medical Claims:**  Assertions that a substance cures or treats specific diseases.  
* **Illegal Use Guidance:**  Instructions on achieving "highs" or using prohibited substances.

#### 9\. System Initialization: The "Data Grass" Intro Animation

To reinforce the brand identity of "Organized Information Growth," JBN uses a specialized initialization sequence.

* **Visual Sequence (Total 3.4 seconds):**  
* **Data Points (0.7s):**  Scattered points representing raw, unorganized data.  
* **Sprouts (0.7s):**  Points transform into botanical sprouts.  
* **Grass Field (0.9s):**  Sprouts grow into a dense field, signifying the complexity of the market.  
* **Radar Overlay (0.6s):**  A scanning pulse identifies legal "diffs" over the field.  
* **JBN Logo (0.5s):**  Final logo reveal and transition to Home.  
* **Display Logic:**  
* **Full Version (3.4s):**  Shown on first visit or if \>24 hours have passed since last session.  
* **Short Version (1.5s):**  An abbreviated "Quick Growth" animation for returning users within the 24-hour window.

#### 10\. Data Integrity and Trust Indicators

Every entity in JBN is tracked through an 8-state  **Legal State Machine**  to ensure users never act on unverified rumors.

##### The Legal State Machine

1. **Unknown:**  Detected in market but no regulatory data available.  
2. **Under Review:**  Mentioned in MHLW committee minutes or "Pending" status in Tier 4 sources.  
3. **Pending:**  Public comment period or e-Gov announcement active.  
4. **Reported:**  Tier 3 news coverage exists but no official Tier 1 document yet.  
5. **Official Confirmed:**  Documented in MHLW/NCD/Official Gazette.  
6. **Promulgated:**  Law is signed/published; enforcement date is set.  
7. **Effective:**  Law is currently in force and enforceable.  
8. **Recalled:**  Status revoked or product removed from market.

##### Trust Labels

Every card and data point must display the following indicators:

* **Source Tier:**  (Tier 1–5).  
* **Confidence Level:**  Derived from the State Machine (e.g., "Official" for states 5-7, "Unverified" for states 1-4).  
* **Last Checked Date:**  The precise timestamp of the last system audit.


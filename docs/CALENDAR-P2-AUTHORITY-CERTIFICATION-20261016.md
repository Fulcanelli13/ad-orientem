# P2 — Authority certification: scope is not effect
Date: 16 October 2026. Draft PR #1302. Base canonical registry unchanged; this audit is research only.

## Results
314/314 source-date edges classified without creating a single new traditional Roman Mass permission or published Calendar observance. 9 entries rely on explicit Holy See decrees inserting an optional memorial into the **modern General Roman Calendar**, 1 on John Paul II's public papal announcement that Padre Pio would have an obligatory memorial. The remaining 304 edges include 252 Dicastery saint-profile date witnesses (not universal liturgical inscriptions), 31 historical 1962 *archived resolver* identity/date references (not independent primary-text legal certifications), 11 episcopal local witnesses, 2 papal restricted-place feast references, and 8 local/institute/historical witnesses.

## Juridical chronology and backdating
The source ledger formerly carried `juridicalEffectiveFrom` equal to `publishedOn` for 10 modern Roman acts; that conflated publication with legal effectiveness. These 10 fields have now been corrected to `null` with `documentDated`, `documentPublicReleaseDate`, and the precise status that actual effective dates are not established by this audit. This **does not deny** the document's legal force: the acts expressly establish the modern general-calendar memorial. It prevents a made-up effective-from date from propagating into history mode.

Most consequential discrepancies:
* Paul VI: signed **2019-01-25**, public bulletin **2019-02-06** (Roman optional memorial May 29).
* Teresa of Calcutta: signed **2024-12-24**, public bulletin **2025-02-11** (September 5 optional memorial).
* John Henry Newman: signed **2025-11-09**, public bulletin **2026-02-03** (October 9 optional memorial).
* The 2021 three Doctors' decree was signed January 25 and publicly released February 2; 2014 Saints John XXIII and John Paul II decree dated May 29, but independent public-release date was not certified in this pass.
* 2002 St Pio Angelus is an authentic papal announcement of mandatory Roman-calendar memorial on September 23, but it should not be misrepresented as a CDWDS signed decree.

The `historicalVisibilitySafeFrom` field is a conservative source-availability boundary for review, **not** a claim of juridical-effective commencement. Modern Roman status does not establish a celebration with the 1962 Missal. P0 adjudicates integration; P1 adjudicates traditional formularies and `Cum sanctissima` permissions.

## Reusable data contracts
`living-sanctoral-modern-general-acts.v1.json` identifies each of 10 acts, canonical person, month/day, rank, official URL, signed date, public release date (or null), and explicit modern-only jurisdiction.

`living-sanctoral-authority-audit.v1.json` carries exactly one complete source-authority disposition per 314 source-date edges.

`living-sanctoral-authority-adjudication-queue.v1.json` partitions all edges into source families with specific next evidence to obtain; unresolved source scope is never promoted by default.

`tests/calendar-living-sanctoral-authority-certification-p2.mjs` checks all 314 edge decisions, classification totals, source URLs and canonical IDs, all 10 modern acts and the history/effective-date and nonpublication locks.

## Source documents
- Three Doctors: https://press.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20210125_decreto-dottori_en.html
- Paul VI: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2019/02/06/190206b.html
- Teresa of Calcutta: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2025/02/11/250211b.html
- Faustina: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2020/05/18/200518a.html
- Newman: https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2026/02/03/260203a.html
- John XXIII and John Paul II: https://www.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20140529_decreto-calendario-generale-gxxiii-gpii_en.html
- Pio: https://www.vatican.va/content/john-paul-ii/en/angelus/2002/documents/hf_jp-ii_ang_20020616.html


## Second source-level correction — historical beatification acts and particular witnesses

The original 13 May 2000 apostolic beatification letter for Francisco and Jacinta Marto contains the Portuguese papal formula granting celebrations **“de hoje em diante”** (from today onwards), *in permitted places and according to law*, on **20 February**. This supplies an actual, date-effective **Blessed-era territorial grant**, independently of the subsequent canonisation on 13 May 2017. We have therefore preserved **two** canonical person-linked edges with `juridicalEffectiveFrom=2000-05-13` but `applicableRankFrom=BLESSED`, `saintRecognitionNotBefore=2017-05-13`, and narrow geographic/legal scope. This **does not** authorize traditional 1962 Mass formularies nor a universal modern Roman feast. The general Roman act effective dates remain unverified.

The Queen Jadwiga parish URL formerly present in the ledger was inaccessible at its historic path; the direct first-party Kraków parish record was recovered at `https://swietajadwiga.diecezja.pl/chrystus-na-krowodrzy/odpust-parafialny-ku-czci-naszej-patronki-sw-jadwigi-krolowej` and ledger, audit and compatibility view now agree on it. Carmel 12 July, Wrocław Kinga 24 July, Lasallian Turón 9 October and historical Wrexham martyrs 25 October were separately checked against original publishers; their dates stay scope-limited. Source jurisdiction should not be overread as proof of a formal national/order promulgation. Exact details and follow-up controls are stored in `living-sanctoral-particular-source-verification.v1.json`.


## Approved national proper calendar certifications — USA 2026, Canada (2016 approval, updated 2025)

The U.S. bishops' first-party `2026cal.pdf` (page 9, zero-index PDF page 10; 2026 edition emended February 2026) and the Canadian Conference of Catholic Bishops' `CanLitCalUpdated_2025_04_01.pdf` (two pages, approved by the Holy See on **27 January 2016, Prot. N. 32/16**, updated **1 April 2025**) establish **15 scoped national memorial entries for 13 already canonical individual saints**. No new person or group ID is created; two saints appear in both national witnesses.

United States entries: Elizabeth Ann Seton (4 January, memorial), John Neumann (5 January, memorial), André Bessette (6 January, optional), Marianne Cope (23 January, optional), Katharine Drexel (3 March, optional), Damien de Veuster (10 May, optional), Junípero Serra (1 July, optional), Kateri Tekakwitha (14 July, memorial), Rose Philippine Duchesne (18 November, optional).

Canada entries: André Bessette (7 January, memorial), Marguerite Bourgeoys (12 January, memorial), Kateri Tekakwitha (17 April, memorial), Marie-Léonie Paradis (4 May, optional), Eugène de Mazenod (21 May, optional), Marguerite d’Youville (16 October, memorial).

Seven certified **source-qualified date divergences** from existing date-profile testimony survive without overwriting either jurisdiction: Kateri USA July 14 vs Canada April 17; André USA Jan 6 vs Canada Jan 7; Marianne USA Jan 23 vs profile Aug 9; Damien USA May 10 vs profile Apr 15; Junípero USA July 1 vs profile Aug 28; Marie-Léonie Canada May 4 vs profile May 3; Marguerite d’Youville Canada Oct 16 vs profile Dec 23. Different source witness dates do not represent two feasts in the same calendar without actual jurisdiction evidence.

The **15 additional evidence edges bring the single canonical ledger to 329** and the P2-researched edge count to **303**, with date coverage remaining 293/293 individuals, 13/13 groups. The new edges have competent national territory and rank established. They do **not** prove legal effective-from dates for earlier years, 1962 Mass eligibility, or worldwide universal inscription. All are `eligibleForRuntime:false`, and P0/P1 boundaries are unchanged. Structured certificates: `living-sanctoral-national-propers-certified.v1.json`.

Source links: https://www.usccb.org/resources/2026cal.pdf and https://www.cccb.ca/wp-content/uploads/2026/03/CanLitCalUpdated_2025_04_01.pdf. The national witnesses are separately corroborated by USCCB 2026 liturgical entries, the USCCB proper-calendar page and the CCCB's 2016 note identifying Kateri's Canadian feast day. These sources belong to the modern national Roman calendars only.


## England and Wales national-proper reconciliation — 16 October 2026

Nine official source-qualified observances are added for six existing canonical saint IDs: England Anselm 21 April (optional memorial), Catherine of Siena 29 April (Feast), Bede 25 May (Memorial), Teresa Benedicta/Edith Stein 9 August (Feast), Gregory the Great 3 September (Feast), and John Henry Newman 9 October (Feast); Wales Catherine 29 April (Feast), Edith Stein 9 August (Feast), and Newman 9 October (Feast).

The Wales online summary still calls Newman Blessed with optional rank; the year-specific October 2026 calendar identifies him as Saint, Doctor of the Church, and Feast in both jurisdictions. Preserve the current 2026 witness without asserting when the new rank became legally effective.

Four scoped evidence edges have a different day/month than the old 1962 source for the same saint: Catherine (England and Wales) 29 vs 30 April, Bede (England) 25 vs 27 May, Gregory (England) 3 September vs 12 March. These do not change Ad Orientem's 1962 observances.

The authoritative `living-sanctoral-authority-audit.v1.json` now includes all **338/338** distinct source-edge decisions directly, without a duplicate overlay or second authority registry. The principal research ledger, canonical person links, effective-date relationships, queue, compatibility export and authority rules all include the nine new records. P2 now has 338 date edges (312 researched since the original 26), still 293 canonical individuals and 13 collective groups. Every new record remains `RESEARCH_ONLY`; no modern national rule is promoted to universal or 1962 authority.

Official primary-source records:
- https://www.liturgyoffice.org.uk/Calendar/National/England1.shtml
- https://www.liturgyoffice.org.uk/Calendar/National/Wales1.shtml
- https://www.liturgyoffice.org.uk/Calendar/2026/Oct.shtml

The source calendars include many saints beyond this P2 cohort (including George, Patrick, David and the English/Welsh martyrs). Reconcile them through the project's full Saints canonical registry, not by inventing duplicate P2 identities.

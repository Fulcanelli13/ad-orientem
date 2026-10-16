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

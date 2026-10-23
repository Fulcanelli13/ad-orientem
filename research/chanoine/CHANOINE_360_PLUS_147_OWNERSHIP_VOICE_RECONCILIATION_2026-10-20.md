# Le Chanoine — Existing 360 × new 147 corpus reconciliation

**Date:** 20 October 2026  
**Scope:** PR #1489 research only; canonical source owners stay in their original repositories/files.  
**Status:** 507 editorial conversation records across two working banks, **NOT** 507 distinct approved topics or publishable answers.

## Recovered actual older bank — verified, not inferred

The earlier user-owned **Chanoine_Unified_Conversation_Index_360_2026-10-19(1).json** was inspected directly in full. It is **not present as a full 360-conversation file in this PR's GitHub tree**. Its source SHA-256, computed from original bytes, is `69e882f2dfcad2502c890bb988789d7a01921295a33bf8ff15f7b4ec7ca8e9d5` (file-library reference `file_00000000dc388208a2e2ea90b027840d`, version 1). The original text is **not copied** to GitHub; [this 360-item read-only question-and-owner snapshot](./chanoine-360-readonly-owner-snapshot.v1.json) provides a review index and provenance.

| Confirmed structure | Old bank | New CSE bank |
| --- | ---: | ---: |
| Separate editorial conversation records | **360** | **147** |
| Source / visitor-question exchanges | **753** | **294** |
| Languages in recorded answers | **English only** | **English and French** |
| Publication approvals | **0** | **0** |
| Canonical domain owners | APOL and Church Crisis, plus 11 pastoral pilots | Sexual Ethics CSE source IDs |

The 360 old records comprise **349 doctrinal/apologetic** dialogues (two question-answer exchanges each) and **11 pastoral-biographical** safeguard dialogues (five exchanges each). The index has 248 distinct historical question IDs and 141 linked canonical owner IDs. It is itself an *editorial working bank*, not a certified live production corpus.

The newer CSE work remains 147/147 question-specific bilingual drafts, with 52 preserved source objections and 95 newly authored objections. Both source collections remain independently owned and are **not merged or redefined** by this comparison.

## Cross-bank topic and ownership checks

Read [the 147-row, 53-link source-owner crosswalk](./chanoine-cse147-vs360-owner-crosswalk.v1.json). Computations were performed against all 360 *actual* older question texts and all 147 current PR questions, with exact normalised wording tests, IDF-weighted lexical candidates and a separate explicitly curated owner relationship.

| Result | Count | Meaning |
| --- | ---: | --- |
| Exact normalized main-question wording duplicates | **0** | Does **not** exclude semantic overlap |
| Curated owner-topic relationships | **53** | Cross-bank reference edges, not conversation merges |
| CSE questions with at least one curated owner link | **45** | Retain CSE conversational application |
| CSE questions without a curated link in this pass | **102** | **Not** evidence of 102 independently novel doctrines |
| Shared general moral foundations | **25 links** | Reuse APOL/CR source principles; CSE owns pastoral context |
| Church-crisis / historical development context | **14 links** | Contextual background, not replacement moral answers |
| Sacramental foundations | **6 links** | Confession as sacrament vs CSE's specific confessional questions |
| Analogous questions | **5 links** | Similar reasoning but materially distinct questions |
| Comparison-only topics | **3 links** | Different subjects, not duplicative content |

### Three demonstrably high-value reconciliations

1. **CSE008 — good intentions / sexual choices:** Older `CHA-QA-MOR-002` / **APOL-052** already teaches that good intentions do not justify evil means. The CSE answer can refer to that doctrinal principle while answering the distinct sexual-ethics application. **Neither answer should silently overwrite the other.**
2. **CSE015 — can sexual teaching develop?:** Older `CHA-MAIN-CR-DOC-02` / **CR-DOC-02** addresses doctrinal development in general; CSE supplies the specialised moral content and witnesses. Route the source reasoning to its owner and avoid contradictory statements about continuity or change.
3. **CSE016–018 — conscience and dissent:** Older **APOL-051** and **CR-MOR-02/04** own general teaching on conscience and postconciliar disputes. CSE should preserve the pastoral question about sexuality, with precise reference rather than a second competing moral rule.

Other important reference clusters: **CSE061–070** to `CR-MOR-03` for the *Humanae vitae* historical controversy; **CSE068–069 and CSE125** to `CHA-QA-MOR-006` / APOL-052 for intended versus merely foreseen harm; **CSE131–139** to `CHA-MAIN-AQ02` / APOL-026 for the foundation of sacramental Confession, without collapsing the particular canonical rules about kind/number or Communion into a generic apologetics answer.

### Automated false-positive safeguards

Word resemblance is not theological identity. The lexical matcher suggests **CSE004 (natural law)** against a question about **miracles violating natural law**, and **CSE145 (love is love)** against **why the Bible alone is not enough**. These are not subject duplicates; **lexical top-three suggestions are marked UNVERIFIED_LEXICAL_ONLY** in each crosswalk record and never confer merge or source-owner authority.

### Canonical ownership decision

- **One source/claim owner, several conversation contexts.** APOL owns core moral method; Church Crisis owns its historical governance/doctrinal controversy; CSE owns its own specialist Q&A and direct pastoral follow-up.
- **Cross-link, do not clone.** The Chanoine can refer readers from a CSE moral application to a deeper APOL source or Church Crisis historical debate, without copying one authoritative answer into multiple production registries.
- The **11 pastorally biographical** original sessions retain their distinct sermon provenance and life-history safeguards. CSE does not take ownership of fictive memories or archival anecdotes.
- Every one of the 53 edges is **editorial research**; individual owner sign-off remains outstanding. No record is automatically suppressed, relabelled or made public.

## Character-voice comparison

Actual answer-text statistics across the two banks:

| English answer style screen | Existing 360 main answers | New CSE 147 main answers |
| --- | ---: | ---: |
| Median answer characters | **263** | **299** |
| “I” in main answer | **7/360** | **2/147** |
| “we/our/let us” in main answer | **87/360** | **60/147** |
| Phrases referring to “the Church” or Catholic teaching | **79/360** | **36/147** |

The new material is somewhat longer and more institutionally explanatory. That alone does not prove a character defect, since CSE requires sensitive explanation. However, **six actual voice exceptions** are flagged: CSE086, CSE088, CSE108, CSE112, CSE124, CSE141. They sometimes tell the reader what “a priest” ought to say rather than speaking in the fictional Chanoine's own voice. [Six complete EN/FR alternatives](./chanoine-cse-six-voice-parity-proposals.v1.json) are **proposed, not applied** and need review for source equivalence and safeguarding.

The governing identity remains the same: a **fictional traditional Roman Catholic priest, una cum Romano Pontifice, formed in the theological tradition associated with Archbishop Marcel Lefebvre**, not Archbishop Lefebvre speaking directly. Firsthand memories must never be invented; post-1991 events cannot be represented as memories of the archbishop. Scripted answers should sound like an experienced priest in conversation, not a modern neutral narrator describing a historical figure.

## Remaining work, with explicit gates

1. Review the **53 owner links** with the actual APOL/CR source dossier owners; decide whether to attach a *reference* or a visitor-controlled related-topic handoff. No suppression from lexical matching alone.
2. Apply or revise the **six proposed voice changes** in the upstream CSE batch files **and** rebuild its research composite together, only after bilingual and pastoral-safeguard scrutiny.
3. Establish French editorial translations for the **English-only older bank** separately. Do not count the 360 old dialogues as bilingual, and do not fabricate translated first-party archival quotation.
4. Preserve the CSE specialist 39-case reviewer queue, 15 applied-but-unapproved source-precision corrections and all 147 unpublished claims. Perform qualified source-by-source verification and a final content-owner/character acceptance before any runtime import.

**Final status:** No conversation merges, publication, source ownership reassignment, production edits or claims of 507 independent doctrinal topics. The 360 original index remains in the user's file collection; this PR contains only the read-only ownership snapshot, crosswalk and voice proposals.

# Le Chanoine — Bulk editorial corrections and specialist screening

**Date:** 20 October 2026  
**PR:** #1489, **draft/research-only**  
**Status:** 15 proposed bilingual source-fidelity repairs integrated as **unreviewed** editorial drafts. No doctrinal, clinical, source, language or publication approvals have been granted.

## Completed implementation

- Applied **12 earlier source-semantic repairs** to their individual upstream batch files and the assembled 147-record composite. These include substantive specificity about Pius XI/John Paul II (CSE045), reluctant tolerance of a spouse's contraception (CSE070), civil marriage's institutional definition (CSE089), and the exact scope of `Dignitas infinita` (CSE096).
- Applied **3 further precision repairs**, CSE050 (nullity and narrow forms of dissolution), CSE097 (genital anomalies / medical care), and CSE108 (diagnostic purpose, `Persona humana` §9, no invented blanket approval for sample-collection means).
- All 15 bilingual repairs now appear in upstream editorial batch files and in `chanoine-cse-147-conversation-editorial-review.v1.json`. Their two overlay registers explicitly retain draft, unapproved status.
- Committed **39 case-specific specialist review briefs**, identifying a concrete doctrinal/clinical/safeguarding boundary and source locator for every specialist-lane question. Three new source-precision issues were resolved at the draft-writing level and remain subject to expert sign-off.
- Updated the **147-item substantive review queue** to record 15 applied, uncertified draft repairs.
- Added `research/chanoine/validate-cse147.mjs`, a standalone Node.js structural validator using the immutable source Git blob SHA `7dbce397efa92b7aa8aef81b21f50fa543bbba35`. It checks source immutability, bilingual joins, debate provenance, archival restrictions, all 15 repairs and disabled approval flags.

## Verified live-branch reconciliation

The branch contents were re-fetched through the GitHub connection and compared by ID:

| Gate | Result |
| --- | --- |
| Canonical source records | 150 |
| Public-reader-eligible composite records | **147 unique** |
| Archived, not eligible for public display | CSE055, CSE056, CSE058 |
| Original public source objections | **52 preserved unchanged** |
| Original editorial follow-ups | **95** |
| Editorial main-answer revisions applied | **15/15 correctly in upstream and composite** |
| Source Git blob SHA | **7dbce397efa92b7aa8aef81b21f50fa543bbba35**, unchanged |
| Missing IDs / upstream disagreement / source drift / archival leaks | **0 found** |
| Publication, persona, safeguarding, bilingual and claim approvals | **0** |

**Validator note:** the standalone Node.js file was committed but not executed in a checked-out repository in this chat; equivalent source-data comparisons were executed through connected GitHub reads. The correct discriminator for 52 source-derived follow-ups is `EXISTING_SOURCE_OBJECTION` (not `SOURCE_DEBATE_FOLLOWUP`), and the validator was corrected accordingly. Run `node research/chanoine/validate-cse147.mjs` in an actual checkout before merging.

## Review lanes and what they mean

| Lane | Unique records | Substantive status |
| --- | ---: | --- |
| Specialist | 39 | Case-specific risk notes produced, **no expert sign-off** |
| Doctrinal source | 31 | Requires primary-source claim-level checking |
| General editorial | 77 | Requires bilingual fidelity, Chanoine character, and cross-bank ownership checking |

The 39 specialist briefs are an **editorial risk screen**, not 39 completed medical, canonical or safeguarding certifications. The source/follow-up wording remains separate from authored pastoral rewrites, and fictional Le Chanoine is not represented as Archbishop Lefebvre or the author of quotations. External comparisons of selected primary texts (including `Casti connubii` §59, `Persona humana` §9, `Dignitas personae` §19 and canons 979, 916) support the precision checks; they do **not** certify the entire corpus.

## Repository integrity and next gate

All changes are contained in `research/chanoine/`. No app reader, original source-content or the existing 360-conversation Chanoine bank was edited. A full **360-bank thematic collision and persona-parity review** has not yet been done; don't call the 147 ready to merge based solely on internal structural correctness.

Next: subject-matter approvals for specialist cases, primary-source locator checks for doctrinal lane, native French editorial parity, and comparison with the prior Chanoine canon. Then rerun the standalone validator and request deliberate human approval. **Do not merge, deploy or present as a certified persona corpus now.**

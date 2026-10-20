# Le Chanoine — Cross-bank integration tranche: source ownership, voice, French

**Date:** 20 October 2026  
**Draft PR:** #1489 `research/chanoine-cse-source-dialogue-20261019`  
**Disposition:** RESEARCH-ONLY — NO DEPLOY, NO SOURCE OWNER REASSIGNMENT, NO MERGE.

## Completed this tranche

### Canonical source-owner identity — all 53 links verified

Validated all **53 candidate relationships across 45 CSE questions** against their actual older 360 conversation IDs and against the **current** canonical `data/learn/apologetics-canonical.v1.json` (**60 dossiers**) and `data/learn/church-crisis-canonical.v1.json` (**81 dossiers**).

Verified canonical Git blobs:
- APOL: `7a24a14387af3b2f74226a0f37f41265d4c6c873`
- Church Crisis: `67476d576ae500d363773ef383ae48f8952d507f`

All target IDs exist and match the source owner IDs in the original read-only 360 working-index snapshot. [The enriched 147-row crosswalk](./chanoine-cse147-vs360-owner-crosswalk.v1.json) now carries each target's exact dossier ID, title, domain and path, with **source-owner identity verified**.

**Do not misread this as 53 approved theological relationships.** Every crosslink remains `editorial_relevance_approved:false` and `runtime_handoff_approved:false`. Lexical nearest-neighbor suggestions remain explicitly unverified. No APOL, CR or CSE answer was replaced or routed into production.

### Six character-voice corrections applied

Applied all six proposed bilingual modifications (**CSE086, CSE088, CSE108, CSE112, CSE124, CSE141**) to their upstream editorial batch files and unified 147-conversation composite. All six are still **unreviewed drafts**, with original source wording unchanged.

The edits remove detached third-person instructions about what 'a priest' ought to say, and preserve a coherent fictional Chanoine speaking directly as a traditional Roman Catholic priest **una cum Romano Pontifice**. They do not attribute quotations or memories to Archbishop Lefebvre.

[Exact six English/French revisions and application states](./chanoine-cse-six-voice-parity-proposals.v1.json). All native-French, persona, safeguarding, source-claim and publication gates remain false.

### First French parity tranche — complete for current cross-bank links

Recovered the unchanged user-owned original English-only **360-record index** (SHA-256 `69e882f2dfcad2502c890bb988789d7a01921295a33bf8ff15f7b4ec7ca8e9d5`). Of the 53 source-owner links, **21 distinct older conversations** are referenced. Authored all **21** as separate French editorial drafts, including both original visitor questions and both answer texts:

| Measure | Coverage |
| --- | ---: |
| Older English conversations | 360 |
| Older conversation drafts with French equivalents | **21 / 360** |
| Older English question–answer exchanges | 753 |
| French-drafted exchanges | **42 / 753** |
| French visitor-question fields drafted | **42** |
| French answer fields drafted | **42** |
| Source-linked 360 conversations represented in first tranche | **21 / 21** |
| Crosslink edges whose target has French editorial draft | **53 / 53** |
| Remaining old conversations without French editorial drafts | **339** |

New research files:
- [21 complete French-drafted older conversations](./chanoine-360-french-crosslinked-21-drafts.v1.json)
- [All-360 English/French parity ledger](./chanoine-360-french-parity-ledger.v1.json)

**These translations are new editorial French text, not recovered archival French words**. They preserve the separate original English authoring corpus and dossier IDs; no record becomes approved because it has been translated. Qualified native French and theological reviewers still need to verify tone, technical vocabulary and faithful expression.

## Next translation workload / batch sizing

Instead of another 21-item source search, the all-360 ledger already classifies the remaining **339** into stable lanes:

| Remaining editorial lane | Conversation count |
| --- | ---: |
| General apologetics | **239** |
| Church Crisis/historical | **89** |
| Pastoral/biographical (requires special quotation/memory checks) | **11** |
| **Remaining untranslated** | **339** |

Use substantial batches of 40–60 *distinct* conversations; preserve original owner IDs and the untouched English question/answer source. The 11 pastoral biographies must be checked for real archival words versus fictional narrative, never rewritten as Lefebvre firsthand testimony.

## Actual regression, after all changes

Re-fetched GitHub files on PR #1489 and checked:
- 147 eligible source-ID conversations; all 3 archival-only CSE IDs remain excluded.
- All six voice corrections exactly match upstream and unified composite.
- All 53 owner links point to real owner dossiers and the original 360 IDs.
- All 21 referenced old conversations have a French draft, with both exchanges present.
- Original CSE source Git SHA remains `7dbce397efa92b7aa8aef81b21f50fa543bbba35`.
- **Zero publication approvals** across combined CSE, older 360 index snapshot, French batch and parity ledger.
- All changed PR files remain confined to `research/chanoine/`, so no production app or reader routing was changed.

## Explicit outstanding gates

1. **Doctrinal/source owner**: approve the *relevance* of the 53 candidate links, not only their record existence.
2. **French language**: obtain qualified review for the 21 initial translations, then process 339 remaining as source-preserving batches.
3. **Character**: confirm tone of six applied CSE edits against the older fictional priest; avoid detached commentary and impossible memories.
4. **Specialist subjects**: 39 CSE specialist review briefs and 15 previously corrected but unapproved CSE source-semantic edits remain outstanding.
5. **Technical**: independently run the source-lock validators in an actual repository checkout/CI before merge, then retest all routing and mobile UI. Neither the 360 nor 147 working corpus may be declared published or certified now.

**Result:** source identity and translation *draft availability* are now established for all crosslinks, but this is not release readiness.

# Le Chanoine — CSE source-derived conversation intake (2026-10-19)

**Status:** internal research and editorial review only; not an app data file. The existing 360-dialogue bank is NOT incremented by this import.

## Result and validation

- 150 / 150 canonical Sexual Ethics questions recovered from the three original `src/learn/sexual-ethics-data/questions-*.js` files.
- 150 exact English questions and 150 exact French questions match the source material.
- 150 English answers and 150 French answers copied without rewriting.
- 63 optional English/French long-explanation pairs exactly match existing source `d` fields.
- 55 debate counter/response pairs in both languages exactly match their five original debate source files.
- 95 questions lack a source-matched debate follow-up; no artificial follow-up has been invented.
- 205 total question/answer exchanges *in source form*: 150 initial Q&As plus 55 already-existing debate follow-ups. **Not** 205 newly authored persona exchanges.
- All 150 entries retain topic owner `SEX-CORE-*`, the exact original file, source-key pointers, and available Scripture/documents locators.
- All 150 entries remain `publication_approved: false`, `persona_voice_approved: false`, and `claim_level_certified: false`.
- Byte-exact field comparisons found 0 mismatches; no missing canonical question IDs or unmatched debate IDs.

## Visibility reconciliation

Source metadata (`data/app/content-items-sexual-ethics.v1.json`) broadly reports 150 PUBLIC_QA_REPORTED records. The **governing recovery/visibility index** (`data/learn/formation-qa-recovery-visibility.v1.json`) separately establishes 147 PUBLIC_READER and 3 EDITORIAL_ARCHIVE_WITH_REDIRECT entries:

- `CSE055`: archived, redirect to `CSE057`
- `CSE056`: archived, redirect to `CSE051`
- `CSE058`: archived, redirect to `CSE057`

Each imported record has an explicit `source_access` field. The visibility index prevails over the broad source catalog; no archived record is approved for public discovery.

## Provenance and character safeguards

Le Chanoine is a fictional traditional Catholic priest in communion with the Roman Pontiff (una cum), shaped by the theological outlook and pastoral style of Archbishop Marcel Lefebvre, but not Lefebvre himself. The CSE source answers are doctrinal texts by another editorial pipeline and **cannot be presented as quotations or autobiographical testimony of Lefebvre**. Later sources and applications cannot be retroactively attributed to him.

The current JSON intentionally preserves prior source language, which frequently sounds like a neutral reference answer rather than a fully realised Chanoine conversation. The persona and dialogue review gate remains open.

## Next production gates

1. Edit all 150 initial answers into natural direct-address priestly dialogue, retaining the original source text separately for comparison.
2. Integrate and voice-edit the 55 genuine documented objections; preserve their opposing viewpoint faithfully, not as caricature.
3. Write **95 question-specific follow-ups** only where evidence supports a meaningful challenge; keep unresolved topics flagged rather than filling them with boilerplate.
4. Apply specialist checks for sensitive sexual ethics, safeguarding, coercion, marriage and procreation; distinguish doctrine from individual medical or canonical advice.
5. Validate user-facing visibility, speaker identity, question-to-source provenance, and no duplicate IDs against the existing Chanoine unified bank before any publication proposal.

**No production integration, approval or publication is sought in this research PR.**

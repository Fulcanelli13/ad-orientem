# Living Catena — 24 inherited-Chrysostom lexical parallels: source-grounded comparison

**23 October 2026 · research only · original words unchanged · no human review / no publication**

## Research advance

The prior broad Schaff 1888 English OCR → Oxford/Newman *Catena Aurea* Matthew comparison identified **24 original-work research snippets** with at least one distinctive contiguous-five-word match to a canonical Catena excerpt **under the inherited Chrysostom attribution**. The new `scripts/scripture-catena-chrysostom-focused-parallels.mjs` now resolves **each side of every comparison into actual original words**:

- Chrysostom *Homilies on Matthew*: exact question-context source strings, adjoining printed prose, unit/line provenance and SHA-256 from the independently archived 1888 print OCR.
- The frozen *Catena Aurea* Matthew corpus: original Oxford/Newman excerpt text, original excerpt pointer (`catena.matthew.<chapter>.<verse>:<segment>`), and its inherited Father label, each with SHA-256. **This is not an AI paraphrase of a Father.**
- The precise shared five-word strings that triggered the pairing; literal checks verify that the words occur in **both** source editions.
- For each matching phrase, whether it appears inside a separately delimited printed **quotation span**, whether it occurs outside detected paired quotes, and whether the quotation's boundary is incomplete.
- All original OCR speaker/footnote/quotation risks and an internal source-inspection order. Ordering is only a research convenience, never a grade of theological or text-critical correctness.

## First results from the 24 same-inherited-author matches

| Source issue | Number of research contexts |
| --- | ---: |
| Source-exact Chrysostom-to-inherited-Chrysostom pairings assembled | **24** |
| Unique canonical Chrysostom excerpt pointers retrieved | **24** |
| At least one paired double-quotation span in ensuing historical OCR prose | **14** |
| Matched five-word text occurs inside a paired printed quotation | **9** |
| Unpaired or unresolved quotation delimiters in cropped text | **5** |
| Authoritative proof that paired passages contain equivalent patristic commentary | **0** |
| Verified newly absent-from-Catena answers | **0** |
| Human-editor approvals / public Messenger additions | **0** |

The **nine quoted-word overlaps** are particularly important. A repeated phrase may be a **Gospel quotation shared in separate commentaries** rather than duplicate explanatory argument by Chrysostom. These printed quotation marks are typographic evidence and **not** independent proof that their content is Scripture. The five incomplete quote boundaries must not be resolved by guessing missing characters or attributing everything to Chrysostom.

The 24 same-label results reflect the **inherited attribution of the canonical Catena**, not independent original-Greek authorship verification. A matching Father label does not establish that both complete excerpts derive from precisely the same original work or express identical reasoning.

**Source quality caution:** the 1888 source is OCR of the period's printed English translation. It can contain notes, footnotes, biblical wording, OCR column errors or split rhetorical questions. The original OCR is never silently corrected in the record; high-confidence source-owned reply boundaries are **not yet certified**.

## Why we cannot simply delete 24 duplicates

The two editions are in different historical English translations and abridge/materially rearrange homilies differently. A literal match can be the Gospel passage being quoted, an ordinary phrase, or a shared portion of patristic exposition; and source texts with no five-word match can still express exactly the same theology. Therefore our registry still distinguishes:
- `literal_lexical_source_overlap`: proven common five-word sequences, text/fragment locators only;
- `canonical_author_heading_same`: inherited source label match, not a critical-authorship claim;
- `shared_quoted_words_possible`: words observed inside printed quotation delimiters;
- `same_patristic_argument`: **not established** without inspecting the full original argumentative unit;
- `additional_original_work_material`: **not established** by the absence of keyword overlap.

## Next corpus-development step

Use the 24 complete source-parallel records to reconstruct **source-owned** answer sentences and embedded Scripture/footnote quotation spans. Preserve the entire originally attested passage in its historical printed English, with a stable line and source pointer. Then determine whether the *argument*, rather than merely the words, is already represented in the Catena. Scale the same source-evidence contract across the remaining 143 initial nonmatches and beyond the original 180 sampled homily contexts. These steps remain automated research with explicit unknowns; **do not initiate human reviewer approvals or promote new Messenger questions**.

## Reproduce

```sh
node scripts/scripture-catena-chrysostom-catena-overlap.mjs
node scripts/scripture-catena-chrysostom-focused-parallels.mjs
node tests/scripture-catena-chrysostom-focused-parallels.mjs
```

Generated research files: `dist/schaff-chrysostom-focused-parallels/focused-chrysostom-source-parallels.v1.json`, plus `summary.v1.json`. The archive is attached to the **Living Catena whole-corpus source audit** GitHub Actions job. The acceptance tests validate every original source SHA, entire canonical excerpt string, shared phrase, source attribution, quote offset and nonpublication flag.

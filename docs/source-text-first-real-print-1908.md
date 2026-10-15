# First original-print extraction fixture: Adrian Fortescue, *Canon of the Mass* (1908)

Date: 15 October 2026. **Draft PR #1229 only.** This is source-parsing infrastructure work, not Mass-content research or a production reader rollout.

## Choice of primary witness

Fortescue's *The Mass: A Study of the Roman Liturgy* has at least distinguishable 1912, 1914, 1917, 1922 and later reprint witnesses. The [Cornell/Internet Archive 1912 scan](https://commons.wikimedia.org/wiki/File:The_Mass_-_a_study_of_the_roman_liturgy_(IA_cu31924029398553).pdf) is bibliographically established, but no complete OCR/page-image collation of that volume has been performed. It therefore **remains blocked for full-text import**. Do not treat another edition's printed page references as its own.

The first scan-backed text fixture instead uses a *different work* by the **same author**:

- **Work:** Adrian Fortescue, “Canon of the Mass,” *The Catholic Encyclopedia*, vol. III (New York: Robert Appleton Company, 1908). [Bibliography / attribution](https://www.newadvent.org/cathen/03255c.htm).
- **Original volume:** English 1908 printed setting, scanned as *Catholic Encyclopedia, volume 3.djvu*; this is **not** Fortescue's 1912 monograph and not a later 1913 edition merely because the umbrella Wikisource collection is labelled “Catholic Encyclopedia (1913).”
- **Printed p. 255:** [DjVu image 303](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/303) — first sentence on the Canon's Eucharistic character, in the right-hand bottom column.
- **Printed p. 256:** [DjVu image 304](https://en.wikisource.org/wiki/Page:Catholic_Encyclopedia,_volume_3.djvu/304) — opening of “II. History of the Canon” at the right-hand column.
- The 48-page offset between printed page and scan sequence was **visually confirmed for these two pages**, not assumed for every page in the volume. Do not infer whole-book offset stability from two samples.

## Exact limited sample

`data/source-text/fortescue-1908-print-excerpts.v1.json` stores **two short, visually checked original-print sentences**, each independently connected to a printed page, exact scanned image and stable reviewer-selected anchor. The original words were compared against the original page *images*, not copied from later online transcription. The scan's raw Page: OCR is visibly error-prone and is **not** an acceptable authoritative passage source without manual collation.

The work's `REPRODUCTION_CLEARED` flag has `scope: REVIEWED_EXCERPTS_ONLY`, an explicit **two-anchor, exact-text whitelist** and a named preliminary internal review. The basis is the 1908 publication and 1923 death of the author; the underlying printed English words are public-domain material in the United States and ordinarily in life+70 jurisdictions. **This is not an independent legal opinion for every country, nor a licence for the entire article, the 1912 book, a new editorial layout or hosted modern transcripts.** Human release approval remains expressly `NOT_GRANTED`.

## Technical acceptance

- A new `PRINTED_PAGE_EXCERPT` witness profile distinguishes `p255:s001` and `p256:s001`; the resolved metadata references the *printed pages* and exact *DjVu scan URLs* without treating page 303 as printed p. 303.
- Every individual passage can carry its own host URL, supporting a package that spans scanned print pages without losing source-specific identifiers.
- `assertPassageReproductionScope` prevents unapproved text or extra paragraphs being packaged, and independently rejects modified bodies on chunk loading even when IDs are not altered.
- `tests/source-text-real-print-fixture.mjs` verifies the two original short passages, the two host-page mappings, exact-text approvals, duplicate/unverified page rejection, cross-edition rejection, zero-fetch metadata search and one-chunk-per-passage retrieval.
- This sample is deliberately *only two short passages* and is created **in CI memory** from the fixture. There is no new production reader, public download route, or backdoor to the 65-card Mass reader.

## Remaining before expanding corpus

1. Human editor re-checks exact text against printed images, original edition metadata and page-offset assumptions for every selected passage.
2. For the next approved public-domain article/book, test real structured HTML or corrected OCR at **hundreds of passages**, with paragraph-vs-footnote, cross-page breaks and table/gloss handling; do not build one giant dump.
3. Attach text-colllation reviewer and jurisdiction-specific rights assessment to each extracted edition and ensure that any broader approval is explicit rather than inferred from the two-sentence fixture.
4. Profile actual network gzip, lazy opening, offline cache and phone view. This first source sample establishes *a real printed-witness route*, not real-book scalability.
5. Source-owner review before any optional handoff to Mass/Formation/Prayer. No other module is altered.

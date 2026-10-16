# Mystery of the Mass — editorial French, canonical Bible and art cross-module handoff

**14 October 2026 · Research branch only. No native French sign-off, no production release, no additional Mass-reader or Scripture-reader owner.**

## Outputs in this batch

1. [Twenty-four French first-pass narratives and their transitions](../../data/learn/research/mystery-mass-biblical-24-french-editorial-drafts-20261014.v1.json). These are substantive drafts paired one-to-one with [the English source-led script](../../data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json), preserving author-level claims, Scripture references and theological cautions. No French chapter is passed off as an independent ecclesiastical or native-language approval.
2. [Twenty-four-scene real Bible Places / art / Scripture crosswalk](../../data/learn/research/mystery-mass-24-bible-atlas-artwork-scripture-handoff-20261014.v1.json). Every reference to an Atlas place uses a **real existing source event ID**, not a place/title guess or fabricated coordinate.
3. [Executable source-handoff integrity test](../../tests/mystery-mass-bilingual-scripture-art-handoff.mjs) in the existing editorial CI. It validates original-source IDs, 51 exact single-chapter Scripture links via the shared `parseScriptureContext` parser, existing owner identity, French text completeness, artwork hash/approval provenance and explicit unpublished status.

## Exact Scripture reader ownership

The application already has an independent `src/scripture/browser-entry.js` entry point with `AO_SCRIPTURE_CONTEXT_V1.open(reference,{language,onCloseReturn})`. This is the only contextual Bible owner to use for Mystery. It also owns selection, translation availability, chapter expansion and return to the caller.

**Mass → Study → Mystery navigation does not duplicate Bible verses.** Each mystery scene nominates a primary verse range and additional chapter-context readings. The app should invoke the shared reader with an exact one-chapter reference, then return to the originating arc and scene. For multi-chapter sources (Creation, long prophetic texts), provide two distinct read targets rather than passing an invalid cross-chapter coordinate.

The translation edition controls and source locks already established in Scripture remain authoritative. In particular, the manuscript's biblical reference must never rewrite the Missal's Latin, conjure unavailable verse text or silently renumber Vulgate Psalms.

## Canonical biblical locations recovered

The ten exact `data/explore/bible-places-compact.v1.json` event IDs linked here are:

| Mystery scene | Exact Bible Places ID | What it witnesses | Atlas source membership |
|---|---|---|---|
| SH13 · Incarnation | `nazareth-e1` | Annunciation | Visible in 151 Atlas source |
| SH14 · Nativity | `bethlehem-e1` | Birth at Bethlehem | Visible in 151 Atlas source |
| SH15 · Lamb of God | `jordan-east-bank-additional-007` | John's testimony to the Lamb | Exists in compact corpus; not found in published 151 sequence source |
| SH16 · Bread of Life | `capernaum-e3` | Bread of Life discourse | Visible in 151 Atlas source |
| SH17 · Jerusalem entry | `olives-e1` | Triumphal entry | Visible in 151 Atlas source |
| SH18 · Last Supper | `cenacle-e1` | Eucharistic institution | Visible in 151 Atlas source |
| SH19 · Gethsemane | `gethsemane-e1` | Agony in garden | Visible in 151 Atlas source |
| SH20 · Calvary | `golgotha-e2` | Crucifixion and death | Visible in 151 Atlas source |
| SH21 · Resurrection | `emmaus-e1` | Risen Christ with disciples | Visible in 151 Atlas source |
| SH22 · Ascension | `olives-e3` | Ascension | Visible in 151 Atlas source |

Source appearance is a *candidate matching signal* and not a claim that a programmatic route has already been installed. Old Testament episodes and the heavenly Jerusalem do **not** acquire invented map pins.

## Existing Sacred Art corpus

The current large art catalogue in `platform/885-sacred-art-candidates` holds 235 subject requirements; 16 of the Mystery scenes can be assigned an existing **subject** ID without assigning a painting. The other eight currently remain without exact matching artwork subjects in this crosswalk, which is preferable to treating general iconography as exact.

Six existing subject selections in the curator registry are viable **review candidates** for reusing one original artwork record:

| Mystery scene | Originally curated target | Existing original ID |
|---|---|---|
| Incarnation | `rosary.joy1` | `met-438724` |
| Nativity | `rosary.joy3` | `cma-143784` |
| Gethsemane | `rosary.sor1` | `met-442488` |
| Calvary | `rosary.sor5` | `cma-129386` |
| Resurrection | `rosary.glo1` | `cma-78982` |
| Ascension | `rosary.glo2` | `met-436835` |

All six are linked to an earlier selection and original SHA; **none is approved as a Mystery-of-the-Mass illustration yet**. Per the curatorial rules, a subject or original may be aesthetically unsuitable in this module even if suitable elsewhere. Do not reoffer any explicitly rejected artist or reviewed image, and do not use the editorial "selected" label as proof the canonical artwork has a usable file, release right and quality-approved crop.

**Zero artwork files imported into this branch. Zero artwork IDs selected for publication.** The source catalogue remains authoritative; this branch records potential reuse, not a competing painting collection.

## Actual readiness

| Subsystem | Research coverage | Publication |
|---|---|---|
| Biblical narrative English | 24/24 source-led first drafts | Not approved |
| Biblical narrative French | 24/24 paired first drafts | Native review required |
| Liturgical Study chronology | 39/39 existing Mass study owners with bilingual content; 14 Canon source-critical treatments | Independent editorial acceptance required |
| Contextual Scripture references | 51 parser-ready exact chapter/range entries (plus existing Mass–Bible links) | Reader available, Mystery route not installed |
| Exact Bible Places IDs | 10 compact event identities; nine probable Atlas 151 members | App link not installed |
| Sacred paintings | 16 subject IDs and six preselected-original reuse prospects | 0/24 Mystery image approvals |
| Full product integration | Research-only files and automated contracts | Not implemented in user-facing app |

### What comes next

Concentrate editorial work on actual doctrinal and prose review **before** publishing. The French drafts need source-level native review; the Old Testament scenes with no direct specific author argument need better patristic/historical evidence or a shorter supporting role. Confirm the nine Atlas event keys from the runtime 151 manifest, then allow the existing Scripture reader's callback-based return in the future Mystery page. The artwork pipeline must itself accept any image for this module.

No source-grounded passage, author dispute or older interpretive method is deleted or replaced to reach numerical coverage.

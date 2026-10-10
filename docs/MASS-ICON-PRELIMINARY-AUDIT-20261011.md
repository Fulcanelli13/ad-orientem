# Mass icon preassignment — compact audit
**Source branch:** `mass-icon-preliminary-assignments-20261011` · **Date:** 11 October 2026
**Status:** preliminary proposal only; canonical Mass runtime icon bindings have not been changed.

## Coverage of 608 source assignment targets
| Status | Count | Meaning |
|---|---:|---|
| Your earlier selected choices | **42** | Preserved exactly, without re-approval |
| Additional source/semantic matches | **496** | Automatically proposed, not yet explicitly approved |
| Provisional / questionable | **66** | Use only after resolving contextual ambiguity or artwork fidelity |
| Exact icons missing | **2** | No sufficiently specific source artwork |
| Intentionally no icon | **2** | Minister/response voice records would duplicate another rail |
| **Total** | **608** | Includes repeated source cues, not 608 unique drawings |

The review page now starts with the **68 provisional/missing items**, not the entire 608-target list. Your 42 confirmed choices remain untouched. The source ledger is `data/presentation/mass-icon-preliminary-assignment-20261011.v1.json`.

## Image-quality inspection (all frozen v1.80 / Mass v4.6 masters)
The 67 files comprise **10 native vector icons** and **57 embedded raster originals transported inside .svg wrappers**. Their true resolutions were read from the PNG headers, not inferred from extensions. Most rich priest drawings are 1024×1024 and important original cues are up to 1254×1254. Some smaller original items are 259×475 (incense), approximately 469×436 (fraction/commingling/communion), or 512×512 (turn-back/Canon). These are *fidelity/legibility review flags*, not automatic replacements. The earlier user selections take precedence even where an alternative has higher raw pixel count.

## Highest-priority gaps
**Two genuinely missing exact illustrations:** the priest keeping thumb and index fingers joined after the Consecration, and the end of that discipline after the ablutions. Both are distinct states and should not be represented by generic hands-joined or Sign of Cross artwork.

**17 Campion-matrix records remain pending exact-master approval:** all now have provisional candidate icons, but their source `iconStatus=PENDING_EXACT_MASTER` is not overwritten. The weak clusters are conditional faithful bow/genuflection after the Confiteor, during Gloria/Credo and at the Elevations; priest raised-eyes/hands and hands-over-oblations; and the minor elevation, for which a generic Canon icon is not an exact depiction. The two-dimensional visual of "reverent attention" uses a provisional Look cue, not a mandated posture.

**Other weak categories:** five priest-station records (foot of altar and route/async placeholders), semantic approximations among priest actions (including blessing incense, receives incense, minor elevation and offering/receiving), and non-specific narrative rubric icons. These are surfaced in the filtered reviewer rather than hidden as complete.

## Pending decisions, already shortlisted
The user's **10 explicit Investigate** identities stay provisional: `priest:foot`, `priest:return_altar`, `priest:blessing`, `priest:profound_bow`, `other:commingling`, `other:communion`, `other:epistle`, `other:fraction`, `other:gospel`, `other:incense`. The existing Mass art is used only as a **suggestion**; no preference has been inferred.

## Integration discipline
1. Keep the 1962 rubrics, Crampon Bible research and Campion gesture witnesses distinct. Campion is explanatory, not a substitute for rubrical authority.
2. Do not promote provisional candidates or change priest/faithful cue ownership without review.
3. After approval, integrate the semantic map and test action/gesture/status icons in the Mass reader, especially at Gloria/Credo and the elevations.

**Reviewer:** `reviews/mass-complete-icon-assignment-atlas-20261011.html`. It retains the 304 artwork entries (231 accessible individual source files, 73 catalogued/no standalone file) but opens on the short provisional/missing subset; decisions can be exported as JSON.

# Ad Orientem — 1962 LIVE ceremonial atlas, research phase 2 (11 October 2026)

**Status:** research-only; **NOT certified for runtime or published French rubrics**. The existing 1962 Canon, LIVE48 display identities, Low-Mass and Missa Cantata form contracts remain authoritative. No change to production card order, text, cue ownership, or liturgical profile is authorized by this document.

## Source hierarchy
1. **Normative 1962:** *Missale Romanum* (1962), *Ritus servandus in celebratione Missae*, II–XIII. [Readable primary translation](https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/).
2. **Form-specific ceremonial interpretation:** canonical form definitions in `data/mass/form-registry.v2.json`, `data/mass/low-mass-profile.v1.json`, and `data/mass/missa-cantata-certified-profile.v1.json`; distinguish Missa Cantata with/without incense and Solemn Mass with deacon/subdeacon.
3. **Historical study only:** St Alphonsus, *The Holy Mass* (1889, esp. “The Ceremonies of the Mass”); Adrian Fortescue, *The Mass: A Study of the Roman Liturgy* (1914). Neither historical description overrides the 1962 rubrics. These volumes explain ceremonial history and practice, not the binding later form.
4. **Congregational customs:** local and community posture rules are separate from the normative priest/ministers' rubrics. Do not infer a lay kneeling/standing track from celebrant movements.

## Research result (phase 2)
- **554** comparison rows already keyed to canonical text: **275 Low** and **279 sung**. The source identity remains `AO.SM.C####`, not invented punctuation/string scanning.
- **98** prior 1962 Ritus provisions individually classified for anchor alignment; **73** text-linked (including split/repeated phrases), **25** require conditional, ceremonial, visible-state, or cross-macro handling. Classification is **not** liturgical certification.
- **98** French short + detailed explanatory rubric drafts, with specific Ritus section/page references, kept out of the public-facing app pending review.
- **65** additional Solemn ministry candidate events: deacon **34**, subdeacon **22**, acolytes **5**, thurifer **4**, each with its own actor, station, trigger, condition and source page.
- The full comparative workbook and structured review package are distributed separately as `Ad_Orientem_1962_LIVE_Ceremonial_Atlas_Low_Sung_v2_RESEARCH.xlsx` and corresponding `.json`. **Their content is NOT automatically imported by this PR.** All rows need review before any runtime promotion.

## Eight acceptance gates

| Gate | Mandatory protection |
| --- | --- |
| GATE-1962-001 | No second Confiteor in strict 1962 playback. Sung donor `AO.SM.C0235–C0241` remain historical/conditional; do not assume they currently play without runtime evidence. |
| GATE-1962-002 | Research pinpoint `MR62.057` (“Nobis quoque”) and `MR62.058` (“sanctificas”) are incorrectly grouped under macro M18 in the v1 evidence layer; canonical cue ids C0196/C0200 belong to **M17**. Fix research attribution, never renumber cues. |
| GATE-1962-003 | Decompose Host and Chalice elevation into genuflect → elevate → replace → genuflect; the visible cue C0174/C0181 may reference these independent subevents. |
| GATE-1962-004 | Separate Low, Missa Cantata (with/without incense), and Solemn actor role maps; a Missa Cantata is not simply a Solemn Mass without ministers. |
| GATE-1962-005 | Requiem branch: entry incensation, water blessing, Agnus Dei words/breast-strikes, Gospel book kiss, dismissal and final blessing are separately gated. |
| GATE-1962-006 | Congregation posture is profile/custom driven, not universal obligatory 1962 priest law. |
| GATE-1962-007 | Priest private text, public minister/schola singing, faithful cues, and bells remain separate timelines; no substring or text-scroll ownership inference. |
| GATE-1962-008 | Historical books never confer normative authority to an action contradicted/omitted by the 1962 Ritus. |

## Main source sections for Solemn minister roles
- **Entrance and preparatory prayers:** *Ritus* II.5, III.6–9.
- **Incensation, Gloria:** IV.4–7.
- **Collect, Ember orations:** V.5.
- **Epistle, Gospel, Credo:** VI.4–8, including deacon singing the Gospel and subdeacon singing the Epistle.
- **Offertory and incensation:** VII.9–11 (paten and humeral veil; wine/water; Lavabo; incense).
- **Consecration and elevations:** VIII.8 (torchbearers, thurifer, deacon, subdeacon).
- **Pater, Pax, Communion:** IX.4 and X.8–9.
- **Postcommunion and dismissal:** XI.3 (deacon chants `Ite, missa est` at Solemn Mass; celebrant chants it at Missa Cantata).
- **Requiem exceptions:** XIII.1–2.

## Required promotion procedure
1. Verify every point against the printed 1962 Latin Missal and compare the English translation.
2. Attach every event to exact canonical cue or a separately typed, observable *non-text event*. Keep low-level movement route steps independent.
3. Test all three forms plus incense/no-incense, Requiem, seasonal Collect/Oratio super populum, Communion/no Communion, and special-rite branches.
4. Verify French text and the chosen icon bank semantic ID, without creating new duplicate icons.
5. Only then propose a runtime-data PR, with original 48-card LIVE and Low-Mass regression tests. Existing LIVE must remain unchanged until that QA passes.

Research register owner: **separate review layer**; original canonical `data/mass/gesture-matrix.v1.json`, `data/presentation/reader-*.v1.json` and Mass text corpora stay untouched.


## Latin-verification pass — batch 3 and lay-posture separation — batch 4

The revised research stack (all **non-runtime**) adds:

- **46** general/priest/server ceremonial actions in batch 01 (up from 44 after splitting the three `Agnus Dei` breast strikes);
- **67** Solemn-Mass actor events in batch 02 (including 12 Requiem conditional cases);
- **36** exact Latin phrase/cue matches in batch 03, each with a short and detailed **draft** French priest rubric;
- **23** faithful Sung-posture state/classification rows in batch 04; **five** tagged as purely local customs and **five** requiring an observed non-text state.

These are overlapping matrices, not 46+67+36 independently certified unique moments. The Latin phrase data uses a labelled 1962 bilingual transcription; it is **not** independent line-by-line certification of the original printed Latin 1962 facsimile.

### Three corrected source ownership errors

1. **`Quam oblationem`**: at `C0163` the celebrant has joined hands; the three crosses start on **`C0164`** at `benedictam, adscriptam, ratam`. The subsequent Host-only and chalice-only crosses are respectively **`C0165`** and **`C0166`**. See *Ritus* VIII.4.
2. **`Agnus Dei`**: priest's three successive breast strikes occur at **`C0222`**, **`C0223`**, and **`C0224`** on the words `miserere nobis`, `miserere nobis`, `dona nobis pacem`. No breast strikes in the Requiem branch. See *Ritus* X.2, X.4.
3. **`Gloria Patri` at `C0010`**: belongs to the foot-of-altar `Iudica me` Psalm, not the Introit, and is omitted when that Psalm is suppressed in Requiem and from Passion Sunday through Holy Thursday inclusive. See *Ritus* III.6.

### Another source-provenance warning

The IntraText Latin `LAT0820` rendering is **not** to be silently identified with the exact 1962 edition: its solemn Offertory rubric VII.9 includes `et in Feria VI Parasceve` in the subdeacon-paten exception, whereas the 1962 printed/labelled witnesses examined here retain the Requiem exception only. Treat IntraText as a **non-certified variant text for 1962**, useful for discovery, never as the controlling 1962 witness.

1962 labelled Latin/French transcription: https://fr.scribd.com/document/542057936/Ritus-Servandus-1962

1962 Latin printed facsimile for next review: https://www.musicasacra.com/pdf/missale62.pdf

Earlier noncertified IntraText variant: https://www.intratext.com/IXT/LAT0820/_PI.HTM

### Current acceptance gate

CI checks confirm **structure and exact canonical phrase matching**, not historical/academic authority beyond the source evidence. The main app is unchanged. Before moving these records into LIVE/Priest Mode: check printed 1962 Latin against each phrase, resolve prior incomplete minister choreography and any local custom, complete French editorial review, and run actual Low/Missa Cantata/Solemn/Requiem phone regressions. Keep the 48-card LIVE identity and independent Schola and faithful state lanes intact.

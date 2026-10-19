# Ad Orientem — Mass annexed-rites acceptance matrix
**19 October 2026 · PR #1441 · source-owned, draft, not released**

## Acceptance definitions

- **Source graph** = canonical 1962/recovered ceremony event chain; one event is not automatically one reading page.
- **Latin witness** = printed or otherwise independently pinned Latin rite payload.
- **EN/FR parallel** = actual text aligned to the Latin liturgical text; an editorial summary, introduction, or rubric in that language **does not** count.
- **Missal page** = display-only section. Page turns must never advance a rite event before the final reading page.
- **Completion** = all relevant Latin/vernacular text, personal and ministerial actors, alternate 1962 routes and Mass handoff independently verified on a phone. Structural integration alone is **not** completion.
- All scores below are **coverage states, not aesthetic approval or an assertion of full printed-Missal collation**.

| Celebration/annex | Canonical source | Latin & stages | EN/FR | Missal internal pages | Activation/handoff | Release disposition |
|---|---|---|---|---|---|---|
| Asperges / Vidi aquam | ASP (6 records), R20 | Full seasonal antiphon, psalm, Gloria policy, repetitions, 3 V/R, **Orémus**, collect, Amen | **Crosschecked editorial EN/FR** in all 13 ordinary (or 12 Passiontide) source rows; independent facsimile collation remains | Two internal pages for versicles and collect; chant retained in order | Only if preceding rite selected, to FOOT_CLUSTER; personal cross on actual sprinkling, no minister kneeling imposed | Automated phone gate, seasonal tests and editorial signoff required |
| Palm Sunday | PALM, R22 | Latin blessing, distribution, Gospel, procession and return | Not available in source-built pages | Blessing prayer isolated from dialogue, procession cue and *Gloria laus* separately, conclusion V/R retained before concluding prayer; the long Gospel remains one sourced row | Participant state explicit; INTROIT with prescribed opening/Last Gospel variations | Bilingual and visual gaps |
| Ash Wednesday | ASH, R23 | Latin blessing/distribution and four orations | Not available in source-built pages | Four whole orations separated | Recipient cue personal; INTROIT | Bilingual gap |
| Candlemas | CND, R24 | Latin 5 orations, distribution, procession, candle state | Not available in source-built pages | Five whole orations separated | Blessing/reception and procession only from source; INTROIT | Bilingual gap |
| Rogations/Greater Litanies | ROG, R25 | Latin prayers and complete, undoubled Litany | Not available in source-built pages | Complete V/R pairs and concluding orations | Conditional walking vs public supplications; INTROIT | Bilingual gap |
| Requiem Absolution | ABS, R26 | Latin, with optional body/catafalque and burial hymn branch | Not available in source-built pages | Libera me refrain/responses; Kyrie/Pater, paired intercessions and whole oration/Amen on separate reading pages | Only if following action explicitly selected; burial hymn depends on actual body and procession | Bilingual and branch phone gap |
| Corpus Christi | CORPUS, R27 | Latin Pange lingua, Tantum ergo, Benediction | Not available in source-built pages | *Pange lingua* on two two-stanza pages; Benediction V/R and Orémus/prayer/Amen independently | Explicit following action, omitted final blessing/Last Gospel plan; procession opt-in | Bilingual and page-gap |
| Holy Thursday translation | HT_POST, R31 | Latin Pange lingua, Tantum ergo, altar stripping | Not available in source-built pages | *Pange lingua* split by complete stanzas; 13 Psalm 21 source lines grouped with antiphon only at opening and close | Movement only for joining participants; to post-Mass lifecycle | Bilingual and page-gap |
| Generic following procession | PROC, R29 | **Structural-only**, deliberately no feast-specific prayers | **None** until dedicated profile supplied | Structural stages only | Cannot infer procession from feast/date; participant opt-in, then lifecycle | Not full text-ready |
| Good Friday (distinct rite) | GF, R28 | Source-pinned Latin Passion, solemn prayers, veneration and Communion | Separate editorial layer; incomplete | Fixed ceremony stage and formula/Passion ownership | Exact Flectamus/Levate, Passion-death pause, personal cross/Communion | Bilingual and full phone parity gap |
| Easter Vigil (distinct composite) | EV, R33 (38 records) | New fire, candle, Lumen Christi, Exsultet, 4 prophecies, Litanies, font blessing, Vigil Mass | Some trilingual source rows; **Exsultet/new fire/candle/Lauds FR only editorial summary and excluded** | 12 Exsultet pages; four prophecy groups with canticles following; Litanies; 17 font segments | Source graph and separate FONT/BAPTISM branches; explicit handoff to Vigil Mass | Full FR and conditional baptism rite still incomplete |

## Source facts and corrections completed in this pass

The 1962 primary *Missale Romanum* printed source
[clerus.org Appendix II](https://www.clerus.org/bibliaclerusonline/de/gmt.htm)
specifies, for the Paschal *Vidi aquam*, **allelúia** after
*Osténde nobis* and *Et salutáre*, but not after the later responses.
The earlier R20 reader omitted both seasonal additions. It also omitted
the separate spoken **Orémus** before *Exáudi nos*.
Both are now represented by the original ASP-050 source event (no new
ceremonial record). English wording has been crosschecked against
[EWTN's 1962 ordinary](https://www.ewtn.com/catholicism/library/ordinary-of-the-tridentine-mass-11210);
French wording against [Salve Regina's 1962 ordinary](https://salve-regina.com/index.php?title=Ordinaire_de_la_messe_traditionnelle_%28rite_de_1962%29)
and the [Carpe Deum bilingual presentation](https://app.carpedeum.fr/ordinaires-de-messe/1/24).
These are source-anchored editorial translations, not certified scans.
The Passiontide *Gloria Patri* omission, Paschal antiphon and repeat,
and seasonal control remain intact.

Automated acceptance in `tests/reader-annexed-rites-acceptance.mjs`
checks eight actual annexed-rite source graphs, every spoken source
paragraph's graph ownership, stage order, Mass/lifecycle handoff,
English/French row coverage, the conditional Requiem and generic
procession branches, and participant-specific Corpus Christi and Holy
Thursday movement. The distinct GF/EV pathways retain their own
preexisting tests and source guards.

A dedicated 390px browser test now checks Asperges's French column,
complete `Orémus`/collect/response sequence, manual subdivision,
and backward return to the final prayer. Existing mobile regression
checks continue for Ash, Candlemas and Easter Vigil.

## Release gates

1. Pass dedicated `Missal posture-aware page QA`, including the
   source matrix, seasonal Asperges tests, special-rite source text parity
   and the four real phone scenarios.
2. Pass R17 Mass convergence, reader language parity, required main gate,
   special Mass/rite source focus, and Corpus/Requiem lifecycle gates.
3. Review remaining untranslated annexes **without silently filling
   text or claiming a complete bilingual booklet**.
4. Retain the PR as a draft until source gaps and visual acceptance are
   approved. No change to LIVE 48 cards, Simple 30 or canonical rite
   event timelines is intended.

This matrix is the authoritative *current known coverage ledger* only;
do not promote an annex from structural to bilingual complete without
real source rows and acceptance tests.

## Next batch: display pages for Palm, Requiem, Corpus Christi and Holy Thursday

Source-only pages are now divided without altering ceremonial stage IDs:
- **Palm** blessing antiphon and dialogue precede the complete collect;
  processional `Procedamus` response precedes the intact `Gloria laus`;
  concluding dialogue precedes the complete final oration.
- **Requiem Absolution** `Libera me` refrain and invocation-response
  pairs are divided in source order; the silent `Pater noster`, five
  concluding V/R pairs and oration/`Amen` are kept in exact source groups.
  Conditional `In paradisum` is not automatically activated by a
  Requiem Mass without the selected funeral/burial following action.
- **Corpus Christi** `Pange lingua` is presented two whole stanzas at a
  time. Benediction dialogue and `Orémus` / `Deus, qui nobis` / `Amen`
  are separate Missal reading pages. The underlying placement/return of the
  monstrance remains explicitly observed/source-owned.
- **Holy Thursday** the four `Pange lingua` stanzas occupy two reading
  pages; the existing 13 source lines of Psalm 21 during stripping of the
  altars are paginated without truncating any stanza or repeating the
  opening/closing antiphon.

All changes are **display-only** and preserve the source graph, action
timing, personal participation branches and canonical LIVE/SIMPLE modes.
Tests now exercise exact paragraph object identity, stage event ownership
and backward reopening of the previous stage's final page for 23
source groups. The 390px browser suite has added actual Corpus/Requiem
page turns and conditional procession checks. Latin-only remains
Latin-only: this is not yet a complete certified bilingual annexed Missal.

### A real regression caught and corrected

An earlier projector tried to fall back to `row.english` despite an
explicit `secondary: null` for a French Exsultet. It is now
**fail-closed:** an explicitly absent vernacular column stays absent.
This is checked by the source integrity gate as well as the French phone
display acceptance.

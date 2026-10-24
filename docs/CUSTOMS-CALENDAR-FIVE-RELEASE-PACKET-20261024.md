# Ad Orientem — five Customs Calendar release candidates (24 October 2026)

**Status: fully drafted bilingual copy; research-only; NOT published.** This replaces repeated broad source extraction as the near-term deliverable. These are **five subjects**, not eight newly discovered canonical identities or a second Calendar. The source owner remains the pre-existing unified Customs research master; the release surface is the **existing** 1962 Calendar and its article reader.

## Durable content deliverable

`data/customs/master/customs-calendar-five-final-copy-release-candidates.v1.json`

Each subject has EN/FR **title, description, history, spiritual meaning, practice, caution, occasion, regional scope**, along with source-specific claim bounds, traceable HTTPS references and an explicit Calendar selector. No copied ritual text or invented prayer is embedded. All five article IDs start with `RESEARCH-`; none is an allocated canonical `custom_id`.

| Release unit | Proposed subject | Underlying provisional group IDs | Calendar association | Ownership and release boundary |
| --- | --- | --- | --- | --- |
| CU-REVIEW-001 | Epiphany chalk and related house blessing | A-089 + A-090 | 6 Jan, 1962 Calendar | Canonicalize household chalking as a practice **separately from the priest's Roman Ritual**; link that historical authorized blessing as related rather than reproducing a clergy-only formula |
| CU-REVIEW-002 | Easter light carried home | B-025 | Existing `v384Dates(year).holySaturday` | Historically Central European/Austrian, voluntary and dependent on safe parish permission; NOT BLSS-004 Easter foods |
| CU-REVIEW-003 | Seville Cathedral Seises | B-083 + B-109 | Existing Corpus Christi resolver **and** 8 Dec Immaculate Conception | **ONE** named local institution/custom with **two** visible feast associations, not two canonical customs and never all parishes |
| CU-REVIEW-004 | Crib taken down at Candlemas | B-116 | 2 Feb Candlemas | Voluntary household custom, **not** an alternate 1962 liturgical Christmas-season rule |
| CU-REVIEW-005 | Polish Corpus Christi herb wreaths | B-085 + B-086 | Existing Corpus Christi resolver | **ONE** regional blessing + household after-use practice; contemporary local week is **not** a universal 1962 liturgical octave; no folk magic endorsement |

The five have **eight underlying source groups**, not eight canonical items. The remaining three of the previous eight editorial subjects stay held for independent evidence, precise geography or existing-owner reconciliation; they are not included here.

## Source authority, limits, and editorial corrections

1. **Epiphany:** Holy See, *Directory on Popular Piety*, §118, explicitly mentions chalk inscriptions of C+M+B and the year; Weller's translation of the 1952 Roman Ritual supplies the **different priestly** blessing. The latter's exact 1962 rubrical use is a separate gate. Weiser's source passage starts printed p.149, not 119; p.150 in the old queue is a nearby reference, not an exact first passage citation.
2. **Easter light:** Weiser 1958 original printed p.217 and the Archdiocese of Vienna describe the household Easter-light custom. A practical flame safety condition and local parish permission are explicit.
3. **Seises:** Seville Cathedral directly documents the same choirboys' dance at Corpus Christi and the Immaculate Conception; its additional Carnival Triduum is local event history and need not create an automatic Calendar date. A published historical Weiser excerpt was on printed p.265; no invented modern recurring service times.
4. **Candlemas crib:** Weiser printed p.300 plus Fr Edward McNamara's Catholic liturgical explanation support variable customs and no universal house-decorations removal rule.
5. **Polish wreaths:** Polish Ministry of Culture research and a 2012 ethnobotanical field study separately attest small herb wreaths, local blessings and domestic use. The cultural sources also *record* folk theories about magical protection: the article identifies these as history, not Church teaching. The 1962 liturgical Calendar must not resurrect a suppressed universal octave.

## Exact route into the CURRENT Calendar (after approval, not now)

The current production Calendar has a `src/calendar/customs-read-model.js` that projects the **35** published IDs from `data/customs/customs-atlas-seed.v1.json` and bilingual article modules `src/calendar/customs-extra-articles.js`, with `src/calendar/customs-profile-links.js` for contextual suggestions. These files are on **main** as of this work; they are **absent from the older stacked research base** of PR #1610, so a main parity/rebase is required before attempting implementation. Do not create a parallel Calendar resolver.

When each subject passes the gate:

1. **Identity release:** allocate a stable canonical `custom_id` *only after* deciding the action boundary; add one canonical custom (not one per source group) in the existing seed, preserving current IDs. For Epiphany preserve the priestly rite as a distinct externally linked ritual authority rather than calling it a household sacramental performed by a layperson.
2. **Attestation/source parity:** register each independent source in `data/customs/source-registry.v1.json` and provide appropriate area/place-specific attestations in `data/customs/customs-atlas-seed.v1.json`. Seville is cathedral-specific; Poland is regional; an old book alone does not certify present services.
3. **Editorial signoff:** review all EN/FR claim scopes and final ritual cautions and record genuine review acceptance; the existing `data/customs/editorial-final-acceptance.v1.json` uses human review status/digest controls. Never manufacture approval metadata.
4. **Calendar presentation:** transplant the **existing-shape** `article` object into the published article projection with its approved canonical ID. Its fields already match the eight localized prose fields plus `sources`. Link the Feast of Epiphany, Holy Saturday, Candlemas, Corpus Christi and 8 December using the existing date resolver, `additionalDateBoundIds`, and/or `calendarCustomProfileActions` as suited. One article may have two feast associations; the key-to-ID mapping must deduplicate the same ID.
5. **Regional and ceremonial limits:** local Seville/Poland references are knowledge about customs, **not** notices of services nearby; only actual authorized parish events may be displayed as events. Household Candlemas and Easter objects do not alter Mass rites. The Polish post-feast wreath-day information is descriptive context, not an automatic additional liturgical date.
6. **Regression check:** run Calendar contextual/year tests, Customs published/source/editorial tests, bilingual search and mobile Calendar tests. Existing assertions expecting 35 published customs and 24 additional published articles must be changed *only in the approved release branch* and checked against the actual new canonical counts. Preserve all original articles and the current LIVE/Missal reader.

## What was tested on the present research branch

`tests/customs-calendar-five-release-candidates.mjs` validates all five full bilingual article shapes, source URLs, research-group preservation, existing Calendar-accessor names, one Seises identity/two feast associations, the clergy/household Epiphany distinction, and the absence of approvals or publication. The dedicated `Customs Master Identity and Source Audit` workflow runs it. This research branch predates the current Calendar read-model modules; it cannot yet execute that newer runtime's UI smoke tests, so a green research CI is **not** evidence of a production screen change.

**Current release position:** 5 prepared, 0 canonical identities allocated, 0 newly published. The bottleneck is final canonical identity, bilingual claim and Calendar owner/ritual signoff—not more historical book observations.

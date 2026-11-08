# Latin-only complete Compline candidate — 28 November to 5 December 2026

PR #2640 includes a new **independently assembled** Latin-only source path,
separate from the existing trilingual Office research reader. It reads only
whitelisted `Latin/` leaves at the pinned Divinum Officium revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`. It assembles all 42 liturgical
blocks and their verse/stanza focus steps for each of the eight explicitly
reviewed appointments. It neither fetches nor silently substitutes
`English/` or `Francais/` leaves. A missing original Latin section
withholds the entire Hour, never a partial prayer.

**In-app review:** on the local development-only native Prayer → Divine Office
reader, select 28 November 2026, Compline and *Latin only*, then press Read
source preview. Switching back to bilingual reassembles the independently
validated three-language source preview.

**Release status:** this is a practical original-Latin **candidate**, not yet
a printed-Breviary-certified public Office. Its `officeCompletenessCertified`,
`rightsApproved` and `published` flags remain false until the specifically
appointed 1960 rubrical text and attribution are cleared. The Latin text has
different provenance from the English hymns and French Propers; those
translations are NOT a precondition for running or reviewing the Latin parser.

**Primary source:** [pinned Divinum Officium licence](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/LICENSE)
and [source credits and language attributions](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Help/credits.html).
No new paid service, owner contact, external renderer or annual XHTML download.

## 8 November 2026 — single-date public Latin release scope

The private eight-date source work is retained without additional release
permissions. PR #2640 now approves **exactly Saturday 28 November 2026,
universal Roman Compline, Latin only** for the native Prayer reader.

This is a **1960-rubric / traditional Vulgate** liturgical text
release, **not** a facsimile or exact-typography reproduction of the
1961 Mame Saturday Psalter pages. The printed 1961 Mame Ordinary
(§§54–67, pp. 132–141) verifies the ordered prayers, rubrics,
short Visita conclusion and both priest/non-priest dialogues.
The complete Psalm 87 and 102 text is independently compared across
the 2008 Diurnale and 2023 1962-pattern Psalter editions: 473/473
Latin words agree after documented orthographic variants, and neither
witness is represented as an original 1961 psalter leaf.

The pinned Latin Divinum Officium source is MIT licensed. The source
revision, full licence and attribution ship in
`src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt`. Neither
the English nor French translations is approved for publication by
this decision. All other Hours, dates and calendar scopes remain
withheld. A failed original-Latin source fetch withholds the Hour.

The native public loader is tested against source fixtures in both
recitation contexts and both minister cases, including all 40
printed-ordinary reading events and 41 Saturday psalm stichs.
The original 1961 Mame Vulgate Saturday Psalter leaf remains
**unverified** and cannot later be claimed as collated without new
photographic evidence. Historical draft "rightsApproved=false" references
above apply to the preceding private research state; this section
records the narrow public Latin approval.

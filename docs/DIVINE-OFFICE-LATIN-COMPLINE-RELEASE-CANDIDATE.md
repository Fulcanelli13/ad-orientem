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

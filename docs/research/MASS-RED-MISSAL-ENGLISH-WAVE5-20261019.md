# 1962 Ordo Missae — Red Missal English Wave 5: Offertory and beginning of the Roman Canon

**Date:** 19 October 2026 · **Status:** Proposed and CI-gated, not automatically published without complete regression results.

## Editorial authority and scope

The **1962 Missale Romanum** remains the controlling Latin/rubrical authority. The user-selected **2013 Coalition in Support of Ecclesia Dei Red Missal** is the preferred English editorial witness, not an authority to change Latin prayer boundaries, prescribed ceremonial, the Canon's consecration words or optional customs.

Verified directly against the **photographed 2013 booklet pages**: PDF 24 / printed 23 (bread and mingling); PDF 26 / printed 25 (incensation Psalm); PDF 28 / printed 27 (Lavabo, Trinity prayer, Orate); PDF 32 / printed 31 (Te igitur and Memento of the living); PDF 34 / printed 33 (Communicantes, Hanc igitur, Quam oblationem); PDF 36 / printed 35 (consecration of bread and wine).

This is the fifth English review batch within the pre-existing Red Missal pipeline; do not confuse with the liturgical-calendar Ordo, seasonal Propers or Mass Explorer explanation copy.

## Material mistranslation inherited in Psalm 140 (C0122)

- **Latin** Psalm 140:3–4, relevant closing clause: `ut non declínet cor meum in verba malítiæ, ad excusándas excusatiónes in peccátis`.
- **App's source before Wave 5:** `Let not my heart incline to the evil of engaging in deeds of wickedness.`
- **Problem:** Omits the substantive references to **words** and **making excuses for sins**, and substitutes different semantic content. The Red booklet's version (PDF p26) independently retains excuses for sins.
- **App proposed after Wave 5:** `Let not my heart incline to words of malice, to make excuses for sins.`

This is **not** merely archaic translation style. The former sentence is an incomplete/inaccurate representation of the original Latin prayer.

The earlier Red Wave 1 already owned the *opening* verse's missing-verb correction on C0122. This PR extends **that same exact source-owned English correction ID** `RED-EN-2013-003` to the **complete unmodified original C0122 text** and its complete corrected English text. It does **not** add a competing English rule, mutate the imported donor or discard the previously approved opening. Exact original fingerprint, idempotence, source identity and displayed reader parity are tested.

## Early Canon — four new source-specific English improvements

| Cue | Prayer | Previous phrasing | Source-checked proposal |
| --- | --- | --- | --- |
| C0150 | *Te igitur* | `Therefore, most merciful Father, through Jesus Christ thy Son our Lord, we humbly pray and beseech thee,` | `Most merciful Father, we humbly pray and beseech Thee, through Jesus Christ Thy Son, our Lord,` |
| C0151 | *Te igitur* | `that thou wouldst accept and bless,` | `to accept and bless` |
| C0163 | *Quam oblationem* | `Which offering do thou, O God, we beseech thee,` | `Humbly we pray Thee, O God, be pleased to make this same offering` |
| C0164 | *Quam oblationem* | `make blessed, approved, ratified, reasonable and acceptable:` | `wholly blessed, approved, ratified, reasonable and acceptable:` |

**Why these changes:** The Latin `Te igitur ... rogamus ac petimus` and `Quam oblationem ... in omnibus` are preserved in meaning while the English is brought closer to the more natural, prayerful 2013 Red presentation (booklet PDF 32/34). We deliberately retain `approved, ratified, reasonable, acceptable` corresponding to the distinct Latin words, rather than suppressing ritual gesture anchors or copying the booklet without regard to the exact cue breaks.

Complete concatenated prayers are checked in CI so the split C0150/C0151/C0152 and C0163–C0167 still form natural English. No Latin or French source is changed.

## Other examined material — retain what is already good

**Offertory:** 18 additional prayer/dialogue cues were checked and retained without change (C0106–0108, C0112–0114, C0116, C0118–0120, C0123, C0125–C0128, C0130–0131, C0133). The existing accepted English in the priest's bread offering (C0110), incensation (C0121), Psalm beginning (C0122) and *Orate fratres* response (C0132) is retained, except for the new C0122 final-verse semantic correction.

**Canon before Consecration:** 13 cues accepted without change (C0152–0154, C0156–0162 excluding C0155, C0165–0167). The Latin bishop placeholder on C0153 is already restored by its independent canonical Latin correction. It was not reset.

**Consecration:** 12 fixed English cues C0168–C0173 and C0175–C0180 were compared against printed p35 and retained. This includes both sacramental formulas. No preference-based revision to those texts, action cues, elevation sequences or Latin source was attempted.

**Not counted as prayer text read against the booklet:** state/rubric units C0111, C0115, C0117, C0124, C0129, C0155, C0174. Those remain in the worklist under a separate review status, not deceptively marked as faithful English prayer translations.

## Evidence-based progress

Before this review: 24 corrected English cues, 65 independently examined and retained, three priest-Confiteor cues only partially witnessed, 164 unreviewed. Following Wave 5:

| Status | Fixed cue count |
| --- | ---: |
| Approved source-English corrections | **28** |
| Examined and retained without change | **108** |
| Partial/abbreviated Red-Missal witness | **3** |
| Not yet independently collated | **117** |
| **Total** | **256** |

The 28 revised cues include nine repeated Kyrie phrases; they do not represent 28 independent paragraphs. The scope includes **four new** source-owned Canon English changes, **one materially expanded** existing Psalm-140 English correction, and **43 accepted** fixed cues without editing. Approved editorial outcomes rise to **136/256 (53.1%)**; this is an editorial progress metric, *not* Latin/English/French full correctness certification.

## Release gate

Run source-correction registry test, 256-cue English worklist and native Low/Sung × EN/FR text projection, full source suite, curated65 phone suite and R17 phone-browser. The enhanced regression test explicitly checks the corrected Psalm 140 semantic sentence; preserves the previous correction to its first verse; exercises the assembled Canon prayers and verifies **zero Latin change** for these English adaptations.

Copyright: the photographed booklet is only an independent editorial witness, never uploaded or copied wholesale into the GitHub repository. No automated OCR export is represented as editorial proof.

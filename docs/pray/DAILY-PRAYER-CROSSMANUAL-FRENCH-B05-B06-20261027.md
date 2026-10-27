# Daily Prayer research — B05 English reconciliation and B06 French witness recovery

27 October 2026 · Draft [PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785) · Research-only (no live content, no new prayer UI).

## B05: 53 additional English-manual entries compared with the original 93

Files: `data/pray/daily-prayer-crossmanual-reconciliation.b05.json` references the B01/B04 entries. All **53/53** have a family/purpose and source-witness relationship. This is not full-text automatic deduplication.

| Evidence gate | Quantity |
|---|---:|
| Initial books B01 | 4 |
| Added English books B04 | 3 |
| Initial source occurrences | 93 |
| Added English source occurrences | 53 |
| English source occurrences reconciled | **146** |
| B04 entries sharing an opening with B01 | **11** |
| B04 entries sharing an opening with another B04 entry | **10** |
| B04 instructional/rubric/user-filled entries, not ordinary prayer bodies | **5** |
| High-value candidates separately justified for historical variation | **12** |
| Verified unique complete prayer texts (facsimile certification) | **0** |

**These signals overlap**, and are not additive. For instance one B04 form may both duplicate another B04 opening and match a B01 phrase. Some shared openings lead to different full text.

### High-value results

- **Pocket Prayer-Book (1899):** morning Sacred Heart offering is not equivalent to the Apostleship of Prayer offering of Blessed Be God; its brief Act of Faith is distinct from the Baltimore long Trinitarian form; its evening examination guidance is not a standalone prayer.
- **Key of Heaven (1901):** Trinitarian/Angelic/theological prayers replicate older forms, making extra tabs unnecessary; its clothing prayer and Marian offering are separately useful optional daily devotions. Its **Visita quaesumus** belongs to the already recognized collect family; it is not a brand-new prayer merely because the English sentence differs.
- **Moran (1883):** *Good Intention* and Morning Resolution add genuine additional structure. Personal-fault blanks are user-directed resolution aids, not a prayer text or an application request for sensitive sin data. Moran's recommendation for a quarter-hour meditation is advice, not a mandatory timed stage.
- **Confiteor:** any private recitation needs a private-prayer text identity and rubrical guard; never silently import a priest's Mass absolution or an incorrect minister-facing rubric.
- **User-facing rule:** prioritize clearly distinct devotional meaning and full wording; identical historical text appears once with several citations. Typographic or lexical near variants normally become edition notes, not separate tabs.

## B06: Original French witnesses located

File: `data/pray/daily-prayer-french-witnesses.b06.json`.

| Source | Edition status | Source material actually located | Publication status |
|---|---|---|---|
| *Catéchisme du saint concile de Trente* — daily prayer appendix | **1905 printed witness**, Wikisource index pages 37–44 | 16 initial FR chapter occurrences | **HOLD:** most pages explicitly uncorrected; compare image |
| *Prières du matin et du soir*, CIHM 49569 | **Author/year unknown** | 5 FR/LA initial records; inspected microform image pages 5 (Morning) and 14 (Evening) | **HOLD:** source identification and complete prayer boundaries |
| *Petit paroissien perle*, Mame, Tours | **1884 catalogue record (BnF)** | Bibliographic proof of Morning and Evening sections; zero verified texts | **METADATA ONLY** |
| La Porte Latine online Morning/Evening Prayer | **2020 publication** | Contemporary copy of a historically witnessed traditional French devotional sequence | **Comparative only; not a historical 1905 original or independent preconciliar proof** |

### Important genuine French textual and edition relationships

1. **Adoration:** 1905 appendix has 'Très sainte et très auguste Trinité'; CIHM microform also contains it. Do not artificially show two tabs on this basis.
2. **Morning thanksgiving/offering:** 1905 text offers thoughts, words, actions, and sufferings in French, a genuine French prayer corpus witness. It should not be passed off as a translation of the English Apostleship form.
3. **Evening adoration/thanksgiving/examen light:** 1905 and CIHM scans share closely related French openings; complete and page-checked prayer comparisons still pending.
4. **French night protection:** the 1905 witness prints a vernacular form of *Visita, quaesumus*; this should map to the common liturgical collect family, preserving its exact French wording and provenance.
5. **Trent distinction:** the French daily prayer appendix in a book labelled *Catéchisme du saint concile de Trente* is **not evidence that these devotional prayers were authored by the Council of Trent**. Credit the printed edition, not an invented source author.

Sources:
- [1905 chapter beginning, digitized page 37](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/37), [morning page 38](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38), [evening page 42](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42), [night page 44](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44).
- [Photographic CIHM/ICMH prayer booklet microform, 38 PDF pages](https://upload.wikimedia.org/wikipedia/commons/5/5e/Pri%C3%A8res_du_matin_et_du_soir_%28microforme%29_%28IA_cihm_49569%29.pdf) — visually checked original P5 and P14.
- [1884 Petit paroissien perle — BnF catalogue](https://catalogue.bnf.fr/ark:/12148/cb45002504d).
- [La Porte Latine online 2020 reprint](https://laportelatine.org/spiritualite/prieres-et-devotions/prieres-matin-et-soir) — comparison only.

## Cumulative source accounting — do not add unlike categories

**Seven English-source books → 146 English source occurrences** (including instructions). **Two digitized historical/French-booklet witnesses → 21 initial French occurrences**, separately accounted. **One extra French catalogue-only edition → zero text occurrences**. 146+21 = 167 currently catalogued *occurrences* across languages, not 167 distinct prayers, not 167 publishable tabs, and not complete editions.

The 1905 source has explicit uncorrected OCR for most scanned pages; no complete French prayer body was promoted to production. The CIHM year is unknown and must remain so until identified.

## Next gate

1. Obtain edition-precise scan validation for high-impact selected prayers: Morning Offering (Apostleship/Sacred Heart/Moran), Acts (Faith/Hope/Charity), Evening repentance, bedtime Visita/St Alphonsus.
2. Exclude historical rubrics from selectable prayer text bodies; separate personal reflection from prayer.
3. Consolidate common French prayer identities and determine whether complete text is distinct; identify original French versus contemporaneous reprint.
4. Present grouped tab shortlist and approve defaults, then implement in existing `pray.morning_evening` owner with opt-in timing session controls.
5. Do not use paid services, ask for fees, or contact publishers/owners. No modern substitute as a source of historical text.

**Release status:** all research files source-qualified and linked; no 100% full-edition/text-certification claim; PR remains draft.

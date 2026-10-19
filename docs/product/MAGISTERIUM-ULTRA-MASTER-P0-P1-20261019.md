# Ad Orientem — Magisterium Ultra Master: P0–P1 registry

**19 October 2026 · Research-only; publication not authorised**

## Governing decision

**One canonical doctrine subject; multiple source-owned contributions.** The Magisterium library is an archival/reference layer shared with St Pius X, Monsieur le Chanoine, the Sacristan, Catechism, Apologetics, Church Crisis and Mass Explorer. It does **not** become a fourth avatar or a rival answer corpus.

The primary identifier is the **original issued document** (issuer, date, actual text and local passage). Denzinger numbers are scholarly concordance references **to particular passages**, never a substitute document identity, a blanket authority level or proof that an entire historical text remains applicable.

Existing **content ownership rules remain unchanged**: positive doctrine stays with the Catechism; objections with Apologetics; controversies with Church Crisis; Roman Mass mechanics with the Mass owner. Magisterium links into these records but does not overwrite any.

## Deliverables — first actual batch

| Dataset | Recovered/created | Status |
|---|---:|---|
| `data/learn/magisterium-ultra-master-documents.v1.json` | 83 document candidates: 68 issued through 1962, 15 later documents | **Index only** |
| Existing formation research reconciled | 27 documents already mentioned in existing source packs (31 source-ledger links) | References/URLs remain unapproved source leads |
| Document-level web locations located | 7: 2 original Latin Vatican pages, 1 Vatican translation, 4 Council of Trent records accessible through a later public English transcription | Textual, authority and licensing review still pending |
| `data/learn/magisterium-ultra-master-doctrines.v1.json` | 51 doctrine subject headings; 101 document relationships | Relationships proposed; not yet passage-to-claim certified |
| Existing app owner links | 53 Apologetics, 10 Church Crisis links, plus selected Pius X Catechism questions | No duplicate answers |
| `data/learn/magisterium-source-passages-pilot.v1.json` | 8 passage locators in the first six high-priority doctrine families | **No passage content copied** |
| Denzinger crosswalk | 6 **candidate** passage concordances (modern and, when found, older reference) | None yet approved as edition-certified |

A corpus-reference link **does not** mean every claim in the topic is historically or doctrinally approved. This research pass deliberately shows source gaps instead of inventing them away.

## Our first six applications

1. **Real Presence and transubstantiation** — Trent, Session XIII: decree and canons. Relevant to Pius X, the Canon and the Elevation/Consecration moments in Mass Explorer.
2. **Sacrifice of the Mass** — Trent, Session XXII, chapters I–II and later canons: reference for the Canon and Mass Explorer; do not confuse Trent's council teaching with an invented first-person statement by the Canon.
3. **Penance and absolution** — Trent, Session XIV; links to the Catechism and sacramental formation.
4. **Papal infallibility** — Vatican I, `Pastor aeternus`, chapter IV; source-linked to Pius X's catechetical discussion and the Canon's apologetics on authority.
5. **Immaculate Conception** — Pius IX, `Ineffabilis Deus`, definition; distinct from historical commentary on devotion.
6. **Scripture and apostolic Tradition** — Trent, Session IV; keep related topics of inspiration, biblical canon and Tradition distinct.

## Schema principles

- **Document registry** — unique ID, exact issuer (Council, Pope or Congregation), year, form, historical layer, topic families, verified source pointers, outstanding provenance, edition-specific crosswalk placeholders, whether source text was actually acquired, reproduction rights, authority review and publication status.
- **Doctrine registry** — unique doctrine subject, source-document candidates, links to current research-owner IDs, and an explicit status for each unverified document-to-topic relationship.
- **Passage registry** — unique excerpt locator (chapter, canon, definition, section), link to its original document and topics, source language, *candidate* Denzinger numbers and exact edition evidence, copyright/licence review and theological certification.
- **Character bridge (later)** — character answer segments must reference their character's own verified primary corpus **and may attach authoritative Church declarations**. Denzinger quotations must be recognised as editorial compilations, not claimed to be words personally written by Heinrich Denzinger or by a character.
- **Historical and modern law distinction** — a 1905 decree on daily Communion or a 1953 Eucharistic fast is recorded under its original issuer and year; nothing displays as today's binding law without a separate current-law evaluation.
- **Authority** — no numerical “magisterial rank” from document type. A document often contains different kinds of assertions. Record the actual passage's issuer, intended addressees, act and teaching scope; human review follows later.

## Why editions need care

*Denzinger, Enchiridion symbolorum* exists across multiple printings and editorial regimes. Printed old `Dz`, Denzinger–Schönmetzer and Denzinger–Hünermann conventions cannot be mechanically equated.

This batch therefore assigns **no final document-wide Denzinger number**. The pilot contains six **candidate passage-level** references requiring edition inspection: Trent's Scripture and Tradition decree (1501), transubstantiation (1642), canon on Real Presence (1651), Mass sacrifice (1743), Vatican I's infallibility definition (3074), and the Immaculate Conception definition (2803). All are expressly **provisional**; one-to-one equivalence across older numbering is not assumed. Exact passage provenance matters more than a large list of purported Denzinger numbers.

## Source and reproduction policy

Prioritise Vatican `vatican.va` original Latin where available, other historical Latin critical editions with citation and rights review, and carefully attributed public translations. An Internet translation's existence does not mean it is permitted to embed full text in a commercial app. In particular, **do not reproduce a contemporary edited Denzinger translation, arrangement or notes without rights clearance**. Do not use LLM paraphrases as original text.

Original historical documents, critical scholarly compilations, translations and secondary explanations are separate source types; only the original magisterial act sets its own authority. Catalogues are navigation aids.

## Next high-volume research batches (without one-by-one review)

1. **Coverage expansion:** fill source language, original document URL and period-correct bibliographic locators for the other 76 documents; add missing councils and papal acts by era. Record source-locator proof per document.
2. **Passage extraction:** systematically work through the six pilot areas before extending to Christology, grace, seven sacraments, Church, moral theology, social doctrine and last things. Each excerpt should be compact but context-preserving, including surrounding qualifications and canons.
3. **Crosswalk reconciliation:** verify **each** old/modern Denzinger number at the passage level against the named edition; record genuine absent entries.
4. **Overlap mapping:** connect approved passages to the existing Catechism, APOL-001…060, Church Crisis, Mass Explorer and character-specific sermons. Do not let an APOL research-dossier title certify a Canon quotation.
5. **Publication gate:** review original-language accuracy, translation/reproduction rights, doctrinal scope and character-source authenticity before any visitor-facing “Read the Church's definition” action.

**Not authorised now:** a fourth Denzinger avatar; autogenerated character answers; blank Denzinger numbers filled from a guess; religious-controversy conclusions; publication of uncured translations; a new independent doctrinal answer owner.

## Batch B2 — passage locator expansion (19 October 2026)

After source-page review, the pilot expands from **8 to 26 separately identified passage locations**, adding **18** locators without importing a single passage as visitor-facing text. Research witnesses now include the Latin Trent Session IV and XIII transcriptions, the Vatican Latin *Pastor aeternus*, the Vatican Italian *Ineffabilis Deus*, its Latin defining formula independently visible in a historical Latin footnote, and historical English translations of Trent XIV and XXII. *Ineffabilis Deus* still needs a full original-Latin critical witness. Trent XIV and XXII also require checked Latin witnesses at the relevant chapters/canons. Each witness explicitly distinguishes official Vatican, historical transcription, and online editorial reference index.

**14 modern-number candidate anchors, zero edition-certified concordances.** When a source labels a pair as “DH / DS” or “number / Dz”, those are recorded only as the source's displayed online index and a research lead, not as proof of exact Denzinger–Schönmetzer or Denzinger–Hünermann edition page/entry identity. For instance, Trent XIII chapter IV maps online to 1642 / 877 and canon II separately to 1652 / 884; a chapter and canon are not interchangeable. Source: https://rkdocumenten.nl/toondocument/679-sessio-xiii-decretum-de-ss-eucharistia-lat/.

The new records deliberately separate 1546 Trent's two Session IV decrees; Eucharistic chapters from their canons; Penance's sacramental form, contrition and priestly absolution; *Pastor aeternus* chapter III on primacy from chapter IV on infallibility; and background discussion in *Ineffabilis Deus* from its definition. For Mass Explorer, Trent XXII chapters IV–V offer **doctrinal context**, never a replacement for 1962 rubrics or a licence to interpolate character dialogue.

**Outstanding gates:** Latin witnesses for Trent XIV and XXII; bibliographic edition checks for all 14 candidate numbers; independent translation rights; passage-level doctrinal/authority review; source-owned character bridge validation. Publication remains disallowed.

## Batch B3 — Latin witnesses and chapter/canon granularity (19 October 2026)

**61 locators now tracked** (26 inherited + 35 new); the existing 83 original document candidates, 51 doctrinal subjects and 101 provisional joins are unchanged. All 61 passage locations now have a directly linked Latin witness rather than depending exclusively on an English translation. This is *locator verification*: **zero claims formally certified, zero passages approved for reproduction, zero edition-certified Denzinger concordances**.

- **Trent, Sessions XIV and XXII:** Latin Wikisource records the full conciliar session text, expressly identifying its printed reference as `Sacrosanctum Concilium Tridentinum` (Padua, Giovanni Manfrè, 1738). Its Latin includes Penance's chapters on institution, form, contrition, confession, priestly absolution, reserved cases and satisfaction, plus corresponding independent canons; Session XXII includes the sacrifice, Roman Canon, quiet/audible speech, ceremonial signs, Communion, water in wine, historical vernacular discussion, and independent canons. URL: https://la.wikisource.org/wiki/Concilium_Tridentinum.
- **`Ineffabilis Deus`:** the University of Zurich's `Corpus Ineffabilis` (a research collaboration with the Vatican Library) supplies a complete line-aligned Latin text of the 1854 document, particularly lines 216–224 around the defining formula. This is a much stronger full-Latin witness than the previously recorded definition-only Latin footnote. The exact Latin print base for the transcribed corpus still needs bibliography and textual collation. URL: https://corpus-ineffabilis.org/corpus/; project info https://corpus-ineffabilis.org/.
- **Edition-specific caution:** the online *Enchiridion symbolorum* digital transcription at https://www.apotre.org/livres/enchiridion-symbolorum/6 pairs modern-style and legacy numbered passages, allowing **41 candidate anchors** to be retained or proposed. It does **not** establish a named printed Denzinger–Schönmetzer versus Denzinger–Hünermann edition. Thus no modern number is certified. **Correction:** the earlier Dz 943 claim beside modern 1746 was not visible in that digital index and was removed from P017; no replacement older number has been guessed.

Substantive research joins for Mass Explorer: Trent XXII chapter V explains why external ceremony and varied vocal volume can aid contemplation, while chapter VIII calls for instruction of the faithful. This is doctrinal history, not a 1962 ceremonial operating manual or automatic character dialogue. Trent XIV can support Confession catechesis in St Pius X and the Canon, but character speech continues to require independent character-owned original witnesses.

**Next gate:** collate Latin witnesses with scanned historical print where feasible; identify printed edition/pagination for the Denzinger index; audit each passage's precise doctrinal claim and authority; verify rights of display translation(s) before allowing Magisterium Explorer publication.

## Batch B4 — concordance corrections and canonical topic-join repair (19 October 2026)

**No new passage records.** The 61 locator records remain research-only; the canonical doctrinal catalogue still has 83 Church document candidates and 51 subject entries. The focus is repairing indexing reliability before expanding volume:

- **Three formerly unnumbered canons now have online-attested candidate concordances:** Session XIV Penance canon IX = modern-style 1709 / Dz 919; Session XXII Mass canon I = 1751 / Dz 948; Mass canon III = 1753 / Dz 950. All three are verified against the online Latin Denzinger transcription at https://www.apotre.org/livres/enchiridion-symbolorum/6, NOT against a named bound edition.
- **Erratum on B3:** Session XXII chapter V (ceremonial signs and silent/audible pronunciation), modern-style 1746, is attested as **Dz 943** in a historical English Denzinger contents index (https://sensusfidelium.com/the-sources-of-catholic-dogma-the-denzinger/) and an additional English rendition; its Dz 943 reference has therefore been restored as an online corroborated **candidate**. The Apôtre Latin digital page happens to omit the legacy number on that row; such missing data are not proof of absence. Printed-edition certification is still **zero**.
- **Complete canon audit:** all **15 distinct Penance canons** (including canon IX held in original P023 rather than duplicated) and all **9 Mass sacrifice canons** now carry unique structured canon numbers and specific issue tags. A canonic condemnation is not automatically an entire positive theological explanation.
- **12 passage-to-topic edges repaired via 5 additional provisional document-topic candidate joins**, bringing the document-topic total **101 → 106**. The joins are Trent XIII→Liturgy Principles; Trent XXII→Liturgy Principles; Trent XIV→Baptism; Trent XXII→Saints' Intercession; Trent XXII→Purgatory. They are explicitly qualified as *secondary-context passage relationships*, not newly approved conclusions. Source check: https://la.wikisource.org/wiki/Concilium_Tridentinum (sessions XIII, XIV and XXII).
- **Witness precision:** All 61 now carry a direct canonical Latin witness locator and scope label. A full session page proves source availability but does **not** certify that every recorded phrase was individually collated against a printed edition. Added guard tests prevent future orphan joins, lost canons, fabricated edition certainty, or premature publication.

**Source distinctions relevant to application:** Trent XXII chapter III says the sacrifice is offered to God alone although Masses may honour saints; chapter V provides a basis for understanding ceremonies without dictating 1962 ceremonial choreography; chapter VI expressly expresses a desire for the faithful's sacramental participation while defending Masses in which only the priest receives. Trent XIV canon VIII mentions a historical confession obligation, requiring temporal-law separation. These must not be flattened into slogans or projected into an avatar's first-person testimony.

**Next research gate:** source edition identification and line-level collation; authority scope and historical-discipline classification; rights-cleared translations; bounded links into verified character-owned answer passages, followed by limited internal explorer tests. No public display yet.

## Batch B5 — original-language doctrinal scope review (19 October 2026)

**54 editorial claim records tied to 54 of the existing 61 passage IDs**, with no new source-document or passage IDs. Dedicated file: `data/learn/magisterium-doctrinal-claim-reviews.v1.json`. These are compact **analyst paraphrases for internal research**, not imported original Latin or licensed English translations. The remaining **7 passages** are a separately enumerated worklist; paragraph overlaps are intentionally not mass-certified. The source review also accounts for **28 canon-linked claims** (Trent XIV's 15 Penance canons, Trent XXII's 9 Mass canons and four other Eucharistic canons), plus chapter expositions, historical context and two solemn definition formulas. All claims have explicit interpretive boundaries and source-unit locators.

**Verified source reading, not doctrinal sign-off:** the Padua 1738 Latin Trent transcription (https://la.wikisource.org/wiki/Concilium_Tridentinum; Sessions IV, XIII, XIV, XXII), the Vatican Latin `Pastor aeternus` (https://www.vatican.va/archive/hist_councils/i-vatican-council/documents/vat-i_const_18700718_pastor-aeternus_la.html) and Corpus Ineffabilis Latin lines 221–223 (https://corpus-ineffabilis.org/corpus/). Genre classification is editorial and provisional; it does not automatically certify the theological note, authority scope, edition, textual variants or reproduction permission.

**Three mandatory paired readings:** Trent XIV on attrition must include its sacramental context; Trent XXII on priest-only sacramental communion must be read with its explicit wish for faithful to communicate; and `Pastor aeternus` on papal infallibility must not lose the *ex cathedra* conditions. Historical provisions on the Vulgate's authorised usage, annual Confession and Mass language are flagged for temporal-law review, not copied into a current-law answer.

**Publication gate unchanged:** zero claim reviews are marked as doctrinally certified, rights-cleared or publicly usable. Denzinger numbers remain provisional research leads. Neither St Pius X's nor the Canon's first-person voices may be inferred from magisterial text. Follow-up: review the seven outstanding passage overlaps, independently adjudicate precise authority/notes and printed-edition concordances, check translation rights, and only then design optional source links in approved dialogue.

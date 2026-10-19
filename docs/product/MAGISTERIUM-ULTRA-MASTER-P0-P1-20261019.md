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

## Batch B6 — all passage records dispositioned; no duplicate answer owners (19 October 2026)

From the B5 worklist of **7 outstanding passage locators**, five receive compact, specifically bounded internal source-scoped editorial propositions (P008, P057, P059, P060, P061), while **2 are declared aliases** because the content is already represented by a narrower source record (P004→P028 on Penance distinct from Baptism; P058→P026 on pre-definition consultation). Final: **59 internal claim review records + 2 non-standalone locator aliases = all 61 accounted for, zero unresolved**. The previous 54 claims and all older document IDs remain intact.

Evidence verified against the Latin witnesses:
- Trent XXII, chapter I: the visible Eucharistic sacrifice linked to Christ's one offering and the Melchizedek context (P008) differs from the specific Malachi/Old Testament typology (P060, Latin lines 898–899). Chapter II's application to the departed who are not yet fully purified is P061 (line 903), while the core propitiatory teaching stays P005 (lines 900–902). https://la.wikisource.org/wiki/Concilium_Tridentinum
- `Ineffabilis Deus`: P057 covers the opening providential explanation (digital lines 1–9), P026 already covers the consultation recorded at lines 200–215, P007 contains the formal definition in lines 221–223, and P059 covers the distinct historical warning and penalties at lines 224–228. No historical legal consequences are asserted as automatically applicable today. https://corpus-ineffabilis.org/corpus/
- Trent XIV's preliminary explanation and chapter II are not a fresh conversation topic merely because the old broad record P004 exists; the detailed P028 and other canon/chapter records retain the source boundaries.

New research-only `data/learn/magisterium-source-owner-bridges.v1.json`: **7 candidate theme groups** with original APOL dossier IDs and Pius X catechism-index question IDs; each carries precise source-passages and interpretation cautions. **4 Mass Explorer context candidates** reference the already-existing `learn.mass_explorer` route without inventing AO.CARD or AO.SM IDs or altering reading behavior. No doctrinal answer was moved from apologetics, catechism or the Canon. An index stem cannot verify a Catechism answer, and a Magisterium source cannot be attributed as first-person character speech.

All 59 claims remain **editorial only**, the 2 aliases non-standalone, and **0** have printed-edition-certified Denzinger concordances, rights-cleared translations, approved character speech or public UI access. Next: actual full-text character-answer verification (rather than question-stem overlap), independent theological/authority review, edition confirmation and licensing.

## B7 — direct Pius X Catechism full-answer comparison and edition bibliography (19 October 2026)

Research-only source-owner bridge, not character speech. Recovered the full pinned modern English study-translation answers in `gustavo-depaula/ember` at commit `65d10046c19b610a4307ef273a751ceeb3c4f153` (not merely index question stems), then read the corresponding 1912 question-and-answer material in the **Italian digital text** at https://etexts.culturanuova.net/religiosi/magistero/catechismi/catechismi-di-pio-x/il-catechismo-di-pio-x.php. The original printed 1912 facsimile has **not** been independently collated, and the edited English translation's reproduction rights are **not cleared**. No full answer texts copied into the registry.

**Eight older questions plus 20 additional direct-read question records = 28 bilingual digital witnesses** (24 direct topical doctrinal parallels; 4 contextual, pastoral or contrast-only). The new `data/learn/magisterium-pius-x-catechism-qa-crosswalk.v1.json` records an exact Pius-X-question-to-source-passage candidate with a distinction between topical similarity and equivalent proposition. Newly recovered stronger matches:
- Scripture and Tradition: Q233–235 alongside Trent Session IV. Q234 explains inspiration rather than being a full book-list equivalent.
- Eucharistic Real Presence: Q328 on Consecration; Q332 on the undivided whole Christ under fragmented species.
- Sacrifice of Mass: Q321, Q346, Q348–352 (Mass and Cross, mode of offering, ends, living/deceased, God alone). This directly remedies B6's lack of Pius X entries under its `MASS` bridge.
- Penance: Q356, Q362, Q364–366, Q372, Q380–381. Q359 is a practical method of examination rather than Trent's whole doctrine of integral confession; Q363 explains perfect contrition and must not substitute for the Catechism's own attrition questions Q365–366.

**Transcription caution:** the Italian web copy locally labels the Penance first question as “335,” even though it follows Q354 and precedes Q356. Its context and independent witnesses establish **Q355** as the canonical identifier. Preserve the original numeration from the source index; record this as a digital transcription defect rather than treating it as a distinct historic Q335.

**Authorship restriction:** Pius X's own letter of 18 October 1912 expressly approves and prescribes the *Catechismo della dottrina cristiana* for the diocese and ecclesiastical province of Rome (https://www.vatican.va/content/pius-x/it/letters/documents/hf_p-x_let_19121018_catechismo.html). Papal approbation is not proof that he personally composed each answer. Treat this corpus as catechism teaching associated with his papal approval, not an invented biographical recollection or transcribed papal personal voice.

**Denzinger evidence:** New `data/learn/magisterium-denzinger-edition-bibliography.v1.json` locates four named editions bibliographically—2010 German/Latin 43rd, 2012 Italian/Latin adapted 43rd, 1996 French 38th, and Herder 2017 45th eBook—but **zero** candidate entry numbers have yet been checked inside a specific edition/page. Online source index numbers remain provisional. Bibliographic evidence includes Herder, EDB, Bibliothèque nationale de France and German union-catalogue records. Do not present a 44-number online index as edition-certified Dz/DS/DH mapping.

**B7 bridge status:** 7 group families remain; APOL owner dossiers remain 8; the Pius X reference set is **28 unique full-answer-reviewed question IDs**; four Mass Explorer links remain merely candidates; the Canon's authenticated sermon passages remain an independently owned, unverified source task. There are **zero** approved character quotations, reproduced modern translations, or public Magisterium features. Existing LIVE, Simple, Missal and Mass Explorer runtime remains unchanged.

## B8 — provenance reconciliation, historical scans and Chanoine evidence boundary (19 October 2026)

**Priority correction: reuse the parallel Pius X evidence pipeline; do not duplicate its print-source inventory.** Earlier B7 recorded 28 modern-English/Italian-digital Q&A as reviewed, but did not join the stronger source files already present in Ad Orientem. The canonical owner is the `ltfaith-pius-x-*` research source family, not the Magisterium registry.

Cross-file join now records exactly **28 pinned original-language Italian question locators**, plus the *existing* 1913 French printed-edition scan with **5 question-and-answer photographic page-verified witnesses** among the 28 (Q355, Q356, Q359, Q362, Q363). The other **23 only have OCR-assisted page candidates**, not verified printed-answer text. This inherits the established upstream source distinctions without recopying its 70 total photographic checks or its 433 candidate page index:
- `data/learn/ltfaith-pius-x-it-witness-index.v1.json` — 433 question numbers aligned to pinned Italian markdown, **not** collated to original 1912 printed pages.
- `data/learn/ltfaith-pius-x-1913-french-print-page-evidence.v1.json` — 70 page-image-verified Q&A across the independent Pius X workstream; five overlap our 28.
- `data/learn/ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json` — all 433 mapped to bounded candidate pages; OCR page candidate alone is not text verification.
- `data/learn/ltfaith-pius-x-italian-1912-original-print-acquisition.v1.json` — authentic full photographic scan of *1912 Italian printing still NOT secured*. Historic Italian 1913 cover or reprinted 1920 online transcription is not equivalent. Digital Italian PDF has known numbering mistakes and remains only a secondary comparator.

This period French witness is `Catéchisme de la doctrine chrétienne` (Paris, Imprimerie Paul Feron-Vrau, 1913); Cardinal Merry del Val's 7 March 1913 letter authorises the translation. Existing scans: https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf and https://www.liberius.net/livres/Catechisme_de_la_doctrine_chretienne_000000426.pdf. The first is **owned by the already-existing upstream Pius X verification records**.

**Denzinger original-edition evidence improved, entry certification unchanged:** An original Latin printed *Enchiridion symbolorum et definitionum*, Würzburg (Stahel), 1900, is available as a 506-page photographic scan digitised from the Getty Research Institute, published via Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Enchiridion_symbolorum_et_definitionum_-_quae_de_rebus_fidei_et_morum_a_conciliis_oecumenicis_et_summis_pontificibus_emanarunt_(IA_enchiridionsymbo00denz_0).pdf . Bibliography additionally records Rahner-edited **1955 29th** and **1954 30th** editions, the latter underlying Deferrari's copyrighted English translation (the English derivative is not assumed public domain). Total named bibliographic editions recorded: **7**, with **one identified fully scanned historical Latin edition**; **zero** of the 44 modern-style candidate numbered entries compared page by page with any named edition. In particular a 1900 volume cannot authenticate 20th-century subsequent text beyond 1900. `data/learn/magisterium-denzinger-edition-bibliography.v1.json` preserves uncertainty.

**Chanoine source dependency:** Checked repository tree (branch SHA `bfea91c370e13af50e0bd2710ab410540e190c04`) and PR #1443's related files: the tree does not include standalone Lefebvre homily or sermon transcript files, and the other PR is a source-referral/question-routing prototype, not independent sermon evidence. This is a **branch-snapshot observation**, not a claim that no homilies have been mined elsewhere. Consequently the Magisterium→Chanoine link remains a topic candidate, not sourced dialogue; it needs explicit original sermon IDs and text from the parallel homily-mining owner.

**Gate:** No client-facing changes, no new avatars, no original Italian 1912 photocopy certified, no modern-edition passage concordance confirmed, no source-origin inversion. QA regression tests now enforce the actual five-versus-23 French printed-evidence distinction, 28 pinned Italian IDs, historical source ownership, 7 edition records and the Chanoine zero-first-person gate.

## B9 — named 1911 Denzinger OCR and Chanoine first external source leads (19 October 2026)

**Named historical edition finally witnessed for some older references, but printed-page collation NOT completed.** The University of Toronto–funded digitisation of Clemens Bannwart's *Enchiridion symbolorum*, **eleventh edition (Herder, Friburg, 1911)**, is available at https://archive.org/details/enchiridionsymbo00denz and its full OCR at https://archive.org/stream/enchiridionsymbo00denz/enchiridionsymbo00denz_djvu.txt. The title page explicitly identifies the editor, edition, publisher and year. The new `data/learn/magisterium-denzinger-1911-ocr-entry-review.v1.json` records **13 exact legacy-number + document-unit encounters in this named edition's OCR**, each with an OCR line range and the printed page shown in the transcription. The 13 are Dz 1839, 878, 884, 885, 888, 919, 940, 941, 942, 943, 944, 948 and 950.

Examples: Trent XIV Penance canon IX = old **Dz 919**, transcribed across pp.305–306; Trent XXII Mass chapter II = **Dz 940**, p.312; chapter V ceremonies = **Dz 943**, p.313; canon I = **Dz 948**, p.314; canon III = **Dz 950**, p.315; Vatican I `Pastor aeternus` ex cathedra formula = **Dz 1839**, pp.489–490. The source text and context for these old numbers are *edition-identified OCR-witnessed*, distinct from unversioned online correspondence guesses. A page number appearing in extracted OCR does not count as visually inspecting the corresponding photographed page. Thus **13 OCR-level old-number matches, zero individual photographed book-page number collations, zero certified DS/DH modern-edition crosswalks, zero public textual approvals**. Existing 44 modern-style online candidate numbers remain unverified.

**Chanoine primary-source discovery without stealing ownership from the separate sermon pipeline:** `data/learn/magisterium-chanoine-external-sermon-leads.v1.json` records **6 directly attributed, dated French full-web transcriptions** at La Porte Latine, collectively connected to **12 tightly bounded source themes**, not to canonical sermon IDs:
- 20 April 1975, Third Sunday after Easter / Confirmations: Eucharist, Confession and sacramental helps against sin. https://laportelatine.org/formation/mgr-lefebvre/textes/sermon-de-mgr-lefebvre-3eme-dimanche-apres-paques-confirmations-20-avril-1975
- 14 September 1975, Écône seminary return: Mass and Cross, and sacrifice for souls in Purgatory. https://laportelatine.org/formation/mgr-lefebvre/textes/sermon-de-mgr-lefebvre-rentree-seminaire-14-septembre-1975
- 8 December 1977, Immaculate Conception: Genesis 3:15, Mary's preservation and Christ's saving design. https://laportelatine.org/formation/mgr-lefebvre/textes/sermon-de-mgr-lefebvre-immaculee-conception-engagements-8-decembre-1977
- 11 February 1979, priestly jubilee for Fr Jean-Jacques Marziac: priesthood, missionary calling, altar and Cross, with linked recording. https://laportelatine.org/?p=64575
- 30 June 1979, first Mass of Abbé D. Maret: Mass as priestly sacrifice and pastoral Confession ministry. https://laportelatine.org/formation/mgr-lefebvre/textes/sermon-de-mgr-lefebvre-1ere-messe-de-labbe-d-maret-30-juin-1979
- 31 March 1988, Chrism Mass: sacramental ministry, dispositions, priest's sanctification. https://laportelatine.org/formation/mgr-lefebvre/textes/sermon-de-mgr-lefebvre-jeudi-saint-messe-chrismale-31-mars-1988

These sermons are original-author *published French witness leads*, **not** councils, not inherently definitive magisterial proof, not text copied into Ad Orientem, and not license to author the Chanoine's first-person speech. No canonical homily corpus IDs have been found/assigned; all six must be matched against the parallel Lefebvre homily-mining registry to avoid duplication. The site's audio players were noticed, **not** word-aligned with the printed transcriptions. The dedicated B9 regression test enforces the research-only and rights gates.

**Italian 1912 Catechism acquisition:** no authenticated complete 1912 Italian photographed first-edition manuscript or printed Q&A facsimile established in this batch; do not recycle the 1913 French translation, 1913 Italian cover or later retyped versions as the original. Upstream Pius X source-acquisition and already-collated 1913 French print pipeline retain ownership. No visitor-facing change to LIVE/Simple/Missal, Mass Explorer or any character dialogue.

# Historia Salutis — P1: Source-safe genealogy, covenant readings and story joins (16 October 2026)

**Status: research-only, still on the P0 draft PR #1310.** This is an extension of the canonical 151-event matrix, not a replacement of the Atlas, a second Bible reader, an automatic family-tree publication, or approved Bible-history prose.

**Data:** `data/explore/historia-salutis-p1-person-story-scripture-links.v1.json`
**Regression:** `node tests/historia-salutis-p1-person-story-links.mjs`

## Key result

| Evidence set | Conservatively reconciled |
| --- | ---: |
| Published canonical Atlas identities protected | 151/151 |
| Curated Genesis kinship research edges | 90 (91 distinct donor people IDs) |
| Matthew's textual genealogy | 41 individually ordered source nodes |
| Luke's textual genealogy | 76 individually ordered source nodes |
| Source-only Scripture companion readings | 5, each complete in the imported Crampon 1923 witness |
| Source-only Ruth/Boaz/Obed/Jesse/David proposed family links | 4 |
| Marian/apostolic source dossiers | 55 |
| **Exact-reference** dossier-to-Atlas links | **11** |
| Cinematic research scene records classified exactly once | 183 |
| Donor smaller story groupings | 39 |
| Scene citations: exact / overlap / none | 67 / 29 / 87 |
| Stories **without any exact** canonical episode match | 9 |
| Stories without any donor continuity/context event pointer | 5 |

Counts are **research coverage**, not number of editorially approved stories, independently certified biological generations, app screens or selected Scripture excerpts.

## The core architectural distinction

One biblical person may have several documentary appearances, but those documentary appearances are not interchangeable relations:

- The **Genesis** family graph contains 90 particular biblical-reference parentage research edges; its donor IDs preserve Cain's Enoch versus Jared's Enoch, and the two Lamechs.
- The **Matthew 1** textual genealogy follows its own sequence from Abraham to Jesus and names women as contextual scriptural associations where appropriate. Mary is mother of Jesus; Joseph is not silently turned into a biological father.
- The **Luke 3** textual genealogy is an independent textual sequence from Adam to Jesus, not a copy of Matthew's David-to-Joseph chain. Do not merge identically spelled names into purportedly identical individuals without documentary identity adjudication.
- The larger **3,231-person** imported census remains quarantined due to source relationship errors, notably Adam/Eve wrongly labelled siblings and incorrectly asserted children of Mary.

P1 does **not** invent a single, gapless biological genealogy from Adam to Christ. It makes the three biblical source witnesses navigable separately, while preserving their IDs, citation paths and proof boundaries.

## Five missing primary companion readings located

These passages were checked for complete verse-number presence in the repository's Crampon-1923 **UNCOLLATED_SOURCE_WITNESS** JSON files. This **does not certify the imported translation text** and does not authorize copy-paste of witness text into production.

| Companion reading | Purpose | Canonical 151 status |
| --- | --- | --- |
| **2 Samuel 7:12–16** | God's royal promise to David | **Source-only**, not an extra Atlas event |
| **Jeremiah 31:31–34** | Prophetic New Covenant announcement | **Source-only**, not an extra Atlas event |
| **Ruth 4:13–22** | Ruth, Boaz, Obed, Jesse and David | **Source-only** ancestral bridge |
| **Matthew 1:1–17** | Distinct Matthean messianic genealogy | **Source-only** textual witness |
| **Luke 3:23–38** | Distinct Lukan genealogy back to Adam | **Source-only** textual witness |

The proposed Ruth kinship edges are explicitly **mother/child** (Ruth→Obed), **father/child** (Boaz→Obed), Obed→Jesse and Jesse→David, each sourced to its verses and marked research-only pending edition-level editorial review. Matthew 1:5 provides corroborating genealogical context but is not silently fused into the Genesis edges.

Two covenant anchors formerly missing from the 151 are now **locatable as native Scripture companion readings**. They remain absent from the 151-event timeline and therefore remain **publication/integration gaps**.

## Stories: never conflate "scene citation match" with a complete person story

The 39 research story groupings partition 183 scene IDs exactly once. For every grouping, P1 indexes:

- source scene keys and their original donor group;
- **exact-citation** scene-to-canonical-event joins, eligible for a later bounded reader jump after editorial checking;
- **overlap-only** scene candidates held from automatic navigation;
- **unmatched** research scenes retained as source-only;
- the old 151-to-story context classification as non-authoritative provisional context;
- an explicit `narrativeProseApproved:false` marker.

**Five donor groups have no existing context link** in the original continuity matrix: Abraham's wanderings, Abraham and Lot, the wilderness years, Paul's Cyprus mission and Paul's arrest/trial. **Nine** have no exact-citation canonical event match. Neither set is discarded or given a fake timeline pin.

The 183 cinematic scenes currently cover mainly **Abraham, Moses, Christ and Paul**, not a full biblical person catalogue. Required later story families include Adam and Eve, Noah, Jacob/Joseph, Ruth, the judges, David and Solomon, prophets, Catholic deuterocanonical stories and individual Marian/apostolic lives. This is a genuine scope gap, not a defect that can be fixed merely by renaming existing story chapters.

## Marian and apostolic person-to-Atlas source joins

There are 55 research dossier entries spanning Scripture, later tradition, patristic material, proposed identifications and held entries. Only **11 entries** have a **uniquely exact** reference equal to an existing canonical Atlas event; these receive research links. All non-Scripture evidence categories, partial overlaps and ambiguous matches remain unlinked. No traditional apostolic travel itinerary or later devotional location becomes a Bible atlas historical pin.

Examples of exact data joins:
- Our Lady: Luke 1:26–38 (Annunciation), Luke 1:39–56 (Visitation), Luke 2:1–20 (Nativity), Luke 2:22–38 (Presentation), Matthew 2:13–15 (Flight into Egypt), John 2:1–11 (Cana).
- Peter: Acts 9:36–43.
- Paul: Acts 16:11–15; 17:16–34; 18:1–18.
- Mary Magdalene: John 20:1–18.

These are **references already indexed by the canonical Atlas**; no second copy of the event is created.

## Next release gates

1. **Identity/source review:** review the 90 Genesis parentage links and Ruth additions against the approved original-language / selected translation witnesses, especially duplicated names, St Joseph, and uncertain or variant genealogical sequences.
2. **Editorial person mapping:** progressively certify cross-witness identities and link the Genesis/Psalter/prophets material without falsely equating people who share names.
3. **Fill actual story scope gaps:** research missing Catholic-author narratives for Noah, Ruth, David, prophets and deuterocanonical characters; do not compose uncredited synthetic Bible history.
4. **Narrative prose acceptance:** follow the current draft #1069 historical Catholic author policy; Scripture-original text or verified historical author prose only, with reviewed translations.
5. **Reader experience:** once approved, link "Continue the Story", person family-tree branches, individual lives, source-only companion Scripture and physical Atlas, without overwriting the user's narrative bookmark.
6. **Avoid unnecessary UI duplication:** existing Scripture reader, location identities, art owner and 151 Atlas events remain canonical.

**Prohibited:** treating citation overlap as identical incidents, flattening Matthew/Luke genealogies, importing the 3,231-person family edges, attaching invented geographic pins, labelling verse frequency as final excerpt selection, merging the PR before the appropriate editorial gates.

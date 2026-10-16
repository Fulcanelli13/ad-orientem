# Historical toponyms and Pleiades coverage exceptions — batch 2
**15 October 2026 · Canonical owner: #342 · Status: RESEARCH ONLY / HOLD**

## What changed

Batch 1, merged in [#1239](https://github.com/Fulcanelli13/ad-orientem/pull/1239), established 35 distinctive geographic anchors, 28 **candidate** Pleiades URIs and seven unmatched Pleiades anchors, without moving a coordinate or changing public names. This follow-on does not recreate that crosswalk. It references it and the 22 already existing English/French settlement labels in [#1238](https://github.com/Fulcanelli13/ad-orientem/pull/1238) to produce a **compact date/scope review queue**.

For each of the 22 currently labelled settlements, the JSON points to the existing Pleiades ID and a few exact Pleiades source-name URI/date records, preserving rather than fixing their source-stated date bounds. Each name remains **EDITORIAL_HOLD**. The app's current labels are unchanged. The source record's date span is not proof that a name applied to *each* Biblical event in a city; broad name records require philological/primary-source collation.

### Priority historical-anachronism cases

- **Jerusalem:** The source contains both `Ierusalem` and `Col. Aelia Capitolina`; the latter belongs to Hadrianic Roman Jerusalem, not the Old Testament city or Jesus's earthly ministry. Crucially, the Pleiades GIS record for one `Aelia Capitolina` name gives a misleadingly broad date range. **Do not use a range intersection algorithm to promote it.** Compare dated attestation against external historical studies and the site's surviving chronology.
- **Samaria:** Distinguish the ancient Israelite city/kingdom from later `Sebaste` and from the region. A city-level anchor does not locate a particular prophet's encounter.
- **Caesarea Maritima, Corinth, Philippi and Troas:** the records contain distinct earlier Hellenistic and later Roman-colony names. They cannot all be represented by one temporally universal “ancient label.”
- **Nineveh, Babylon, Joppa:** Akkadian/Assyrian/Hellenistic/Latin spelling and naming traditions have distinct attestations. Preserve ancient-script and transliteration provenance, not machine-selected substitutions.
- **Athens and Rome:** Pleiades representative point `rough`; source identity can be useful, but point precision must not be promoted.

### What “seven unmatched” means

`NO_DEFENSIBLE_DIRECT_MATCH` means **no responsible Pleiades match in batch 1**. It does **not** mean the place is archaeologically unknown. The attached research queue distinguishes this:

| Atlas anchor | Independent documentary evidence | Outstanding limitation |
|---|---|---|
| Nain | OpenBible's ancient-place page identifies Nein with very high confidence | A separate modern-settlement correspondence; no Pleiades URI or precise miracle locus |
| Bethesda | Excavation/structural studies and St Anne historical-site context | Complex pool phases and Gospel association need specific stratigraphic collation |
| Siloam | Peer-reviewed Israel Antiquities Authority research identifying Roman-period Siloam Pool remains | Several pools and phase boundaries; no inference that any single pin proves the Gospel event |
| Bethphage | Historical Biblical reference locates it approximately near Bethany/Mount of Olives | No universally certain surviving village coordinate |
| Mount of Olives | Geographical descriptions confirm an extensive ridge | A mountain is not one event or Ascension point |
| Gethsemane | Second Temple-period mikveh excavated near the traditional church | Nearness corroborates local ancient activity, not the exact garden/event |
| Holy Sepulchre | Excavation studies document ancient quarry, funerary terrain and later church site | Compatible local archaeological context cannot certify the exact Gospel tomb or Calvary |

**Source URLs and the precise claim they support are in** `data/explore/biblical-atlas-toponym-audit.research.v1.json`. No photographs, scans, excavation reports or copyrighted paragraphs are imported; these are editorial links. Pleiades source stays pinned to revision `d8c06f28656312eee6b7a0f76415b34a89e3c728` with CC BY 3.0 attribution. Original OpenBible pins/precision URLs remain owner data and are unchanged.

## Decision gate before any public historic label

Historical-name substitution would require an independent original attestation for the relevant city, Biblical episode's broad period, correct geographic unit (city vs region vs tradition), accepted bilingual display form and explicit human approval. A Pleiades name-record date alone is **not** enough. Overlapping time spans are a review aid, not a publishing algorithm. Always permit a neutral existing city name when source evidence is inconclusive.

The official 151-story corpus, map coordinates, cartographic styles, English/French display names, Scripture reader and ordinary app remain unchanged. The research is **not imported by runtime** and cannot activate an ancient alias or move a pin. Physical Android pan/Follow, modern-shoreline disclaimer, relief/topography and Sacred Art are independent gates.

**Operational recommendation:** reconcile mixed-era / high-risk aliases in batches of 5–8 against original dated sources; investigate the seven geographically distinct exceptions in parallel rather than pretending missing Pleiades entries are a global map shortfall. No external permission requests.

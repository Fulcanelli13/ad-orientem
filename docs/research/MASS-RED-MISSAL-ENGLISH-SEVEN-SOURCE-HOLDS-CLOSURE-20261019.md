# Ordo Missae — Final seven English source witnesses (Wave 8)

**Scope:** Final English textual source gaps after merged Red Missal Waves 1–7, never the dated liturgical-calendar Ordo or variable daily Propers. **Decision: no new text patch.** Ad Orientem's canonical LOW and SUNG donor prayer strings remain unchanged.

**Editorial priority:** Original 1962 Latin controls; the user-selected 2013 Coalition in Support of Ecclesia Dei Red Missal is preferred for English when it actually prints the complete passage. Earlier wording is not deemed erroneous merely because a scanned booklet abbreviates or omits a prayer.

## Findings — seven exact source cue identities

| Canonical ID | Prayer | Independent evidence | Decision |
| --- | --- | --- | --- |
| C0016 | Celebrant's *Confiteor* opening | Independent full 1962 priest's Confiteor, in [Catholon bilingual Missale Romanum 1962](https://catholon.com/missale-1962.html?lang=en) and [Novena Regina's Ordinary](https://novenaregina.com/missal) | Retain complete English; the Red booklet abbreviates this passage |
| C0017 | Priest's *mea culpa* | Same two independent witnesses preserve the thrice-repeated formula | Retain |
| C0018 | Priest's final petition | Independent priest Latin specifically addresses *et vos, fratres*, not the server's *et te, pater* | Retain complete English |
| C0040 | *Ab illo benedicáris* blessing of incense | [New Liturgical Movement's specialist comparative study](https://www.newliturgicalmovement.org/2024/02/blessing-incense.html) translates this very Latin prayer; [1962 rite text](https://www.liturgiapapal.org/index.php/recursos-lit%C3%BArgicos/misal/missale-1962/1710-preparaci%C3%B3n.html) corroborates the Latin | Existing “May you be blessed … by Him in whose honour you shall be burned” preserves the original sense. Do **not** invent a Red booklet reference that does not exist |
| C0235 | Older/local Communion *Confiteor* opening | Same Latin as the servers' *et tibi, pater* Confiteor in the independent 1962 text; historical [1962 Missal comparison](https://keepthefaith.org/wp-content/uploads/2024/03/Missal-of-1962-2001-Spring.pdf) distinguishes the omitted second form | English acceptable. Keep only in opt-in older/local custom branch |
| C0236 | Older/local triple *mea culpa* | Exact original Latin equals the servers' triple *mea culpa* | Retain, older/local only |
| C0237 | Older/local Communion *Confiteor* petition | Exact Latin equals the servers' *et te, pater* Confiteor. “Thee, Father” is a legitimate devotional English variant | Retain, older/local only |

## Rubrical and linguistic safeguards

The 1962 Ritus servandus prescribes the priest's own *et vobis, fratres* and the servers' *et tibi, pater*, but the older second Confiteor before Communion no longer appears as a required 1962 Communion element. The 2013 Red booklet explicitly prints the older prayer as a reference **while noting its omission in 1962**. Keep the already-established **pre-Mass local/custom opt-in** and never add C0235–C0237 to the default normal Mass.

For C0040, the English review verifies translation, **not the precise placement of the blessing sign** in the Latin rubric. The independent 1962 source inserts the cross into *bene✠dicáris*; the donor representation places a sign immediately after that word. Whether the existing gesture engine locates the sign correctly remains a **rubrical/gesture validation question**, and this English-only audit does not change it. The source record and 1962 rubric audit should retain this separate ownership.

## Results and evidence standard

After Wave 8:

- **32/256** canonical cue IDs have approved source-owned English amendments.
- **209/256** have a source-reviewed decision to retain their English, including **7 established through independent witnesses rather than pretending the 2013 Red booklet printed them completely**.
- **15/256** are non-spoken ceremonial/rubric/silence markers. These need their own 1962 event and visual-cue checks, not English prayer collation.
- **241/241 genuine textual cues have an English editorial decision.** This does **not** certify the full Latin critical edition, independently validate all French translations, release content rights, or substitute for observed Mass/device acceptance.

Every one of the 256 fixed source cue identities remains in exactly one category. The source register stores independent URLs and rationale for each of the seven. `tests/mass-ordo-red-missal-editorial.mjs` checks donor exact Latin role ownership (*et vobis, fratres* vs *et tibi, pater*), Latin identity of the optional Communion Confiteor with the servers' Confiteor, and that no new changes reach the Latin, English or French donor text. The broader native reader CI remains required.

**No production files changed in this Wave 8 audit.** No source-comparison finding automatically makes the optional older custom normative.

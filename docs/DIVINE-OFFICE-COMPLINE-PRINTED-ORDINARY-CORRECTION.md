# 1961 Roman Compline — authoritative printed Ordinary projection (28 November)

**Implemented, private only.** The pinned Divinum Officium source extractor returns
42 raw blocks. The 1961 printed **Ordinary of Compline** (Mame edition,
printed pp. 132–141, §§54–67) contains **no Kyrie or second Pater noster
after the Nunc dimittis**. They were erroneously included after the
Nunc dimittis antiphon in the source-first candidate.

The new immutable `projectComplineRecitation` corrects the reading:
- Preserves all **42** original source blocks and their pinned IDs for audit.
- Omits the source events at `Common/Prayers#Kyrie` and
  `#Pater noster Et` after the `Nunc dimittis`, yielding **40** actual
  printed-ordinary reading moments.
- Adds the original-language `R. Amen` after both Compline blessings,
  directly from the already pinned `Common/Prayers#Fidelium animae`
  *response*, never its `Fidélium ánimae` versicle; tracks source attribution.
- Implements 1961 rubric §147/Ordinary §56: if Compline is the last
  prayer of the day, the **opening** Pater is replaced by a clearly marked
  examination of conscience; at another time, that opening Pater remains.
- Preserves the solo Confiteor, psalms, short responsory, Nunc dimittis,
  `Visita` collect, final blessing, Advent `Alma Redemptoris Mater` and
  concluding `Divinum auxilium`.
- Fails closed if the raw source order, the two inappropriate post-canticle
  events, blessing source provenance, or opening Pater location change.

**Primary printed source:** [1961 Breviarium Romanum, Ordinarium
pp. 132–141](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf#page=133).
Specifically §64 (printed 138), §65 (139), §§66–67 (139–140);
seasonal Marian antiphon/collect (140–141).

**Status:** Print-ordinary alignment is independently evidenced, but the
complete 28 November Office still needs a separate psalter leaf comparison
against a dated printed Psalterium before liturgical certification.
Retain `published:false`, `rightsApproved:false`,
`liturgicallyCertified:false`. No public text route, no Vercel.

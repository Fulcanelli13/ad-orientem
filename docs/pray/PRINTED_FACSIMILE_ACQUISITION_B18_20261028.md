# B18 — Original printed-volume scan acquisition

28 October 2026. **Evidence acquisition and live source access only. No printed-line collation has yet been completed.** The previous B17 audit remains at 0 print certificates for Novenas and the Baltimore Seven Words.

## Two actual scan leads

| Source | Original printed pages | Archive identity | Live integration | Verification not yet claimed |
|---|---|---|---|---|
| Baltimore Manual, 1889, Seven Words | 361–367; Rosary begins 368 | Internet Archive `manualofprayersf00wood`, Wikimedia Commons PDF, 804 digitized leaves | Second link under the existing Seven Words Source / provenance drawer | Two source-text anomalies, all seven prayers and the Marian appendix have **not** been compared line-by-line with this scanned edition |
| Patrick F. Moran, Dublin, 1883, Immaculate Conception Novena | 566–572; Our Lady's Nativity novena begins 573 | Wikimedia Commons `The Catholic prayer book.djvu`, 648 scanned leaves | Edition-specific link under Novenas > Immaculate Conception > Sources & edition | None of the nine day-prayers nor Litany/Tota pulchra page variants has been critically collated to the scanned leaf |

Primary-volume metadata and contents were located through Wikimedia Commons/Wikisource; each new UI link is deliberately **separate from the existing digital transcription** and displays the pending-collation notice. See machine-readable `data/pray/printed-facsimile-acquisition-b18.v1.json` for exact URLs, identifying features, the disputed textual readings, and the pending verification gates.

## Edition integrity

The separate `manualofprayersf00cath` 1888 scan (684 PDF images) may have overlapping material but is **not** silently substituted for the 1889 Woodman edition (804 PDF images). A book's printed page 361 is not the same thing as PDF image index 361; the printed-to-image offsets are explicitly `null` pending actual visual inspection. The two already disclosed corrections, `you shalt` → `Thou shalt` and `burn tli the desire` → `burn with the desire`, remain supported by an independent 1923 witness but are **not yet certified against the original 1889 scanned leaves**.

Moran's earlier historical instruction gives a choice of **Litany OR Tota pulchra**, and its prayer for a contemporary Pope must not be automatically carried into a 2026 prayer. The app's existing canonical Loreto branch and historical note stay unchanged.

## Subsequent actual print-collation gate

1. Access the scanned pages themselves, recording **scan leaf indices** and confirming that the printed-page 361–367 span really matches the 1889 manuscript's complete Seven Words text. Inspect all seven meditations and the Marian appendix, including the two flagged readings. Compare each line, retain legitimate historical punctuation and record every deviation before certifying.
2. For Moran 1883, independently inspect pages 566–572 and record nine individual day-body comparisons, alternate Litany/Tota pulchra/collect sequence and the historical Pope reference.
3. Only after actual photographed-page comparisons may the per-record `printEditionLineCollated` and certification counters be changed, with evidence links and page-by-page decisions. Never infer those counters from an accessible scan URL alone.

No new devotions, no changed prayer bodies, no spending and no external mandatory runtime dependency.

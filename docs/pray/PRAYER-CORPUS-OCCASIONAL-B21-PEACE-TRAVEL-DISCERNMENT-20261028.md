# Prayer Corpus B21 — Peace, travel and serious discernment
28 October 2026. **One existing Occasional Intercessions reader**, now six purpose-specific choices instead of three, within **Pray → Devotions & Novenas**. No new top-level module, no new Family entry card, no prayer encyclopaedia.

| Purpose | Exact historical witness | Language | Decision | Justification |
| --- | --- | --- | --- | --- |
| Peace | *The Raccolta* (1910), §18, antiphon *Da pacem, Domine* + ℣/℟ + collect | EN / Latin | ADD | Distinct petition for peace, not another St Joseph adversity prayer |
| Before a journey | F. X. Lasance, *With God* (1911), p.754, abridged *Itinerary* | English | ADD | Immediate prayer before travel, with Raphael, angels and return home; not the priest's longer Breviary text |
| Choice of a state of life | Lasance, *With God* (1911), p.753, *Prayer for Divine Direction* | English | ADD | Sustained discernment in weighty vocation/life choices; does not displace study prayers |
| Ordinary daily work | Existing Morning Offering / Ignatian Suscipe | Already owned | RETAIN | Generic extra work prayer adds negligible value |
| Raphael's post-war journey/walk form | Later *Raccolta* tradition | Not selected | DEFER | Additional formula and distinct edition not necessary for same occasion |
| Lasance optional St Joseph and Dupanloup traveler forms | *With God* (1911), following primary abridged Itinerary | English | DEFER | Alternatives, not paragraphs to append to the main prayer |
| All 1857 *Raccolta* calamity prayers §§154–157 | Multiple public calamity petitions | Source group | DEFER | Original text collation and practical scope remain unresolved |

## Original texts / evidence
- Peace: https://traditionalrosary.org/other-prayers/prayer-for-peace/ prints the 1910 English and Latin *Da pacem* sequence; https://www.liturgialatina.org/raccolta/calamity.htm supplies the earlier 1857 recension; https://en.wikisource.org/wiki/The_Raccolta_%281857%29/Index confirms the older §158 numbering. **Do not conflate 1910 §18 with 1857 §158.** Neither historical indulgence metadata nor former grant is advertised as presently applicable.
- Journey: https://en.wikisource.org/wiki/With_God/Various_Other_Devotions and source-page lead https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/768. Use the first grouped invocation and **two concluding oration paragraphs** exactly as Lasance's abbreviated Itinerary. Do not silently append the subsequent St Joseph, Dupanloup or guardian-angel alternatives. These were individual options in the historical print.
- Discernment: https://en.wikisource.org/wiki/With_God/Various_Other_Devotions at the immediately preceding p.753 and scanned-page lead https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/767. The display corrects an apparent Wikisource spacing/missing-letter error, `A lmight God` to `Almighty God`, corroborated by https://www.latinmasswedding.com/prayers/. This is **not** a new prayer composition. The prayer is about choosing a *state of life*, not a guaranteed answer to every short-term decision.
- Original printed pages have **not** been independently image-collated for these exact imported text sequences; URLs to scanned-page leads do not themselves establish certification. Preserve edition qualifications.

## Reader strategy and QA
- B20 module exports and tests remain frozen. `src/pray/occasional-intercessions-b21.js` delegates existing `sick`, `family`, `difficulties` to B20 and only owns `peace`, `travel`, `discernment`. The canonical St Joseph EN/FR/Latin text is still referenced, never duplicated.
- Peace has the witnessed 1910 EN and Latin; French UI defaults to source Latin with explicit **English** toggle. Lasance texts are EN-only and explicitly labelled English in French UI; **no invented French**.
- Presentation remains one reader and one prayer card; responsive six-button selector uses two columns on normal phones, one column on very narrow phones, three on wider screens.
- Add precise B21 corpus and language guard to `test:pray-owner`. Extend 320/390 phone browser path with all six buttons, Latin/English peace flip, travel, discernment, and nonclipping; retain previous B20/B19 checks.
- Required CI, source-locale guard and real mobile acceptance must pass before merge. Production can be asserted only after Vercel READY confirms the correct merge commit.

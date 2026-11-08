# Divine Office · Compline closing sequence correction (1961 rubrics)

The 28 Nov–5 Dec original-source candidate previously closed with
`Fidélium ánimae`, borrowed from the conclusion of other Hours. That was
wrong for the Roman 1960/1961 Compline and is fixed in the source-first reader.

**Independent liturgical witness:** The 1961 `Breviarium Romanum`,
`Rubricae Breviarii et Missalis Romani`, chapter V, paragraphs **179(c)** and
**181**, specifies that Compline ends with the `Benedícat et custódiat`
blessing, then the seasonal Marian antiphon with its verse/collect, and finally
the verse `Divínum auxílium`. Rule **166(b)** requires Saturday Compline
after the first Vespers of a Sunday.

[1961 printed rubrics, PDF pages 67–68](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf).

**Independent Office ordinary witness:** David Siefker's 2008 compilation,
pages 26–28 (pagination of its own typeset pages), has the Compline blessing,
the Advent Marian antiphon and `Divínum auxílium` plus `R. Amen`.
The corresponding Saturday psalter is at pages 349–352.
[Breviary text and page headings](https://www.scribd.com/document/761102039/Breviarium-romanum-Breviario-romano-1961-1962).
This secondary witness corroborates order and incipits, **not**
a complete print-edition word-for-word certification.

**Pinned primary source:** `DivinumOfficium/divinum-officium` commit
`126a07f91ede04664108abb6fb20ace3f4de14b9`, `Psalterium/Common/Prayers.txt`, exact
`[Divinum auxilium]` original section for all three source languages.

The renderer extracts the genuine main line in each language; it rejects
conditional 1963/community text. The response `R. Amen` (or French
`R. Ainsi soit-il`) is taken from the pinned original language's already
loaded `[Fidelium animae]` response, **not** from a model-supplied
translation or pasted literature. The source reference records both
origins. Total event count remains 42, with no new upstream files.

All current release flags remain false. This correction is mandatory
**before** any first Latin public Compline Hour is certified, and does not
resolve differences between private and choir recitation or complete
printed-text collation.

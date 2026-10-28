# Prayer B24 — Complete Seven Sorrows and Seven Joys of St Joseph reader
**29 October 2026 · one historical 1910 English devotion · existing Prayer reader**

## Release scope
The source-owned `pray.st_joseph_seven_sorrows` route is discoverable as a modest contextual button inside the **existing Pray → Devotions & Novenas** family. **Not** a 24th family card; **not** a new standalone application; **not** the existing bilingual 9-day St Joseph novena.

| Section | Admitted content | Ownership |
| --- | --- | --- |
| 1–7 | Seven fully transcribed distinct English supplications, in Roman numeral order, from `The Raccolta` **1910**, §**300**, printed pp.274–275 | New B24 original English text source module |
| After **each** supplication | Exactly one Our Father, one Hail Mary, one Glory Be — **21 canonical invocations total** | Original frozen `src/pray/canonical-data.js` entries, retained EN/FR/LA |
| End card 8 | Original antiphon, versicle, response and concluding collect | New B24 original English text source module |
| Source | Digitally typeset English transcription of 1910 edition; original 1910 photographed DjVu facsimile identified, **not yet visually word-for-word collated** | Explicit disclosure on reader, source registry and test |

The seven historical source prayers and final collect are **English only**. French app users see historical English explicitly labelled, while the *existing* Our Father/Hail Mary/Glory Be have the established French translation. A Latin button changes **only these canonical repeated prayers**, never the unverified historical English. No French or Latin original has been fabricated.

## Edition and original source limits
The exact 1910 English order follows original no.300. The 1857 `Raccolta` no.115 is a **historically related but edition-distinct witness**. The 1910 no.301 is a **different** general St Joseph novena, not a short form of no.300.

References:
- https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf — digitally typeset source text of the 1910 edition, PDF pp.130–131, **not a photographic first-edition witness**.
- https://commons.wikimedia.org/wiki/File:Theraccoltaorcol00unknuoft.djvu — actual 458-page scan of the printed 1910 book, located; image-level exact-colllation remains pending.
- https://liturgialatina.org/raccolta/joseph.htm — 1857 recension text, no.115.
- `data/pray/pray-b23-st-joseph-seven-pairs-source-map.v1.json` for all seven sorrow/joy source alignments.

The user-facing text is a **verified historical English digital witness**, *not* a claim that the 1910 physical printed pages have been photographed and collation certified. This distinction is retained in the B24 admission register. A Pious Union or Oblates modern paraphrase must never replace the 1910 recitation.

Earlier historical indulgence grants are not represented as currently obtainable. The Egyptian idols in the fifth prayer are part of the historic devotional text and are not labelled as a verbatim statement of Matthew 2.

## UI and tests
- The existing Prayer presentation runtime owns a single view `josephSeven`. A seven-steps-plus-conclusion navigation rail, tiny progress bar, readable one-prayer card, Prev/Next, Latin toggle for the canonical repeats, original-only text indicator and source disclosure provide the entire experience.
- No persistent user preferences or separate service. No UI change to the original 23 family cards, Holy Rosary, Mass, Calendar, Office, existing 16 novenas, or 48 canonical prayers.
- Required JS source and route test: `tests/pray-st-joseph-seven-sorrows-b24.mjs`, added to the standard `test:pray-owner`.
- Existing Chromium mobile workflow at 320px and 390px: navigate into Devotions, open St Joseph, verify 8 steps and original English first card, 3 canonical repeats, toggle Latin, traverse every original prayer, inspect original closing collect, confirm Finish returns to family, capture final screenshot and verify no horizontal overflow.

## Holy Face — B24 finding
The Holy Face remains research-held, not silently added to Novenas. Janvier/Bennett 1887 first edition has nine **full meditations** with numbered parts, acts, virtues, bouquets, shared opening and collect. Modern source-bearing digital transcriptions and later PDF reprints exist, but access to them is **not** proof that all nine texts match the 1887 printed original page-by-page.

For subsequent publication, choose a precise Janvier/Bennett English original text witness, collate all nine day texts and closing prayers against the original (or record any unresolved variants explicitly), identify the translation's public-domain basis, and feed the existing Novenas owner without altering the frozen 16 IDs or generating French text. Do not paste the 2022 League of St Martin appendix into the 1887 novena. Use the movable Shrove Tuesday schedule through existing Calendar Intelligence.

This B24 PR therefore ships **one source-defined devotion**, not an under-verified second one.

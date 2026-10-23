# Calendar customs — full bilingual search

Implementation note, 23 October 2026.

The 35 published Calendar customs were already accessible through **Browse all customs**, with contextual recommendations on the appropriate dates and seasons. Their old catalogue search indexed only titles and short descriptions, was sensitive to French accents, and required the words to occur in the same literal order.

The new search uses the existing article objects, indexing English and French text of the title, description, history, meaning, practice, cautions, scope and occasion, plus the display names of historical and supporting sources. It handles common diacritics and punctuation (for example, `Épiphanie` can be found with `epiphanie`; `Saint-Nicolas` with `saint nicolas`) and matches words regardless of order within each article.

The visible Calendar layout, sourced expandable articles, existing time/season suggestions, 1962 day resolver, and separate `My Customs & Prayers` module remain unchanged. This is a catalogue search improvement, not a new Customs Atlas and **never adds an event based on a historical source or search phrase**.

Regression tests ensure all 35 published articles can be located by both titles, relevant historical/ritual terms and alternate French spellings. The 3 context-only and research-only identities remain excluded. No source, reviewer decision or publication status is modified.

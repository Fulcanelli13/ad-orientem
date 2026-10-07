# Novenas — Source of Truth v1

**Status:** FROZEN  
**Freeze date:** 2026-10-07  
**Canonical machine-readable SOT:** `data/pray/novena-sot.v1.json`

## Decision

The Ad Orientem Novenas project is frozen at **16 curated targets**.

All sixteen are:

- playable in the existing `pray.novenas` owner;
- available in Guided and Simple modes;
- scheduled by Calendar Intelligence rather than a second PRAY calculator;
- furnished with French prayer-body text as well as English;
- provenance-labelled so an editorial French translation is never presented as an historical French witness.

The exact twelve-target N3 English donor remains preserved in `src/pray/novena-corpus.js`. The production corpus is the V4 bilingual completion layer in `src/pray/novena-corpus-v4.js`.

## Frozen target list

1. Holy Ghost
2. Christmas
3. Corpus Christi
4. Sacred Heart
5. Immaculate Conception
6. Annunciation
7. Assumption
8. Seven Sorrows
9. St Joseph
10. Holy Souls
11. Our Lady of Perpetual Help
12. St Thérèse
13. St Anthony’s Nine Tuesdays
14. Christ the King
15. Immaculate Heart of Mary
16. St Michael the Archangel

## French parity

French parity means the **actual prayer body**, not merely the title, guide or historical note.

The corpus contains 79 novena-specific source-body units. Every one has non-empty English and French text. Canonical prayers reused by the novenas—Our Father, Hail Mary, Glory Be and the 1962 Loreto litany—also have French canonical records.

Two French provenance labels are deliberately distinct:

- **TEXTE FRANÇAIS TRADITIONNEL** — a traditional/source French witness is retained or closely aligned;
- **TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE** — an editorial French translation aligned to the locked historical source.

This distinction must not be removed for cosmetic uniformity.

## Four recovered targets

### St Anthony’s Nine Tuesdays

This remains a **weekly** devotion. It is not a nine-consecutive-day novena. Calendar Intelligence computes nine successive Tuesdays leading toward the 13 June feast. The traditional source also makes clear that one single mandatory prayer text was not universally prescribed; Ad Orientem uses the commonly attested traditional prayers without inventing nine day-specific meditations.

### Christ the King

The novena uses the traditional Prayer to Christ the King in repeated form and binds its preparation to the **last Sunday of October**, matching the 1962 feast.

### Immaculate Heart of Mary

The novena uses an older approved prayer to the Immaculate Heart in repeated form over nine days, preparing the **22 August** feast. Historical evidence supports nine days of approved prayer without requiring an invented day-specific corpus.

### St Michael

The novena uses the traditional Leonine Prayer to St Michael in repeated form, preparing **29 September**.

## Ownership

`PRAY` owns the prayer experience.  
`Calendar Intelligence` owns dates, feast-relative windows and active/upcoming state.  
Canonical common prayers remain owned by the canonical prayer registry.

No second Easter calculator, no private novena-window calculator, and no duplicate common-prayer text is permitted.

## Privacy / devotional restraint

Novenas do not store:

- streaks;
- completion scores;
- intentions;
- devotional history.

The app may suggest the correct day from Calendar Intelligence, but it does not gamify the devotion.

## Freeze rule

A seventeenth novena is **not** appended casually to this corpus. A new target requires:

1. a demonstrated product need;
2. traditional source research and French-world relevance review;
3. English and French prayer-body coverage;
4. a new SOT version;
5. date-semantics ownership review;
6. regression and phone/visual acceptance.

Research corrections to an existing target may be made without reopening the 16-target architecture, provided its identity and owner remain unchanged.

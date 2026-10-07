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

The production V4 corpus contains 91 novena-specific source-body units. Every one has non-empty English and French text. Canonical prayers reused by the novenas—Our Father, Hail Mary, Glory Be and the 1962 Loreto litany—also have French canonical records.

Two French provenance labels are deliberately distinct:

- **TEXTE FRANÇAIS TRADITIONNEL** — a traditional/source French witness is retained or closely aligned;
- **TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE** — an editorial French translation aligned to the locked historical source.

This distinction must not be removed for cosmetic uniformity.

## Calendar start authority

The calendar window and the historical prayer body are separate claims.

Every novena now carries one of two start classifications:

- **TRADITIONAL_START** — the source or pre-conciliar devotional tradition explicitly binds the novena to that liturgical preparation or start;
- **SUGGESTED_START** — Ad Orientem offers a useful feast-relative or seasonal window, but the historical source did not require that exact start date.

The interface must render these as **Traditional start / Début traditionnel** and **Suggested start / Début suggéré**. A feast-aligned convenience date must never be promoted into a historical rule merely because Calendar Intelligence can calculate it.

## Four recovered targets

### St Anthony’s Nine Tuesdays

This remains a **weekly** devotion. It is not a nine-consecutive-day novena. The traditional source requires nine consecutive Tuesdays but does not restrict them to a feast-preparation window. Calendar Intelligence therefore offers the nine Tuesdays leading toward 13 June as a **SUGGESTED_START**, not as a recovered historical start rule. The source also makes clear that one single mandatory prayer text was not universally prescribed; Ad Orientem uses the commonly attested traditional prayers without inventing nine day-specific meditations.

### Christ the King

The novena uses the traditional Prayer to Christ the King in repeated form. A pre-conciliar family-liturgy witness explicitly describes a private novena or triduum during the nine or three days immediately preceding the feast, so this is classified **TRADITIONAL_START** and is bound to the last Sunday of October in the 1962 calendar.

### Immaculate Heart of Mary

The novena uses an older approved prayer to the Immaculate Heart in repeated form over nine days. Historical evidence supports nine consecutive days of approved prayer without fixing them to 13–21 August. Ad Orientem offers 13–21 August before the 22 August feast as **SUGGESTED_START**, not as a source-mandated historical window.

### St Michael

The novena uses the traditional Leonine Prayer to St Michael in repeated form. The 1910 Raccolta states that the novena may be made at any time of year with any prayers sanctioned by competent ecclesiastical authority. Ad Orientem therefore offers 20–28 September before Michaelmas as **SUGGESTED_START**, not as the historical rule.

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

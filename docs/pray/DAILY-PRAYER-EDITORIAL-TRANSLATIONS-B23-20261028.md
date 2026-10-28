# B23 — Original texts with Ad Orientem English and French translations

**28 October 2026 · Research PR #1785 · Draft translations, not published prayers**

The exact edition remains the primary record. The user may now read existing source-form texts in their original language or in explicitly-labelled **Ad Orientem editorial translations** directly inside the single-file HTML reviewer:

- Original 1905 Italian — English or French draft translation, including original common prayers recovered from the **same 1905 Compendio**, chapters I–III.
- Authorized French revision, 1913 — original French or English draft translation.
- Any English rendering in the draft is a new translation of source words, **not an attested historical English prayer** and not a replacement for the printed 1905/1913 text.

## Translation inventory

| Parent edition | Source text category | Drafts |
| --- | --- | --- |
| 1905 original Italian | Morning core (1), Evening core (1), three invocations (3), plus nine authentic 1905 Italian common-prayer formulations (9) | English and French; **14 distinct units** |
| 1913 revised French | Morning core (1), Evening core (1), twelve printed common prayers/invocations (12) | English; 14 distinct units |
| Total | **28 source-aligned units** | **28 covered units; no editorial approval implied** |

The full machine-readable record is [`data/pray/daily-prayer-pius-x-translations.b23.json`](../../data/pray/daily-prayer-pius-x-translations.b23.json). Each translation is keyed by the **exact edition, daypart and stage ID** of B21, not by a generic prayer title. This prevents contamination between the original 1905 and later revised 1913 forms.

## Reader behavior (offline editorial HTML)

Use the **St Pius X · Primary routine** tab. Select a source edition, Morning/Evening, and **Original / English (AO draft) / Français (AO draft)**. Translated text is labelled in the prayer reading card, with an expandable **original-source comparison** below. Where the original text has not been transcribed or the requested-language translation is absent, the reader displays a warning instead of importing a modern or postconciliar substitute.

The 1905 appendix gives titles for its common recitations. The same printed 1905 *Compendio*, **Prime nozioni di catechismo**, chapters [I](https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_I), [II](https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II) and [III](https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III), supplies nine of those formulas, now restored under edition- and chapter-specific provenance in B21 and translated into English/French in B23. **Salve Regina and Angele Dei** remain source-copy pending; they are not silently borrowed from the 1913 French revision. The original 1905 `tutte la mie azioni` source anomaly is kept in the original and explained where the English/French drafts render its clear intended meaning.

The 1913 French evening **De profundis** belongs to an adjacent optional devotion; translating its entire Psalm requires identifying the exact source version. A guided examination of conscience is a practice rather than one printed prayer body; its prompts must be sourced and marked as editorial guidance, not fabricated quotation.

## Editorial acceptance criteria

1. Every printed source text remains available with its original edition and page/source link.
2. A bilingual proofreader confirms all English and French draft prayer translations, sentence by sentence.
3. Each selection is approved as a complete source prayer, with edition-specific order.
4. Do not attribute English draft words to Rev. John Hagan (1914) without locating that actual English volume; catalogue existence is not wording verification.
5. Do not publish on the live reader before editorial selection, original-print page checks and territory-specific distribution/reuse review. The public implementation manifest is deliberately empty and `DAILY_APPROVED_SEQUENCE_RELEASE_V1.enabled=false`.

**Implementation scope:** PR #1785 research only. No Home, Mass, Calendar, public Prayer text or timer feature modified.

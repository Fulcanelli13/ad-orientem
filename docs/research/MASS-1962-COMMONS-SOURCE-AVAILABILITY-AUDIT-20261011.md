# Latin Common Mass source-availability audit — 11 October 2026

**Research only; publication approval: false.** Continues the [targeted source recheck](MASS-1962-CHANT-INHERITANCE-TARGETED-SOURCE-RECHECK-20261011.md); existing 105/420-slot census remains unchanged.

## Verifiable repository-level discovery

- The upstream Divinum Officium [Latin Commune directory](https://github.com/DivinumOfficium/divinum-officium/tree/master/web/www/missa/Latin/Commune) was enumerated using its GitHub contents API. It currently exposes **two files only: `Coronatio.txt` and `Propaganda.txt`**. Thus the four referenced paths `C6b`, `C10b`, `C10`, `C10a` are not retrievable at their expected paths on current upstream `master`. **Do not infer absence of the liturgical chants from this repository-layout fact.**
- An independent [Missale Meum local-data layer](https://github.com/mmolenda/missalemeum/tree/main/backend/resources/divinum-officium-local/web/www/missa/Latin/Commune) lists 28 Common files, including all four names. Its README describes this as an intermediary, local reference-resolution layer, **not an original 1962 printed witness**. Its sections must not be silently treated as canonical Divinum Officium originals.

## Exact requested sections inspected in intermediary files

| Requested section | Content observed | Decision |
|---|---|---|
| `Commune/C6b:Offertorium` | `@Commune/C6-1` | References another file; no biblical annotation yet certified |
| `Commune/C10b:Introitus` | `@Commune/C10b:Introitus` | Self-reference; cannot resolve without external evidence |
| `Commune/C10:Offertorium` | `@Commune/C11:Offertorium` | External parent not present among the listed 28 intermediary Commons |
| `Commune/C10a:Communio` | `@Commune/C10a:Communio` | Self-reference; cannot resolve without external evidence |

The `C10a:Communio` issue affects three child occurrences; the six original unresolved Common **uses** represent four distinct required source/section pairs. The local files have names but do not directly establish the missing canonical Latin or biblical verse mapping.

## Priority next checks

1. Search historical Divinum Officium source revisions or independently digitized editions for fully populated `C6b`, `C10b`, `C10`, `C10a` Common sections, with source revision identifiers.
2. Do not make `@Commune/C10b:Introitus` or `@Commune/C10a:Communio` recursive; stop at self-references.
3. Resolve `C6-1:Offertorium` and `C11:Offertorium` from authenticated Latin source witnesses, then compare exact chant text against 1962 Missal.
4. Model every Common and the full 1962 year (including optional feasts, votive, Requiem, Nuptial, vigils and special services) as a **separate expanded denominator**, not part of the completed 105-path subset.
5. Index complete Alleluia, Tract, and Sequence sections by their **actual seasonal and liturgical placement**, not as generic Gradual synonyms.
6. No LIVE, Calendar, Scripture resolver, published Formation, or Atlas changes; all new research links remain unpublished until Latin/edition check.

**Outcome:** the original six Commons inheritance uses remain **six unresolved**. This audit resolves their current source-location question, not their canonical textual content.

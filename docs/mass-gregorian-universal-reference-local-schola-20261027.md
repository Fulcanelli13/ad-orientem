# Ad Orientem — Gregorian repertoire reuse and local Schola evidence
27 October 2026 · research branch PR #1749 · not a production musical release

## One repertoire, never one catalogue per church
Canonical repository owner: `data/mass/chant-corpus/gr1961-proper-index.json` and its six pinned `gr1961-proper-00*.json` GABC archives (1,195 staged GABCs). These are *reference research*, not editorially approved Gregorian melodies. Do not reimport, duplicate, or create one score record for every chapel.

The existing 1962 Day/Proper resolver owns which **Mass formulary and each liturgical text** is selected. A *source-compatible* 1961 `Graduale Romanum` score may be offered as an optional study reference only after matching the selected source path, chant role and Latin incipit. This does not certify the GABC against the printed neumes, prove local performance, or license any recording. The ten Christmas-in-die/Pent21 score references remain the only complete Proper pilot programmes. Zero facsimile/editorial releases.

A shared Roman Proper is generally reused regardless of chapel or institute, but **not solely by calendar date**: local sanctoral Propers, permissible formulary alternatives, source inheritance, seasonal selections and differing Roman-family rites must be independently resolved. No Dominican/Ambrosian/other-rite score inheritance by fiat. The Kyriale Ordinary is a separate, freely selected musical setting, never inferred from the feast or institute.

## Three evidence domains
1. **Roman Proper text / standard reference:** `reader-proper-chant-crosswalk.js` verifies resolved 1962 source/track/incipit; `mass-gregorian-programme-layers.js` presents those shared preview IDs, with `approvedCount: 0`. Five tracks cover Introit, Gradual, pre-Gospel chant, Offertory, Communion, where resolvable; unusual Masses and Requiems require their own maps. No copying of full GABCs into venue records.
2. **Institute musical custom (advisory only):** an explicitly documented `INSTITUTE_CUSTOM` record keyed by stable institute ID may note traditions, possible style or programme tendencies. Even if sourced, it **never** proves what was performed in a specific church at a specific Mass.
3. **Church-specific programme:** an `SITE_MASS_PROGRAMME` record may describe an identified church and Mass date/source only if independently source-documented. It has a provenance URL, stable site ID from the world venue registry, rite, Mass date, resolved Proper source path, and per-track musical *styles*. A site's older bulletin cannot silently supply tomorrow's settings; an institute's practice cannot substitute for local evidence. Conflicting documents remain unresolved, not arbitrarily selected.

The optional existing user-reported Ordinary selections remain a fourth distinct **personal** signal, never independently confirmed choir performance. Even with a documented bulletin, the app does not infer that the actual performance matched it.

## Schemas and safe defaults
The new pure API `composeGregorianProgrammeLayers({properCrosswalk,chantProgramme,riteId,date,siteId,instituteId,evidence})` returns `standard`, `local`, `institute` and `user` separately. Its default local/institute/user statuses are `UNKNOWN`. Its standard status is reference-only, zero approved, and it always returns `autoAssignedPerformanceScore: null` and `autoPlayback: false`.

Evidence schema: `ao-local-schola-evidence-v1`. Record kinds: `SITE_MASS_PROGRAMME` and `INSTITUTE_CUSTOM`. Required for both: `id`, `riteId`, `status: SOURCE_DOCUMENTED`, `sourceUrl` (HTTPS), and `tracks` keyed by chant track ID with one of `GREGORIAN`, `PSALM_TONE`, `POLYPHONY`, `OTHER`, `OMITTED`, `UNREPORTED`. Site records additionally require `siteId`, `massDate`, and the exact `sourcePath`. Institute records require `instituteId`; optional `sourcePath` narrows their application. The module does not fetch or persist evidence, and currently receives no global venue programme feed. It does not invent a local programme database or override the existing worldwide site master.

## Implementation boundaries and next gates
- The Mass-preparation Folio now states how many of the five standard Proper reference slots match the selected source **without saying they are approved**. The notation selector remains explicit and offline.
- Before using site records in production, implement a separately permissioned, source-audited link to the existing unified site registry and clarify event/date provenance. No browser-local global defaults or propagation solely from institutional affiliation.
- Add the new contract to `npm run test:reader-schola`. Guard zero automatic playback, no wrong-site/date/source projection, no cross-rite inheritance, no transcriber-to-facsimile approval, and no institute-custom-as-actual assertion.
- **Bulk next step:** enrich source-to-Proper linkages for the 342 provisional textual candidates as a deterministic join against the *actual* selected 1962 resolver and segmented chant slots, then review only identity/variant exceptions. The other 853 archive entries need expanded discovery, not re-screening the same 106 files.
- Requiem's multiple formularies, Sequence and musical distinctions remain separately held; no five-slot inference.
- No paid storage, subscriptions, recording imports, publishing or merge approved.

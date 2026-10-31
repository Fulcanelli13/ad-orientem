# Mass Music M04 — actual selected 1962 Mass determines common chant tones
31 October 2026 · Stacked on M03 (#2154), M02 (#2153), M01 (#2152) · **Draft only**

## Actual implementation

The production browser bridge already passes `options.calendarResolution` and the chosen, recovered `options.proper` to `adaptV346ResolvedMass` in `src/mass/host-adapter.js`. We now reconcile both through `src/mass/reader-mass-actual-tone-context.js`, leaving the published Calendar and Mass source pipeline untouched.

The source bridge emits `provenance.musicToneContext` only when **all** of the following are true:
- The reader is starting the *Mass of the day* (not a selected votive, alternate Proper, Requiem or separate rite).
- The canonical 1962 Calendar DayResolver returned a ready, exact-same-date `day.main` and a ready Proper.
- The DayResolver's principal source ID has precise `tempora:<stem>:<class>:<colour>` or `sancti:<stem>:<class>:<colour>` structure.
- Its Proper source path and the **actual chosen reader Proper** both agree with the very same principal owner: `Tempora/<stem>` or `Sancti/<stem>`.
- If the resolver provides a principal rank, it agrees with the ordinal carried by that source ID.
- The liturgical-kind assignment is supported by that source identity and any supplied explicitly typed resolver kind, not by a civil-calendar day *alone*, English title, liturgical colour, local parish setting or UI rank.

Within those source boundaries:
- Authenticated Temporale Sunday, including Advent/Lent: **SOLEMN**.
- Authenticated ferial Temporale weekday, except protected Holy Week/octave identities: **FERIAL**.
- Authenticated selected principal Sanctoral classes I–III: **SOLEMN** (the IV-class candidate is not presumed festive).
- Authenticated Christmas Vigil `sancti:12-24` (I class): **SOLEMN**.
- Authenticated Holy Thursday Mass source `tempora:Quad6-4`: **SOLEMN**.
- Easter/Pentecost octave weekdays require the principal's expressly typed `OCTAVE_DAY` classification; absent that data they are **HELD** instead of misclassified as ferias.
- All Souls is never a 'festive' classification. The original authenticated All Souls Requiem resolver and M03's Requiem predicate select **FERIAL** independently.

The source context is passed into the already existing M03 common tone resolver, M02 dialogue pairs and existing R17 Schola Music menu, **without** any new cue, Mass card, actor clock, chant duration or media player. This improves automatic selection only where source verification is complete.

## No silent optional-Mass fallback
The current host's `votiveClass` and alternative-Mass title are not authoritative proof that a requested votive's music matches the calendar day. M04 consequently leaves those choices unclassified until the selected votive's *own* official source and class have been certified. Even a selected Votive celebrated on Sunday must not silently inherit that Sunday's common tone.

The chosen Calendar's display rank is not a source for music; `romanClassTier` is used only to cross-check a rank already attached to the authenticated principal. The date's weekday only checks the canonical Temporale ID's explicit `-0` to `-6` sequence; it never supplies a missing liturgical celebration.

## Music pending approval
This bridge resolves the rubrical **solemn/ferial family**. It does **not** certify the celebrant's actual pitches, score transcription, all Preface response neumes, Gregorian GABC, audio, Gospel intonation, Kyriale, dismissal variants, Asperges season source or any 1961 `Liber Usualis` facsimile. All 10 M03 score leads remain research-only until exact witness comparison, licence verification and user approval. The full 1,195-score archive also remains a draft candidate library.

## Regression acceptance
The new `tests/reader-mass-actual-tone-context.mjs`, invoked by both `test:host` and `test:reader-schola`, includes:
- Eight sourced Calendar/Proper case profiles covering Advent/Lenten Sundays, a weekday, Marian feast, Christmas Vigil, Holy Thursday and an explicitly certified Easter octave.
- Source-owner/path/rank/date conflicts, an incomplete Calendar resolution, a non-startable Mass, an unrelated requested votive/Requiem and a protected Easter-octave hold.
- The genuine All Souls Requiem, the three matched Preface response/source families and the preservation of a LOW Mass's lack of Schola projection.

## Next
M05: musical-notation source witness comparison, completion of the celebrant-and-choir **pair** for each solemn/ferial dialogue, and exact 1962 seasonal Asperges/Vidi and Easter-octave dismissal. M05 must not mix audio and musical score approval, nor blindly promote any GregoBase transcription.

# Prayer Corpus B17 — Five Wounds chaplet (source-driven integration)

28 October 2026. This is a single historically attested, focused private devotion added **inside existing Rosary & Chaplets and Passion & Stations collections**. It is **not** a new top-level module, not a replacement for the St Alphonsus Stations, and not a general expansion of the Raccolta.

## Inclusion and rejection reasoning

**Admit:** the Passionist Chaplet of the Five Wounds, which is short, useful for personal meditation and structurally distinct from the Rosary and Stations. Reuse the frozen Ad Orientem *Glory Be* and *Hail Mary* texts in existing EN/FR/LA recensions. The reader has exactly **five groups**, each with **five Glory Bes** followed by **one Hail Mary** (25 + 5 prayers; 30 steps). Five wounds follow the Passionist order: left foot, right foot, left hand, right hand, sacred side. French wound headings are descriptive interface labels, **not claimed translations of new historical prayers**.

**Exclude:** mandatory beads/medals, new formula invocations, alleged new historical closing prayers, indulgence claims presented as current, and alternative later Holy Wounds chaplets. This is a private devotion; physical blessed beads are not a prerequisite for recitation.

**Hold:** the full and short Precious Blood chaplets. The full form needs a complete ending text; the short form has a 33-versus-35 Pater discrepancy and must not be silently 'corrected'.

## Historical sources

- [Passionist Congregation historical archive, origin and 1823 simplified form](https://passionistarchives.org/chaplet-of-the-five-wounds-its-history-blessing-and-indulgences/), including Leo XII's 20 December 1823 approval and removal of the earlier, longer Pater/Ave/Gloria formula for each bead.
- [The Raccolta: Jesus Crucified, chaplet entry](https://www.liturgialatina.org/raccolta/crucified.htm), explicit five sets of five Gloria Patri plus one Ave Maria **at the end of each set**.
- [The New Raccolta, 1903, §9 (historical additional witness)](https://www.todayscatholicworld.com/Raccolta-Imp-1903.pdf), independently records the same form.

These corroborate the displayed order. An original scanned 1857 print-page collation is still not certified; therefore no claim of edition-level original scan verification or historical indulgences is made in the UI.

## UI, navigation and source rules

- New internal **subroute** `pray.five_wounds` uses existing `AO_PRAY_V435930` route owner; it is a single Chaplets-family option, with a small contextual link from the existing Passion family; the original 23 Prayer-family ownership entries remain frozen.
- The reader advances among 30 prayer steps; the wound rail jumps to each group; the 5+1 bead indicator distinguishes the Ave; a quiet progress bar shows session progression.
- EN/FR use the already-selected Prayer language and its canonical text. A local Latin toggle uses the **canonical Latin**; this reader does not replace the original session-language switch owned by other rites. No new translations, no API fetch, no changes to original 48 prayer records.
- Reader does not mark completion in any Calendar or devotional streak; Finish returns to the existing previous Prayer surface.
- All controls have a minimum 48px touch target (wound selection at least 58px); keyboard focus and reduced-motion requirements are included. Provenance and ritual history are secondary disclosure.
- Existing reader routes, personal preferences, Morning/Evening, Stations, Rosary, Divine Mercy, Mass and the Divine Office remain independent.

## Tests and release acceptance

`tests/pray-five-wounds-chaplet-b17.mjs` validates exact 30-step identity and sequence, 25 Gloria/5 Ave, canonical EN/FR/LA texts, 5 wound order, route ownership, UI controls, structural style, and both Precious Blood holds. The earlier historical chaplet gate now expects **only** the Five Wounds to have `userFacing:true`. Both are included in the required `test:pray-owner` script; the existing mobile Pray acceptance workflows are expected to run unchanged.

Zero cost, no new host or repository archive.

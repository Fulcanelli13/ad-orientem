# Biblical Atlas — resume last passage and mobile scene continuity

**15 October 2026 · owner #342 · Continues the existing 151-event canonical source**. The merged #1253 enabled the physical Atlas and Context shortcut on the ordinary app URL. This follow-on closes a second, practical reading issue: every previous Explore → Biblical Atlas entry forcibly reset to the first mapped stop, even after the user had selected an event much later in the Bible.

## User contract

A deliberate selection through the existing chapter strip, timeline steps, manual timeline scroll or already-established map pins now saves **only the canonical `biblical:* eventKey`** in the device's browser `localStorage`, under `ao:biblical-atlas:reading-place:v1`. No names, text, GPS coordinates, progress scores, timestamps, or account data are stored or transmitted. The event key identifies Scripture itself, not a display index. If new events are inserted into the sequence, a valid previously read episode can still be found. If it is deleted or unavailable, the reader safely starts at the first source-qualified mapped episode instead of an unrelated index.

When reopening the Bible Atlas from Explore, the selected event, source-backed pin, original chapter title and Scripture action are restored. Opening the atlas, remounting MapLibre or pressing **Follow** must **never** count as reading progress. Selecting **The Beginnings / Les origines** in the existing eleven-chapter strip deliberately returns to event 0 (Creation) and saves that choice; the next reopening retains Creation, even though it has no terrestrial map pin. No extra restart button, decorative progress ring or gamification is added.

Storage failure (disabled storage, blocked privacy mode, corrupt content or quota exceeded) cannot prevent the Atlas opening. No cloud sync is implied. The saved place survives in the same browser/origin, not automatically across different devices or browsers. Clearing website storage removes it.

## Phone interaction correction

The existing expanded context sheet can remain open while the reader switches scenes. Its scroll position is now reset at a scene change so the next episode begins visibly at its title, not halfway down unrelated previous research. The permanent **Context** shortcut expands *all* independently sourced context cards for the active scene (historical place names and landscape caveats where available), instead of arbitrarily opening only the first. All sources still retain their original precise qualifications. Programmatic ribbon centring is ignored for a short scroll event interval, preventing unintended auto-selection from overwriting the reader's saved place. Natural user swipes still update event selection and can save their place.

## Acceptance

- `tests/atlas-reading-place.mjs`: exact 151 stable source IDs; matching by key across reordered arrays; no coordinates/text in storage; malformed/unknown keys; missing/denied storage; intentional clear.
- The **normal, no-query** Chromium browser integration extends `tests/atlas-default-integrated-phone.mjs`: select canonical Miletus event, verify stored key, close/reopen and confirm restored scene and historical source note, select Creation via the real chapter strip, close and **reload the page**, then confirm Creation is still selected and Scripture remains usable.
- The existing full phone-sized 320/390/768, physical basemap, free-pan contract, App convergence and required main CI gate remain mandatory.

This is executable web-browser acceptance, not physical Android touch verification. The next manual acceptance should test finger pan → Follow restoration → chronology swipe → close/reopen → Scripture return on an actual Android Chrome handset, also noting portrait safe areas and localStorage behavior in installed APK/webview if used. No historic-era coastline claims, new narratives, image research, Scripture source replacement or source parsing changes are made.

# LIVE sanctuary original visual assets — staging only

The owner-supplied 65-scene original HTML and 65 icon files are preserved byte-for-byte. `ao-sanctuary-embedded.js` is an adapter; the original 3-D geometry, figures, camera, lighting and keyframes are not edited. Enable only with the host preview flag `aoSanctuaryPreview=1`.

The canonical native LIVE reader owns the 1962 prayers, cues, dynamic rubrics, icon rails, and Mass progression. The Schola owns independent Gregorian Propers; its music or sample chant clock NEVER causes sanctuary choreography. Source focus drives an illustrative visual, not an observation of the celebrant.

## Source-triggered choreography under review

| Native source cue | Original visual | Forms | Condition |
| --- | --- | --- | --- |
| AO.SM.C0174 / AO.CARD.015 | C36, Host elevation | Low, simple Sung, incense Sung, Solemn | Active certified Host elevation source cue |
| AO.SM.C0181 / AO.CARD.016 | C38, Chalice elevation | Low, simple Sung, incense Sung, Solemn | Active certified Chalice elevation source cue |
| AO.SM.C0121–C0124 / AO.CARD.010 | C24, Offertory incensation | Incense Sung, Solemn | Starts **only** at C0121 (offerings), continues without restarting through C0122–C0124 (cross/altar and minister incensation); never starts from C0120 incense blessing or the independent Schola Offertory |

Elevations cancel immediately on leaving their *single* active cue, extinguishing their glow. The C24 incense choreography instead remains active through its sourced C0121–C0124 sequence (the original motion lasts approximately 16 seconds), and cancels when the reader exits that sequence. Continuation cues do not start or restart it. Returning to the initial C0121 after leaving can replay it. LIVE→MISSAL now sends an explicit cancel to the still-mounted iframe: pending actor keyframes, smoke and elevation effects must not survive the mode change. These are preview-only illustrative source-focus bindings. Green technical tests are not a certification of the complete choreography.

## Deliberate source holds

- **C13 Missal transfer**: the existing source cue AO.SM.C0081 describes priest arrival at the Gospel-side Missal; it does not establish the earlier server transfer timing. In Solemn Mass the same boundary belongs to the deacon's Gospel procession. Do not automatically trigger the original server movement from C0081. A sourced non-text preparatory event is required.
- **C57 Communion walk**: AO.SM.C0246 describes distribution already at the Communion rail, not the priest's preceding route. Do not animate an approach based on that text. A separate route event/boundary is required.
- **P1 Asperges**: the original priest walks down the nave, but does not execute the required sprinkling gestures.
- **Solemn minister staging**: O'Connell ceremonial audit and the complete deacon/subdeacon/acolyte position corrections remain open. The sung-Mass acolyte now stands by the sedilia instead of kneeling.
- **Meaning texts**: draft, not approved.

The full original animations have been exercised in isolated Chromium playback, and five native LIVE viewport scenarios passed at the earlier draft head. Re-run required CI after any new binding change; do not merge or publish until the new gate and ceremonial holds are resolved. GitHub Actions and GitHub Pages only, no Vercel.

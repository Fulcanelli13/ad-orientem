# Mass LIVE — priest-side field acceptance protocol (11 October 2026)

**Release state: UNTESTED IN A REAL SERVICE.** The 64/65-card Ordinary LIVE remains an opt-in draft. Production remains 48 cards. **No part of this document authorizes merge, default enablement, or claims that the app detects the celebrant automatically.**

## What is actually complete

- The 28 non-rendered registry references resolve to 15 canonical source-only cue identities.
- Ten cues have pre-existing MC graph-event bindings, each requiring an exact independent event report.
- Five have explicit **observer-only** `MC-OBS-*` contracts defined in [reader-priest-pending-observations.js](../src/mass/reader-priest-pending-observations.js). They are *not* extra events in the certified 178-event objective traversal, not extra prayer cards and cannot be inferred from the Schola.
- Automated repository and Chromium phone acceptance tests cover identity, actor/form, conditional sedilia, source section, reader mode, Schola independence, and exclusions from faithful posture/bells/cinematics. **Tests prove software behavior under supplied observations, not the accuracy of live observations.**

## Phone evidence recorder

Open [the standalone field sheet](../tools/priest-event-field-review.html) as an HTML file on a phone or other offline-capable device. It is **separate from the Mass reader**: it never calls a reader API and never moves a priest icon. It has 15 stage prompts, a five-event filter, actual Mass form, observer/venue identifiers, direct-observation result, separately recorded reader outcome, independent Schola note, and free-text discrepancy notes. It exports JSON to the device (no automatic upload); **export before leaving the page**, because unsaved session data will be lost. The export always says `fieldCertified:false` and requires human adjudication.

**Do not record an unobservable private prayer as OBSERVED.** If the celebrant's quiet reading cannot actually be heard or identified with confidence, choose UNVERIFIABLE even if the rubric says he ought to be saying it. A rubric is authority for a requirement; it is not evidence of observed performance.

Recommended setup: one person familiar with the liturgy records priest/minister actions, while another tests the opt-in 64/65-card phone reader. When only one tester is available, mark any unseen action UNVERIFIABLE rather than reconstructing it from the app or Schola. Avoid any operation that distracts from participation in Mass.

## Field scenarios and acceptance criteria

| Scenario | Required inspection | Status |
|---|---|---|
| Ordinary Missa Cantata, with or without incense | Priest vs lector Epistle; independent Introit and Offertory; normal conclusion turns; 64-card navigation | **No field evidence yet** |
| Solemn High Mass | Subdeacon Epistle; deacon Gospel; celebrant's private Gradual; conditional sedilia; no wrongly attributed minister events | **No field evidence yet** |
| Schola runs ahead/behind priest | Introit, Gradual, Offertory and Communion tracks must not move the priest or steal his focus | **No field evidence yet** |
| Conditional Gloria/Credo sedilia | Both sitting and return; verify absence of false icon when sedilia not used | **No field evidence yet** |
| Extraordinary Roman-rite branch | Lenten Prayer over the People; various prescribed dismissals; inspect correct physical turn | **Not seasonally field-tested** |
| Presentation/phone | English and French labels, icon clarity, touch, rail positions, Schola viewport; 320/390px | **CI tests available, field review absent** |
| Production regression | Default 48-card reader, Missal/Simple, Low Mass, special-day overlays unaffected | **Automated gates available; user acceptance outstanding** |

For each applicable cue, the record distinguishes (a) **what was independently seen/heard** from (b) **what the app displayed**. Mark an item as field-verified only if it is truly observed, the reader outcome is MATCHED, the correct celebrant/minister is identified, and no wrong Schola/posture/bell/reader transition occurs. UNVERIFIABLE and NOT_APPLICABLE remain honest evidence statuses, not passes. An explicitly observed MISMATCH or STALE output blocks release until corrected and repeated.

The absence of false cues matters as much as the presence of correct ones: watch especially `C0109` (a priest-side Offertory observation must **not** trigger its faithful `SIT` registry value), `C0075` (lector ≠ priest), `C0086` (deacon at Solemn Gospel), and `C0249` (priest reads Communion only **after ablutions**, not at `MC-COM-305` Schola Communion).

## Five observation-only gates

| Cue | Exact event | Required positive witness | Negative control |
|---|---|---|---|
| C0042 | `MC-OBS-INT-POS` | Celebrant reaches the Epistle Missal | Schola begins Introit; later priest recitation |
| C0077 | `MC-OBS-GRADUAL` | In Solemn form, celebrant himself reads Gradual quietly | Choir Gradual or Epistle ends |
| C0109 | `MC-OBS-OFFERTORY` | Celebrant himself recites Offertory | Schola begins antiphon, `Oremus` or presentation of Host |
| C0250 | `MC-OBS-PC-TURN` | Visible turn after Communion antiphon and altar kiss, before greeting | Centre return alone or `Dominus vobiscum` |
| C0256 | `MC-OBS-DISMISS-TURN` | Visible turn following Postcommunion(s) and any *Oratio super populum* | Audible final greeting or completion of Postcommunion alone |

Primary rubrics: [*Ritus servandus* IV.2 and IV.7–8, VI.4 and VI.8, VII.1–2, XI.1–3](https://1962ordo.today/1962-rubrics/) (with distinctions for Mass form and ministers). See the [full source/event identity audit](MASS-RESPONSES-PARAGRAPHING-CARD-GATES-20261011.md).

## Release decision

**No merge/default release merely because the 15/15 mapping and browser tests are green.** To close this gate, attach exported real-service JSON evidence, identify venue/form/date and reviewer, review both observed correctness and meaningful unobservability, resolve every MISMATCH/STALE result, and record a human-reviewed acceptance decision. A field checklist or simulated test is not a substitute for a real Mass observation.

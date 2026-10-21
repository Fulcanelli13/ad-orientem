# Curated 65 Mass — voice, priest station and icon-led rubric QA

**Source authorities:** `Ad_Orientem_Ultra_Master_Mass_Music_Reconciled_2026-10-19.xlsx`, sheets **09 PRIEST EVENTS 279**, **06 LIVE RUBRICS 57**, **37 MUSIC LITURGICAL TIMELINE**, **39 SCHOLA RUNTIME CROSSWALK**; the user's 182-asset final-names lock; and the reader's 279 canonical cue IDs / 49 source position transitions.

**Status:** draft integration, not a production release. The user's names and images are immutable; no rejected artwork may be rendered. The curated ordinary Mass is **65 cards** (64 visible by default when the optional second Confiteor is omitted). Extra sourced chants can legitimately add cards. Keep Low Mass and the historical 48-card rollback distinct.

## Priest chanting is a source-owned action, not an audible-speaking synonym

See `data/presentation/mass-ultra-master-voice-audit-20261021.v1.json` for **all 34 Ultra Master voice events containing “SUNG”**:

| Actor of sung text | Events | Right rail |
|---|---:|---|
| Priest himself | **27** | Approved image ID `ao_chant` (exact user display name **Chant**) in Sung forms only |
| Schola | **2** | Schola clock/icon; **never** a priest Chant on the choir continuation of Gloria or Credo |
| Minister / server response | **4** | Response, not Priest Chant |
| Mixed Offertory greeting then private priest action | **1** | Phase-specific; no persistent Chant throughout private prayer |

The 126-record voice transition registry already owned 25 sung-voice records, including two choir-owned continuation records. The Ultra Master 279-event timeline establishes **four additional priest-owned moments** at Collect Proper `C0073`, the final part of the Preface dialogue `C0142`, sung Pater noster `C0209`, and Postcommunion Proper `C0254`. These four are source-specific aliases, not speculative text search. The other 23 verified priest-owned chant cues remain as before.

**Low Mass** does not render the Chant image: spoken passages use the approved Priest Audible voice where appropriate, while genuinely quiet/secret/silent states retain their own voice semantics. The 65-card curated resolver must not be used as a shortcut to remap Low Mass.

**Solemn Mass** changes actors for the Epistle and Gospel: the subdeacon and deacon, respectively, own the chant. A generic event carrying “SUNG / CLEAR” does not justify a priest icon. The independent Schola clock is never advanced from a user's scroll or a presumed priest action.

## Priest station — read the full 279-event Ultra Master, not merely 49 transitions

The priest's **station, facing, Missal position, route, voice and momentary gesture** are distinct variables. The 49 transition registry has source-owned conditions; the 279-event Ultra Master records station for each event. Key review checkpoints:

| Source cue | Priest station | Missal | Important qualification |
|---|---|---|---|
| `C0001` | Foot of altar | Epistle side | **Text-only Foot Centre** — icon expressly vetoed |
| `C0037` | Ascending steps | Epistle side | Momentary movement |
| `C0042` | Epistle-side Missal | Epistle side | Introit |
| `C0072` | Epistle-side Missal | Epistle side | Collect |
| `C0082` | Gospel-side Missal | Gospel side | Priest proclamation in appropriate Cantata form; Solemn deacon is separate |
| `C0109` | Altar centre | Gospel side | Offertory antiphon |
| `C0112` / `C0113` | Epistle side, chalice preparation | Gospel side | Requiem changes water-cross action, **not** priest station |
| `C0114` | Altar centre | Gospel side | Chalice offering |
| `C0125` | Epistle side | Gospel side | Lavabo |
| `C0134` / `C0144` | Altar centre | Gospel side | Secret / Preface |
| `C0249` | Expected Epistle-side Missal | Epistle side when confirmed | Source `PRIEST_TRACK_ASYNC`: independent `MC-END-010` observation required |
| `C0250` | Return to centre only when actually observed | Epistle side when confirmed | Not inferred from Communion antiphon Schola or swipe |
| `C0253` | Epistle-side Missal | Epistle side | Postcommunion |
| `C0267` | Gospel side | Proper Last Gospel may transfer Missal | Last Gospel may be omitted |

See `data/presentation/mass-priest-position-continuity-20261020.v1.json` for the existing 279-cue + synthetic sermon baseline. Incense circuits, sedilia, Solemn ministers, Requiem and rites with opening omissions are conditional.

## Minimal LIVE rubric copy: only when art is genuinely equivalent

The Ultra Master **06 LIVE RUBRICS 57** has **57** short source rubrics (54 priest and 3 server events). `src/mass/reader-icon-backed-rubrics.js` permits **eight exact** reductions only when the corresponding source cue, actual action subphase, approved image and loaded image asset all match:

| Event ID | Actual action | Original user-approved asset |
|---|---|---|
| `AO.RUB.C0068.01` | Priest signs himself | `ao_sign_of_cross_vector` |
| `AO.RUB.C0079.01` | Priest bows profoundly | `ao_adoration` |
| `AO.RUB.C0104.01` | Priest signs himself | `ao_sign_of_cross_vector` |
| `AO.RUB.C0174.02` | Elevates Host | `v46_priest_elevation` |
| `AO.RUB.C0181.02` | Elevates Chalice | `ao_elevation_chalice` |
| `AO.RUB.C0232.02` | Priest receives Host | `ea_priest_communion_host_original` |
| `AO.RUB.C0234.02` | Priest receives Precious Blood | `ea_priest_communion_chalice_original` |
| `AO.RUB.C0262.01` | Priest kisses altar | `v46_priest_kiss_altar_rich` |

The other **49 remain textual**. Do not let one Host/Chalice elevation image erase separate genuflections, replacement of the Sacred Species, bells or the joined-thumb-and-finger rule. A priest's head bow is not a profound bow. At Communion the celebrant is not the server; the source actor governs. Keep full published rubrics in **Missal mode**, and keep the original source-text DOM in LIVE for accessible reading. **No substitution on unresolved icon, wrong ceremonial actor, wrong action phase, absent asset or different form**.

## Release gates

- `node tests/reader-final65-position-icons.mjs` covers the 34 voice audit entries and source-owned actors.
- `node tests/reader-icon-backed-rubrics.mjs` verifies the eight source-equivalent rubrics and refuses all other 49.
- The normal required main gate includes these plus immutable icon-name/rejection and position projection tests.
- The phone harness must use the full **frozen donor + reviewed posture + 68 final approved originals** bank, as the production browser bridge does.
- Verify 320px/390px mobile with changing active cues, no stale priest Chant after the minister responds, no Foot Centre art, and correct dynamic colour/cropping before merging.
- Preserve postures/ritual source wording on uncertain cues rather than offering pictograms that are merely similar.

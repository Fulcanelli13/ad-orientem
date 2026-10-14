# Ad Orientem · Non-Mass cinematic contract v2

Date: 14 October 2026 · implementation owner: `src/pray/devotional-cinematic.js`

## Decision: bodily actions must be salient

In short devotions, **every reliably source-owned change of bodily action that requires the user's attention receives a full posture cinematic**, not a small badge or a faint text pulse. This is intentionally unlike the Mass, whose gesture density requires selective effects. The cinematic is an *instruction* and attention aid, **never proof the user acted**.

### Three visual scene classes

1. **Opening art tableau** — one user-reviewed artwork, once per opening of the devotion, approximately 3.2 seconds; skip allowed. No cycling, Ken Burns crop, four-stage painting montage, or repeated interstitial. If no verified image is available, fall back to typography; never silently use an unapproved reproduction.
2. **Posture cinematic** — visually dominant large approved recolorable icon, exact Latin anchor, vernacular action label and deliberate *Continue praying* dismissal; no time-driven dismissal and no synthetic tracking. Reduced-motion users see the same full clear scene **without movement**.
3. **Sacred action cinematic** — for separately certified special ritual actions such as Eucharistic Benediction or the unveiling of the Cross. Not every significant word warrants an animation.

## Angelus exact contract

- The canonical Angelus comprises four named prayer cards. The existing source-first prayer text, V/R divisions, language replacement and three Hail Marys are untouched.
- The opening art occurs **only** on the first card at entry, never on card jumps, recitation or translation changes, or return to earlier cards in the same session.
- The reviewed pool on 14 October comprises four **4/5-retained Annunciation** works from the user's 13 Oct art decisions: `nga-46` (van Eyck), `met-437250` (Bedoli), `met-436791` (Joos van Cleve), `met-436502` (Luca Giordano). These are *Annunciation*, not *Visitation*: the reviewed Visitation pool currently has one rating-2 retained candidate and does not establish the requested high-quality multi-item rotation. Do not expand its status by assumption.
- Each session randomly chooses from eligible records, avoids immediate consecutive duplicates when >1 is available, and keeps that artwork fixed. The visual reproduction itself remains a separate editorial/local-asset approval, with public-domain remote museum images as provisional online sources.
- The only **Angelus Incarnation cue** is exactly *Et Verbum caro factum est* in the third card. It opens the posture cinematic. The next response is printed as *Et habitavit in nobis*. No full artwork reprise.
- **Requested devotional gesture custom**: ordinary weekday head bow; Sunday and Saturday after Vespers genuflection. The independent traditional baseline (kneel ordinary days, stand Sundays and after Saturday Vespers) remains unchanged. This preference is *not* a universal rubric; other customary choices can override it explicitly. Do not infer Saturday Vespers from a clock hour.
- The cue must not run in the `Regina Cæli` Easter substitution. Neither entering an unrelated card nor reading another text can trigger it.
- On each fresh entry, show at most one action cinematic for the exact cue; allow deliberate dismissal without advancing the prayer. No animation sound, artificial bells or enforced pause timer.
- Large posture icons come only from approved source assets: `ao-live-head-bow`, `ao-live-genuflect`, with configured variants `ao-live-profound-bow`, `ao-live-kneel`, `ao-live-stand`. Do not create new anthropomorphic artwork.

## Stations follow-up acceptance contract

Do **not** manufacture a full-screen cue at every station merely because the text contains the verb *kneel*. First establish the source-owned choreographic transitions in each of 14 station steps and the optional introductory/concluding prayers. Each accepted cue needs:
- exact source-step/paragraph/verse anchor, actor (faithful vs priest), normative vs local/customary character;
- action (kneel, stand, bow, genuflect) with whether it changes posture or is a passing gesture, plus return stage;
- conditional mode (individual/group, procession/veneration/customary variant) and a matching existing approved icon;
- one debounced full cinematic per accepted action when crossing its active source anchor, no repeated painting as the faithful scroll or returns to review a station;
- continuous prayer source ownership, screen reader cue, tap-to-continue, reduced-motion parity and 320/390px viewport capture.

As with Angelus, **full posture salience is the baseline** for sparse devotions; ceremonial truth and user customs must be established before attaching the effect. No clinical timer or moral/participation badge.

## Acceptance checklist

- [x] No four-card Tanner interstitial.
- [x] Approved-rated artwork record gate with no immediate repeated identity.
- [x] Full-size Incarnation posture cue, large canonical action icon, manual continuation.
- [x] Day-sensitive custom and independent base-posture separation.
- [x] Reduced motion retains posture cue without animated movement.
- [x] Actual phone and unit regression coverage included in Marian workflow.
- [ ] User aesthetic signoff on final gallery selection and image reproductions; bundle offline assets.
- [ ] Stations cue-by-cue source and posture acceptance, then implementation.

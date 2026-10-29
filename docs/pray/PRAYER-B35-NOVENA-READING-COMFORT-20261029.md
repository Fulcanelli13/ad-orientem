# Prayer B35 — Novena long-form reading comfort
29 October 2026 · bounded UI repair, no prayer content change

## Audit findings
Source-owned Novena prayer paragraphs already use a responsive **18px minimum** serif face with 1.66 line-height and at least 20px between original paragraph boundaries. Maintain that reading rhythm. A Novena's historical edition, source link, printed witness qualifications and uncertainty are already in a **closed-by-default** Sources & edition disclosure; do not remove or hide it.

Two actual usability gaps remain in the existing reader:
1. The source witness label was only 0.62rem (about 10px at the default root font size), difficult to read on a 320px phone. Other source notes/summaries also used small metadata text.
2. The day/stage Previous and Next buttons follow the potentially very long full text and end-of-reader source disclosure. A phone reader can lose easy one-thumb access to navigation.

## Patch
- Increase the source-witness provenance label to **12px**, source disclosure summary to **14px**, and expanded source metadata to **14px** with 1.6 leading, all scoped to the existing Novena reader. Keep the source link, edition distinctions, uncertainty caveats and translation source signals intact and collapsed by default.
- Use the existing Previous/Next buttons in a subtle **bottom sticky navigation row** within the Novena reader (not a second navigation system). Preserve the reading frame, card-local scroll, safe-area inset, disabled state and original route handlers.
- Review of the actual captured 320px EN Novena screenshot also showed the shared reader's **30% distant / 56% adjacent** paragraph opacity is too dim for a long historical prayer. This release retains the currently focused paragraph at 100% and sets Novena-only nearby paragraphs to 80%, distant paragraphs to 65%. All other devotional readers keep their original 30%/56% focus values. The active-paragraph emphasis remains present, but prose is readable throughout.
- Ensure each tap target has a **48px minimum height**, flexible narrow-screen width, visible keyboard focus and solid background to separate controls from prayer text.
- Do not alter the original 16 baseline novenas, additional source-owned readers, order, prayers, chapters, progress sequence, font family, Latin/French/English texts or prior B33/B34 behaviours.
- No new paid assets, services, external image downloads, or duplicate modules.

## Gate
- Existing `test:pray-novenas` runs a new source/composition contract.
- Existing Novena Playwright CI checks actual 320px/390px computed paragraph, provenance and source-summary sizes, closed source notes, minimum 65% focus opacity, 48px thumb targets, pointer hit testing and sticky geometry **on opening and after scrolling**, in EN and FR, and checks no horizontal overflow.
- Capture 8 temporary screenshots (opening/scrolled × 320/390 × EN/FR), with 3-day GitHub Actions retention for a real visual review. Functional test success is not equivalent to human screenshot approval.
- Merge only if the Required Main Gate and phone acceptance pass. Verify the exact merged SHA becomes READY in production.

## Limit
This addresses two narrow usability defects in the Novena reader, not a whole-app accessibility certification. Separate liturgical content/voice/posture constraints are unaffected.

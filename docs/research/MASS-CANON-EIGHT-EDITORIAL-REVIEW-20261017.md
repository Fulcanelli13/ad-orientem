# Canon B047–B061 — bilingual editorial pass (17 October 2026)

**Parent owner:** draft [Formation P2 PR #1307](https://github.com/Fulcanelli13/ad-orientem/pull/1307), *not* the liturgical reader. **Target:** eight original long-study candidates, 34 explanatory sections in English and French; all remain `DRAFT_AWAITING_EDITORIAL_APPROVAL`. This document records an **editorial candidate revision**, not human doctrinal approval or a licence to publish.

## Result

- **8/8 original studies retained**, same IDs `AO.FORM.CANON.DEEP.01–08`, claim bindings, Roman Canon B047–B061 ownership and 34/34 section count; all explanatory texts still original draft research.
- **12/34 bilingual sections revised**, with the same English/French direction; **22/34 retained provisionally**. No new claims, Bible reader, gesture, author attribution, ritual event or liturgical text.
- Kept `data/learn/mass-explorer-approved-studies.v1.json` **empty in canonical main**: zero long studies publicly released. Editorial output must first pass the existing SHA-locked human wording review, independent rights/source review and explicit publication gate. Because text has changed, previous SHA-based draft decisions must be recomputed rather than copied.
- Explicitly avoided importing the draft branch's older `src/learn/mass-explorer.js`: production already serves 84 short English/French prayer readings and the long-study publication gate from #1335/#1337.

## Owner-by-owner assessment and corrections

| Study | Source block(s) | Section(s) revised | Source-grounded editorial change |
| --- | --- | --- | --- |
| 01 — beginning of Canon | B047–B050 | §3 | Explain the actual `Communicantes` petition for protection **through the merits and prayers of the saints**. Replace a purely defensive discussion of alternative mediators with the prayer's positive meaning. |
| 02 — `Quam oblationem` | B051 | §§2, 5 | Five Latin qualifications of one oblation are **not five petitions or consecrations**. Replace app/reader implementation instructions with meditation on the transition from supplication to Consecration. |
| 03 — Consecrations | B052–B053 | §§1, 4 | Teach the received words and the ordered genuflect–elevate–replace–genuflect ceremonial without presenting elevation itself as consecration; remove software development instructions from theology. |
| 04 — `Unde et memores` | B054 | §4 | Name the text's own **pure, holy, immaculate Victim**, Bread of life and Chalice of salvation; prepare the following Abel/Abraham/Melchisedech comparison without invented readings. |
| 05 — `Supra quae` | B055 | §5 | Replace **“hear or read”** with reading the names in a *quietly recited* Canon; develop the analogy of the earlier accepted offerings to the Eucharistic sacrifice. |
| 06 — `Supplices te rogamus` | B056 | §§2, 4 | Restore the source's **`per manus sancti Angeli tui`** and heavenly-altar petition; do not infer the Angel's identity. Explain the linked petition for those receiving the Body and Blood. |
| 07 — `Memento`, `Nobis quoque`, `Per quem` | B057–B059 | §3 | Reflect all five of `creas, sanctificas, vivificas, benedicis, praestas`; remove developer statement about the app not merging paragraphs. |
| 08 — `Per ipsum` and conclusion | B060–B061 | §§3, 4 | Differentiate the traditional Roman **Amen response** after the audible/sung `Per omnia` from an unconditional prescribed vocal action by every congregant. Present the transition to `Pater noster` and Communion rather than software commentary. |

## Original-source witnesses used to check wording

- Canonical 1962 Latin/English: `data/presentation/reader-text-sung.v1.json` B047–B061; published MF04–MF06 claim texts: `data/learn/mass-formation-campion.v1.json`. These are original owners; the draft source manuscripts do not replace them.
- 1962 *Ritus servandus* X.1 on audible `Per omnia`: https://www.intratext.com/IXT/LAT0820/_PL.HTM
- 1960/1962 rubrical voice norms for `Nobis quoque`, `Per omnia` and silent Canon: https://maternalheart.org/library/1962rubrics.pdf
- 1962 chant-practice manual distinguishes responding to the end of the Canon: https://media.churchmusicassociation.org/books/7848318-Psallite-Sapienter-A-Musicians-Guide-to-the-Extraordinary-Form.pdf
- Canon Latin for `Supplices` and the commemorations: https://media.musicasacra.com/pdf/hebdomadae.pdf (older missal witness, not independently claimed as 1962 typical edition).

## Held editorial questions — no publication or ritual mutation

1. **Human review:** All 34 sections require a final read for Catholic doctrinal correctness, suitability for the TLM, and idiomatic French. These 12 revisions address specific source fidelity, not every historical interpretation.
2. **Source/provenance:** The 24 published P1 claims are not blanket certifications for each subsection. The claim IDs here mean *topical relations*, not a printed-Missal word-for-word quotation or complete proof of each advanced theological elaboration.
3. **Text fidelity outside this PR:** The current Sung donor's C0194 reads `locum refrigerii, lucis pacis`, whereas the historical printed Canon witnesses read `locum refrigerii, lucis et pacis`. Record this for the canonical **liturgical source owner** to verify separately; never change the donor in an editorial draft or pretend it is corrected here. Evidence: https://media.musicasacra.com/pdf/hebdomadae.pdf and https://media.musicasacra.com/books/gregorianmissal-eng.pdf. This does not change the study's general treatment of the Memento.
4. **Full historical excerpts:** No third-party text, Gihr/Le Brun quotation or interpretation has been imported. Publication rights review, exact source citations and intended separate P0 certifications remain outstanding.
5. **UI design:** The existing approved-study renderer is the only future insertion point. No extra top-level module, no automatic exposure in `learn.mass_explorer`, and no modifications to LIVE/Simple/Missal, 48-card rollback, priest clocks or rubrics.

**Next editorial action:** Produce the SHA-current, eight-study bilingual review preview using the already existing `scripts/build-mass-explorer-all-canon-release-review.mjs` on the updated #1307 research branch, and take explicit human *approve / revise / pending* decisions via `scripts/prepare-mass-explorer-canon-release.mjs`. **Do not change the empty public release manifest.**

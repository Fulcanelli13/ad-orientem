# Claude prototype typography — parity contract (13 November 2026)

The three owner-supplied reference files are:
- `AO_Prayers_The_Painting_Four_Ways(5).html`
- `Ad_Orientem_Angelus_Cinematic_Effects_Comparisons(3).html`
- `Ad_Orientem_Home_V9_Artwork_Calendar_Functions(1).html`

## Families and strict semantic roles

| Semantic role | Typeface | Prototype examples |
| --- | --- | --- |
| Ceremonial | Cinzel 500/600/700 | Prayer headings, captions, small-cap navigation, labels |
| Display | Cormorant Garamond 500/600 and italic 500 | Home hero and section display, moving verses, artwork text |
| Reading | EB Garamond 400/500/600 and italic 400/500 | Long prayers, rubrics, translations, source credits |

The installed family request adds Cinzel 400, Cormorant normal 400 and EB normal 700 to the prayer prototypes' tuple, because Home V9 also uses those weights. The reference uses three faces, not a blanket serif replacement. English,
French and Latin diacritics must remain supported. Original 390px figures:
Angelus versicle 21px/1.36 Cormorant; its prayer paragraph 18.5px/1.52 EB;
ceremonial heading 29px/1.05 Cinzel; Caption Match 9.5px Cinzel with 2.2px
letter-spacing. The Four Ways prototype uses Cinzel 34px/1.02 + Cormorant
23px/1.45 for Cinematic, Cinzel 30px and Cormorant 23px for Veil, and
Cinzel 20px + Cormorant 29px/1.32 for Verse by Verse.

Home V9 embeds variable WOFF fonts, with an unusual `unicode-range`
override: Cormorant numerals U+0030–0039 use the EB Garamond file. This is
**part of the rendered reference**, not safe to remove as an accidental typo
without visual approval.

## What this branch changes

1. The certified HTML shell stays byte-identical; the shared design owner
   imports Cormorant 400/500/600 plus italic 400/500 at runtime, while the
   original shell loads Cinzel/EB. Home V9 additional faces await final review.
2. Shared application variables distinguish `--ao-font-ceremonial`,
   `--ao-font-display` and `--ao-font-body`. General display headings stop
   being silently aliased to EB Garamond; branding/navigation remain Cinzel.
3. The Angelus versicle reader receives the Cormorant treatment, separately
   from EB Garamond prayer paragraphs and 17px speaker glyphs. This does not
   change the approved Caption Match placement, wording, sequence or cadence.
4. Cinematic interstitial text uses the approved fonts rather than hard-coded
   Georgia and system-ui stand-ins.
5. A dedicated contract test protects roles, weights and narrow-screen bounds.

## Acceptance gates still required before merge

- Compare screenshots of Home/calendar, the interactive church, Angelus
  Latin/French/English, Cinematic/Veil/Verse by Verse and the Mass reader at
  **390px and 320px**. Check text clipping, wrap, numerals, small caps,
  italic shapes and art visibility. A static test cannot prove pixel parity.
- Check browser font load status and offline behavior. Google Fonts is currently
  fetched online; self-hosted licensed WOFF assets and offline precaching remain
  necessary for guaranteed offline identity. Do not represent this as done.
- Preserve existing Claude donor views in other modules; do not apply a global
  !important font sweep. Review any nonmatching scoped CSS individually.
- Run `npm run test:design-system` and the required main gate. Do not merge
  or deploy until approved. GitHub Actions/Pages only, never Vercel.

## Exact bundled fonts and offline integrity

The font assets in `assets/fonts/claude-v9/` are byte-identical copies of
the five unique variable WOFF payloads embedded in the owner's Home V9 HTML.
The duplicate Cormorant numberface declarations in Home V9 reference the
same EB Garamond normal/italic bytes; no extra font is required. Three SIL
Open Font License notices from the corresponding upstream Google Fonts
families accompany the assets. The Home V9 numeral substitution is
available as the *opt-in* `--ao-font-home-v9-display` token, without imposing
it on the Angelus or other prototypes.

The application design-system registers local `@font-face` declarations, and
the transactional service worker includes all five WOFF paths in each
offline bootstrap. Existing external font links remain in the certified
startup HTML for compatibility, but cached offline screens no longer need
those links to fetch font glyphs.

This addresses font-byte parity and offline *packaging*. Browser screenshots
and installed offline-restart tests remain separate acceptance gates.

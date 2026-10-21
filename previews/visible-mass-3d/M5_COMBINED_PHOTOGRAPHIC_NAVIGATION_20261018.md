# M5 — P6 photographic richness integrated with M4's visitor
Date: 18 October 2026 | Draft PR #1309 | **Review only; never publish draft answers**

## Product decision
Retain both kinds of authentic church photograph. The genuine 360° photographs convey spatial context from one **fixed camera position**. Close-range *separate photographs* provide the altar/object detail and visual proximity users preferred in the earlier P3/P6 prototypes. A labelled transition is a change of **photographed viewpoint**, not photogrammetric reconstruction or synthetic 3D walking.

The existing Explore / Discover / Understand shell, four non-linear guided trails, precise six-object Brompton geograph photo hotspots, original VMQ/G### IDs, research-grade French selector and Mass Explorer handoff stay in place. No parallel glossary or liturgical reader is introduced.

## Recovered and reconciled from original P6
The actual `The_Visible_Mass_P6_Photographic_Continuity.html` was recovered from the user's earlier library and its embedded `model` source manifest inspected. This confirmed the named sources instead of guessing images.

**Brompton Oratory, London** — original [David Iliff 360° interior](https://commons.wikimedia.org/wiki/File:Brompton_Oratory_360x180,_London,_UK_-_Diliff.jpg), **Anthony O'Neil high-altar still** with the existing six individually established marker coordinates, and four **AndyScott CC BY-SA 4.0** separate photos:
- [High altar view 1](https://commons.wikimedia.org/wiki/File:The_Oratory_of_S_Philip_Neri%2C_High_Altar_1.jpg)
- [High altar view 2](https://commons.wikimedia.org/wiki/File:The_Oratory_of_S_Philip_Neri%2C_High_Altar_2.jpg)
- [Lady altar](https://commons.wikimedia.org/wiki/File:The_Oratory_of_S_Philip_Neri%2C_The_Lady_Altar.jpg)
- [Sacred Heart chapel](https://commons.wikimedia.org/wiki/File:The_Oratory_of_S_Philip_Neri%2C_Sacred_Heart_Chapel.jpg)

**Newman University Church, Dublin** — original [David Iliff 360° interior](https://commons.wikimedia.org/wiki/File:Newman_University_Church_Interior_360x180,_Dublin,_Ireland_-_Diliff.jpg) and **Zairon CC BY 4.0** separately authenticated photos:
- [Main altar view 1](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_1.jpg)
- [Main altar view 2](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_2.jpg)
- [Main altar view 3](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Main_Altar_3.jpg)
- [Apse](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Choir_Apse_1.jpg)
- [Pulpit](https://commons.wikimedia.org/wiki/File:Dublin_Newman_University_Church_Interior_Nave_Pulpit.jpg)

That is **2 fixed-position 360° photographs + 10 separate photographic stills** (the original six-hotspot Brompton still plus 9 close photographs). They are **not 12 different navigable positions in one 3D church**. Coordinates and liturgical/canonical claims stay limited to their exact sources. Newman provides an architectural and religious-art context, **not evidence that a 1962 traditional Mass was celebrated there**.

## Implementation
- `visible-mass-m5-photographs.mjs` owns source photographer/licence/file identities and provides an exact-URL Commons API reader for 1800px bounded thumbnails.
- `sanctuary-hotspot-pilot.html` owns a source-specific secondary viewpoint rail, a photo stage with independent zoom/pan state and the same unified Guide shell. Photographic attribution and the licence URL update on each click. Original high-altar hotspots never appear on other stills or 360s.
- `tools/acquire-visible-mass-360-panorama.py` acquires the exact names of the earlier pictures, not replacements.
- The existing standalone builder also produces `The_Visible_Mass_M5_Combined_Photographic_Review_Offline.html`: it embeds 12 authorized source photographs and the existing research data for `file://` testing, without packaging the published Mass Explorer app.
- The CI provenance gate demands an independently verified Commons URL, correct CC licence, and photographer for each additional source; Playwright checks offline desktop and phone scene switching, rights labels and pose preservation.

## Acceptance remaining
Human review on Windows/Edge and physical Android, source-image quality and performance/thermal costs, adaptations/attribution publication rights sign-off, remaining M3 source-collation and French approvals (6), four held VMQ answers, and independent R17 acceptance. All historic/functional answers remain research-only. **Do not merge or publish PR #1309 based on this review build.**

# P68 — Object-specific photography in the existing Sacred Treasures cards

**Scope:** Exact-source photographs of reliquaries and shrines, not a new standalone image registry or replacement for the approved Place gallery.

## Initial editorial selection

Three original Commons photographs are selected by **exact canonical relic ID**:
1. **Notre-Dame de Paris**, `relic:FR:crown-of-thorns-paris`: Thomon's 29 May 2018 photograph of the **historical display of the Crown**, clearly labelled as archival. It does **not** depict the 2024 reliquary installation or establish current accessibility. The modern reliquary by living designer Sylvain Dubuisson is **held** until the artwork's underlying reproduction rights (separate from the photographer's Commons licence) are independently cleared.
2. **Nevers**, `relic:FR:bernadette-nevers`: Jabonsbachek, 6 July 2018, the saint's **glass shrine**, with dating and explicit note about the wax-covered face and hands; a dated photograph is not proof of the current visitor display.
3. **Padua**, `relic:IT:anthony-padua-tongue`: Elmiralaleh, 27 April 2022, **reliquary housing the tongue attributed to Saint Anthony**. Do not equate a photograph of the container with independent relic authentication.

The Commons file pages explicitly grant CC BY-SA 4.0. The original page, photographer, date, precise photo identity, and licensed redistribution terms are captured in `data/geography/research/approved-sacred-object-acquisition-p68.v1.json`.

## Release mechanism — fail closed

P68 implements `tools/acquire-sacred-object-photos-p68.py` with an offline `--check-manifest` mode and a networked `--acquire` mode. The latter runs on GitHub Actions **after merge to main**:

- Wikimedia Commons API must return the expected exact file, photographer, CC BY-SA 4.0 licence, original MIME and dimensions.
- Every downloaded **original** image's SHA-1 must equal the Commons media SHA-1; the Notre-Dame source additionally has a pinned historical SHA-1.
- Entire source photograph is retained without artistic crop or retouching, resized to at most 1280 px and converted to local WebP.
- A local binary SHA-256, attribution, licence URL, source photograph URL, date, EN/FR labels, caption, exact `relic_id`, exact `place_id`, subject type, and transformation description are recorded.
- All selected assets are downloaded and validated before **any new approved gallery record is written**. The GitHub Actions job commits the WebP files and the existing `data/geography/approved-place-gallery.v1.json` **together**.
- If permissions, metadata, licence, API connectivity, source bytes or Git push fail, the job fails and does **not** mark an unacquired image approved in `main`. No external hotlinked pictures, expired seven-day Actions artifacts, paid API or new map pins.
- Exact image-to-object lookup in `src/find/place-profiles.js` only uses approved local gallery entries with a matching Place and a matching canonical relic ID, explicitly restricted to reliquary/shrine photographs. Historical photographs do not imply present-day public accessibility.
- The **same approved image** can appear in the general Place gallery and the appropriate Sacred Treasures card. Its photographic credit, licence and date are always visible.

## Larger-scale route

The baseline remains **122 relic records across 92 canonical physical Places**, and the existing six approved gallery photos have no canonical relic-specific subject. P68 sets up a repeatable **up to 30 exact-reviewed source files per acquisition batch**, not a daily manual three-photo research exercise.

Next, automate Wikimedia Commons category and MediaWiki search discovery across the 122 exact relic IDs. Keep **discovered candidates separate from approvals** and prioritize photographer/licence verification, subject matching, actual image quality, duplicate hashes, correct Place and accurate relic-vs-reliquary portrayal. Review only the exceptions; never automatically publish top-ranked search results as verified relic photos.

No Google Maps image scraping or copyright assumption. Wikimedia reuse must meet each image's particular licence and attribution.

## Tests

```sh
python tools/acquire-sacred-object-photos-p68.py --check-manifest
node tests/explore-p68-sacred-object-photo-binding.mjs
node tests/explore-p67-relic-indoor-placement.mjs
```

The P68 test permits both pre-acquisition (3 approved sources, no published bytes) and post-acquisition (3 exact local WebPs and gallery records verified by SHA-256) states, but never a broken intermediate state. A denied Commons licence or source identity must abort acquisition.

### Validation warning

The automated GitHub Actions asset-write job requires repository GitHub Actions `contents:write` permission on main. If branch rules block it, preservation must be accomplished through a standard image-asset PR. Do not claim photos are live until both the local asset commit and a READY production deployment are verified.

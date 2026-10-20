# User-supplied Mass icon family — original PNG archive

**Status: review-only originals; NOT approved for runtime.**

On 20 October 2026, 15 images were supplied, with one exact duplicate. Fourteen distinct original PNGs were preserved in the ChatGPT Library at:

`/Ad Orientem/Icon Reviews/2026-10-19 Priest Icon Family Originals`

Their filenames, SHA-256, exact Git blob SHA-1, original pixel dimensions, original Library locations and related canonical review records are indexed in:

`data/presentation/mass-icon-user-supplied-family-originals-20261020.v1.json`

### Binary-import status

**PENDING: 0/14 source PNGs committed to GitHub.** This directory must not be marked complete until all PNGs exist and `--verify-bank` returns success.

Two equivalent 14-PNG archives were produced in the originating conversation. The importer accepts both archive layouts, validates all fourteen source blobs before any installation, and refuses to overwrite conflicting files.

From the repository root:

```bash
python scripts/import-user-mass-icon-originals.py /path/to/Ad_Orientem_Mass_Icon_Originals_GitHub_Ready_2026-10-20.zip --install
python scripts/import-user-mass-icon-originals.py --verify-bank
git add assets/review/mass-icon-originals-20261019
git commit -m "Preserve 14 user-supplied Mass icon PNG originals"
git push
```

These commands only work in a Git checkout of the active review branch with push authorization and a local copy of the archive. Do not claim the PNGs have been committed based on the ledger or this README.

### Editorial safety

- **No new icon designs are approved by the mere presence of an original PNG.**
- **Priest genuflection is text-only pending a genuinely acceptable image.** Existing five source-owned cue texts and their timing are to remain untouched.
- **Three small Gospel crosses require no separate artwork**, by the user's October 20 decision.
- Do not overwrite `assets/active/`, `assets/approved/`, or frozen sources.
- Treat related records in the registry as *thematic connections only*. No exact-artwork identity or semantic cue binding is implied.
- No new runtime mappings, cue timing, posture ownership or animation is authorized.


# Ad Orientem Sacred Art — Phase 52: Toulouse exact-photo acquisition trial

Date: 2026-11-08. Branch: `research/sacred-art-phase48-crosswalk-recovery-20261108`. Research-only; zero public artwork changes, no Vercel or Pages deployment.

## Concrete result

Two *previously unhandpicked* photographic alternatives of exact-identified Toulouse paintings have been found with separate **CC BY-SA 4.0** photographer licence evidence:

1. **Jacques Stella, _Marriage of the Virgin_**: Musée des Augustins inventory **2004 1 75**, POP Joconde **05620000368**. Selected photograph reports **800 × 629px**. Alternative independent museum-site photograph by **Didier Descouens** dated 23 December 2018, **4,996 × 4,005px** (reported file SHA1 `c030bdd741bccc8cb25f00e6dbd4c826633f415f`), CC BY-SA 4.0. Original artwork museum catalogue: https://collections.augustins.toulouse.fr/fr/notice/2004-1-75-mariage-de-la-vierge-91bacee5-41a6-4ff2-bc25-0e96c618d236 ; original photographic file and licence: https://commons.wikimedia.org/wiki/File:Augustins_-_Le_Mariage_de_la_Vierge_-_Jacques_Stella_Joconde05620000368.jpg (also mirrored by Wikidata). Short side increases 6.37x from previously selected 629 to candidate 4,005 pixels.
2. **Sébastien Bourdon, _Martyrdom of Saint Andrew_**: museum inventory **2004 1 52**, POP Joconde **05620000033**. Selected photograph reports **800 × 677px**. Independently photographed high-resolution original by **Didier Descouens**, **5,168 × 6,037px**, CC BY-SA 4.0 (reported SHA1 `45ddc99bb7a98ac16fa6b0fb8c936c66c5932c92`). Photograph: https://commons.wikimedia.org/wiki/File:Augustins_-_Le_Martyre_de_Saint_André_-_Sébastien_Bourdon_2004_1_52.jpg ; museum catalogue: https://pop.culture.gouv.fr/notice/joconde/05620000033 . Short side increases 7.63x from 677 to 5,168 pixels.

The photographs are by a **separate photographer** and carry explicit share-alike terms. They are **not** the museum-owned POP catalogue photographs credited respectively to STC / Bernard Delorme. The public-domain painting itself does not make every photographer's image public domain. **Commercial use is permitted by CC BY-SA 4.0 subject to attribution and licence compliance; adapted versions invoke share-alike requirements**.

## Implemented execution path

- `data/artwork/phase52-toulouse-photographic-acquisition.v1.json` contains both accession-locked object identities, exact Commons titles, reported SHA-1 and pixel dimensions, source/attribution/licence details and no-publication flags.
- `scripts/art/phase52_acquire_photo.py` is a one-command research-only tool: construct original Commons file URLs; acquire both candidate and previously selected photo bytes; fail closed on candidate SHA-1 or dimension mismatch and selected-photo edition mismatch; generate side-by-side contact sheets, color statistics and non-public JSON metadata; never edit app assets.
- `.github/workflows/sacred-art-phase52-photo-qa.yml` is a branch-scoped GitHub Actions workflow with read-only repository token and a short retention private artifact. It neither changes `main`, deploys to Pages, nor runs on Vercel.
- Workflow launch: https://github.com/Fulcanelli13/ad-orientem/actions/runs/42489371038 , created against commit `bcf4785bc274d843ea66286a14027d6c2d13eb2f`. At initial inspection it was queued, not yet verified successful.
- Local direct acquisition attempted from this ChatGPT container; external network/download unavailable. Therefore **no local candidate photograph bytes or contact sheets have been verified in this chat yet**. GitHub Actions is the executable fallback; success must be confirmed from run logs/diagnostics before updating the byte-level QA status.

## Editorial restrictions

The photographs were **not personally handpicked**. Owner's approved/handpicked Commons admission policy prohibits auto-promoting them to curated Sacred Art from a Commons licence alone. They may be staged for review; avoid declaring them photo-quality approved until reviewing actual pixels and crop/fidelity. Preserve all previously handpicked originals and all 1,599 source rejections. Nothing is published or assigned to Home, Prayer, Calendar, Rosary or formation.

## Counts

Cohort evaluated in Phase 52: two exact photographed source alternatives, two physical paintings. Inherited Phase 51 baseline: 15 accession-backed paintings, 18 selected photographs under 1,200px short side. Phase 49 cross-register: 14 relationships, 13 distinct selected rows. Phase 50 known within-177 duplicate pairs: four. No new cross-register painting identity or public-image release claims made here.

### Next action

Inspect the Phase 52 GitHub Actions run (exact-source hash/pixel proof, both selected originals, contact sheets); if successful, retrieve the private artifact and perform visual comparisons of color, crop, glare/white balance, subject fidelity, and typography-safe display. Prepare an explicit owner review of these two new photos rather than automatically replacing a curated photograph.

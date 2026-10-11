# Sacred-art cross-module source reconciliation — 11 October 2026

Research-only addendum to [issue #885](https://github.com/Fulcanelli13/ad-orientem/issues/885), [publication protocol #944](https://github.com/Fulcanelli13/ad-orientem/issues/944) and [PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887).

## Authoritative current source census

- The current editorial targets are **207 core + 23 Formation = 230**, superseding the older 168-target figure in earlier PR narrative sections. Preserve historical reports as dated snapshots; do not silently replace them.
- **279** canonical painting candidate records; **264** SHA256-acquired originals (source research, not packaged art).
- After reconciling the NGA Healing of the Paralytic into the newer Scripture exact-iconography target, **114/230 subject targets meet their preliminary source-original minima**, **116/230 remain under minimum**. This is an automated research-target accounting and does **not** establish artistic merit, exact observed-day coverage, portrait authenticity, rights clearance, crop or published status.
- Last verified Calendar CI before this source-key reconciliation: **102/365 observed 2026 days with a specific-subject research candidate; 263 lack one**, and **2,467 provisional dated proposals** including contextual and seasonal fallbacks. Do not add 1 to the dated coverage statistic without rerunning the actual source-bound DayResolver audit. [Calendar CI 38093471961](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38093471961).

## One already-acquired original was missing from a newly defined subject

- **NGA 12205 — The Healing of the Paralytic**, Netherlandish 16th century, c. 1560/1590, **oil on panel**. [Official National Gallery of Art object](https://www.nga.gov/artworks/12205-healing-paralytic); canonical research file ID `nga-12205`, existing hashed source original, preliminary iconography `healing-paralytic`.
- `scripture.healing-paralytic` was introduced after this museum image had already been acquired, but the editorial exact-iconography crosswalk lacked the entry. This patch adds `healing-paralytic` to its exact source subject. It prevents unnecessary reacquisition. The painting includes the rooftop/bed narrative; an individual **1962 appointed-Gospel relationship still requires textual verification** rather than automatically equating every healing-of-a-paralytic pericope.
- Five other repeated-Gospel target keys now have **explicit but as yet unfulfilled** canonical iconography definitions: `keys-to-peter`, `raising-widows-son`, `parable-talents`, `tribute-money`, `wise-foolish-virgins`. No source images or new day associations are claimed for these five.

## Saints must have two separate coverage lanes

The existing strict `person.*` subject quota recognizes paintings with an assigned principal-person tag. This is **not** the whole saint visual collection: multi-saint altarpieces or scenes depicting a saint may carry a museum-supported saint iconography tag without being a primary saint portrait.

- **62** canonical person targets, **20** have at least one acquired painting already tagged with that named saint, **42** lack even that tagged preliminary depiction.
- Examples of important reuse: `met-458963` depicts Saints Agnes, Catherine of Alexandria, Lucy, Peter, Paul and John the Baptist alongside the Virgin and Child; `cma-150955` depicts Lucy, Agnes, Scholastica, Benedict, Veronica and Anthony of Padua; `nga-505` includes Saint Anthony Abbot; `nga-12118` depicts Saint Catherine of Alexandria.
- The new generated `saint-visual-coverage.v1.json` reports each saint's depicted-source candidates and source URLs **without** rewriting strict principal-person counts or falsely certifying any as contemporary portrait photography/likeness, observed feast-day artwork or app-approved assets.
- A single painting can be relevant to several saint entries, Rosary subjects and feast contexts, but retains ONE canonical source ID and hash. Specific secondary saints must be truthfully attributed, not promoted to the work's principal subject.

## Original-source leads and medium exclusions checked this tranche

**New source lead — not acquired, rights not cleared:**

- **Guido Reni, *Le Christ remettant les clés à saint Pierre*, 1620–1625**, oil on canvas, Louvre inventory INV 526 / MR 279. [Official Louvre painting record](https://collections.louvre.fr/ark:/53355/cl010061069). Direct scene candidate for `scripture.keys-to-peter`; museum identity and painting medium verified. **Image-resolution, original-byte acquisition, reproduction terms and crop are not verified.** Do not add to SHA registry or claim global reuse rights until that happens.

**Reject as colour-painting acquisitions for these subjects (even where public-domain/open-access):**

- [Met 340853](https://www.metmuseum.org/art/collection/search/340853), William Blake's *Parable of the Wise and Foolish Virgins*: watercolor, pen/ink/wash, **Drawing** classification.
- [Met 199490](https://www.metmuseum.org/art/collection/search/199490), Jan Rombouts *Wise and Foolish Virgins*: **stained glass**.
- [Cleveland 1992.201](https://www.clevelandart.org/art/1992.201), *Christ Giving the Keys to Peter*: **engraving** after Rubens, not Rubens's painted original.
- [Cleveland 1941.654](https://www.clevelandart.org/art/1941.654), Rembrandt *Tribute Money*: **etching with engraving**, not a painting.
- [NGA 97786](https://www.nga.gov/artworks/97786-healing-paralytic), Hans Amann's *Healing of the Paralytic*: **woodcut**, not NGA's acquired oil-on-panel `nga-12205`.

These medium exclusions apply to the canonical paintings programme. They do not imply that drawings/stained glass/prints are religiously invalid or unusable in independent modules; they simply do not satisfy this collection's source-standard.

## Next acquisition priority in large batches

1. **Repeat-use Gospel scenes:** the five unfilled subjects above; prioritize paintings with official custodial object data, open-access original images and at least 2500px source dimension. The priority is source-specific acquisition, not multiplying generic seasonal links.
2. **Saint identities:** reconcile acquired multi-saint scenes across the actual 1962 observed calendar; distinguish principal subjects, secondary saints, and modern historical portraits. Pursue the 42 without even preliminary named representations in broad thematic/museum search batches, with priority to frequently observed saints.
3. **Other high-priority under-minimum art:** Regina Cæli Resurrection (3/4), Christ the King, Holy Souls, Our Lady of Perpetual Help, Transfiguration and Palm Sunday. Never count rights-held thematic images as exact cleared paintings.
4. **Cross-module assets:** preserve existing Rosary/Stations stained-glass and other owned historic media rather than treating the separate museum original list as replacing them; Angelus Tanner PR #1015 and Antwerp Rosary PR #1022 remain their own delivery owners. Explore sanctuary photography is a separate media type.
5. **Preserve downloadable originals:** the 264 acquired images in transient GitHub Actions artifacts must be copied to durable, hash-verified storage before retention expiry. A JSON acquisition record is NOT proof that bytes will remain downloadable forever.

No small accept/reject gallery, no new production artwork, no false completed-day coverage. Final user review remains **one comprehensive offline-capable HTML atlas**, showing images and every justified use, with negative exceptions exported; release requires independent rights, technical quality and phone validation.

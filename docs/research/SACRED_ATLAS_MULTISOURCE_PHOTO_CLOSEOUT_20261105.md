# Sacred Atlas — multi-source photographic closeout (5 November 2026)

This is **research-only**. The 530 existing Place IDs, 379 approved exact-site covers, 42 approved gallery images, existing bilingual illustrative fallbacks and approved Explore UI remain unchanged. No Vercel deployment, permissions outreach, payments, bulk scraping or automatic media release.

## Verified live-data baseline (not earlier progress figures)

Source: \`data/geography/research/sacred-atlas-existing-first-151-photo-reconciliation-20261104.v1.json\` and the November 4 R28 editorial decisions.

| Distinct backlog | Count | Next operation |
|---|---:|---|
| Selected 19 Nov 4, already original-verified, but technically unlicensed for release | 19 | Resolve original revision, third-party rights, copyright and crop; user has **already selected**, never repeat selection |
| Two original-verified cover sites not selected (Aachen held, Pau unreviewed) | 2 | Held subject verification or owner selection |
| Previously selected, exact-source held | 24 | Retrieve/check the already chosen file (not another search) |
| Previously selected, PD-self original recovery held | 10 | Recover correct original and source revision |
| 43 unreviewed/no verified original | 43 | Multi-source search, prioritize existing prior research leads; one-click preview/export |
| Two verified gallery/context-only places | 2 | Use as accurately captioned gallery candidates; seek true exterior cover only if desired |
| Previously explicit None selected | 51 | Respect decision and use existing fallback; reopen only on explicit editorial instruction |
| **Total without approved site cover** | **151** | |

Of the 43, the existing R31/R32 source dossiers already show a mixture of candidate image pages, context-only leads and image-free locations. Do not reset or erase those leads; they are included in the queue.

## Practical source order

1. **Reuse exact-source originals and current approvals first**. The 19/34 cohorts are not new discovery work.
2. **Openverse** (official image-search API; CC0, public domain, CC BY, CC BY-SA), and independently visit each original landing page. Openverse search metadata is a *lead*, not conclusive permission or depicted-site identity.
3. **Flickr** with the specific original item's CC BY/CC BY-SA or CC0/public domain declaration.
4. **Geograph**, particularly Britain and Ireland. Follow official API/data terms; **do not scrape** its site. User registration/API key may be required for automated use; manual discovery is not a substitute for verifying the licence and the depicted place.
5. **Unsplash and Pexels** for genuine exact-site photographs only. Their provider terms are not Creative Commons; record the applicable licence version/source page and check protected third-party works depicted. Generic pictures must never masquerade as a particular shrine.
6. Reuse already-cleared institutional/archival originals where relevant. An older engraving can be an explicitly captioned contextual image, not a fabricated site photograph.
7. If no suitable cover results within a bounded search, **publish/retain the existing polished bilingual category-symbol fallback**. Do not hold the site's profile hostage to image search.

## Legal and identity contract

- Free/no contact does **not** mean rights-free. Attribution and adaptations must obey the exact source licence, including ShareAlike.
- Current app **already** supports CC0, CC BY and CC BY-SA and displays photographer/licence credits. Do not redesign the renderer for these licences.
- Provider-specific stock licences should not be silently added to the runtime licence allowlist. Propose a provider-specific change only after validating legal text and attribution metadata, with tests.
- Exclude NC/ND and all-rights-reserved by default for automated research intake.
- A source title or image search result is not proof of the exact physical building, actual relic or sculpture; compare against canonical Place identity and site sources.
- A photo licence may not license copyrighted art, architecture, trademarks, recognizable people or modern displays seen inside the photo.
- Every chosen original requires source page, author, licence URL, identity evidence, original bytes/hash and editorial display/crop check before the approved registry is modified.
- Preserve the 51 prior None selections, 19 final Nov 4 source preferences, past rejections and technical holds.

## Batch-review operation

The 151-row queue is in \`data/geography/research/sacred-atlas-multisource-151-place-intake-20261105.v1.json\`. It records exactly one row per missing Place and direct multi-library discovery links for the **43** search-eligible Places. Proposed Openverse discoveries, if later acquired, are unapproved research leads only.

Use the existing R31 43-place thumbnail reviewer first for already known source photos. A dedicated multi-source reviewer may supplement it for non-Wikimedia candidates. Export source *preferences*, not publication approvals. Put new source evidence back against existing \`place_id\`; never create a parallel media master.

## Release closeout order

**P0:** 19 already selected original-verified sources → finish blocked technical checks together and release only validated photos.

**P1:** 34 previously selected originals → recover exact files/metadata, then approve only after release checks.

**P2:** 43 unreviewed → high-priority multi-source photograph candidates, batch review (do not make 43 manual individual projects).

**P3:** 2 context-only → accurate gallery-or-fallback treatment.

**P4:** 51 None-selected → remain complete via existing illustrated fallback; no forced new approval.

A completed card does not require an approved photograph: the 530-card accessibility/fallback contract already exists. Long-form place histories and saint Lives are a separate editorial backlog, not a reason to keep covers in limbo.

## Source policies

- Openverse API: https://api.openverse.org/v1/
- Geograph reuse/API: https://www.geograph.org.uk/help/api
- Unsplash: https://unsplash.com/license and https://unsplash.com/terms
- Pexels: https://www.pexels.com/license/
- Flickr Creative Commons: https://www.flickr.com/creativecommons/

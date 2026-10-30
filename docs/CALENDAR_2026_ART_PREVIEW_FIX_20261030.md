# Calendar artwork previews: image source join repair · 30 October 2026

Review screenshot showed “Artwork preview pending” for multiple art proposals despite the frozen Sacred Art source registry containing official previews for **371 of the 548 Q2 records**. Correct behavior: join `artwork_id` / `physical_work_group` / canonical ID to pinned imageinfo, then use exact museum object APIs (Met and CMA) as fallback, with source links for unresolved images. Pinned source commit: `4377112d050f0ff2444e1d55a2edbb657cced74a`.

The standalone downloadable HTML viewer has been corrected in the conversation artifact. The source QA JSON accompanies this branch for implementing the same strategy in the app or in future review viewers. No new painting subject was guessed and no approval, fit decision, photo licence, or live code was altered.

CMA Maulbertsch Study for Presentation has a reproduction including a frame, which is not an approved final photo asset; it is included as a visual aid to broad-fit review only.

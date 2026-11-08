# Dev-only in-app Divine Office source review

The **real** native `Prayer → Divine Office` view accepts a private, deliberately
local-only research reader, but only for an explicit development session:

```
http://127.0.0.1:<port>/index.html?aoOfficeReview=1
```

Use a local static HTTP server rooted at this branch. Enter Prayer, select
Divine Office, then select the one special **Review actual Office source ·
development only** control. For 28 November 2026, choose Compline or
First Vespers, select Latin/English or Latin/French, and press Read source
preview. It uses the exact pinned original source leaves, not pasted HTML.
The calendar witness for the Advent First Vespers private session is fetched
from the same local branch. The normal public Prayer view does not fetch any
unreleased Office source texts.

The control is **strictly absent** on `github.io`, remote review servers,
and localhost without the explicit flag. Do not duplicate it in the published
Prayer catalogue or treat this as Office publication certification.

## Source licensing (preliminary)

- Divinum Officium pinned revision:
  `126a07f91ede04664108abb6fb20ace3f4de14b9`.
- Its exact commit includes an MIT licence: [pinned licence](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/LICENSE).
- Maintainer answer of **5 March 2026** to [discussion #5071](https://github.com/DivinumOfficium/divinum-officium/discussions/5071):
  project liturgical texts are open source and require no additional permission.
- Retain the MIT copyright/permission notice for substantial redistributed
  portions and verify separately attributable third-party material per source
  language before final public release. This evidence advances licensing; it
  does not certify Office rubrics, printed-edition collation, or the three-language
  integrity of any date-specific Hour.

**Release sequence:** 8-date private Office reader → exact dated-hour
liturgical and translation verification → attribution/notice packaging →
separate release-ready in-app Office text only for certified date/hour cases.

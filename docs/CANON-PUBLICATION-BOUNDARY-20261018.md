# Monsieur le Chanoine — source integrity and publication boundary

**18 October 2026 · Living Church P3 draft #1404 · not approved to publish**

## What changed, without new answers

The source of truth remains [Folio original Formation research PR #36](https://github.com/Fulcanelli13/folio-core/pull/36): 534 historical question title candidates, with 417 original bilingual supplementary research responses. The 27 original source JSON files staged in this P3 branch remain at their original Git blob identities. Their theological prose, bilingual translation strings, and original historic question IDs have **not** been regenerated or changed.

The [source-owner errata](https://github.com/Fulcanelli13/folio-core/blob/research/formation-completeness-ledger-20261013/data/learn/research/formation-canon-source-owner-errata-20261018.v1.json), mirrored unchanged on P3, fixes reviewer citation pointers for **LUT-011** (Trent Session XIII chapter IV/canon II and Formula of Concord VII rather than generic Trent/Session VI) and **ERR-009** (Catechism §2117 rather than §2111 as the precise treatment of occult magic). It also adds named original cessationist evidence for **PEN-010** (Thomas Schreiner, 2014) without falsely attributing that argument to Pentecostals. Source text remains SHA-pinned, and none of these actions grants an ecclesiastical, theological, or French editorial approval.

**ISL-014** remains held for Muslim exegetical and Arabic-source context. The seven-item research audit is a triage list, not a publication licence.

## Genuine access boundary

The deployed app uses the [web preview builder](../tools/build-web-preview.mjs) with `dist/web-preview` output. The builder historically copied the **entire `data` directory**, exposing the 27 unpublished historical Q&A sources by direct HTTP path even when the Canon dialogue button required query-string flags.

That is **not secure**. URL flags, `robots.txt`, `noindex` and an obscure static path do not supply access control.

The builder now reads the original 27-source provenance manifest, excludes all 27 original research JSON files from output, and additionally strips the provenance and editorial errata/audit research JSON files. Future source files matching the protected 2026-10-13 Formation supplement or Canon audit patterns are also excluded by default. Public JS module graph remains importable, but direct research-file requests cannot be served from the generated static output. The [build-output security test](../tests/canon-private-deployment-gate.mjs) checks this condition against the **actual generated** `dist/web-preview` files and is required in the P3 workflow. Other published Formation owners are deliberately retained.

**Residual concern:** Static-output exclusion does **not** make source bytes already committed to a publicly readable GitHub repository confidential. Nor does it protect separate unreviewed deployment pipelines that copy repository contents directly. For genuinely private editorial drafts, a private content store/repository or authenticated server-side delivery is required. Do not label this as an authenticated reviewer system.

## Technical state / release holds

| Gate | Result |
|---|---|
| Source identity 27 original Folio JSON blobs | Preserved; SHA test in P3 |
| Answer corpus | Existing 534 question references, 417 bilingual supplemental Q&As |
| Exact source reference correction | Folio-owned errata, no source-body rewrite |
| Named cessationist primary writer | Source pointer identified; external theological review still needed |
| Source/context review | Not independently certified |
| Native French theological copy approval | Not certified |
| Original historical raw-chat question transcript verification | Not certified |
| Public Canon Q&A | **BLOCKED** |
| Published static build includes raw unpublished research | **FORBIDDEN and tested** |
| Authenticated private review API | **NOT IMPLEMENTED** |
| Merge/public deployment of P3 | **NOT AUTHORISED** |

Keep [older PR #1101](https://github.com/Fulcanelli13/ad-orientem/pull/1101) as redundant draft research, not a competing source. Keep St Pius X's historical Catechism distinct and the Sacristan's object guide distinct. No LIVE, Simple or Missal Mass behaviour was touched.

## Required next decision

Adopt one of two deliberate publication paths: (1) remove unpublished research files from any public repository and host editor previews behind real authentication; or (2) publish only independently approved question/answer excerpts into a separate small public allow-list, while keeping the rest out of the deployed bundle. The existing four-flag research preview is for development only, not a production authorization mechanism.

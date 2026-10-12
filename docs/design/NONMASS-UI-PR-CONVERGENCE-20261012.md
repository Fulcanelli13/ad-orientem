# Non-Mass UI convergence and navigation gate — 12 October 2026

## Scope and evidence
Repository: [Fulcanelli13/ad-orientem](https://github.com/Fulcanelli13/ad-orientem).
This is an **inventory snapshot**, not permission to merge old branches.
All implementation starts from the contemporaneous `main` branch.
Do not patch the native Mass reader, preflight, liturgical text, French
localization or source/cue registers in this non-Mass programme.

The audited six mobile UI PRs are already merged: [#1052](https://github.com/Fulcanelli13/ad-orientem/pull/1052)
Today no-art, [#1054](https://github.com/Fulcanelli13/ad-orientem/pull/1054)
Formation/Prayer microtype, [#1056](https://github.com/Fulcanelli13/ad-orientem/pull/1056)
Explore/Scripture/Settings, [#1058](https://github.com/Fulcanelli13/ad-orientem/pull/1058)
map readiness, [#1060](https://github.com/Fulcanelli13/ad-orientem/pull/1060)
Calendar phone controls, and [#1065](https://github.com/Fulcanelli13/ad-orientem/pull/1065)
Rosary Methods. They are not pending implementation tasks.

## Reconcile overlapping open proposals without bulk merging

| Proposal | Disposition | Rationale and next action |
| --- | --- | --- |
| [#889](https://github.com/Fulcanelli13/ad-orientem/pull/889), module Back | **Selective recovery into this PR** | Stale and overlapping source changes; extract only the observed-origin contract for Novenas and Traditional Prayer. Future formation Back conversions require fresh tests and separate review |
| [#999](https://github.com/Fulcanelli13/ad-orientem/pull/999), unified coherence | **Do not merge wholesale** | Touches 49 files including Mass; reconcile Back, typography and Prayer reading-position helpers individually against current code. Do not import its Mass reader edits |
| [#903](https://github.com/Fulcanelli13/ad-orientem/pull/903), route ownership | **Reference, not replacement** | Overlaps modular Pray/Formation owners; accept no parallel shell/controller without source-first reconciliation |
| [#896](https://github.com/Fulcanelli13/ad-orientem/pull/896), Calendar-first UI | **Historical design reference** | Overlaps current Today/Calendar/Explore production UI. Reassess each unimplemented distinction individually |
| [#997](https://github.com/Fulcanelli13/ad-orientem/pull/997), Today v2 | **Reconcile against current Today before any merge** | The accepted Today and Calendar implementation has evolved; avoid duplicate frontispiece or stale markup restoration |
| [#1050](https://github.com/Fulcanelli13/ad-orientem/pull/1050), visual matrix | **Keep as audit-only after splitting code fixes** | Its valuable 54-screen test/ledger share a branch with live Explore changes; separate production map fixes before audit promotion |
| [#1063](https://github.com/Fulcanelli13/ad-orientem/pull/1063), narrow-phone map chrome | **Dedicated Explore pipeline** | Potentially useful but overlaps #1050 map changes, and must pass map/gesture/pin tests against latest `main` |
| [#1015](https://github.com/Fulcanelli13/ad-orientem/pull/1015), Angelus cinematics | **Prayer visual acceptance** | Maintain original recitation state and offline source; validate physical-phone reading and image prominence |
| [#1022](https://github.com/Fulcanelli13/ad-orientem/pull/1022), Rosary artwork | **Prayer art acceptance; do not auto merge** | Distinct original reader ownership and artwork licensing/crop gate; protect successful #1065 Methods UX |
| [#1029](https://github.com/Fulcanelli13/ad-orientem/pull/1029), Rosary methods | **Reconcile as earlier research/prototype** | Method and 15-decade capabilities already landed in later merged production PRs; no second method owner |
| [#887](https://github.com/Fulcanelli13/ad-orientem/pull/887), sacred-art catalogue | **Separate revised editorial scope** | Current user scope is high-quality images for major days, not thousands of paintings to approve |
| [#893](https://github.com/Fulcanelli13/ad-orientem/pull/893), Sexual Ethics guide | **Formation editorial pipeline** | Content, sourcing and debate validation are independent from this navigation repair |
| [#915](https://github.com/Fulcanelli13/ad-orientem/pull/915), Formation/Prayer contexts | **Later cross-domain acceptance** | Review link ownership and return destinations against the observed-origin contract |
| [#934](https://github.com/Fulcanelli13/ad-orientem/pull/934), Tenebrae | **Distinct Prayer module** | Existing Prayer/Office boundaries require separate source and phone gates |
| [#923](https://github.com/Fulcanelli13/ad-orientem/pull/923), [#926](https://github.com/Fulcanelli13/ad-orientem/pull/926), Directory | **Parallel map-first source pipeline** | Pin/name/affiliation/URL gate precedes Mass-times enrichment |
| [#998](https://github.com/Fulcanelli13/ad-orientem/pull/998), [#1010](https://github.com/Fulcanelli13/ad-orientem/pull/1010), [#1018](https://github.com/Fulcanelli13/ad-orientem/pull/1018), [#1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069), Biblical Atlas | **Independent Explore/Scripture research** | No incompatible atlas or duplicate map engine should displace the current source-based Explore UX |
| [#973](https://github.com/Fulcanelli13/ad-orientem/pull/973), [#1026](https://github.com/Fulcanelli13/ad-orientem/pull/1026), [#1066](https://github.com/Fulcanelli13/ad-orientem/pull/1066), [#1068](https://github.com/Fulcanelli13/ad-orientem/pull/1068), Mass | **Deferred** | User has postponed Mass UI implementation; independent Mass research may continue separately |

**This snapshot must not be treated as a live queue.** New commits and merged
PRs can change the state; re-fetch head SHA, base SHA, mergeability and CI
before applying any disposition.

## New implemented rule: observed non-Mass return

- A direct Novena link from Calendar, Today/Home or Explore returns to the
  actual source destination, not a synthetic Prayer hub.
- The Novena overview is a Back destination only when the visitor really
  selected a Novena from that overview. Day-to-detail Back still works.
- A direct Morning/Evening Prayer entry in Guided mode returns to the actual
  source; its all-prayers list is a Back destination only after an explicit
  list-to-guided transition.
- Prayer hub visitors retain their genuine parent on Back. A direct Prayer
  link may not manufacture an unvisited hub.
- Other routes, particularly Formation, Apostolate and external Prayer
  handoffs, remain **out of scope** of the first implementation. Their
  existing child monitors must not be bypassed.
- All observed-origin navigation is delegated to `AO_APP_SHELL_V1`, not
  the superseded `AO_NAV_V362` fallback.

## Release acceptance and repository governance

A pure unit contract and real 390px browser run test Calendar → direct
Novena → Calendar; Prayer → overview → detail → overview → Prayer; and
Home → guided Morning Prayer → Home. Keep existing Novena, Traditional
Prayer, Marian, Prayer route, App Convergence, and necessary shell tests green.

**Blocker:** GitHub `main` was reported `protected=false` on
12 October. The available repository integration does not have permission to
edit branch protection. A repository administrator must configure and verify
protection, as specified in
[release issue #1047](https://github.com/Fulcanelli13/ad-orientem/issues/1047).
Use an always-emitted required check before requiring path-filtered workflows;
otherwise unrelated PRs can be trapped pending. This document and passing CI
must never be described as successful branch-protection configuration.

No physical-phone certification is implied. The pilot's separate
[device acceptance issue #1055](https://github.com/Fulcanelli13/ad-orientem/issues/1055)
remains open.

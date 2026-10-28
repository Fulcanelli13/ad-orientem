# P65 — Reuse existing editorial lives and source-bound Claude packets

**Status:** source-owned editorial read model and token-bounded research exporter. No new app-visible biography is published in this release.

## Inventory before writing anything new

The six existing `data/shrines/illustrated-place-guides-*.v1.json` corpora already hold **33 PUBLISHED, bilingual, source-cited pilgrimage place guides**. The project also has a distinct Saints editorial pilot, Canonical Geography registry, Sacred Phenomena/relics, exact-place Customs attestations and linked pilgrimage Calendar keys. Do not recreate these as new owners.

**Do not ask Claude to rewrite those 33 guides.** Instead, reuse their published introduction/subtitle, and ask Claude to research real gaps (e.g. missing relic/reliquary descriptions, distinctive artworks and missing saints) with source URLs. Existing Saints pilot biographies remain under review and MUST NOT become app-published text merely because a Place has a documented link.

## Delivered

- `src/find/place-editorial-reuse.js` composes a source-bound Place introductory excerpt from its **unique already-published** guide, and derives associated sacred-object and Customs entries only from exact approved source records; separately exposes held Saints copy as editorial-only. It refuses duplicate guides, fabricated relic authentication or visitor access, context-only Customs promotion, and source-free lives.
- `tools/export-sacred-editorial-claude-packet.mjs` exports **1–12 exact canonical Places**, offline, with only relevant existing Place, shrine, pilgrimage, sacred-object, Customs, Saints pilot and published guide metadata. It has no GitHub API calls, repository crawler, external API or model invocation.
- `tests/sacred-places-p65-editorial-reuse.mjs` proves the above across Chartres, Paray-le-Monial, Sainte-Anne-d'Auray, Notre-Dame de Paris and Père Laval, plus strict limits and no duplicate biography production.

## Export

```sh
node tools/export-sacred-editorial-claude-packet.mjs --places place:FR:chartres-notre-dame,place:FR:notre-dame-paris,place:FR:sanctuaire-sacre-coeur-paray,place:MU:pere-laval-sainte-croix > sacred-editorial-packet.jsonl
```

One row per site; review the packet before sharing with Claude. Repeat in deliberate groups of no more than 12 places; do not let Claude clone or browse the GitHub repository. The export can be used in parallel with deterministic, source-rights-aware photo harvesting, but **it approves no new images**.

## Claude instruction (paste once)

> You are a Catholic historical source researcher assisting Ad Orientem, a traditional Catholic pilgrimage guide. You receive a small JSONL packet of canonical site records, not a repository link. For each Place, preserve the exact `place_id`. If `needs_new_place_biography=false`, do not rewrite its existing published sanctuary guide. Only research missing distinctively Catholic site features and source-backed saint/relic histories. If `needs_new_place_biography=true`, draft one original 80–130 word EN introduction and faithful FR version.
>
> Supply up to six well-documented, *site-specific* relics, reliquaries, saint tombs, sacred artworks and chapels with exact source URLs. Differentiate (a) sacred object, (b) housing or reliquary, (c) associated saint, (d) current custody and public access. Never infer authenticity, current location, access, Mass times, feast dates or permissions from proximity or historic references. Keep ICRSP saint-life material as source leads; locate original editions of Les Petits Bollandistes and verify text rights before quoting. Distinguish Church recognition, private revelation, local tradition and historical claims.
>
> If a Saint/Blessed already appears in `exact_linked_saints`, do not create a second Saint biography. Give precise, nonredundant facts or original sources for the Saints owner to assess. For an absent saint identity propose a candidate name with evidence, marked `UNMATCHED`, not a fabricated `saint:` identifier.
>
> Output **JSONL only**, one keyed record per input Place, with `place_id`, `bio_en` and `bio_fr` (null when the place guide already exists), `distinctive_objects`, `saints_source_suggestions`, `customs_source_suggestions`, `claim_sources`, `historical_qualifications` and `review_required`. Put precise source URLs next to each claim. No automatically published output. Do not contact owners or use paid APIs. Never paste unlicensed modern text or scrape Google Maps photographs.

## Integration acceptance sequence

1. Review P64 read-only graph contracts and CI, preserving the `CONTEXT_ONLY` Grand Pardon decision.
2. Approve P65 only as a **read-model/research-pack tool**, not new displayed biographies.
3. Import only individually source-supported Claude output into original owners: Place stories in the existing illustrated guide system, Saints lives in Saints corpus, relics in Sacred Phenomena, customs in Customs, and Calendar semantics in Calendar.
4. Upgrade **existing** Explore Place profile rendering to show editorial story, sanctuary objects, accessible details and source links, then add reciprocal Calendar navigation. Check mobile UI and 1962 Calendar regression before any deployment.

**Publication is blocked independently per claim** where person identity, textual reuse rights, relic custody, site evidence or local-feast scope is unresolved. The rest of a batch may still pass.

This architecture creates no other Calendar, Customs Atlas, independent site gazetteer or duplicated biographical text library, and requires €0 storage or APIs.

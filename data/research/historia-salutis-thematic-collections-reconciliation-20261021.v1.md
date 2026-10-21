# Historia Salutis — supplementary Scripture collections, repository reconciliation

**Status:** RESEARCH ONLY — no reader or Scripture passage has been edited or published.

This registry incorporates all **217** entries from the 2026-10-21 omission classification and cross-checks each biblical reference against the actual P3 selected Scripture segments and the existing Biblical Atlas event references on branch `research/historia-p3-esther-span-20261017`.

## Results

- Original classification: **217** episodes/entries across **9** primary thematic collections.
- Proposed P3 reading structure: **54 chapters**, **4 acts**, **12 covenantal arcs** (not yet accepted).
- P3 research proof: **37 movements** and **93 essential units**.
- Machine-parsed source spans: **216/217**. Greek Esther additions remain unresolved until a precise edition coordinate is assigned.
- References intersecting selected P3 Scripture: **5 entries**. This is a *verse-range overlap*, not proof the missing scene is present.
- References intersecting Atlas event references: **80 entries**. Do not equate geographic event records with canonical episode IDs.
- Source-report versus P3 overlap requiring manual adjudication: **1**.
- Curation examples: 19 across Biblical Narratives, Miracles, and Parables.

## Non-negotiable architecture

**One canonical Scripture-coordinate record, many collection and reader references.** A thematic collection shows a selected reading *from* the shared Scripture source: it must not store an alternate retelling or duplicate independently edited verse text. P3, Atlas, saint/person records and typological links attach to the same canonical source-coordinate nodes with explicit relation types. P3 beat IDs refer to selected *source units*, not all-purpose episode IDs.

A source-reference overlap means only that some verses intersect. For example, Matthew 21–23 intersects the Palm Sunday entry in Matthew 21 but does **not** imply that the debates with the authorities are already narrated. The original omission report must not be automatically overwritten.

## Editorial next gate

1. Resolve grouped/subepisode identities (e.g., Visitation/Magnificat and Presentation/Nunc dimittis) into common reading bundles without collapsing distinct passages.
2. For each pilot candidate, verify exact verse limits and edition provenance (Douay–Rheims/Challoner, CPDV 2009, Crampon 1923 as applicable).
3. Attach thematic navigation to existing episode sources; do not replace the P3 manuscript or change the 54-chapter research proposal.
4. Confirm source order and only then draft user-facing collection layouts.

## Validation

- 217 unique provisional keys: **passed**.
- Nine collection counts sum to 217: **passed**.
- Existing P3 reading has 54 proposed chapters; source has 37 movements: **passed**.
- Unresolved pilot labels: **0**.

Registry: `data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json`.

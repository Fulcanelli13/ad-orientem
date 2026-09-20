# Initial monolith inventory

Generated from the frozen v43.33 baseline before extraction.

## File

- Baseline size: 37,954,985 bytes (~36.2 MiB)
- Inline `<script>` blocks: 173
- Inline `<style>` blocks: 88
- Approximate script payload: 29.5 million characters
- Approximate style payload: 0.69 million characters

## Embedded data URIs

The baseline contains approximately 102 data-URI occurrences with about 20.1 MB of decoded payload.

Primary image payloads:

- WebP: 40 occurrences, about 12.19 MB decoded
- PNG: 52 occurrences, about 7.93 MB decoded

This is the first major extraction target. The repository should store reusable image files once and reference them by path instead of embedding repeated base64 payloads in the HTML.

## Largest script blocks

The largest blocks are dominated by core data/content and embedded devotional artwork. Notable approximate sizes:

- anonymous/core application block: 9.93 million characters
- Rosary native harmonization: 8.22 million characters
- Stations sacred-art integration: 6.44 million characters
- Rule engine: 1.62 million characters
- inline rubrical cues: 1.45 million characters
- traditional prayer book: 0.46 million characters

These sizes confirm that migration should extract assets/data before attempting aggressive application-code refactoring.

# Asset-bank integrity notes

## ACTOR.PRIEST.GENUFLECT

During the 2026-10-05 recovery audit, 108 of the 109 V4 core binaries in `Ad_Orientem_Icon_Asset_Bank_v4_FROZEN.zip` matched the SHA-256 recorded by the frozen manifest.

One archive entry did not:

- semantic ID: `ACTOR.PRIEST.GENUFLECT`
- asset ID: `ao-live-priest-genuflect`
- frozen path: `assets/active/live-actors/ao-live-priest-genuflect.png`
- manifest SHA-256: `d421532271ccf3978249032e02bcf5f59c6cee8b2d49fbff062da75a96b660d6`
- archive SHA-256: `cad5a189dff18a3fd1811d3fac2fee90885642a9f782aec8632294ab9aea2ee2`
- manifest/CSV byte count: 164035
- archive byte count: 160130

Do not silently rewrite the frozen manifest and do not certify the archive copy as an exact V4 binary until this single discrepancy is resolved. The semantic identity remains frozen; only binary integrity is quarantined.

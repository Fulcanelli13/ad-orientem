# Target architecture

Ad Orientem remains a static web application/PWA. No framework is required for the migration baseline.

```text
index.html
src/
  app.js
  state/
  home/
  mass/
  pray/
  learn/
  calendar/
  icons/
  art/
  shared/
data/
  mass/
  calendar/
  prayers/
  catechism/
  saints/
  art/
assets/
  icons/
  art/
  branding/
styles/
tests/
docs/
legacy/
```

## Ownership rules

### Navigation
One coordinator owns top-level navigation. Surfaces may request navigation; they do not independently reset unrelated surfaces.

### Icons
One canonical semantic registry maps destinations to assets. Owning renderers output the final icon directly. Post-render decoration and retry timers are prohibited.

### Mass
Mass data and sequence logic remain separate from presentation. Low and Sung behaviour, Schola roles, rubrical cues, Proper selection and optional pre-Mass layers must remain explicit.

### Artwork
Artwork is registry-driven, exact-path, provenance-aware and fail-closed. Proper art and saint art remain separate subsystems.

### Content
Large corpora and commentary should be loaded through manifests/services rather than repeatedly embedded in UI modules. Network-backed commentary may be cached, but offline completeness is not a migration requirement.

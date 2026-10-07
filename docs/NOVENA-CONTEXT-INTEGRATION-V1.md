# Novena Context & Integration Matrix v1

**Depends on:** `NOVENA_SOT_V1`  
**Context SOT:** `data/pray/novena-context-sot.v1.json`  
**Customs/Geography bridge:** `data/customs/novena-context-links.v1.json`

The frozen Novena corpus owns prayer text, source-backed history and the basic “how to pray” guide. This context layer adds what should evolve independently: practice/gesture guidance, indulgence law, and cross-domain integration.

## Common current indulgence rule

Under the current *Enchiridion Indulgentiarum*, concession 22, a partial indulgence is granted to the faithful who devoutly participate in a novena pious exercise **conducted publicly**. Christmas, Pentecost and the Immaculate Conception are given as examples. The app does not silently extend that novena-specific grant to private recitation.

Separate indulgenced works associated with a feast or devotion are recorded separately. They are not described as “the indulgence of the novena”.

## Matrix

| Novena | Guide / practice | Current indulgence context | Temporal surfaces | Customs / Geography |
|---|---|---|---|---|
| Holy Ghost | Day-specific; no source-locked universal posture | Public novena partial; solemn Veni Creator at Pentecost has separate plenary grant | Calendar · PRAY Now/Approaching · Home Now/Next | No published bridge yet |
| Christmas | Day-specific; source invocation + canonical prayers | Public novena partial | Calendar · PRAY · Home | No published bridge yet |
| Corpus Christi | Repeated form; distinguish novena from adoration/procession | Public novena partial; solemn Eucharistic procession and 30-min adoration have separate plenary grants | Calendar · PRAY · Home | No published bridge yet |
| Sacred Heart | Repeated form; image/intronisation is optional related custom | Public novena partial; public Act of Reparation on feast has separate plenary grant | Calendar · PRAY · Home | **Paray-le-Monial** · family consecration · home enthronement |
| Immaculate Conception | Complex source sequence; Loreto reuse | Public novena partial; explicitly cited current example; Marian/litany partial grants may also apply | Calendar · PRAY · Home | No published bridge yet |
| Annunciation | Hammer Marian sequence; no invented posture | Public novena partial; approved Marian prayer / Loreto partial grants | Calendar · PRAY · Home | No published bridge yet |
| Assumption | Hammer Marian sequence | Public novena partial; approved Marian prayer / Loreto partial grants | Calendar · PRAY · Home | No published bridge yet |
| Seven Sorrows | Hammer sequence; keep distinct from Seven Sorrows chaplet | Public novena partial; approved Marian/litany grants | Calendar · PRAY · Home | No published bridge yet |
| St Joseph | Day-specific + 3 Our Fathers + 3 Hail Marys | Public novena partial; approved prayer to St Joseph and approved Litany have separate partial grants | Calendar · PRAY · Home | France area context; several St Joseph sanctuaries attested |
| Holy Souls | Day-specific; cemetery visit separate and optional | Public novena partial; 1–8 Nov cemetery and other suffrage grants recorded separately | Calendar · PRAY · Home | **DEAD-001 / DEAD-003** French cemetery & 2 November customs |
| Perpetual Help | Repeated form; icon is historical context, not a magical requirement | Public novena partial; approved Marian prayer may have separate partial grant | Calendar · PRAY · Home | No published bridge yet |
| St Thérèse | Repeated 24 Glory Bes; no rose/object requirement | Public novena partial; approved prayer on saint’s memorial may have separate partial grant | Calendar · PRAY · Home | **Lisieux** PLACE_PENDING shrine context; exact AO form not inferred |
| St Anthony · Nine Tuesdays | **Weekly cadence**; historical Confession/Communion/church recommendations labelled historical | Public novena partial when publicly conducted; feast-day saint prayer may have separate partial grant | Calendar weekly Tuesday logic · PRAY · Home | No published bridge yet |
| Christ the King | Repeated form; devotional baptismal language is not a sacramental rite | Public novena partial; current public Act of Dedication plenary on **current Roman solemnity**, not automatically 1962 October date | Calendar last-Sunday-Oct 1962 prep · PRAY · Home | No published bridge yet |
| Immaculate Heart | Repeated approved prayer; no invented ceremony | Public novena partial; approved Marian prayer may have separate partial grant | Calendar · PRAY · Home | No published bridge yet |
| St Michael | Repeated Leonine prayer; no pseudo-exorcistic gestures | Public novena partial; approved feast-day saint prayer may have separate partial grant | Calendar · PRAY · Home | No published bridge yet |

## Gesture / practice rule

The historical sources do **not** give a universal bodily posture for these sixteen novenas. Ad Orientem therefore does not fabricate kneeling, standing, candles, images, relics or procession mechanics.

The Guided runtime may invite recollection and show the Sign of the Cross as a common Catholic preparation cue, but it is explicitly not represented as a rubric recovered from every historical donor.

Where a related practice really has material/ceremonial content—Sacred Heart enthronement, Eucharistic procession, cemetery visitation—it remains a **separate linked practice**, not part of the novena’s required form.

## Geographic rule

A saint, shrine or TLM venue being nearby does not prove that a novena is practiced there.

Published links require row-level evidence. Cross-domain research is now complete for all sixteen targets. The bridge distinguishes exact-form attestations, shrine/devotional-family context, regional/custom context, cultural-sphere evidence, and deliberately non-mapped textual evidence. A place or shrine is never inferred merely from proximity.

## Next research rule

New geographical or customary attestations may be added to the bridge without changing the frozen prayer corpus. New gestures, indulgence claims or place links must carry explicit sources and pass the bridge/context regression test.


## Completed cross-domain research — 16/16

| Novena | Evidence-backed context | Mapping decision |
|---|---|---|
| Holy Ghost | Corsican diocesan extraordinary-form programme explicitly begins the Holy Ghost novena at Ascension | France · regional context |
| Christmas | Corsican diocesan Christmas novena built from the Great O Antiphons | France · regional context · exact-form family attestation |
| Corpus Christi | Liège / St Julienne of Cornillon as documented birthplace of the Fête-Dieu | Place pending · origin context |
| Sacred Heart | Paray-le-Monial; family consecration; home enthronement | Canonical Paray place + shrine |
| Immaculate Conception | Lourdes publicly celebrates an Immaculate Conception novena | Canonical Lourdes place + shrine |
| Annunciation | Notre-Dame du Puy; sanctuary identity and Grand Pardon tied to the Annunciation | Place pending |
| Assumption | Notre-Dame de Paris; Vœu de Louis XIII and 15 August procession | Place pending |
| Seven Sorrows | Notre-Dame des Victoires public Notre-Dame des Douleurs observance | Place pending |
| St Joseph | Officially documented St Joseph sanctuary network in France | France area context |
| Holy Souls | French cemetery visitation and 2 November prayer customs | France area/custom context |
| Perpetual Help | Diocese of Paris documents a public nine-day novena at Notre-Dame du Perpétuel-Secours | Place pending |
| St Thérèse | Lisieux sanctuary explicitly attests a St Thérèse novena | Place pending |
| St Anthony · Nine Tuesdays | Franciscan shrine at Brive preserves a strong Tuesday pilgrimage association | Place pending |
| Christ the King | Traditional French prayer witness | French Catholic cultural sphere · deliberately not mapped |
| Immaculate Heart | Notre-Dame des Victoires, historic home of the Archconfraternity of the Immaculate Heart | Place pending |
| St Michael | Mont-Saint-Michel diocesan shrine and longstanding St Michael pilgrimage context | Place pending |

### Reverse integration

Explore now consumes the bridge directly. A shrine, custom or tradition record can show its related novena and provide an **Open novena** action. The action returns to the canonical PRAY owner and opens the correct novena detail; Explore never copies the prayer body.

The Traditions lens also projects every bridge row as a source-backed Novena Context record, so the geographical/custom research is discoverable from either direction.

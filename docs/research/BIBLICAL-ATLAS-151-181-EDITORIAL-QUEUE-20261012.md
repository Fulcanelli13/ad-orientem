# Biblical Atlas — 151↔181 editorial adjudication queue

12 October 2026. **Review snapshot, not a new canonical catalogue or publication approval.** Built from source-owned data on draft PR #1069.

## Owner and evidence boundaries

- The 151-event chronology is the protected, source-selected overview. The 181-scene cinematic programme is a separate study sequence, not a second canonical chronology.
- Inputs: data/explore/bible-places-compact.v1.json, src/find/bible-atlas.js, src/find/bible-atlas-expanded-milestones.js, and data/explore/biblical-cinematic-studies-review.v1.json. Scholarly donor: PR #1018. All passage and person sources remain with those source owners.
- **65 exact-citation candidates** (64 uniquely navigable, 1 multi-candidate), **29 overlap scenes**, **87 additional scenes**. Exact citation alone never proves scene/event identity, era, ancient GPS or artwork suitability.
- A future editorial disposition for each scene must be one of SAME_NARRATIVE, SUBSCENE, RELATED_PASSAGE, DISTINCT_SCENE, HOLD. No disposition is automatically approved by this index.
- Mass/Proper content belongs to PR #1082 and its independent source owner. Sacred-art provenance/rights belong to the art catalogue. Do not duplicate either catalogue here.

## Specific source-critical release blockers

1. **P0: John 2:13–22 is placed in the Passion era.** Cinematic scene #74 (First Passover in Jerusalem) maps by citation to canonical stop #110 (Jesus purifies the Temple) currently within PASSION. John narrates this cleansing early in the public ministry. Decide the Johannine-vs-Synoptic treatment and repair canonical position with a full index migration; do not silently move one array member and leave broken crosswalk links.
2. **P0: Resurrection doctrine versus empty-tomb reportage.** Scene #131 (The Resurrection) has John 20:1–18, while exact-citation canonical stop #120 is titled The empty tomb and Mary Magdalene. John 20 reports the discovery and appearance, not an eyewitness view of the instant of Resurrection. Align the theatrical title, narrative and art claims without falsely collapsing these moments.
3. **P0: one mixed exact-plus-overlap crosswalk.** Scene #68 (Jesus found in the Temple, Luke 2:41–52) has exact-citation stop #76 and overlapping Luke 2:51–52 stop #77 (the hidden life). Both source distinctions are retained and automatic navigation is blocked pending editorial decision.
4. **P1: Magi/Presentation reconstruction.** Cinematic scene #63 Magi maps to stop #72; scene #64 Presentation maps to #71. This is not a chronological order explicitly supplied by one Gospel; any harmony, date or seasonal sequence requires editorial attribution.
5. **P1: Public Ministry has several source-order reversals.** Exact-citation stop indices decline across scene transitions #70→#72, #74→#76, #76→#77, #87→#90, #106→#109 and #112→#113. They can reflect narrative selection across Evangelists, but must not be labeled a certified strict chronology. Inspect before depicting temporal transitions.
6. **P1: historical location, apostolic tradition and media.** Do not draw reconstructed Exodus roads, infer genealogy from vendor names or depict later apostolic traditions as canonical Scriptural itineraries. Imported art references still require a rights/provenance gate.

## Chapter-level work queue

| Group | Chapter | Exact citation | Overlap | No direct match |
|---|---|---:|---:|---:|
| ABRAHAM | The Patriarchs | 2 | 10 | 13 |
| MOSES | Bondage and deliverance | 6 | 0 | 7 |
| MOSES | The wilderness | 1 | 0 | 4 |
| MOSES | The covenant | 3 | 0 | 3 |
| MOSES | Toward the promised land | 1 | 1 | 6 |
| CHRIST | The Incarnation | 9 | 2 | 1 |
| CHRIST | Public Ministry | 23 | 2 | 21 |
| CHRIST | The Passion | 6 | 3 | 7 |
| CHRIST | The Resurrection | 3 | 3 | 1 |
| PAUL | The Apostolic Age | 1 | 4 | 0 |
| PAUL | First missionary journey | 1 | 1 | 8 |
| PAUL | Second missionary journey | 4 | 2 | 5 |
| PAUL | Third missionary journey | 3 | 1 | 2 |
| PAUL | The journey to Rome | 2 | 0 | 9 |
| **Total** | **14 chapters** | **65** | **29** | **87** |

## Full 181-scene review register

Indices are zero-based. The chronology target is the current 151-event index. These are review candidates, not published equivalences. Every scene still has editorial disposition HOLD.

| Scene | Chapter | Title and passage | Canonical passage candidates | Evidence status |
|---:|---|---|---|---|
| 0 | PATRIARCHS | The call of Abram — Genesis 12:1–5 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 1 | PATRIARCHS | The covenant begins with a departure — Genesis 12:4–5 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 2 | PATRIARCHS | The journey toward Canaan — Genesis 12:5–6 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 3 | PATRIARCHS | The altar at Shechem — Genesis 12:6–7 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 4 | PATRIARCHS | The promise of the land — Genesis 12:7 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 5 | PATRIARCHS | Between Bethel and Ai — Genesis 12:8 | #7 The call of Abram (passage overlap) | Overlap · HOLD |
| 6 | PATRIARCHS | A famine, a journey into Egypt — Genesis 12:10–20 | None | No direct match · HOLD |
| 7 | PATRIARCHS | The return to Canaan — Genesis 13:1–4 | None | No direct match · HOLD |
| 8 | PATRIARCHS | Abram and Lot separate — Genesis 13:5–13 | None | No direct match · HOLD |
| 9 | PATRIARCHS | Lot moves toward Sodom — Genesis 13:10–13 | None | No direct match · HOLD |
| 10 | PATRIARCHS | The oaks of Mamre — Genesis 13:14–18 | None | No direct match · HOLD |
| 11 | PATRIARCHS | Abram rescues Lot — Genesis 14:13–16 | None | No direct match · HOLD |
| 12 | PATRIARCHS | Melchizedek, king of Salem — Genesis 14:17–20 | #8 Melchizedek blesses Abram (passage overlap) | Overlap · HOLD |
| 13 | PATRIARCHS | The promise beneath the stars — Genesis 15:1–6 | #9 God's covenant with Abram (passage overlap) | Overlap · HOLD |
| 14 | PATRIARCHS | The covenant is sealed — Genesis 15:7–21 | #9 God's covenant with Abram (passage overlap) | Overlap · HOLD |
| 15 | PATRIARCHS | The birth of Ishmael — Genesis 16:1–16 | None | No direct match · HOLD |
| 16 | PATRIARCHS | Abraham receives a new name — Genesis 17:1–14 | None | No direct match · HOLD |
| 17 | PATRIARCHS | Three visitors at Mamre — Genesis 18:1–15 | #10 Abraham at Mamre (passage overlap) | Overlap · HOLD |
| 18 | PATRIARCHS | Abraham intercedes for Sodom — Genesis 18:16–33 | None | No direct match · HOLD |
| 19 | PATRIARCHS | The destruction of Sodom — Genesis 19:1–29 | None | No direct match · HOLD |
| 20 | PATRIARCHS | Abraham and Abimelech — Genesis 20:1–18 | None | No direct match · HOLD |
| 21 | PATRIARCHS | The birth of Isaac — Genesis 21:1–7 | #11 Birth of Isaac (exact citation) | Exact citation · HOLD |
| 22 | PATRIARCHS | A well at Beersheba — Genesis 21:22–34 | None | No direct match · HOLD |
| 23 | PATRIARCHS | The sacrifice of Isaac — Genesis 22:1–19 | #12 The sacrifice of Isaac (exact citation) | Exact citation · HOLD |
| 24 | PATRIARCHS | The burial at Machpelah — Genesis 23:1–20 | None | No direct match · HOLD |
| 25 | DELIVERANCE | Israel under oppression — Exodus 1:8–22 | None | No direct match · HOLD |
| 26 | DELIVERANCE | Moses is born and hidden — Exodus 2:1–10 | #18 The birth of Moses (exact citation) | Exact citation · HOLD |
| 27 | DELIVERANCE | Moses flees to Midian — Exodus 2:11–22 | None | No direct match · HOLD |
| 28 | DELIVERANCE | The burning bush — Exodus 3:1–15 | #19 The burning bush (exact citation) | Exact citation · HOLD |
| 29 | DELIVERANCE | Moses returns to Egypt — Exodus 4:18–31 | None | No direct match · HOLD |
| 30 | DELIVERANCE | Let my people go — Exodus 5:1–23 | None | No direct match · HOLD |
| 31 | DELIVERANCE | The staff and the magicians — Exodus 7:8–13 | None | No direct match · HOLD |
| 32 | DELIVERANCE | The plagues of Egypt — Exodus 7:14–25 | #20 The plagues begin (exact citation) | Exact citation · HOLD |
| 33 | DELIVERANCE | The first Passover — Exodus 12:1–28 | #21 The first Passover (exact citation) | Exact citation · HOLD |
| 34 | DELIVERANCE | The departure from Rameses — Exodus 12:31–42 | #22 The departure from Egypt (exact citation) | Exact citation · HOLD |
| 35 | DELIVERANCE | The pillar of cloud and fire — Exodus 13:17–22 | None | No direct match · HOLD |
| 36 | DELIVERANCE | The crossing of the sea — Exodus 14:15–31 | #23 The crossing of the sea (exact citation) | Exact citation · HOLD |
| 37 | DELIVERANCE | The song of Moses and Miriam — Exodus 15:1–21 | None | No direct match · HOLD |
| 38 | WILDERNESS | Bitter water made sweet — Exodus 15:22–27 | None | No direct match · HOLD |
| 39 | WILDERNESS | Bread from heaven — Exodus 16:1–36 | #24 Manna in the wilderness (exact citation) | Exact citation · HOLD |
| 40 | WILDERNESS | Water from the rock — Exodus 17:1–7 | None | No direct match · HOLD |
| 41 | WILDERNESS | Battle against Amalek — Exodus 17:8–16 | None | No direct match · HOLD |
| 42 | WILDERNESS | Jethro advises Moses — Exodus 18:13–27 | None | No direct match · HOLD |
| 43 | COVENANT | At the mountain of God — Exodus 19:1–15 | None | No direct match · HOLD |
| 44 | COVENANT | The Ten Commandments — Exodus 20:1–17 | #26 The Ten Commandments (exact citation) | Exact citation · HOLD |
| 45 | COVENANT | The covenant is ratified — Exodus 24:1–18 | None | No direct match · HOLD |
| 46 | COVENANT | The golden calf — Exodus 32:1–35 | #27 The golden calf (exact citation) | Exact citation · HOLD |
| 47 | COVENANT | The second tablets — Exodus 34:1–35 | None | No direct match · HOLD |
| 48 | COVENANT | The Tabernacle is erected — Exodus 40:1–38 | #28 The Tabernacle (exact citation) | Exact citation · HOLD |
| 49 | WANDERINGS | Departure from Sinai — Numbers 10:11–36 | None | No direct match · HOLD |
| 50 | WANDERINGS | The twelve spies — Numbers 13:1–33 | None | No direct match · HOLD |
| 51 | WANDERINGS | Forty years in the wilderness — Numbers 14:1–38 | None | No direct match · HOLD |
| 52 | WANDERINGS | The bronze serpent — Numbers 21:4–9 | None | No direct match · HOLD |
| 53 | WANDERINGS | Balaam and Balak — Numbers 22:1–24:25 | None | No direct match · HOLD |
| 54 | WANDERINGS | Moses addresses Israel — Deuteronomy 6:4–25 | None | No direct match · HOLD |
| 55 | WANDERINGS | The view from Mount Nebo — Deuteronomy 34:1–8 | #29 Moses sees the Promised Land (passage overlap) | Overlap · HOLD |
| 56 | WANDERINGS | Joshua leads the crossing — Joshua 3:1–17 | #30 Crossing the Jordan near Jericho (exact citation) | Exact citation · HOLD |
| 57 | INCARNATION | The Annunciation — Luke 1:26–38 | #66 The Annunciation (exact citation) | Exact citation · HOLD |
| 58 | INCARNATION | Joseph receives the angelic message — Matthew 1:18–25 | #67 An angel speaks to Joseph in a dream (exact citation) | Exact citation · HOLD |
| 59 | INCARNATION | The Visitation — Luke 1:39–56 | #68 The Visitation (exact citation) | Exact citation · HOLD |
| 60 | INCARNATION | Birth of John the Baptist — Luke 1:57–80 | None | No direct match · HOLD |
| 61 | INCARNATION | The Nativity — Luke 2:1–20 | #69 Birth of Jesus and adoration of the shepherds (exact citation) | Exact citation · HOLD |
| 62 | INCARNATION | The circumcision and naming — Luke 2:21 | #70 Jesus is circumcised and named (passage overlap) | Overlap · HOLD |
| 63 | INCARNATION | The Magi come to adore — Matthew 2:1–12 | #72 The visit of the Magi (exact citation) | Exact citation · HOLD |
| 64 | INCARNATION | The Presentation — Luke 2:22–38 | #71 The Presentation of Jesus (exact citation) | Exact citation · HOLD |
| 65 | INCARNATION | Flight into Egypt — Matthew 2:13–15 | #74 The flight into Egypt (exact citation) | Exact citation · HOLD |
| 66 | INCARNATION | Return to Nazareth — Matthew 2:19–23 | #75 Return from Egypt (exact citation) | Exact citation · HOLD |
| 67 | INCARNATION | The hidden years — Luke 2:39–52 | #76 The twelve-year-old Jesus in the Temple (passage overlap); #77 Jesus grows in wisdom and grace (passage overlap) | Overlap · HOLD |
| 68 | INCARNATION | Jesus found in the Temple — Luke 2:41–52 | #76 The twelve-year-old Jesus in the Temple (exact citation); #77 Jesus grows in wisdom and grace (passage overlap) | Exact citation · HOLD |
| 69 | MINISTRY | The Baptism in the Jordan — Matthew 3:13–17 | #78 Baptism of Jesus (exact citation) | Exact citation · HOLD |
| 70 | MINISTRY | The forty-day fast — Matthew 4:1–11 | #80 The forty-day fast and temptations (exact citation) | Exact citation · HOLD |
| 71 | MINISTRY | Behold the Lamb of God — John 1:29–34 | None | No direct match · HOLD |
| 72 | MINISTRY | The first disciples follow Jesus — John 1:35–51 | #79 The first disciples follow Jesus (exact citation) | Exact citation · HOLD |
| 73 | MINISTRY | The wedding at Cana — John 2:1–11 | #81 The wedding at Cana (exact citation) | Exact citation · HOLD |
| 74 | MINISTRY | First Passover in Jerusalem — John 2:13–22 | #110 Jesus purifies the Temple (exact citation) | Exact citation · HOLD |
| 75 | MINISTRY | Nicodemus comes by night — John 3:1–21 | None | No direct match · HOLD |
| 76 | MINISTRY | The Samaritan woman — John 4:4–26 | #92 Jesus and the Samaritan woman (exact citation) | Exact citation · HOLD |
| 77 | MINISTRY | The royal official’s son is healed — John 4:46–54 | #82 Healing of a royal official's son at a distance (exact citation) | Exact citation · HOLD |
| 78 | MINISTRY | Capernaum, the synagogue — Mark 1:21–28 | #83 Teaching and exorcism in the synagogue (exact citation) | Exact citation · HOLD |
| 79 | MINISTRY | Peter’s mother-in-law healed — Mark 1:29–31 | #84 Healing of Peter's mother-in-law (exact citation) | Exact citation · HOLD |
| 80 | MINISTRY | A paralytic lowered through the roof — Mark 2:1–12 | #85 The healing of a paralytic (exact citation) | Exact citation · HOLD |
| 81 | MINISTRY | The centurion’s faith — Matthew 8:5–13 | None | No direct match · HOLD |
| 82 | MINISTRY | Levi leaves the tax booth — Mark 2:13–17 | None | No direct match · HOLD |
| 83 | MINISTRY | The call of the fishermen — Luke 5:1–11 | None | No direct match · HOLD |
| 84 | MINISTRY | The Twelve are chosen — Luke 6:12–16 | #91 The choosing of the Twelve Apostles (exact citation) | Exact citation · HOLD |
| 85 | MINISTRY | The Sermon on the Mount — Matthew 5:1–12 | None | No direct match · HOLD |
| 86 | MINISTRY | The Lord’s Prayer — Matthew 6:5–15 | None | No direct match · HOLD |
| 87 | MINISTRY | The widow’s son at Nain — Luke 7:11–17 | #94 The raising of the widow's son (exact citation) | Exact citation · HOLD |
| 88 | MINISTRY | The sinful woman anoints his feet — Luke 7:36–50 | None | No direct match · HOLD |
| 89 | MINISTRY | The parable of the sower — Mark 4:1–20 | None | No direct match · HOLD |
| 90 | MINISTRY | The storm is calmed — Mark 4:35–41 | #88 Jesus calms the storm (exact citation) | Exact citation · HOLD |
| 91 | MINISTRY | The Gerasene demoniac — Mark 5:1–20 | None | No direct match · HOLD |
| 92 | MINISTRY | Jairus’s daughter raised — Mark 5:21–43 | None | No direct match · HOLD |
| 93 | MINISTRY | The Twelve sent to preach — Matthew 10:1–15 | None | No direct match · HOLD |
| 94 | MINISTRY | The beheading of John the Baptist — Mark 6:17–29 | None | No direct match · HOLD |
| 95 | MINISTRY | Jesus walks upon the water — Matthew 14:22–33 | #89 Jesus walks upon the water (exact citation) | Exact citation · HOLD |
| 96 | MINISTRY | The multiplication of loaves — John 6:1–15 | #95 The feeding of the multitude (exact citation) | Exact citation · HOLD |
| 97 | MINISTRY | The Bread of Life discourse — John 6:22–59 | #86 The discourse on the Bread of Life (passage overlap) | Overlap · HOLD |
| 98 | MINISTRY | The Syrophoenician woman — Mark 7:24–30 | None | No direct match · HOLD |
| 99 | MINISTRY | The deaf man healed — Mark 7:31–37 | None | No direct match · HOLD |
| 100 | MINISTRY | The feeding of four thousand — Matthew 15:32–39 | None | No direct match · HOLD |
| 101 | MINISTRY | The blind man of Bethsaida — Mark 8:22–26 | #96 Healing of a blind man at Bethsaida (exact citation) | Exact citation · HOLD |
| 102 | MINISTRY | Peter’s confession — Matthew 16:13–20 | #97 Peter's confession of faith (exact citation) | Exact citation · HOLD |
| 103 | MINISTRY | First prediction of the Passion — Matthew 16:21–28 | #98 Jesus first foretells his Passion (exact citation) | Exact citation · HOLD |
| 104 | MINISTRY | The Transfiguration — Matthew 17:1–9 | #99 The Transfiguration (passage overlap); #100 Jesus descends from the mount of the Transfiguration (passage overlap) | Overlap · HOLD |
| 105 | MINISTRY | The possessed boy healed — Mark 9:14–29 | None | No direct match · HOLD |
| 106 | MINISTRY | The man born blind at Siloam — John 9:1–12 | #107 Healing of the man born blind at Siloam (exact citation) | Exact citation · HOLD |
| 107 | MINISTRY | The Good Shepherd — John 10:1–21 | None | No direct match · HOLD |
| 108 | MINISTRY | The Good Samaritan — Luke 10:25–37 | None | No direct match · HOLD |
| 109 | MINISTRY | Martha and Mary — Luke 10:38–42 | #102 Jesus visits Martha and Mary (exact citation) | Exact citation · HOLD |
| 110 | MINISTRY | The prodigal son — Luke 15:11–32 | None | No direct match · HOLD |
| 111 | MINISTRY | Ten lepers cleansed — Luke 17:11–19 | None | No direct match · HOLD |
| 112 | MINISTRY | Zacchaeus of Jericho — Luke 19:1–10 | #105 The conversion of Zacchaeus (exact citation) | Exact citation · HOLD |
| 113 | MINISTRY | Lazarus is raised — John 11:1–44 | #101 The raising of Lazarus (exact citation) | Exact citation · HOLD |
| 114 | MINISTRY | The anointing at Bethany — John 12:1–8 | #103 The anointing at Bethany (exact citation) | Exact citation · HOLD |
| 115 | PASSION | The entry into Jerusalem — Matthew 21:1–11 | #108 Preparation for entry into Jerusalem (passage overlap) | Overlap · HOLD |
| 116 | PASSION | Jesus weeps over Jerusalem — Luke 19:41–44 | #109 The triumphal entry into Jerusalem (passage overlap) | Overlap · HOLD |
| 117 | PASSION | The Temple cleansed — Mark 11:15–19 | None | No direct match · HOLD |
| 118 | PASSION | The discourse on the end — Mark 13:1–37 | None | No direct match · HOLD |
| 119 | PASSION | The Last Supper — Luke 22:14–20 | #111 The Last Supper and institution of the Eucharist (passage overlap) | Overlap · HOLD |
| 120 | PASSION | Washing of the feet — John 13:1–17 | #112 The washing of the feet (exact citation) | Exact citation · HOLD |
| 121 | PASSION | The new commandment — John 13:31–35 | None | No direct match · HOLD |
| 122 | PASSION | The prayer for unity — John 17:1–26 | None | No direct match · HOLD |
| 123 | PASSION | Gethsemane — Matthew 26:36–46 | #113 The agony in the garden (exact citation) | Exact citation · HOLD |
| 124 | PASSION | The arrest in the garden — Matthew 26:47–56 | #114 The arrest of Jesus (exact citation) | Exact citation · HOLD |
| 125 | PASSION | Peter’s three denials — Luke 22:54–62 | None | No direct match · HOLD |
| 126 | PASSION | Christ before Pilate — John 18:28–40 | None | No direct match · HOLD |
| 127 | PASSION | The scourging and thorns — John 19:1–16 | #116 The scourging and crowning with thorns (exact citation) | Exact citation · HOLD |
| 128 | PASSION | The way to Calvary — Luke 23:26–32 | None | No direct match · HOLD |
| 129 | PASSION | The Crucifixion — John 19:17–30 | #117 The Crucifixion and death of Jesus (exact citation) | Exact citation · HOLD |
| 130 | PASSION | The burial of Christ — John 19:38–42 | #119 The burial of Jesus (exact citation) | Exact citation · HOLD |
| 131 | RISEN | The Resurrection — John 20:1–18 | #120 The empty tomb and Mary Magdalene (exact citation) | Exact citation · HOLD |
| 132 | RISEN | Peter and John at the tomb — John 20:3–10 | #120 The empty tomb and Mary Magdalene (passage overlap) | Overlap · HOLD |
| 133 | RISEN | The risen Lord meets the Apostles — John 20:19–23 | #123 The risen Lord appears to the Apostles (passage overlap) | Overlap · HOLD |
| 134 | RISEN | Thomas believes — John 20:24–29 | #123 The risen Lord appears to the Apostles (passage overlap) | Overlap · HOLD |
| 135 | RISEN | The road to Emmaus — Luke 24:13–35 | #122 The risen Jesus walks to Emmaus (exact citation) | Exact citation · HOLD |
| 136 | RISEN | Peter, feed my sheep — John 21:15–19 | None | No direct match · HOLD |
| 137 | RISEN | The Ascension — Acts 1:6–12 | #125 The Ascension of Our Lord (exact citation) | Exact citation · HOLD |
| 138 | APOSTLES | The road to Damascus — Acts 9:1–9 | #130 Conversion of Saul (passage overlap) | Overlap · HOLD |
| 139 | APOSTLES | Ananias baptises Saul — Acts 9:10–19 | #130 Conversion of Saul (passage overlap) | Overlap · HOLD |
| 140 | APOSTLES | Saul escapes Damascus — Acts 9:20–25 | #130 Conversion of Saul (passage overlap) | Overlap · HOLD |
| 141 | APOSTLES | Saul visits Jerusalem — Acts 9:26–30 | #131 Saul returns to Tarsus (passage overlap) | Overlap · HOLD |
| 142 | APOSTLES | The disciples at Antioch — Acts 11:19–26 | #134 The disciples at Antioch (exact citation) | Exact citation · HOLD |
| 143 | FIRST_MISSION | Barnabas and Saul are sent — Acts 13:1–3 | None | No direct match · HOLD |
| 144 | FIRST_MISSION | Departure from Seleucia — Acts 13:4 | None | No direct match · HOLD |
| 145 | FIRST_MISSION | Salamis on Cyprus — Acts 13:5 | None | No direct match · HOLD |
| 146 | FIRST_MISSION | The mission to Cyprus — Acts 13:4–12 | None | No direct match · HOLD |
| 147 | FIRST_MISSION | Perga in Pamphylia — Acts 13:13–14 | None | No direct match · HOLD |
| 148 | FIRST_MISSION | Antioch in Pisidia — Acts 13:14–43 | None | No direct match · HOLD |
| 149 | FIRST_MISSION | Iconium resists the preaching — Acts 14:1–7 | None | No direct match · HOLD |
| 150 | FIRST_MISSION | Lystra and the miracle — Acts 14:8–20 | #135 Paul heals a man in Lystra (passage overlap) | Overlap · HOLD |
| 151 | FIRST_MISSION | Derbe and the return — Acts 14:20–28 | None | No direct match · HOLD |
| 152 | FIRST_MISSION | Council in Jerusalem — Acts 15:1–29 | #136 Council of Jerusalem (exact citation) | Exact citation · HOLD |
| 153 | SECOND_MISSION | A second departure — Acts 15:36–41 | None | No direct match · HOLD |
| 154 | SECOND_MISSION | Timothy joins the mission — Acts 16:1–5 | None | No direct match · HOLD |
| 155 | SECOND_MISSION | The Macedonian vision — Acts 16:6–10 | None | No direct match · HOLD |
| 156 | SECOND_MISSION | The crossing to Macedonia — Acts 16:8–12 | #137 Paul meets Lydia in Philippi (passage overlap) | Overlap · HOLD |
| 157 | SECOND_MISSION | Landfall at Neapolis — Acts 16:11–12 | #137 Paul meets Lydia in Philippi (passage overlap) | Overlap · HOLD |
| 158 | SECOND_MISSION | Lydia and the church at Philippi — Acts 16:11–15 | #137 Paul meets Lydia in Philippi (exact citation) | Exact citation · HOLD |
| 159 | SECOND_MISSION | Paul and Silas in prison — Acts 16:16–40 | None | No direct match · HOLD |
| 160 | SECOND_MISSION | Paul at Thessalonica — Acts 17:1–9 | #138 Paul in Thessalonica (exact citation) | Exact citation · HOLD |
| 161 | SECOND_MISSION | The believers at Berea — Acts 17:10–15 | None | No direct match · HOLD |
| 162 | SECOND_MISSION | The Areopagus at Athens — Acts 17:16–34 | #139 Paul speaks in Athens (exact citation) | Exact citation · HOLD |
| 163 | SECOND_MISSION | Corinth and the tentmakers — Acts 18:1–18 | #140 St Paul in Corinth (exact citation) | Exact citation · HOLD |
| 164 | THIRD_MISSION | The mission returns to Antioch — Acts 18:18–23 | #140 St Paul in Corinth (passage overlap) | Overlap · HOLD |
| 165 | THIRD_MISSION | Paul revisits Galatia and Phrygia — Acts 18:23 | None | No direct match · HOLD |
| 166 | THIRD_MISSION | The mission in Ephesus — Acts 19:1–20 | #141 Paul teaches in Ephesus (exact citation) | Exact citation · HOLD |
| 167 | THIRD_MISSION | Riot of the silversmiths — Acts 19:23–41 | None | No direct match · HOLD |
| 168 | THIRD_MISSION | Eutychus restored at Troas — Acts 20:7–12 | #142 Paul in Troas (exact citation) | Exact citation · HOLD |
| 169 | THIRD_MISSION | Farewell at Miletus — Acts 20:17–38 | #143 Paul's farewell at Miletus (exact citation) | Exact citation · HOLD |
| 170 | TO_ROME | Paul arrives at Tyre — Acts 21:1–6 | None | No direct match · HOLD |
| 171 | TO_ROME | Prophecy at Caesarea — Acts 21:8–14 | None | No direct match · HOLD |
| 172 | TO_ROME | Paul arrested at the Temple — Acts 21:27–36 | None | No direct match · HOLD |
| 173 | TO_ROME | Before Felix at Caesarea — Acts 24:1–27 | None | No direct match · HOLD |
| 174 | TO_ROME | Paul appeals to Caesar — Acts 25:1–12 | None | No direct match · HOLD |
| 175 | TO_ROME | The long voyage from Caesarea — Acts 27:1–12 | None | No direct match · HOLD |
| 176 | TO_ROME | A storm on the sea — Acts 27:13–44 | #144 Shipwreck on Malta (exact citation) | Exact citation · HOLD |
| 177 | TO_ROME | Shipwreck and hospitality on Malta — Acts 28:1–10 | None | No direct match · HOLD |
| 178 | TO_ROME | Syracuse and Puteoli — Acts 28:11–14 | None | No direct match · HOLD |
| 179 | TO_ROME | The Italian mainland — Acts 28:13–14 | None | No direct match · HOLD |
| 180 | TO_ROME | Paul arrives in Rome — Acts 28:16–31 | #145 St Paul in Rome (exact citation) | Exact citation · HOLD |

## Order of resolution

1. Settle and index-migrate the John 2 case without changing the count of 151 milestones; reconcile every dependent index, Scripture jump, map selection and test.
2. Review the mixed #68 crosswalk, all 29 overlapping scenes and 87 additional scenes in chapter batches with original Catholic Scripture witnesses.
3. Compare the 64 unique exact-citation links semantically, recording whether they depict the same narrative or merely cite its wider passage.
4. Resolve identified order reversals with source-aware qualifications. Preserve disputed historical dates and places as non-geocoded when appropriate.
5. Incorporate only independently rights-cleared, source-provenanced sacred artwork references; leave Mass-Bible research and the canonical art catalogue under their existing pipeline owners.
6. Re-run the source contract, 320/390px Scripture roundtrip and screenshot review before manual publication approval.

**Maintenance:** This markdown is a dated editorial snapshot, not an authoritative second JSON registry. Regenerate or supersede it after source IDs/order change. Never mark source claims certified merely because CI passes.

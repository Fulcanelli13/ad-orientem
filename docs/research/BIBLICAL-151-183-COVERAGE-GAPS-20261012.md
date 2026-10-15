# Biblical Theatre — canonical 151-event coverage against 183 scene studies

**12 October 2026 · A13 derived source audit.** This is a *diagnostic research register*, not another biblical chronology, genealogy, map or authoritative artwork catalogue. The 151 canonical events remain owned by `src/find/bible-atlas.js`, the 183 scenes by `data/explore/biblical-cinematic-studies-review.v1.json`; all artist/provenance decisions remain with Sacred Art PR #887.

## Coverage at a glance

- **151** selected canonical event records and **183** Theatre scenes (181 originals + Holy Innocents and Pentecost).
- **67** canonical events have at least one scene citing the identical passage. This represents *verse citation identity only*, not confirmed depiction of the same historical moment or a secure Gospel harmony.
- **17** canonical events have a passage-overlap candidate but no exact-citation scene; all overlaps require further editorial judgment.
- **67** canonical events have no candidate at all in the 183-scene studies. The scene studies were drawn from four donor journeys (Abraham, Moses, Christ, Paul), not intended as full coverage of every biblical book.
- **99** research candidate links exist across the 183 studies; multiple scene relations can point to one canonical passage. Exactly **66** scene-to-chronology jumps satisfy the app's uniquely exact and reversible link rule. No gap should be filled by creating imaginary routes or assigning unapproved paintings.

## Coverage by biblical era

| Era | Canonical events | Identical cited passage | Overlap only | No scene |
|---|---:|---:|---:|---:|
| ORIGINS | 6 | 0 | 0 | 6 |
| PATRIARCHS | 12 | 2 | 4 | 6 |
| EXODUS | 14 | 11 | 1 | 2 |
| ISRAEL | 13 | 0 | 0 | 13 |
| EXILE | 21 | 0 | 0 | 21 |
| INFANCY | 12 | 10 | 2 | 0 |
| PUBLIC | 31 | 23 | 3 | 5 |
| PASSION | 11 | 6 | 3 | 2 |
| RESURRECTION | 6 | 3 | 1 | 2 |
| APOSTLES | 20 | 12 | 3 | 5 |
| REVELATION | 5 | 0 | 0 | 5 |
| **Total** | **151** | **67** | **17** | **67** |

## Research batch priorities

**P0 — foundational biblical narrative absent from Theatre.** All six ORIGINS events lack a candidate (Creation, Fall, Cain and Abel, Flood, covenant with Noah, Babel), even though the canonical chronology already includes them. Keep creation/theological language faithful to Genesis; the source does not permit event GPS.

**P1 — monarchy, prophets and exile.** All 13 ISRAEL and all 21 EXILE canonical event records lack scene candidates. Major episode prospects include David and Goliath, Elijah at Carmel, David's kingship, Solomon's Temple dedication, the fall of Jerusalem, Daniel, Esther, Judith, the Maccabees and the Return. This is the largest factual thematic omission, not evidence that those events are absent from the canonical chronology. Check each book's original Catholic verse numbering and avoid externally invented dates.

**P2 — remaining Genesis, Exodus and New Testament gaps.** Patriarchs contain six unrepresented events (Jacob's dream, Joseph's sale and governance, Israel in Egypt, etc.). Sinai's covenant and Jericho are missing from the Theatre despite appearing in the chronology. Five selected PUBLIC events, two PASSION, two RESURRECTION and five APOSTLES events also have no scene candidate. Prioritize by the user's liturgical/devotional aims, Scripture relevance and genuinely distinct narrative moment.

**P3 — Revelation scenes.** All five REVELATION chronology selections lack source-equivalent Theatre scenes. These are prophetic/visionary texts and must not be portrayed as a documentary journey, GPS location or established literal historical sequence.

**Already recovered in A12.** Holy Innocents: `biblical:scene:christ:181` / Matthew 2:16–18 / canonical #73; Pentecost: `biblical:scene:paul:182` / Acts 2:1–41 / canonical #126. Both are source-citation exact, still artwork-unapproved, and append-only without modifying the first 181 original scene records.

## All 151 source events — scene coverage ledger

Numbered event indices are **display positions**, not safe external keys. Use the listed `eventKey` from the source model. A scene ID below is a stable `biblical:scene:*` identity. No art images or new Scripture data are defined by this report.

| # | Era | Biblical event and source | Coverage | Scene IDs (source candidates) |
|---:|---|---|---|---|
| 0 | ORIGINS | Creation — Genesis 1:1–31 | NO CINEMATIC SCENE | — |
| 1 | ORIGINS | The Fall — Genesis 3:1–24 | NO CINEMATIC SCENE | — |
| 2 | ORIGINS | Cain and Abel — Genesis 4:1–16 | NO CINEMATIC SCENE | — |
| 3 | ORIGINS | The Flood — Genesis 7:1–24 | NO CINEMATIC SCENE | — |
| 4 | ORIGINS | God's covenant with Noah — Genesis 9:8–17 | NO CINEMATIC SCENE | — |
| 5 | ORIGINS | The tower of Babel — Genesis 11:1–9 | NO CINEMATIC SCENE | — |
| 6 | PATRIARCHS | Abraham's family leaves Ur — Genesis 11:31 | NO CINEMATIC SCENE | — |
| 7 | PATRIARCHS | The call of Abram — Genesis 12:1–9 | OVERLAP REVIEW ONLY | `biblical:scene:abraham:000` (overlap); `biblical:scene:abraham:001` (overlap); `biblical:scene:abraham:002` (overlap); `biblical:scene:abraham:003` (overlap); `biblical:scene:abraham:004` (overlap); `biblical:scene:abraham:005` (overlap) |
| 8 | PATRIARCHS | Melchizedek blesses Abram — Genesis 14:18–20 | OVERLAP REVIEW ONLY | `biblical:scene:abraham:012` (overlap) |
| 9 | PATRIARCHS | God's covenant with Abram — Genesis 15:1–21 | OVERLAP REVIEW ONLY | `biblical:scene:abraham:013` (overlap); `biblical:scene:abraham:014` (overlap) |
| 10 | PATRIARCHS | Abraham at Mamre — Genesis 18:1–8 | OVERLAP REVIEW ONLY | `biblical:scene:abraham:017` (overlap) |
| 11 | PATRIARCHS | Birth of Isaac — Genesis 21:1–7 | EXACT CITATION ONLY | `biblical:scene:abraham:021` (same passage) |
| 12 | PATRIARCHS | The sacrifice of Isaac — Genesis 22:1–19 | EXACT CITATION ONLY | `biblical:scene:abraham:023` (same passage) |
| 13 | PATRIARCHS | Jacob's dream — Genesis 28:10–22 | NO CINEMATIC SCENE | — |
| 14 | PATRIARCHS | Jacob wrestles — Genesis 32:24–32 | NO CINEMATIC SCENE | — |
| 15 | PATRIARCHS | Joseph is sold — Genesis 37:18–36 | NO CINEMATIC SCENE | — |
| 16 | PATRIARCHS | Joseph governs Egypt — Genesis 41:37–45 | NO CINEMATIC SCENE | — |
| 17 | PATRIARCHS | Israel settles in Egypt — Genesis 46:1–7 | NO CINEMATIC SCENE | — |
| 18 | EXODUS | The birth of Moses — Exodus 2:1–10 | EXACT CITATION ONLY | `biblical:scene:moses:026` (same passage) |
| 19 | EXODUS | The burning bush — Exodus 3:1–15 | EXACT CITATION ONLY | `biblical:scene:moses:028` (same passage) |
| 20 | EXODUS | The plagues begin — Exodus 7:14–25 | EXACT CITATION ONLY | `biblical:scene:moses:032` (same passage) |
| 21 | EXODUS | The first Passover — Exodus 12:1–28 | EXACT CITATION ONLY | `biblical:scene:moses:033` (same passage) |
| 22 | EXODUS | The departure from Egypt — Exodus 12:31–42 | EXACT CITATION ONLY | `biblical:scene:moses:034` (same passage) |
| 23 | EXODUS | The crossing of the sea — Exodus 14:15–31 | EXACT CITATION ONLY | `biblical:scene:moses:036` (same passage) |
| 24 | EXODUS | Manna in the wilderness — Exodus 16:1–36 | EXACT CITATION ONLY | `biblical:scene:moses:039` (same passage) |
| 25 | EXODUS | The Covenant at Sinai — Exodus 19:16–20 | NO CINEMATIC SCENE | — |
| 26 | EXODUS | The Ten Commandments — Exodus 20:1–17 | EXACT CITATION ONLY | `biblical:scene:moses:044` (same passage) |
| 27 | EXODUS | The golden calf — Exodus 32:1–35 | EXACT CITATION ONLY | `biblical:scene:moses:046` (same passage) |
| 28 | EXODUS | The Tabernacle — Exodus 40:1–38 | EXACT CITATION ONLY | `biblical:scene:moses:048` (same passage) |
| 29 | EXODUS | Moses sees the Promised Land — Deuteronomy 34:1–6 | OVERLAP REVIEW ONLY | `biblical:scene:moses:055` (overlap) |
| 30 | EXODUS | Crossing the Jordan near Jericho — Joshua 3:1–17 | EXACT CITATION ONLY | `biblical:scene:moses:056` (same passage) |
| 31 | EXODUS | The fall of Jericho — Joshua 6:1–27 | NO CINEMATIC SCENE | — |
| 32 | ISRAEL | Hannah and Samuel — 1Samuel 1:9–20 | NO CINEMATIC SCENE | — |
| 33 | ISRAEL | Samuel anoints Saul — 1Samuel 10:1–8 | NO CINEMATIC SCENE | — |
| 34 | ISRAEL | David and Goliath — 1Samuel 17:1–54 | NO CINEMATIC SCENE | — |
| 35 | ISRAEL | David becomes king at Hebron — 2Samuel 2:1–4 | NO CINEMATIC SCENE | — |
| 36 | ISRAEL | David takes Jerusalem — 2Samuel 5:6–10 | NO CINEMATIC SCENE | — |
| 37 | ISRAEL | Solomon dedicates the Temple — 1Kings 8:1–66 | NO CINEMATIC SCENE | — |
| 38 | ISRAEL | Division of the kingdom — 1Kings 12:1–24 | NO CINEMATIC SCENE | — |
| 39 | ISRAEL | Elijah on Mount Carmel — 1Kings 18:19–39 | NO CINEMATIC SCENE | — |
| 40 | ISRAEL | Elijah at Horeb — 1Kings 19:1–18 | NO CINEMATIC SCENE | — |
| 41 | ISRAEL | Isaiah's call — Isaiah 6:1–13 | NO CINEMATIC SCENE | — |
| 42 | ISRAEL | Fall of Samaria — 2Kings 17:1–18 | NO CINEMATIC SCENE | — |
| 43 | ISRAEL | Josiah renews the covenant — 2Kings 23:1–25 | NO CINEMATIC SCENE | — |
| 44 | ISRAEL | Jeremiah warns Jerusalem — Jeremiah 7:1–15 | NO CINEMATIC SCENE | — |
| 45 | EXILE | Tobit in Nineveh — Tobit 1:10 | NO CINEMATIC SCENE | — |
| 46 | EXILE | Daniel in Babylon — Daniel 1:1–21 | NO CINEMATIC SCENE | — |
| 47 | EXILE | Ezekiel's vision by the Chebar — Ezekiel 1:1–28 | NO CINEMATIC SCENE | — |
| 48 | EXILE | Destruction of Jerusalem — 2Kings 25:1–12 | NO CINEMATIC SCENE | — |
| 49 | EXILE | The exile in Babylon — 2Kings 25:8–12 | NO CINEMATIC SCENE | — |
| 50 | EXILE | Judith saves her people — Judith 13:1–20 | NO CINEMATIC SCENE | — |
| 51 | EXILE | Esther intercedes — Esther 4:1–17 | NO CINEMATIC SCENE | — |
| 52 | EXILE | Return from exile — Ezra 1:1–11 | NO CINEMATIC SCENE | — |
| 53 | EXILE | The Temple is rebuilt — Ezra 6:13–22 | NO CINEMATIC SCENE | — |
| 54 | EXILE | Ezra proclaims the Law — Nehemiah 8:1–12 | NO CINEMATIC SCENE | — |
| 55 | EXILE | The prayer of Esther — Esther 14:1–19 | NO CINEMATIC SCENE | — |
| 56 | EXILE | Baruch's promise to Jerusalem — Baruch 5:1–9 | NO CINEMATIC SCENE | — |
| 57 | EXILE | The song of the three youths — Daniel 3:24–90 | NO CINEMATIC SCENE | — |
| 58 | EXILE | Susanna is vindicated — Daniel 13:1–64 | NO CINEMATIC SCENE | — |
| 59 | EXILE | Daniel exposes the idol of Bel — Daniel 14:1–22 | NO CINEMATIC SCENE | — |
| 60 | EXILE | Daniel and the dragon — Daniel 14:23–42 | NO CINEMATIC SCENE | — |
| 61 | EXILE | The praise of divine Wisdom — Sirach 24:1–22 | NO CINEMATIC SCENE | — |
| 62 | EXILE | The seven brothers' witness — 2Maccabees 7:1–42 | NO CINEMATIC SCENE | — |
| 63 | EXILE | The Maccabean resistance — 1Maccabees 2:1–5 | NO CINEMATIC SCENE | — |
| 64 | EXILE | The Temple is rededicated — 1Maccabees 4:36–59 | NO CINEMATIC SCENE | — |
| 65 | EXILE | The gift of Wisdom — Wisdom 7:7–14 | NO CINEMATIC SCENE | — |
| 66 | INFANCY | The Annunciation — Luke 1:26–38 | EXACT CITATION ONLY | `biblical:scene:christ:057` (same passage) |
| 67 | INFANCY | An angel speaks to Joseph in a dream — Matthew 1:18–25 | EXACT CITATION ONLY | `biblical:scene:christ:058` (same passage) |
| 68 | INFANCY | The Visitation — Luke 1:39–56 | EXACT CITATION ONLY | `biblical:scene:christ:059` (same passage) |
| 69 | INFANCY | Birth of Jesus and adoration of the shepherds — Luke 2:1–20 | EXACT CITATION ONLY | `biblical:scene:christ:061` (same passage) |
| 70 | INFANCY | Jesus is circumcised and named — Luke 2:21–21 | OVERLAP REVIEW ONLY | `biblical:scene:christ:062` (overlap) |
| 71 | INFANCY | The Presentation of Jesus — Luke 2:22–38 | EXACT CITATION ONLY | `biblical:scene:christ:064` (same passage) |
| 72 | INFANCY | The visit of the Magi — Matthew 2:1–12 | EXACT CITATION ONLY | `biblical:scene:christ:063` (same passage) |
| 73 | INFANCY | Herod orders the massacre of the Innocents — Matthew 2:16–18 | EXACT CITATION ONLY | `biblical:scene:christ:181` (same passage) |
| 74 | INFANCY | The flight into Egypt — Matthew 2:13–15 | EXACT CITATION ONLY | `biblical:scene:christ:065` (same passage) |
| 75 | INFANCY | Return from Egypt — Matthew 2:19–23 | EXACT CITATION ONLY | `biblical:scene:christ:066` (same passage) |
| 76 | INFANCY | The twelve-year-old Jesus in the Temple — Luke 2:41–52 | EXACT CITATION ONLY | `biblical:scene:christ:067` (overlap); `biblical:scene:christ:068` (same passage) |
| 77 | INFANCY | Jesus grows in wisdom and grace — Luke 2:51–52 | OVERLAP REVIEW ONLY | `biblical:scene:christ:067` (overlap); `biblical:scene:christ:068` (overlap) |
| 78 | PUBLIC | Baptism of Jesus — Matthew 3:13–17 | EXACT CITATION ONLY | `biblical:scene:christ:069` (same passage) |
| 79 | PUBLIC | The first disciples follow Jesus — John 1:35–51 | EXACT CITATION ONLY | `biblical:scene:christ:072` (same passage) |
| 80 | PUBLIC | The forty-day fast and temptations — Matthew 4:1–11 | EXACT CITATION ONLY | `biblical:scene:christ:070` (same passage) |
| 81 | PUBLIC | The wedding at Cana — John 2:1–11 | EXACT CITATION ONLY | `biblical:scene:christ:073` (same passage) |
| 82 | PUBLIC | Jesus purifies the Temple — John 2:13–22 | EXACT CITATION ONLY | `biblical:scene:christ:074` (same passage) |
| 83 | PUBLIC | The call of the fishermen — Mark 1:16–20 | NO CINEMATIC SCENE | — |
| 84 | PUBLIC | Teaching and exorcism in the synagogue — Mark 1:21–28 | EXACT CITATION ONLY | `biblical:scene:christ:078` (same passage) |
| 85 | PUBLIC | Healing of Peter's mother-in-law — Mark 1:29–31 | EXACT CITATION ONLY | `biblical:scene:christ:079` (same passage) |
| 86 | PUBLIC | The healing of a paralytic — Mark 2:1–12 | EXACT CITATION ONLY | `biblical:scene:christ:080` (same passage) |
| 87 | PUBLIC | The Sermon on the Mount — Matthew 5:13–48 | NO CINEMATIC SCENE | — |
| 88 | PUBLIC | Jesus calms the storm — Mark 4:35–41 | EXACT CITATION ONLY | `biblical:scene:christ:090` (same passage) |
| 89 | PUBLIC | Jesus walks upon the water — Matthew 14:22–33 | EXACT CITATION ONLY | `biblical:scene:christ:095` (same passage) |
| 90 | PUBLIC | The choosing of the Twelve Apostles — Luke 6:12–16 | EXACT CITATION ONLY | `biblical:scene:christ:084` (same passage) |
| 91 | PUBLIC | Jesus and the Samaritan woman — John 4:4–26 | EXACT CITATION ONLY | `biblical:scene:christ:076` (same passage) |
| 92 | PUBLIC | Samaritans welcome Jesus for two days — John 4:39–42 | NO CINEMATIC SCENE | — |
| 93 | PUBLIC | Healing of a royal official's son at a distance — John 4:46–54 | EXACT CITATION ONLY | `biblical:scene:christ:077` (same passage) |
| 94 | PUBLIC | Healing at the Pool of Bethesda — John 5:1–15 | NO CINEMATIC SCENE | — |
| 95 | PUBLIC | The raising of the widow's son — Luke 7:11–17 | EXACT CITATION ONLY | `biblical:scene:christ:087` (same passage) |
| 96 | PUBLIC | The feeding of the multitude — John 6:1–15 | EXACT CITATION ONLY | `biblical:scene:christ:096` (same passage) |
| 97 | PUBLIC | The discourse on the Bread of Life — John 6:24–59 | OVERLAP REVIEW ONLY | `biblical:scene:christ:097` (overlap) |
| 98 | PUBLIC | Healing of a blind man at Bethsaida — Mark 8:22–26 | EXACT CITATION ONLY | `biblical:scene:christ:101` (same passage) |
| 99 | PUBLIC | Peter's confession of faith — Matthew 16:13–20 | EXACT CITATION ONLY | `biblical:scene:christ:102` (same passage) |
| 100 | PUBLIC | Jesus first foretells his Passion — Matthew 16:21–28 | EXACT CITATION ONLY | `biblical:scene:christ:103` (same passage) |
| 101 | PUBLIC | The Transfiguration — Matthew 17:1–8 | OVERLAP REVIEW ONLY | `biblical:scene:christ:104` (overlap) |
| 102 | PUBLIC | Jesus descends from the mount of the Transfiguration — Matthew 17:9–13 | OVERLAP REVIEW ONLY | `biblical:scene:christ:104` (overlap) |
| 103 | PUBLIC | Healing of the man born blind at Siloam — John 9:1–12 | EXACT CITATION ONLY | `biblical:scene:christ:106` (same passage) |
| 104 | PUBLIC | The raising of Lazarus — John 11:1–44 | EXACT CITATION ONLY | `biblical:scene:christ:113` (same passage) |
| 105 | PUBLIC | Jesus visits Martha and Mary — Luke 10:38–42 | EXACT CITATION ONLY | `biblical:scene:christ:109` (same passage) |
| 106 | PUBLIC | The anointing at Bethany — John 12:1–8 | EXACT CITATION ONLY | `biblical:scene:christ:114` (same passage) |
| 107 | PUBLIC | The healing of the blind man — Luke 18:35–43 | NO CINEMATIC SCENE | — |
| 108 | PUBLIC | The conversion of Zacchaeus — Luke 19:1–10 | EXACT CITATION ONLY | `biblical:scene:christ:112` (same passage) |
| 109 | PASSION | Preparation for entry into Jerusalem — Matthew 21:1–7 | OVERLAP REVIEW ONLY | `biblical:scene:christ:115` (overlap) |
| 110 | PASSION | The triumphal entry into Jerusalem — Luke 19:37–44 | OVERLAP REVIEW ONLY | `biblical:scene:christ:116` (overlap) |
| 111 | PASSION | The Last Supper and institution of the Eucharist — Luke 22:7–20 | OVERLAP REVIEW ONLY | `biblical:scene:christ:119` (overlap) |
| 112 | PASSION | The washing of the feet — John 13:1–17 | EXACT CITATION ONLY | `biblical:scene:christ:120` (same passage) |
| 113 | PASSION | The agony in the garden — Matthew 26:36–46 | EXACT CITATION ONLY | `biblical:scene:christ:123` (same passage) |
| 114 | PASSION | The arrest of Jesus — Matthew 26:47–56 | EXACT CITATION ONLY | `biblical:scene:christ:124` (same passage) |
| 115 | PASSION | Jesus before Pilate — Matthew 27:11–26 | NO CINEMATIC SCENE | — |
| 116 | PASSION | The scourging and crowning with thorns — John 19:1–16 | EXACT CITATION ONLY | `biblical:scene:christ:127` (same passage) |
| 117 | PASSION | The Crucifixion and death of Jesus — John 19:17–30 | EXACT CITATION ONLY | `biblical:scene:christ:129` (same passage) |
| 118 | PASSION | Jesus and the good thief — Luke 23:39–43 | NO CINEMATIC SCENE | — |
| 119 | PASSION | The burial of Jesus — John 19:38–42 | EXACT CITATION ONLY | `biblical:scene:christ:130` (same passage) |
| 120 | RESURRECTION | The empty tomb and Mary Magdalene — John 20:1–18 | EXACT CITATION ONLY | `biblical:scene:christ:131` (same passage); `biblical:scene:christ:132` (overlap) |
| 121 | RESURRECTION | The angel announces the Resurrection — Matthew 28:1–10 | NO CINEMATIC SCENE | — |
| 122 | RESURRECTION | The risen Jesus walks to Emmaus — Luke 24:13–35 | EXACT CITATION ONLY | `biblical:scene:christ:135` (same passage) |
| 123 | RESURRECTION | The risen Lord appears to the Apostles — John 20:19–29 | OVERLAP REVIEW ONLY | `biblical:scene:christ:133` (overlap); `biblical:scene:christ:134` (overlap) |
| 124 | RESURRECTION | The risen Jesus appears by the lake — John 21:1–14 | NO CINEMATIC SCENE | — |
| 125 | RESURRECTION | The Ascension of Our Lord — Acts 1:6–12 | EXACT CITATION ONLY | `biblical:scene:christ:137` (same passage) |
| 126 | APOSTLES | Pentecost — Acts 2:1–41 | EXACT CITATION ONLY | `biblical:scene:paul:182` (same passage) |
| 127 | APOSTLES | Peter heals the lame man — Acts 3:1–10 | NO CINEMATIC SCENE | — |
| 128 | APOSTLES | Martyrdom of Stephen — Acts 7:54–60 | NO CINEMATIC SCENE | — |
| 129 | APOSTLES | Philip baptizes the Ethiopian — Acts 8:26–40 | NO CINEMATIC SCENE | — |
| 130 | APOSTLES | Conversion of Saul — Acts 9:1–22 | OVERLAP REVIEW ONLY | `biblical:scene:paul:138` (overlap); `biblical:scene:paul:139` (overlap); `biblical:scene:paul:140` (overlap) |
| 131 | APOSTLES | Saul returns to Tarsus — Acts 9:29–30 | OVERLAP REVIEW ONLY | `biblical:scene:paul:141` (overlap) |
| 132 | APOSTLES | Peter raises Tabitha at Joppa — Acts 9:36–43 | NO CINEMATIC SCENE | — |
| 133 | APOSTLES | Conversion of Cornelius — Acts 10:1–48 | NO CINEMATIC SCENE | — |
| 134 | APOSTLES | The disciples at Antioch — Acts 11:19–26 | EXACT CITATION ONLY | `biblical:scene:paul:142` (same passage) |
| 135 | APOSTLES | Paul heals a man in Lystra — Acts 14:8–18 | OVERLAP REVIEW ONLY | `biblical:scene:paul:150` (overlap) |
| 136 | APOSTLES | Council of Jerusalem — Acts 15:1–29 | EXACT CITATION ONLY | `biblical:scene:paul:152` (same passage) |
| 137 | APOSTLES | Paul meets Lydia in Philippi — Acts 16:11–15 | EXACT CITATION ONLY | `biblical:scene:paul:156` (overlap); `biblical:scene:paul:157` (overlap); `biblical:scene:paul:158` (same passage) |
| 138 | APOSTLES | Paul in Thessalonica — Acts 17:1–9 | EXACT CITATION ONLY | `biblical:scene:paul:160` (same passage) |
| 139 | APOSTLES | Paul speaks in Athens — Acts 17:16–34 | EXACT CITATION ONLY | `biblical:scene:paul:162` (same passage) |
| 140 | APOSTLES | St Paul in Corinth — Acts 18:1–18 | EXACT CITATION ONLY | `biblical:scene:paul:163` (same passage); `biblical:scene:paul:164` (overlap) |
| 141 | APOSTLES | Paul teaches in Ephesus — Acts 19:1–20 | EXACT CITATION ONLY | `biblical:scene:paul:166` (same passage) |
| 142 | APOSTLES | Paul in Troas — Acts 20:7–12 | EXACT CITATION ONLY | `biblical:scene:paul:168` (same passage) |
| 143 | APOSTLES | Paul's farewell at Miletus — Acts 20:17–38 | EXACT CITATION ONLY | `biblical:scene:paul:169` (same passage) |
| 144 | APOSTLES | Paul's shipwreck at sea — Acts 27:13–44 | EXACT CITATION ONLY | `biblical:scene:paul:176` (same passage) |
| 145 | APOSTLES | St Paul in Rome — Acts 28:16–31 | EXACT CITATION ONLY | `biblical:scene:paul:180` (same passage) |
| 146 | REVELATION | St John's vision — Revelation 1:9–20 | NO CINEMATIC SCENE | — |
| 147 | REVELATION | Letters to the four churches — Revelation 2:1–29 | NO CINEMATIC SCENE | — |
| 148 | REVELATION | Letters to the three churches — Revelation 3:1–22 | NO CINEMATIC SCENE | — |
| 149 | REVELATION | The heavenly liturgy — Revelation 4:1–11 | NO CINEMATIC SCENE | — |
| 150 | REVELATION | The new Jerusalem — Revelation 21:1–27 | NO CINEMATIC SCENE | — |

## Publication and integration boundaries

- These classes measure **source citation presence**, not historical completeness, confidence of geolocation, artistic correctness, verified narration, or permission to publish an original image.
- The 151-event chronology, 183-scene reader, Matthew/Luke/Genesis genealogy, Mass–Bible formation and Sacred Art workstreams keep separate canonical owners; future additions must preserve all existing stable IDs and review source order before placement.
- Build new scenes as append-only source records under a reviewed chapter and reuse existing canonical event keys. Where no historical geography is proven, retain the Scripture region label only; neither the event nor its painted figures become geocertified.
- The complete A12 [183-scene editorial queue](https://github.com/Fulcanelli13/ad-orientem/blob/feature/biblical-atlas-current-main-convergence-20261012/docs/research/BIBLICAL-ATLAS-151-181-EDITORIAL-QUEUE-20261012.md) and [44 Sacred Art subject joins](https://github.com/Fulcanelli13/ad-orientem/blob/feature/biblical-atlas-current-main-convergence-20261012/docs/research/BIBLICAL-THEATRE-SACRED-ART-44-SUBJECT-RECONCILIATION-20261012.md) contain the detailed exceptions. The 181-original scene SHA lock remains a CI gate.

# Biblical Atlas — 151↔183 editorial adjudication queue (181 originals preserved)

**12 October 2026 — A12/A13 source-first editorial register.** The 151-event canonical chronology is unchanged; 181 original scenes are retained exactly and two further Scripture-anchored scenes are appended. This register is research-only, not a publication approval.

## Corrected editorial boundaries

- 151 selected events and 11 eras are preserved. The 183 scene studies (181 original records + 2 append-only episodes) remain in the original 14 chapters; neither corpus is a complete chronology of all 73 books.
- The selected PUBLIC timeline now applies six explicitly named within-Gospel textual precedence rules; it does not force one historical timetable across Matthew, Mark, Luke and John. Source citations: [Matthew 5](https://www.newadvent.org/bible/mat005.htm), [Matthew 14](https://www.newadvent.org/bible/mat014.htm), [Mark 1](https://www.newadvent.org/bible/mar001.htm), [John 4](https://www.newadvent.org/bible/joh004.htm), [John 5](https://www.newadvent.org/bible/joh005.htm), [John 6](https://www.newadvent.org/bible/joh006.htm), [John 9](https://www.newadvent.org/bible/joh009.htm), [John 11](https://www.newadvent.org/bible/joh011.htm).
- Scene #74 corresponds to the unique John 2:13–22 event at canonical #82 in **John's narrative placement** after Cana. Its identity with the cleansing in the Synoptic Passion accounts remains an editorial hold. [John 2](https://bible.usccb.org/bible/john/2) warns that Gospel order is sometimes thematic, not strictly chronological.
- The A6 moves affect 21 displayed stop positions; 16 of 97 cinematic *candidate* links moved to new indices by their stable event keys. Every candidate and historical hold must still match the current event key **and** Scripture reference, not just the screen position.
- Separate Genesis, Matthew/Luke genealogy, Apostolic Dispersion, 26-part Mass–Bible formation, and sacred-art provenance/rights owners remain unchanged.

## Original Catholic Scripture witness check

- **151 canonical reference passages across 28 books** were checked against imported Crampon-1923 (French) and Douay–Rheims Challoner (English) verse-slot arrays. **148 have full requested verse-slot presence in both witnesses.**
- **Three remaining edition/transcription exceptions:** Mark 4:35–41 (both imported witnesses lack standalone verse 41; the externally attested printed Crampon includes it); Acts 7:54–60 (Challoner witness ends chapter 7 at verse 59, while imported Crampon has verse 60); Exodus 40:1–38 (Challoner has 36 verses and Crampon 38). These do not authorize inventing Bible text or rewriting the Scripture reader.
- Source witness files explicitly say **UNCOLLATED_SOURCE_WITNESS**. Verse presence is not printed-edition collation, translation parity, or runtime-pack certification. See tests/biblical-atlas-scripture-witness-coverage.mjs for exhaustive regression checks.

## Five source-critical holds

1. John 2 Johannine versus Synoptic cleansing: correct John-narrative position implemented; source-identity question held.
2. John 20:1–18: scene text corrected to the empty tomb and Mary Magdalene; artwork depicting the Resurrection instant remains held.
3. Luke 2:41–52 exact episode versus Luke 2:51–52 Nazareth transition: separate milestones remain, mixed automatic link blocked.
4. Matthew's Magi and Luke's Presentation: cross-Gospel inferred order is not a dated statement in either passage.
5. Other public-ministry harmonization: the six within-Gospel corrections are complete but cross-Gospel historical synchronization needs a named, sourced policy.

## Chapter work batches

| Group | Chapter | Exact citation | Overlap | No direct match |
|---|---|---:|---:|---:|
| ABRAHAM | The Patriarchs | 2 | 10 | 13 |
| MOSES | Bondage and deliverance | 6 | 0 | 7 |
| MOSES | The wilderness | 1 | 0 | 4 |
| MOSES | The covenant | 3 | 0 | 3 |
| MOSES | Toward the promised land | 1 | 1 | 6 |
| CHRIST | The Incarnation | 10 | 2 | 1 |
| CHRIST | Public Ministry | 23 | 2 | 21 |
| CHRIST | The Passion | 6 | 3 | 7 |
| CHRIST | The Resurrection | 3 | 3 | 1 |
| PAUL | The Apostolic Age | 2 | 4 | 0 |
| PAUL | First missionary journey | 1 | 1 | 8 |
| PAUL | Second missionary journey | 4 | 2 | 5 |
| PAUL | Third missionary journey | 3 | 1 | 2 |
| PAUL | The journey to Rome | 2 | 0 | 9 |
| **Total** | **14 chapters** | **67** | **29** | **87** |

## All 183 scenes — A12 stable-key validated candidate register

Indices are zero-based data positions, not chapter reading order or external identities. The original indices 0–180 are unchanged. New indices 181 (Holy Innocents) and 182 (Pentecost) are appended to the array and positioned correctly in their chapters. Scripture references and stable event keys—not numbered scene positions—are canonical identities. An exact citation still does *not* prove a particular artistic depiction. All semantic dispositions remain on HOLD.

| Scene | Chapter | Scene and Scripture | Current canonical candidate(s) | Editorial action |
|---:|---|---|---|---|
| 0 | PATRIARCHS | The call of Abram — Genesis 12:1–5 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 1 | PATRIARCHS | The covenant begins with a departure — Genesis 12:4–5 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 2 | PATRIARCHS | The journey toward Canaan — Genesis 12:5–6 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 3 | PATRIARCHS | The altar at Shechem — Genesis 12:6–7 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 4 | PATRIARCHS | The promise of the land — Genesis 12:7 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 5 | PATRIARCHS | Between Bethel and Ai — Genesis 12:8 | #7 The call of Abram (overlapping passage; biblical:passage:genesis-12-1-9) | Review overlap · HOLD |
| 6 | PATRIARCHS | A famine, a journey into Egypt — Genesis 12:10–20 | None | Additional episode · HOLD |
| 7 | PATRIARCHS | The return to Canaan — Genesis 13:1–4 | None | Additional episode · HOLD |
| 8 | PATRIARCHS | Abram and Lot separate — Genesis 13:5–13 | None | Additional episode · HOLD |
| 9 | PATRIARCHS | Lot moves toward Sodom — Genesis 13:10–13 | None | Additional episode · HOLD |
| 10 | PATRIARCHS | The oaks of Mamre — Genesis 13:14–18 | None | Additional episode · HOLD |
| 11 | PATRIARCHS | Abram rescues Lot — Genesis 14:13–16 | None | Additional episode · HOLD |
| 12 | PATRIARCHS | Melchizedek, king of Salem — Genesis 14:17–20 | #8 Melchizedek blesses Abram (overlapping passage; biblical:passage:genesis-14-18-20) | Review overlap · HOLD |
| 13 | PATRIARCHS | The promise beneath the stars — Genesis 15:1–6 | #9 God's covenant with Abram (overlapping passage; biblical:passage:genesis-15-1-21) | Review overlap · HOLD |
| 14 | PATRIARCHS | The covenant is sealed — Genesis 15:7–21 | #9 God's covenant with Abram (overlapping passage; biblical:passage:genesis-15-1-21) | Review overlap · HOLD |
| 15 | PATRIARCHS | The birth of Ishmael — Genesis 16:1–16 | None | Additional episode · HOLD |
| 16 | PATRIARCHS | Abraham receives a new name — Genesis 17:1–14 | None | Additional episode · HOLD |
| 17 | PATRIARCHS | Three visitors at Mamre — Genesis 18:1–15 | #10 Abraham at Mamre (overlapping passage; biblical:passage:genesis-18-1-8) | Review overlap · HOLD |
| 18 | PATRIARCHS | Abraham intercedes for Sodom — Genesis 18:16–33 | None | Additional episode · HOLD |
| 19 | PATRIARCHS | The destruction of Sodom — Genesis 19:1–29 | None | Additional episode · HOLD |
| 20 | PATRIARCHS | Abraham and Abimelech — Genesis 20:1–18 | None | Additional episode · HOLD |
| 21 | PATRIARCHS | The birth of Isaac — Genesis 21:1–7 | #11 Birth of Isaac (same citation; biblical:passage:genesis-21-1-7) | Check scene identity · HOLD |
| 22 | PATRIARCHS | A well at Beersheba — Genesis 21:22–34 | None | Additional episode · HOLD |
| 23 | PATRIARCHS | The sacrifice of Isaac — Genesis 22:1–19 | #12 The sacrifice of Isaac (same citation; biblical:passage:genesis-22-1-19) | Check scene identity · HOLD |
| 24 | PATRIARCHS | The burial at Machpelah — Genesis 23:1–20 | None | Additional episode · HOLD |
| 25 | DELIVERANCE | Israel under oppression — Exodus 1:8–22 | None | Additional episode · HOLD |
| 26 | DELIVERANCE | Moses is born and hidden — Exodus 2:1–10 | #18 The birth of Moses (same citation; biblical:passage:exodus-2-1-10) | Check scene identity · HOLD |
| 27 | DELIVERANCE | Moses flees to Midian — Exodus 2:11–22 | None | Additional episode · HOLD |
| 28 | DELIVERANCE | The burning bush — Exodus 3:1–15 | #19 The burning bush (same citation; biblical:passage:exodus-3-1-15) | Check scene identity · HOLD |
| 29 | DELIVERANCE | Moses returns to Egypt — Exodus 4:18–31 | None | Additional episode · HOLD |
| 30 | DELIVERANCE | Let my people go — Exodus 5:1–23 | None | Additional episode · HOLD |
| 31 | DELIVERANCE | The staff and the magicians — Exodus 7:8–13 | None | Additional episode · HOLD |
| 32 | DELIVERANCE | The first plague: the Nile turns to blood — Exodus 7:14–25 | #20 The plagues begin (same citation; biblical:passage:exodus-7-14-25) | Check scene identity · HOLD |
| 33 | DELIVERANCE | The first Passover — Exodus 12:1–28 | #21 The first Passover (same citation; biblical:passage:exodus-12-1-28) | Check scene identity · HOLD |
| 34 | DELIVERANCE | The departure from Rameses — Exodus 12:31–42 | #22 The departure from Egypt (same citation; biblical:passage:exodus-12-31-42) | Check scene identity · HOLD |
| 35 | DELIVERANCE | The pillar of cloud and fire — Exodus 13:17–22 | None | Additional episode · HOLD |
| 36 | DELIVERANCE | The crossing of the sea — Exodus 14:15–31 | #23 The crossing of the sea (same citation; biblical:passage:exodus-14-15-31) | Check scene identity · HOLD |
| 37 | DELIVERANCE | The song of Moses and Miriam — Exodus 15:1–21 | None | Additional episode · HOLD |
| 38 | WILDERNESS | Bitter water made sweet — Exodus 15:22–27 | None | Additional episode · HOLD |
| 39 | WILDERNESS | Bread from heaven — Exodus 16:1–36 | #24 Manna in the wilderness (same citation; biblical:passage:exodus-16-1-36) | Check scene identity · HOLD |
| 40 | WILDERNESS | Water from the rock — Exodus 17:1–7 | None | Additional episode · HOLD |
| 41 | WILDERNESS | Battle against Amalek — Exodus 17:8–16 | None | Additional episode · HOLD |
| 42 | WILDERNESS | Jethro advises Moses — Exodus 18:13–27 | None | Additional episode · HOLD |
| 43 | COVENANT | At the mountain of God — Exodus 19:1–15 | None | Additional episode · HOLD |
| 44 | COVENANT | The Ten Commandments — Exodus 20:1–17 | #26 The Ten Commandments (same citation; biblical:passage:exodus-20-1-17) | Check scene identity · HOLD |
| 45 | COVENANT | The covenant is ratified — Exodus 24:1–18 | None | Additional episode · HOLD |
| 46 | COVENANT | The golden calf — Exodus 32:1–35 | #27 The golden calf (same citation; biblical:passage:exodus-32-1-35) | Check scene identity · HOLD |
| 47 | COVENANT | The second tablets — Exodus 34:1–35 | None | Additional episode · HOLD |
| 48 | COVENANT | The Tabernacle is erected — Exodus 40:1–38 | #28 The Tabernacle (same citation; biblical:passage:exodus-40-1-38) | Check scene identity · HOLD |
| 49 | WANDERINGS | Departure from Sinai — Numbers 10:11–36 | None | Additional episode · HOLD |
| 50 | WANDERINGS | The twelve spies — Numbers 13:1–33 | None | Additional episode · HOLD |
| 51 | WANDERINGS | Forty years in the wilderness — Numbers 14:1–38 | None | Additional episode · HOLD |
| 52 | WANDERINGS | The bronze serpent — Numbers 21:4–9 | None | Additional episode · HOLD |
| 53 | WANDERINGS | Balaam and Balak — Numbers 22:1–24:25 | None | Additional episode · HOLD |
| 54 | WANDERINGS | Moses addresses Israel — Deuteronomy 6:4–25 | None | Additional episode · HOLD |
| 55 | WANDERINGS | The view from Mount Nebo — Deuteronomy 34:1–8 | #29 Moses sees the Promised Land (overlapping passage; biblical:passage:deuteronomy-34-1-6) | Review overlap · HOLD |
| 56 | WANDERINGS | Joshua leads the crossing — Joshua 3:1–17 | #30 Crossing the Jordan near Jericho (same citation; biblical:passage:joshua-3-1-17) | Check scene identity · HOLD |
| 57 | INCARNATION | The Annunciation — Luke 1:26–38 | #66 The Annunciation (same citation; biblical:event:nazareth-e1) | Check scene identity · HOLD |
| 58 | INCARNATION | Joseph receives the angelic message — Matthew 1:18–25 | #67 An angel speaks to Joseph in a dream (same citation; biblical:event:nazareth-additional-001) | Check scene identity · HOLD |
| 59 | INCARNATION | The Visitation — Luke 1:39–56 | #68 The Visitation (same citation; biblical:event:ein-karem-e1) | Check scene identity · HOLD |
| 60 | INCARNATION | Birth of John the Baptist — Luke 1:57–80 | None | Additional episode · HOLD |
| 61 | INCARNATION | The Nativity — Luke 2:1–20 | #69 Birth of Jesus and adoration of the shepherds (same citation; biblical:event:bethlehem-e1) | Check scene identity · HOLD |
| 62 | INCARNATION | The circumcision and naming — Luke 2:21 | #70 Jesus is circumcised and named (overlapping passage; biblical:event:bethlehem-additional-002) | Review overlap · HOLD |
| 63 | INCARNATION | The Magi come to adore — Matthew 2:1–12 | #72 The visit of the Magi (same citation; biblical:event:bethlehem-e2) | Check scene identity · HOLD |
| 64 | INCARNATION | The Presentation — Luke 2:22–38 | #71 The Presentation of Jesus (same citation; biblical:event:jerusalem-temple-e1) | Check scene identity · HOLD |
| 65 | INCARNATION | Flight into Egypt — Matthew 2:13–15 | #74 The flight into Egypt (same citation; biblical:event:egypt-e1) | Check scene identity · HOLD |
| 66 | INCARNATION | Return to Nazareth — Matthew 2:19–23 | #75 Return from Egypt (same citation; biblical:event:egypt-e2) | Check scene identity · HOLD |
| 67 | INCARNATION | The hidden years — Luke 2:39–52 | #76 The twelve-year-old Jesus in the Temple (overlapping passage; biblical:event:jerusalem-temple-e2); #77 Jesus grows in wisdom and grace (overlapping passage; biblical:event:nazareth-additional-006) | Review overlap · HOLD |
| 68 | INCARNATION | Jesus found in the Temple — Luke 2:41–52 | #76 The twelve-year-old Jesus in the Temple (same citation; biblical:event:jerusalem-temple-e2); #77 Jesus grows in wisdom and grace (overlapping passage; biblical:event:nazareth-additional-006) | Check scene identity · HOLD |
| 69 | MINISTRY | The Baptism in the Jordan — Matthew 3:13–17 | #78 Baptism of Jesus (same citation; biblical:event:jordan-baptism-e1) | Check scene identity · HOLD |
| 70 | MINISTRY | The forty-day fast — Matthew 4:1–11 | #80 The forty-day fast and temptations (same citation; biblical:event:judean-wilderness-e1) | Check scene identity · HOLD |
| 71 | MINISTRY | Behold the Lamb of God — John 1:29–34 | None | Additional episode · HOLD |
| 72 | MINISTRY | The first disciples follow Jesus — John 1:35–51 | #79 The first disciples follow Jesus (same citation; biblical:event:jordan-east-bank-additional-008) | Check scene identity · HOLD |
| 73 | MINISTRY | The wedding at Cana — John 2:1–11 | #81 The wedding at Cana (same citation; biblical:event:cana-e1) | Check scene identity · HOLD |
| 74 | MINISTRY | Jesus cleanses the Temple (John 2) — John 2:13–22 | #82 Jesus purifies the Temple (same citation; biblical:event:jerusalem-temple-e3) | Check scene identity · HOLD |
| 75 | MINISTRY | Nicodemus comes by night — John 3:1–21 | None | Additional episode · HOLD |
| 76 | MINISTRY | The Samaritan woman — John 4:4–26 | #91 Jesus and the Samaritan woman (same citation; biblical:event:sychar-e1) | Check scene identity · HOLD |
| 77 | MINISTRY | The royal official’s son is healed — John 4:46–54 | #93 Healing of a royal official's son at a distance (same citation; biblical:event:cana-miracle-02) | Check scene identity · HOLD |
| 78 | MINISTRY | Capernaum, the synagogue — Mark 1:21–28 | #84 Teaching and exorcism in the synagogue (same citation; biblical:event:capernaum-e1) | Check scene identity · HOLD |
| 79 | MINISTRY | Peter’s mother-in-law healed — Mark 1:29–31 | #85 Healing of Peter's mother-in-law (same citation; biblical:event:capernaum-miracle-04) | Check scene identity · HOLD |
| 80 | MINISTRY | A paralytic lowered through the roof — Mark 2:1–12 | #86 The healing of a paralytic (same citation; biblical:event:capernaum-e2) | Check scene identity · HOLD |
| 81 | MINISTRY | The centurion’s faith — Matthew 8:5–13 | None | Additional episode · HOLD |
| 82 | MINISTRY | Levi leaves the tax booth — Mark 2:13–17 | None | Additional episode · HOLD |
| 83 | MINISTRY | The call of the fishermen — Luke 5:1–11 | None | Additional episode · HOLD |
| 84 | MINISTRY | The Twelve are chosen — Luke 6:12–16 | #90 The choosing of the Twelve Apostles (same citation; biblical:event:beatitudes-additional-021) | Check scene identity · HOLD |
| 85 | MINISTRY | The Sermon on the Mount — Matthew 5:1–12 | None | Additional episode · HOLD |
| 86 | MINISTRY | The Lord’s Prayer — Matthew 6:5–15 | None | Additional episode · HOLD |
| 87 | MINISTRY | The widow’s son at Nain — Luke 7:11–17 | #95 The raising of the widow's son (same citation; biblical:event:nain-e1) | Check scene identity · HOLD |
| 88 | MINISTRY | The sinful woman anoints his feet — Luke 7:36–50 | None | Additional episode · HOLD |
| 89 | MINISTRY | The parable of the sower — Mark 4:1–20 | None | Additional episode · HOLD |
| 90 | MINISTRY | The storm is calmed — Mark 4:35–41 | #88 Jesus calms the storm (same citation; biblical:event:galilee-sea-e2) | Check scene identity · HOLD |
| 91 | MINISTRY | The Gerasene demoniac — Mark 5:1–20 | None | Additional episode · HOLD |
| 92 | MINISTRY | Jairus’s daughter raised — Mark 5:21–43 | None | Additional episode · HOLD |
| 93 | MINISTRY | The Twelve sent to preach — Matthew 10:1–15 | None | Additional episode · HOLD |
| 94 | MINISTRY | The beheading of John the Baptist — Mark 6:17–29 | None | Additional episode · HOLD |
| 95 | MINISTRY | Jesus walks upon the water — Matthew 14:22–33 | #89 Jesus walks upon the water (same citation; biblical:event:galilee-sea-e3) | Check scene identity · HOLD |
| 96 | MINISTRY | The multiplication of loaves — John 6:1–15 | #96 The feeding of the multitude (same citation; biblical:event:tabgha-e1) | Check scene identity · HOLD |
| 97 | MINISTRY | The Bread of Life discourse — John 6:22–59 | #97 The discourse on the Bread of Life (overlapping passage; biblical:event:capernaum-e3) | Review overlap · HOLD |
| 98 | MINISTRY | The Syrophoenician woman — Mark 7:24–30 | None | Additional episode · HOLD |
| 99 | MINISTRY | The deaf man healed — Mark 7:31–37 | None | Additional episode · HOLD |
| 100 | MINISTRY | The feeding of four thousand — Matthew 15:32–39 | None | Additional episode · HOLD |
| 101 | MINISTRY | The blind man of Bethsaida — Mark 8:22–26 | #98 Healing of a blind man at Bethsaida (same citation; biblical:event:bethsaida-miracle-25) | Check scene identity · HOLD |
| 102 | MINISTRY | Peter’s confession — Matthew 16:13–20 | #99 Peter's confession of faith (same citation; biblical:event:caesarea-philippi-e1) | Check scene identity · HOLD |
| 103 | MINISTRY | First prediction of the Passion — Matthew 16:21–28 | #100 Jesus first foretells his Passion (same citation; biblical:event:caesarea-philippi-additional-044) | Check scene identity · HOLD |
| 104 | MINISTRY | The Transfiguration — Matthew 17:1–9 | #101 The Transfiguration (overlapping passage; biblical:event:transfiguration-e1); #102 Jesus descends from the mount of the Transfiguration (overlapping passage; biblical:event:transfiguration-additional-045) | Review overlap · HOLD |
| 105 | MINISTRY | The possessed boy healed — Mark 9:14–29 | None | Additional episode · HOLD |
| 106 | MINISTRY | The man born blind at Siloam — John 9:1–12 | #103 Healing of the man born blind at Siloam (same citation; biblical:event:siloam-miracle-26) | Check scene identity · HOLD |
| 107 | MINISTRY | The Good Shepherd — John 10:1–21 | None | Additional episode · HOLD |
| 108 | MINISTRY | The Good Samaritan — Luke 10:25–37 | None | Additional episode · HOLD |
| 109 | MINISTRY | Martha and Mary — Luke 10:38–42 | #105 Jesus visits Martha and Mary (same citation; biblical:event:bethany-additional-057) | Check scene identity · HOLD |
| 110 | MINISTRY | The prodigal son — Luke 15:11–32 | None | Additional episode · HOLD |
| 111 | MINISTRY | Ten lepers cleansed — Luke 17:11–19 | None | Additional episode · HOLD |
| 112 | MINISTRY | Zacchaeus of Jericho — Luke 19:1–10 | #108 The conversion of Zacchaeus (same citation; biblical:event:jericho-e2) | Check scene identity · HOLD |
| 113 | MINISTRY | Lazarus is raised — John 11:1–44 | #104 The raising of Lazarus (same citation; biblical:event:bethany-e1) | Check scene identity · HOLD |
| 114 | MINISTRY | The anointing at Bethany — John 12:1–8 | #106 The anointing at Bethany (same citation; biblical:event:bethany-e2) | Check scene identity · HOLD |
| 115 | PASSION | The entry into Jerusalem — Matthew 21:1–11 | #109 Preparation for entry into Jerusalem (overlapping passage; biblical:event:bethphage-e1) | Review overlap · HOLD |
| 116 | PASSION | Jesus weeps over Jerusalem — Luke 19:41–44 | #110 The triumphal entry into Jerusalem (overlapping passage; biblical:event:olives-e1) | Review overlap · HOLD |
| 117 | PASSION | The Temple cleansed — Mark 11:15–19 | None | Additional episode · HOLD |
| 118 | PASSION | The discourse on the end — Mark 13:1–37 | None | Additional episode · HOLD |
| 119 | PASSION | The Last Supper — Luke 22:14–20 | #111 The Last Supper and institution of the Eucharist (overlapping passage; biblical:event:cenacle-e1) | Review overlap · HOLD |
| 120 | PASSION | Washing of the feet — John 13:1–17 | #112 The washing of the feet (same citation; biblical:event:cenacle-e2) | Check scene identity · HOLD |
| 121 | PASSION | The new commandment — John 13:31–35 | None | Additional episode · HOLD |
| 122 | PASSION | The prayer for unity — John 17:1–26 | None | Additional episode · HOLD |
| 123 | PASSION | Gethsemane — Matthew 26:36–46 | #113 The agony in the garden (same citation; biblical:event:gethsemane-e1) | Check scene identity · HOLD |
| 124 | PASSION | The arrest in the garden — Matthew 26:47–56 | #114 The arrest of Jesus (same citation; biblical:event:gethsemane-e2) | Check scene identity · HOLD |
| 125 | PASSION | Peter’s three denials — Luke 22:54–62 | None | Additional episode · HOLD |
| 126 | PASSION | Christ before Pilate — John 18:28–40 | None | Additional episode · HOLD |
| 127 | PASSION | The scourging and thorns — John 19:1–16 | #116 The scourging and crowning with thorns (same citation; biblical:event:jerusalem-trial-e3) | Check scene identity · HOLD |
| 128 | PASSION | The way to Calvary — Luke 23:26–32 | None | Additional episode · HOLD |
| 129 | PASSION | The Crucifixion — John 19:17–30 | #117 The Crucifixion and death of Jesus (same citation; biblical:event:golgotha-e2) | Check scene identity · HOLD |
| 130 | PASSION | The burial of Christ — John 19:38–42 | #119 The burial of Jesus (same citation; biblical:event:christ-tomb-e1) | Check scene identity · HOLD |
| 131 | RISEN | The empty tomb and Mary Magdalene — John 20:1–18 | #120 The empty tomb and Mary Magdalene (same citation; biblical:event:christ-tomb-e2) | Check scene identity · HOLD |
| 132 | RISEN | Peter and John at the tomb — John 20:3–10 | #120 The empty tomb and Mary Magdalene (overlapping passage; biblical:event:christ-tomb-e2) | Review overlap · HOLD |
| 133 | RISEN | The risen Lord meets the Apostles — John 20:19–23 | #123 The risen Lord appears to the Apostles (overlapping passage; biblical:event:cenacle-e3) | Review overlap · HOLD |
| 134 | RISEN | Thomas believes — John 20:24–29 | #123 The risen Lord appears to the Apostles (overlapping passage; biblical:event:cenacle-e3) | Review overlap · HOLD |
| 135 | RISEN | The road to Emmaus — Luke 24:13–35 | #122 The risen Jesus walks to Emmaus (same citation; biblical:event:emmaus-e1) | Check scene identity · HOLD |
| 136 | RISEN | Peter, feed my sheep — John 21:15–19 | None | Additional episode · HOLD |
| 137 | RISEN | The Ascension — Acts 1:6–12 | #125 The Ascension of Our Lord (same citation; biblical:event:olives-e3) | Check scene identity · HOLD |
| 138 | APOSTLES | The road to Damascus — Acts 9:1–9 | #130 Conversion of Saul (overlapping passage; biblical:passage:acts-9-1-22) | Review overlap · HOLD |
| 139 | APOSTLES | Ananias baptises Saul — Acts 9:10–19 | #130 Conversion of Saul (overlapping passage; biblical:passage:acts-9-1-22) | Review overlap · HOLD |
| 140 | APOSTLES | Saul escapes Damascus — Acts 9:20–25 | #130 Conversion of Saul (overlapping passage; biblical:passage:acts-9-1-22) | Review overlap · HOLD |
| 141 | APOSTLES | Saul visits Jerusalem — Acts 9:26–30 | #131 Saul returns to Tarsus (overlapping passage; biblical:passage:acts-9-29-30) | Review overlap · HOLD |
| 142 | APOSTLES | The disciples at Antioch — Acts 11:19–26 | #134 The disciples at Antioch (same citation; biblical:passage:acts-11-19-26) | Check scene identity · HOLD |
| 143 | FIRST_MISSION | Barnabas and Saul are sent — Acts 13:1–3 | None | Additional episode · HOLD |
| 144 | FIRST_MISSION | Departure from Seleucia — Acts 13:4 | None | Additional episode · HOLD |
| 145 | FIRST_MISSION | Salamis on Cyprus — Acts 13:5 | None | Additional episode · HOLD |
| 146 | FIRST_MISSION | The mission to Cyprus — Acts 13:4–12 | None | Additional episode · HOLD |
| 147 | FIRST_MISSION | Perga in Pamphylia — Acts 13:13–14 | None | Additional episode · HOLD |
| 148 | FIRST_MISSION | Antioch in Pisidia — Acts 13:14–43 | None | Additional episode · HOLD |
| 149 | FIRST_MISSION | Iconium resists the preaching — Acts 14:1–7 | None | Additional episode · HOLD |
| 150 | FIRST_MISSION | Lystra and the miracle — Acts 14:8–20 | #135 Paul heals a man in Lystra (overlapping passage; biblical:passage:acts-14-8-18) | Review overlap · HOLD |
| 151 | FIRST_MISSION | Derbe and the return — Acts 14:20–28 | None | Additional episode · HOLD |
| 152 | FIRST_MISSION | Council in Jerusalem — Acts 15:1–29 | #136 Council of Jerusalem (same citation; biblical:passage:acts-15-1-29) | Check scene identity · HOLD |
| 153 | SECOND_MISSION | A second departure — Acts 15:36–41 | None | Additional episode · HOLD |
| 154 | SECOND_MISSION | Timothy joins the mission — Acts 16:1–5 | None | Additional episode · HOLD |
| 155 | SECOND_MISSION | The Macedonian vision — Acts 16:6–10 | None | Additional episode · HOLD |
| 156 | SECOND_MISSION | The crossing to Macedonia — Acts 16:8–12 | #137 Paul meets Lydia in Philippi (overlapping passage; biblical:passage:acts-16-11-15) | Review overlap · HOLD |
| 157 | SECOND_MISSION | Landfall at Neapolis — Acts 16:11–12 | #137 Paul meets Lydia in Philippi (overlapping passage; biblical:passage:acts-16-11-15) | Review overlap · HOLD |
| 158 | SECOND_MISSION | Lydia and the church at Philippi — Acts 16:11–15 | #137 Paul meets Lydia in Philippi (same citation; biblical:passage:acts-16-11-15) | Check scene identity · HOLD |
| 159 | SECOND_MISSION | Paul and Silas in prison — Acts 16:16–40 | None | Additional episode · HOLD |
| 160 | SECOND_MISSION | Paul at Thessalonica — Acts 17:1–9 | #138 Paul in Thessalonica (same citation; biblical:passage:acts-17-1-9) | Check scene identity · HOLD |
| 161 | SECOND_MISSION | The believers at Berea — Acts 17:10–15 | None | Additional episode · HOLD |
| 162 | SECOND_MISSION | The Areopagus at Athens — Acts 17:16–34 | #139 Paul speaks in Athens (same citation; biblical:passage:acts-17-16-34) | Check scene identity · HOLD |
| 163 | SECOND_MISSION | Corinth and the tentmakers — Acts 18:1–18 | #140 St Paul in Corinth (same citation; biblical:passage:acts-18-1-18) | Check scene identity · HOLD |
| 164 | THIRD_MISSION | The mission returns to Antioch — Acts 18:18–23 | #140 St Paul in Corinth (overlapping passage; biblical:passage:acts-18-1-18) | Review overlap · HOLD |
| 165 | THIRD_MISSION | Paul revisits Galatia and Phrygia — Acts 18:23 | None | Additional episode · HOLD |
| 166 | THIRD_MISSION | The mission in Ephesus — Acts 19:1–20 | #141 Paul teaches in Ephesus (same citation; biblical:passage:acts-19-1-20) | Check scene identity · HOLD |
| 167 | THIRD_MISSION | Riot of the silversmiths — Acts 19:23–41 | None | Additional episode · HOLD |
| 168 | THIRD_MISSION | Eutychus restored at Troas — Acts 20:7–12 | #142 Paul in Troas (same citation; biblical:passage:acts-20-7-12) | Check scene identity · HOLD |
| 169 | THIRD_MISSION | Farewell at Miletus — Acts 20:17–38 | #143 Paul's farewell at Miletus (same citation; biblical:passage:acts-20-17-38) | Check scene identity · HOLD |
| 170 | TO_ROME | Paul arrives at Tyre — Acts 21:1–6 | None | Additional episode · HOLD |
| 171 | TO_ROME | Prophecy at Caesarea — Acts 21:8–14 | None | Additional episode · HOLD |
| 172 | TO_ROME | Paul arrested at the Temple — Acts 21:27–36 | None | Additional episode · HOLD |
| 173 | TO_ROME | Before Felix at Caesarea — Acts 24:1–27 | None | Additional episode · HOLD |
| 174 | TO_ROME | Paul appeals to Caesar — Acts 25:1–12 | None | Additional episode · HOLD |
| 175 | TO_ROME | The long voyage from Caesarea — Acts 27:1–12 | None | Additional episode · HOLD |
| 176 | TO_ROME | A storm on the sea — Acts 27:13–44 | #144 Paul's shipwreck at sea (same citation; biblical:passage:acts-27-13-44) | Check scene identity · HOLD |
| 177 | TO_ROME | Shipwreck and hospitality on Malta — Acts 28:1–10 | None | Additional episode · HOLD |
| 178 | TO_ROME | Syracuse and Puteoli — Acts 28:11–14 | None | Additional episode · HOLD |
| 179 | TO_ROME | The Italian mainland — Acts 28:13–14 | None | Additional episode · HOLD |
| 180 | TO_ROME | Paul arrives in Rome — Acts 28:16–31 | #145 St Paul in Rome (same citation; biblical:passage:acts-28-16-31) | Check scene identity · HOLD |
| 181 | INCARNATION | The massacre of the Holy Innocents — Matthew 2:16–18 | #73 Herod orders the massacre of the Innocents (same citation; biblical:event:bethlehem-additional-003) | Newly added source episode · depiction review HOLD |
| 182 | APOSTLES | Pentecost: the Holy Spirit descends — Acts 2:1–41 | #126 Pentecost (same citation; biblical:passage:acts-2-1-41) | Newly added source episode · depiction review HOLD |

## Source-only extension: two recovered major episodes

- **Holy Innocents**: source Matthew 2:16–18. One exact canonical source is #73 (`biblical:event:bethlehem-additional-003`). The Theatre record is appended as `biblical:scene:christ:181` but appears between the Flight and the Return within chapter Incarnation, respecting Matthew 2's textual sequence. No historical date or specific building is claimed; the original 181 scene records remain untouched.
- **Pentecost**: source Acts 2:1–41. One exact canonical source is #126 (`biblical:passage:acts-2-1-41`). The Theatre record is appended as `biblical:scene:paul:182`, opening the *Apostolic Age* chapter, explicitly before Saul's conversion. Its `PAUL` chapter family label is an inherited UI grouping, not a theological attribution to St Paul.
- **Citation classes**: 67 exact reference cases, 29 passage overlaps, 87 unmatched cases. Of the 67 exact cases, one Luke 2 source remains doubly associated and withheld from automatic navigation; **66 source-only reversible jumps** are valid against the unchanged 151-event timeline.
- **Original record immutability**: `tests/biblical-cinematic-original-181-lock.mjs` checks the Git blob SHA-1 of the complete 181 pre-extension scene objects and original 14 chapter memberships against the original branch state. A deliberate source correction must be reviewed and its lock updated explicitly.
- **Sacred art**: Calendar Pentecost, Rosary Third Glorious Mystery, and Holy Innocents are now *research* scene associations. They are not cleared to render an artwork; original painting quality, iconographic content, licence and crop remain separately gated by Sacred Art #887.

## Two further source-congruence corrections

- Scene #32 now presents **the first Egyptian plague — water turned to blood**, not the complete series of ten, since its reference is Exodus 7:14–25. The cinematic source note remains explicitly limited.
- Acts 27:13–44 is now titled **Paul's shipwreck at sea**, avoiding the implication that the same chapter gives Malta by name. That identification occurs in Acts 28:1; neither chapter proves an exact point of wreckage or a GPS location. [Acts 28](https://bible.usccb.org/bible/acts/28).

## Acceptance still outstanding

1. Execute the A6 source suite including all 28-book imported witness assertions, full app/Explore tests and real 390px phone Scripture roundtrip from scene #74 to the canonically keyed #82.
2. Recheck actual current main with the latest 65-card Mass/Prayer package scripts; this PR may not overwrite parallel work.
3. Complete original Crampon/Challoner printed-volume collation, specifically the three known verse-division exceptions and the remaining Catholic-edition decisions; do not silently repair witnesses with guessed text.
4. Review publication geography (city/region/traditional markers), each asserted genealogy, historic itineraries, cross-Gospel harmonies and high-quality rights-cleared painting identities before release.
5. Update this register if any stable source identity or citation changes; the JSON/JS sources are authoritative.

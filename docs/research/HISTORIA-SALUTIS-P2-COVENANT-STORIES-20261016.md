# Historia Salutis — P2 Covenant sources, ancestry, individual character-story scope (16 October 2026)

**Status:** research-only continuation of draft PR #1310. No new Atlas events, genealogy publication, app reader, borrowed artwork or narrative prose.

## Delivered
- `data/explore/historia-salutis-p2-covenant-character-source-queue.v1.json`
- `tests/historia-salutis-p2-covenant-story-sources.mjs`, run in the existing Historia Salutis CI workflow

| Metric | Result | Meaning |
| --- | ---: | --- |
| Existing canonical Atlas events preserved | 151 | No mutation to event identity |
| Previously classified donor story groups | 39 | Kept separately; not renamed or replaced |
| **Additional character story topics** | **44** | Editorial source-based topics, **not authored or approved story text** |
| Source ranges checked | 73 distinct | Full verse-number presence in imported Crampon 1923 witnesses |
| Source books checked | 26 | Includes Catholic deuterocanonical books |
| Proposed covenant source roles | 12 | Passage-linked support for the 7 covenant/promise stages |
| New story topics with at least one exact Atlas event reference | 33 | Source-identical reference only |
| Topics without any exact existing Atlas event | 11 | Source-only; no invented event or map pin |

## Four confirmed Ruth–David source relationships

**Ruth 4:13–22**, cross-checked with **Matthew 1:5–6** and **1 Chronicles 2:11–15**:

1. Boaz → Obed, father/child;
2. Ruth → Obed, mother/child;
3. Obed → Jesse, father/child;
4. Jesse → David, father/child.

This confirms a **scripturally attested local ancestral chain**, not a harmonised account of every biblical generation or an acceptance of the 3,231-person external research tree. The historical witnesses are still imported **uncollated** texts; publication review is separate from direct relationship identification.

## Covenants: source-text relationships, not all identical claims

- **Genesis 3** — promise after the Fall; a promise is not re-labelled a separate named covenant with Adam.
- **Genesis 9** — Noahic covenant.
- **Genesis 17** — Abrahamic covenant, supplemental to existing Genesis 15.
- **Exodus 24:3–8** — Sinai covenant ratification, an essential part not represented by the current Exodus 19:16–20 Atlas event.
- **2 Samuel 7:12–16** — David's royal-house promise; **Psalm 89:4–5 (Crampon numbering)** explicitly calls the relationship a covenant; **Luke 1:32–33** connects the kingship of Jesus to the house of David.
- **Jeremiah 31:31–34** — promised New Covenant; **Hebrews 8:8–12** quotes the prophecy; **Ezekiel 36:25–27** is related new-heart/Spirit prophecy, **not** the same covenant-institution passage.
- **Luke 22:7–20** — institution in the Last Supper setting; **Revelation 21** — consummation, not a further covenant institution.

Catholic doctrinal control: [CCC 54–64](https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/article_1/ii_the_stages_of_revelation.html) and [CCC 68–73](https://www.vatican.va/content/catechism/en/part_one/section_one/chapter_two/article_1/in_brief.html).

## Character stories to add beyond the four existing cinematic donor groups

**Origins/patriarchs:** Adam/Eve, Cain/Abel, Noah, Isaac, Jacob, patriarch Joseph.

**From settlement through kingship:** Ruth/Boaz, Rahab, Deborah, Gideon, Samson, Hannah, Samuel, Saul, David (anointing; Jonathan; kingship and royal promise; Nathan), Solomon.

**Prophets and deuterocanonical books:** Elijah, Elisha, Isaiah, Jeremiah, Ezekiel, Tobit/Tobias, Judith, Esther, Daniel, Susanna, Three Youths, Seven Maccabean Brothers and their Mother, Judas Maccabeus.

**Gospels/Acts:** Our Lady, St Joseph, St John the Baptist, Peter, John in Gospel contexts, Martha, Mary Magdalene, Thomas, Stephen, Philip the Evangelist, Cornelius and Lydia.

**Exclusions and caveats:** Existing donor story groups remain authoritative for their *research scenes only*; source-based candidates are not all distinct complete biographies. Proposed `primaryArcId` is a practical editorial context, not proof of exact historical date. The 151 Atlas references are a curated narrative selection, not a 73-book Bible.

## Edition and theological holds

1. **Psalter:** Crampon's Psalm 89 is not automatically Douay/Vulgate Psalm 89; a proper numbering crosswalk is mandatory.
2. **Luke 3:36 / Genesis 11:** Luke's additional Cainan must not be silently deleted through source harmonisation.
3. **Matthew vs Luke:** Matthew's line through Solomon and Luke's through Nathan differ after David. Maintain independent witnesses; St Joseph remains legal/putative father of Jesus, never biological father.
4. **People:** Philip the Evangelist is not Philip the Apostle; no automatic assumption regarding John of Revelation and John son of Zebedee.
5. **Catholic Bible:** Tobit, Judith, Maccabees, and the additions to Esther/Daniel remain eligible; imported Greek/Douay/Crampon boundaries may vary and require edition-safe matching.
6. **Original prose:** no AI-authored Bible history; only verified Catholic historical-author text or exact native Scripture, with translations certified separately.
7. **Art/geography:** neither scriptural source association nor shared name authorises geographic pin, biography, typology, artwork licence, or biblical incident equivalence.

## Next action after CI

Perform targeted independent printed/source collation of the core covenant chain and the two Gospel genealogies. Prioritise manuscript/source variants and clear editorial proof types. Then begin an existing-author story source harvest for the 44 character topics, *before* selecting excerpts or implementing a narrative reader.

# Catholic Scripture offline text packs

Only approved, edition-specific text files belong here. No Protestant texts or
generated Scripture verses may be used as filler.

**Upstream candidates for review** (not yet imported or certified):
- Douay–Rheims 1899 / Challoner revision: eBible.org `engDRA` (public domain),
  or the Scrollmapper `DRC` dataset. Source transcription must be compared
  against the declared edition.
- Crampon 1923: French Wikisource's scanned Desclée 1923 edition as the
  textual witness; Scrollmapper `FreCrampon` is a candidate machine-readable
  transcription, not independent proof of accuracy.
- Clementine Vulgate: compare against a named Clementine print edition.
- Catholic Public Domain Version (2009): expressly placed in the public domain by its author; compare pinned digital candidate against https://sacredbible.org/catholic/index.htm and review independent translation before certification.
- Knox and NCB: excluded from the public-domain-only edition shortlist.

Before running `node tools/scripture/compile-books.mjs INPUT OUTPUT`:
1. Confirm the exact printing, bibliographic details, rights for redistribution
   and offline caching, and human editorial review.
2. Map every upstream book to the fixed 73 canonical IDs, including Tobit,
   Judith, Wisdom, Sirach, Baruch, Maccabees, and the full Catholic Esther and
   Daniel material.
3. Verify the text's versification for every book. Never automatically substitute
   Protestant numbering, especially in Psalms and deuterocanonical material.
4. Prepare a normalized JSON file with 73 book objects and approved provenance.
   The compiler refuses incomplete sources and duplicate chapters/verses.
5. Compare sampled passages and checksum the output; manual certification is
   distinct from the compiler's structural checks.

No pack currently ships. The Home reader opens source sites when there is no
validated in-app text. Full-text search and offline caching intentionally require
licensed/certified packs; the interface does not claim unavailable Bible texts.

## In-app Catena Aurea commentary (separate from Bible editions)

The four files under `data/scripture/catena/` are **commentary**, not Bible
text packs. They contain all 814 pericopes and 12,692 Father-attributed
fragments from the *Catena Aurea* Oxford translation (1841–45, J. H. Newman).
Source: `AlvaroBalbin/catena` pinned to commit
`efe1bd084d918a34ca22ffeef2ecf711c593b392`, with individual upstream
Git blob identifiers, edition label, source links and a corpus-wide manifest.

These files are self-hosted by Ad Orientem: clicking Commentary reads them
inside the existing Scripture overlay. Each Gospel is fetched only as needed,
and after the first successful retrieval can be saved to CacheStorage for
subsequent offline use. Initial use without connectivity still requires a
previously cached Gospel file. No dependency on live GitHub Raw for runtime
display. The original text fragments and attributed Father names are retained.

Run `node tests/scripture-catena-corpus.mjs` to verify the complete manuscript
census, attribution, source metadata, exact match against Gospel verse keys,
and no remote-runtime dependency. **Do not confuse this commentary source
approval with approval to reproduce the Bible translations**: the latter remain
disabled pending their separate canonical edition and textual audits.


## Living Catena conversation (source-faithful v1)

The Scripture overlay's English **Commentary** tab now displays a Messenger-like
thread drawn directly from the existing source-pinned Catena packs. This is a
reading interface, **not** a simulation of a conversation that the Fathers
actually had. It does not synthesize, paraphrase or translate patristic speech.

- Each Father-attributed message keeps the **exact** source fragment, attributed
  author label, pericope citation, ordinal and link to the original Catena
  source. A long message begins with a literal prefix and is explicitly
  expandable to its complete unabridged extract.
- **Continue reading** reveals the next as-yet-unshown Catena excerpt in source
  order. **Another Father** reveals an as-yet-unshown excerpt bearing a different
  original author label. The author chips select further available fragments
  attributed to that author within the same selected passage.
- The message composer uses **conservative lexical matching only**, against
  the already-loaded original fragments for the selected Gospel pericope(s).
  Named-Father queries filter by the exact source attribution; ties prefer
  previously unseen extracts and a range of attested voices. Suggested topic
  chips are displayed only when those words occur in the indexed source text.
  It does not yet implement semantic question answering or retrieval across
  unrelated verses. An unsupported query visibly returns no match, never
  fabricated words or a misleading patristic reply.
- The selected Scripture witness remains visible as a compact expandable
  passage panel above the Messenger thread; its exact verse, source link and
  uncollated-witness warning reuse the existing canonical Bible reader.
- Bible text remains owned by the established Scripture reader and by its
  separately governed editions; commentary does not impersonate Scripture.
- French remains unavailable until the French patristic extracts and their
  alignment/provenance have passed independent review. English is never
  silently substituted into the French interface.
- The display honors the corpus's historical attribution labels, including
  qualified authorship. It does not claim every label is modern scholarly
  consensus. Source links point to the Catena compilation, not necessarily
  the critical edition of an individual patristic work.
- No Mass, Historia Salutis, or other caller needs a second Catena registry.

Regression: \`node tests/scripture-catena-messenger.mjs\`.
The existing comprehensive integrity test remains
\`node tests/scripture-catena-corpus.mjs\`.


### Four-Gospel concordance (source locators, not generated theology)

The four files in \`data/scripture/catena/lexicon/\` are rebuilt from the 23
integrity-pinned chapter packs by
\`node tools/scripture/build-catena-global-lexicon.mjs\`.
CI verifies byte-for-byte reproducibility with \`--check\`. The concordance
contains all **814 pericope locators** and lexical postings derived from
all **12,692 original attributed fragments**; it does **not** store or
synthesize alternative patristic text.

From a Living Catena thread, the user may search a question across all four
Gospels. An unanswered local question triggers the broader search automatically;
otherwise “Search all four Gospels” is an explicit expansion control.
Each returned message is **reloaded from the original authenticated chapter
pack** and carries an explicit “FROM ANOTHER PASSAGE” label, the actual Catena
citation, author attribution and link to the original source. The pinned Gospel
verse remains unchanged. Each search loads at most four small index files and
only a bounded set of source chapter packs.

This is vocabulary matching with source integrity, **not** semantic
theological inference, impersonation or an AI-authored response. Searches
can miss relevant writings whose wording differs from the query; no
cross-Gospel comparison is asserted unless the exact source excerpt is
available. Missing indexes or source packs produce an explicit incomplete
results notice rather than fabricated texts. The French source alignment
continues to be withheld.

Regression: \`node tests/scripture-catena-global-search.mjs\`.


### Related wording (bounded editorial research aids)

Six explicitly curated vocabulary groups provide a *candidate-finding*
fallback for Word/Logos, the Son before creation, Incarnation/Word made flesh,
Holy Spirit/Holy Ghost, Resurrection/risen from the dead, and
remission/forgiveness of sins. The approved patterns live in
\`src/scripture/catena-related-vocabulary.js\` and are covered by
\`tests/scripture-catena-related-vocabulary.mjs\`.

These pairs are **not** doctrinally interchangeable terms in every context.
They are editorial prompts to find passages worth reading. The system only
offers a related-phrase result if the **unchanged original Catena fragment**
contains one of the explicitly approved evidence expressions. The Messenger
then labels the literal source phrase **RELATED SOURCE WORDING · Not a direct
answer**, and still displays the entire original extract and source reference.
Search results are not speeches authored in a Father's name, endorsed
theological conclusions, or automatically verified interpretations. Exact
source results remain available; unsupported queries do not invent answers.

This is deliberately small and audit-friendly: expanding to further topics
requires separate review of matching phrases, source scope and false-positive
cases. It is not a general-purpose theological AI or an unrestricted synonym
database.


### Editorial relevance and false-positive acceptance (October 2026)

The initial 11-question benchmark remains a regression test, not proof of
quality. A separate challenge of **38 additional source-linked questions**
covers all four Gospels (Mark 10, Matthew 9, Luke 10, John 9), alongside 16
unsupported-query probes. Source IDs, precise original segment ordinals,
inherited author labels and literal evidence strings are checked in CI:

\`node tests/scripture-catena-editorial-challenge.mjs\`

Initial expanded result: **23/38** selected original exemplars appear in the
first four displayed responses; Gospel-specific counts are recorded in
\`EDITORIAL_REVIEW_PROTOCOL.md\`. The 16 negative prompts yielded zero
attributed messages after the source-context abstention safeguard. These
are *diagnostic retrieval metrics*, not independent judgments that the
other excerpts are irrelevant or proof that a larger release meets quality
targets. There is **no human-independent editorial acceptance yet**.

For a blind two-reviewer grading procedure (direct answer, useful related
context, weak match, misleading/unsupported), how to record full-source
evidence, and proposed release criteria, see
\`data/scripture/catena/EDITORIAL_REVIEW_PROTOCOL.md\`. Keep all 15 missed
exemplars in the diagnostic set; never silently rewrite test targets to
inflate an automated score. No fictional speeches, new translations or
second Catena registry may be introduced through this process.


### Provisional full-excerpt assessment of the seven competing-answer cases

A case-by-case reading of the complete original Catena segments, exact fragment
IDs and source links is recorded in
\`data/scripture/catena/EDITORIAL_SEVEN_ALTERNATIVES_2026-10-21.md\`.
The prior four-message alternatives for seven *missing nominated sources*
contain at least one **provisionally direct** original excerpt in six cases;
the Luke 18 question about the Pharisee's physical posture is the clear
question-specific miss. Across the 27 displayed excerpts in this subset,
the preliminary editor-assist ratings are 10 direct, 9 related and 8 weak.
This is **not independently adjudicated**; it is not a replacement for the
fixed 23/38 exact-reference recall score, and the named original challenge
targets remain unchanged.

The seven full-text assessments explicitly distinguish literal reading,
allegorical commentary, historical-author labels, and a warning against
generalizing one patristic interpretation of the paralytic's condition.
Release still requires source-critical checks and independent editorial review.


### Source-strength labels and passage-specific ranking

Living Catena questions now apply **within-passage document-frequency
weighting** to the original source text. Distinctive words found in very few
Father-attributed extracts gain more weight than words repeated across the
whole passage. This helps preserve a specific interpretation of the
Pharisee's **standing/posture** (Luke 18:9–14) ahead of broader discussions of
pride, without inserting a prewritten answer or changing the 1962 Scripture
reader or original Catena text.

A query-result message carries one of these **retrieval evidence** labels:

- **EXACT SOURCE WORDING:** a multiword phrase literally occurs in the
  original extract. The phrase is taken from that source and is not an
  independently verified doctrinal answer.
- **SHARED SOURCE WORDS:** only individual source terms overlap; the message
  may supply context but must not be presented as a direct answer.
- **RELATED SOURCE WORDING:** a narrowly reviewed vocabulary cue points to
  an evidenced original phrase; explicitly **not a direct answer**.
- **FROM ANOTHER PASSAGE:** the selected extract belongs elsewhere in the
  four-Gospel Catena and keeps its own original citation.

Initial chronological browsing and the direct **Another Father** control
remain plainly reading/navigation actions, not responses to a typed
question. All textual evidence originates in the authenticated chapter
packs. The UI does **not** automatically certify Grade 3 versus Grade 2
theological relevance. That remains the work of a separate source-critical,
independently reviewed editorial process.

The mobile acceptance suite checks that retrieval evidence labels stay
visible and are associated with the correct original-message fragments.
The expanded editorial challenge includes the Luke 18 exact-source
selection regression and continues to reject unsupported modern questions.

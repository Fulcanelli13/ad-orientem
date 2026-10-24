#!/usr/bin/env python3
"""Research-only 1905 long Catechism vs canonical 1912-short question retrieval.

Writes candidate similarity links, NOT semantic equality, answers, or published dialogue.
Network is required only for --run, and the source URLs are pinned/reviewed here.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import re
import sys
from urllib.request import Request, urlopen
import unicodedata

MUSEUM = "https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/"
PINNED_REPO = "https://raw.githubusercontent.com/gustavo-depaula/ember/65d10046c19b610a4307ef273a751ceeb3c4f153/content/books/pius-x-catechism/it/"
LONG_SECTIONS = (
    ("lezione-preliminare/", 1, 14),
    ("parte-prima-il-credo-o-simbolo-apostolico/", 15, 252),
    ("parte-seconda-dellorazione/", 253, 341),
    ("parte-terza-dei-comandamenti-di-dio-e-della-chiesa/", 342, 516),
    ("parte-quarta-dei-sacramenti/", 517, 855),
    ("parte-quinta-delle-virtu-principali-e-di-altre-cose-necessarie-a-sapersi-dal-cristiano/", 856, 993),
)
STOPWORDS = set("a ad al alla alle allo ai agli all anche che chi ci cio come con cosa cos e ed è era essi esse fa fanno fare gli ha hanno i il in io la le lo ma nel nella nell ne non o per perché poi quale quali quando quanto se si sia siano sono su sul sua sue suoi suo tra un una uno voi vi".split())
SHORT_Q = re.compile(r"(?m)^\*\*(\d{1,3})\.\*\*\s*([^\r\n]+)")
LONG_Q = re.compile(r"(?m)^\s*(\d{1,4})\.?\s*D\.\s*([^\n]+)")
ANSWER = re.compile(r"(?m)^\s*(?:\(\*\)\s*)?R\.\s*",re.I)


class PageText(HTMLParser):
    """Only observable body text; block boundaries preserve numbered Q&A headings."""
    BREAKS = {"p", "div", "h1", "h2", "h3", "h4", "h5", "li", "br", "tr", "article", "section"}
    SKIP = {"script", "style", "noscript", "svg", "nav", "footer", "header"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0
        self.seen_body = False

    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.seen_body = True
        if tag in self.SKIP:
            self.skip += 1
        elif not self.skip and tag in self.BREAKS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.skip:
            self.skip -= 1
        elif not self.skip and tag in self.BREAKS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def render(self):
        s = "".join(self.parts).replace("\u00a0", " ")
        s = re.sub(r"[\t ]+", " ", s)
        return re.sub(r"\n[ \t]*\n+", "\n", s)


def fetch(url):
    req = Request(url, headers={"User-Agent":"AdOrientemResearchEvidence/1.0 (public historical index)"})
    with urlopen(req, timeout=40) as response:
        return response.read().decode("utf-8-sig", errors="replace")


def norm(s):
    s = unicodedata.normalize("NFKD", s.casefold())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+"," ",re.sub(r"[^\w\s]"," ",s)).strip()


def digest(s):
    return hashlib.sha256(norm(s).encode()).hexdigest()


def extract_long(raw, slug, first, last):
    p = PageText()
    p.feed(raw)
    text = p.render()
    qmarks = [m for m in LONG_Q.finditer(text) if first <= int(m.group(1)) <= last]
    records = []
    for i, m in enumerate(qmarks):
        right = qmarks[i+1].start() if i+1 < len(qmarks) else len(text)
        section = text[m.end():right]
        answer_mark = ANSWER.search(section)
        question = m.group(2).strip()
        # The original question sometimes wraps before the answer. Don't add page furniture.
        if answer_mark:
            prefix = section[:answer_mark.start()].strip()
            if prefix and len(prefix) < 200:
                question = " ".join((question,prefix))
            answer = section[answer_mark.end():].strip()
        else:
            answer = ""
        printed_number = int(m.group(1))
        position_number = first + i
        numbering_hold = None
        if printed_number != position_number:
            # One corroborated museum-transcription misprint: after 959 the
            # question "Che differenza v'è tra peccato e vizio?" is printed
            # as a second 950, followed by 961. Another digital witness
            # labels the same question 960. Keep both numbers in the audit.
            supported = (
                slug == "parte-quinta-delle-virtu-principali-e-di-altre-cose-necessarie-a-sapersi-dal-cristiano/"
                and printed_number == 950 and position_number == 960
                and norm(question) == norm("Che differenza v’è tra peccato e vizio?")
                and i > 0 and int(qmarks[i-1].group(1)) == 959
                and i + 1 < len(qmarks) and int(qmarks[i+1].group(1)) == 961
            )
            if not supported:
                raise ValueError(
                    f"Unexpected source numbering in {slug}: position {position_number}, "
                    f"printed {printed_number}, question {question[:80]!r}"
                )
            numbering_hold = "MUSEUM_SECOND_Q950_POSITIONALLY_IDENTIFIED_AS_Q960"
        records.append({
          "id": f"PX1905-Q{position_number:03d}",
          "n": position_number,
          "printed_number": printed_number,
          "numbering_hold": numbering_hold,
          "section": slug,
          "question": re.sub(r"\s+"," ",question).strip(),
          "answer": re.sub(r"\s+"," ",answer).strip(),
        })
    ids = [r["n"] for r in records]
    expected = list(range(first,last+1))
    if ids != expected:
        raise ValueError(f"LONG source {slug} expected {first}-{last}, got {len(ids)}; missing {sorted(set(expected)-set(ids))[:30]}, duplicates {[n for n,c in Counter(ids).items() if c>1]}")
    if any(not r["question"] or not r["answer"] for r in records):
        bad = [(r["id"], bool(r["question"]), bool(r["answer"])) for r in records if not r["question"] or not r["answer"]]
        raise ValueError(f"Missing question/answer parts in {slug}: {bad[:15]}")
    return records


def extract_short(text, file):
    matches = list(SHORT_Q.finditer(text))
    rows = []
    for i,m in enumerate(matches):
        end = matches[i+1].start() if i+1 < len(matches) else len(text)
        payload = text[m.end():end]
        rows.append({"id": f"PX1912-Q{int(m.group(1)):03d}", "n": int(m.group(1)), "question": m.group(2).strip(),
                     "answer": re.sub(r"\s+"," ",payload.replace("*"," ").strip())[:500],
                     "file":file})
    return rows


def terms(s):
    return set(t for t in norm(s).split() if len(t)>2 and t not in STOPWORDS)


def cosine(a, b, weights):
    intersection = a & b
    if not intersection: return 0.0
    top = sum(weights.get(t,1)**2 for t in intersection)
    x = sum(weights.get(t,1)**2 for t in a)
    y = sum(weights.get(t,1)**2 for t in b)
    return top / math.sqrt(x*y)


def candidate_links(long_rows,short_rows):
    corp=[terms(r["question"]) for r in long_rows+short_rows]
    docfreq=Counter(t for bag in corp for t in bag)
    weights={t: 1 + math.log((len(corp)+1)/(df+1)) for t,df in docfreq.items()}
    shortsets=[terms(r["question"]) for r in short_rows]
    inv=defaultdict(set)
    for i, tokens in enumerate(shortsets):
        for t in tokens: inv[t].add(i)
    result = []
    for long in long_rows:
        a=terms(long["question"]); ids=set()
        for t in a: ids.update(inv[t])
        ranked=[]
        for i in ids:
            score=cosine(a,shortsets[i],weights)
            if score>=0.35:
                ranked.append({"qid":short_rows[i]["id"],"lexical_score":round(score,4)})
        ranked.sort(key=lambda x:-x["lexical_score"])
        result.append({"source_qid":long["id"],"candidate_same_topic_qids":ranked[:5],
                       "approved_semantic_merges":0,"relationship":"UNREVIEWED_LEXICAL_CANDIDATES"})
    return result


def run(out):
    reference = json.loads(Path("data/learn/ltfaith-pius-x-it-witness-index.v1.json").read_text())
    files=sorted({r["file"] for r in reference["entries"]})
    short=[]
    for f in files:
        short.extend(extract_short(fetch(PINNED_REPO+f),f))
    nums=sorted(r["n"] for r in short)
    if nums != list(range(1,434)):
        raise ValueError(f"Short witness QIDs invalid: count={len(nums)}")
    long=[]
    for slug,first,last in LONG_SECTIONS:
        url = MUSEUM+slug
        group=extract_long(fetch(url),slug,first,last)
        long.extend(group)
        print(f"LONG {slug}: {len(group)} exact source Q&A identifiers")
    if len(long)!=993:raise ValueError(f"Long expected 993 got {len(long)}")
    crosswalk=candidate_links(long,short)
    # Exact normalized question-text matches are stricter than lexical
    # similarity but remain insufficient to assert equal *answers*.
    short_by_fingerprint=defaultdict(list)
    for row in short:
        short_by_fingerprint[digest(row["question"])].append(row["id"])
    exact_pairs=[
        {"long_id":row["id"],"short_id":sid,
         "question_sha256":digest(row["question"]),
         "classification":"SAME_NORMALIZED_QUESTION_TEXT_NOT_SEMANTICALLY_APPROVED"}
        for row in long
        for sid in short_by_fingerprint.get(digest(row["question"]),[])
    ]
    report={
      "schema":"AO_PIUS_X_1905_1912_MACHINE_CANDIDATE_CROSSWALK_V1",
      "status":"RESEARCH_ONLY_NOT_SEMANTICALLY_ADJUDICATED",
      "source_urls":[MUSEUM+x[0] for x in LONG_SECTIONS],
      "short_source_owner":"data/learn/ltfaith-pius-x-it-witness-index.v1.json",
      "short_witness":"pinned modern digital transcription, 1929 marriage anomaly still held",
      "totals":{"long_1905":len(long),"short_1912":len(short),
                "long_with_lexical_candidate":sum(bool(x["candidate_same_topic_qids"]) for x in crosswalk),
                "long_without_lexical_candidate":sum(not x["candidate_same_topic_qids"] for x in crosswalk),
                "exact_normalized_full_question_collisions_within_long":len(long)-len({norm(x["question"]) for x in long}),
                "approved_semantic_merges":0,
                "exact_normalized_crossedition_question_pairs":len(exact_pairs),
                "long_questions_with_exact_short_question_text":len({x["long_id"] for x in exact_pairs}),
                "short_questions_with_exact_long_question_text":len({x["short_id"] for x in exact_pairs})},
      "numbering_holds":[{"id":r["id"],"printed_number":r["printed_number"],
                          "positionally_assigned_number":r["n"],"hold":r["numbering_hold"],
                          "museum_url":MUSEUM+r["section"],
                          "cross_witness_url":"https://www.lampadaaimieipassi.it/webgmf/blog/index.php?idArticolo=20181121151751&idp=CCC_Pio_X"}
                         for r in long if r["numbering_hold"]],
      "long_question_manifest":[{"id":r["id"],"section":r["section"],"question_sha256":digest(r["question"]),
                                "answer_sha256":digest(r["answer"]),"question_chars":len(r["question"]),
                                "answer_chars":len(r["answer"]),"printed_number":r["printed_number"],
                                "numbering_hold":r["numbering_hold"]} for r in long],
      "short_question_manifest":[{"id":r["id"],"file":r["file"],"question_sha256":digest(r["question"]),
                                  "answer_sha256":digest(r["answer"]),"question_chars":len(r["question"])} for r in short],
      "exact_question_text_crossedition_links":exact_pairs,
      "crosswalk":crosswalk,
      "restrictions":["Score is lexical candidate, not theological same-intent judgment",
                      "Q-number authenticity is tied to museum HTML, not collated 1905 first-print scan",
                      "No copying of answers into the runtime or impersonated dialogue",
                      "Do not infer distinct answerable-intent count from unmatched lexical candidates"],
    }
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("CENSUS "+json.dumps(report["totals"],sort_keys=True))
    print("REPORT "+str(out))


def selftest():
    html='<html><body><article><p>1 D. Che cosa è la fede?</p><p>R. La fede è virtù.</p><p>2 D. Perché crediamo?</p><p>R. Per Dio.</p></article></body></html>'
    assert len(extract_long(html,"test",1,2))==2
    a=extract_short("**1.** Chi siamo?\n\n*Siamo persone.*\n\n**2.** Come preghiamo?\n\n*Con fede.*","test.md")
    assert len(a)==2 and a[1]["n"]==2
    assert digest("PÉrchè Dio?")==digest("perche Dio")
    pairs=candidate_links([{"id":"PX1905-Q001","question":"Che cosa è la fede?"}],a)
    assert len(pairs)==1
    assert digest("Perché noi preghiamo?")==digest("Perche, noi preghiamo?")
    # Reproduce the second printed Q950 at sequential position Q960.
    slug="parte-quinta-delle-virtu-principali-e-di-altre-cose-necessarie-a-sapersi-dal-cristiano/"
    fixture="".join(
        f"<p>{950 if n==960 else n} D. "
        f"{'Che differenza v’è tra peccato e vizio?' if n==960 else 'Domanda di prova?'}</p>"
        f"<p>R. Risposta.</p>"
        for n in range(950,962)
    )
    recovered=extract_long(fixture,slug,950,961)
    assert len(recovered)==12 and recovered[10]["id"]=="PX1905-Q960"
    assert recovered[10]["printed_number"]==950 and recovered[10]["numbering_hold"]
    try:
        extract_long(fixture.replace("Che differenza v’è tra peccato e vizio?", "Testo diverso?"),slug,950,961)
    except ValueError:
        pass
    else:
        raise AssertionError("Unapproved transcription correction must fail closed")
    print("Pius X historical research extractor selftest OK")


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--selftest",action="store_true")
    parser.add_argument("--out",type=Path,default=Path("research-out/pius-x-1905-to-1912-lexical-candidates.v1.json"))
    args=parser.parse_args()
    if args.selftest:selftest()
    else: run(args.out)

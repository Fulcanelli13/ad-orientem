#!/usr/bin/env python3
"""Research-only acquisition of two distinct historical source families.

Feasts: 26 original 1905 instruction chapters on Wikisource (no native QIDs).
Salzano: editorial transcribed question sequence (Sarto's autograph was unnumbered).
Both produce fingerprint and locator *candidates* only. No historical answer approval.
"""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import runpy

COMMON = runpy.run_path("tools/formation/extract-pius-x-1905-crosswalk.py")
fetch, PageText, digest = COMMON["fetch"], COMMON["PageText"], COMMON["digest"]

SALZANO = "https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-di-don-giuseppe-sarto-arciprete-di-salzano/"
WIKI = "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Istruzione_sopra_le_feste_del_Signore_della_B._Vergine_e_dei_Santi"
FEASTS = [(part, chap) for part, n in ((1,14),(2,12)) for chap in range(1,n+1)]
ROMAN = ("", "I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV")
FEAST_Q = re.compile(r"(?m)^\s*D\.\s*([^\n]+)")
FEAST_R = re.compile(r"(?m)^\s*R\.\s*",re.I)
SALZANO_Q = re.compile(r"(?m)^\s*(\d{1,3})\s*(?:\[[^\]\n]{1,32}\]\s*)?(?:[–—-]\s*)?([^\n]+)")

def clean(raw):
    h=PageText();h.feed(raw)
    return h.render()

def parse_feast(text, part, chap, url):
    qs=list(FEAST_Q.finditer(text))
    records=[]
    for i,m in enumerate(qs):
        end=qs[i+1].start() if i+1<len(qs) else len(text)
        block=text[m.end():end]
        a=FEAST_R.search(block)
        records.append({"id":f"PX1905-FESTA-P{part}-C{chap:02}-Q{i+1:02}",
                        "url":url,
                        "question_sha256":digest(m.group(1)),
                        "question_chars":len(m.group(1)),
                        "answer_present":bool(a)})
    return records

def parse_salzano(text):
    # The museum transcription joins the printed editorial 405 to the preceding answer.
    # Recover that printed heading explicitly without renumbering or guessing prose.
    text=re.sub(r"(?<=\w)(405\s*[–—-])",r"\n\1",text)
    raw=list(SALZANO_Q.finditer(text))
    # A later stray "1 –" in page furniture/editorial material is not part of
    # the continuous 1..577 editorial sequence; hold and exclude only that
    # demonstrably out-of-order second occurrence of 1.
    qs=[]
    for m in raw:
        number=int(m.group(1))
        if number==1 and qs and int(qs[-1].group(1))>10:
            continue
        qs.append(m)
    return [{"id":f"PX-SALZANO-EDITORIAL-POS{i+1:03}",
             "editorial_printed_number":int(m.group(1)),
             "question_sha256":digest(m.group(2)),
             "question_chars":len(m.group(2)),
             "source_url":SALZANO,
             "autograph_numbered":False}
            for i,m in enumerate(qs)]

def run(target):
    feast_groups=[]
    for part,cap in FEASTS:
        url=f"{WIKI}/Parte_{'prima' if part==1 else 'seconda'}/Capo_{ROMAN[cap]}"
        group=parse_feast(clean(fetch(url)),part,cap,url)
        if not group:
            raise ValueError("No feast question pairs at "+url)
        feast_groups.extend(group)
        print(f"FEAST P{part} chapter {cap:02}: {len(group)} source questions")
    s=parse_salzano(clean(fetch(SALZANO)))
    frequency=Counter(x["editorial_printed_number"] for x in s)
    dup=[{"n":k,"occurrences":v} for k,v in sorted(frequency.items()) if v>1]
    missing=[n for n in range(1,max(frequency)+1) if not frequency[n]]
    result={
      "schema":"AO_PIUS_X_FEAST_SALZANO_UNMERGED_QUESTION_LOCATOR_CENSUS_V1",
      "status":"RESEARCH_ONLY_EDITION_POSITION_IDS_NO_ANSWER_IMPORT",
      "sources":{"feasts":WIKI,"salzano":SALZANO},
      "counts":{"feasts_chapters":len(FEASTS),"feasts_parsed":len(feast_groups),
                "feasts_publisher_reported":219,
                "feasts_count_matches_publisher":len(feast_groups)==219,
                "feasts_missing_answer_blocks":sum(not x["answer_present"] for x in feast_groups),
                "salzano_editorial_question_blocks":len(s),
                "salzano_reported_editorial_sequence":577,
                "salzano_count_matches_editorial_sequence":len(s)==577,
                "salzano_duplicate_printed_numbers":dup,
                "salzano_missing_printed_numbers":missing},
      "feast_question_locators":feast_groups,
      "salzano_question_locators":s,
      "cautions":["Wikisource pages are transcriptions of print pages, not Sarto personally authored sentences.",
                  "Salzano question numbers were imposed editorially and sometimes misprinted.",
                  "Feast QIDs are local positional references only, not 1905 original numbers.",
                  "Editorial commentary mixed into Salzano HTML; answers NOT extracted.",
                  "No same-intent merges and no historical avatar answers are published."]
    }
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("FEAST_SALZANO_CENSUS "+json.dumps(result["counts"],ensure_ascii=False,sort_keys=True))

def selftest():
    html="<p>D. Quando si celebra la festa?</p><p>R. La domenica.</p><p>D. Che si fa?</p><p>R. Preghiamo.</p>"
    q=parse_feast(clean(html),1,1,"https://example.org")
    assert len(q)==2 and all(x["answer_present"] for x in q)
    s=parse_salzano(clean("<p>1 – Chi è Dio?</p><p>Risposta.</p><p>2 – Che cosa accade?</p>"))
    assert [x["editorial_printed_number"] for x in s]==[1,2]
    print("Salzano/feast locator parser selftest OK")

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--selftest",action="store_true")
    ap.add_argument("--out",type=Path,default=Path("research-out/pius-x-feasts-salzano-locators.v1.json"))
    args=ap.parse_args()
    if args.selftest:selftest()
    else:run(args.out)

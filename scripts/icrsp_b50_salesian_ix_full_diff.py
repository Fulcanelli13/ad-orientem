#!/usr/bin/env python3
"""B50 research-only full bounded work comparison; no prose stored or printed."""
import argparse
from collections import Counter
from datetime import datetime,timezone
from difflib import SequenceMatcher
from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import unicodedata
from urllib.request import Request,urlopen

ANNECY="https://www.donboscosanto.eu/francesco_di_sales/Lexicon/Fontes/09-Oeuvres%20de%20Saint%20Francois%20de%20Sales-Tome%20IX-Vol.3-Sermons.html"
HOST_ROOT="https://icrspfrance.fr/textes-liturgiques.php?article="
WORKS={
 "IX.IV":("a0180_ancien","L'Eglise au premier Dimanche de Caresme nous fait voir la tentation de Jesus Christ","Les ames qui sont parvenues à ce degré de perfection ont un soin tout particulier",850),
 "IX.XVI":("a0562_ancien","La sainte Eglise celebre aujourd'huy la feste de la Presentation de Nostre Dame au Temple","Puis vous adjousterez",1600),
 "IX.XIX":("a0352_ancien","Exurgens Maria, abiit in montana cum","Que si vous le faites fidellement et humblement en ce monde",1400)
}
class Blocks(HTMLParser):
    LINE={"p","br","div","h1","h2","h3","h4","h5","h6","li","tr","section","article"}
    SKIP={"script","style","noscript","svg","head"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts=[]
        self.skip=Counter()
    def handle_starttag(self,t,attrs):
        if t in self.SKIP:self.skip[t]+=1
        if t in self.LINE and not sum(self.skip.values()):self.parts.append("\n")
    def handle_endtag(self,t):
        if t in self.LINE and not sum(self.skip.values()):self.parts.append("\n")
        if t in self.SKIP and self.skip[t]>0:self.skip[t]-=1
    def handle_data(self,s):
        if not sum(self.skip.values()):self.parts.append(s)
    def blocks(self):
        return [re.sub(r"\s+"," ",s).strip() for s in "".join(self.parts).replace("\xa0"," ").splitlines() if s.strip()]
def decode_html(data, header_charset=None):
    # Legacy book transcriptions may declare encoding only in their HTML meta tag.
    lead=data[:8192].decode("ascii",errors="ignore")
    found=re.search(r"charset\s*=\s*[^a-z0-9]*([a-z0-9._-]+)",lead,re.IGNORECASE)
    charset=header_charset or (found.group(1) if found else "utf-8")
    try:
        return data.decode(charset,errors="strict")
    except (LookupError,UnicodeDecodeError):
        return data.decode("utf-8",errors="replace")

def fetch(url):
    req=Request(url,headers={"User-Agent":"AdOrientem-SourceCollation/1.0","Accept":"text/html"})
    with urlopen(req,timeout=30) as r:
        data=r.read(5000001)
        if len(data)>5000000:raise ValueError("source_exceeds_cap")
        return decode_html(data,r.headers.get_content_charset()),sha256(data).hexdigest()
def fold(s):
    return " ".join(re.sub(r"\[(?:\d{1,4})\]"," ",unicodedata.normalize("NFKC",s).lower().replace("’","'")).split())
def extract(html,begin,end,minwords):
    p=Blocks()
    p.feed(html)
    blocks=p.blocks()
    indices=[]
    for name,anchor in (("opening",begin),("ending",end)):
        matches=[i for i,b in enumerate(blocks) if fold(anchor) in fold(b)]
        if len(matches)!=1:raise ValueError(name+"_anchor_hits_"+str(len(matches)))
        indices.append(matches[0])
    start,stop=indices
    if start>=stop:raise ValueError("reversed_work_boundaries")
    selected=blocks[start:stop+1]
    if len(selected)<4 or sum(len(p.split()) for p in selected)<minwords:
        raise ValueError("suspect_truncated_work")
    return selected
def normalize(s):
    s=unicodedata.normalize("NFC",s).replace("\xa0"," ")
    s=re.sub(r"\[(?:\d{1,4})\]"," ",s)
    return re.sub(r"\s+"," ",s).strip()
def tokens(paras,lexical=False):
    s=normalize(" ".join(paras))
    return re.findall(r"[^\W_]+(?:['’][^\W_]+)?",s.casefold(),re.UNICODE) if lexical else s.split()
def delta(a,b):
    matcher=SequenceMatcher(None,a,b,autojunk=False)
    stats=Counter()
    for kind,i,j,k,l in matcher.get_opcodes():
        if kind!="equal":
            stats["changed_blocks"]+=1
            stats["host_changed_tokens"]+=j-i
            stats["edition_changed_tokens"]+=l-k
            stats[kind+"_blocks"]+=1
    return {"matching_ratio":round(matcher.ratio(),6),**stats}
def compare(wid,host,edition,hosthash,editionhash):
    article,opening,ending,minwords=WORKS[wid]
    h=extract(host,opening,ending,minwords)
    e=extract(edition,opening,ending,minwords)
    return {"work_id":wid,"host_article_id":article,
     "host_url":HOST_ROOT+article,"annecy_url":ANNECY,
     "host_html_sha256":hosthash,"annecy_html_sha256":editionhash,
     "host_paragraphs":len(h),"edition_paragraphs":len(e),
     "host_tokens":len(tokens(h,True)),"edition_tokens":len(tokens(e,True)),
     "host_normalized_sha256":sha256(normalize(" ".join(h)).encode()).hexdigest(),
     "edition_normalized_sha256":sha256(normalize(" ".join(e)).encode()).hexdigest(),
     "whitespace_diff":delta(tokens(h),tokens(e)),
     "lexical_diff":delta(tokens(h,True),tokens(e,True)),
     "same_lexical_tokens":tokens(h,True)==tokens(e,True),
     "whole_bounded_work_machine_compared":True,
     "individual_differences_manually_adjudicated":False,
     "printed_scan_certified":False,"rights_cleared":False,
     "app_owner_parity_approved":False,"production_approved":False}
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    report={"schema":"AO_ICRSP_B50_LIVE_FULL_WORK_DIFF_V1",
      "generated_utc":datetime.now(timezone.utc).isoformat(),
      "works":[],"errors":[],
      "source_prose_saved":False,"manually_adjudicated":False,
      "printed_scan_certified":False,"rights_cleared":False,"production_approved":False}
    try:edition,editionhash=fetch(ANNECY)
    except Exception as error:
        report["errors"].append({"scope":"annecy","error_type":type(error).__name__})
        edition=None
    if edition is not None:
        for wid,(article,*_) in WORKS.items():
            try:
                host,hosthash=fetch(HOST_ROOT+article)
                report["works"].append(compare(wid,host,edition,hosthash,editionhash))
            except Exception as error:
                report["errors"].append({"work_id":wid,"error_type":type(error).__name__,
                  "reason":str(error)[:80] if isinstance(error,ValueError) else "request_failure"})
    report["machine_collation_complete"]=len(report["works"])==3 and not report["errors"]
    path=Path(args.output)
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    summary={"complete":report["machine_collation_complete"],
      "works":[{
        "id":w["work_id"], "host_article_id":w["host_article_id"],
        "host_tokens":w["host_tokens"],"edition_tokens":w["edition_tokens"],
        "host_paragraphs":w["host_paragraphs"],"edition_paragraphs":w["edition_paragraphs"],
        "host_sha256":w["host_normalized_sha256"],"edition_sha256":w["edition_normalized_sha256"],
        "same_lexical_tokens":w["same_lexical_tokens"],
        "lexical_diff":w["lexical_diff"],"whitespace_diff":w["whitespace_diff"],
        "machine_compared":w["whole_bounded_work_machine_compared"],
        "editorially_adjudicated":w["individual_differences_manually_adjudicated"]
      } for w in report["works"]],
      "errors":report["errors"]}
    # Persist metadata only in Actions logs and Step Summary, not downloaded text.
    print("B50_MACHINE_RESULT="+json.dumps(summary,ensure_ascii=False))
    step_summary=os.environ.get("GITHUB_STEP_SUMMARY")
    if step_summary:
        lines=["### B50 full-work textual comparison","",
               "Result: "+("3/3 source works machine-compared" if summary["complete"] else "incomplete — no all-work clearance"),"",
               "| Work | Host tokens | Edition tokens | Lexical agreement | Changed blocks |",
               "|---|---:|---:|---:|---:|"]
        for work in summary["works"]:
            lines.append("| "+work["id"]+" | "+str(work["host_tokens"])+" | "+
                         str(work["edition_tokens"])+" | "+
                         str(work["lexical_diff"]["matching_ratio"])+" | "+
                         str(work["lexical_diff"].get("changed_blocks",0))+" |")
        if summary["errors"]:
            lines.append("")
            lines.append("Blocked: "+", ".join(x.get("work_id",x.get("scope","unknown"))+
                                                ":"+x["error_type"] for x in summary["errors"]))
        lines.extend(["","Photographed-print, editorial adjudication, reuse rights and app publication: **NOT CLEARED**."])
        with open(step_summary,"a",encoding="utf-8") as out:
            out.write("\n".join(lines)+"\n")
    return 0 if report["machine_collation_complete"] else 2
if __name__=="__main__":raise SystemExit(main())

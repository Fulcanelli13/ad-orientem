#!/usr/bin/env python3
"""Collection-wide Flemish OAI-PMH LIDO metadata discovery.

Research-only. The Datahub has >26k catalogued objects; the separate older
Imagehub collection indexes only a subset of image manifests. Never infer
image reuse rights from open metadata access. No images downloaded here.
"""
import argparse
import collections
import hashlib
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = "https://datahub.vlaamsekunstcollectie.be/oai/"
AGENT = "AdOrientemSacredArtDiscovery/1.0 (noncommercial research metadata harvester)"
ART_WORDS = re.compile(r"\b(painting|painted|painter|schilderij|olieverf|oil on|panel|"
                       r"paneel|peinture|huile|dipinto|malerei|retabel|altarpiece)\b", re.I)
EXCLUDE = re.compile(r"\b(sculpture|print|engraving|etching|watercolor|photograph|"
                     r"poster|ceramic|sculptuur|gravure|tekening|drawing|photo)\b", re.I)
STOP = set("saint saints st sts holy blessed lord our the a an of and with for to in at on by his her its"
           " de la le les des du van het heilige heiligen maria marie jesus christus christ"
           " virgin virginis sancti sancte sancta sanctus ii iii iv i".split())
WORD_ALIASES = {
    "visitation": "visitatie", "assumption": "tenhemelopneming", "annunciation": "aankondiging",
    "crucifixion": "kruisiging", "resurrection": "verrijzenis", "nativity": "geboorte",
    "martyrdom": "martelaarschap", "baptism": "doopsel", "epiphany": "driekoningen",
    "lawrence": "laurentius", "andrew": "andreas", "james": "jacobus",
    "bartholomew": "bartholomeus", "john": "johannes", "mary": "maria",
    "peter": "petrus", "paul": "paulus", "matthew": "mattheus"
}


def tag(node):
    return node.tag.rsplit("}", 1)[-1]


def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).casefold()
    s = "".join(c for c in s if not unicodedata.combining(c))
    return " ".join(re.findall(r"[a-z0-9]+", s))


def child_texts(node, names):
    out = []
    for el in node.iter():
        if tag(el) in names:
            x = " ".join(el.itertext()).strip()
            if x:
                out.append(re.sub(r"\s+", " ", x)[:600])
    return list(dict.fromkeys(out))


def choose_text(node, keys):
    vals = child_texts(node, keys)
    return vals[0] if vals else ""


def pull_xml(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.hostname != "datahub.vlaamsekunstcollectie.be":
        raise ValueError("Unexpected upstream host")
    req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept":"application/xml,text/xml"})
    for n in range(4):
        try:
            with urllib.request.urlopen(req, timeout=40) as f:
                data = f.read(10 * 1024 * 1024 + 1)
            if len(data) > 10 * 1024 * 1024:
                raise RuntimeError("OAI page too large")
            return ET.fromstring(data)
        except Exception:
            if n == 3:
                raise
            time.sleep(min(25,2 ** n * 3))


def get_field(lido, field):
    for el in lido.iter():
        if tag(el) == field:
            return el
    return None


def parse_record(rec):
    meta = get_field(rec, "metadata")
    if meta is None:
        return None
    lido = next((x for x in meta if tag(x).lower().endswith("lido")), meta)
    title = choose_text(lido, {"appellationValue"})
    record_id = choose_text(lido, {"lidoRecID"})
    inventory = choose_text(lido, {"workID"})
    work_type = child_texts(get_field(lido,"objectWorkType") or lido, {"term"})
    if not work_type:
        work_type = child_texts(lido,{"objectWorkType"})
    actors = []
    for el in lido.iter():
        if tag(el) == "nameActorSet":
            actors.extend(child_texts(el,{"appellationValue"}))
    actors = list(dict.fromkeys(actors))[:5]
    object_urls = child_texts(lido,{"objectPublishedID"})
    links = child_texts(lido,{"linkResource","resourceID"})
    rights = []
    for el in lido.iter():
        if "right" in tag(el).lower() and tag(el) in ("rightsWorkSet","rightsResource","rightsType","rightsHolder","rightsDate","rightsSet","rightsWorkWrap","rightsResource"):
            rights.extend(child_texts(el,{"term","creditLine","legalBodyID","rightsHolder","resourceRights"}))
    source_text = " ".join([title,*work_type,*object_urls,*links])
    return {
        "recordId":record_id,"inventory":inventory,
        "title":title,"artists":actors,
        "types":work_type[:10], "objectUrls":object_urls[:8],
        "resourceLinks":links[:6], "rightsText":list(dict.fromkeys(rights))[:10],
        "paintingTypeMatch": bool(ART_WORDS.search(" ".join(work_type))) and not bool(EXCLUDE.search(" ".join(work_type))),
        "metadataOnlyNoImageRightsAssumed":True,
        "source":"Flemish Art Collection Datahub LIDO OAI-PMH"
    }


def get_targets(path):
    with open(path,encoding="utf-8") as f:
        j=json.load(f)
    targets=[]
    for row in j.get("days",[]):
        if row.get("rank") not in ("I","II","III"):
            continue
        title=row.get("observedTitle","")
        if not title or title.lower().startswith("feria"):
            continue
        words=[w for w in norm(title).split() if w not in STOP and len(w)>3]
        if not words:
            continue
        targets.append({"date":row["date"],"rank":row["rank"],"title":title,"tokens":words})
    return targets


def score_link(record, targets):
    r = norm(" ".join([record["title"],*record["types"]]))
    matches = []
    for t in targets:
        primary = t["tokens"]
        aliases={x for w in primary for x in (w,WORD_ALIASES.get(w,"")) if x}
        overlap=sum(1 for w in primary if w in r.split() or WORD_ALIASES.get(w,"") in r.split())
        if len(primary)==1 and overlap==1 or len(primary)>=2 and overlap>=max(1,len(primary)-1):
            matches.append({"date":t["date"],"rank":t["rank"],"observedTitle":t["title"],
                            "matchState":"TEXTUAL_DATE_SUGGESTION_NOT_ICONOGRAPHIC_CERTIFICATION",
                            "overlap":overlap,"feastTokens":primary})
    return sorted(matches,key=lambda m:(-m["overlap"],m["date"]))[:6]


def signatures(obj,out):
    if isinstance(obj,dict):
        artist,title=obj.get("artist"),obj.get("title")
        if isinstance(artist,str) and isinstance(title,str) and artist and title:
            out.add(norm(artist)+"|"+norm(title))
        for val in obj.values():
            signatures(val,out)
    elif isinstance(obj,list):
        for x in obj:
            signatures(x,out)


def selftest():
    assert norm("Saint André") == "saint andre"
    assert ART_WORDS.search("olieverf op paneel")
    assert not EXCLUDE.search("oil on canvas")
    xml=ET.fromstring('<record><metadata><lido><lidoRecID>x1</lidoRecID><workID>IN-2</workID><titleSet><appellationValue>Saint Lawrence</appellationValue></titleSet><objectWorkType><term>Painting</term></objectWorkType><nameActorSet><appellationValue>Rubens</appellationValue></nameActorSet></lido></metadata></record>')
    x=parse_record(xml)
    assert x["recordId"]=="x1" and x["paintingTypeMatch"] and x["title"]=="Saint Lawrence"
    assert score_link(x,[{"date":"2026-08-10","rank":"II","title":"St. Lawrence","tokens":["lawrence"]}])
    print("PASS OAI-PMH XML parse, painting filtering, date join and unapproved metadata policy")


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--output",default="artifacts/sacred-art-flemish-oai")
    p.add_argument("--calendar",default="")
    p.add_argument("--existing",action="append",default=[])
    p.add_argument("--max-pages",type=int,default=2000)
    p.add_argument("--max-records",type=int,default=40000)
    args=p.parse_args()
    if args.self_test:return selftest()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    targets=get_targets(args.calendar)
    known=set()
    for name in args.existing:
        with open(name,encoding="utf-8") as f:signatures(json.load(f),known)
    rows,failures=[],[]
    token=None
    seen=set()
    pages=0
    while pages<args.max_pages and len(rows)<args.max_records:
        q={"verb":"ListRecords"}
        if token is None:q["metadataPrefix"]="oai_lido"
        else:q["resumptionToken"]=token
        url=BASE+"?"+urllib.parse.urlencode(q)
        try:
            root=pull_xml(url)
        except Exception as exc:
            failures.append({"page":pages,"error":str(exc)[:250]})
            break
        pages+=1
        for rec in root.iter():
            if tag(rec)!="record":continue
            try:
                x=parse_record(rec)
                if not x:continue
                x["possibleCalendarMatches"]=score_link(x,targets)
                artist=norm(x["artists"][0]) if x["artists"] else ""
                title=norm(x["title"])
                x["knownExactArtistTitle"]=None if not artist or not title else (artist+"|"+title in known)
                x["candidateStatus"]="METADATA_ONLY_NEEDS_ARTWORK_AND_PHOTO_REVIEW"
                rows.append(x)
            except Exception as exc:
                failures.append({"recordError":str(exc)[:180]})
        token_node=next((e for e in root.iter() if tag(e)=="resumptionToken"),None)
        token=(token_node.text or "").strip() if token_node is not None else ""
        if pages%25==0:
            print("OAI pages:",pages,"records:",len(rows),"next:",bool(token),flush=True)
        if not token or token in seen:break
        seen.add(token)
        time.sleep(0.1)
    painting=[r for r in rows if r["paintingTypeMatch"]]
    target=[r for r in painting if r["possibleCalendarMatches"] and r["knownExactArtistTitle"] is False]
    report={
        "schema":"AO_FLEMISH_OAI_BULK_RESEARCH_2026_V1",
        "source":BASE,"publicationStatus":"METADATA_DISCOVERY_ONLY_ZERO_IMAGE_DOWNLOADS",
        "pages":pages,"records":len(rows),"paintingsByType":len(painting),
        "newToLoadedIndicesCalendarSubjectCandidates":len(target),
        "knownPhysicalArchiveSignatures":len(known),"targetDates":len(targets),
        "fullHistorical856DedupComplete":False,"rightsCertified":0,"imagesAcquired":0,
        "imagesReleased":0,"newUserApprovals":0,
        "completeSource":not token and not failures,
        "remainderTokenPresent":bool(token),
        "failures":failures[:200],
        "notes":["The OAI open-data grant covers metadata, NOT image rights.",
                 "LIDO records may omit title, medium or artist and are held, never discarded as irrevocably unsuitable.",
                 "Text matching is only provisional; composite saints, precise physical originals and feast subjects require separate verification.",
                 "Candidate counts are not new unique paintings until accession-level dedup against full 856 archive."]
    }
    (out/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    (out/"calendar-candidate-paintings.json").write_text(json.dumps(target,ensure_ascii=False,indent=2),encoding="utf-8")
    (out/"all-open-metadata.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({key:report[key] for key in ("pages","records","paintingsByType","newToLoadedIndicesCalendarSubjectCandidates","completeSource")}),flush=True)


if __name__=="__main__":main()

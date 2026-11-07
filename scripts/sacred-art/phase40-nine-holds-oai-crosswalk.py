#!/usr/bin/env python3
"""Phase 40: bounded, read-only institutional OAI crosswalk for nine research holds.

Purpose: inventory evidence, not photo rights or publication approval.
Output is a research artifact; no automatic identity promotions.
"""
import collections
import json
import re
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

OUT=Path("artifacts/sacred-art-phase40-nine-holds")
OUT.mkdir(parents=True,exist_ok=True)
API="https://datahub.vlaamsekunstcollectie.be/oai/"
HEADERS={"User-Agent":"AdOrientemArtResearch/1.0 (read-only non-commercial art metadata verification)","Accept":"application/xml"}
NS={"o":"http://www.openarchives.org/OAI/2.0/"}
PHASE39=Path("data/research/sacred-art/phase39-five-official-inventory-crosswalks-and-nine-holds-20261107.v1.json")
CHECK_IDS={"RECENT575::005","RECENT575::031","RECENT575::032","RECENT575::033","RECENT575::034","RECENT575::035","RECENT575::142","RECENT575::179","RECENT575::440"}

def fetch(params):
    record={"params":params,"status":None,"error":None,"bytes":0,"text":""}
    try:
        response=requests.get(API,params=params,headers=HEADERS,timeout=(6,18))
        record["status"]=response.status_code
        if len(response.content)>1500000:
            record["error"]="OVERSIZE"
            return record
        record["bytes"]=len(response.content)
        record["text"]=response.text
        response.raise_for_status()
    except requests.RequestException as e:
        record["error"]=f"{type(e).__name__}: {str(e)[:200]}"
    return record

def get_list(scope):
    entries=[]
    flags=[]
    q={"verb":"ListIdentifiers","metadataPrefix":"oai_lido","set":scope}
    for page in range(3):
        response=fetch(q)
        doc=response.pop("text")
        flags.append({**response,"excerpt":doc[:320]})
        try:
            root=ET.fromstring(doc)
        except ET.ParseError:break
        errors=[x.attrib.get("code","") for x in root.findall("o:error",NS)]
        if errors:
            flags[-1]["oai_errors"]=errors
            break
        for header in root.findall(".//o:header",NS):
            ident=header.findtext("o:identifier",default="",namespaces=NS)
            if ident:entries.append(ident)
        token=root.find(".//o:resumptionToken",NS)
        if token is None or not (token.text or "").strip():break
        q={"verb":"ListIdentifiers","resumptionToken":token.text.strip()}
        time.sleep(0.1)
    return {"scope":scope,"identifiers":sorted(set(entries)),"result_count":len(set(entries)),"requests":flags}

def get_record(ident):
    q={"verb":"GetRecord","identifier":ident,"metadataPrefix":"oai_lido"}
    response=fetch(q)
    raw=response.pop("text")
    plain=re.sub(r"\s+"," ",re.sub(r"<[^>]*>"," ",raw))
    keys=["herreyns","taferelen","doop","lazarus","kana","cana","sleutels",
          "maria magdalena","verloren zoon","christus","heilige nicolaas","saint nicholas","grote","inventarisnummer",
          "999","god de vader","hieronymus"]
    matches={}
    for k in keys:
        if re.search(re.escape(k),plain,re.I):
            m=re.search(re.escape(k),plain,re.I)
            matches[k]=plain[max(m.start()-180,0):m.end()+420]
    accession=re.findall(r"(?<![A-Za-z0-9])(?:0000[.]GRO[0-9.]+[.]I|[A-Z]{1,4}[ _.-]?\d{2,6})(?![A-Za-z0-9])",plain)
    return {"identifier":ident,"status":response["status"],"error":response["error"],"bytes":response["bytes"],
       "text_excerpt":plain[:3800],"matches":matches,"accession_candidates":accession[:50],"source":"official Flemish Art Collection OAI GetRecord"}

def main():
    prev=json.loads(PHASE39.read_text(encoding="utf8"))
    holds={x["registry_id"] for x in prev["remaining_identity_holds"]}
    assert holds==CHECK_IDS,(holds,CHECK_IDS)
    scopes=[
       "creator:jacob_herreyns_i",
       "creator:herreyns_i_jacob",
       "creator:jacob_herreyns",
       "creator:herreyns_jacob",
       "creator:jacobus_aryns",
       "creator:areyns_jacobus",
       "creator:willem_herreyns",
       "creator:willem_jacob_herreyns",
    ]
    with ThreadPoolExecutor(max_workers=4) as ex:
        lists=list(ex.map(get_list,scopes))
    creators=sorted({item for result in lists for item in result["identifiers"]})
    museum_center="oai:datahub.vlaamsekunstcollectie.be:www.museabrugge.be:0000_GRO0676_I"
    combined="oai:datahub.vlaamsekunstcollectie.be:www.museabrugge.be:0000_GRO0676_I-2008_GRO0002a-2c_I"
    to_fetch=sorted(set(creators+[museum_center,combined]))
    with ThreadPoolExecutor(max_workers=4) as ex:
        objects=list(ex.map(get_record,to_fetch))
    statuses=collections.Counter(str(o["status"]) for o in objects)
    data={"schema":"AO_SACRED_ART_PHASE40_OAI_CREATOR_AND_PANEL_OBJECT_CROSSWALK_V1",
        "phase39_supported":168,"phase39_holds":9,"reviewed":sorted(CHECK_IDS),
        "creator_set_results":lists,"institutional_object_results":objects,
        "crosswalk_guards":["A matching creator name does not establish a selected painting's inventory number",
        "A Saint Nicholas object can be an old-attribution alias of another record; distinct selected photographs are retained",
        "Do not borrow KMSKA accession 190 God the Father or Ensor Christ cycle for Herreyns paintings",
        "No photo rights or visual fidelity approval, no production changes"],
        "source":"https://datahub.vlaamsekunstcollectie.be/oai/",
        "photos_replaced":0,"catalogue_candidates_not_automatically_promoted":True}
    (OUT/"evidence.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    summary={"scopes":{x["scope"]:x["result_count"] for x in lists},
        "unique_creator_objects":len(creators),"fetched_objects":len(objects),
        "http_results":dict(statuses),
        "brief_objects":[{"id":o["identifier"],"status":o["status"],
          "excerpt":o["text_excerpt"][:480]} for o in objects],
        "source_only":True,"photographs_replaced":0}
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)

if __name__=="__main__":
    main()

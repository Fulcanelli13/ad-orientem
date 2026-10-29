#!/usr/bin/env python3
"""Inspect Breviarium's gallery structure before bulk source intake."""
import hashlib,json,urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
p=Path("assets/staged/sacred-art-breviarium-source-audit-20261029")
p.mkdir(parents=True,exist_ok=True)
url="https://breviarium.ink/art/"
req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-SacredArt-OpenSource-Review/1.0"})
with urllib.request.urlopen(req,timeout=45) as r: html=r.read(1200000)
s=BeautifulSoup(html,"html.parser")
links=[a for a in s.select("a[href]") if "commons.wikimedia.org" in a["href"]]
pics=s.find_all(["picture","figure"])
structures=[]
for ix,a in enumerate(links[:12]):
    par=a
    ancestors=[]
    for i in range(4):
        par=par.parent
        if not par:break
        ancestors.append({"tag":par.name,"class":par.get("class"),"text":par.get_text(" ",strip=True)[:220],"html":str(par)[:600]})
    structures.append({"index":ix,"url":a["href"],"text":a.get_text(" ",strip=True)[:120],"ancestors":ancestors})
data={"url":url,"html_sha256":hashlib.sha256(html).hexdigest(),"size":len(html),
      "title":s.title.get_text(" ",strip=True) if s.title else "",
      "links_to_commons":len(links),"figures":len(pics),
      "headings":[h.get_text(" ",strip=True) for h in s.select("h1,h2,h3")],
      "sample_link_ancestors":structures,
      "sample_figure_html":[str(q)[:1600] for q in pics[:3]],
      "body_top":str(s.body)[:2800] if s.body else ""}
(p/"structure.json").write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({k:v for k,v in data.items() if k not in ("sample_link_ancestors","sample_figure_html","body_top")},ensure_ascii=False))

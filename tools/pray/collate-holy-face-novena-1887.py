#!/usr/bin/env python3
"""Acquire, structure and freeze a DIGITAL witness to Janvier/Bennett 1887.
This is not original 1887 printed-image collation. Never publish automatically.
Uses stdlib only; *fails closed* if a nine-day full body cannot be established.
"""
import hashlib
import html
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

SOURCE = "https://www.martinians.org/novena-to-the-holy-face"
OUT = Path("data/pray/research/pray-b25-holy-face-janvier-1887-nine-full-english-days.v1.json")
ORDINALS = ["FIRST","SECOND","THIRD","FOURTH","FIFTH","SIXTH","SEVENTH","EIGHTH","NINTH"]
SCENES = [
 "Bethlehem", "people of Judea", "Tabor", "Garden of Olives",
 "Caiphas", "Pilate", "Calvary", "Cross", "Resurrection"
]
ANCHORS = ["Luke 2:1–20","Luke 4:16–22","Matthew 17:1–8",
 "Luke 22:39–46","Luke 22:54–62","John 19:1–5",
 "Luke 23:26–31","Luke 23:33–34","John 20:11–20"]
class TextFromHtml(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.blocks=[]
  self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in {"script","style","noscript","svg","nav"}:self.skip+=1
  if not self.skip and tag in {"p","div","section","article","h1","h2","h3","h4","br","li","blockquote","hr"}:self.blocks.append("\n")
 def handle_endtag(self,tag):
  if tag in {"script","style","noscript","svg","nav"}:self.skip=max(0,self.skip-1)
  if not self.skip and tag in {"p","div","section","article","h1","h2","h3","h4","li","blockquote"}:self.blocks.append("\n")
 def handle_data(self,s):
  if not self.skip and s.strip():self.blocks.append(s)
 def value(self):
  text=html.unescape("".join(self.blocks))
  text=re.sub(r"\u00a0"," ",text)
  text=re.sub(r"[ \t]+"," ",text)
  text=re.sub(r"[ \t]*\n[ \t]*","\n",text)
  text=re.sub(r"\n{3,}","\n\n",text)
  return text.strip()

def extract(text,source_digest):
 headings=[]
 for i,word in enumerate(ORDINALS):
  pattern=rf"(?m)^\s*{word}\s+DAY\s*$"
  hits=list(re.finditer(pattern,text,re.I))
  if len(hits)!=1:raise RuntimeError(f"Expected one {word} DAY heading, found {len(hits)}; never publish partial text")
  headings.append(hits[0])
 if headings!=sorted(headings,key=lambda x:x.start()):raise RuntimeError("Source days are out of order")
 start=headings[0].start()
 commonOpening=None
 days=[]
 for i,head in enumerate(headings):
  end=headings[i+1].start() if i<8 else len(text)
  body=text[head.end():end].strip()
  if i==8:
   # Cut website footers and bibliography after the complete ninth collect.
   body=re.split(r"\bThe Manual of the Archconfraternity of the Holy Face\b",body,1)[0].strip()
  lines=[line.strip() for line in body.split("\n") if line.strip()]
  if not lines:raise RuntimeError(f"Day {i+1} lacks a title")
  title=lines[0]
  if SCENES[i].casefold() not in title.casefold():
   raise RuntimeError(f"Day {i+1} scene mismatch: {title!r}")
  dayBody="\n\n".join(lines[1:])
  if i==0:
   m=re.search(r"At the commencement say\s*:\s*(.*?)\s*(?=Enter into the grotto)",dayBody,re.I|re.S)
   if not m:raise RuntimeError("Day 1 source opening not isolatable")
   commonOpening=m.group(1).strip()
   dayBody=dayBody[m.end():].strip()
  else:
   dayBody=re.sub(r"^\(Prayers at the commencement are the same as for the first meditation above\)\s*","",dayBody,flags=re.I).strip()
  # The author supplied three numbered reflection sections plus Act, Virtue,
  # Bouquet, same aspirations and Collect. Refuse a short/contemporary novena.
  labels=[bool(re.search(rf"\b{roman}\.\s",dayBody)) for roman in ["I","II","III"]]
  acts=bool(re.search(r"\bAct of (love|confidence|hope|abandonment|contrition|offering|charity|generous love|desire)\b",dayBody,re.I))
  virtues=bool(re.search(r"\bVirtue\s+(?:(?:to|lo)\s+(?:be\s+)?)?practi[cs](?:e|ed)?\b",dayBody,re.I))
  bouquet=bool(re.search(r"\bSpiritual (?:Bouquet|bouquet)\b",dayBody))
  closing=bool(re.search(r"\bPRAYER\s*[-—]\s*(?:God all-powerful|Almighty and merciful God)",dayBody,re.I))
  if len(dayBody)<1100 or not all(labels) or not(acts and virtues and bouquet and closing):
   raise RuntimeError(f"Day {i+1} incomplete; length={len(dayBody)} sections={labels} acts={acts} virtue={virtues} bouquet={bouquet} collect={closing}")
  if i==8:
   # Ninth day's last 'Amen' must finish this original source, not page footer.
   k=dayBody.rfind("Amen.")
   if k<0:raise RuntimeError("Day 9 does not end with collect")
   dayBody=dayBody[:k+5]
  days.append({"day":i+1,"titleEn":title,"scriptureContext":ANCHORS[i],
   "historicalMeditationEnglish":dayBody,
   "fullDailyReadingEnglish":commonOpening+"\n\n"+dayBody,
   "sections":{"intro":True,"threeReflectionPoints":True,"act":True,
    "virtue":True,"spiritualBouquet":True,"sharedAspirations":True,"closingCollect":True},
   "printedWitnessCollated":False})
 if len(commonOpening)<65:raise RuntimeError("Historical opening too short")
 if any(len(d["fullDailyReadingEnglish"])<1200 for d in days):raise RuntimeError("Short/incomplete day")
 return {"schema":"ao.pray.b25-janvier-holy-face-full-digital-witness.v1",
  "sourceEdition":{"author":"Abbé Pierre-Désiré Janvier",
   "translator":"Mrs A.-R. Bennett","work":"Manual of the Archconfraternity of the Holy Face",
   "year":1887,"printedPages":"108–142","historicalOriginalPhotographCollated":False,
   "reproductionRights":"Historical 1887 text; modern source HTML is not independently licensed as editorial work"},
  "sourceWitness":{"url":SOURCE,"contentSha256":source_digest,
   "class":"MODERN_VERBATIM_CLAIMED_DIGITAL_ENGLISH_TRANSCRIPTION_NOT_PRINT_COLLATED",
   "description":"League of St Martin full nine-day English online transcription; page includes modern context outside novena"},
  "sharedOpeningEnglish":commonOpening,
  "days":days,
  "formatPreserved":{"dailyMeditationCount":9,"originalDailyIntro":True,
   "threeReflectiveSectionsPerDay":True,"originalDayActs":True,
   "originalDayVirtues":True,"originalSpiritualBouquets":True,"originalSharedAspirations":True,
   "originalClosingCollect":True},
  "sourceReleaseGate":{"completeNineEnglishDaysDigitallyStaged":True,
   "original1887PageImageCollation":False,"frenchWitnessVerified":False,
   "latinWitnessVerified":False,"publicReaderEnabled":False,
   "modern2022AppendicesIncluded":False},
  "indulgences":"No historical indulgence claim represents currently granted indulgences",
  "manualAuditRemaining":[
    "Compare full day-by-day text with independent St Joseph Missionaries' reproduction",
    "Collate original 1887 printed-page photographic witnesses 108–142",
    "Review WordPress 1887 indexed transcription and punctuation corrections",
    "Only after review admit an English-only supplement to existing Novenas owner"
  ]}
def main():
 req=urllib.request.Request(SOURCE,headers={"User-Agent":"Mozilla/5.0 (Ad Orientem historical bibliographic review; +https://github.com/Fulcanelli13/ad-orientem)"})
 with urllib.request.urlopen(req,timeout=25) as response:
  payload=response.read()
 if len(payload)<50000:raise RuntimeError(f"Suspiciously short source HTML: {len(payload)}")
 parsed=TextFromHtml();parsed.feed(payload.decode("utf-8","replace"))
 obj=extract(parsed.value(),hashlib.sha256(payload).hexdigest())
 OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 print(f"STAGED 9/9 English Janvier digital days; {sum(len(x['historicalMeditationEnglish']) for x in obj['days'])} characters; original printed scan NOT collated; no public release")
if __name__=="__main__":
 try:main()
 except Exception as e:print("SOURCE BLOCKED: "+repr(e),file=sys.stderr);sys.exit(1)

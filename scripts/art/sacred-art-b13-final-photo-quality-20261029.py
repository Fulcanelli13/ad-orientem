#!/usr/bin/env python3
"""B13 final: reject misleading photos/miscategories and replace with French paintings.

All original 250 source rows remain as research evidence; human review uses
this revised frozen 250-ID batch. Source images checked via per-file Commons
PD/CC0 and real image bytes, no original downloads or production changes.
"""
from __future__ import annotations
import collections,hashlib,importlib.util,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
SRC=D/'sacred-art-b13-french-museums-250-20261029.v1.json'
OUT=D/'sacred-art-b13-french-250-final-editorial-screener-20261029.v2.json'
HTML=ROOT/'docs/SACRED_ART_B13_FRENCH_MUSEUMS_250_FINAL_REVIEW_20261029.html'
QA=ROOT/'docs/SACRED_ART_B13_FRENCH_MUSEUMS_250_FINAL_QA_20261029.md'
spec=importlib.util.spec_from_file_location('aob13',ROOT/'scripts/art/sacred-art-b13-french-museum-250-review-20261029.py')
B=importlib.util.module_from_spec(spec);spec.loader.exec_module(B)
M=B.M
HOLD={
 'commons:123828337':'Louvre photo explicitly says avec cadre — visible frame',
 'commons:15336554':'second reproduction of same Caravaggio Christ at Column; retain larger verified 9,312×7,112 image',
 'commons:81902276':'Strasbourg photography explicitly states avant restauration; seek better present-state image',
 'commons:12780174':'file explicitly describes The National Gallery London rather than Strasbourg; French museum category inconsistent',
 'commons:104889020':'portrait fragment of altarpiece, not suitable whole religious composition',
 'commons:163856846':'détail — crop of Rubens original, not entire composition',
 'commons:163855641':'détail — crop rather than whole religious painting',
 'commons:163855591':'détail — another crop of the same artwork',
 'commons:85666930':'photographer/uploader wrongly captured as painter; source attribution requires verification',
 'commons:115155018':'photographer/uploader wrongly captured as painter; source attribution requires verification',
}
FRENCH_EXTRA=[
 ('Musée des Beaux-Arts de Lyon',[
 'Religious paintings in the Musée des Beaux Arts de Lyon',
 'Paintings of Madonna and Child in the Musée des Beaux Arts de Lyon',
 'Paintings of Jesus Christ in the Musée des Beaux Arts de Lyon',
 'Religious paintings in the Musée des Beaux-Arts de Lyon',
 ]),
 ('Musée Fabre, Montpellier',['Religious paintings in the Musée Fabre','Old Testament paintings in the Musée Fabre']),
 ('Palais des Beaux-Arts de Lille',['Religious paintings in the Palais des Beaux-Arts de Lille']),
 ('Louvre, Paris',['Religious paintings in the Louvre','New Testament paintings in the Louvre']),
 ('Musée des Beaux-Arts de Strasbourg',['Religious paintings in the Musée des Beaux-Arts de Strasbourg']),
]
def relevant_extra(x):
 # Strictly protect against photo uploader names in artist slot or in situ
 # photography; only art subjects with known painter attribution survive.
 a=str(x['artist'] or '').lower()
 fname=str(x['fileTitle'] or '').lower()
 if a in ('unattributed','anonymous','unknown') or any(z in a for z in
   ('photograph','jvillafruela','dchnwam','sailko','didier descouens','ralph hammann','daderot','paul hermans')):
  return False
 if any(z in fname for z in ('avec cadre','détail','detail','avant restauration',
   'after restoration','fragment','the national gallery london','prado','study for','bozzetto','dsc0',
   'exposition','expo.')):
  return False
 if 'photo' in fname or 'fresco' in fname or 'study' in fname:return False
 return B.is_sacred(x)
def make_final_gallery(rows,sha):
 s=(ROOT/'docs/SACRED_ART_B13_FRENCH_MUSEUMS_250_IMPORT_REVIEW_20261029.html').read_text()
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 s,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+payload+m.group(2),s,count=1,flags=re.S)
 assert n==1
 s,n=re.subn(r'const batchHash="[0-9a-f]+";',
  lambda m:'const batchHash="'+sha+'";',s,count=1)
 assert n==1
 s=re.sub(r'<title>.*?</title>',
  '<title>Ad Orientem | Sacred Art Batch 13 — French Museum Review (250)</title>',s,count=1,flags=re.S)
 s=s.replace('<h1>Sacred Art · Batch 12 · Old Master Paintings</h1>',
  '<h1>Sacred Art · Batch 13 · French Museums &amp; Old Masters</h1>')
 s=s.replace('All unselected works in the <strong>completed, verified-image batch</strong> are rejected.',
  'Every image is individually Public Domain/CC0 screened. French museum association comes from Commons categories, not direct museum approval. All unselected works are rejected upon finalisation.')
 s=s.replace('<select id="museum" aria-label="Source"><option value="all">All paintings</option><option value="Commons">Wikimedia Commons</option></select>',
  '<select id="museum" aria-label="Museum collection"><option value="all">All 250 paintings</option><option value="French">French museum collections</option><option value="Other">Other open-access sources</option></select>')
 s=s.replace("(filter==='all'||work.provider===filter)",
  "(filter==='all'||(filter==='French'&&!!work.museumAssociation)||(filter==='Other'&&!work.museumAssociation))")
 s=s.replace("if(filter!=='all'&&work.provider!==filter)continue;",
  "if(filter==='French'&&!work.museumAssociation)continue;if(filter==='Other'&&work.museumAssociation)continue;")
 s=s.replace("[work.title,work.artist,work.objectId,work.accession].join(' ')",
  "[work.title,work.artist,work.objectId,work.accession,work.museumAssociation].join(' ')")
 s=s.replace("body.append(text('div','museum',work.sourceInstitution));",
  "body.append(text('div','museum',work.museumAssociation?('France · '+work.museumAssociation):('Other museum · Commons PD image')));")
 s=s.replace("const link=text('a','', 'Official museum record');",
  "const link=text('a','', 'Commons photograph & licence');")
 s=s.replace('Batch 9 is research-only.','Batch 13 is research-only. No production imports have been made.')
 # Export whole museum-scoped identity, while preserving the provider field.
 s=s.replace('return {museum:w.provider,sourceObjectId:w.objectId',
  'return {museum:w.provider,museumAssociation:w.museumAssociation||null,sourceObjectId:w.objectId')
 assert "batchId:'B13'" in s and 'const PAGE_SIZE=50;' in s and "filter==='French'" in s
 assert 'Commons photograph & licence' in s and 'museumAssociation:w.museumAssociation' in s
 HTML.write_text(s,encoding='utf8')
def main():
 data=json.loads(SRC.read_text())
 assert data['batchReady'] and len(data['rows'])==250
 excluded=[{'sourceId':x['id'],'title':x['title'],'reason':HOLD[x['id']]}
   for x in data['rows'] if x['id'] in HOLD]
 assert len(excluded)==len(HOLD)==10
 keep=[x for x in data['rows'] if x['id'] not in HOLD]
 oldids,oldworks=B.old()
 # Exclude all 250 initial batch proposals so that substitutions cannot be
 # visually redundant with already shown items, even within research.
 usedids=oldids|{x['id'] for x in data['rows']}
 usedworks=oldworks|{M.workkey(x['title'],x['artist']) for x in data['rows']}
 cats=[];catevidence={}
 for museum,roots in FRENCH_EXTRA:
  for root in roots:
   cats.append((museum,root))
   if 'Lyon' in museum:
    sub,_=B.get_subcats(root)
    for c in sub[:22]:
     if B.approve_category(c,root):cats.append((museum,c))
 candidates=[];seen=set()
 for museum,c in cats:
  x,stat=B.fetch_cards(c,museum,usedids)
  catevidence[c]={'candidate':len(x),'pages':stat['pages']}
  for r in x:
   if r['id'] in usedids or r['id'] in seen or not relevant_extra(r):continue
   key=M.workkey(r['title'],r['artist'])
   if key in usedworks:continue
   seen.add(r['id']);candidates.append(r)
  print('B13_QA_NEW_CATEGORY',json.dumps({'museum':museum,'category':c,'raw':len(x),'eligiblePool':len(candidates)}),flush=True)
 candidates.sort(key=B.priority)
 replacements=[];replworks=set();errors=[]
 for x in candidates[:180]:
  if len(replacements)>=10:break
  key=M.workkey(x['title'],x['artist'])
  if key in replworks:continue
  ok,why=B.check(x)
  if ok:
   x['sourcePhotoQuality']='JPEG_HEADER_VERIFIED'
   replacements.append(x);replworks.add(key)
  else:errors.append({'sourceId':x['id'],'reason':why})
  if sum('429' in y['reason'] for y in errors)>=3:break
 print('B13_QA_REPLACEMENTS',json.dumps({'needed':10,'verified':len(replacements),
   'pool':len(candidates),'errors':errors[:8],
   'names':[(x['title'],x['artist'],x['museumAssociation']) for x in replacements]},ensure_ascii=False)[:7000],flush=True)
 assert len(replacements)==10,('need 10 genuinely new rights-verified painting replacements',len(replacements))
 rows=keep+replacements
 assert len(rows)==250 and len({x['id'] for x in rows})==250
 sha=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 make_final_gallery(rows,sha)
 museums=collections.Counter(x['museumAssociation'] or 'Other' for x in rows)
 counts={'target':250,'reviewable':len(rows),
  'frenchMuseumAssociated':sum(bool(x['museumAssociation']) for x in rows),
  'otherOpenAccess':sum(not x['museumAssociation'] for x in rows),
  'rejectedDubiousMetadataOrPhotos':len(excluded),
  'verifiedNewReplacementImages':len(replacements),
  'prevReviewedBatchesExcluded':2205,
  'imageByteErrorsInFinal':0,
  'originalImagesAcquired':0,'productionImports':0}
 out={'schema':'AO_SACRED_ART_B13_FRENCH_MUSEUM_FINAL_EDITORIAL_SCREEN_V2',
  'date':'2026-10-29','batchId':'B13','ready':True,'batchSha256':sha,'counts':counts,
  'museumDistribution':dict(museums),'excludedPhotoOrSubjectFlags':excluded,
  'replacementIDs':[x['id'] for x in replacements],
  'newSourcesChecked':catevidence,'failedNewThumbnails':errors,
  'rightsLimit':'File-level Commons public domain/CC0 only; French museum location from Commons categories. Needs human original art quality and attribution judgement.',
  'rows':rows}
 OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 QA.write_text('# B13 — French Museums: final editorial-quality pass\n\n'
  f"**250** verified source-photo cards, **{counts['frenchMuseumAssociated']}** with French museum category associations. "
  f"Replaced **{len(excluded)}** doubtful photo/art records (framed, cropped, historical pre-restoration, out-of-museum mismatch, unverified photographer attribution, one same-painting duplicate) "
  f"with **{len(replacements)}** newly verified French museum category photographs.\n\n"
  "Exact Commons Public Domain or CC0 status, photographic JPEG bytes and native minimum 1600px short side checked. "
  "Source category association is *not* proof of museum photo rights; native file metadata is held as evidence. "
  "Visual aesthetic, framing, provenance, attribution and colour still await curator selection.\n\n"
  "Previous 2,205 source cards excluded. No production import and no original photos copied; €0.\n\n"
  f'Frozen batch identity: {sha}.\n',encoding='utf8')
 print('B13_QA_FINAL',json.dumps({'counts':counts,'hash':sha,
  'museumDistribution':dict(museums)},ensure_ascii=False)[:2800],flush=True)
if __name__=='__main__':main()

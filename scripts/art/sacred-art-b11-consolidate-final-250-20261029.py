#!/usr/bin/env python3
"""Consolidate two independently verified B11 Commons image batches to 250.

NO Wikimedia API or CDN requests: uses immutable successful 224-card source
commit and latest successful 183-card expanded source commit. Image headers
were checked during each source job; handle 2026 Wikimedia 429 without
bypassing it. Exact file licence remains per selected row.
"""
from __future__ import annotations
import hashlib,json,re,subprocess
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OLD_COMMIT='df7fd7acf17f6af25af41e462c1e51124ff17786'
OLD_SOURCE='data/calendar/sacred-art-b11-commons-250-verified-20261029.v1.json'
NEW_SOURCE=D/'sacred-art-b11-commons-250-verified-20261029.v1.json'
OUT=D/'sacred-art-b11-final-250-merged-verified-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B11_FINAL_20261029.html'
QA=ROOT/'docs/SACRED_ART_B11_250_FINAL_MERGED_SOURCE_QA_20261029.md'
BAD=re.compile(r'\b(?:hajj|khalili|detail|close.up|cropped|foto van|dsc\d|im rahmen|saint bernard dog|study of|studio of|landscape without|church interior|stained glass|volta|altar fragment|sailko|daderot|pinotto|framed|frame\b|guercino.*v2)\b',re.I)
FAVORITES=('peter paul rubens','anthony van dyck','guido reni','guercino',
'francisco de zurbarán','nicolas poussin','jacob jordaens','luca giordano',
'bernardo strozzi','domenichino','artemisia gentileschi','sebastiano ricci',
'giovanni lanfranco','philippe de champaigne','gerard van honthorst')
def norm(s):
 return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def worktitle(t):
 x=norm(t)
 x=re.sub(r'\b(?:the|a|an|of|by|from|saint|st|with)\b',' ',x)
 x=re.sub(r'\bgreater\b','great',x)
 return re.sub(r'\s+',' ',x).strip()
def artistkey(x):
 a=norm(re.sub(r'\([^)]*\)','',str(x or '')))
 w=[z for z in a.split() if z not in {'sir','the','artist','painter','of','after','by',
 'attributed','to','workshop','school','circle','anonymous','unknown','flemish','italian',
 'dutch','german','french','spanish','and','or'}]
 return ' '.join(sorted(w[:5]))
def quality(x):
 t=str(x['title']).lower();a=str(x['artist']).lower();f=str(x['fileTitle']).lower()
 width=x['nativeSourceDimensions']['width'];height=x['nativeSourceDimensions']['height']
 return (0 if any(z in a for z in FAVORITES) else 1,
   0 if any(z in f for z in ('google art project','louvre','national gallery',
   'kunsthistorisches museum','wikimedia','museum of fine arts','gemäldegalerie',
   'art institute','slovak national gallery')) else 1,
   0 if any(z in t for z in ('christ','virgin','saint','jesus','madonna','crucifix','nativity',
      'adoration','annunciation','assumption','magdalene')) else 1,
   -min(int(width),int(height)),-max(int(width),int(height)),t,x['id'])
def normalize_card(x):
 x=dict(x)
 raw=str(x['title'])
 t=raw.replace('" "',' ').replace(' " " ',' ').strip(' "')
 if re.match(r'^(?:French|German|Italian|English|Spanish):',t,re.I) and ' | ' in t:
  parts=t.split(' | ')
  english=parts[-1].strip(' "')
  if len(english)>6:t=english
 # Only use an existing name string from the source: never invent new titles.
 if t!=raw:x['originalMetadataTitle']=raw;x['title']=t
 artist=str(x.get('artist') or '').strip()
 clean=re.sub(r'\s*[–-]\s*artist\s*\([^)]*\)\s*$','',artist,flags=re.I)
 clean=re.sub(r'\s+',' ',clean).strip()
 if clean!=artist:x['originalMetadataArtist']=artist;x['artist']=clean
 return x
def main():
 old=json.loads(subprocess.check_output(['git','show',OLD_COMMIT+':'+OLD_SOURCE],cwd=ROOT))
 new=json.loads(NEW_SOURCE.read_text())
 assert len(old['rows'])==224 and old['counts']['previewFailures']==0
 assert len(new['rows'])==183 and new['counts']['previewFailures']==105
 assert len(old['rows'])==old['counts']['previewHeadersChecked']
 assert len(new['rows'])+new['counts']['previewFailures']==new['counts']['previewHeadersChecked']
 pool={x['id']:x for x in [*old['rows'],*new['rows']]}
 assert len(pool)==274,('union drift',len(pool))
 removed=[];candidates=[];keys=set()
 for x in sorted(pool.values(),key=quality):
  info=' '.join(str(x.get(k) or '') for k in ('title','fileTitle','artist'))
  if BAD.search(info) or norm(x.get('title')) in ('painting','a woman weeping'):
   removed.append({'id':x['id'],'reason':'obvious incorrect subject, cropped detail, framed photo or uploader attribution','title':x['title']})
   continue
  sig=(worktitle(x['title']),artistkey(x['artist']))
  if sig in keys:
   removed.append({'id':x['id'],'reason':'duplicate artwork title and artist','title':x['title']})
   continue
  keys.add(sig);candidates.append(x)
 assert len(candidates)>=250,('not enough source-verified paintings after review hygiene',len(candidates))
 selected=[normalize_card(x) for x in candidates[:250]]
 suppressed=[{'id':x['id'],'reason':'lower priority among otherwise image-verified works','title':x['title']}
   for x in candidates[250:]]
 removed+=suppressed
 assert len({x['id'] for x in selected})==len({x['previewURL'] for x in selected})==250
 assert all(x['sourceRights']=='WIKIMEDIA_COMMONS_EXACT_FILE_PUBLIC_DOMAIN_OR_CC0' for x in selected)
 assert all(x['licenseShortName'].lower().startswith(('public domain','cc0')) for x in selected)
 assert all(min(x['nativeSourceDimensions'].values())>=1400 for x in selected)
 digest=hashlib.sha256(json.dumps([x['id'] for x in selected],separators=(',',':')).encode()).hexdigest()
 h=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B11_20261029.html').read_text()
 embedded=json.dumps(selected,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 h,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+embedded+m.group(2),h,count=1,flags=re.S)
 assert n==1
 h,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',h,count=1)
 assert n==1
 h=re.sub(r'<title>.*?</title>','<title>Ad Orientem | Sacred Art Batch 11 — 250 Baroque Paintings</title>',
  h,count=1,flags=re.S)
 h=h.replace('Baroque Sacred Art · Batch 11 (public-domain images)','Sacred Art · Batch 11 · 250 public-domain paintings')
 assert "batchId:'B11'" in h and 'const PAGE_SIZE=50;' in h
 HTML.write_text(h,encoding='utf8')
 counts={'sourceReviewPass1':224,'sourceReviewPass2':183,
 'sourceVerifiedUniqueFileUnion':274,'finalGalleryCards':250,
 'recordExclusions':len(removed),'previousReviewIDsExcluded':1705,
 'nativeOriginalsDownloaded':0,'productionImports':0,'additionalWikimediaRequests':0,
 'sourceRateLimitedNewRequests':105,'finalImageValidationErrors':0}
 out={'schema':'AO_B11_COMMONS_250_FINAL_VERIFIED_MERGED_V1',
 'date':'2026-10-29','batchId':'B11','batchReady':True,'targetSize':250,
 'reviewedArtworkCount':250,'batchHash':digest,'counts':counts,
 'sourceCommits':{'first':OLD_COMMIT,'second':'188c55ff2d3c9926633bf5089ac11365b5e8de97'},
 'imageProof':'Each included image passed its own 2026-10-29 successful source-run JPEG/PNG header, Wikimedia image dimension, exact file PDM/CC0 fields and source link.',
 'rightsAndQualityLimits':'Proven image licence and dimensions do not certify artwork identity, historical attribution, frame-free composition, native colour or aesthetic worth. User selection and native QA remain mandatory.',
 'excludedFileRecords':removed,'rows':selected}
 OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 QA.write_text('# Batch 11 — finalized 250 verified photographs\n\n'
 f"From first verified 224-card run and second 183-card run, **274 unique photographs** passed source-header checks; "
 f"**250** selected after {len(removed)} metadata-quality or subject duplicate suppressions. "
 f"No additional Wikimedia requests due 429 backoff. The 105 rate-limited images never qualify from the second run.\n\n"
 'All files retain exact Public Domain/CC0 licence, original Wikimedia source, dimensions >= 1400px shortest side and file-level source metadata. '
 'Previous 1705 user reviewed source IDs excluded; old work/artist comparison retained. '
 'No photograph originals downloaded, no production changes, no fee.\n\n'
 'Photo source and width verification do not certify framelessness, faithful colour, original attribution, or aesthetic standards. '
 'The user must still make each artwork choice; zero imported by this work.\n\n'
 f'Full Batch 11 source hash: {digest}.\n',encoding='utf8')
 print('B11_MERGED_FINAL',json.dumps({'counts':counts,'batchHash':digest,
  'suppressed':removed[:12],'first':[(x['title'],x['artist']) for x in selected[:12]]},ensure_ascii=False)[:5000],flush=True)
if __name__=='__main__':main()

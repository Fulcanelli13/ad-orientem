#!/usr/bin/env python3
"""CL2: exact-ID source-level merge, independently checked and NOT public Find output.

Python stdlib only. Own the portable SQLite + partitioned GitHub-research JSON
snapshots; no source workbook, public geometry, or Mass times modification.
"""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
import hashlib, json, re, sqlite3
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

B98_SHA='848fb2fcadda58b1c22bc02e83a019bfab6947d8bddf86eb3cdfa4021bf05c77'
B100_SHA='a1cff3569dcb4b449dd7f4f8f694a3328a1266d26fdf5b8b0f59f71f4e83bdb0'
CL1_SHA='b8a1b6250fc624a032244b64fa1726615ef3de33ec627e1454298fe8a9f4995a'
B99_PATCH_SHA='dae8677a34d8eede565ab33861d224f45f3482116fe34fa74756058c5c8c4f73'
B100_PATCH_SHA='87acf52f4f64190165771d70d8a6ddb55f905b8b233cbfbcf5975cc393af7dce'
NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

def check(ok,msg):
    if not ok: raise ValueError(msg)

def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def col(s):
    x=re.match(r'^[A-Z]+',s)
    check(x is not None, 'Invalid cell address '+repr(s))
    n=0
    for c in x.group():n=n*26+ord(c)-64
    return n-1

def xlsx(path, specs):
    """Read XML without rewriting XLSX; no formulas in operational source."""
    out={}
    with ZipFile(path) as z:
        check(z.testzip() is None,'Corrupt input XLSX')
        names=[s.get('name') for s in ET.fromstring(z.read('xl/workbook.xml')).findall('.//'+NS+'sheet')]
        ss=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            ss=[''.join(t.text or '' for t in si.iter(NS+'t')) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        for name,(count,width) in specs.items():
            check(names.count(name)==1,'Expected one sheet '+name)
            data=ET.fromstring(z.read('xl/worksheets/sheet'+str(names.index(name)+1)+'.xml')).find('.//'+NS+'sheetData')
            rows=[]
            for row in data:
                fields=['']*width
                for c in row:
                    ix=col(c.attrib['r'])
                    check(ix<width,f'{name} unexpected column {ix}')
                    check(c.find(NS+'f') is None,'Formula in '+name)
                    t=c.find(NS+'is');v=c.find(NS+'v')
                    value=''.join(n.text or '' for n in t.iter(NS+'t')) if t is not None else (v.text or '' if v is not None else '')
                    if c.attrib.get('t')=='s':value=ss[int(value)]
                    fields[ix]=value
                rows.append(fields)
            check(len(rows)==count+1,f'{name} wrong row count {len(rows)}')
            check(len(set(rows[0]))==width,'Nonunique '+name+' headers')
            out[name]=rows
    return out

def rows_unique(rows,colnum,title):
    ids=[r[colnum] for r in rows]
    check(all(ids),title+' blank ID')
    check(len(set(ids))==len(ids),title+' duplicate ID')
    return ids

def compact_chunks(rows,subdir,stem,max_bytes=445_000):
    """Produce reproducible GitHub-friendly full-data partitions, not summaries."""
    subdir.mkdir(parents=True,exist_ok=True)
    for stale in subdir.glob(stem+'-*-of-*.json'): stale.unlink()
    chunks=[];current=[];length=0
    for record in rows:
        encoded=json.dumps(record,ensure_ascii=False,separators=(',',':'))
        n=len(encoded.encode('utf-8'))+2
        check(n<=max_bytes,'Oversized record '+stem)
        if current and length+n>max_bytes:
            chunks.append(current);current=[];length=0
        current.append(record);length+=n
    if current:chunks.append(current)
    result=[]
    for i,piece in enumerate(chunks,1):
        filename=f'{stem}-{i:02d}-of-{len(chunks):02d}.json'
        file=subdir/filename
        file.write_text(json.dumps({'schema':'AO_CL2_MERGED_RESEARCH_V1','table':stem,'part':i,'parts':len(chunks),'records':piece},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
        result.append({'path':filename,'rows':len(piece),'sha256':sha(file),'bytes':file.stat().st_size})
        check(file.stat().st_size<500_000,'Part too large '+filename)
    return result

def main(args):
    b98,b100,cl,b99_patch,b100_patch=map(Path,[args.b98,args.b100,args.classification,args.b99_patch,args.b100_patch])
    for p,expected in [(b98,B98_SHA),(b100,B100_SHA),(cl,CL1_SHA),(b99_patch,B99_PATCH_SHA),(b100_patch,B100_PATCH_SHA)]:
        check(sha(p)==expected,'Wrong source SHA: '+str(p))
    old=xlsx(b98,{'CANONICAL SITES':(2584,10),'PHYSICAL SITES':(2584,15),'UNIFIED VENUES':(2687,37),'MASS TIMES':(4681,28),'B91 EFFECTIVE SITES':(2584,5),'B91 ALIAS LINKS':(5,7)})
    updated=xlsx(b100,{'CANONICAL SITES':(2584,10),'PHYSICAL SITES':(2584,15)})
    clj=json.loads(cl.read_text(encoding='utf-8'))
    cols=clj['columns'];classrows=clj['data']
    assert cols[0]=='source_id' and cols[1]=='historical_group_id'
    check(len(classrows)==2715,'CL1 row count')
    rows_unique(classrows,0,'CL1')
    canonical=updated['CANONICAL SITES'][1:];physical=updated['PHYSICAL SITES'][1:]
    sources=old['UNIFIED VENUES'][1:];mass=old['MASS TIMES'][1:]
    effective=old['B91 EFFECTIVE SITES'][1:];alias=old['B91 ALIAS LINKS'][1:]
    idc=rows_unique(canonical,0,'canonical');idp=rows_unique(physical,0,'physical')
    check(idc==idp,'Physical IDs disagree with canonical IDs')
    ids=rows_unique(sources,0,'venue source')
    check(len(mass)==4681,'Mass times mutated')
    check(sum(x[19]=='VERIFIED' for x in mass)==3347,'Verified schedule state changed')
    check(len(effective)==2584 and len(alias)==5,'Alias/effective rows changed')
    check([x[0] for x in effective]==idc,'Effective IDs mismatch')
    for name,field in [('CANONICAL SITES',3),('PHYSICAL SITES',5)]:
        a,b=old[name][1:],updated[name][1:]
        for x,y in zip(a,b):
            check(x[0]==y[0],name+' ID changed')
            check(all(x[i]==y[i] for i in range(len(x)) if i!=field),name+' non-location values changed at '+x[0])
    changes_can=sum(a[3]!=b[3] for a,b in zip(old['CANONICAL SITES'][1:],canonical))
    changes_phy=sum(a[5]!=b[5] for a,b in zip(old['PHYSICAL SITES'][1:],physical))
    check(changes_can==changes_phy==693,'Expected exact B99+B100 backfills')
    check(sum(not r[3] for r in canonical)==113,'Expected 113 missing descriptions')
    b99j=json.loads(b99_patch.read_text());b100j=json.loads(b100_patch.read_text())
    backfill={}
    for x in b99j['patches']:
        g=x['g'];check(g not in backfill,'Duplicate B99 patch')
        backfill[g]={'tier':'B99_'+x['type'],'url':x['url'],'description':x['text'],'source_id':x['src']}
    for x in b100j['patches']:
        g=x['group_id'];check(g not in backfill,'Overlapping B99+B100 backfill')
        backfill[g]={'tier':'B100_'+x['decision'],'url':x['evidence_url'],'description':x['new_physical_description'],'source_id':x['source_id']}
    check(len(backfill)==693,'Backfill ledger count')
    for row in canonical:
        if row[0] in backfill:
            check(row[3]==backfill[row[0]]['description'],'Backfill row text mismatch '+row[0])

    canmap={r[0]:r for r in canonical};phymap={r[0]:r for r in physical}
    effmap={r[0]:r[1] for r in effective}
    check(len(set(effmap.values()))==2579,'Effective physical anchor count')
    aliases={r[0]:r[1] for r in alias}
    cls_by={r[0]:r for r in classrows};venues_by={r[0]:r for r in sources}
    source_overlap=set(cls_by)&set(venues_by)
    mismatch=[(s,cls_by[s][1],venues_by[s][34]) for s in source_overlap if cls_by[s][1]!=venues_by[s][34]]
    missing_class=sorted(set(venues_by)-set(cls_by))
    missing_venue=sorted(set(cls_by)-set(venues_by))
    check((len(source_overlap),len(mismatch),len(missing_venue),len(missing_class))==(2679,5,36,8),'ID coverage changed')
    unanchored=[s for s,v in venues_by.items() if v[34] not in canmap]
    check(len(unanchored)==5 and set(unanchored)==set(s for s,_,_ in mismatch),'Unrecognized source-to-group anomaly')
    exact_links=len(source_overlap)-len(mismatch)
    mismatch_ids={x[0] for x in mismatch}
    owner_verified=[r for r in classrows if r[cols.index('accepted_missal_edition')]=='1962']
    check(len(owner_verified)==3,'Unexpected 1962 witness count')
    check(all(r[cols.index('una_cum_original')]=='UNKNOWN' for r in classrows),'Unexpected Una Cum assertion')
    enriched=[r for r in classrows if r[cols.index('institutional_evidence_url')]]
    check(len(enriched)==200,'Institutional provenance count')
    site_rows=[]
    for c in canonical:
        g=c[0];p=phymap[g]
        site_rows.append({'group_id':g,'effective_anchor_id':effmap[g],
          'canonical':c,'physical':p,'location_backfill':backfill.get(g),
          'site_state':'RESEARCH_ONLY_NOT_PUBLIC',
          'classification_policy':'MINISTRY_OR_CELEBRATION_ONLY_NOT_A_VENUE_ATTRIBUTE'})
    venue_rows=[]
    for v in sources:
        s=v[0];c=cls_by.get(s)
        status='NO_CLASSIFICATION_SOURCE' if c is None else 'GROUP_CONFLICT_HOLD' if s in mismatch_ids else 'JOINED_EXACT_SOURCE_AND_GROUP'
        venue_rows.append({'source_id':s,'research_group_id':v[34],
           'source_record':v,'classification_source_record':c,
           'classification_merge_state':status,
           'release':'RESEARCH_ONLY_NEVER_AUTO_PUBLISH'})
    orphans=[{'source_id':s,'classification_source_record':cls_by[s],
      'group_id':cls_by[s][1],'merge_state':'CLASSIFICATION_ONLY_NO_B98_PHYSICAL_SOURCE'} for s in missing_venue]
    mass_rows=[{'historical_row':i+1,'original_row':r} for i,r in enumerate(mass)]
    issues=[]
    # Full prior exact claims are in CL1 patch. They are not auto-approved.
    excj=json.loads(Path(args.classification_patch).read_text(encoding='utf-8'))
    exception_list=excj['cross_master_identity_exceptions']
    check(len(exception_list)==44,'Expected 44 lineage exceptions')
    for x in exception_list:
        issues.append({'kind':'GROUP_MEMBERSHIP_DIFFERENCE','item':x})
    for sid,cg,vg in sorted(mismatch):
        issues.append({'kind':'EXACT_SOURCE_ID_GROUP_CONFLICT','source_id':sid,'classification_group_id':cg,'venue_group_id':vg,
          'action':'HOLD_BOTH_HISTORICAL_GROUP_IDS_VERIFY_ORIGINAL_LINEAGE'})
    assert len(issues)==49
    out=Path(args.outdir);out.mkdir(parents=True,exist_ok=True)
    snapshot=out/'github-research-snapshot';snapshot.mkdir(exist_ok=True)
    inventory={}
    for stem,items in [('site',site_rows),('venue',venue_rows),('mass',mass_rows),('classification_orphan',orphans),('identity_issue',issues)]:
        inventory[stem]=compact_chunks(items,snapshot,stem)
    manifest={
       'schema':'AO_CL2_SINGLE_RESEARCH_MASTER_V1','created_on':'2026-10-26',
       'status':'RESEARCH_ONLY_NOT_PUBLIC_NO_RUNTIME_IMPORT',
       'source_digests':{'b98_full_operational_xlsx':B98_SHA,'b100_updated_site_tables_xlsx':B100_SHA,
        'cl1_complete_classification_json':CL1_SHA,'b99_location_patch':B99_PATCH_SHA,'b100_location_patch':B100_PATCH_SHA},
       'count':{'historical_site_ids':2584,'effective_physical_sites':2579,'historical_same_building_aliases':5,
         'venue_sources':2687,'mass_times_unchanged':4681,'historical_verified_schedule_states_unchanged':3347,
         'classification_source_rows':2715,'joined_by_exact_source_id':len(source_overlap),
         'joined_exact_source_and_group_id':exact_links,'same_source_conflicting_group_id':len(mismatch),
         'venue_sources_with_unanchored_original_group_id':len(unanchored),
         'classification_only_unadmitted_source_rows':len(missing_venue),
         'location_only_without_classification_source':len(missing_class),
         'cross_master_site_id_exceptions':44,'full_lineage_exception_queue_including_group_conflicts':len(issues),
         'physical_descriptions_filled_since_b98':changes_can,'physical_descriptions_still_blank':113,
         'institutional_provenance_urls':200,'direct_owner_1962_witnesses':3,
         'una_cum_venue_or_celebration_assertions_imported':0,
         'new_public_pins':0,'new_verified_mass_schedules':0},
       'source_columns':{k:v[0] for k,v in old.items()},
       'classification_columns':cols,
       'shards':inventory,
       'source_of_truth_policy':'All rows are preserved by exact source/group ID. Five classification/venue group conflicts are held, not overwritten. 36 classification-only source records remain unadmitted and eight location-only sources retain UNKNOWN classification. No Mass schedules imported into the public Directory.',
       'build_command':'python3 tools/directory/build-cl2-unified-research-master.py --b98 <B98.xlsx> --b100 <B100.xlsx> --classification <CL1.json> --classification-patch <CL1_patch.json> --b99-patch <B99_patch.json> --b100-patch <B100_patch.json> --outdir <output>'}
    (snapshot/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

    path=out/'Ad_Orientem_CL2_Unified_Research_Register_2026-10-26.sqlite'
    if path.exists():path.unlink()
    db=sqlite3.connect(path)
    db.executescript('''PRAGMA foreign_keys=ON;
CREATE TABLE canonical_site (group_id TEXT PRIMARY KEY,effective_anchor_id TEXT NOT NULL,country TEXT NOT NULL,name TEXT NOT NULL,physical_description TEXT NOT NULL,backfill_tier TEXT,backfill_source TEXT,canonical_json TEXT NOT NULL,physical_json TEXT NOT NULL,release TEXT NOT NULL);
CREATE TABLE venue_source (source_id TEXT PRIMARY KEY,recorded_group_id TEXT NOT NULL,joined_canonical_group_id TEXT,source_json TEXT NOT NULL,classification_merge_state TEXT NOT NULL,FOREIGN KEY(joined_canonical_group_id) REFERENCES canonical_site(group_id));
CREATE TABLE classification_source (source_id TEXT PRIMARY KEY,group_id TEXT NOT NULL,source_json TEXT NOT NULL,join_state TEXT NOT NULL,owner_verified_missal_1962 INTEGER NOT NULL DEFAULT 0);
CREATE TABLE mass_time (row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,group_id TEXT,original_json TEXT NOT NULL);
CREATE TABLE existing_alias (alias_group_id TEXT PRIMARY KEY,anchor_group_id TEXT NOT NULL,original_json TEXT NOT NULL,FOREIGN KEY(alias_group_id) REFERENCES canonical_site(group_id),FOREIGN KEY(anchor_group_id) REFERENCES canonical_site(group_id));
CREATE TABLE identity_exception (exception_id INTEGER PRIMARY KEY,kind TEXT NOT NULL,source_id TEXT,group_id TEXT,details_json TEXT NOT NULL);
CREATE TABLE source_meta (key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE INDEX class_group ON classification_source(group_id);
CREATE INDEX source_group ON venue_source(joined_canonical_group_id);
CREATE INDEX mass_source ON mass_time(source_id);
CREATE VIEW venue_with_classification AS SELECT v.source_id,v.recorded_group_id,v.joined_canonical_group_id,v.classification_merge_state,COALESCE(c.join_state,'NO_CLASSIFICATION_SOURCE') AS classification_status,v.source_json,c.source_json AS classification_json FROM venue_source v LEFT JOIN classification_source c ON c.source_id=v.source_id;
''')
    for rec in site_rows:
        c,p=rec['canonical'],rec['physical'];meta=rec['location_backfill'] or {}
        db.execute('INSERT INTO canonical_site VALUES (?,?,?,?,?,?,?,?,?,?)',(rec['group_id'],rec['effective_anchor_id'],c[1],c[2],c[3],meta.get('tier'),meta.get('url'),json.dumps(c,ensure_ascii=False),json.dumps(p,ensure_ascii=False),'RESEARCH_ONLY_NOT_PUBLIC'))
    for rec in venue_rows:
        db.execute('INSERT INTO venue_source VALUES (?,?,?,?,?)',(rec['source_id'],rec['research_group_id'],rec['research_group_id'] if rec['research_group_id'] in canmap and rec['classification_merge_state']!='GROUP_CONFLICT_HOLD' else None,json.dumps(rec['source_record'],ensure_ascii=False),rec['classification_merge_state']))
    for c in classrows:
        sid=c[0]
        status='CLASSIFICATION_ONLY_NO_B98_SOURCE' if sid in missing_venue else 'SOURCE_GROUP_CONFLICT_HOLD' if sid in mismatch_ids else 'JOINED_EXACT_SOURCE_AND_GROUP'
        verified=int(c[cols.index('accepted_missal_edition')]=='1962')
        db.execute('INSERT INTO classification_source VALUES (?,?,?,?,?)',(sid,c[1],json.dumps(c,ensure_ascii=False),status,verified))
    for i,r in enumerate(mass,1):
        db.execute('INSERT INTO mass_time VALUES (?,?,?,?)',(i,r[1],r[26],json.dumps(r,ensure_ascii=False)))
    for row in alias:db.execute('INSERT INTO existing_alias VALUES (?,?,?)',(row[0],row[1],json.dumps(row,ensure_ascii=False)))
    for i,r in enumerate(issues,1):
        x=r.get('item') or r
        db.execute('INSERT INTO identity_exception VALUES (?,?,?,?,?)',(i,r['kind'],x.get('source_id'),x.get('group_id'),json.dumps(r,ensure_ascii=False)))
    for k,v in manifest['count'].items():db.execute('INSERT INTO source_meta VALUES (?,?)',(k,str(v)))
    db.commit()
    check(db.execute('SELECT COUNT(*) FROM venue_with_classification').fetchone()[0]==2687,'SQL view missing records')
    check(db.execute('SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1').fetchone()[0]==3,'SQL missal wrong')
    check(db.execute('PRAGMA integrity_check').fetchone()[0]=='ok','Database corrupt')
    for tbl,expected in [('canonical_site',2584),('venue_source',2687),('classification_source',2715),('mass_time',4681),('existing_alias',5),('identity_exception',49)]:
        check(db.execute('SELECT COUNT(*) FROM '+tbl).fetchone()[0]==expected,'SQLite count '+tbl)
    db.close()
    manifest['sqlite_sha256']=sha(path)
    manifest['sqlite_bytes']=path.stat().st_size
    (snapshot/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    report=out/'Ad_Orientem_CL2_Merge_Integrity_Report_2026-10-26.json'
    report.write_text(json.dumps({'result':'PASS','manifest':manifest,'source_conflict_ids':mismatch,'classification_only_sources':missing_venue,'venue_without_classification_sources':missing_class},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'status':'PASS','master_sqlite':str(path),'sqlite_bytes':path.stat().st_size,'part_counts':{k:len(v) for k,v in inventory.items()},'total_part_files':sum(map(len,inventory.values())),'source_links':len(source_overlap),'exact_group_links':exact_links,'conflicts':len(mismatch),'site_backfills':changes_can,'classification_orphans':len(missing_venue),'new_missal_source_cert':3,'outdir':str(out)},indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--b98',default='/mnt/data/Ad_Orientem_B98_Consolidated_Research_Operational_Core_2026-10-26.xlsx')
    p.add_argument('--b100',default='/mnt/data/Ad_Orientem_B100_Bulk_Location_Repairs_2026-10-26.xlsx')
    p.add_argument('--classification',default='/mnt/data/Ad_Orientem_CL1_Full_2715_Source_Classifications_Compact_2026-10-26.json')
    p.add_argument('--classification-patch',default='/mnt/data/Ad_Orientem_Classification_CL1_200_Actual_Source_Enrichment_Patch_2026-10-26.json')
    p.add_argument('--b99-patch',default='/mnt/data/Ad_Orientem_B99_590_Operational_Backfill_Patch_2026-10-26.json')
    p.add_argument('--b100-patch',default='/mnt/data/b100_actual_103_source_patches.json')
    p.add_argument('--outdir',default='/mnt/data/cl2_unified')
    main(p.parse_args())
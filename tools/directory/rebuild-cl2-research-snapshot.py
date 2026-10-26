#!/usr/bin/env python3
"""Reconstruct a *research-only* queryable CL2 SQLite from checked GitHub JSON parts.

The snapshot provides complete frozen site/source/Mass/classification rows;
no private source workbook is required once the shards are checked out.
Never writes application provider JSON or publishes map pins/schedules.
"""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3

EXPECTED={
  'site':2584,'venue':2687,'mass':4681,
  'classification_orphan':36,'identity_issue':49,
}

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--snapshot-dir',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    root=args.snapshot_dir
    manifest=json.loads((root/'manifest.json').read_text())
    assert manifest['schema']=='AO_CL2_SINGLE_RESEARCH_MASTER_V1'
    assert manifest['status']=='RESEARCH_ONLY_NOT_PUBLIC_NO_RUNTIME_IMPORT'
    rows={}
    for table,n in EXPECTED.items():
        chunks=manifest['shards'][table]
        data=[]
        for i,part in enumerate(chunks,1):
            f=root/part['path']
            assert sha256(f)==part['sha256'],f'{f} SHA mismatch'
            assert f.stat().st_size==part['bytes'],f'{f} size mismatch'
            chunk=json.loads(f.read_text())
            assert chunk['table']==table and chunk['part']==i and chunk['parts']==len(chunks)
            assert len(chunk['records'])==part['rows']
            data.extend(chunk['records'])
        assert len(data)==n,(table,len(data),n)
        rows[table]=data
    assert manifest['count']['mass_times_unchanged']==4681
    assert manifest['count']['historical_verified_schedule_states_unchanged']==3347
    assert sum(x['original_row'][19]=='VERIFIED' for x in rows['mass'])==3347
    assert len({x['group_id'] for x in rows['site']})==2584
    assert len({x['source_id'] for x in rows['venue']})==2687
    assert sum(x['classification_merge_state']=='GROUP_CONFLICT_HOLD' for x in rows['venue'])==5
    assert sum(x['classification_merge_state']=='NO_CLASSIFICATION_SOURCE' for x in rows['venue'])==8
    assert sum(x['classification_merge_state']=='JOINED_EXACT_SOURCE_AND_GROUP' for x in rows['venue'])==2674
    assert sum(bool(x['location_backfill']) for x in rows['site'])==693
    assert sum(not x['canonical'][3] for x in rows['site'])==113
    assert all(x['site_state']=='RESEARCH_ONLY_NOT_PUBLIC' for x in rows['site'])
    assert all(x['release']=='RESEARCH_ONLY_NEVER_AUTO_PUBLISH' for x in rows['venue'])
    assert not any(x['physical'][12] for x in rows['site'] if x['location_backfill'])

    venue_class=[r['classification_source_record'] for r in rows['venue'] if r['classification_source_record']]
    orphan_class=[r['classification_source_record'] for r in rows['classification_orphan']]
    class_rows=venue_class+orphan_class
    assert len(class_rows)==2715
    assert len({r[0] for r in class_rows})==2715
    class_cols=manifest['classification_columns']
    owner_i=class_cols.index('accepted_missal_edition')
    assert sum(r[owner_i]=='1962' for r in class_rows)==3
    assert all(r[class_cols.index('una_cum_original')]=='UNKNOWN' for r in class_rows)
    assert sum(bool(r[class_cols.index('institutional_evidence_url')]) for r in class_rows)==200
    assert len({r['effective_anchor_id'] for r in rows['site']})==2579

    output=args.output;output.parent.mkdir(parents=True,exist_ok=True)
    if output.exists(): raise ValueError('Output already exists: refusing to overwrite')
    db=sqlite3.connect(output)
    db.executescript('''PRAGMA foreign_keys=ON;
CREATE TABLE canonical_site (group_id TEXT PRIMARY KEY,effective_anchor_id TEXT NOT NULL,country TEXT NOT NULL,name TEXT NOT NULL,physical_description TEXT NOT NULL,backfill_tier TEXT,backfill_source TEXT,canonical_json TEXT NOT NULL,physical_json TEXT NOT NULL,release TEXT NOT NULL);
CREATE TABLE venue_source (source_id TEXT PRIMARY KEY,recorded_group_id TEXT NOT NULL,joined_canonical_group_id TEXT,source_json TEXT NOT NULL,classification_merge_state TEXT NOT NULL,FOREIGN KEY(joined_canonical_group_id) REFERENCES canonical_site(group_id));
CREATE TABLE classification_source (source_id TEXT PRIMARY KEY,group_id TEXT NOT NULL,source_json TEXT NOT NULL,join_state TEXT NOT NULL,owner_verified_missal_1962 INTEGER NOT NULL DEFAULT 0);
CREATE TABLE mass_time (row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,group_id TEXT,original_json TEXT NOT NULL);
CREATE TABLE existing_alias (alias_group_id TEXT PRIMARY KEY,anchor_group_id TEXT NOT NULL,FOREIGN KEY(alias_group_id) REFERENCES canonical_site(group_id),FOREIGN KEY(anchor_group_id) REFERENCES canonical_site(group_id));
CREATE TABLE identity_exception (exception_id INTEGER PRIMARY KEY,kind TEXT NOT NULL,source_id TEXT,group_id TEXT,details_json TEXT NOT NULL);
CREATE INDEX class_group ON classification_source(group_id);
CREATE INDEX source_group ON venue_source(joined_canonical_group_id);
CREATE INDEX mass_source ON mass_time(source_id);
CREATE VIEW venue_with_classification AS SELECT v.source_id,v.recorded_group_id,v.joined_canonical_group_id,v.classification_merge_state,COALESCE(c.join_state,'NO_CLASSIFICATION_SOURCE') AS classification_status,v.source_json,c.source_json AS classification_json FROM venue_source v LEFT JOIN classification_source c ON c.source_id=v.source_id;
''')
    json_text=lambda value:json.dumps(value,ensure_ascii=False,separators=(',',':'))
    ids={r['group_id'] for r in rows['site']}
    for r in rows['site']:
        c=r['canonical'];meta=r['location_backfill'] or {}
        db.execute('INSERT INTO canonical_site VALUES (?,?,?,?,?,?,?,?,?,?)',(r['group_id'],r['effective_anchor_id'],c[1],c[2],c[3],meta.get('tier'),meta.get('url'),json_text(c),json_text(r['physical']),r['site_state']))
    for r in rows['venue']:
        g=r['research_group_id'];joined=g if g in ids and r['classification_merge_state']!='GROUP_CONFLICT_HOLD' else None
        db.execute('INSERT INTO venue_source VALUES (?,?,?,?,?)',(r['source_id'],g,joined,json_text(r['source_record']),r['classification_merge_state']))
    for r in class_rows:
        sid=r[0];v=next((x for x in rows['venue'] if x['source_id']==sid),None)
        status='CLASSIFICATION_ONLY_NO_B98_SOURCE' if v is None else 'SOURCE_GROUP_CONFLICT_HOLD' if v['classification_merge_state']=='GROUP_CONFLICT_HOLD' else 'JOINED_EXACT_SOURCE_AND_GROUP'
        db.execute('INSERT INTO classification_source VALUES (?,?,?,?,?)',(sid,r[1],json_text(r),status,int(r[owner_i]=='1962')))
    for r in rows['mass']:
        m=r['original_row'];db.execute('INSERT INTO mass_time VALUES (?,?,?,?)',(r['historical_row'],m[1],m[26],json_text(m)))
    for r in rows['site']:
        if r['group_id']!=r['effective_anchor_id']:
            db.execute('INSERT INTO existing_alias VALUES (?,?)',(r['group_id'],r['effective_anchor_id']))
    for i,r in enumerate(rows['identity_issue'],1):
        x=r.get('item') or r
        db.execute('INSERT INTO identity_exception VALUES (?,?,?,?,?)',(i,r['kind'],x.get('source_id'),x.get('group_id'),json_text(r)))
    db.commit()
    assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    for table,expected in [('canonical_site',2584),('venue_source',2687),('classification_source',2715),('mass_time',4681),('existing_alias',5),('identity_exception',49)]:
        assert db.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==expected
    db.close()
    print(json.dumps({'status':'PASS','output':str(output),'bytes':output.stat().st_size,'source_parts':sum(len(v) for v in manifest['shards'].values()),'source_rows':2687,'classification_rows':2715,'alias_count':5,'held_group_conflicts':5,'public_changes':0}))

if __name__=='__main__': main()
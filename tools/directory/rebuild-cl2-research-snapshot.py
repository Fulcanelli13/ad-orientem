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
import re
import unicodedata

EXPECTED={
  'site':2584,'venue':2687,'mass':4681,
  'classification_orphan':36,'identity_issue':49,
}

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()




def install_existing_g0_candidates_into_single_master(db):
    """Stage already-committed B84-B90 research leads IN CL2, not a new master.

    A name collision is NOT deduplication and a source lead is NOT an admitted
    worship building. Preserve every frozen original ID until site identity
    evidence is reconciled. Geocoding and timetable enrichment are out of scope.
    """
    path=Path('data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json')
    d=json.loads(path.read_text(encoding='utf-8'))
    assert d['schema']=='AO_DIRECTORY_CANONICAL_G0_RESEARCH_VENUE_ADMISSIONS_V1'
    assert d['record_count']==36 and len(d['records'])==36
    assert d['by_batch']=={'B84':11,'B85':2,'B86':9,'B87':9,'B88':1,'B89':2,'B90':2}
    normalize=lambda v:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',
        str(v or '')).encode('ascii','ignore').decode('ascii').lower())
    existing=set(x[0] for x in db.execute('SELECT group_id FROM canonical_site'))
    existing_names={}
    for x in db.execute('SELECT group_id,country,name FROM canonical_site'):
        existing_names.setdefault((x[1],normalize(x[2])),[]).append(x[0])
    db.executescript("""
CREATE TABLE unified_site_candidate (
 candidate_research_id TEXT PRIMARY KEY, source_batch TEXT NOT NULL,
 country TEXT NOT NULL, locality TEXT NOT NULL, name TEXT NOT NULL,
 source_physical_description TEXT NOT NULL,
 liturgical_source_url TEXT NOT NULL, building_source_url TEXT NOT NULL,
 related_existing_provider_id TEXT,
 same_name_country_count INTEGER NOT NULL,
 reconciliation_status TEXT NOT NULL CHECK(reconciliation_status='IDENTITY_RECONCILIATION_REQUIRED'),
 is_canonical_physical_site INTEGER NOT NULL DEFAULT 0 CHECK(is_canonical_physical_site=0),
 is_public_site INTEGER NOT NULL DEFAULT 0 CHECK(is_public_site=0),
 source_json TEXT NOT NULL
);
CREATE INDEX candidate_country ON unified_site_candidate(country);
CREATE VIEW unified_research_inventory AS
 SELECT anchor_id AS stable_id,country,name,'ADMITTED_PHYSICAL_ANCHOR' AS kind
 FROM unified_physical_site
 UNION ALL
 SELECT candidate_research_id AS stable_id,country,name,'CANDIDATE_IDENTITY_UNRESOLVED' AS kind
 FROM unified_site_candidate;
""")
    assert len({x['research_group_id'] for x in d['records']})==36
    assert not any(x['research_group_id'] in existing for x in d['records'])
    collisions=0
    for x in d['records']:
        assert x['batch'] in d['by_batch']
        assert x['admission_status']=='G0_RESEARCH_ONLY'
        assert x['map_publication']=='NOT_PUBLISHED'
        assert x['scheduled_mass_status']=='UNVERIFIED_NOT_IMPORTED'
        matches=existing_names.get((x['cc'],normalize(x['name'])),[])
        collisions+=bool(matches)
        db.execute('INSERT INTO unified_site_candidate VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,?)',
          (x['research_group_id'],x['batch'],x['cc'],x['locality'],x['name'],
           x['physical_address'],x['liturgical_source_url'],x['building_source_url'],
           x.get('related_existing_provider_id'),len(matches),
           'IDENTITY_RECONCILIATION_REQUIRED',
           json.dumps(x,ensure_ascii=False,separators=(',',':'))))
    assert collisions==4
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate').fetchone()[0]==36
    assert db.execute("SELECT COUNT(*) FROM unified_site_candidate WHERE related_existing_provider_id IS NOT NULL").fetchone()[0]==2
    assert db.execute('SELECT COUNT(*) FROM unified_research_inventory').fetchone()[0]==2615
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate WHERE is_canonical_physical_site!=0 OR is_public_site!=0').fetchone()[0]==0
    return {'candidate_leads_staged':36, 'candidate_ids_not_equal_to_CL2_canonical_ids':36,
            'name_country_collision_hints_not_identity_joins':collisions,
            'existing_provider_link_hints':2, 'approved_new_physical_sites':0,
            'research_inventory_rows_with_unresolved_candidates':2615}




def install_known_provider_feed_census(db):
    """Audit all entries in four committed venue feeds against ONE CL2 master.

    Feed records may be residences or administrative sites; no candidate is
    promoted to a physical church solely because its source ID is unlinked.
    Original provider IDs are preserved, never renumbered.
    """
    feeds=(
        ('FSSP','data/directory/generated/fssp/geo.v1.geojson','GEOJSON'),
        ('ICKSP','data/directory/generated/v19/icksp-federated.geojson','GEOJSON'),
        ('AASJMV','data/directory/generated/v19/aasjmv.v1.json','PROVIDER_JSON'),
        ('VG19','data/directory/generated/v19/verified-global-round19-20261010.v1.json','PROVIDER_JSON'),
        ('SSPX_FR','data/directory/generated/v19/sspx-france-first-party.v1.json','PROVIDER_JSON'),
        ('DIOCESAN','data/directory/generated/v19/diocesan.v1.json','PROVIDER_JSON'),
    )
    eligible={'church','chapel','school_chapel','private_chapel','basilica','oratory','monastery','shrine'}
    db.executescript("""
CREATE TABLE unified_provider_coverage (
 source_family TEXT NOT NULL,
 provider_record_id TEXT NOT NULL,
 country TEXT NOT NULL, name TEXT NOT NULL, venue_type TEXT NOT NULL,
 source_repository_path TEXT NOT NULL,
 identity_disposition TEXT NOT NULL CHECK(identity_disposition IN (
   'EXACT_FROZEN_CL2_SOURCE_ID',
   'EXPLICIT_EXISTING_G0_PROVIDER_LINK_NOT_NEW_SITE',
   'WORSHIP_SOURCE_ID_UNMATCHED_CANDIDATE',
   'NON_WORSHIP_OR_AMBIGUOUS_SOURCE_ID_UNMATCHED'
 )),
 frozen_cl2_source_id TEXT, existing_g0_candidate_id TEXT,
 new_candidate_id TEXT,
 full_original_record_json TEXT NOT NULL,
 PRIMARY KEY(source_family,provider_record_id),
 FOREIGN KEY(frozen_cl2_source_id) REFERENCES venue_source(source_id),
 FOREIGN KEY(existing_g0_candidate_id) REFERENCES unified_site_candidate(candidate_research_id),
 FOREIGN KEY(new_candidate_id) REFERENCES unified_site_candidate(candidate_research_id)
);
CREATE INDEX unified_provider_census_disposition ON unified_provider_coverage(identity_disposition);
CREATE VIEW unified_provider_census_by_family AS
 SELECT source_family,COUNT(*) AS entries,
        SUM(identity_disposition='EXACT_FROZEN_CL2_SOURCE_ID') AS exact_CL2_ids,
        SUM(identity_disposition='EXPLICIT_EXISTING_G0_PROVIDER_LINK_NOT_NEW_SITE') AS prior_g0_links,
        SUM(identity_disposition='WORSHIP_SOURCE_ID_UNMATCHED_CANDIDATE') AS new_unresolved_worship_leads,
        SUM(identity_disposition='NON_WORSHIP_OR_AMBIGUOUS_SOURCE_ID_UNMATCHED') AS non_worship_or_ambiguous
 FROM unified_provider_coverage GROUP BY source_family;
""")
    existing={r[0] for r in db.execute('SELECT source_id FROM venue_source')}
    g0_provider_links={r[0]:r[1] for r in db.execute(
        'SELECT related_existing_provider_id,candidate_research_id FROM unified_site_candidate WHERE related_existing_provider_id IS NOT NULL')}
    assert len(g0_provider_links)==2
    stats={}
    for family,path,fmt in feeds:
        d=json.loads(Path(path).read_text(encoding='utf-8'))
        entries=d['features'] if fmt=='GEOJSON' else d['records']
        expected={'FSSP':286,'ICKSP':94,'AASJMV':6,'VG19':6,'SSPX_FR':89,'DIOCESAN':73}[family]
        assert len(entries)==expected
        seen=set()
        family_counts={'exact':0,'g0_link':0,'new_candidate':0,'not_worship_or_ambiguous':0}
        for entry in entries:
            properties=entry['properties'] if fmt=='GEOJSON' else entry
            rid=properties.get('venue_id') if fmt=='GEOJSON' else properties.get('u')
            kind=properties.get('venue_type') if fmt=='GEOJSON' else properties.get('vt')
            cc=properties.get('country_code') if fmt=='GEOJSON' else properties.get('cc')
            name=properties.get('name') if fmt=='GEOJSON' else properties.get('n')
            assert rid and rid not in seen and cc and name and kind
            seen.add(rid)
            already=rid in existing
            older=g0_provider_links.get(rid)
            if already:
                disposition='EXACT_FROZEN_CL2_SOURCE_ID'
                g0_id=None;candidate_id=None
                family_counts['exact']+=1
            elif older:
                disposition='EXPLICIT_EXISTING_G0_PROVIDER_LINK_NOT_NEW_SITE'
                g0_id=older;candidate_id=None
                family_counts['g0_link']+=1
            elif kind in eligible:
                disposition='WORSHIP_SOURCE_ID_UNMATCHED_CANDIDATE'
                g0_id=None;candidate_id=rid
                family_counts['new_candidate']+=1
                assert not db.execute('SELECT 1 FROM unified_site_candidate WHERE candidate_research_id=?',(rid,)).fetchone()
                # Provider listing alone establishes a site lead, not a newly
                # proven building or official rite/ownership statement.
                db.execute('INSERT INTO unified_site_candidate VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,?)',
                  (rid,'PROVIDER_'+family,cc,str(properties.get('city') or properties.get('l') or ''),
                   name,str(properties.get('a') or ''),
                   str(properties.get('su') or path),path,None,0,'IDENTITY_RECONCILIATION_REQUIRED',
                   json.dumps({'provider_family':family,'provider_original_record':entry,
                     'original_repository_path':path},ensure_ascii=False,separators=(',',':'))))
            else:
                disposition='NON_WORSHIP_OR_AMBIGUOUS_SOURCE_ID_UNMATCHED'
                g0_id=None;candidate_id=None
                family_counts['not_worship_or_ambiguous']+=1
            db.execute('INSERT INTO unified_provider_coverage VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                       (family,rid,cc,name,kind,path,disposition,
                        rid if already else None,g0_id,candidate_id,
                        json.dumps(entry,ensure_ascii=False,separators=(',',':'))))
        stats[family]=family_counts
    assert stats=={
        'FSSP':{'exact':225,'g0_link':0,'new_candidate':3,'not_worship_or_ambiguous':58},
        'ICKSP':{'exact':74,'g0_link':0,'new_candidate':9,'not_worship_or_ambiguous':11},
        'AASJMV':{'exact':6,'g0_link':0,'new_candidate':0,'not_worship_or_ambiguous':0},
        'VG19':{'exact':0,'g0_link':1,'new_candidate':5,'not_worship_or_ambiguous':0},
        'SSPX_FR':{'exact':1,'g0_link':0,'new_candidate':88,'not_worship_or_ambiguous':0},
        'DIOCESAN':{'exact':16,'g0_link':0,'new_candidate':54,'not_worship_or_ambiguous':3},
    },stats
    assert db.execute('SELECT COUNT(*) FROM unified_provider_coverage').fetchone()[0]==554
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate').fetchone()[0]==195
    assert db.execute('SELECT COUNT(*) FROM unified_research_inventory').fetchone()[0]==2774
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate WHERE is_canonical_physical_site!=0 OR is_public_site!=0').fetchone()[0]==0
    return {'source_feed_entries_screened':554,'exact_CL2_source_ID_matches':322,
            'prior_G0_provider_links':1,'new_unresolved_worship_leads':159,
            'non_worship_or_ambiguous_held':72,
            'candidate_ids_total_G0_and_feeds':195,
            'not_unique_venue_count_inventory_rows':2774,
            'feed_counts':stats,'new_physically_admitted_sites':0}




def install_third_party_worldwide_source_leads(db):
    """Consolidate 1,531 third-party directory leads, never 1,531 new churches.

    The prior third-party name-similarity classifications are retained as
    source metadata, never used to merge two physical anchors.
    """
    crosswalk_path=Path('data/directory/research/approved-mass-worldwide-crosswalk-20261009.v1.json')
    census_path=Path('data/directory/research/approved-mass-worldwide-candidates-20261009.v1.json')
    c=json.loads(crosswalk_path.read_text(encoding='utf-8'))
    d=json.loads(census_path.read_text(encoding='utf-8'))
    assert c['schema']=='AO_APPROVED_MASS_CROSSWALK_V1'
    assert d['schema']=='AO_APPROVED_MASS_RESEARCH_DISCOVERY_V1'
    assert len(c['candidates'])==1531 and len(d['records'])==1531
    assert c['summary']['third_party_source_records']==1531
    assert c['summary']['published']==0
    assert len(d['country_coverage'])==65
    assert d['summary']['full_countries']==54
    assert d['summary']['requested_countries']==65
    existing={r[0] for r in db.execute('SELECT source_id FROM venue_source')}
    assert len(existing)==2687
    by_discovery={r['source_id']:r for r in d['records']}
    assert len(by_discovery)==1531
    db.executescript("""
CREATE TABLE unified_third_party_source_lead (
 source_id TEXT PRIMARY KEY, country TEXT NOT NULL, venue_label TEXT NOT NULL,
 directory_url TEXT NOT NULL, previous_similarity_disposition TEXT NOT NULL,
 original_source_url_count INTEGER NOT NULL,
 exact_cl2_frozen_source_id TEXT,
 new_candidate_research_id TEXT,
 source_claim_json TEXT NOT NULL,
 record_scope TEXT NOT NULL CHECK(record_scope='THIRD_PARTY_VENUE_LEAD_NOT_VERIFIED_SITE'),
 FOREIGN KEY(exact_cl2_frozen_source_id) REFERENCES venue_source(source_id),
 FOREIGN KEY(new_candidate_research_id) REFERENCES unified_site_candidate(candidate_research_id)
);
CREATE INDEX third_party_country ON unified_third_party_source_lead(country);
CREATE TABLE unified_directory_country_census (
 country TEXT PRIMARY KEY, listed_source_count INTEGER NOT NULL,
 discovered_source_count INTEGER NOT NULL,
 source_pages_read INTEGER NOT NULL,
 source_listing_complete INTEGER NOT NULL CHECK(source_listing_complete IN (0,1)),
 source_type TEXT NOT NULL CHECK(source_type='THIRD_PARTY_DIRECTORY'),
 NOT_A_COUNTRY_CATHOLIC_COMPLETENESS_CLAIM INTEGER NOT NULL CHECK(NOT_A_COUNTRY_CATHOLIC_COMPLETENESS_CLAIM=1)
);
""")
    disposition={}
    exact=0
    novel=0
    for x in c['candidates']:
        sid=x['source_id']
        assert sid in by_discovery
        original=by_discovery[sid]
        assert original['country_code']==x['country_code']
        assert original['directory_url']==x['directory_url']
        assert original['name']==x['name']
        state=x['duplicate_state']
        assert state in ('UNMATCHED_RESEARCH_LEAD','NAME_ONLY_CANDIDATE_MATCH','AMBIGUOUS_NAME_MATCH')
        disposition[state]=disposition.get(state,0)+1
        is_exact=sid in existing
        new_candidate_id=None
        if is_exact:
            exact+=1
        else:
            novel+=1
            assert not db.execute('SELECT 1 FROM unified_site_candidate WHERE candidate_research_id=?',(sid,)).fetchone()
            # Not a verified or unique physical site. A source listing can
            # name a chapel, residence, monastery or obsolete location.
            first_party=next((u for u in x.get('original_sources',[]) if isinstance(u,str) and
                              u.startswith(('https://','http://'))),None)
            db.execute('INSERT INTO unified_site_candidate VALUES (?,?,?,?,?,?,?,?,?,?,?,0,0,?)',
             (sid,'THIRD_PARTY_LMD',x['country_code'],'',x['name'],'',
              first_party or x['directory_url'],x['directory_url'],
              None,0,'IDENTITY_RECONCILIATION_REQUIRED',
              json.dumps({'crosswalk_candidate':x,'detail_discovery':original,
                          'evidence_type':'THIRD_PARTY_DIRECTORY_NOT_OWNER_VERIFIED',
                          'original_crosswalk_path':str(crosswalk_path)},
                          ensure_ascii=False,separators=(',',':'))))
            new_candidate_id=sid
        db.execute('INSERT INTO unified_third_party_source_lead VALUES (?,?,?,?,?,?,?,?,?,?)',
           (sid,x['country_code'],x['name'],x['directory_url'],state,
            len(x.get('original_sources') or []),
            sid if is_exact else None,new_candidate_id,
            json.dumps({'crosswalk_candidate':x,'detail_discovery':original},
                       ensure_ascii=False,separators=(',',':')),
            'THIRD_PARTY_VENUE_LEAD_NOT_VERIFIED_SITE'))
    assert disposition=={'UNMATCHED_RESEARCH_LEAD':1303,
                        'NAME_ONLY_CANDIDATE_MATCH':148,'AMBIGUOUS_NAME_MATCH':80}
    assert exact==87 and novel==1444
    complete=0
    for a in d['country_coverage']:
        assert a['discovered_unique']>=0
        assert a['listed_total']>=a['discovered_unique']
        db.execute('INSERT INTO unified_directory_country_census VALUES (?,?,?,?,?,"THIRD_PARTY_DIRECTORY",1)',
           (a['country_code'],a['listed_total'],a['discovered_unique'],
            a['pages_fetched'],int(a['complete'])))
        complete+=bool(a['complete'])
    assert complete==54
    assert db.execute('SELECT COUNT(*) FROM unified_third_party_source_lead').fetchone()[0]==1531
    assert db.execute('SELECT COUNT(*) FROM unified_directory_country_census').fetchone()[0]==65
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate').fetchone()[0]==1639
    assert db.execute('SELECT COUNT(*) FROM unified_research_inventory').fetchone()[0]==4218
    assert db.execute('SELECT COUNT(*) FROM unified_site_candidate WHERE is_canonical_physical_site!=0 OR is_public_site!=0').fetchone()[0]==0
    return {'third_party_leads_ingested':1531,'exact_CL2_source_ids':87,
            'identity_unresolved_source_leads':1444,
            'historical_name_match_suggestions_not_confirmed':228,
            'source_country_listings_checked':65,
            'source_country_listings_incomplete':11,
            'census_country_listings_complete':54,
            'total_provisional_physical_anchors_unchanged':2579,
            'combined_candidate_lead_records_G0_feeds_third_party':1639,
            'total_differently_scoped_inventory_rows_not_unique_sites':4218,
            'new_admitted_sites':0}





def install_bulk_identity_review_cohorts(db):
    """Make the existing unadmitted leads reviewable in large fixed cohorts.

    This is a worklist backed by the SAME CL2 physical+source master. It is not
    a second venue database or a claim of new worship buildings.
    """
    db.executescript("""
CREATE TABLE unified_identity_review_cohort (
 candidate_research_id TEXT PRIMARY KEY,
 cohort_no INTEGER NOT NULL CHECK(cohort_no BETWEEN 1 AND 9),
 source_grade TEXT NOT NULL CHECK(source_grade IN
  ('PRIOR_RESEARCH_G0','PROVIDER_REPORTED_WORSHIP','THIRD_PARTY_WITH_OWNER_LINK',
   'THIRD_PARTY_PREVIOUS_NAME_REVIEW','THIRD_PARTY_UNMATCHED')),
 country TEXT NOT NULL,
 editorial_state TEXT NOT NULL CHECK(editorial_state='UNRESOLVED_CANDIDATE_IDENTITY'),
 admitted_to_physical_site INTEGER NOT NULL CHECK(admitted_to_physical_site=0),
 FOREIGN KEY(candidate_research_id) REFERENCES unified_site_candidate(candidate_research_id)
);
CREATE INDEX identity_cohort_round ON unified_identity_review_cohort(cohort_no);
""")
    prior={x[0]:x[1:] for x in db.execute(
        'SELECT source_id,previous_similarity_disposition,original_source_url_count FROM unified_third_party_source_lead')}
    rows=[]
    for r in db.execute('SELECT candidate_research_id,source_batch,country FROM unified_site_candidate'):
        sid,batch,cc=r
        if batch in ('B84','B85','B86','B87','B88','B89','B90'):
            grade='PRIOR_RESEARCH_G0'
        elif batch.startswith('PROVIDER_'):
            grade='PROVIDER_REPORTED_WORSHIP'
        elif batch=='THIRD_PARTY_LMD':
            status,nlinks=prior[sid]
            if nlinks>0:grade='THIRD_PARTY_WITH_OWNER_LINK'
            elif status!='UNMATCHED_RESEARCH_LEAD':grade='THIRD_PARTY_PREVIOUS_NAME_REVIEW'
            else:grade='THIRD_PARTY_UNMATCHED'
        else:raise AssertionError('Undocumented CL2 lead source: '+batch)
        rows.append((sid,cc,grade))
    priorities={'PRIOR_RESEARCH_G0':0,'PROVIDER_REPORTED_WORSHIP':1,
                'THIRD_PARTY_WITH_OWNER_LINK':2,
                'THIRD_PARTY_PREVIOUS_NAME_REVIEW':3,
                'THIRD_PARTY_UNMATCHED':4}
    rows.sort(key=lambda x:(priorities[x[2]],x[1],x[0]))
    assert len(rows)==1639
    for n,(sid,country,grade) in enumerate(rows):
        db.execute('INSERT INTO unified_identity_review_cohort VALUES (?,?,?,?,"UNRESOLVED_CANDIDATE_IDENTITY",0)',
                   (sid,n//200+1,grade,country))
    assert db.execute('SELECT COUNT(*) FROM unified_identity_review_cohort').fetchone()[0]==1639
    size=[r[0] for r in db.execute('SELECT COUNT(*) FROM unified_identity_review_cohort GROUP BY cohort_no ORDER BY cohort_no')]
    assert size==[200,200,200,200,200,200,200,200,39],size
    assert db.execute('SELECT COUNT(*) FROM unified_identity_review_cohort WHERE admitted_to_physical_site!=0').fetchone()[0]==0
    return {'identity_review_cohorts':9,'cohort_sizes':size,
            'candidate_source_records_not_independent_sites':1639,
            'physical_site_additions':0}



def install_unified_physical_ministry_and_group_defaults(db, rows, manifest, root):
    """Extend the SAME source-of-truth SQLite: physical sites → source ministries → Mass rows.
    
    Institute-wide 1962/Roman norms apply once to every exact source linked to
    that institute. They do NOT create a claim about a host building, una cum,
    canonical standing, or any particular celebration.
    """
    norms=json.loads((root/'institution-norms.v1.json').read_text(encoding='utf-8'))
    assert norms['schema']=='AO_CL2_UNIFIED_INSTITUTION_NORMAL_FORMS_V1'
    institutes=norms['institutions']
    assert {i['id'] for i in institutes}=={'FSSP','ICKSP','IBP','SSPX'}
    assert all(len(i['default_assertions'])==2 for i in institutes)
    db.executescript("""
CREATE TABLE unified_physical_site (
  anchor_id TEXT PRIMARY KEY, country TEXT NOT NULL, name TEXT NOT NULL,
  physical_description TEXT NOT NULL, history_site_count INTEGER NOT NULL,
  release_state TEXT NOT NULL CHECK(release_state='RESEARCH_ONLY_NOT_PUBLIC')
);
CREATE TABLE institute_norm (
  institute_id TEXT NOT NULL, field TEXT NOT NULL, value TEXT NOT NULL,
  subject_scope TEXT NOT NULL CHECK(subject_scope='MINISTRY'),
  evidence_url TEXT NOT NULL, evidence_kind TEXT NOT NULL,
  evidence_basis TEXT NOT NULL,
  PRIMARY KEY(institute_id,field)
);
CREATE TABLE source_ministry (
  source_id TEXT PRIMARY KEY, recorded_group_id TEXT, physical_anchor_id TEXT,
  institute_id TEXT, institute_label_grade TEXT NOT NULL,
  original_join_state TEXT NOT NULL,
  inherited_rite TEXT NOT NULL DEFAULT 'UNKNOWN',
  inherited_missal TEXT NOT NULL DEFAULT 'UNKNOWN',
  inherited_scope TEXT NOT NULL,
  approval_state TEXT NOT NULL CHECK(approval_state='RESEARCH_ONLY_NOT_PUBLIC'),
  FOREIGN KEY(physical_anchor_id) REFERENCES unified_physical_site(anchor_id)
);
CREATE TABLE timetable_ministry_link (
  historical_row INTEGER PRIMARY KEY,source_id TEXT,group_id TEXT,
  physical_anchor_id TEXT,ministry_source_id TEXT,
  join_state TEXT NOT NULL,current_schedule_approved INTEGER NOT NULL DEFAULT 0
    CHECK(current_schedule_approved=0),
  FOREIGN KEY(historical_row) REFERENCES mass_time(row_no),
  FOREIGN KEY(physical_anchor_id) REFERENCES unified_physical_site(anchor_id),
  FOREIGN KEY(ministry_source_id) REFERENCES source_ministry(source_id)
);
CREATE TABLE classification_exception (
  subject_type TEXT NOT NULL CHECK(subject_type IN ('MINISTRY','CELEBRATION')),
  subject_key TEXT NOT NULL,
  field TEXT NOT NULL CHECK(field IN ('liturgical_use','missal_edition')),
  value TEXT NOT NULL,evidence_url TEXT NOT NULL CHECK(evidence_url LIKE 'https://%'),
  recorded_at TEXT NOT NULL CHECK(recorded_at GLOB '????-??-??'),
  approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0,1)),
  PRIMARY KEY(subject_type,subject_key,field,recorded_at)
);
CREATE VIEW effective_source_liturgy AS
SELECT sm.source_id,sm.physical_anchor_id,sm.institute_id,
       COALESCE((SELECT e.value FROM classification_exception e
         WHERE e.subject_type='MINISTRY' AND e.subject_key=sm.source_id
           AND e.field='liturgical_use' AND e.approved=1
         ORDER BY e.recorded_at DESC LIMIT 1),sm.inherited_rite) AS liturgical_use,
       COALESCE((SELECT e.value FROM classification_exception e
         WHERE e.subject_type='MINISTRY' AND e.subject_key=sm.source_id
           AND e.field='missal_edition' AND e.approved=1
         ORDER BY e.recorded_at DESC LIMIT 1),sm.inherited_missal) AS missal_edition,
       sm.inherited_scope,sm.institute_label_grade,sm.original_join_state,sm.approval_state
  FROM source_ministry sm;
CREATE VIEW effective_mass_liturgy AS
SELECT t.historical_row,t.physical_anchor_id,t.ministry_source_id,t.join_state,
       COALESCE((SELECT e.value FROM classification_exception e
         WHERE e.subject_type='CELEBRATION' AND e.subject_key=CAST(t.historical_row AS TEXT)
           AND e.field='liturgical_use' AND e.approved=1
         ORDER BY e.recorded_at DESC LIMIT 1),
         s.liturgical_use,'UNKNOWN') AS liturgical_use,
       COALESCE((SELECT e.value FROM classification_exception e
         WHERE e.subject_type='CELEBRATION' AND e.subject_key=CAST(t.historical_row AS TEXT)
           AND e.field='missal_edition' AND e.approved=1
         ORDER BY e.recorded_at DESC LIMIT 1),
         s.missal_edition,'UNKNOWN') AS missal_edition,
       CASE WHEN s.institute_id IS NULL THEN 'UNKNOWN'
            ELSE 'INHERITED_INSTITUTE_NORM_SOURCE_LINKED_NOT_MASS_VERIFIED'
       END AS edition_provenance,
       t.current_schedule_approved
 FROM timetable_ministry_link t
 LEFT JOIN effective_source_liturgy s ON s.source_id=t.ministry_source_id;
CREATE INDEX idx_ministry_institute ON source_ministry(institute_id);
CREATE INDEX idx_ministry_anchor ON source_ministry(physical_anchor_id);
CREATE INDEX idx_mass_anchor ON timetable_ministry_link(physical_anchor_id);
""")
    grouped={}
    by_site={s['group_id']:s for s in rows['site']}
    for s in rows['site']:
        anchor=s['effective_anchor_id']
        grouped.setdefault(anchor,[]).append(s)
    assert len(grouped)==2579
    for anchor, members in sorted(grouped.items()):
        lead=next((x for x in members if x['group_id']==anchor),members[0])
        canonical=lead['canonical']
        db.execute('INSERT INTO unified_physical_site VALUES (?,?,?,?,?,?)',
                   (anchor,canonical[1],canonical[2],canonical[3],
                    len(members),'RESEARCH_ONLY_NOT_PUBLIC'))
    by_institute={i['id']:i for i in institutes}
    norm_values={i['id']:{rule['field']:rule['value'] for rule in i['default_assertions']} for i in institutes}
    for i in institutes:
        for rule in i['default_assertions']:
            assert rule['field'] in ('liturgical_use','missal_edition')
            assert rule['subject_scope']=='MINISTRY' and rule['evidence_url'].startswith('https://')
            db.execute('INSERT INTO institute_norm VALUES (?,?,?,?,?,?,?)',
                       (i['id'],rule['field'],rule['value'],rule['subject_scope'],
                        rule['evidence_url'],rule['evidence_kind'],rule['basis']))
    cols=manifest['classification_columns']
    label_idx=cols.index('organization_hint')
    grade_idx=cols.index('organization_hint_status')
    sid_idx=cols.index('source_id')
    group_idx=cols.index('historical_group_id')
    classified={r['source_id']:r['classification_source_record']
                for r in rows['venue'] if r['classification_source_record']}
    classified.update({r['source_id']:r['classification_source_record']
                       for r in rows['classification_orphan']})
    venues={r['source_id']:r for r in rows['venue']}
    assert len(classified)==2715 and len(venues)==2687
    labels_count=0
    inherited_count=0
    exact_links=0
    for sid in sorted(set(classified)|set(venues)):
        cls=classified.get(sid)
        venue=venues.get(sid)
        normlabel=(str(cls[label_idx]).strip() if cls else '')
        grade=(str(cls[grade_idx]).strip() if cls else 'UNKNOWN')
        norm_id=normlabel if normlabel in by_institute and grade=='SOURCE_LABEL_ONLY' else None
        if grade=='SOURCE_LABEL_ONLY': labels_count+=1
        state=('NO_PHYSICAL_SOURCE_HOLD' if venue is None else
               'NO_CLASSIFICATION_HOLD' if cls is None else
               venue['classification_merge_state'])
        group=(venue['research_group_id'] if venue else cls[group_idx])
        safe=(venue is not None and cls is not None and
              state=='JOINED_EXACT_SOURCE_AND_GROUP' and
              group==cls[group_idx] and group in by_site)
        anchor=by_site[group]['effective_anchor_id'] if safe else None
        if safe: exact_links+=1
        rite=(norm_values[norm_id]['liturgical_use'] if norm_id else 'UNKNOWN')
        missal=(norm_values[norm_id]['missal_edition'] if norm_id else 'UNKNOWN')
        if norm_id: inherited_count+=1
        scope=('GROUP_NORM_INHERITED_TO_SOURCE_MINISTRY_LABEL_NOT_CONFIRMED_CELEBRANT'
               if norm_id else 'NO_GROUP_NORM')
        db.execute('INSERT INTO source_ministry VALUES (?,?,?,?,?,?,?,?,?,?)',
                   (sid,group,anchor,norm_id,
                    'SOURCE_LABEL_ONLY' if norm_id else grade,
                    state,rite,missal,scope,'RESEARCH_ONLY_NOT_PUBLIC'))
    assert labels_count==2008
    assert inherited_count==1389
    assert exact_links==2674
    for entry in rows['mass']:
        m=entry['original_row']
        sid=m[1].strip()
        group=m[26].strip()
        site=by_site.get(group)
        anchor=site['effective_anchor_id'] if site else None
        ministry=None
        state='NO_SITE_ID_HOLD'
        v=venues.get(sid)
        if anchor:
            state='SITE_ONLY_SOURCE_NOT_CONFIRMED'
            if not sid: state='MISSING_SOURCE_ID_HOLD'
            elif v and v['classification_merge_state']!='GROUP_CONFLICT_HOLD':
                source_group=v['research_group_id']
                if source_group==group:
                    ministry=sid;state='EXACT_SOURCE_AND_GROUP'
                elif source_group in by_site and by_site[source_group]['effective_anchor_id']==anchor:
                    state='SHARED_BUILDING_ALIAS_SOURCE_REVIEW'
                else:
                    state='SOURCE_GROUP_DISAGREEMENT_HOLD'
            elif v: state='SOURCE_GROUP_CONFLICT_HOLD'
        db.execute('INSERT INTO timetable_ministry_link VALUES (?,?,?,?,?,?,0)',
                   (entry['historical_row'],sid or None,group or None,
                    anchor,ministry,state))
    assert db.execute('SELECT COUNT(*) FROM source_ministry').fetchone()[0]==2723
    assert db.execute('SELECT COUNT(*) FROM timetable_ministry_link').fetchone()[0]==4681
    assert db.execute('SELECT COUNT(*) FROM unified_physical_site').fetchone()[0]==2579
    assert db.execute('SELECT COUNT(*) FROM institute_norm').fetchone()[0]==8
    assert db.execute("SELECT COUNT(*) FROM source_ministry WHERE institute_id IS NOT NULL").fetchone()[0]==1389
    assert db.execute("SELECT COUNT(*) FROM classification_exception").fetchone()[0]==0
    assert db.execute("SELECT COUNT(*) FROM timetable_ministry_link WHERE current_schedule_approved=1").fetchone()[0]==0
    return {'physical_sites':2579,'source_ministry_rows':2723,
            'institution_inherited_source_labels':inherited_count,
            'group_norm_assertions':8,'historical_timetables':4681,
            'current_public_schedule_approvals':0}

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
    unified_stats=install_unified_physical_ministry_and_group_defaults(db,rows,manifest,root)
    candidate_stats=install_existing_g0_candidates_into_single_master(db)
    provider_stats=install_known_provider_feed_census(db)
    worldwide_stats=install_third_party_worldwide_source_leads(db)
    cohort_stats=install_bulk_identity_review_cohorts(db)
    db.commit()
    assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    for table,expected in [('canonical_site',2584),('venue_source',2687),('classification_source',2715),('mass_time',4681),('existing_alias',5),('identity_exception',49)]:
        assert db.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==expected
    assert db.execute('PRAGMA foreign_key_check').fetchall()==[]
    db.close()
    print(json.dumps({'status':'PASS','output':str(output),'bytes':output.stat().st_size,'source_parts':sum(len(v) for v in manifest['shards'].values()),'source_rows':2687,'classification_rows':2715,'alias_count':5,'held_group_conflicts':5,'public_changes':0,'unified_master':unified_stats,'unresolved_venue_candidate_intake':candidate_stats,'provider_source_coverage':provider_stats,'third_party_source_census':worldwide_stats,'census_identity_review_cohorts':cohort_stats}))

if __name__=='__main__': main()
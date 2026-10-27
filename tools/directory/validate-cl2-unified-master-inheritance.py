#!/usr/bin/env python3
"""Regression gate for the sole worldwide TLM master SQLite: identity and inherited norms.

Original CL2 research rows remain immutable. Group rules are inherited by source ministries
once, not handwritten 1,389 times. Dated ministry/celebration overrides take precedence
without changing the shared group norm; no public classifications/times are certified.
"""
import argparse
import sqlite3

def count(db, statement):
    return db.execute(statement).fetchone()[0]

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--db',required=True)
    args=p.parse_args()
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    expected={
      "canonical_site":2584,"unified_physical_site":2579,
      "venue_source":2687,"classification_source":2715,
      "source_ministry":2723,"mass_time":4681,
      "timetable_ministry_link":4681,"institute_norm":8,
      "existing_alias":5,"identity_exception":49,
      "classification_exception":0
    }
    for table,n in expected.items():
        assert count(db,f'SELECT COUNT(*) FROM {table} ')==n,(table,n)
    assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    assert not db.execute('PRAGMA foreign_key_check').fetchall()
    assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE institute_id IS NOT NULL")==1389
    assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE physical_anchor_id IS NOT NULL")==2674
    assert count(db,"SELECT COUNT(*) FROM timetable_ministry_link WHERE current_schedule_approved!=0")==0
    assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE approval_state!='RESEARCH_ONLY_NOT_PUBLIC'")==0
    assert count(db,"SELECT COUNT(*) FROM unified_physical_site WHERE release_state!='RESEARCH_ONLY_NOT_PUBLIC'")==0
    for institute,n in (('FSSP',381),('ICKSP',158),('IBP',31),('SSPX',819)):
        assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE institute_id='"+institute+"'")==n
        assert count(db,"SELECT COUNT(*) FROM institute_norm WHERE institute_id='"+institute+"'")==2
        assert count(db,"SELECT COUNT(*) FROM effective_source_liturgy WHERE institute_id='"+institute+"' AND liturgical_use='ROMAN' AND missal_edition='1962'")==n

    assert count(db,"SELECT COUNT(*) FROM effective_mass_liturgy")==4681
    assert count(db,"SELECT COUNT(*) FROM timetable_ministry_link WHERE join_state='MISSING_SOURCE_ID_HOLD'")==13
    assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE institute_id IS NOT NULL AND physical_anchor_id IS NULL")>=3
    assert count(db,"SELECT COUNT(*) FROM source_ministry WHERE institute_id IS NULL AND inherited_missal!='UNKNOWN'")==0

    # All 5 alias site IDs resolve to precisely one physical anchor.
    assert count(db,"SELECT SUM(history_site_count-1) FROM unified_physical_site")==5
    assert count(db,"SELECT SUM(history_site_count) FROM unified_physical_site")==2584

    # Verify a source-ministry exception supersedes its norm, and a single Mass
    # exception wins over both, *without* changing the institute-wide default.
    example=db.execute("""
      SELECT t.historical_row,t.ministry_source_id,m.institute_id
      FROM timetable_ministry_link t
      JOIN source_ministry m ON m.source_id=t.ministry_source_id
      WHERE m.institute_id='FSSP' AND m.physical_anchor_id IS NOT NULL
      ORDER BY t.historical_row LIMIT 1
    """).fetchone()
    assert example is not None,"Cannot find FSSP-linked timetable to exercise overrides"
    row_no,sid,institute=example
    assert db.execute('SELECT missal_edition FROM effective_mass_liturgy WHERE historical_row=?',(row_no,)).fetchone()[0]=='1962'
    db.execute('SAVEPOINT override_test')
    db.execute("""INSERT INTO classification_exception VALUES
      ('MINISTRY',?,'missal_edition','PRE_1955','https://example.org/a','2026-10-27',1)""",(sid,))
    assert db.execute('SELECT missal_edition FROM effective_source_liturgy WHERE source_id=?',(sid,)).fetchone()[0]=='PRE_1955'
    assert db.execute('SELECT missal_edition FROM effective_mass_liturgy WHERE historical_row=?',(row_no,)).fetchone()[0]=='PRE_1955'
    db.execute("""INSERT INTO classification_exception VALUES
      ('CELEBRATION',?,'missal_edition','1962','https://example.org/b','2026-10-27',1)""",(str(row_no),))
    assert db.execute('SELECT missal_edition FROM effective_mass_liturgy WHERE historical_row=?',(row_no,)).fetchone()[0]=='1962'
    assert db.execute("SELECT value FROM institute_norm WHERE institute_id='FSSP' AND field='missal_edition'").fetchone()[0]=='1962'
    db.execute('ROLLBACK TO SAVEPOINT override_test')
    db.execute('RELEASE SAVEPOINT override_test')
    assert count(db,'SELECT COUNT(*) FROM classification_exception')==0

    # The shared church is not automatically classed as a Roman 1962 venue.
    cols=[col[1] for col in db.execute('PRAGMA table_info(unified_physical_site)')]
    assert 'missal_edition' not in cols and 'una_cum' not in cols
    db.close()
    print("UNIFIED MASTER PASS: 2,579 physical sites, 2,723 source ministries, "
          "4,681 Mass rows, 1,389 rule-inheriting institute labels, "
          "13 held source-less timetables, source/celebration overrides tested, zero published.")

if __name__=='__main__': main()

#!/usr/bin/env python3
"""B93 fail-closed research adapter unit tests. No binary workbook is in CI."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
FILE=ROOT / 'tools/directory/stage-b91-research-only.py'
spec=importlib.util.spec_from_file_location('b93_stage',FILE)
b93=importlib.util.module_from_spec(spec)
spec.loader.exec_module(b93)

class FakeB92:
    def __init__(self,records): self.records=records
    def verify(self, *_):
        return {'status':'PASS','baseline_sha256':'a'*64,'candidate_sha256':'b'*64}
    def read_workbook(self,*args,**kwargs): return self.records

def fixture():
    tables={'CANONICAL SITES':[('GROUP',)],'PHYSICAL SITES':[('GROUP',)],
            'UNIFIED VENUES':[('SOURCE',)]}
    for group_id,source_id in b93.NEW.items():
        c=['']*10
        c[0]=group_id;c[1]='BR';c[2]='Capela Teste';c[3]='Rua Teste 123'
        c[7]='RESEARCH_ONLY_NOT_PUBLIC';c[9]='https://example.org/owner'
        p=['']*15
        p[0]=group_id;p[1]=source_id;p[3]='BR';p[4]=c[2];p[5]=c[3]
        p[13]='HOLD_NOT_PUBLIC_APPROVED'
        v=['']*37
        v[0]=source_id;v[4]=c[2];v[5]='BR';v[6]='Cidade';v[7]=c[3]
        v[22]='0';v[23]='0';v[25]='https://example.org/owner'
        v[32]='HOLD_NOT_PUBLIC_APPROVED';v[34]=group_id;v[36]=source_id
        tables['CANONICAL SITES'].append(tuple(c))
        tables['PHYSICAL SITES'].append(tuple(p))
        tables['UNIFIED VENUES'].append(tuple(v))
    return {k:tuple(v) for k,v in tables.items()}

class StageTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.provider=self.root/'data/directory/generated/v19'
        self.provider.mkdir(parents=True)
        self.provider_file=self.provider/'aasjmv.v1.json'
        self.provider_file.write_text(json.dumps({
            'provider':'AASJMV',
            'records':[{'u':'AASJMV-EXT-001','n':'Capela do Oratório São José',
                        'cc':'BR','a':'Rua Aiuruoca 148'}]
        }))
        self.records=fixture()

    def stage(self):
        with patch.object(b93,'load_b92',return_value=FakeB92(self.records)):
            return b93.make_stage('b82.xlsx','b91.xlsx',self.root,'b92.py')

    def test_staging_not_publishable_and_duplicate_source_detected(self):
        report=self.stage()
        self.assertEqual(report['staged_source_count'],5)
        self.assertEqual(report['existing_app_provider_source_collisions'],1)
        self.assertEqual(report['new_app_venues_published'],0)
        self.assertEqual(report['new_app_schedules_published'],0)
        for record in report['records']:
            preview=record['preview_unpublishable_fields']
            for field in ('venue_id','geo','schedules','ministries'):
                self.assertNotIn(field,preview)
            self.assertIsNone(record['public_place_id'])
        self.assertEqual(report['records'][-1]['staging_classification'],
                         'EXISTING_APP_PROVIDER_SOURCE_NO_SECOND_VENUE')

    def test_unexpected_country_rejected(self):
        rows=list(self.records['CANONICAL SITES'])
        last=list(rows[-1]);last[1]='US';rows[-1]=tuple(last)
        self.records['CANONICAL SITES']=tuple(rows)
        with self.assertRaisesRegex(ValueError,'Unexpected country'):
            self.stage()

    def test_leaked_public_pin_rejected(self):
        rows=list(self.records['PHYSICAL SITES'])
        changed=list(rows[-2]);changed[12]='place:BR:unapproved';rows[-2]=tuple(changed)
        self.records['PHYSICAL SITES']=tuple(rows)
        with self.assertRaisesRegex(ValueError,'Unapproved public Place ID'):
            self.stage()

    def test_missing_provider_inventory_rejected(self):
        self.provider_file.unlink()
        with self.assertRaisesRegex(ValueError,'Empty v19 source inventory'):
            self.stage()

    def test_writes_to_generated_directory_rejected(self):
        target=self.provider/'unapproved.json'
        code=b93.main(['--baseline','/tmp/b82.xlsx','--candidate','/tmp/b91.xlsx',
                       '--repo-root',str(self.root),'--report',str(target)])
        self.assertEqual(code,2)
        self.assertFalse(target.exists())

    def test_existing_output_not_overwritten(self):
        target=self.root/'existing.json';target.write_text('{}')
        code=b93.main(['--baseline','/tmp/b82.xlsx','--candidate','/tmp/b91.xlsx',
                       '--repo-root',str(self.root),'--report',str(target)])
        self.assertEqual(code,2)
        self.assertEqual(target.read_text(),'{}')

if __name__=='__main__':
    unittest.main()

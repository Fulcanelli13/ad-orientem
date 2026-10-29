#!/usr/bin/env python3
"""Offline fail-closed tests for research-only CL2 photo intake (no network)."""
import importlib.util
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1]/"tools/directory/build-unified-photo-intake.py"
spec=importlib.util.spec_from_file_location("ao_unified_photo_intake",SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

def put(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,separators=(",",":"),ensure_ascii=False)+"\n",encoding="utf-8")
    return {"path":path.name,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
            "bytes":path.stat().st_size,"rows":len(value.get("records", []))}

def site(g,anchor,name):
    return {
        "group_id":g,"effective_anchor_id":anchor,
        "canonical":[g,"US",name,"123 Main St, Town","",1,"","RESEARCH_ONLY_NOT_PUBLIC",0,"https://example.org/church"],
        "site_state":"RESEARCH_ONLY_NOT_PUBLIC",
        "physical":[g,"","","US",name,"123 Main St"],"location_backfill":None}

def venue(sid,g,status="JOINED_EXACT_SOURCE_AND_GROUP"):
    row=[""]*37
    row[0]=sid;row[4]="Alternate church title";row[25]="https://example.org/times"
    row[26]="http://insecure.example.org/image";row[27]="https://example.org/about"
    return {"source_id":sid,"research_group_id":g,"classification_merge_state":status,
            "source_record":row,"release":"RESEARCH_ONLY_NEVER_AUTO_PUBLISH"}

class CL2PhotoIntakeTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.master=self.root/"source"
        self.master.mkdir()
        self.anchor1="RG-000000000001"
        self.anchor2="RG-000000000002"
        self.alias="RG-000000000003"
        self.sites=[
            site(self.anchor1,self.anchor1,"St Joseph's Church"),
            site(self.alias,self.anchor1,"St Joseph Chapel (same building)"),
            site(self.anchor2,self.anchor2,"Holy Trinity Church"),
        ]
        self.venues=[venue("source-1",self.anchor1),venue("source-2",self.alias),
                     venue("dangerous-conflict","RG-FFFFFFFFFFFF","GROUP_CONFLICT_HOLD")]
        self.r49=self.root/"r49.json"
        put(self.r49,{"schema":"AO_PRELIMINARY_TLM_MAP_R49",
            "columns":["id","name","country","lat","lng","precision"],
            "records":[["source-1","St Joseph Church","US",1,2,"building"],
                       ["source-2","St Joseph Chapel","US",1,2,"building"]]})
        self.commit="a"*40
        self.bounds=patch.multiple(mod,EXPECTED_SITE_IDS=3,EXPECTED_ANCHORS=2,
                                  EXPECTED_VENUE_SOURCES=3,EXPECTED_R49=2)
        self.bounds.start()
        self.addCleanup(self.bounds.stop)
        self.rewrite_shards()

    def rewrite_shards(self):
        s={"table":"site","part":1,"parts":1,"records":self.sites}
        v={"table":"venue","part":1,"parts":1,"records":self.venues}
        ps=put(self.master/"site-01-of-01.json",s)
        pv=put(self.master/"venue-01-of-01.json",v)
        put(self.master/"manifest.json",{
            "schema":"AO_CL2_SINGLE_RESEARCH_MASTER_V1",
            "status":"RESEARCH_ONLY_NOT_PUBLIC_NO_RUNTIME_IMPORT",
            "count":{"effective_physical_sites":2},
            "shards":{"site":[ps],"venue":[pv]},
        })

    def test_dedupe_aliases_exact_r49_links_and_no_publication(self):
        out=self.root/"export"
        index=mod.export(self.master,self.r49,out,chunk_size=100,commit=self.commit)
        self.assertEqual(index["counts"]["distinct_consolidated_physical_anchors"],2)
        self.assertEqual(index["counts"]["r49_exact_source_ids_crosswalked"],2)
        self.assertEqual(index["counts"]["anchors_with_r49_exact_source"],1)
        self.assertEqual(index["counts"]["cl2_venue_sources_held_for_group_conflict"],1)
        self.assertEqual(len(index["shards"]),1)
        self.assertEqual(index["shards"][0]["count"],2)
        content=json.loads((out/index["shards"][0]["path"]).read_text())
        self.assertEqual(content["publication"],mod.PUBLICATION)
        first=next(x for x in content["records"] if x["physical_anchor_id"]==self.anchor1)
        self.assertEqual(first["historical_group_ids"],[self.anchor1,self.alias])
        self.assertEqual(first["legacy_r49_source_ids"],["source-1","source-2"])
        self.assertEqual(first["source_count"],2)
        self.assertEqual(first["source_name_search_hints"],["Alternate church title"])
        self.assertNotIn("http://insecure.example.org/image",first["official_source_urls"])
        self.assertFalse(first["building_subject_verified"])
        self.assertEqual(first["approved_originals"],0)
        self.assertFalse(first["approved_cover_photo"])
        audit=mod.read_json(out/"audit.json")
        self.assertEqual(audit["held_identity_exceptions"]["group_conflict_source_ids"],
                         ["dangerous-conflict"])
        self.assertEqual(index["counts"]["photos_published"],0)
        with self.assertRaisesRegex(ValueError,"Refuse to overwrite"):
            mod.export(self.master,self.r49,out,chunk_size=100,commit=self.commit)

    def test_sha256_tamper_and_unapproved_source_veto(self):
        self.sites[0]["canonical"][7]="PUBLIC"
        self.rewrite_shards()
        with self.assertRaisesRegex(ValueError,"release mismatch"):
            mod.export(self.master,self.r49,self.root/"tamper",chunk_size=100,commit=self.commit)
        self.sites[0]["canonical"][7]="RESEARCH_ONLY_NOT_PUBLIC"
        self.rewrite_shards()
        p=self.master/"site-01-of-01.json"
        p.write_bytes(p.read_bytes()+b" ")
        with self.assertRaisesRegex(ValueError,"bytes/hash changed"):
            mod.export(self.master,self.r49,self.root/"tamper",chunk_size=100,commit=self.commit)

    def test_source_group_mismatch_and_unpinned_commit(self):
        with self.assertRaisesRegex(ValueError,"Pin the actual reviewed"):
            mod.export(self.master,self.r49,self.root/"a",chunk_size=100,commit="main")
        self.venues[1]["research_group_id"]="RG-AAAAAAAAAAAA"
        self.rewrite_shards()
        out=self.root/"b"
        index=mod.export(self.master,self.r49,out,chunk_size=100,commit=self.commit)
        self.assertEqual(index["counts"]["cl2_venue_sources_other_unmapped"],1)
        self.assertEqual(index["counts"]["r49_exact_source_ids_crosswalked"],1)

if __name__=="__main__":
    unittest.main()

#!/usr/bin/env python3
"""No-network new-source hunt tests: 96 targets, no old choices, 5xx skip/429 stop."""
import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest
import urllib.error
from unittest.mock import patch

ROOT=pathlib.Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"tools/atlas/discover-sacred-atlas-96-new-photos.py"
spec=importlib.util.spec_from_file_location("atlas96",SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class NewSource96(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scope=json.loads(mod.source.DEFAULT_SCOPE.read_text(encoding="utf8"))

    def test_96_only_without_prior_selected_sources(self):
        rows=mod.targets(self.scope)
        self.assertEqual(len(rows),96)
        self.assertEqual(rows[0]["place_id"],"place:US:st-john-neumann-philadelphia")
        self.assertTrue(all(not x["already_selected_source"] for x in rows))
        self.assertEqual({k:sum(x["previous_lane"]==k for x in rows) for k in mod.PRIORITY},
            {"PRESERVE_NONE_SELECTED":51,"MULTISOURCE_DISCOVERY":43,"GALLERY_ONLY_SEEK_EXACT_COVER":2})

    def test_500_skips_site_without_retry_and_moves_to_next(self):
        with tempfile.TemporaryDirectory() as root:
            out=pathlib.Path(root)/"results.json"
            e=urllib.error.HTTPError("https://api.openverse.org/v1/images/",500,"Backend",None,None)
            mockresults={"results":[{"license":"by","source":"flickr","foreign_landing_url":"https://www.flickr.com/photos/123/456","title":"Named shrine","creator":"Photographer"}]}
            with patch.object(sys,"argv",[str(SCRIPT),"--max-sites","2","--out",str(out)]),\
                 patch.object(mod.source,"request",side_effect=[e,mockresults]) as mockreq:
                rc=mod.main()
            self.assertEqual(rc,0)
            self.assertEqual(mockreq.call_count,2)
            j=json.loads(out.read_text())
            self.assertEqual(j["sites_queried"],2)
            self.assertEqual(j["provider_http_5xx_skipped"],1)
            self.assertEqual(j["sites_with_candidates"],1)
            self.assertEqual(j["places"][0]["status"],"HTTP_500_SKIPPED_NO_RETRY")
            self.assertFalse(j["places"][1]["candidates"][0]["publication_authorized"])

    def test_429_stops_without_retry(self):
        with tempfile.TemporaryDirectory() as root:
            out=pathlib.Path(root)/"results.json"
            e=urllib.error.HTTPError("https://api.openverse.org/v1/images/",429,"Too Many Requests",None,None)
            with patch.object(sys,"argv",[str(SCRIPT),"--max-sites","2","--out",str(out)]),\
                 patch.object(mod.source,"request",side_effect=e) as mockreq:
                rc=mod.main()
            self.assertEqual(rc,2)
            mockreq.assert_called_once()
            j=json.loads(out.read_text())
            self.assertTrue(j["stopped_http_429"])
            self.assertEqual(j["outcome"],"PARTIAL_RATE_LIMIT_NO_RETRY")
            self.assertEqual(j["provider_requests"],1)

if __name__=="__main__":unittest.main()

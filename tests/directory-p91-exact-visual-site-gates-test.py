#!/usr/bin/env python3
"""P91 strict 385-source provenance, prior-decision and no-publication contract."""
import hashlib, json, pathlib, unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
P90=ROOT/"docs/research/directory/p90-exact-building-photo-evidence-20261029/p90-all-385-reconciled-assignments.json"
P91=ROOT/"docs/research/directory/p91-independent-photo-screen-20261029/p91-complete-385-photo-verification-ledger.json"
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
NEW_REJECTS={19,113,218,245,272,305,306,307,308,323}
NEW_IDENTITIES={17,18,69,70,71,72,192,193,194,195,313,314,315,332,333,339,340,341,342,363,378,379,380,381,266,122}
AMBIGUOUS_NO_REJECTION={234,236,237}

class P91Contract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.old=json.loads(P90.read_text())
        cls.new=json.loads(P91.read_text())
    def test_exact_385_immutable_source_population(self):
        a,b=self.old,self.new
        self.assertEqual(b["schema"],"AO_P91_ACTUAL_PREVIEW_PLUS_EXACT_BUILDING_EVIDENCE_V1")
        self.assertEqual(len(a["records"]),len(b["records"]))
        self.assertEqual(len(b["records"]),385)
        for i,(before,after) in enumerate(zip(a["records"],b["records"]),1):
            self.assertEqual(before["contact_index"],after["contact_index"])
            self.assertEqual(after["contact_index"],i)
            for field in ("physical_anchor_id","commons_file_title","original_sha1_claim","source_url","country","place_name","target_site_context"):
                self.assertEqual(before[field],after[field],f"Changed immutable source {field} index {i}")
            self.assertEqual(after["p90_disposition"],before["preliminary_visual_disposition"])
            self.assertFalse(after["rights_approved"] or after["image_approved"] or after["published"])
            self.assertFalse(after["subject_verified_for_publication"] or after["original_image_bytes_verified"])
        self.assertEqual(b["input_preview_zip_sha256"],"33055b933b9c0cada4b38664477706b37c173b985c0de929b8f9c1502d0a75c5")
    def test_no_approval_385_accounted_and_exact_decision_changes(self):
        a,b=self.old,self.new
        self.assertEqual(b["p90_wrong_site_rejections"],90)
        self.assertEqual(b["p91_new_source_rejections"],len(NEW_REJECTS))
        self.assertEqual(b["cumulative_rejected_photo_assignments"],100)
        self.assertEqual(b["p90_subject_corroborated"],12)
        self.assertEqual(b["p91_new_subject_corroborated"],len(NEW_IDENTITIES))
        self.assertEqual(b["cumulative_subject_corroborated_research_only"],38)
        self.assertEqual(b["remaining_unverified_assignments"],247)
        self.assertEqual(b["source_remaining_before_P91"],283)
        statuses={}
        transitions=set()
        for x,y in zip(a["records"],b["records"]):
            if x["preliminary_visual_disposition"]!=y["preliminary_visual_disposition"]:transitions.add(y["contact_index"])
            statuses[y["preliminary_visual_disposition"]]=statuses.get(y["preliminary_visual_disposition"],0)+1
        self.assertEqual(transitions,NEW_IDENTITIES|NEW_REJECTS|AMBIGUOUS_NO_REJECTION)
        self.assertEqual(sum(statuses.values()),385)
        self.assertEqual(b["output_dispositions"],statuses)
        self.assertEqual(sum(v for k,v in statuses.items() if k.startswith("REJECT_")),100)
        self.assertEqual(sum(v for k,v in statuses.items() if k.startswith("SUBJECT_")),38)
        self.assertEqual(sum(v for k,v in statuses.items() if k.startswith("HOLD_")),247)
        self.assertEqual(b["human_final_approvals"],0)
        self.assertEqual(b["source_originals_checked_for_publication"],0)
        self.assertEqual(b["rights_approved"],b["photos_published"])
        self.assertEqual(b["photos_published"],0)
        self.assertEqual(b["publication"],HOLD)
        self.assertEqual(len({x["physical_anchor_id"] for x in b["records"] if x["preliminary_visual_disposition"].startswith("HOLD_")}),b["distinct_unverified_sites"])
    def test_evidence_and_ambiguous_venues_not_force_rejected(self):
        a=self.new
        records={x["contact_index"]:x for x in a["records"]}
        for ids,label in ((NEW_REJECTS,"REJECT_P91"),(NEW_IDENTITIES,"SUBJECT_P91")):
            for i in ids:
                item=records[i]
                self.assertTrue(item["preliminary_visual_disposition"].startswith(label))
                self.assertTrue(item["p91_evidence"]["urls"],str(i))
                self.assertTrue(item["p91_evidence"]["reason"],str(i))
                self.assertEqual(item["p91_evidence"]["confidence"],
                    "DIRECT_SITE_CONTRADICTION_OR_NOT_WORSHIP_BUILDING" if label.startswith("REJECT") else "NAMED_BUILDING_COMMONS_AND_INDEPENDENT_SITE_SOURCE")
        for i in AMBIGUOUS_NO_REJECTION:
            item=records[i]
            self.assertEqual(item["preliminary_visual_disposition"],"HOLD_INSUFFICIENT_EXACT_WORSHIP_VENUE_IDENTITY")
            self.assertEqual(item["p91_evidence"]["confidence"],"INSUFFICIENT_TARGET_SITE_IDENTITY_NO_NEGATIVE_PROOF")
        roles={int(k) for k in NEW_IDENTITIES if records[k].get("p91_visual_role")}
        self.assertEqual(roles,NEW_IDENTITIES)
        self.assertEqual(sum(records[k]["p91_visual_role"]=="PRIMARY_POTENTIAL" for k in roles),6)
        self.assertEqual({x["contact_index"] for x in a["records"] if x["exact_subject_research_corrob"]},NEW_IDENTITIES|{12,13,14,15,16,20,60,61,62,63,96,110})
if __name__=="__main__":unittest.main()

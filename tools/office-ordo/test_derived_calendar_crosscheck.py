"""No-network tests: derivative 1962 source cannot confer liturgical authority."""
import json
from pathlib import Path
import tempfile
import unittest

from derived_calendar_crosscheck import compare_derived
from test_independent_ordo_concordance import generate_inputs

def sample_calendars(root: Path):
    source, _ = generate_inputs(root)
    outputs = {}
    for year in (2026, 2027):
        rows = []
        from datetime import date, timedelta
        for number in range(365):
            d = (date(year, 1, 1) + timedelta(days=number)).isoformat()
            rows.append({
                "date": d, "form": "1962", "calendar": "general-roman",
                "season": {"code": "epiphany"},
                "celebration": {
                    "title": {"en": "Synthetic calendar feast"},
                    "rank": {"code": "class-4"}, "color": "white",
                },
                "alternatives": [],
            })
        doc = {"schemaVersion": 1, "form": "1962",
               "calendar": "general-roman", "year": year, "days": rows}
        p = root/f"ambo-{year}.json"
        p.write_text(json.dumps(doc),encoding="utf8")
        outputs[year] = p
    return source, outputs

class DerivedCalendarTests(unittest.TestCase):
    def test_full_year_source_ranks_and_research_only_status(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source, files = sample_calendars(root)
            doc = json.loads(files[2027].read_text())
            doc["days"][5]["celebration"]["rank"]["code"] = "class-2"
            doc["days"][4]["alternatives"] = [
                {"title":{"en":"Synthetic commemoration"},
                 "rank":{"code":"commemoration"}}
            ]
            files[2027].write_text(json.dumps(doc))
            result = compare_derived(source, files)
            self.assertEqual(result["civil_days_checked"], 730)
            self.assertEqual(result["source_hours_checked"], 5840)
            self.assertEqual(result["summary"]["concordant_machine_ranks"],729)
            self.assertEqual(result["summary"]["machine_rank_disagreements"],1)
            self.assertEqual(result["summary"]["source_evening_office_transitions"],1)
            self.assertEqual(result["summary"]["dates_with_derived_commemorations"],1)
            self.assertFalse(result["quality_gate"]["independent_ordo_witness_confirmed"])
            self.assertFalse(result["quality_gate"]["public_reader_authorized"])
            self.assertIn("SOURCE_RANK_CROSSCHECK_DISAGREEMENT",
                [t for item in result["queue"] if item["date"] == "2027-01-06"
                 for t in item["observations"]])
            self.assertTrue(all(not row["independent_ordo_validated"]
                                for row in result["queue"]))

    def test_wrong_calendar_scope_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            source, files=sample_calendars(root)
            doc=json.loads(files[2026].read_text())
            doc["calendar"]="united-states"
            files[2026].write_text(json.dumps(doc))
            with self.assertRaisesRegex(ValueError, "UNTRUSTED_SCOPE"):
                compare_derived(source, files)

    def test_public_reader_flag_must_remain_false(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            source, files=sample_calendars(root)
            doc=json.loads((source/"config.json").read_text())
            doc["public_reader_authorized"]=True
            (source/"config.json").write_text(json.dumps(doc))
            with self.assertRaisesRegex(ValueError, "PRIVATE_SOURCE_READER"):
                compare_derived(source, files)

    def test_duplicate_derived_calendar_day_fails_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            source, files=sample_calendars(root)
            doc=json.loads(files[2027].read_text())
            doc["days"][4]["date"]=doc["days"][3]["date"]
            files[2027].write_text(json.dumps(doc))
            with self.assertRaisesRegex(ValueError, "INVALID_DAY_OR_DUPLICATE"):
                compare_derived(source, files)

if __name__ == "__main__":
    unittest.main()

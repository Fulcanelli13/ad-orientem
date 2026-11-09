"""Synthetic no-network year-level checks for an independent Ordo concordance.

These tests do not purport to be authentic liturgical witnesses; they
exercise exact date, source-status, cross-year Vespers, and output gating.
"""
import datetime as dt
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

modpath = Path(__file__).with_name("independent_ordo_concordance.py")
spec = importlib.util.spec_from_file_location("independent_ordo_concordance", modpath)
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


def sample(year, start_id=100000):
    first = dt.date(year, 1, 1)
    days = []
    for i in range(365):
        day = first + dt.timedelta(days=i)
        days.append({
            "date": day.isoformat(),
            "weekday": (day.weekday() + 1) % 7 + 1,
            "season": "research-sample",
            "celebration": {
                "id": start_id+i, "name": "Synthetic Office "+str(i+1),
                "kind": "feria", "rank": "4",
                "transferred": False,
            },
            "vespers": None,
            "vespersCommemoration": None,
            "commemorations": [],
            "marian": "research-sample",
        })
    return {
        "generated": "2026-01-01T00:00:00Z",
        "year": year,
        "lang": "la",
        "mode": "civil",
        "congregation": "",
        "source": None,
        "count": 365,
        "days": days,
    }


def sample_hour(date, hour, source_switch=False):
    label = "Synthetic Sunday" if source_switch else "Synthetic Feria"
    title = label + " ~ IV. classis"
    return {
        "date": date, "hour": hour,
        "title": label,
        "source": {
            "revision": audit.SOURCE_PIN,
            "xhtml_sha256": "a"*64,
            "epub_entry": date[5:7]+"-"+date[8:10]+"-"+date[:4]+"-1-"+hour+".html",
        },
        "sections": [{
            "source_blocks": [{
                "lines": [{"text": title}],
            }],
        }],
        "quality_gate": {"public_reader_authorized": False},
    }


def generate_inputs(folder):
    private = folder / "reader"
    private.mkdir()
    (private / "config.json").write_text(json.dumps({
        "schema": "ao.office.1960.private-reader-index.v1",
        "source_revision": audit.SOURCE_PIN,
        "total_days": 730,
        "total_hours": 5840,
        "public_reader_authorized": False,
    }))
    ordos = {2026: sample(2026, 1000), 2027: sample(2027, 2000)}
    # The independent source flags First Vespers of the following day.
    ordos[2026]["days"][2]["vespers"] = {
        "id": ordos[2026]["days"][3]["celebration"]["id"],
        "name": "Sunday synthetic",
    }
    # A deliberate source-to-independent mismatch later in January.
    ordos[2027]["days"][4]["vespers"] = {
        "id": ordos[2027]["days"][5]["celebration"]["id"],
        "name": "Conflicting Sunday synthetic",
    }
    # Rank mismatch is flagged, not automatically corrected.
    ordos[2027]["days"][5]["celebration"]["rank"] = "2"
    for year in (2026, 2027):
        for entry in ordos[year]["days"]:
            date = entry["date"]
            hours = {}
            for hour in audit.HOURS:
                change = (date == "2026-01-03" and hour in
                          ("Vespera", "Completorium"))
                hours[hour] = sample_hour(date, hour, change)
            p = private / str(year) / date[5:7] / (date[8:10]+".json")
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(json.dumps({
                "date": date, "hours": hours,
                "private_research_only": True,
                "public_reader_authorized": False,
            }), encoding="utf8")
        (folder/f"ordo-{year}.json").write_text(json.dumps(ordos[year]),encoding="utf8")
    return private, {year: folder/f"ordo-{year}.json" for year in (2026, 2027)}


class IndependentWitnessTests(unittest.TestCase):
    def test_730_dates_and_5840_hours_cross_checked_without_public_permission(self):
        with tempfile.TemporaryDirectory() as name:
            private, files = generate_inputs(Path(name))
            r = audit.compare(private, files)
            self.assertEqual(r["days_compared"], 730)
            self.assertEqual(r["hours_source_verified"], 5840)
            self.assertEqual(r["summary"]["source_vespers_transitions"], 1)
            self.assertEqual(r["summary"]["independent_vespers_transitions"], 2)
            self.assertEqual(r["summary"]["evening_switch_concordant_dates"], 729)
            self.assertEqual(r["summary"]["source_principal_ranks_compared"], 730)
            self.assertEqual(r["summary"]["rank_disagreed"], 1)
            self.assertEqual(r["summary"]["source_rank_unreadable"], 0)
            self.assertFalse(r["quality_gate"]["public_reader_authorized"])
            queue = {row["date"]: row for row in r["research_queue"]}
            self.assertEqual(
                queue["2027-01-05"]["observations"],
                ["INDEPENDENT_VESPERS_PRECEDENCE_DISAGREEMENT_REVIEW"],
            )
            self.assertIn("INDEPENDENT_RANK_DISAGREEMENT_REVIEW",
                          queue["2027-01-06"]["observations"])
            self.assertIn("SPECIAL_TRIDUUM_OR_ALL_SOULS_SOURCE_FORMAT_REVIEW",
                          queue["2026-11-02"]["observations"])
            self.assertIn("SPECIAL_TRIDUUM_OR_ALL_SOULS_SOURCE_FORMAT_REVIEW",
                          queue["2027-11-02"]["observations"])

    def test_wrong_congregation_cannot_be_relabelled_universal(self):
        with tempfile.TemporaryDirectory() as name:
            private, files = generate_inputs(Path(name))
            payload = json.loads(files[2026].read_text())
            payload["congregation"] = "fsspx"
            files[2026].write_text(json.dumps(payload))
            with self.assertRaisesRegex(
                ValueError,"INDEPENDENT_ORDO_CONGREGATIONAL_PROPER_UNEXPECTED"):
                audit.compare(private, files)

    def test_missing_and_duplicate_independent_days_fail_closed(self):
        with tempfile.TemporaryDirectory() as name:
            private, files = generate_inputs(Path(name))
            payload = json.loads(files[2026].read_text())
            payload["days"][1]["date"] = payload["days"][0]["date"]
            files[2026].write_text(json.dumps(payload))
            with self.assertRaisesRegex(ValueError,"DATE_INVALID_OR_DUPLICATE"):
                audit.compare(private, files)

    def test_unapproved_or_missing_source_hour_fails_closed(self):
        with tempfile.TemporaryDirectory() as name:
            private, files = generate_inputs(Path(name))
            path=private/"2027"/"01"/"09.json"
            payload=json.loads(path.read_text())
            payload["hours"].pop("Prima")
            path.write_text(json.dumps(payload))
            with self.assertRaisesRegex(ValueError,"INCOMPLETE_OR_PUBLICLY_AUTHORIZED"):
                audit.compare(private, files)

    def test_not_a_1961_printed_breviary_or_public_release_certificate(self):
        with tempfile.TemporaryDirectory() as name:
            private, files = generate_inputs(Path(name))
            result = audit.compare(private, files)
            self.assertFalse(result["quality_gate"]["calendar_disagreements_reviewed"])
            self.assertFalse(result["quality_gate"]["original_1961_breviary_collation_completed"])
            self.assertFalse(result["quality_gate"]["public_reader_authorized"])


if __name__ == "__main__":
    unittest.main()

#!/usr/bin/env python3
"""Stdlib tests for B92's XLSX parser and fail-closed integrity checks."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from zipfile import ZipFile

MODULE = Path(__file__).resolve().parents[1] / "tools" / "directory" / "validate-b91-research-core.py"
spec = importlib.util.spec_from_file_location("b92_core_validator", MODULE)
b92 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b92)

HEAD = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"

def fixture(path, body):
    workbook = (f'<workbook xmlns="{HEAD}"><sheets>'
                '<sheet name="TEST" sheetId="1"/></sheets></workbook>')
    sheet = f'<worksheet xmlns="{HEAD}"><sheetData>{body}</sheetData></worksheet>'
    with ZipFile(path, "w") as z:
        z.writestr("xl/workbook.xml", workbook)
        z.writestr("xl/worksheets/sheet1.xml", sheet)

class B92CoreGateTest(unittest.TestCase):
    def test_cell_reference_conversion(self):
        self.assertEqual(b92.col_index("A1"), 0)
        self.assertEqual(b92.col_index("Z8"), 25)
        self.assertEqual(b92.col_index("AA30"), 26)

    def test_reads_inline_values_without_external_libraries(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "test.xlsx"
            fixture(path,
                '<row r="1"><c r="A1" t="inlineStr"><is><t>ID</t></is></c>'
                '<c r="B1" t="inlineStr"><is><t>Name</t></is></c></row>'
                '<row r="2"><c r="A2" t="inlineStr"><is><t>RG-001</t></is></c>'
                '<c r="B2" t="inlineStr"><is><t>Church</t></is></c></row>')
            table = b92.read_workbook(path, {"TEST": (1, 2)})["TEST"]
            self.assertEqual(table[1], ("RG-001", "Church"))

    def test_formula_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "test.xlsx"
            fixture(path,
                '<row r="1"><c r="A1" t="inlineStr"><is><t>ID</t></is></c>'
                '<c r="B1" t="inlineStr"><is><t>Name</t></is></c></row>'
                '<row r="2"><c r="A2"><f>1+1</f><v>2</v></c>'
                '<c r="B2" t="inlineStr"><is><t>Church</t></is></c></row>')
            with self.assertRaisesRegex(b92.GateFailure, "Formula not permitted"):
                b92.read_workbook(path, {"TEST": (1, 2)})

    def test_extra_column_is_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / "test.xlsx"
            fixture(path,
                '<row r="1"><c r="A1" t="inlineStr"><is><t>ID</t></is></c>'
                '<c r="B1" t="inlineStr"><is><t>Name</t></is></c></row>'
                '<row r="2"><c r="C2"><v>0</v></c></row>')
            with self.assertRaisesRegex(b92.GateFailure, "Extra column"):
                b92.read_workbook(path, {"TEST": (1, 2)})

    def test_duplicate_ids_are_rejected(self):
        with self.assertRaisesRegex(b92.GateFailure, "duplicate ID"):
            b92.unique_nonblank(["RG-A", "RG-A"], "test")

    def test_unrecognized_workbooks_fail_before_import(self):
        with tempfile.TemporaryDirectory() as d:
            baseline = Path(d) / "baseline.xlsx"
            candidate = Path(d) / "candidate.xlsx"
            baseline.write_bytes(b"not an approved XLSX")
            candidate.write_bytes(b"not an approved XLSX")
            with self.assertRaisesRegex(b92.GateFailure, "checksum mismatch"):
                b92.verify(baseline, candidate)

if __name__ == "__main__":
    unittest.main()

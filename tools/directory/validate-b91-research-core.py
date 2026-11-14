#!/usr/bin/env python3
"""Read-only, fail-closed B82 -> B91 research-core import audit. Python 3 stdlib only.

No application import, timetable change, map publication, or network request.
"""
import argparse
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import re
import sys
from zipfile import ZipFile, BadZipFile
import xml.etree.ElementTree as ET

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
TABLES = {
    'CANONICAL SITES': (2576, 2581, 10),
    'PHYSICAL SITES': (2576, 2581, 15),
    'UNIFIED VENUES': (2679, 2684, 37),
    'MASS TIMES': (4681, 4681, 28),
}
SHEETS = {'B91 EFFECTIVE SITES': (2581, 5), 'B91 ALIAS LINKS': (5, 7)}
BASE_SHA = 'c74fb0e92a03b792867ec394bb3cabbb505aca3e55f8600c0c891aaf4cdfcc61'
NEXT_SHA = '1e52538a341f5e9576d967cf5c58ac9b409808f1b98dace41ff7066285002f57'
ADMISSIONS = {
    'RG-B88-F691777F8D8D': 'AO-B88-BR-001',
    'RG-B88-E491FACD85B9': 'AO-B88-BR-002',
    'RG-B88-D6480F7F32B7': 'AO-B88-BR-003',
    'RG-B88-60104C25870A': 'AO-B88-BR-004',
    'RG-B88-B1EB74BB63BD': 'AASJMV-EXT-001',
}
ALIASES = {
    'RG-E0C932E6CB74': 'RG-D9490DF575C9',
    'RG-FB8FE21E0732': 'RG-3EFF2C4A33C0',
    'RG-570BDEDA273D': 'RG-3EFF2C4A33C0',
    'RG-4BC0694A51BE': 'RG-2E1FB8361143',
    'RG-CF06C93617A1': 'RG-BF0D731A3654',
}

class GateFailure(Exception):
    pass

def require(condition, message):
    if not condition:
        raise GateFailure(message)

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def col_index(reference):
    letters = re.match(r'^[A-Z]+', reference)
    require(letters is not None, f'Bad Excel cell reference {reference!r}')
    v = 0
    for ch in letters.group():
        v = 26 * v + ord(ch) - 64
    return v - 1

def read_workbook(path, requested):
    """Resolve shared and inline strings to values; reject formulas in source tables."""
    result = {}
    try:
        with ZipFile(path) as z:
            require(z.testzip() is None, 'Corrupt XLSX ZIP archive')
            info = {entry.filename: entry for entry in z.infolist()}
            require('xl/workbook.xml' in info, 'Missing workbook.xml')
            require(all(entry.file_size <= 40_000_000 for entry in info.values()),
                    'Oversized XLSX member')
            root = ET.fromstring(z.read('xl/workbook.xml'))
            names = [s.get('name') for s in root.findall('.//' + NS + 'sheet')]
            shared = []
            if 'xl/sharedStrings.xml' in info:
                shared_root = ET.fromstring(z.read('xl/sharedStrings.xml'))
                shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
                          for si in shared_root]
            for name, (count, width) in requested.items():
                require(names.count(name) == 1, f'Expected one worksheet {name!r}')
                position = names.index(name) + 1
                sheet_path = f'xl/worksheets/sheet{position}.xml'
                require(sheet_path in info, f'Missing worksheet bytes for {name!r}')
                sheet = ET.fromstring(z.read(sheet_path))
                data = sheet.find('.//' + NS + 'sheetData')
                require(data is not None, f'No cells in {name!r}')
                rows = []
                for r in data:
                    cells = [''] * width
                    for c in r:
                        ref = c.get('r', '')
                        i = col_index(ref)
                        require(i < width, f'Extra column {ref} in {name}')
                        require(c.find(NS + 'f') is None,
                                f'Formula not permitted in {name}!{ref}')
                        text = ''
                        inline = c.find(NS + 'is')
                        v = c.find(NS + 'v')
                        if inline is not None:
                            text = ''.join(t.text or '' for t in inline.iter(NS + 't'))
                        elif v is not None:
                            text = v.text or ''
                            if c.get('t') == 's':
                                require(text.isdigit() and int(text) < len(shared),
                                        f'Invalid shared string at {name}!{ref}')
                                text = shared[int(text)]
                            elif c.get('t') not in ('str', 'e', 'b') and text:
                                try:
                                    text = format(Decimal(text).normalize(), 'f')
                                except InvalidOperation:
                                    pass
                        cells[i] = text
                    rows.append(tuple(cells))
                require(len(rows) == count + 1,
                        f'{name}: {len(rows)-1} data rows, expected {count}')
                require(len(set(rows[0])) == width,
                        f'{name}: missing/duplicate headers')
                result[name] = tuple(rows)
    except (BadZipFile, ET.ParseError, KeyError, OSError) as e:
        raise GateFailure(f'Cannot read XLSX {path}: {e}') from e
    return result

def unique_nonblank(values, what):
    require(all(values), f'{what}: blank ID')
    require(len(values) == len(set(values)), f'{what}: duplicate ID')

def verify(baseline, successor):
    require(sha256(baseline) == BASE_SHA,
            'B82 checksum mismatch; refuses other baseline')
    require(sha256(successor) == NEXT_SHA,
            'B91 checksum mismatch; refuses altered/unreviewed successor')
    old = read_workbook(baseline, {k: (v[0], v[2]) for k,v in TABLES.items()})
    new = read_workbook(successor, {
        **{k: (v[1], v[2]) for k,v in TABLES.items()}, **SHEETS
    })
    for name, (old_count, _, _) in TABLES.items():
        require(old[name] == new[name][:old_count+1],
                f'{name}: inherited rows changed or reordered')

    canonical = new['CANONICAL SITES'][1:]
    physical = new['PHYSICAL SITES'][1:]
    venues = new['UNIFIED VENUES'][1:]
    mass = new['MASS TIMES'][1:]
    effective = new['B91 EFFECTIVE SITES'][1:]
    alias_rows = new['B91 ALIAS LINKS'][1:]
    group_ids = [r[0] for r in canonical]
    phys_ids = [r[0] for r in physical]
    source_ids = [r[0] for r in venues]
    unique_nonblank(group_ids, 'Canonical group IDs')
    unique_nonblank(phys_ids, 'Physical group IDs')
    unique_nonblank(source_ids, 'Venue source IDs')
    require(group_ids == phys_ids, 'Physical and canonical ID order diverged')

    for i, (group, source) in enumerate(ADMISSIONS.items()):
        can, phy, v = canonical[-5+i], physical[-5+i], venues[-5+i]
        require(can[0] == phy[0] == group,
                f'{group}: canonical/physical group mismatch')
        require(phy[1] == v[0] == source,
                f'{group}: source lineage mismatch')
        require(can[1] == phy[3] == v[5] == 'BR',
                f'{group}: wrong country')
        require('RESEARCH_ONLY' in can[7],
                f'{group}: incorrectly promoted canonical site')
        require(phy[12] == '' and 'HOLD_NOT_PUBLIC' in phy[13],
                f'{group}: unapproved Place ID or pin')
        require(v[16] == v[17] == v[19] == '',
                f'{group}: unexpected coordinates/public Place ID')
        require(v[22] in ('', '0') and v[23] in ('', '0'),
                f'{group}: claimed verified schedule')
        require('HOLD_NOT_PUBLIC' in v[32],
                f'{group}: public source publication not allowed')
        require(can[9].startswith('https://'),
                f'{group}: missing source URL')

    actual_aliases = {r[0]: r[1] for r in alias_rows}
    require(len(alias_rows) == len(ALIASES) and actual_aliases == ALIASES,
            'Alias overlay has unexpected identity links')
    unique_nonblank([r[0] for r in alias_rows], 'Alias group IDs')
    require(all(a in group_ids and t in group_ids for a,t in actual_aliases.items()),
            'Alias points to unknown ID')
    require(not any(t in actual_aliases for t in actual_aliases.values()),
            'Alias chain/cycle is forbidden')
    effective_ids = [r[0] for r in effective]
    unique_nonblank(effective_ids, 'Effective-site IDs')
    require(effective_ids == group_ids,
            'Effective sites do not cover every historical group in order')
    for r in effective:
        expected = actual_aliases.get(r[0], r[0])
        require(r[1] == expected, f'Incorrect effective physical anchor for {r[0]}')
        require(r[2] == ('ALIAS' if r[0] in actual_aliases else 'ANCHOR'),
                'Incorrect alias/anchor status')
        require('RESEARCH_ONLY' in r[4], 'Unexpectedly promoted effective site')
    distinct = len(set(r[1] for r in effective))
    require(distinct == 2576 and len(actual_aliases) == 5,
            'Incorrect unique physical-site count')
    require(sum(r[19] == 'VERIFIED' for r in mass) == 3347,
            'Previously verified timetable count differs')
    new_sources = set(ADMISSIONS.values())
    require(not any(row[1] in new_sources for row in mass),
            'New research site silently received Mass timetable')
    return {
        'schema': 'AO_B92_RESEARCH_IMPORT_GATE_V1',
        'publication_state': 'RESEARCH_ONLY_NOT_PUBLIC',
        'status': 'PASS',
        'baseline_sha256': BASE_SHA,
        'candidate_sha256': NEXT_SHA,
        'inherited_tables_equal': list(TABLES),
        'historical_canonical_records': len(canonical),
        'venue_source_records': len(venues),
        'timetable_rows_unchanged': len(mass),
        'previously_verified_rows_unchanged': 3347,
        'provisional_distinct_sites': distinct,
        'new_site_groups': [{'group_id':g,'source_id':s}
                            for g,s in ADMISSIONS.items()],
        'same_building_aliases': [{'alias_group_id':a,'anchor_group_id':t}
                                  for a,t in ALIASES.items()],
        'new_public_place_ids': 0,
        'new_verified_schedule_rows': 0,
        'production_imported': False,
        'next_gate': 'Separate exact-site geocoding, source and map publication acceptance',
    }

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True, type=Path)
    parser.add_argument('--candidate', required=True, type=Path)
    parser.add_argument('--report', type=Path,
                        help='Optional JSON audit artifact; never a production database')
    args = parser.parse_args(argv)
    try:
        out = verify(args.baseline, args.candidate)
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n',
                                   encoding='utf-8')
        print(json.dumps(out, indent=2, ensure_ascii=False))
        return 0
    except GateFailure as e:
        print(f'B92 BLOCKED: {e}', file=sys.stderr)
        return 2

if __name__ == '__main__':
    sys.exit(main())

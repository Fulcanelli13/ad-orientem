#!/usr/bin/env python3
"""B93: B82/B91 -> Find research staging, NEVER a production importer.

Requires tools/directory/validate-b91-research-core.py from B92. No app
Directory venue IDs, map coordinates, ministries or schedules are emitted.
"""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

NEW = {
    'RG-B88-F691777F8D8D': 'AO-B88-BR-001',
    'RG-B88-E491FACD85B9': 'AO-B88-BR-002',
    'RG-B88-D6480F7F32B7': 'AO-B88-BR-003',
    'RG-B88-60104C25870A': 'AO-B88-BR-004',
    'RG-B88-B1EB74BB63BD': 'AASJMV-EXT-001',
}
SCHEMA = 'AO_B93_FIND_RESEARCH_STAGING_DRY_RUN_V1'
BLOCKED = ('/data/directory/generated/', '/src/find/', '/data/directory/licensed/')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load_b92(file):
    file = Path(file).resolve()
    require(file.is_file(), f'Missing B92 acceptance gate: {file}')
    spec = importlib.util.spec_from_file_location('b92_core_gate', file)
    require(spec is not None and spec.loader is not None, 'Cannot import B92 gate')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def app_source_inventory(repo_root):
    directory = Path(repo_root).resolve() / 'data/directory/generated/v19'
    require(directory.is_dir(), f'Missing v19 provider snapshots: {directory}')
    indexed = {}
    for file in sorted(directory.glob('*.json')):
        obj = json.loads(file.read_text(encoding='utf-8'))
        require(isinstance(obj, dict) and isinstance(obj.get('records', []), list),
                f'Invalid provider snapshot {file}')
        for row in obj.get('records', []):
            require(isinstance(row, dict), f'Invalid source row {file}')
            source_id = str(row.get('u') or '').strip()
            if source_id:
                indexed.setdefault(source_id, []).append({
                    'provider_file': file.name, 'provider': obj.get('provider'),
                    'name': row.get('n'), 'country': row.get('cc'),
                    'address': row.get('a'),
                })
    require(indexed, 'Empty v19 source inventory')
    return indexed


def make_stage(b82, b91, repo_root, b92_path):
    b92 = load_b92(b92_path)
    verdict = b92.verify(Path(b82), Path(b91))
    require(verdict['status'] == 'PASS', 'B92 parity gate did not pass')
    sheets = b92.read_workbook(Path(b91), {
        'CANONICAL SITES': (2581, 10),
        'PHYSICAL SITES': (2581, 15),
        'UNIFIED VENUES': (2684, 37),
    })
    canonical = {row[0]: row for row in sheets['CANONICAL SITES'][1:]}
    physical = {row[0]: row for row in sheets['PHYSICAL SITES'][1:]}
    venues = {row[0]: row for row in sheets['UNIFIED VENUES'][1:]}
    app = app_source_inventory(repo_root)
    items = []
    for group_id, source_id in NEW.items():
        can = canonical.get(group_id)
        phy = physical.get(group_id)
        ven = venues.get(source_id)
        require(can and phy and ven, f'Missing B91 source/physical lineage: {group_id}/{source_id}')
        require(can[0] == phy[0] == ven[34] == group_id, 'Physical research ID mismatch')
        require(phy[1] == ven[0] == ven[36] == source_id, 'Frozen source ID mismatch')
        require(can[1] == phy[3] == ven[5] == 'BR', 'Unexpected country')
        require(can[2] == phy[4] == ven[4], 'Conflicting building names')
        require(can[3] == phy[5] == ven[7], 'Conflicting physical addresses')
        require(not phy[12] and not ven[19], 'Unapproved public Place ID')
        require(all(not ven[i] for i in (16, 17, 18)), 'Unexpected public coordinates')
        require(ven[22] in ('0', '') and ven[23] in ('0', ''), 'Unexpected schedule verification')
        require(can[7] == 'RESEARCH_ONLY_NOT_PUBLIC', 'Research state missing')
        require('HOLD_NOT_PUBLIC' in phy[13] and 'HOLD_NOT_PUBLIC' in ven[32],
                'Release gate not closed')
        require(can[9].startswith('https://') and ven[25].startswith('https://'),
                'Owner/source URL missing')
        existing = app.get(source_id, [])
        # Intentionally lacks venue_id and geo: auditVenue must fail if an
        # engineer mistakenly sends a preview to publishableDirectoryRecords.
        preview = {
            'name': {'official': can[2], 'alternate': []},
            'address': {
                'line1': can[3], 'city': ven[6], 'country_code': 'BR',
                'formatted': can[3],
            },
            'upstream': {
                'provider': 'AO_B91_RESEARCH_ONLY',
                'upstream_id': source_id, 'historical_group_id': group_id,
            },
            'publication_state': 'RESEARCH_ONLY_NOT_PUBLIC',
        }
        items.append({
            'research_group_id': group_id,
            'frozen_source_id': source_id,
            'staging_classification': (
                'EXISTING_APP_PROVIDER_SOURCE_NO_SECOND_VENUE' if existing
                else 'RESEARCH_ONLY_IDENTITY_AND_SCHEDULE_REVIEW'
            ),
            'app_provider_source_collisions': existing,
            'source_urls': list(dict.fromkeys(
                u for u in (ven[25], ven[26], ven[27]) if u.startswith('https://')
            )),
            'preview_unpublishable_fields': preview,
            'missing_release_gates': [
                'EXACT_PHYSICAL_GEO_PROVENANCE',
                'CURRENT_SCHEDULE_VERIFICATION',
                'PRODUCTION_PUBLICATION_REVIEW',
            ],
            'public_place_id': None,
            'new_verified_schedule_rows': 0,
            'dry_run_only': True,
        })
    require(len(items) == 5 and len({x['frozen_source_id'] for x in items}) == 5,
            'Unexpected staging count or duplicate source ID')
    require(any(x['frozen_source_id'] == 'AASJMV-EXT-001'
                and x['app_provider_source_collisions'] for x in items),
            'Expected existing live AASJMV source; do not mint second venue')
    return {
        'schema': SCHEMA, 'status': 'PASS_DRY_RUN_NO_PUBLISH',
        'b82_sha256': verdict['baseline_sha256'],
        'b91_sha256': verdict['candidate_sha256'],
        'operational_counts': {
            'research_distinct_sites': 2576, 'canonical_historical_ids': 2581,
            'venue_source_ids': 2684, 'original_timetable_rows': 4681,
            'previously_verified_timetable_rows': 3347,
        },
        'staged_source_count': len(items),
        'existing_app_provider_source_collisions': sum(
            bool(x['app_provider_source_collisions']) for x in items
        ),
        'new_app_venues_published': 0, 'new_app_schedules_published': 0,
        'no_generated_or_src_find_files_modified': True,
        'risk': (
            'src/find/data-service.js publishableDirectoryRecords does not '
            'universally filter publication_state. NEVER load this preview '
            'as a provider dataset.'
        ),
        'records': items,
        'next_gate': (
            'Per-building exact-source geometry, current 1962 schedule review '
            'and separate explicit publication approval'
        ),
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True, type=Path)
    parser.add_argument('--candidate', required=True, type=Path)
    parser.add_argument('--repo-root', required=True, type=Path)
    parser.add_argument('--b92-validator', type=Path,
                        default=Path(__file__).with_name('validate-b91-research-core.py'))
    parser.add_argument('--report', type=Path)
    options = parser.parse_args(argv)
    try:
        if options.report:
            out = options.report.resolve()
            root = options.repo_root.resolve()
            relative = (
                '/' + str(out.relative_to(root)).replace('\\', '/') + '/'
                if out.is_relative_to(root) else ''
            )
            require(not any(p in relative for p in BLOCKED),
                    'Refusing output inside a live/generated directory')
            require(not out.exists(), 'Refusing overwrite of an existing output')
        report = make_stage(options.baseline, options.candidate,
                            options.repo_root, options.b92_validator)
        if options.report:
            options.report.parent.mkdir(parents=True, exist_ok=True)
            options.report.write_text(
                json.dumps(report, ensure_ascii=False, indent=2) + '\n',
                encoding='utf-8'
            )
        print(json.dumps({k: v for k, v in report.items() if k != 'records'},
                         ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f'B93 HOLD: {error}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())

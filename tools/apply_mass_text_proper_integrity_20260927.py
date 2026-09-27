from pathlib import Path
from runpy import run_path
import re

BUILD = "v43.59.31-TEXT-PROPER-INTEGRITY-V1"

core_path = Path('tools/apply_mass_text_proper_integrity_20260927_core.py')
core = core_path.read_text(encoding='utf-8')

def strip_core_block(pattern, label):
    global core
    core, n = re.subn(pattern, '\n# skipped obsolete ' + label + '\n', core, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f'could not bypass {label}: {n}')

strip_core_block(r'\nreplace_once\(\n\s+\'if \(id === "__TOP__".+?\n\s+"preparatory-section filtering"\n\)\n', 'preparatory-section filtering')
strip_core_block(r'\nreplace_once\(\n\s+\'    pushExpected\("Epistle / Lesson".+?\n\s+"coverage for actual pre-Gospel chants"\n\)\n', 'coverage for actual pre-Gospel chants')
strip_core_block(r'\ncoverage_pattern = r\'\'\'.+?sub_once\(coverage_pattern, coverage_replacement, "LA/EN/FR Proper coverage"\)\n', 'LA/EN/FR Proper coverage rewrite')
strip_core_block(r'\nreplace_once\(\n\s+"    if \(/\^Sancti.+?\n\s+"Requiem profile detection"\n\)\n', 'Requiem profile detection')
strip_core_block(r'\nreplace_once\(\n\s+"        requiem_1962:.+?\n\s+"Requiem exceptional profile map"\n\)\n', 'Requiem exceptional profile map')
strip_core_block(r'\nreplace_once\(\n\s+\'    steps = steps\.map\(step => attachProper.+?\n\s+"dynamic pre-Gospel sequence insertion"\n\)\n', 'dynamic pre-Gospel sequence insertion')
strip_core_block(r'\nreplace_once\(\n\s+"    const rawEvents = .+?\n\s+"separate live projection from reader projection"\n\)\n', 'separate live projection from reader projection')
strip_core_block(r'\nreplace_once\(\n\s+"        const priorEvents = .+?\n\s+"canonical continuation history"\n\)\n', 'canonical continuation history')
strip_core_block(r'\nreplace_once\(\n\s+"        soundscape: .+?\n\s+"live soundscape projection"\n\)\n', 'live soundscape projection')
strip_core_block(r'\nreplace_once\(\n\s+"        textBlocks: events\.map.+?\n\s+"canonical reader text blocks"\n\)\n', 'canonical reader text blocks')

replacement_code = '''
pre_gospel_pattern = r'const gradualId = firstExisting\\(sources, (?:\\["Graduale", "GradualeP", "Tractus"\\]|"Graduale", "GradualeP", "Tractus")\\);\\n    const proper = \\{'
pre_gospel_replacement = 'const preGospelChants = preGospelChantsFrom(sources);\\n    const proper = {'
text, count = re.subn(pre_gospel_pattern, pre_gospel_replacement, text, count=1)
if count != 1:
    raise SystemExit(f"pre-Gospel source resolver: expected exactly 1 match, found {count}")
print("patched: pre-Gospel source resolver")
'''
core, n = re.subn(
    r'\nreplace_once\(\n\s+\'const gradualId = firstExisting\(sources, \["Graduale", "GradualeP", "Tractus"\]\);.+?\n\s+"pre-Gospel source resolver"\n\)\n',
    lambda m: '\n' + replacement_code,
    core,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit(f'could not replace obsolete pre-Gospel resolver patch: {n}')

tmp = Path('/tmp/apply_mass_text_proper_integrity_core_runtime.py')
tmp.write_text(core, encoding='utf-8')
run_path(str(tmp), run_name='__main__')
run_path('tools/apply_mass_text_proper_integrity_corrections_20260927.py', run_name='__main__')

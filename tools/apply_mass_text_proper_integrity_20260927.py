from pathlib import Path
from runpy import run_path
import re

BUILD = "v43.59.31-TEXT-PROPER-INTEGRITY-V1"

core_path = Path('tools/apply_mass_text_proper_integrity_20260927_core.py')
core = core_path.read_text(encoding='utf-8')
core, n = re.subn(
    r'\nreplace_once\(\n\s+\'if \(id === "__TOP__".+?\n\s+"preparatory-section filtering"\n\)\n',
    '\n# preparatory-section filtering already equivalent in current production source; no rewrite required\n',
    core,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit(f'could not bypass obsolete preparatory-section filtering patch: {n}')
core = core.replace(
    'firstExisting(sources, ["Graduale", "GradualeP", "Tractus"])',
    'firstExisting(sources, "Graduale", "GradualeP", "Tractus")',
)
tmp = Path('/tmp/apply_mass_text_proper_integrity_core_runtime.py')
tmp.write_text(core, encoding='utf-8')
run_path(str(tmp), run_name='__main__')
run_path('tools/apply_mass_text_proper_integrity_corrections_20260927.py', run_name='__main__')

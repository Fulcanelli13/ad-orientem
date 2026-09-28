from runpy import run_path

# Each guarded patch is independently idempotent. Several legacy patch scripts
# signal "already applied" with SystemExit(0); runpy would otherwise propagate
# that exit and silently prevent every later integrity pass from running.
def run_guarded(path):
    try:
        run_path(path, run_name='__main__')
    except SystemExit as exc:
        code = exc.code
        if code not in (None, 0):
            raise
        print(f'{path}: already satisfied; continuing patch chain.')

for patch in [
    'tools/apply_emergency_stable_v4333_core.py',
    'tools/apply_text_proper_integrity.py',
    'tools/apply_mass_text_proper_integrity.py',
    'tools/apply_gospel_text_integrity.py',
    'tools/apply_mass_reader_projection_integrity.py',
    'tools/apply_sequence_graph_integrity.py',
    'tools/apply_pregospel_graph_integrity.py',
    'tools/apply_today_mass_overview_integrity.py',
]:
    run_guarded(patch)

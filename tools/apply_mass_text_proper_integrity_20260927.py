from runpy import run_path

BUILD = "v43.59.31-TEXT-PROPER-INTEGRITY-V1"
# trigger corrected integrity patch

run_path('tools/apply_mass_text_proper_integrity_20260927_core.py', run_name='__main__')
run_path('tools/apply_mass_text_proper_integrity_corrections_20260927.py', run_name='__main__')

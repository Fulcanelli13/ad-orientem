from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-reader-projection-integrity-20260927-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Mass reader projection integrity patch already applied.')
    raise SystemExit(0)

# The persistent reader and the VOX/live projection are different contracts.
# Keep canonical appointed text explicitly on every resolved step so quiet/silent
# audibility can never erase the Missal-reading surface.
old = '''        if (resolved)
            out.text = resolved;
        else
            delete out.text;
        if (out.id === "secret")
            out.audibleFragment = secretConclusion;'''
new = '''        if (resolved) {
            out.text = resolved;
            // Canonical appointed text belongs to the persistent reader. VOX may
            // project only what is heard, but must never become text authority.
            out.canonicalText = resolved;
        }
        else {
            delete out.text;
            delete out.canonicalText;
        }
        if (out.id === "secret")
            out.audibleFragment = secretConclusion;'''
if s.count(old) != 1:
    raise RuntimeError(f'attachProper canonical-text anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''    if (mode === "missal") {
        if (step.properStatus === "unavailable" && step.properSlot)
            events.push(unavailable(step, step.properSlot, step.actor));
        else if (step.text)
            events.push({ stepId: step.id, kind: "altar", actor: step.actor, text: step.text, properSlot: step.properSlot });
        events.push(...choir);
        return { mode, stepId: step.id, events };
    }
    // VOX: choir is always part of what is actually heard.'''
new = '''    if (mode === "missal") {
        if (step.properStatus === "unavailable" && step.properSlot)
            events.push(unavailable(step, step.properSlot, step.actor));
        else {
            const canonical = step.canonicalText || step.text;
            if (canonical)
                events.push({ stepId: step.id, kind: "altar", actor: step.actor, text: canonical, properSlot: step.properSlot });
        }
        events.push(...choir);
        return { mode, stepId: step.id, events };
    }
    // VOX is a perceptibility projection only. It deliberately uses audibility
    // below; it is not the authority for whether canonical Mass text exists.
    // VOX: choir is always part of what is actually heard.'''
if s.count(old) != 1:
    raise RuntimeError(f'projectStep missal/VOX separation anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Validate the new field as canonical Text3 data rather than leaving it invisible
# to the existing Mass sequence validator.
old = '''    validateText3(step.text, `${path}.text`, issues);
    validateText3(step.audibleFragment, `${path}.audibleFragment`, issues);'''
new = '''    validateText3(step.text, `${path}.text`, issues);
    validateText3(step.canonicalText, `${path}.canonicalText`, issues);
    validateText3(step.audibleFragment, `${path}.audibleFragment`, issues);'''
if s.count(old) != 1:
    raise RuntimeError(f'canonicalText validator anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Add marker adjacent to the projection function for deterministic idempotence.
anchor = 'function projectStep(step, mode) {'
if s.count(anchor) != 1:
    raise RuntimeError(f'projectStep marker anchor: expected 1 match, found {s.count(anchor)}')
s = s.replace(anchor, f'/* {SENTINEL} */\n' + anchor, 1)

for invariant in [
    SENTINEL,
    'out.canonicalText = resolved;',
    'const canonical = step.canonicalText || step.text;',
    'validateText3(step.canonicalText, `${path}.canonicalText`, issues);',
    'out.audibleFragment = secretConclusion;',
]:
    if invariant not in s:
        raise RuntimeError(f'Mass reader projection invariant missing: {invariant}')

# Secret is the regression fixture for the defect: canonical text must be retained
# while its audible conclusion remains a separate VOX fragment.
if 'case "secrets": return (0, ordinary_1.concatText3)(normaliseList(proper.secrets));' not in s:
    raise RuntimeError('Secret canonical Proper resolver missing')
if 'if (step.audibility === "audible")' not in s or 'else if (step.audibility === "mixed")' not in s:
    raise RuntimeError('VOX audibility projection contract unexpectedly changed')

PATH.write_text(s, encoding='utf-8')
print('Applied Mass reader/VOX projection integrity patch.')

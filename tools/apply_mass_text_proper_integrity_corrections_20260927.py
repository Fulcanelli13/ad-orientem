from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_interlection = '''function buildOrderedInterlection(sources){
    const gradualId = firstExisting(sources, "Graduale", "GradualeP", "Tractus");
    const raw = gradualId ? textFrom(sources, gradualId) : {};
    if (!hasText3(raw)) return [];
    if (gradualId === "Tractus") return [{kind:"tract", text:raw}];
    const first = splitText3AtAlleluia(raw);
    if (hasText3(first.before) && hasText3(first.after)) return [{kind:"gradual", text:first.before}, {kind:"alleluia", text:first.after}];
    if (startsWithAlleluia(raw)) return [{kind:"alleluia", text:raw}];
    return [{kind:"gradual", text:raw}];
  }'''
new_interlection = '''function buildOrderedInterlection(sources){
    const ids = [];
    const gradual = textFrom(sources, "Graduale");
    const gradualP = textFrom(sources, "GradualeP");
    const tract = textFrom(sources, "Tractus");
    if (hasText3(gradual)) ids.push("Graduale");
    else if (hasText3(gradualP)) ids.push("GradualeP");
    if (hasText3(tract)) ids.push("Tractus");
    const out = [];
    ids.forEach(id => {
      const raw = textFrom(sources, id);
      if (!hasText3(raw)) return;
      if (id === "Tractus") { out.push({kind:"tract", text:raw}); return; }
      const first = splitText3AtAlleluia(raw);
      if (hasText3(first.before) && hasText3(first.after)) {
        out.push({kind:"gradual", text:first.before}, {kind:"alleluia", text:first.after});
      } else if (startsWithAlleluia(raw)) {
        out.push({kind:"alleluia", text:raw});
      } else {
        out.push({kind:"gradual", text:raw});
      }
    });
    return out;
  }'''
if old_interlection not in s:
    raise SystemExit('patched buildOrderedInterlection block not found')
s = s.replace(old_interlection, new_interlection, 1)

old_gospel = 'return concatText3([body, proper?.riteProfile === "requiem_mass_1962" ? {} : GOSPEL_CONCLUSION]);'
new_gospel = 'return concatText3([body, GOSPEL_CONCLUSION]);'
if old_gospel not in s:
    raise SystemExit('patched gospel conclusion branch not found')
s = s.replace(old_gospel, new_gospel, 1)

old_project = '''function projectStep(step, mode){
    const base = {stepId:step.id, title:step.title, actor:step.actor, audibility:step.audibility, mainText:step.text};
    if(mode==="MISSAL") return [{...base, kind:"altar", text:step.text, audible:step.audibility!=="quiet"}];
    if(step.actor==="schola") return [{...base, kind:"choir", text:step.text, audible:true}];
    if(step.audibility==="mixed" && step.audibleFragment){
      return [
        {...base, kind:"altar", text:step.text, audible:false, canonical:true},
        {...base, kind:"altar", text:step.audibleFragment, audible:true, liveFragment:true}
      ];
    }
    if(step.audibility==="quiet") return [{...base, kind:"altar", text:step.text, audible:false, canonical:true}];
    return [{...base, kind:"altar", text:step.text, audible:true}];
  }'''
new_project = '''function projectStep(step, mode){
    const base = {
      stepId:step.id,
      title:step.title,
      actor:step.actor,
      audibility:step.audibility,
      mainText:step.text,
      audibleFragment:step.audibleFragment || null
    };
    if(mode==="MISSAL") return [{...base, kind:"altar", text:step.text, audible:step.audibility!=="quiet"}];
    if(step.actor==="schola") return [{...base, kind:"choir", text:step.text, audible:true}];
    return [{
      ...base,
      kind:"altar",
      text:step.text,
      audible:step.audibility==="audible",
      canonical:true,
      liveText:step.audibility==="mixed" ? (step.audibleFragment || null) : (step.audibility==="audible" ? step.text : null)
    }];
  }'''
if old_project not in s:
    raise SystemExit('patched projectStep block not found')
s = s.replace(old_project, new_project, 1)

s = s.replace('if (proper?.riteProfile !== "requiem_mass_1962") return steps;', 'if (proper?.riteProfile !== "requiem_mass_1962" && !proper?.isRequiem) return steps;', 1)

if 'steps = insertResolvedPreGospel(steps, proper, properAvailable, options.form);' not in s:
    s, n = re.subn(r'(\n\s*steps = steps\.map\(step => attachProper\(step, proper, properAvailable\)\);)', r'\1\n    steps = insertResolvedPreGospel(steps, proper, properAvailable, options.form);', s, count=1)
    if n != 1:
        raise SystemExit(f'could not wire dynamic pre-Gospel sequence: {n}')

sung_strip = '''    if (form === 'sung') {
        const gospel = out.find(step => step.id === 'gospel');
        if (gospel) {
            gospel.text = stripLausTibi(gospel.text);
            gospel.variantNoteId = 'requiem-sung-no-laus-tibi';
        }
    }
'''
if sung_strip in s:
    s = s.replace(sung_strip, '', 1)

p.write_text(s, encoding='utf-8')
print('Applied text/Proper integrity corrections: multi-section interlection, Gospel conclusion, single-surface VOX projection, Requiem fallback, dynamic chant wiring, Gospel response retained.')

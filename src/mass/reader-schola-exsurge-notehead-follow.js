// Map sounded GABC source-note ordinals onto *actual* Exsurge SVG noteheads.
// This is a research visual cursor, not a source-score approval or a singing
// observer. Refuse mismatched/partial SVGs; never guess geometrical proximity.
// Exsurge's pinned renderer emits scoped <use class="note" id="note-N"> nodes.
// Each source ordinal is stable through explicit performance repetitions.
export function mapExsurgeSvgNoteheads(svg,compiled){
  const expected=compiled?.sourceNotes;
  if(!svg?.querySelectorAll||!Array.isArray(expected)||!expected.length||
    expected.length>20000||!svg.classList?.contains('Exsurge'))return [];
  const candidates=[...svg.querySelectorAll('use.note[id^="note-"]')];
  if(candidates.length!==expected.length)return [];
  let lastSourceIndex=-1;
  const seen=new Set();
  for(let i=0;i<candidates.length;i++){
    const glyph=candidates[i];
    const ordinal=i+1;
    const sourceIndex=Number(glyph.getAttribute('source-index'));
    const elementIndex=Number(glyph.getAttribute('element-index'));
    const href=glyph.getAttribute('href')||
      glyph.getAttribute('xlink:href')||
      glyph.getAttributeNS?.('http://www.w3.org/1999/xlink','href');
    if(glyph.id!=='note-'+ordinal||seen.has(glyph.id)||
      expected[i]?.sourceNoteOrdinal!==ordinal||
      !Number.isInteger(sourceIndex)||sourceIndex<=lastSourceIndex||
      !Number.isInteger(elementIndex)||elementIndex<0||
      typeof href!=='string'||!href.startsWith('#')||
      !glyph.closest?.('g.ChantNotationElement'))return [];
    seen.add(glyph.id);lastSourceIndex=sourceIndex;
  }
  for(let i=0;i<candidates.length;i++){
    candidates[i].dataset.scholaSourceNoteOrdinal=String(i+1);
  }
  return candidates;
}
export function createExsurgeNoteheadFollower({staff,compiled}={}){
  if(!staff?.querySelector||!compiled?.sourceNotes?.length)
    throw new TypeError('Staff and compiled source required');
  let targets=[],currentSvg=null,sourceOrdinal=0,mapped=false,destroyed=false;
  const unmark=()=>{
    for(const glyph of targets)glyph.removeAttribute('data-schola-notehead-active');
  };
  function refresh(){
    if(destroyed)return false;
    const next=staff.querySelector('svg');
    // The engraver may replace the entire SVG during a responsive reflow.
    if(!next){unmark();currentSvg=null;targets=[];mapped=false;return false;}
    if(next!==currentSvg){
      unmark();currentSvg=next;
      targets=mapExsurgeSvgNoteheads(next,compiled);
      mapped=targets.length===compiled.sourceNotes.length;
    }
    staff.dataset.scholaNoteheadsMapped=String(mapped);
    return mapped;
  }
  function paint(ordinal){
    sourceOrdinal=Number.isInteger(ordinal)?ordinal:0;
    if(!refresh())return false;
    if(sourceOrdinal<1||sourceOrdinal>targets.length){
      unmark();staff.dataset.scholaActiveNotehead='';return false;
    }
    const active=targets[sourceOrdinal-1];
    for(let i=0;i<targets.length;i++){
      if(i===sourceOrdinal-1)targets[i].dataset.scholaNoteheadActive='true';
      else targets[i].removeAttribute('data-schola-notehead-active');
    }
    staff.dataset.scholaActiveNotehead=String(sourceOrdinal);
    const viewport=staff.getBoundingClientRect?.();
    const box=active.getBoundingClientRect?.();
    if(viewport?.height>1&&viewport?.width>1&&box?.width>0&&box?.height>0){
      // Scroll to the actual sung notehead rather than its lyric syllable;
      // skip geometry entirely while the score is minimised.
      if(box.top<viewport.top+5||box.bottom>viewport.bottom-5)
        staff.scrollTop+=box.top-viewport.top-
          (viewport.height-box.height)/2;
      if(box.left<viewport.left+5||box.right>viewport.right-5)
        staff.scrollLeft+=box.left-viewport.left-
          (viewport.width-box.width)/2;
    }
    return true;
  }
  function destroy(){
    if(destroyed)return;destroyed=true;unmark();targets=[];currentSvg=null;
    delete staff.dataset.scholaActiveNotehead;
    delete staff.dataset.scholaNoteheadsMapped;
  }
  return Object.freeze({
    paint,refresh,destroy,
    getState:()=>Object.freeze({mapped,sourceOrdinal,
      glyphCount:targets.length,destroyed})
  });
}

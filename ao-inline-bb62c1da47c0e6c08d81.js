
(function(){
  'use strict';
  const ICON_IDS={kneel:'ao-posture-kneel',stand:'ao-posture-stand',bow:'ao-posture-bow',genuflect:'ao-posture-genuflect'};
  const ICON_CACHE={};
  const SOURCES={
    baltimoreAngelus:{label:'Manual of Prayers for the Use of the Catholic Laity · Baltimore 1888',url:'https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers'},
    baltimoreRosary:{label:'Manual of Prayers for the Use of the Catholic Laity · Rosary · 1888',url:'https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/The_Rosary_of_the_Blessed_Virgin_Mary'},
    piusXConfession:{label:'Catechism of St Pius X · Sacrament of Penance',url:'https://www.catechism.cc/catechisms/Catechism_of_Pope_Saint_Pius_X.html'},
    confiteor:{label:'Traditional Roman Confiteor practice',url:'https://www.newadvent.org/cathen/02751a.htm'},
    baltimoreStations:{label:'Manual of Prayers for the Use of the Catholic Laity · Stations · 1888',url:'https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/The_Stations_of_the_Cross'},
    moranStations:{label:'Patrick F. Moran · Catholic Prayer Book and Manual of Meditations · 1883',url:'https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/Another_Devout_Method_of_the_Stations_of_the_Cross'},
    baltimoreBenediction:{label:'Manual of Prayers for the Use of the Catholic Laity · Benediction · 1888',url:'https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Benediction_of_the_Blessed_Sacrament'},
    lasanceBenediction:{label:'Francis Xavier Lasance · With God · Benediction',url:'https://en.wikisource.org/wiki/With_God/Benediction_of_the_Blessed_Sacrament'},
    lasanceAdoration:{label:'Francis Xavier Lasance · With God · Various Devotions',url:'https://en.wikisource.org/wiki/With_God/Various_Devotions'},
    leonine:{label:'The Catholic’s Pocket Prayer-Book · Prayers after Low Mass',url:'https://en.wikisource.org/wiki/The_Catholic%27s_pocket_prayer-book/Prayers_after_Low-Mass'},
    officeCross:{label:'Traditional Office practice · Magnificat / Benedictus',url:'https://www.newadvent.org/cathen/09534a.htm'},
    incarnation:{label:'Traditional Roman Incarnation gesture',url:'https://www.newadvent.org/cathen/06423a.htm'}
  };
  const REGISTRY={
    'angelus.posture.weekday':{action:'kneel',authority:'documented_traditional',confidence:'high',context:'either',source:'baltimoreAngelus',active:true},
    'angelus.posture.sunday':{action:'stand',authority:'documented_traditional',confidence:'high',context:'either',source:'baltimoreAngelus',active:true},
    'regina.posture.paschal':{action:'stand',authority:'documented_traditional',confidence:'high',context:'either',source:'baltimoreAngelus',active:true},
    'angelus.et_verbum':{action:'genuflect',authority:'traditional_custom',confidence:'medium-high',context:'either',source:'incarnation',active:true,alternative:'profound bow'},
    'angelus.collect.passion_cross':{action:null,authority:'blocked_no_source',confidence:'high',context:'either',source:'baltimoreAngelus',active:false,note:'Do not infer a Sign of the Cross merely from the words Passion and Cross.'},
    'rosary.sign.opening':{action:'cross',authority:'documented_traditional',confidence:'high',context:'either',source:'baltimoreRosary',active:true},
    'confession.reception.cross':{action:'cross',authority:'documented_traditional',confidence:'high',context:'either',source:'piusXConfession',active:true},
    'confession.traditional.kneel':{action:'kneel',authority:'documented_traditional',confidence:'high',context:'either',source:'piusXConfession',active:true},
    'confiteor.mea_culpa':{action:'breast',authority:'documented_traditional',confidence:'high',context:'either',source:'confiteor',active:true,mult:3},
    'stations.opening.kneel':{action:'kneel',authority:'documented_traditional',confidence:'high',context:'either',source:'baltimoreStations',active:true},
    'stations.adoramus.genuflect':{action:'genuflect',authority:'documented_traditional',confidence:'high',context:'either',source:'moranStations',active:true},
    'stations.process':{action:'process',authority:'documented_traditional',confidence:'high',context:'church',source:'baltimoreStations',active:false,note:'Held until the app has an explicit church/home context.'},
    'benediction.exposition.kneel':{action:'kneel',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'baltimoreBenediction',active:true},
    'benediction.tantum.bow':{action:'bow',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'baltimoreBenediction',active:true},
    'benediction.blessing.cross':{action:'cross',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'lasanceBenediction',active:true},
    'benediction.reposal.rise':{action:'stand',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'baltimoreBenediction',active:true},
    'adoration.exposed.double_genuflect':{action:'genuflect',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'lasanceAdoration',active:true,mult:2,conditional:true},
    'forty_hours.double_genuflect':{action:'genuflect',authority:'documented_traditional',confidence:'high',context:'church_exposition',source:'lasanceAdoration',active:true,mult:2,conditional:true},
    'leonine.posture.kneel':{action:'kneel',authority:'documented_traditional',confidence:'high',context:'after_low_mass',source:'leonine',active:true},
    'magnificat.office.cross':{action:'cross',authority:'office_tradition',confidence:'high',context:'office',source:'officeCross',active:true},
    'benedictus.office.cross':{action:'cross',authority:'office_tradition',confidence:'high',context:'office',source:'officeCross',active:true},
    'de_profundis.evening.kneel':{action:'kneel',authority:'traditional_custom',confidence:'medium-high',context:'evening_bell',active:false,note:'Not imposed on standalone De Profundis.'},
    'penitential_psalms.kneel':{action:'kneel',authority:'held_for_source',confidence:'low',context:'either',active:false},
    'seven_words.adoramus':{action:null,authority:'blocked_no_source',confidence:'high',context:'either',active:false,note:'Do not copy the Stations genuflection into the Seven Words without a source rubric.'}
  };
  const APPLIED=new WeakMap();
  function fr(){return (document.documentElement.lang||'').toLowerCase().startsWith('fr') || /\bRetour\b/.test(document.body?.innerText||'')}
  function L(en,frText){return fr()?frText:en}
  function iconUri(kind){
    if(!ICON_IDS[kind]) return '';
    if(ICON_CACHE[kind]!==undefined) return ICON_CACHE[kind];
    const id=ICON_IDS[kind];
    for(const sc of document.scripts){
      const txt=sc.textContent||'';
      if(!txt.includes('exports.ICONS') || !txt.includes(id)) continue;
      const esc=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const m=txt.match(new RegExp("['\\\"]"+esc+"['\\\"]\\s*:\\s*['\\\"](data:image\\/png;base64,[^'\\\"]+)['\\\"]"));
      if(m){ICON_CACHE[kind]=m[1];return m[1]}
    }
    ICON_CACHE[kind]='';return '';
  }
  function mark(el,key){
    if(!el) return false;
    let set=APPLIED.get(el);if(!set){set=new Set();APPLIED.set(el,set)}
    if(set.has(key))return false;set.add(key);return true;
  }
  function cue(kind,label,meta={},mult){
    const s=document.createElement('span');
    s.className='ao-v393-gesture-cue '+(kind==='cross'?'ao-v393-cross':kind==='breast'?'ao-v393-breast':'');
    s.dataset.kind=kind;s.dataset.authority=meta.authority||'documented_traditional';s.setAttribute('role','img');s.setAttribute('aria-label',label);s.title=label;
    if(kind==='cross')s.textContent='✠';
    else if(kind==='breast')s.textContent=mult?'×'+mult:'×3';
    else if(kind==='process')s.textContent='→';
    else {const src=iconUri(kind); if(src){const img=document.createElement('img');img.src=src;img.alt='';img.setAttribute('aria-hidden','true');s.appendChild(img)}else{s.textContent=kind==='stand'?'↑':kind==='kneel'?'↓':kind==='bow'?'⌄':'⌟'}}
    if(mult && kind!=='breast'){const m=document.createElement('span');m.className='ao-v393-mult';m.textContent='×'+mult;s.appendChild(m)}
    return s;
  }
  function disclosure(container){
    if(!container)return null;
    let d=container.querySelector(':scope > details.ao-v392-disclosure, :scope > details.ao-v393-disclosure');
    if(d){let b=d.querySelector('.ao-v392-disclosure-body,.ao-v393-disclosure-body');if(b)return b}
    d=document.createElement('details');d.className='ao-v393-disclosure';
    const sm=document.createElement('summary');sm.textContent=L('Practice & sources','Pratique & sources');
    const b=document.createElement('div');b.className='ao-v393-disclosure-body';d.append(sm,b);container.appendChild(d);return b;
  }
  function sourceNote(container,key,text){
    const meta=REGISTRY[key];if(!container||!meta||!mark(container,'src:'+key))return;
    const b=disclosure(container);if(!b)return;
    const d=document.createElement('div');d.className='ao-v393-source-note';d.dataset.aoV393Source=key;
    const src=SOURCES[meta.source];
    d.innerHTML='<strong>'+L('Gesture cue','Geste')+':</strong> '+text+(src?' · <a target="_blank" rel="noopener" href="'+src.url+'">'+src.label+' ↗</a>':'');
    b.appendChild(d);
  }
  function rail(container,key,kind,label,mult){
    if(!container||!mark(container,'rail:'+key))return null;
    const r=document.createElement('div');r.className='ao-v393-gesture-rail';r.dataset.aoV393Key=key;r.appendChild(cue(kind,label,REGISTRY[key]||{},mult));
    const anchor=container.querySelector('h2,.lab-prayer-flip,.pbPrayerText,.pbFlowCard,.lab-actions');
    if(anchor)anchor.parentNode.insertBefore(r,anchor.nextSibling);else container.prepend(r);
    return r;
  }
  function textNodes(scope){
    const out=[];if(!scope)return out;
    const w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||p.closest('.ao-v393-gesture-cue,.ao-v392-inline-cue,.ao-v392-disclosure,.ao-v393-disclosure,script,style'))return NodeFilter.FILTER_REJECT;return n.nodeValue&&n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});let n;while(n=w.nextNode())out.push(n);return out;
  }
  function injectBefore(scope,patterns,key,kind,label,mult){
    if(!scope)return 0;let count=0;
    const pats=patterns.map(p=>p instanceof RegExp?p:new RegExp(p,'i'));
    for(const n of textNodes(scope)){
      let found=null,match=null;
      for(const p of pats){p.lastIndex=0;const m=p.exec(n.nodeValue);if(m){found=p;match=m;break}}
      if(!match)continue;
      const parent=n.parentElement;if(!mark(parent,'inline:'+key))continue;
      const before=n.nodeValue.slice(0,match.index),hit=n.nodeValue.slice(match.index,match.index+match[0].length),after=n.nodeValue.slice(match.index+match[0].length);
      const frag=document.createDocumentFragment();if(before)frag.appendChild(document.createTextNode(before));frag.appendChild(cue(kind,label,REGISTRY[key]||{},mult));frag.appendChild(document.createTextNode(hit+after));n.parentNode.replaceChild(frag,n);count++;
    }
    return count;
  }
  function prependToFaces(container,key,kind,label,mult){
    if(!container)return 0;let c=0;
    const explicit=container.querySelectorAll('[data-pb-latin],[data-pb-vern]');
    const faces=explicit.length?explicit:container.querySelectorAll('.pbPrayerText');
    faces.forEach(f=>{if(mark(f,'prepend:'+key)){f.insertBefore(cue(kind,label,REGISTRY[key]||{},mult),f.firstChild);c++}});return c;
  }
  function currentPrayerContainer(root){return root.querySelector('.lab-practice-sheet,.lab-prayer-sheet,.pbReader,.pbFlowCard,.lab-station-text')||root.querySelector('.pbShell')||root}
  function rootTitle(root){return (root.querySelector('.lab-view-head h1,.pbReader h1,.pbReader .pbTitle,.pbReader h2')?.textContent||'').trim()}
  function hideOldAngelusCue(root){root.querySelectorAll('.ao-v392-inline-cue').forEach(x=>{if(/Et Verbum caro factum est|bow profoundly|inclinez-vous profondément/i.test(x.textContent||''))x.classList.add('ao-v393-superseded')})}
  function angelus(root){
    const title=rootTitle(root),txt=root.textContent||'';if(!/^(Angelus|Regina C[æa]li|Regina Coeli)$/i.test(title))return;
    const c=root.querySelector('.lab-practice-sheet,.pbReader')||root;hideOldAngelusCue(root);
    const regina=/Regina C[æa]li|Regina Coeli/i.test(title);
    if(regina){rail(c,'regina.posture.paschal','stand',L('Stand · traditional Eastertide posture','Debout · posture traditionnelle du temps pascal'));sourceNote(c,'regina.posture.paschal',L('The traditional lay manual directs the Regina Cæli to be said standing in Eastertide.','Le manuel traditionnel des fidèles indique le Regina Cæli debout au temps pascal.'))}
    else{
      const d=new Date(),dow=d.getDay(),satEvening=dow===6&&d.getHours()>=18,stand=dow===0||satEvening,key=stand?'angelus.posture.sunday':'angelus.posture.weekday';
      rail(c,key,stand?'stand':'kneel',stand?L('Stand · Sunday / Saturday evening traditional posture','Debout · posture traditionnelle du dimanche / samedi soir'):L('Kneel · traditional weekday posture','À genoux · posture traditionnelle en semaine'));
      sourceNote(c,key,L('Older approved lay prayer books direct kneeling for the Angelus, except Saturday evening and Sunday.','Les anciens livres de prières approuvés indiquent l’Angélus à genoux, sauf le samedi soir et le dimanche.'));
      const n=injectBefore(c,[/Et Verbum caro factum est/i,/And the Word was made flesh/i,/Et le Verbe s(?:’|')est fait chair/i],'angelus.et_verbum','genuflect',L('Genuflect or bow profoundly · traditional Incarnation custom','Génuflexion ou inclination profonde · usage traditionnel de l’Incarnation'));
      if(n)sourceNote(c,'angelus.et_verbum',L('A genuflection at the Incarnation formula is a documented Roman tradition; in devotional Angelus use a profound bow is also found.','La génuflexion à la formule de l’Incarnation est une tradition romaine documentée ; dans l’Angélus dévotionnel, une inclination profonde est également attestée.'));
    }
  }
  function rosary(root){
    const txt=root.textContent||'',title=rootTitle(root);if(!/Rosary|Rosaire/i.test(txt+' '+title))return;
    const c=currentPrayerContainer(root);
    const n=injectBefore(c,[/In nomine Patris/i,/In the name of the Father/i,/Au nom du Père/i],'rosary.sign.opening','cross',L('Make the Sign of the Cross','Faites le signe de la Croix'));
    if(n)sourceNote(c,'rosary.sign.opening',L('The traditional lay Rosary method explicitly begins with the Sign of the Cross.','La méthode traditionnelle du Rosaire commence explicitement par le signe de la Croix.'));
  }
  function confession(root){
    const title=rootTitle(root),txt=root.textContent||'';if(!/Confession/i.test(title+' '+txt))return;
    const c=currentPrayerContainer(root);
    const n=injectBefore(c,[/make the Sign of the Cross as customary/i,/faites le signe de la Croix selon l[’']usage/i],'confession.reception.cross','cross',L('Make the Sign of the Cross','Faites le signe de la Croix'));
    if(n)sourceNote(c,'confession.reception.cross',L('Traditional catechetical directions place the Sign of the Cross at the beginning of confession.','Les directives catéchétiques traditionnelles placent le signe de la Croix au début de la confession.'));
    const k=injectBefore(c,[/When you kneel down/i,/Lorsque vous vous agenouillez/i],'confession.traditional.kneel','kneel',L('Kneel · traditional manner','À genoux · manière traditionnelle'));
    if(k)sourceNote(c,'confession.traditional.kneel',L('Traditional confession instructions direct the penitent to kneel before beginning.','Les instructions traditionnelles de confession indiquent au pénitent de s’agenouiller avant de commencer.'));
  }
  function standalone(root){
    const title=rootTitle(root),c=root.querySelector('.pbReader')||currentPrayerContainer(root);if(!c)return;
    if(/^Confiteor$/i.test(title)){
      const n=injectBefore(c,[/mea culpa,\s*mea culpa,\s*mea m[aá]xima culpa/i,/through my fault,\s*through my fault,\s*through my most grievous fault/i,/c[’']est ma faute,\s*c[’']est ma faute,\s*c[’']est ma très grande faute/i],'confiteor.mea_culpa','breast',L('Strike the breast three times','Frappez la poitrine trois fois'),3);
      if(n)sourceNote(c,'confiteor.mea_culpa',L('Traditional Roman practice accompanies the three mea culpa phrases with three breast-strikes.','La pratique romaine traditionnelle accompagne les trois mea culpa de trois coups sur la poitrine.'));
    }
    if(/Leonine Prayers|Prières léonines/i.test(title)){
      rail(c,'leonine.posture.kneel','kneel',L('Kneel · traditional Leonine posture','À genoux · posture traditionnelle des prières léonines'));
      sourceNote(c,'leonine.posture.kneel',L('Traditional lay manuals direct the Leonine Prayers after Low Mass to be said kneeling.','Les manuels traditionnels des fidèles indiquent les prières léonines après la Messe basse à genoux.'));
    }
    if(/^Magnificat(?:\s|\(|$)/i.test(title)){
      const n=prependToFaces(c,'magnificat.office.cross','cross',L('Make the Sign of the Cross · traditional Office practice','Faites le signe de la Croix · usage traditionnel de l’Office'));
      if(n)sourceNote(c,'magnificat.office.cross',L('In the traditional Office the Sign of the Cross is made at the opening word of the Magnificat.','Dans l’Office traditionnel, on fait le signe de la Croix au premier mot du Magnificat.'));
    }
    if(/^Benedictus(?:\s|\(|$)/i.test(title)){
      const n=prependToFaces(c,'benedictus.office.cross','cross',L('Make the Sign of the Cross · traditional Office practice','Faites le signe de la Croix · usage traditionnel de l’Office'));
      if(n)sourceNote(c,'benedictus.office.cross',L('In the traditional Office the Sign of the Cross is made at the opening word of the Benedictus.','Dans l’Office traditionnel, on fait le signe de la Croix au premier mot du Benedictus.'));
    }
  }
  function stations(root){
    const title=rootTitle(root),txt=root.textContent||'';if(!root.querySelector('.lab-stations-hero,.lab-station-text') && !/Stations of the Cross|Chemin de Croix|Via Crucis/i.test(title))return;
    if(root.querySelector('.lab-stations-hero')){
      const c=root.querySelector('.lab-stations-hero')||root;
      rail(c,'stations.opening.kneel','kneel',L('Kneel · opening Act of Contrition','À genoux · acte de contrition initial'));
      sourceNote(c,'stations.opening.kneel',L('The St Alphonsus method in the 1888 lay manual begins kneeling before the altar.','La méthode de saint Alphonse dans le manuel de 1888 commence à genoux devant l’autel.'));
    }
    const s=root.querySelector('.lab-station-text,.pbFlowCard');if(s){
      const n=injectBefore(s,[/We adore Thee, O Christ/i,/Nous vous adorons, ô Christ/i,/Adoramus te, Christe/i],'stations.adoramus.genuflect','genuflect',L('Genuflect','Génuflexion'));
      if(n)sourceNote(s,'stations.adoramus.genuflect',L('A nineteenth-century approved prayer book explicitly marks a genuflection at this versicle.','Un livre de prières approuvé du XIXe siècle indique explicitement une génuflexion à ce verset.'));
    }
  }
  function benediction(root){
    const title=rootTitle(root),txt=root.textContent||'';if(!/^(Benediction|Bénédiction)$/i.test(title))return;
    const c=root.querySelector('.lab-practice-sheet,.pbReader')||currentPrayerContainer(root);if(!c)return;
    const final=/Psalm 116|Laudate Dominum|Adoremus in aeternum/i.test(txt);
    if(final){rail(c,'benediction.reposal.rise','stand',L('Rise · after reposal','Levez-vous · après la reposition'));sourceNote(c,'benediction.reposal.rise',L('The traditional lay manual directs all to rise after the Blessed Sacrament has been replaced in the tabernacle.','Le manuel traditionnel des fidèles indique que tous se lèvent après la reposition du Saint-Sacrement.'))}
    else {rail(c,'benediction.exposition.kneel','kneel',L('Kneel · traditional Benediction posture','À genoux · posture traditionnelle de la bénédiction'));sourceNote(c,'benediction.exposition.kneel',L('The traditional Benediction order describes the congregation as kneeling before the exposed Blessed Sacrament.','L’ordre traditionnel de la bénédiction décrit l’assemblée à genoux devant le Saint-Sacrement exposé.'))}
    const b=injectBefore(c,[/Veneremur cernui/i,/Down in adoration falling/i,/Adorons.*prostern/i],'benediction.tantum.bow','bow',L('Bow profoundly','Inclinez-vous profondément'));
    if(b)sourceNote(c,'benediction.tantum.bow',L('Traditional Benediction manuals direct a humble bow/prostration at the second line of Tantum Ergo.','Les manuels traditionnels de bénédiction indiquent une profonde inclination/prosternation à la deuxième ligne du Tantum Ergo.'));
    if(/Benediction occurs here|La bénédiction a lieu ici/i.test(txt)){
      const n=injectBefore(c,[/Benediction occurs here/i,/La bénédiction a lieu ici/i],'benediction.blessing.cross','cross',L('Make the Sign of the Cross as the Blessed Sacrament blesses the faithful','Faites le signe de la Croix lors de la bénédiction du Saint-Sacrement'));
      if(n)sourceNote(c,'benediction.blessing.cross',L('Lasance’s traditional lay manual explicitly prints the Sign of the Cross for the faithful at Benediction.','Le manuel traditionnel de Lasance imprime explicitement le signe de la Croix pour les fidèles lors de la bénédiction.'));
    }
  }
  function prayerBook(){const r=document.getElementById('aoPrayerBookRoot');if(!r)return;angelus(r);rosary(r);confession(r);stations(r);benediction(r);standalone(r)}
  function adoration(){
    const r=document.getElementById('ao-v354-root');if(!r||!r.querySelector('[data-ao354-ador-next]'))return;
    const c=r.querySelector('article,.ao354Card,.ao354Session,.programCard')||r;
    rail(c,'adoration.exposed.double_genuflect','genuflect',L('If the Blessed Sacrament is solemnly exposed: traditional double genuflection','Si le Saint-Sacrement est solennellement exposé : double génuflexion traditionnelle'),2);
    sourceNote(c,'adoration.exposed.double_genuflect',L('Traditional practice distinguished a double genuflection before the Blessed Sacrament solemnly exposed. This cue is conditional, not a current universal rubric.','La pratique traditionnelle distinguait une double génuflexion devant le Saint-Sacrement solennellement exposé. Ce repère est conditionnel et non une rubrique universelle actuelle.'));
  }
  function traditions(){
    const r=document.getElementById('aoV38Traditions');if(!r)return;const title=(r.querySelector('.v38Top h1')?.textContent||'').trim();if(!/^(Forty Hours|Quarante-Heures|Quarante Heures)$/i.test(title))return;
    const c=r.querySelector('article,.v38TradCard,.v38TradDetail,.v38TraditionDetail')||r;
    rail(c,'forty_hours.double_genuflect','genuflect',L('Traditional double genuflection before the exposed Blessed Sacrament','Double génuflexion traditionnelle devant le Saint-Sacrement exposé'),2);
    sourceNote(c,'forty_hours.double_genuflect',L('Traditional exposition practice used a double genuflection before the Blessed Sacrament solemnly exposed.','La pratique traditionnelle de l’exposition employait une double génuflexion devant le Saint-Sacrement solennellement exposé.'));
  }
  function process(){try{prayerBook();adoration();traditions()}catch(e){console.warn('AO v39.3 gesture cue pass',e)}}
  function start(){process()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.AO_DEVOTIONAL_GESTURES_V393={registry:REGISTRY,sources:SOURCES,process,qa:function(){const active=Object.entries(REGISTRY).filter(([,v])=>v.active),blocked=Object.entries(REGISTRY).filter(([,v])=>v.authority==='blocked_no_source');return{version:'39.3',entries:Object.keys(REGISTRY).length,active:active.length,blocked:blocked.map(([k])=>k),actions:[...new Set(active.map(([,v])=>v.action))],massScope:false}}};
})();

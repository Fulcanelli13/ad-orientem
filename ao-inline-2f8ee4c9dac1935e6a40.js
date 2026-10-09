
(()=>{'use strict';
window.AO_COMMENTARY_POLICY_V12={
 version:'12',
 routes:{
  en:{gospel:'Catena Aurea · Newman/Oxford',psalm:'St Robert Bellarmine · 1866; Haydock fallback',other:'Haydock Catholic Bible Commentary'},
  fr:{gospel:'Chaîne d’Or · Péronne 1868–1869 — integrated from Wikisource by chapter/verse markers',psalm:'Saint Augustin · Raulx 1864 — integrated at Psalm/discourse level; Bellarmin–Daras remains planned for verse-exact enrichment',other:'Glaire–Vigouroux 1905 — integrated verse-linked notes; Fillion remains planned enrichment where a safely mapped commentary transcription is available'}
 },
 rules:['same-language commentary only','no runtime machine translation','Péronne Wikisource chapter text is segmented only by explicit verse markers','Augustine/Raulx Psalm commentary is explicitly Psalm-level, not falsely verse-mapped','Glaire–Vigouroux notes are attached only to explicit verse-linked footnotes; chapter summaries enrich Context but do not count as verse commentary','external link does not count as integrated commentary','composite references are resolved passage-by-passage']
};
const GUIDE={
 en:{
  title:'How to use Ad Orientem at Mass',intro:'The app should help you follow the liturgy without turning the Mass into continuous screen-reading. Learn before or after Mass; during Mass, use the live guide as an orientation layer.',
  sections:[
   ['1 · Before Mass','Use Prepare for immediate preparation. Use Learn, Scripture Context and Commentary before Mass when you want to understand the day in depth. They are intentionally richer than the live screen.'],
   ['2 · Choose what you are following','“Follow what you hear” tracks the audible liturgy: the schola and everything the sacred ministers say or sing aloud. “Complete liturgical action” also follows silent and private priestly prayers and actions. The two modes answer different questions; neither changes the rite itself.'],
   ['3 · Read the cues','cues'],
   ['4 · Look up when the action matters','The screen is not meant to hold your eyes continuously. At elevations, the Gospel procession, incensations, Communion and other visually significant moments, LOOK cues deliberately direct attention back to the altar or ministers.'],
   ['5 · Expect simultaneous actions','At Sung and Solemn Mass the priest, ministers and schola often act at the same time. The choir may still be singing a Proper while the celebrant has moved ahead at the altar. Ad Orientem keeps those tracks distinct instead of forcing them into an artificial single sequence.'],
   ['6 · Low, Sung and Solemn Mass are not identical','Low Mass has no sung choir track. Missa cantata adds the sung Ordinary and Proper without the full deacon/subdeacon structure. Solemn Mass assigns proper actions to deacon, subdeacon and other ministers. The live guide changes its emphasis accordingly.'],
   ['7 · Rubric is not the same as local custom','Where congregational posture, responses or inherited practices vary legitimately, the app should label them as custom or participation guidance rather than presenting them as universal rubrics. The same applies to practices such as the second Confiteor before Communion.'],
   ['8 · Context and commentary are for understanding, not competing with worship','Open Reading when you need the appointed text, Context to see the surrounding chapter, and Commentary for historical Catholic exegesis. During Mass, use these only when genuinely helpful; the deeper reading is designed chiefly for before or after the liturgy.'],
   ['9 · After Mass','Use Thanksgiving after the final liturgical action rather than treating the Last Gospel or dismissal as the end of the app’s spiritual lifecycle. Prepare → Mass → Thanksgiving is the intended flow.']
  ],
  cues:{HEAR:'What is audibly being said or sung.',LOOK:'A moment when the visible liturgical action deserves your attention.',PRIEST:'What the celebrant is doing or praying, including actions not audible to the congregation.',YOU:'A response, posture or participation cue directed to the faithful; custom is labelled when it is not universal.'}
 },
 fr:{
  title:'Comment utiliser Ad Orientem à la Messe',intro:'L’application doit aider à suivre la liturgie sans transformer la Messe en lecture continue de l’écran. Apprenez avant ou après la Messe ; pendant la Messe, utilisez le guide en direct comme couche d’orientation.',
  sections:[
   ['1 · Avant la Messe','Utilisez Préparer pour la préparation immédiate. Utilisez Apprendre, le Contexte scripturaire et le Commentaire avant la Messe lorsque vous voulez comprendre le jour en profondeur. Ces modules sont volontairement plus riches que l’écran en direct.'],
   ['2 · Choisissez ce que vous suivez','« Suivre ce que vous entendez » suit la liturgie audible : la schola et tout ce que les ministres sacrés disent ou chantent à voix haute. « Action liturgique complète » suit aussi les prières et actions silencieuses ou privées du prêtre. Les deux modes répondent à des questions différentes ; aucun ne change le rite lui-même.'],
   ['3 · Lire les repères','cues'],
   ['4 · Levez les yeux quand l’action compte','L’écran n’est pas conçu pour retenir continuellement votre regard. Aux élévations, à la procession de l’Évangile, aux encensements, à la Communion et dans les autres moments visuellement importants, les repères LOOK ramènent délibérément l’attention vers l’autel ou les ministres.'],
   ['5 · Attendez-vous à des actions simultanées','À la Messe chantée et à la Messe solennelle, le prêtre, les ministres et la schola agissent souvent en même temps. Le chœur peut encore chanter un texte du Propre alors que le célébrant a déjà avancé à l’autel. Ad Orientem maintient ces lignes distinctes au lieu de les forcer dans une séquence artificiellement unique.'],
   ['6 · Messe basse, chantée et solennelle ne sont pas identiques','La Messe basse ne comporte pas de ligne chorale chantée. La Missa cantata ajoute l’Ordinaire et le Propre chantés sans toute la structure diacre/sous-diacre. La Messe solennelle attribue des actions propres au diacre, au sous-diacre et aux autres ministres. Le guide en direct adapte donc son accent.'],
   ['7 · Rubrique et coutume locale ne sont pas la même chose','Lorsque posture des fidèles, réponses ou pratiques héritées varient légitimement, l’application doit les identifier comme coutume ou conseil de participation au lieu de les présenter comme rubriques universelles. Il en va de même pour des usages comme le second Confiteor avant la Communion.'],
   ['8 · Contexte et commentaire servent à comprendre, non à concurrencer le culte','Ouvrez Lecture pour le texte prescrit, Contexte pour voir le chapitre environnant, et Commentaire pour l’exégèse catholique historique. Pendant la Messe, n’utilisez ces couches que lorsqu’elles aident réellement ; la lecture approfondie est conçue surtout pour avant ou après la liturgie.'],
   ['9 · Après la Messe','Utilisez l’Action de grâces après la dernière action liturgique au lieu de traiter le Dernier Évangile ou le renvoi comme la fin du cycle spirituel de l’application. Préparer → Messe → Action de grâces est le parcours voulu.']
  ],
  cues:{HEAR:'Ce qui est réellement dit ou chanté à voix audible.',LOOK:'Moment où l’action liturgique visible mérite votre attention.',PRIEST:'Ce que fait ou prie le célébrant, y compris ce qui n’est pas audible pour l’assemblée.',YOU:'Réponse, posture ou repère de participation adressé aux fidèles ; la coutume est signalée lorsqu’elle n’est pas universelle.'}
 }
};
function lang(){return document.querySelector('.aoLearnLang button.active')?.dataset.learnLang||document.querySelector('.homeScreen')?.dataset.homeLanguage||document.querySelector('.liveScreen')?.dataset.language||'en'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function openGuide(){document.getElementById('ao-use-guide-v9')?.remove();const L=GUIDE[lang()==='fr'?'fr':'en'];const root=document.createElement('div');root.id='ao-use-guide-v9';root.className='aoGuideBackdrop';root.innerHTML=`<section class="aoGuideSheet" role="dialog" aria-modal="true"><header class="aoGuideTop"><div><small>Ad Orientem · guide</small><b>${esc(L.title)}</b></div><button data-guide-close aria-label="Close">×</button></header><div class="aoGuideHero"><small>${lang()==='fr'?'Pendant la Messe':'During Mass'}</small><h1>${esc(L.title)}</h1><p>${esc(L.intro)}</p></div>${L.sections.map(([h,p])=>`<section class="aoGuideSection"><h2>${esc(h)}</h2>${p==='cues'?`<div class="aoCueGrid">${Object.entries(L.cues).map(([k,v])=>`<div class="aoCue"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`:`<p>${esc(p)}</p>`}</section>`).join('')}</section>`;document.body.appendChild(root);root.querySelector('[data-guide-close]').onclick=()=>root.remove();root.addEventListener('click',e=>{if(e.target===root)root.remove()})}
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-open-ao-use-guide]')){e.preventDefault();openGuide()}},true);
window.AO_USE_GUIDE_V9={open:openGuide,data:GUIDE};
})();

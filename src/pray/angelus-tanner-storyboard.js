// Approved creative direction: Henry Ossawa Tanner (1898), Philadelphia Museum of Art.
// Art metadata is source truth; its public-domain Wikimedia reproduction is not
// bundled here until the derivative image is actually copied into assets/.
// Every chapter uses ONE original painting, not four unrelated artworks.
export const TANNER_ANGELUS_MASTER = Object.freeze({
  id:"tanner-annunciation-1898",
  artist:"Henry Ossawa Tanner",
  title:"The Annunciation",
  date:"1898",
  museum:"Philadelphia Museum of Art",
  accession:"W1899-1-1",
  objectUrl:"https://www.philamuseum.org/objects/104384",
  sourceUrl:"https://commons.wikimedia.org/wiki/File:Henry_Ossawa_Tanner,_American_(active_France)_-_The_Annunciation_-_Google_Art_Project.jpg",
  sourceLicense:"Public Domain Mark 1.0 (Wikimedia Commons reproduction)",
  museumImageTerms:"Museum states images on its own site are shared for educational use; do not assume those terms license its separate downloads.",
  localPath:"assets/pray/angelus/tanner-annunciation-1898.webp",
  status:"selected-pending-local-image"
});

const freezeSequence=rows=>Object.freeze(rows.map(entry=>Object.freeze(entry)));
export const TANNER_ANGELUS_STORYBOARD = freezeSequence([
  {
    id:"annunciation",effect:"reveal",title:"The Announcement",
    anchorLatin:"Angelus Domini nuntiavit Mariæ",
    prayerUnits:["vr","hail"],
    focus:{x:40,y:46,scale:1.10},
    begin:{x:27,y:47,scale:1.17},
    durationMs:1250,restMs:0,
    glow:.13,
    cue:"Reveal Gabriel as the vertical source of light, with Mary still visible. Arrive at a stable wide shot before recitation."
  },
  {
    id:"fiat",effect:"camera",title:"Mary's Fiat",
    anchorLatin:"Ecce ancilla Domini",
    prayerUnits:["vr","hail"],
    focus:{x:73,y:53,scale:1.30},
    begin:{x:55,y:50,scale:1.17},
    durationMs:1350,restMs:0,
    glow:.05,
    cue:"Move toward Mary's face and joined hands, never move or distort the depicted body. Settle before the Hail Mary."
  },
  {
    id:"incarnation",effect:"light",title:"The Incarnation",
    anchorLatin:"Et Verbum caro factum est",
    prayerUnits:["vr","hail"],
    focus:{x:51,y:48,scale:1.11},
    begin:{x:72,y:53,scale:1.26},
    durationMs:1450,restMs:0,
    glow:.21,
    cue:"Return toward the luminous column while retaining Mary. A restrained illumination peaks at the Word-made-flesh versicle; posture cue retains exclusive ritual ownership."
  },
  {
    id:"collect",effect:"stillness",title:"Oremus",
    anchorLatin:"Ora pro nobis, sancta Dei Genetrix / Oremus",
    prayerUnits:["vr","collect"],
    focus:{x:72,y:52,scale:1.24},
    begin:{x:59,y:49,scale:1.16},
    durationMs:1050,restMs:0,
    glow:.04,
    cue:"Slowly return to Mary, then end in perfect stillness. No automatic timer, invented kneeling cue, or fourth Hail Mary."
  }
]);
export function tannerScene(id){return TANNER_ANGELUS_STORYBOARD.find(s=>s.id===id)||null;}

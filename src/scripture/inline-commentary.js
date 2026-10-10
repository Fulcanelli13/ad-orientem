/**
 * Paraphrased, source-located Catholic exegesis for the inline reading panel.
 * Not quotations from the Fathers and never a substitute for inspired Scripture.
 * A source link is provided by verifiedScriptureCommentary in context.js.
 * Only passages actually checked against their named source may enter this list.
 */
const ENTRIES=Object.freeze({
  matthew5:Object.freeze([
    {author:"St Augustine",summary:{en:"Christ's commandment reaches the willing consent of the heart, not merely outward adultery. Augustine distinguishes the arising of a suggestion from consenting to an illicit pleasure; the latter is the decisive moral act.",fr:"Le commandement du Christ atteint le consentement volontaire du cœur, et pas seulement l'adultère extérieur. Saint Augustin distingue la suggestion qui surgit du consentement à un plaisir illicite ; c'est ce dernier qui engage la volonté."}},
    {author:"St Jerome",summary:{en:"An involuntary first movement is not the same as a passion deliberately embraced. A person who yields to a lustful intention has crossed from temptation toward consent, even where no external act follows.",fr:"Un premier mouvement involontaire n'est pas identique à une passion librement accueillie. Celui qui consent à une intention impure passe de la tentation au consentement, même sans acte extérieur."}},
    {author:"St Gregory the Great",summary:{en:"Because the senses can nourish disordered desire, guarding one's gaze is a prudent discipline in the service of interior purity. The warning concerns cultivating lust, not simply noticing another person.",fr:"Parce que les sens peuvent nourrir le désir déréglé, la garde du regard est une discipline prudente au service de la pureté intérieure. L'avertissement vise le désir entretenu, non la simple perception d'autrui."}}
  ]),
  annunciation:Object.freeze([
    {author:"St Bede",summary:{en:"Bede reads the angel's arrival within the history of salvation: the promised Incarnation brings the old dispensation toward its fulfilment. Mary's virginity points to the divine initiative in the coming of the Redeemer.",fr:"Bède inscrit la venue de l'ange dans l'histoire du salut : l'Incarnation promise mène l'ancienne économie à son accomplissement. La virginité de Marie manifeste l'initiative divine dans la venue du Rédempteur."}},
    {author:"St Gregory the Great",summary:{en:"Gregory explains why the messenger is the archangel Gabriel: the extraordinary announcement befits a principal messenger, whose name is associated with the strength of God.",fr:"Grégoire explique pourquoi le messager est l'archange Gabriel : l'annonce extraordinaire convient à un messager éminent, dont le nom est associé à la force de Dieu."}},
    {author:"St Ambrose",summary:{en:"The Gospel's insistence that Mary is both virgin and betrothed safeguards the truth of her virginal conception while locating the event within a real human household.",fr:"L'insistance de l'Évangile sur Marie, à la fois vierge et fiancée, protège la vérité de sa conception virginale tout en situant l'événement dans une véritable famille humaine."}}
  ]),
  magnificat:Object.freeze([
    {author:"Origen",summary:{en:"To magnify God is not to enlarge the divine nature, but to let the soul reflect God's image through belief and a life shaped by Christ. Praise grows from the interior transformation of the believer.",fr:"Magnifier Dieu ne signifie pas accroître la nature divine, mais laisser l'âme refléter son image par la foi et une vie conformée au Christ. La louange naît de la transformation intérieure du croyant."}},
    {author:"St Bede",summary:{en:"Mary's joy is directed to God her Saviour, whose eternal divinity belongs to the same Jesus conceived in her womb. Her canticle is thanksgiving for God's saving action.",fr:"La joie de Marie se tourne vers Dieu son Sauveur : l'éternelle divinité appartient au même Jésus conçu en son sein. Son cantique rend grâce pour l'action salvatrice de Dieu."}},
    {author:"St Ambrose",summary:{en:"Ambrose invites believers to adopt Mary's disposition of praise and faithful reception of the divine Word. Her unique bodily motherhood is not confused with the spiritual fruit of faith in other souls.",fr:"Ambroise invite les fidèles à adopter l'attitude de louange de Marie et à accueillir fidèlement la Parole. Sa maternité corporelle unique ne se confond pas avec le fruit spirituel de la foi dans les autres âmes."}}
  ]),
  psalm129:Object.freeze([
    {author:"St Robert Bellarmine",summary:{en:"The depths from which the penitent cries are both the misery caused by sin and the depth of the heart conscious of its condition. Recognising one's need is the beginning of an earnest appeal to God.",fr:"Les profondeurs d'où crie le pénitent sont à la fois la misère causée par le péché et la profondeur d'un cœur conscient de sa condition. Reconnaître sa détresse ouvre la voie à une prière sincère."}},
    {author:"St Robert Bellarmine",summary:{en:"When the Psalm asks who could stand if God marked every iniquity, Bellarmine explains the penitent's dependence upon mercy. The prayer does not excuse sin; it acknowledges that restoration requires divine help.",fr:"Lorsque le psaume demande qui pourrait subsister si Dieu retenait toutes les iniquités, Bellarmin souligne la dépendance du pénitent envers la miséricorde. La prière n'excuse pas le péché : elle reconnaît le besoin du secours divin."}}
  ])
});
const freezeNotes=entries=>Object.freeze(entries.map(entry=>Object.freeze({author:entry.author,summary:Object.freeze(entry.summary)})));
const NOTES=Object.freeze(Object.fromEntries(Object.entries(ENTRIES).map(([key,entries])=>[key,freezeNotes(entries)])));
export function inlineScriptureCommentary(passage){
  if(!passage)return null;
  let key=null;
  if(passage.book==="Matthew"&&passage.chapter===5&&passage.verseStart<=28&&passage.verseEnd>=27)key="matthew5";
  else if(passage.book==="Luke"&&passage.chapter===1&&passage.verseStart>=26&&passage.verseEnd<=38)key="annunciation";
  else if(passage.book==="Luke"&&passage.chapter===1&&passage.verseStart>=46&&passage.verseEnd<=55)key="magnificat";
  else if(passage.book==="Psalms"&&passage.chapter===129)key="psalm129";
  return key?Object.freeze({kind:"SOURCE_BASED_EDITORIAL_PARAPHRASE",entries:NOTES[key]}):null;
}

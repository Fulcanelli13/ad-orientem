// Holy Thursday 1962: date-owned Canon substitutions at the existing cue IDs.
// The ordinary Canon source corpus and Consecration words remain immutable.
// Reference: https://www.laudemus.org/?date=2026-04-02&mass_type=low&place_id=2
const freeze=x=>Object.freeze(x);
const ROOT="Tempora/Quad6-4r";
const VARIANTS=freeze({
 "AO.SM.C0157":freeze({
  lat:"Communicántes, et diem sacratíssimum celebrántes, quo Dóminus noster Iesus Christus pro nobis est tráditus: sed et memóriam venerántes, in primis gloriósæ semper Vírginis Maríæ, Genetrícis eiúsdem Dei et Dómini nostri",
  en:"In communion with, and celebrating the most sacred day on which our Lord Jesus Christ was delivered up for us, and venerating the memory, first of the glorious ever-Virgin Mary, Mother of the same God and our Lord",
  fr:"Unis dans une même communion et célébrant le jour très saint où notre Seigneur Jésus-Christ fut livré pour nous, nous vénérons aussi la mémoire, d’abord de la glorieuse Marie toujours Vierge, Mère de ce même Dieu et de notre Seigneur",
 }),
 "AO.SM.C0161":freeze({
  lat:"Hanc ígitur oblatiónem servitútis nostræ, sed et cunctæ famíliæ tuæ, quam tibi offérimus ob diem, in qua Dóminus noster Iesus Christus trádidit discípulis suis Córporis et Sánguinis sui mystéria celebránda: quǽsumus, Dómine, ut placátus accípias: diésque nostros in tua pace dispónas, atque ab ætérna damnatióne nos éripi, et in electórum tuórum iúbeas grege numerári.",
  en:"This oblation of our service and of all Thy family, which we offer on the day on which our Lord Jesus Christ entrusted to His disciples the celebration of the mysteries of His Body and Blood, we beseech Thee, O Lord, graciously to accept; dispose our days in Thy peace, rescue us from eternal damnation and command us to be numbered in the flock of Thine elect.",
  fr:"Cette offrande de notre service et de toute votre famille, que nous vous présentons en ce jour où notre Seigneur Jésus-Christ a confié à ses disciples la célébration des mystères de son Corps et de son Sang, nous vous prions, Seigneur, de l’accepter avec bienveillance ; disposez nos jours dans votre paix, arrachez-nous à la damnation éternelle et daignez nous compter au nombre de vos élus.",
 }),
 "AO.SM.C0162":freeze({
  lat:"Per eúndem Christum Dóminum nostrum. Amen.",
  en:"Through the same Christ our Lord. Amen.",
  fr:"Par le même Christ notre Seigneur. Ainsi soit-il.",
 }),
 "AO.SM.C0168":freeze({
  lat:"Qui prídie, quam pro nostra omniúmque salúte paterétur, hoc est, hódie, accépit panem in sanctas ac venerábiles manus suas,",
  en:"Who, on the day before He suffered for our salvation and that of all, that is, today, took bread into His holy and venerable hands,",
  fr:"La veille du jour où il devait souffrir pour notre salut et celui de tous, c’est-à-dire aujourd’hui, il prit le pain dans ses mains saintes et vénérables,",
 }),
});
export const HOLY_THURSDAY_CANON_1962=freeze({
 sourcePath:ROOT,
 witness:"https://www.laudemus.org/?date=2026-04-02&mass_type=low&place_id=2",
 canonicalBlockIds:freeze(["AO.SM.B049","AO.SM.B050","AO.SM.B052"]),
 cueOverrides:VARIANTS,
 status:"SECONDARY_1962_TEXT_AGREEMENT_NOT_FACSIMILE_CERTIFIED",
});
export function holyThursdayCanonVariantsForProper(resolvedMass){
 const proper=resolvedMass?.proper?.data??resolvedMass?.proper??null;
 // Date, principal source owner and exact Mass identity, not a title or 
 // an accidental string in a votive Proper, control substitution.
 const source=proper?.sourcePath??resolvedMass?.proper?.sourcePath;
 const date=String(resolvedMass?.date??"");
 if(source!==ROOT || !/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 return VARIANTS;
}

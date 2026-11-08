// Independent 1960/1962 Missal admission review for *source-claimed*
// additional orations. This does not project, alter, or drop any Mass text.
// RGMR §§433–437, 444–457: source-attested ≠ rubrically permitted.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
const no=(reason,details={})=>Object.freeze({
  status:"RUBRICAL_HOLD",reason,certified:false,...details
});
export function review1962OrationLimits({expectation,form="LOW",
  conventual=false}={}){
 const e=expectation,claims=e?.sourceClaim,order=claims?.sourceOrder;
 if(!Array.isArray(order)||order[0]!=="PRINCIPAL"||
    !["LOW","MISSA_CANTATA_SIMPLE","SOLEMN"].includes(form))
   return no("UNREVIEWABLE_DATE_FORM_OR_GROUPS");
 const klass=e?.ordoLiturgicalDayClass;
 if(![1,2,3,4].includes(klass))
   return no("UNVERIFIED_LITURGICAL_DAY_CLASS");
 const weekday=Date.parse(e.date+"T12:00:00Z");
 if(!Number.isFinite(weekday)||new Date(weekday).toISOString().slice(0,10)!==e.date)
   return no("UNVERIFIED_LITURGICAL_DATE");
 const isSunday=new Date(weekday).getUTCDay()===0;
 const additions=order.slice(1),count=order.length;
 // §434(c): a non-Sunday II-class day permits only *one* extra oration.
 // The 9 Nov 2026 published ICRSP ordo lists Theodore AND pro Papa:
 // preserving both claims as evidence does not make all three permissible.
 if(klass===2&&!isSunday&&count>2)
   return no("SECOND_CLASS_DAY_MORE_THAN_ONE_ADDITIONAL_ORATION",{
     permittedSeparateGroups:2,sourceClaimedGroups:count,
     rubric:"RGMR_434_C",additionalOrations:additions,
     sourceAttested:true,independentExceptionRequired:true
   });
 // §434(b): the only usual extra on a II-class Sunday is a
 // commemoration of a II-class feast (or a privileged commemoration).
 // "pro Papa" is neither automatically classified as such nor licensed.
 if(klass===2&&isSunday&&additions.some(x=>x==="ORATIO_PRO_PAPA"))
   return no("SECOND_CLASS_SUNDAY_PRO_PAPA_NOT_ORDINARILY_ADMITTED",{
     rubric:"RGMR_434_B",sourceClaimedGroups:count,
     additionalOrations:additions,sourceAttested:true,
     independentExceptionRequired:true
   });
 // §434(a): on a first-class liturgical day, independent ordinary
 // additions are excluded. Source attestations require more authority.
 if(klass===1&&additions.some(x=>!x.startsWith("PRIVILEGED:")))
   return no("FIRST_CLASS_NON_PRIVILEGED_ADDITIONAL_ORATION",{
     rubric:"RGMR_434_A",sourceClaimedGroups:count,
     additionalOrations:additions,sourceAttested:true,
     independentExceptionRequired:true
   });
 if(count>3)
   return no("ABSOLUTE_THREE_ORATION_MAX",{
     rubric:"RGMR_435",sourceClaimedGroups:count
   });
 // Non-conventual sung Masses are separately restricted under §434(a).
 if(form!=="LOW"&&!conventual&&additions.some(x=>!x.startsWith("PRIVILEGED:")))
   return no("NONCONVENTUAL_SUNG_EXTRA_ORATION_UNPROVEN",{
     rubric:"RGMR_434_A",sourceClaimedGroups:count,
     independentExceptionRequired:true
   });
 // §457(d) would exclude an oratio imperata on these days or in sung
 // Masses. The official "pro Papa" label alone does NOT establish
 // whether it is imperata, a special concession or another category.
 if(additions.includes("ORATIO_PRO_PAPA"))
   return no("PRO_PAPA_LEGAL_CATEGORY_AND_PERMISSION_UNRESOLVED",{
     rubric:"RGMR_457_D_IF_IMPERATA",sourceClaimedGroups:count,
     independentExceptionRequired:true
   });
 return Object.freeze({status:"NO_ORDINARY_COUNT_CONFLICT_FOUND",
   certified:false,reason:"INDEPENDENT_TEXT_AND_AUTHORITY_REVIEW_STILL_REQUIRED",
   sourceClaimedGroups:count});
}

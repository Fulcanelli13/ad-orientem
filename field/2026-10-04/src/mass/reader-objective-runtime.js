import { buildPlannedObjectiveTraversal } from "./objective-engine.js";

const OBJECTIVE_FORMS=new Set(["LOW","SOLEMN"]);

export function createPlanAwareObjectiveRuntime({events,prepared}={}){
  const resolved=prepared?.session?.resolvedMass;
  const plan=prepared?.session?.plan;
  const form=String(resolved?.form??plan?.form??"").toUpperCase();

  if(!OBJECTIVE_FORMS.has(form)){
    return Object.freeze({
      schema:"ao-r18-plan-aware-objective-runtime-v1",
      supported:false,
      reason:"OBJECTIVE_RUNTIME_NOT_APPLICABLE_FOR_"+(form||"UNKNOWN_FORM"),
      form,
      owner:"R18_NOT_APPLICABLE",
      count:0,
      ids:Object.freeze([]),
      allows:()=>true,
      get:()=>null,
    });
  }

  if(!Array.isArray(events))throw new TypeError("Canonical MC event array required");
  if(!plan || plan.kind!=="MASS")throw new Error("Plan-aware objective runtime requires a MASS plan");
  const context=plan.objectiveContext;
  if(!context || context.form!==form){
    throw new Error("Mass plan is missing resolved objectiveContext for "+form);
  }

  const traversal=buildPlannedObjectiveTraversal(events,context,plan);
  const byId=new Map(traversal.map(event=>[event.id,event]));
  return Object.freeze({
    schema:"ao-r18-plan-aware-objective-runtime-v1",
    supported:true,
    reason:null,
    form,
    owner:"R18_PLANNED_OBJECTIVE_TRAVERSAL",
    context,
    count:traversal.length,
    ids:Object.freeze(traversal.map(event=>event.id)),
    traversal,
    allows:eventId=>byId.has(String(eventId??"")),
    get:eventId=>byId.get(String(eventId??""))??null,
  });
}

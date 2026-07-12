import type{CanonicalFormSchema,FormResponseRecord,FormResponseValue}from"@acutis/forms-schema";
export type ValidationIssue={fieldKey:string;code:"required"|"invalid"};
const empty=(v:FormResponseValue|undefined)=>v===undefined||v===null||v===""||(Array.isArray(v)&&v.length===0);
export function validateForm(schema:CanonicalFormSchema,answers:FormResponseRecord){return schema.sections.flatMap(s=>s.fields.filter(f=>f.required&&empty(answers[f.key])).map(f=>({fieldKey:f.key,code:"required" as const})));}

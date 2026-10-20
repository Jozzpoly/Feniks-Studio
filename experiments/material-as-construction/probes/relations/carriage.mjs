// Throwaway research probe: carrying one authored relation with a construction.
// Not a Studio file format, Ruch adapter, editor, or physical joint.
import {Construction,I,translation,multiply,inverse,worldIn,validate} from '../../core.mjs';

const clone=x=>structuredClone(x);
function rigid(m) {
 if(!Array.isArray(m)||m.length!==16||!m.every(Number.isFinite)||m[3]!==0||m[7]!==0||m[11]!==0||m[15]!==1)throw new Error('This probe requires a rigid affine frame.');
 const col=i=>m.slice(i*4,i*4+3),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 const cols=[col(0),col(1),col(2)],cross=[cols[0][1]*cols[1][2]-cols[0][2]*cols[1][1],cols[0][2]*cols[1][0]-cols[0][0]*cols[1][2],cols[0][0]*cols[1][1]-cols[0][1]*cols[1][0]];
 if(cols.some((a,i)=>cols.some((b,j)=>Math.abs(dot(a,b)-(i===j?1:0))>1e-8))||Math.abs(dot(cross,cols[2])-1)>1e-8)throw new Error('Only rigid frames are examined; scale, reflection and shear remain open.');
}
function check(pack) {
 validate(pack.doc);
 if(!Array.isArray(pack.relations)||pack.relations.length>pack.doc.nodes.length)throw new Error('Invalid relation list.');
 pack.doc.nodes.forEach(n=>rigid(n.matrix));
 const c=new Construction(pack.doc),ids=new Set(),branches=[];
 for(const r of pack.relations){
  if(typeof r.id!=='string'||!r.id||ids.has(r.id))throw new Error('Invalid relation identity.');ids.add(r.id);
  if(!c.node(r.base)||!c.node(r.moving))throw new Error('Missing relation endpoint.');
  for(const v of [r.pivot,r.axis])if(!Array.isArray(v)||v.length!==3||!v.every(Number.isFinite))throw new Error('Invalid relation frame.');
  const length=Math.hypot(...r.axis);if(!Number.isFinite(length)||length<1e-12)throw new Error('Invalid relation axis length.');
  if(!Array.isArray(r.range)||r.range.length!==2||!r.range.every(Number.isFinite)||r.range[0]>0||r.range[1]<0||r.range[0]>=r.range[1])throw new Error('Invalid relation range or rest position.');
  const branch=new Set([r.moving,...c.descendants(r.moving)]);
  if(branch.has(r.base))throw new Error('Cycle: the moving branch contains its own base.');
  branches.push({r,branch});
 }
 // This is deliberately a one-relation-per-mechanism probe, with independent copies.
 // No hidden ordering rule for chains, loops, or multiple drives on the same part.
 for(let i=0;i<branches.length;i++)for(let j=0;j<i;j++){
  const a=branches[i],b=branches[j];
  if(a.branch.has(b.r.base)||b.branch.has(a.r.base)||[...a.branch].some(id=>b.branch.has(id)))throw new Error('Coupled relation chains are outside this probe.');
 }
 return pack;
}

export function captureRelated(pack,ids) {
 check(pack);
 const recipe=new Construction(pack.doc).capture(ids,'Konstrukcja z relacją'),keep=new Set(recipe.doc.nodes.map(n=>n.id));
 const crossing=pack.relations.filter(r=>keep.has(r.base)!==keep.has(r.moving));
 if(crossing.length){const error=new Error('Capture crosses a relation boundary; choose the scope explicitly.');error.code='RELATION_BOUNDARY';error.relations=crossing.map(r=>r.id);throw error;}
 return check({doc:clone(recipe.doc),relations:clone(pack.relations.filter(r=>keep.has(r.base)&&keep.has(r.moving)))});
}

export function insertRelated(pack,recipe,placement=I()) {
 check(pack);check(recipe);rigid(placement);
 // Both node and relation identities change; names and source paths never identify endpoints.
 const idMap=Object.fromEntries(recipe.doc.nodes.map(n=>[n.id,crypto.randomUUID()]));
 const relationMap=Object.fromEntries(recipe.relations.map(r=>[r.id,crypto.randomUUID()]));
 const nodes=recipe.doc.nodes.map(n=>({...clone(n),id:idMap[n.id],parent:n.parent===null?null:idMap[n.parent],matrix:n.parent===null?multiply(placement,n.matrix):n.matrix.slice()}));
 const relations=recipe.relations.map(r=>({...clone(r),id:relationMap[r.id],base:idMap[r.base],moving:idMap[r.moving]}));
 const result=check({doc:{...clone(pack.doc),nodes:[...clone(pack.doc.nodes),...nodes]},relations:[...clone(pack.relations),...relations]});
 return {pack:result,idMap,relationMap,roots:nodes.filter(n=>n.parent===null).map(n=>n.id)};
}

function rotation(axis,angle) {
 const length=Math.hypot(...axis),[x,y,z]=axis.map(v=>v/length),c=Math.cos(angle),s=Math.sin(angle),t=1-c;
 return [t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1];
}
export function poseRelated(pack,values={}) {
 check(pack);
 for(const key of Object.keys(values))if(!pack.relations.some(r=>r.id===key))throw new Error('Unknown relation control: '+key);
 const posed=new Construction(pack.doc);
 for(const r of pack.relations){
  const q=Object.hasOwn(values,r.id)?values[r.id]:0;
  if(!Number.isFinite(q)||q<r.range[0]||q>r.range[1])throw new Error('Angle outside authored range.');
  if(q===0)continue;
  // q is a preview value, never written into the authored rest document.
  // Pivot and axis belong to the authored base part, not the scene or imported name.
  const b=worldIn(pack.doc,r.base),local=multiply(multiply(translation(...r.pivot),rotation(r.axis,q)),translation(...r.pivot.map(v=>-v)));
  posed.transform([r.moving],multiply(multiply(b,local),inverse(b)));
 }
 return clone(posed.snapshot());
}

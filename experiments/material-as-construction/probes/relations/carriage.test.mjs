import test from 'node:test';
import assert from 'node:assert/strict';
import {Construction,I,translation,multiply,point,worldIn,scale} from '../../core.mjs';
import {captureRelated,insertRelated,poseRelated} from './carriage.mjs';
import {fixture,yaw,pitch} from './fixture.mjs';
const empty=()=>({doc:{format:'feniks-construction-probe',version:1,nodes:[]},relations:[]});
const close=(a,b)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<1e-9,`${i}: ${x} != ${b[i]}`));};

// Independent point oracle: Rodrigues vector formula in world coordinates,
// not the matrix rotation implementation used by the experiment.
function expected(pack,rel,id,angle,p=[0,0,0]) {
 const b=worldIn(pack.doc,rel.base),x=point(worldIn(pack.doc,id),p),o=point(b,rel.pivot);
 const z=point(b,[0,0,0]),v=point(b,rel.axis).map((a,i)=>a-z[i]),len=Math.hypot(...v),u=v.map(a=>a/len);
 const d=x.map((a,i)=>a-o[i]),cross=[u[1]*d[2]-u[2]*d[1],u[2]*d[0]-u[0]*d[2],u[0]*d[1]-u[1]*d[0]],dot=u.reduce((s,a,i)=>s+a*d[i],0);
 return d.map((a,i)=>o[i]+a*Math.cos(angle)+cross[i]*Math.sin(angle)+u[i]*dot*(1-Math.cos(angle)));
}

test('copy carries endpoints to new IDs even when every node has the same name',()=>{
 const original=fixture(),frozen=JSON.stringify(original),recipe=captureRelated(original,['assembly']);
 const a=insertRelated(original,recipe,translation(-3,0,0));
 const b=insertRelated(a.pack,recipe,multiply(translation(3,0,0),yaw(Math.PI/2)));
 const rb=b.pack.relations.find(r=>r.id===b.relationMap.hinge);
 assert.equal(rb.base,b.idMap.frame);assert.equal(rb.moving,b.idMap.flap);
 assert.notEqual(rb.base,'frame');assert.notEqual(rb.moving,a.idMap.flap);
 assert.equal(new Set(b.pack.doc.nodes.map(n=>n.id)).size,12);
 assert.equal(JSON.stringify(original),frozen);
 const posed=poseRelated(b.pack,{[rb.id]:Math.PI/2});
 for(const id of ['frame','flap','handle',a.idMap.frame,a.idMap.flap,a.idMap.handle])close(worldIn(posed,id),worldIn(b.pack.doc,id));
 for(const id of [b.idMap.flap,b.idMap.handle])for(const p of [[0,0,0],[.3,.7,-.2]])close(point(worldIn(posed,id),p),expected(b.pack,rb,id,Math.PI/2,p));
});

test('a copied relation survives placement under a different rotated parent',()=>{
 const recipe=captureRelated(fixture(),['assembly']),a=insertRelated(empty(),recipe,translation(2,0,0));
 const construction=new Construction(a.pack.doc);
 construction.append([{id:'new-parent',name:'new home',parent:null,matrix:multiply(translation(-1,3,2),pitch(.63)),source:null}]);
 construction.reparent(a.roots,'new-parent');
 construction.transform(['new-parent'],multiply(translation(1,0,-2),yaw(.71)));
 const pack={...a.pack,doc:construction.snapshot()},rel=pack.relations[0];
 for(const angle of [0,.17,.79,Math.PI/2]){
  const posed=poseRelated(pack,{[rel.id]:angle});
  for(const id of [a.idMap.flap,a.idMap.handle])for(const p of [[0,0,0],[1,1,1],[-.2,.4,.8]])close(point(worldIn(posed,id),p),expected(pack,rel,id,angle,p));
  close(worldIn(posed,a.idMap.frame),worldIn(pack.doc,a.idMap.frame));
 }
 close(worldIn(poseRelated(pack,{[rel.id]:0}),a.idMap.flap),worldIn(pack.doc,a.idMap.flap));
});

test('editing the copy axis leaves the recipe, original and other copy unchanged',()=>{
 const original=fixture(),recipe=captureRelated(original,['assembly']),saved=JSON.stringify(recipe);
 const a=insertRelated(original,recipe,translation(-3,0,0)),b=insertRelated(a.pack,recipe,translation(3,0,0));
 const edited=structuredClone(b.pack),rel=edited.relations.find(r=>r.id===b.relationMap.hinge);
 rel.axis=[0,0,1];rel.pivot=[.2,.1,0];
 const posed=poseRelated(edited,{[rel.id]:.6});
 close(point(worldIn(posed,b.idMap.handle),[0,0,0]),expected(edited,rel,b.idMap.handle,.6));
 for(const id of ['flap','handle',a.idMap.flap,a.idMap.handle])close(worldIn(posed,id),worldIn(edited.doc,id));
 assert.equal(JSON.stringify(recipe),saved);assert.deepEqual(b.pack.relations.find(r=>r.id===rel.id).axis,[0,1,0]);
});

test('reparenting existing authored pieces preserves the relation when moving membership is retained',()=>{
 const a=fixture(),c=new Construction(a.doc);
 c.reparent(['flap'],'frame');c.reparent(['handle'],'assembly');
 // Handle is now explicitly a part of the authored moving assembly again.
 // Changing source hierarchy alone cannot decide semantic membership.
 c.reparent(['handle'],'flap');
 const b={...a,doc:c.snapshot()};
 for(const angle of [0,.4,1.3]){
  const pa=poseRelated(a,{hinge:angle}),pb=poseRelated(b,{hinge:angle});
  for(const id of ['frame','flap','handle'])close(worldIn(pa,id),worldIn(pb,id));
 }
});

test('axis norm overflow is refused rather than turning rotation into shrinkage',()=>{
 const pack=fixture();pack.relations[0].axis=[1.5e308,1.5e308,0];
 assert.throws(()=>poseRelated(pack,{hinge:Math.PI/3}),/axis/i);
});

test('extracting a descendant without either endpoint is explicitly only a static fragment',()=>{
 const fragment=captureRelated(fixture(),['handle']);
 assert.equal(fragment.doc.nodes.length,1);assert.deepEqual(fragment.relations,[]);
});

test('capturing only one endpoint reports the boundary, while geometry-only extraction remains legal',()=>{
 const pack=fixture(),before=JSON.stringify(pack);
 assert.throws(()=>captureRelated(pack,['flap']),e=>e.code==='RELATION_BOUNDARY'&&e.relations.includes('hinge'));
 assert.equal(new Construction(pack.doc).capture(['flap']).doc.nodes.length,2);
 assert.equal(JSON.stringify(pack),before);
});

test('fresh JSON roundtrip retains a decision; changing display names does not retarget it',()=>{
 const recipe=captureRelated(fixture(),['assembly']),loaded=JSON.parse(JSON.stringify(recipe));
 loaded.doc.nodes.forEach(n=>{n.name='entirely renamed';});
 const a=insertRelated(empty(),loaded,yaw(-.7)),rel=a.pack.relations[0],posed=poseRelated(a.pack,{[rel.id]:.8});
 close(point(worldIn(posed,a.idMap.handle),[.2,0,0]),expected(a.pack,rel,a.idMap.handle,.8,[.2,0,0]));
});

test('unsupported frames and incomplete references fail explicitly, without mutating input',()=>{
 const p=fixture(),before=JSON.stringify(p),recipe=captureRelated(p,['assembly']);
 for(const bad of [scale(2,1,1),scale(-1,1,1)])assert.throws(()=>insertRelated(p,recipe,bad),/rigid|sztyw/i);
 assert.throws(()=>poseRelated(p,{hinge:2}),/zakres|range/i);
 assert.throws(()=>poseRelated(p,{unknown:.1}),/unknown|nieznan/i);
 const missing=structuredClone(p);missing.relations[0].base='not-a-part';
 assert.throws(()=>poseRelated(missing,{}),/endpoint|końc|części/i);
 const backwards=structuredClone(p);backwards.relations[0].base='handle';
 assert.throws(()=>poseRelated(backwards,{}),/cykl|cycle|base/i);
 assert.equal(JSON.stringify(p),before);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { I, translation, scale, multiply, inverse, point, Construction } from './core.mjs';
const near=(a,b,eps=1e-9)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>assert.ok(Math.abs(x-b[i])<eps,`${i}: ${x} != ${b[i]}`));};
const rz=a=>[Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1];
const node=(id,parent,matrix,source=null)=>({id,parent,name:id,matrix,source});
const fixture=()=>({format:'feniks-construction-probe',version:1,nodes:[
  node('house',null,multiply(translation(-3,0,0),scale(2,1,.5))),
  node('balcony','house',multiply(translation(1,1,0),rz(.7))),
  node('rail','balcony',translation(.8,.4,0),{key:'source-house',path:'0/1/2'}),
  node('roof','house',translation(0,2,0),{key:'source-house',path:'0/3'}),
  node('carrier',null,multiply(translation(4,0,0),rz(-.6))),
  node('load','carrier',translation(0,1,0),{key:'source-creature',path:'0/2'})
]});
const pts=[[0,0,0],[1,0,0],[0,1,0],[0,0,1],[-1,2,.4]];
const worldPoints=(s,id)=>pts.flatMap(p=>point(s.world(id),p));

test('affine inverse preserves an independently known point after nonuniform scale and rotation',()=>{
 const m=multiply(translation(4,3,-2),multiply(rz(Math.PI/2),scale(2,3,4)));
 near(point(m,[1,2,3]),[-2,5,10]);near(point(inverse(m),[-2,5,10]),[1,2,3]);
 assert.throws(()=>inverse(scale(0,1,1)),/singular|odwrócić/);
});
test('detach and reparent preserve world vertices, including shear, and undo/redo',()=>{
 const s=new Construction(fixture()), before=worldPoints(s,'rail');
 s.reparent(['balcony'],null);near(worldPoints(s,'rail'),before);
 s.reparent(['balcony'],'carrier');near(worldPoints(s,'rail'),before);
 s.undo();near(worldPoints(s,'rail'),before);s.redo();near(worldPoints(s,'rail'),before);
 const restored=new Construction(JSON.parse(JSON.stringify(s.snapshot())));near(worldPoints(restored,'rail'),before);
});
test('ancestor plus child selection changes each geometric point exactly once',()=>{
 const s=new Construction(fixture()), before=worldPoints(s,'rail');
 s.transform(['balcony','rail'],translation(5,0,0));
 near(worldPoints(s,'rail'),before.map((x,i)=>x+(i%3===0?5:0)));
 const n=s.snapshot().nodes.length, railBefore=worldPoints(s,'rail'), roofBefore=worldPoints(s,'roof');
 const group=s.assemble(['balcony','rail','roof'],'Kram');
 assert.equal(s.snapshot().nodes.length,n+1);assert.equal(s.node('rail').parent,'balcony');
 assert.equal(s.node('roof').parent,group);near(worldPoints(s,'rail'),railBefore);near(worldPoints(s,'roof'),roofBefore);
});
test('a cycle or singular edit is rejected atomically with no history or notification',()=>{
 const s=new Construction(fixture());let changes=0;s.subscribe(()=>changes++);const before=JSON.stringify(s.snapshot());
 assert.throws(()=>s.reparent(['house'],'rail'),/cycle|cykl/);
 assert.throws(()=>s.transform(['house'],scale(0,1,1)),/singular|odwrócić/);
 assert.equal(JSON.stringify(s.snapshot()),before);assert.equal(changes,0);assert.equal(s.canUndo,false);
});
test('a recipe and two instances keep independent identities and unchanged source references',()=>{
 const s=new Construction(fixture());const original=worldPoints(s,'rail');
 const recipe=s.capture(['balcony','rail'],'Stoisko');const frozen=JSON.stringify(recipe);
 const [a]=s.insert(recipe,translation(0,0,5)),[b]=s.insert(recipe,translation(0,0,-5));
 const ar=s.descendants(a).find(id=>s.node(id).name==='rail'),br=s.descendants(b).find(id=>s.node(id).name==='rail');
 assert.ok(ar&&br&&ar!==br);const bp=worldPoints(s,br);
 s.transform([ar],translation(2,0,0));near(worldPoints(s,br),bp);near(worldPoints(s,'rail'),original);
 assert.equal(JSON.stringify(recipe),frozen);assert.deepEqual(s.node(ar).source,s.node('rail').source);
 s.remove([a]);near(worldPoints(s,br),bp);s.undo();assert.ok(s.node(ar));
});
test('reflection survives reparenting and malformed imported trees do not replace a valid document',()=>{
 const s=new Construction(fixture());s.transform(['balcony'],scale(-1,1,1));const before=worldPoints(s,'rail');
 s.reparent(['balcony'],'carrier');near(worldPoints(s,'rail'),before);
 const valid=JSON.stringify(s.snapshot()),bad=structuredClone(s.snapshot());bad.nodes[0].parent='missing';
 assert.throws(()=>s.replace(bad));assert.equal(JSON.stringify(s.snapshot()),valid);
});

// Disposable construction experiment. Geometry stays in immutable source assets.
// Full affine transforms preserve shear when a part changes its coordinate frame.
export const I = () => [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export const translation = (x,y,z) => { const m=I(); m[12]=x;m[13]=y;m[14]=z;return m; };
export const scale = (x,y,z) => [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
export function multiply(a,b) {
 const c=Array(16).fill(0);
 for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)c[col*4+row]+=a[k*4+row]*b[col*4+k];
 return c;
}
export function inverse(m) {
 const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
 const det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
 const max=Math.max(...[a,b,c,d,e,f,g,h,i].map(Math.abs));
 if(!Number.isFinite(det)||!max||Math.abs(det)<1e-14*max**3)throw new Error('Nie można odwrócić macierzy (singular).');
 const r=[(e*i-f*h)/det,(f*g-d*i)/det,(d*h-e*g)/det,0,(c*h-b*i)/det,(a*i-c*g)/det,(b*g-a*h)/det,0,(b*f-c*e)/det,(c*d-a*f)/det,(a*e-b*d)/det,0,0,0,0,1];
 const t=point(r,m.slice(12,15));r[12]=-t[0];r[13]=-t[1];r[14]=-t[2];return r;
}
export function point(m,p) {return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
const copy=x=>structuredClone(x);
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const uid=()=>globalThis.crypto.randomUUID();
const empty=()=>({format:'feniks-construction-probe',version:1,nodes:[]});
export function validate(doc) {
 if(doc?.format!=='feniks-construction-probe'||doc.version!==1||!Array.isArray(doc.nodes)||doc.nodes.length>5000)throw new Error('Nieznany dokument albo zbyt wiele części.');
 const map=new Map();
 for(const n of doc.nodes){
  if(typeof n.id!=='string'||!n.id||map.has(n.id)||typeof n.name!=='string'||n.name.length>256)throw new Error('Błędna tożsamość części.');
  if(n.parent!==null&&typeof n.parent!=='string')throw new Error('Błędny rodzic.');
  if(!Array.isArray(n.matrix)||n.matrix.length!==16||!n.matrix.every(Number.isFinite)||n.matrix[3]!==0||n.matrix[7]!==0||n.matrix[11]!==0||n.matrix[15]!==1)throw new Error('Błędna macierz afiniczna.');
  inverse(n.matrix);
  if(n.source!==null&&(typeof n.source?.key!=='string'||typeof n.source?.path!=='string'))throw new Error('Błędne źródło części.');
  if(Object.keys(n).some(k=>!['id','name','parent','matrix','source'].includes(k)))throw new Error('Nieznane pole części.');
  map.set(n.id,n);
 }
 const done=new Set(), active=new Set();
 function visit(id){if(done.has(id))return;if(active.has(id))throw new Error('Niedozwolony cykl (cycle).');const n=map.get(id);if(!n)throw new Error('Brak rodzica części.');active.add(id);if(n.parent!==null)visit(n.parent);active.delete(id);done.add(id);}
 for(const id of map.keys())visit(id);
 return doc;
}
export function worldIn(doc,id) {
 const map=new Map(doc.nodes.map(n=>[n.id,n]));let n=map.get(id);if(!n)throw new Error('Nie ma wybranej części.');
 let m=n.matrix;while(n.parent!==null){n=map.get(n.parent);m=multiply(n.matrix,m);}return m.slice();
}
function frontier(doc,ids){
 const map=new Map(doc.nodes.map(n=>[n.id,n])),sel=new Set(ids);
 for(const id of sel)if(!map.has(id))throw new Error('Nie ma wybranej części.');
 return [...sel].filter(id=>{let p=map.get(id).parent;while(p!==null){if(sel.has(p))return false;p=map.get(p).parent;}return true;});
}
function descendants(doc,id){const out=[];function visit(x){for(const n of doc.nodes)if(n.parent===x){out.push(n.id);visit(n.id);}}visit(id);return out;}
export class Construction {
 #doc;#past=[];#future=[];#listeners=new Set();
 constructor(doc=empty()){this.#doc=freeze(validate(copy(doc)));}
 snapshot(){return this.#doc;}
 node(id){return this.#doc.nodes.find(n=>n.id===id);}
 world(id){return worldIn(this.#doc,id);}
 frontier(ids){return frontier(this.#doc,ids);}
 descendants(id){return descendants(this.#doc,id);}
 get canUndo(){return !!this.#past.length;}
 get canRedo(){return !!this.#future.length;}
 subscribe(fn){this.#listeners.add(fn);return()=>this.#listeners.delete(fn);}
 #emit(label){for(const f of this.#listeners){try{f(label);}catch(e){console.error(e);}}}
 edit(label,fn){const next=copy(this.#doc),result=fn(next);validate(next);if(JSON.stringify(next)===JSON.stringify(this.#doc))return result;
  this.#past.push(this.#doc);if(this.#past.length>100)this.#past.shift();this.#future=[];this.#doc=freeze(next);this.#emit(label);return result;
 }
 undo(){if(!this.canUndo)return;this.#future.push(this.#doc);this.#doc=this.#past.pop();this.#emit('Cofnięto');}
 redo(){if(!this.canRedo)return;this.#past.push(this.#doc);this.#doc=this.#future.pop();this.#emit('Ponowiono');}
 replace(doc){const next=freeze(validate(copy(doc)));this.#doc=next;this.#past=[];this.#future=[];this.#emit('Otworzono zapis');}
 append(nodes){return this.edit('Wstawiono materiał',d=>d.nodes.push(...copy(nodes)));}
 reparent(ids,parent){
  const roots=this.frontier(ids), mats=new Map(roots.map(id=>[id,this.world(id)]));
  if(parent!==null&&!this.node(parent))throw new Error('Brak rodzica.');
  for(const id of roots)if(id===parent||this.descendants(id).includes(parent))throw new Error('Niedozwolony cykl (cycle).');
  const inv=parent===null?I():inverse(this.world(parent));
  return this.edit('Odłączono / połączono części',d=>{for(const id of roots){const n=d.nodes.find(x=>x.id===id);n.parent=parent;n.matrix=multiply(inv,mats.get(id));}});
 }
 transform(ids,delta,label='Przekształcono części'){
  const roots=this.frontier(ids),updates=new Map(roots.map(id=>{const n=this.node(id);const inv=n.parent===null?I():inverse(this.world(n.parent));return[id,multiply(inv,multiply(delta,this.world(id)))];}));
  return this.edit(label,d=>{for(const n of d.nodes)if(updates.has(n.id))n.matrix=updates.get(n.id);});
 }
 assemble(ids,name='Nowa konstrukcja',pivot){
  const roots=this.frontier(ids);if(!roots.length)throw new Error('Wybierz części do połączenia.');
  const mats=new Map(roots.map(id=>[id,this.world(id)]));
  const center=pivot||[0,1,2].map(i=>roots.reduce((s,id)=>s+mats.get(id)[12+i],0)/roots.length);
  const matrix=translation(...center),inv=inverse(matrix),id=uid();
  this.edit('Złożono konstrukcję',d=>{d.nodes.push({id,name,parent:null,matrix,source:null});for(const n of d.nodes)if(mats.has(n.id)){n.parent=id;n.matrix=multiply(inv,mats.get(n.id));}});
  return id;
 }
 remove(ids){const gone=new Set(this.frontier(ids).flatMap(id=>[id,...this.descendants(id)]));return this.edit('Usunięto części',d=>{d.nodes=d.nodes.filter(n=>!gone.has(n.id));});}
 capture(ids,name='Moja część'){
  const roots=this.frontier(ids);if(!roots.length)throw new Error('Wybierz części do zachowania.');
  const keep=new Set(roots.flatMap(id=>[id,...this.descendants(id)])),nodes=copy(this.#doc.nodes.filter(n=>keep.has(n.id)));
  const center=[0,1,2].map(i=>roots.reduce((s,id)=>s+this.world(id)[12+i],0)/roots.length),inv=inverse(translation(...center));
  for(const n of nodes)if(roots.includes(n.id)){n.parent=null;n.matrix=multiply(inv,this.world(n.id));}
  return freeze({name,doc:validate({...empty(),nodes})});
 }
 insert(recipe,delta=I()){
  const doc=validate(copy(recipe.doc)),ids=new Map(doc.nodes.map(n=>[n.id,uid()])),roots=[];
  const nodes=doc.nodes.map(n=>{const id=ids.get(n.id),root=n.parent===null;if(root)roots.push(id);return{...n,id,parent:root?null:ids.get(n.parent),matrix:root?multiply(delta,n.matrix):n.matrix};});
  this.edit('Wstawiono własną część',d=>d.nodes.push(...nodes));return roots;
 }
}

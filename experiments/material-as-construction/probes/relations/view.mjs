import {I,translation,multiply} from '../../core.mjs';
import {fixture,yaw} from './fixture.mjs';
import {captureRelated,insertRelated,poseRelated} from './carriage.mjs';
const J=window.Jaskinia,{THREE}=J.swiat.three();
const el=(tag,props={})=>Object.assign(document.createElement(tag),props);
J.ext.type('relation-carriage-probe',{name:'Próba · konstrukcja z relacją',glyph:'t_materialy',group:'studio',fill:true,live:true,
 render(box,c){
  const app=el('div',{className:'relation-probe'});app.style.cssText='display:flex;flex-direction:column;height:100%;min-height:300px';
  const top=el('div'),legend=el('div'),host=el('div'),foot=el('div');
  top.style.cssText=legend.style.cssText=foot.style.cssText='padding:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--rule);font-size:12px';
  host.style.cssText='flex:1;min-height:200px;position:relative';foot.style.minHeight='42px';
  const choice=el('select',{ariaLabel:'Egzemplarz'});['Oryginał','Kopia','Kopia obrócona'].forEach((t,i)=>choice.append(el('option',{value:String(i),textContent:t})));
  const slider=el('input',{type:'range',min:'0',max:'90',step:'1',value:'0',ariaLabel:'Kąt'}),angle=el('output',{textContent:'0°'});
  const button=(text,fn)=>el('button',{className:'btn',textContent:text,onclick:fn});
  const axis=button('Zmień oś kopii',()=>{const r=pack.relations.find(r=>r.id===entries[1].relationMap.hinge);r.axis=r.axis[1]?[0,0,1]:[0,1,0];foot.textContent='Oś zmieniła się tylko w środkowej kopii. Porównaj jej ruch z pozostałymi.';draw();});
  const boundary=button('Sprawdź wyjęcie samej klapy',()=>{try{captureRelated(pack,[entries[Number(choice.value)].idMap.flap]);foot.textContent='Nieoczekiwane: przyjęto niepełną relację.';}catch(e){if(e.code!=='RELATION_BOUNDARY')throw e;foot.textContent='Sama klapa nie zawiera ramy, względem której ją obracamy. Geometrię można wyjąć; zachowanie relacji wymaga jawnej decyzji o jej drugim końcu.';}});
  top.append(choice,slider,angle,axis,boundary);legend.textContent='Trzy niezależne konstrukcje. Zielona strzałka pokazuje oś względem ramy. Obróć widok myszą.';
  foot.textContent='Syntetyczna próba przenoszenia decyzji. Podgląd kinematyczny, bez fizyki i bez integracji z Ruchem v6.4.';
  app.append(top,legend,host,foot);box.append(app);
  const stage=J.swiat.stage(host,{still:true}),objects=new Map(),arrows=[];
  const recipe=captureRelated(fixture(),['assembly']);let pack={doc:{format:'feniks-construction-probe',version:1,nodes:[]},relations:[]};const entries=[],values={};
  for(const [x,a] of [[-3.6,0],[-.4,0],[3.2,Math.PI/2]]){const result=insertRelated(pack,recipe,multiply(translation(x,1.2,0),yaw(a)));entries.push(result);pack=result.pack;values[result.relationMap.hinge]=0;}
  for(const n of pack.doc.nodes){
   const group=new THREE.Group();group.matrixAutoUpdate=false;objects.set(n.id,group);
   const path=n.source?.path;let dims,color;
   if(path==='0/0'){dims=[.16,2.25,.2];color=0x8499a3;}else if(path==='0/1'){dims=[1.6,2,.12];color=0xc39754;}else if(path==='0/1/0'){dims=[.18,.14,.25];color=0xe8ddd0;}
   if(dims){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...dims),new THREE.MeshStandardMaterial({color,roughness:.64}));group.add(mesh);mesh.castShadow=mesh.receiveShadow=true;}
  }
  for(const n of pack.doc.nodes)(n.parent===null?stage.root:objects.get(n.parent)).add(objects.get(n.id));
  for(const r of pack.relations){const a=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),1.4,0x79bb8a,.2,.1);objects.get(r.base).add(a);arrows.push({a,id:r.id});}
  function draw(){
   const posed=poseRelated(pack,values);for(const n of posed.nodes){const o=objects.get(n.id);o.matrix.fromArray(n.matrix);o.matrixWorldNeedsUpdate=true;}
   for(const {a,id}of arrows){const r=pack.relations.find(r=>r.id===id);a.position.fromArray(r.pivot);a.setDirection(new THREE.Vector3(...r.axis).normalize());}
   stage.root.updateMatrixWorld(true);stage.redraw();
  }
  choice.onchange=()=>{const q=values[entries[Number(choice.value)].relationMap.hinge];slider.value=String(Math.round(q*180/Math.PI));angle.textContent=slider.value+'°';};
  slider.oninput=()=>{values[entries[Number(choice.value)].relationMap.hinge]=Number(slider.value)*Math.PI/180;angle.textContent=slider.value+'°';draw();};
  draw();stage.frame(false);
  window.__RELATION_PROBE={entries,objects,stage,get pack(){return pack;},values};
  c.onDispose(()=>{stage.dispose();objects.clear();if(window.__RELATION_PROBE?.stage===stage)delete window.__RELATION_PROBE;});
 }
});
J.ext.open('relation-carriage-probe',{w:.92,h:.84});

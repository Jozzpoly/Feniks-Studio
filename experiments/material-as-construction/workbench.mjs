import {Construction,I,translation,multiply,inverse,worldIn,validate} from './core.mjs';
import {createFixtures} from './fixtures.mjs';

// A disposable native Jaskinia instrument, not a replacement shell or a world format.
const HOST_REF='dd47f3253dbcf522b4cd671c794599d32cbe79b9';
const MAX_RECIPES=100,MAX_SOURCES=30;
const J=window.Jaskinia, {THREE,TransformControls}=J.swiat.three();
const session=new Construction(), bank=new Map(), recipes=[], views=new Set();
let chosen=[],loading=false,saveText='Nowa praca',saveChain=Promise.resolve(),ready=false;
const $=(tag,props={},...kids)=>{const e=document.createElement(tag);Object.assign(e,props);for(const k of kids.flat()){if(k!=null)e.append(typeof k==='string'?document.createTextNode(k):k);}return e;};
const button=(label,fn,title=label)=>$('button',{className:'btn',textContent:label,title,onclick:()=>attempt(fn)});
function attempt(fn){try{Promise.resolve(fn()).catch(fail);}catch(e){fail(e);}}
function fail(e){saveText=e.message||String(e);refresh();J.ext.toast(saveText);console.error(e);}
const sha=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const roots=()=>session.snapshot().nodes.filter(n=>n.parent===null).map(n=>n.id);
const sourceKeys=(doc,rs)=>new Set([doc,...rs.map(r=>r.doc)].flatMap(d=>d.nodes.map(n=>n.source?.key).filter(Boolean)));
function packageOf(doc=session.snapshot(),rs=recipes){
 const keys=sourceKeys(doc,rs);
 if(rs.length>MAX_RECIPES||keys.size>MAX_SOURCES)throw new Error('Przekroczono pojemność tej próby.');
 return {format:'feniks-construction-package-probe',version:1,hostRef:HOST_REF,doc,recipes:rs,sources:[...keys].map(key=>{const b=bank.get(key);if(!b)throw new Error('Brak źródłowego modelu.');return{key,name:b.name,text:b.text};})};
}
function db(){return new Promise((resolve,reject)=>{const q=indexedDB.open('feniks-construction-probe-20261019',1);q.onupgradeneeded=()=>q.result.createObjectStore('project');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});}
async function stored(write){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('project',write?'readwrite':'readonly'),os=tx.objectStore('project');let value;const q=write?os.put(write,'current'):os.get('current');q.onsuccess=()=>{value=q.result;};tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(tx.error);});}finally{d.close();}}
function persist(){if(!ready||loading)return;const pack=packageOf();saveText='Zapisuję…';refresh();saveChain=saveChain.catch(()=>{}).then(()=>stored(pack)).then(()=>{saveText='Zapisano lokalnie';refresh();},e=>{saveText='Nie zapisano — pobierz plik: '+e.message;refresh();throw e;});saveChain.catch(()=>{});}
function disposeObject(obj){const geos=new Set(),mats=new Set(),textures=new Set();obj.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [].concat(o.material||[])){mats.add(m);for(const x of Object.values(m))if(x?.isTexture)textures.add(x);}});geos.forEach(g=>{g.disposeBoundsTree?.();g.dispose();});textures.forEach(x=>x.dispose());mats.forEach(m=>m.dispose());}
function clonePart(original){
 const o=original.clone(false);o.matrixAutoUpdate=false;o.userData={};
 if(o.geometry)o.geometry=o.geometry.clone();
 if(o.material){const clone=m=>{const c=m.clone();for(const [k,v]of Object.entries(m))if(v?.isTexture){c[k]=v.clone();c[k].needsUpdate=true;}return c;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);}
 return o;
}
async function readSource(name,text,key){
 if(text.length>12*1024*1024)throw new Error('Ta próba przyjmuje modele do 12 MB.');
 if(!name.toLowerCase().endsWith('.bbmodel'))throw new Error('Ta próba rozbiera statyczne .bbmodel z osadzonymi teksturami.');
 const parsed=JSON.parse(text);
 if(parsed.animations?.length)throw new Error('Ten model ma animacje. Próba nie zachowuje rigów i odmawia jego rozebrania.');
 if((parsed.textures||[]).some(t=>!/^data:image\//.test(t.source||'')))throw new Error('Zapisz model z teksturami osadzonymi w .bbmodel.');
 const hash=await sha(text);if(key&&key!==hash)throw new Error('Źródłowy model nie zgadza się z zapisanym odciskiem.');
 const result=await J.materialy.import([{name,blob:new Blob([text],{type:'application/json'})}]);
 if(!result.done?.[0])throw new Error('Importer nie przyjął modelu: '+name);
 const id=result.done[0].id, object=await J.materialy.object(id,{set:1}),lookup=new Map();
 object.updateMatrixWorld(true);
 function index(o,path){lookup.set(path,o);o.children.forEach((ch,i)=>index(ch,path+'/'+i));}index(object,'0');
 return{key:hash,name,text,id,object,lookup};
}
async function addFiles(files){
 if(loading)return;loading=true;saveText='Wczytuję modele…';refresh();
 try{for(const file of files){const text=await(file.blob||file).text(),key=await sha(text);if(!bank.has(key)&&bank.size>=MAX_SOURCES)throw new Error('Ta próba mieści 30 źródłowych modeli w jednej pracy.');const b=await readSource(file.name,text,key);const previous=bank.get(b.key);if(previous)disposeObject(b.object);else bank.set(b.key,b);const src=previous||b;
   const prefix=crypto.randomUUID(),nodes=[],offset=translation(roots().length*5,0,0);
   function add(o,path,parent){const id=prefix+':'+path;nodes.push({id,parent,name:path==='0'?src.name.replace(/\.bbmodel$/i,''):(o.name||'Układ części'),matrix:path==='0'?multiply(offset,o.matrix.toArray()):o.matrix.toArray(),source:{key:src.key,path}});o.children.forEach((ch,i)=>add(ch,path+'/'+i,id));}
   add(src.object,'0',null);session.append(nodes);chosen=[nodes[0].id];
  }saveText='Modele gotowe';
 }finally{loading=false;refresh();persist();views.forEach(v=>v.frame());}
}
async function openPackage(pack){
 if(pack?.format!=='feniks-construction-package-probe'||pack.version!==1||pack.hostRef!==HOST_REF)throw new Error('Ten zapis wymaga innej wersji próby / importera.');
 validate(pack.doc);if(!Array.isArray(pack.recipes)||pack.recipes.length>MAX_RECIPES||!Array.isArray(pack.sources)||pack.sources.length>MAX_SOURCES)throw new Error('Błędny pakiet.');
 for(const r of pack.recipes){if(typeof r.name!=='string')throw new Error('Błędna nazwa części.');validate(r.doc);}
 const wanted=sourceKeys(pack.doc,pack.recipes),raw=new Map();
 for(const s of pack.sources){if(typeof s.key!=='string'||raw.has(s.key)||typeof s.text!=='string'||typeof s.name!=='string')throw new Error('Błędne źródło.');raw.set(s.key,s);}
 for(const key of wanted)if(!raw.has(key))throw new Error('W pakiecie brakuje źródłowego modelu.');
 loading=true;saveText='Odtwarzam pracę…';refresh();const pending=new Map();
 try{
  for(const key of wanted){const s=raw.get(key);pending.set(key,await readSource(s.name,s.text,key));}
  for(const d of [pack.doc,...pack.recipes.map(r=>r.doc)])for(const n of d.nodes)if(n.source&&!pending.get(n.source.key)?.lookup.has(n.source.path))throw new Error('Nie można odtworzyć konkretnej części modelu.');
  for(const b of bank.values())disposeObject(b.object);bank.clear();for(const [k,b]of pending)bank.set(k,b);
  recipes.splice(0,recipes.length,...structuredClone(pack.recipes));chosen=[];session.replace(pack.doc);pending.clear();
 }catch(e){pending.forEach(b=>disposeObject(b.object));throw e;}finally{loading=false;refresh();}
 persist();views.forEach(v=>v.frame());
}
function download(pack,name){const u=URL.createObjectURL(new Blob([JSON.stringify(pack)],{type:'application/json'}));const a=$('a',{href:u,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function select(ids){chosen=[...new Set(ids)].filter(id=>session.node(id));refresh();}
function refresh(){for(const v of views)v.refresh();}
session.subscribe(()=>{chosen=chosen.filter(id=>session.node(id));for(const v of views)v.rebuild();persist();});
const style=$('style',{textContent:`
.fc-app{display:flex;flex-direction:column;height:100%;min-height:280px;color:var(--ink);font-size:12px;overflow:hidden}
.fc-top,.fc-tools{display:flex;gap:5px;align-items:center;flex-wrap:wrap;padding:7px;border-bottom:1px solid var(--rule)}
.fc-main{display:flex;flex:1;min-height:0}.fc-tree{width:220px;flex-shrink:0;overflow:auto;padding:8px;border-right:1px solid var(--rule);background:var(--ground-2)}
.fc-stage{position:relative;flex:1;min-width:150px}.fc-side{width:230px;flex-shrink:0;padding:10px;overflow:auto;border-left:1px solid var(--rule);background:var(--ground-2)}
.fc-tree summary{display:flex;align-items:center;cursor:pointer}.fc-tree details{margin:2px 0}.fc-node{flex:1;text-align:left;border:0;background:transparent;color:inherit;font:inherit;border-radius:4px;padding:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;min-width:0}.fc-node:hover{background:var(--plate)}.fc-node[aria-pressed=true]{background:color-mix(in srgb,var(--hand) 22%,transparent);color:var(--hand)}
.fc-side h4{font-size:12px;margin:14px 0 6px;color:var(--ink-2)}.fc-side h4:first-child{margin-top:0}.fc-side .btn{margin:3px 3px 3px 0}.fc-side input,.fc-side select{max-width:100%;width:100%;font:inherit;padding:6px;background:var(--ground);color:var(--ink);border:1px solid var(--rule);border-radius:4px}.fc-hint{color:var(--ink-3);line-height:1.55;font-size:11px}.fc-footer{padding:5px 9px;border-top:1px solid var(--rule);display:flex;gap:12px;justify-content:space-between;color:var(--ink-3);font-size:11px}.fc-shelf{border:1px solid var(--rule);border-radius:5px;padding:7px;margin:6px 0}.fc-count{font-variant-numeric:tabular-nums}.fc-overlay{position:absolute;left:10px;top:10px;pointer-events:none;color:var(--ink-2);font-size:11px;background:var(--ground-2);border-radius:4px;padding:5px 8px}.fc-tree .fc-children{margin-left:10px;border-left:1px solid var(--rule);padding-left:4px}
@media(max-width:900px){.fc-tree{width:170px}.fc-side{width:180px}.fc-top .btn{font-size:11px}}@media(max-width:650px){.fc-tree{width:130px}.fc-side{width:155px}.fc-main{overflow:auto}.fc-stage{min-width:260px}}
`});document.head.append(style);

J.ext.type('tworzywo-probe',{name:'Tworzywo · rozbierz, złóż, użyj',glyph:'t_materialy',group:'studio',fill:true,live:true,
 render(box,c){
  const app=$('div',{className:'fc-app',tabIndex:0}),top=$('div',{className:'fc-top'}),main=$('div',{className:'fc-main'}),tree=$('div',{className:'fc-tree'}),host=$('div',{className:'fc-stage'}),side=$('div',{className:'fc-side'}),foot=$('div',{className:'fc-footer'}),save=$('span'),count=$('span',{className:'fc-count'});
  app.append(top,main,foot);main.append(tree,host,side);foot.append(save,count);box.append(app);
  const input=$('input',{type:'file',accept:'.bbmodel',multiple:true,hidden:true}),load=$('input',{type:'file',accept:'.json',hidden:true});
  input.onchange=()=>{attempt(()=>addFiles([...input.files]));input.value='';};load.onchange=()=>{const f=load.files[0];if(f)attempt(async()=>openPackage(JSON.parse(await f.text())));load.value='';};app.append(input,load);
  const undo=button('Cofnij',()=>session.undo()),redo=button('Ponów',()=>session.redo());
  top.append(button('Modele próbne',async()=>addFiles(await createFixtures())),button('+ Model',()=>input.click()),button('Otwórz pracę',()=>load.click()),button('Zapisz plik',()=>download(packageOf(),'moja-konstrukcja.json')),undo,redo,button('Kadr',()=>stage.frame(false)));
  const stage=J.swiat.stage(host,{still:true}),objects=new Map(),helpers=new THREE.Group();stage.scene.add(helpers);stage.human(true);
  const overlay=$('div',{className:'fc-overlay',textContent:'Statyczna konstrukcja · próba, bez symulacji'});host.append(overlay);
  const proxy=new THREE.Object3D();stage.scene.add(proxy);
  const control=new TransformControls(stage.camera,stage.canvas);control.setSpace('world');control.setSize(.8);const gizmo=control.getHelper();stage.scene.add(gizmo);
  let alive=true,drag=null,lastSig='',mode='translate',pickWhole=false;
  function boundsFor(ids){const b=new THREE.Box3();for(const id of session.frontier(ids)){const o=objects.get(id);if(o)b.union(new THREE.Box3().setFromObject(o));}return b;}
  function cleanupHelpers(){for(const o of [...helpers.children]){helpers.remove(o);disposeObject(o);}}
  function selectionVisual(){if(drag)return;cleanupHelpers();const ids=chosen.filter(id=>objects.has(id));
   for(const id of session.frontier(ids)){const b=new THREE.Box3().setFromObject(objects.get(id));if(!b.isEmpty())helpers.add(new THREE.Box3Helper(b,0xf2b14b));}
   const b=boundsFor(ids);if(!ids.length||b.isEmpty()){control.detach();}else{proxy.position.copy(b.getCenter(new THREE.Vector3()));proxy.quaternion.identity();proxy.scale.set(1,1,1);proxy.updateMatrixWorld(true);control.attach(proxy);control.setMode(mode);}stage.redraw();
  }
  function rebuild(){
   if(!alive)return;control.detach();drag=null;
   for(const o of objects.values())o.clear();stage.root.clear();const doc=session.snapshot(),valid=new Set(doc.nodes.map(n=>n.id));
   for(const [id,o]of objects)if(!valid.has(id)){disposeObject(o);objects.delete(id);}
   for(const n of doc.nodes){let o=objects.get(n.id);const sig=JSON.stringify(n.source);if(o&&o.userData.sourceSig!==sig){disposeObject(o);objects.delete(n.id);o=null;}
    if(!o){const src=n.source?bank.get(n.source.key)?.lookup.get(n.source.path):null;if(n.source&&!src)throw new Error('Brak części źródłowej.');o=src?clonePart(src):new THREE.Group();o.matrixAutoUpdate=false;o.userData={nodeId:n.id,sourceSig:sig};objects.set(n.id,o);}o.name=n.name;o.matrix.fromArray(n.matrix);o.matrixWorldNeedsUpdate=true;
   }
   for(const n of doc.nodes)(n.parent===null?stage.root:objects.get(n.parent)).add(objects.get(n.id));stage.root.updateMatrixWorld(true);stage.frame(true);drawTree();drawSide();selectionVisual();refreshView();
  }
  const closed=new Set();
  function drawTree(){tree.replaceChildren($('div',{className:'fc-hint',textContent:'Kliknij część. Shift/Ctrl dodaje do zaznaczenia. Strzałki rozwijają wnętrze.'}));const doc=session.snapshot();
   function branch(n){const kids=doc.nodes.filter(x=>x.parent===n.id);if(n.name==='Układ części'&&kids.length===1)return branch(kids[0]);const b=$('button',{className:'fc-node',textContent:(kids.length?'◇ ':'▧ ')+n.name,title:n.name,onclick:e=>{e.preventDefault();e.stopPropagation();const multi=e.shiftKey||e.ctrlKey;select(multi?(chosen.includes(n.id)?chosen.filter(x=>x!==n.id):[...chosen,n.id]):[n.id]);}});b.dataset.nodeId=n.id;b.setAttribute('aria-pressed',String(chosen.includes(n.id)));
    if(!kids.length)return b;const d=$('details',{open:!closed.has(n.id)}),s=$('summary'),ch=$('div',{className:'fc-children'});s.append(b);d.append(s,ch);d.ontoggle=()=>{if(d.open)closed.delete(n.id);else closed.add(n.id);};kids.forEach(x=>ch.append(branch(x)));return d;
   }doc.nodes.filter(n=>n.parent===null).forEach(n=>tree.append(branch(n)));
   if(!doc.nodes.length)tree.append($('p',{className:'fc-hint',textContent:'Wczytaj modele próbne albo własny plik .bbmodel.'}));
  }
  function drawSide(){side.replaceChildren();const nodes=chosen.map(id=>session.node(id)).filter(Boolean),n=nodes.length===1?nodes[0]:null;
   side.append($('h4',{textContent:n?n.name:nodes.length?`${nodes.length} zaznaczonych części`:'Zacznij od własnych części'}));
   const tools=$('div');for(const [k,label]of [['translate','Przesuń'],['rotate','Obróć'],['scale','Skala']]){const b=button(label,()=>{mode=k;control.setMode(k);selectionVisual();drawSide();});b.classList.toggle('on',mode===k);tools.append(b);}side.append(tools);
   const scope=$('select');scope.append($('option',{value:'part',textContent:'Klikanie: pojedyncza część'}),$('option',{value:'whole',textContent:'Klikanie: cała konstrukcja'}));scope.value=pickWhole?'whole':'part';scope.onchange=()=>{pickWhole=scope.value==='whole';};side.append(scope);
   if(n){const name=$('input',{value:n.name,title:'Nazwa części',placeholder:'Nazwa części'});name.onchange=()=>attempt(()=>session.edit('Zmieniono nazwę',d=>{d.nodes.find(x=>x.id===n.id).name=name.value.trim()||n.name;}));side.append(name);if(n.source)side.append($('p',{className:'fc-hint',textContent:'Źródło: '+bank.get(n.source.key).name}));}
   const detached=button('Odłącz',()=>session.reparent(chosen,null),'Wyjmij z konstrukcji, zachowując wygląd i miejsce');detached.disabled=!nodes.length;
   const group=button('Połącz',()=>{const b=boundsFor(chosen);const id=session.assemble(chosen,'Moja konstrukcja',b.isEmpty()?undefined:b.getCenter(new THREE.Vector3()).toArray());select([id]);},'Zaznacz kilka części i zbuduj z nich nową całość');group.disabled=!nodes.length;side.append(detached,group);
   if(nodes.length){const parent=$('select');parent.append($('option',{value:'',textContent:'Dołącz do konstrukcji…'}));const forbidden=new Set(chosen.flatMap(id=>[id,...session.descendants(id)]));session.snapshot().nodes.filter(x=>!forbidden.has(x.id)&&(!x.source||!bank.get(x.source.key).lookup.get(x.source.path).isMesh)).forEach(x=>parent.append($('option',{value:x.id,textContent:x.name})));parent.onchange=()=>{if(parent.value)attempt(()=>session.reparent(chosen,parent.value));};side.append(parent);}
   const capture=button('Zachowaj część',()=>{if(recipes.length>=MAX_RECIPES)throw new Error('Ta próba mieści 100 zachowanych części w jednej pracy.');const r=session.capture(chosen,n?.name||'Moja część');recipes.push(r);persist();drawSide();},'Zachowaj przepis na tę konstrukcję do ponownego użycia');capture.disabled=!nodes.length;side.append(capture);
   const remove=button('Usuń',()=>{session.remove(chosen);select([]);});remove.disabled=!nodes.length;side.append(remove);
   side.append($('h4',{textContent:'Twoje części'}));
   if(!recipes.length)side.append($('p',{className:'fc-hint',textContent:'Wyjmij balkon z domu, złóż kram i zachowaj go tutaj. Każdy nowy egzemplarz można potem zmieniać osobno.'}));
   recipes.forEach((r,i)=>{const card=$('div',{className:'fc-shelf'},$('b',{textContent:r.name}));const insert=button('Wstaw',()=>{select(session.insert(r,translation(roots().length*2,0,3)));stage.frame(false);});insert.dataset.recipe=String(i);card.append($('div',{},insert,button('Plik części',()=>download(packageOf(r.doc,[r]),'czesc-'+(i+1)+'.json'))));side.append(card);});
   side.append($('p',{className:'fc-hint',textContent:'Źródłowy model pozostaje niezmieniony. Plik pracy/części zawiera potrzebne źródłowe .bbmodel i tekstury. Grupowanie nie nadaje fizyki ani funkcji przedmiotom.'}));
  }
  function refreshView(){if(!alive)return;save.textContent=saveText;count.textContent=`${session.snapshot().nodes.filter(n=>n.source&&bank.get(n.source.key)?.lookup.get(n.source.path)?.isMesh).length} elementów · ${recipes.length} własnych części`;undo.disabled=!session.canUndo;redo.disabled=!session.canRedo;
   const sig=chosen.join('|');if(sig!==lastSig){lastSig=sig;for(const el of tree.querySelectorAll('[data-node-id]'))el.setAttribute('aria-pressed',String(chosen.includes(el.dataset.nodeId)));drawSide();selectionVisual();}}
  control.addEventListener('dragging-changed',e=>{
   stage.controls.enabled=!e.value;
   if(e.value){proxy.updateMatrixWorld(true);drag={start:proxy.matrixWorld.toArray(),ids:session.frontier(chosen)};}
   else if(drag){const d=drag;drag=null;proxy.updateMatrixWorld(true);try{session.transform(d.ids,multiply(proxy.matrixWorld.toArray(),inverse(d.start)));}catch(e){rebuild();fail(e);}selectionVisual();}
  });
  control.addEventListener('objectChange',()=>{if(!drag)return;proxy.updateMatrixWorld(true);const delta=multiply(proxy.matrixWorld.toArray(),inverse(drag.start));
   for(const id of drag.ids){const n=session.node(id),inv=n.parent===null?I():inverse(session.world(n.parent));objects.get(id).matrix.fromArray(multiply(inv,multiply(delta,session.world(id))));objects.get(id).matrixWorldNeedsUpdate=true;}stage.root.updateMatrixWorld(true);stage.redraw();
  });
  let down=null;const pointerDown=e=>{down={x:e.clientX,y:e.clientY};};
  const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>4||control.axis||drag)return;const r=stage.canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),stage.camera);const hit=ray.intersectObjects(stage.root.children,true).find(h=>h.object.userData.nodeId);if(!hit){if(!e.shiftKey)select([]);return;}let id=hit.object.userData.nodeId;if(pickWhole)while(session.node(id).parent!==null)id=session.node(id).parent;select(e.shiftKey?(chosen.includes(id)?chosen.filter(x=>x!==id):[...chosen,id]):[id]);};
  stage.canvas.addEventListener('pointerdown',pointerDown);stage.canvas.addEventListener('pointerup',pointerUp);
  app.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.stopPropagation();e.shiftKey?session.redo():session.undo();}else if(e.key==='Escape')select([]);});
  const view={rebuild,refresh:refreshView,frame:()=>stage.frame(false),stage,objects,control,proxy,boundsFor};views.add(view);rebuild();
  c.onDispose(()=>{alive=false;views.delete(view);control.detach();control.dispose();stage.scene.remove(gizmo,proxy,helpers);cleanupHelpers();stage.canvas.removeEventListener('pointerdown',pointerDown);stage.canvas.removeEventListener('pointerup',pointerUp);stage.dispose();objects.clear();});
 }
});

// Small inspection surface for the isolated qualification script, not an agent product API.
window.__TWORZYWO={session,bank,recipes,views,select,addFiles,openPackage,packageOf,get saved(){return saveChain;},get ready(){return ready;}};
try{const saved=await stored();if(saved)await openPackage(saved);}catch(e){saveText='Nie odtworzono zapisu: '+e.message;console.error(e);}
ready=true;J.ext.open('tworzywo-probe',{w:.94,h:.9});refresh();

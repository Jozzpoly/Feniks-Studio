import {createDocument,createSession,newId,validateDocument} from './document.mjs';
import {createViewport,validateGlb} from './viewport.mjs';
const KEY='feniks-studio:place:v1';
let session,baseline=null,notice='',savedJSON=null;
const listeners=new Set();
const announce=message=>{notice=message;for(const f of listeners)f();};
function initialize(){
  if(session)return;
  let doc=createDocument();
  try{baseline=localStorage.getItem(KEY);if(baseline)doc=validateDocument(JSON.parse(baseline));}
  catch(e){notice='Nie udało się odczytać zapisu: '+e.message;}
  session=createSession(doc);savedJSON=baseline?JSON.stringify(doc):null;
  window.addEventListener('beforeunload',e=>{if(JSON.stringify(session.getSnapshot())!==savedJSON){e.preventDefault();e.returnValue='';}});
}
function el(tag,attrs={},...children){const n=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='text')n.textContent=v;else if(k.startsWith('on'))n.addEventListener(k.slice(2),v);else n.setAttribute(k,v);}n.append(...children);return n;}
const button=(text,run)=>el('button',{class:'btn',type:'button',text,onclick:()=>{try{run();}catch(e){announce(e.message);}}});
function active(d){return d.variants.find(v=>v.id===d.activeVariantId);}
function save(){
  try{if(localStorage.getItem(KEY)!==baseline)throw Error('Zapis zmienił się w innej karcie. Pobierz projekt, zanim wybierzesz dalszą wersję.');
    const next=JSON.stringify(session.getSnapshot());localStorage.setItem(KEY,next);baseline=next;savedJSON=next;announce('Zapisano lokalnie.');
  }catch(e){announce('Nie zapisano: '+e.message);}
}
function download(){const blob=new Blob([JSON.stringify(session.getSnapshot(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=el('a',{href:url,download:'miejsce.feniks.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Pobrano projekt. Zachowaj plik jako przenośną kopię.');}
const css=`.fs-place{height:100%;display:flex;flex-direction:column;min-height:220px;container-type:inline-size}.fs-bar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border-bottom:1px solid var(--line,#555)}.fs-work{flex:1;display:flex;min-height:120px}.fs-view{flex:1;min-width:90px;position:relative;overflow:hidden}.fs-side{width:218px;overflow:auto;padding:10px;border-left:1px solid var(--line,#555)}.fs-side label{display:block;margin:7px 0}.fs-side input,.fs-side select{width:100%;min-width:0}.fs-axes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.fs-objects{display:flex;flex-direction:column;gap:4px;margin:10px 0}.fs-objects button{text-align:left}.fs-objects [aria-pressed=true]{outline:1px solid var(--accent,#dfae62)}.fs-status{padding:7px 10px;font-size:11px;min-height:30px;border-top:1px solid var(--line,#555)}.fs-help{font-size:11px;opacity:.7;line-height:1.5}@container(max-width:480px){.fs-side{width:155px}.fs-bar .btn{font-size:10px;padding:4px}}`;
export function registerStudio(TYPES){
  if(!document.getElementById('feniks-place-style'))document.head.append(el('style',{id:'feniks-place-style',text:css}));
  TYPES.studio={key:'studio',group:'misc',name:'Miejsce · Studio',glyph:'t_mapa',desc:'Komponuj własne miejsce: bryły, statyczne GLB, warianty i zapis.',fill:true,noZoom:true,live:true,liveKey:()=>[],render};
}
function render(box,c){
  initialize();let disposed=false,selected=c.win.st.selectedId||null;
  const root=el('div',{class:'fs-place','data-testid':'studio'}),bar=el('div',{class:'fs-bar'}),view=el('div',{class:'fs-view'}),side=el('div',{class:'fs-side'}),status=el('div',{class:'fs-status',role:'status'});
  root.append(bar,el('div',{class:'fs-work'},view,side),status);box.append(root);
  const viewport=createViewport(view,{onSelect:id=>{selected=id;c.win.st.selectedId=id;draw();},onError:e=>announce('Widok: '+e.message)});
  const command=(label,fn)=>{try{session.execute(label,fn);announce('');}catch(e){announce(e.message);}};
  const add=(kind='box',assetId=null,name='Bryła')=>{const id=newId('object');selected=id;command('Dodaj obiekt',d=>active(d).objects.push({id,name,kind,assetId,position:[0,.5,0],rotation:[0,0,0],scale:[1,1,1],color:'#b49a74'}));};
  const glb=el('input',{type:'file',accept:'.glb',hidden:'','aria-label':'Wczytaj GLB'});
  const project=el('input',{type:'file',accept:'.json',hidden:'','aria-label':'Wczytaj projekt'});
  glb.addEventListener('change',async()=>{
    const file=glb.files[0],revision=session.getRevision();glb.value='';if(!file)return;
    try{if(file.size>20*1024*1024)throw Error('Limit tej próby: 20 MB na GLB.');const buffer=await file.arrayBuffer();validateGlb(buffer);
      let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      if(disposed||session.getRevision()!==revision)throw Error('Miejsce zmieniło się podczas wczytywania. Ponów import.');
      const id=newId('asset'),objectId=newId('object');selected=objectId;
      command('Wczytaj GLB',d=>{d.assets.push({id,name:file.name,dataUrl:'data:model/gltf-binary;base64,'+btoa(binary)});active(d).objects.push({id:objectId,name:file.name,kind:'glb',assetId:id,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1],color:'#b49a74'});});
    }catch(e){announce('Nie wczytano GLB: '+e.message);}
  });
  project.addEventListener('change',async()=>{
    const file=project.files[0],revision=session.getRevision();project.value='';if(!file)return;
    try{if(file.size>60*1024*1024)throw Error('Projekt przekracza 60 MB.');const doc=validateDocument(JSON.parse(await file.text()));
      for(const asset of doc.assets){const raw=atob(asset.dataUrl.split(',')[1]);validateGlb(Uint8Array.from(raw,x=>x.charCodeAt(0)).buffer);}
      if(disposed||session.getRevision()!==revision)throw Error('Miejsce zmieniło się podczas wczytywania. Ponów import.');
      if(JSON.stringify(session.getSnapshot())!==savedJSON&&!confirm('Zastąpić bieżące miejsce? Najpierw pobierz projekt, jeśli chcesz zachować niezapisane zmiany.'))return;
      session.replace(doc);selected=null;announce('Wczytano projekt. Zapisz go lokalnie, aby wrócić po odświeżeniu.');
    }catch(e){announce('Nie wczytano projektu: '+e.message);}
  });
  const undo=button('Cofnij',()=>session.undo()),redo=button('Ponów',()=>session.redo());
  bar.append(button('+ Bryła',()=>add()),button('Wczytaj GLB',()=>glb.click()),undo,redo,button('Pokaż całość',()=>viewport.frame()),button('Zapisz',save),button('Pobierz projekt',download),button('Wczytaj projekt',()=>project.click()),glb,project);
  root.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!['INPUT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();e.stopPropagation();e.shiftKey?session.redo():session.undo();}});
  function draw(){
    if(disposed)return;const doc=session.getSnapshot(),variant=active(doc);const object=variant.objects.find(o=>o.id===selected);
    undo.disabled=!session.canUndo;redo.disabled=!session.canRedo;
    status.textContent=(JSON.stringify(doc)===savedJSON?'Zapis lokalny aktualny. ':'Niezapisane zmiany. ')+notice;
    side.replaceChildren();
    const name=el('input',{class:'jk-in',value:doc.name,'aria-label':'Nazwa miejsca',onchange:e=>command('Nazwa miejsca',d=>{d.name=e.target.value;})});side.append(el('label',{text:'Miejsce'},name));
    const variants=el('select',{class:'jk-in','aria-label':'Wariant',onchange:e=>command('Zmień wariant',d=>{d.activeVariantId=e.target.value;})});
    for(const v of doc.variants)variants.append(el('option',{value:v.id,text:v.name}));variants.value=variant.id;
    side.append(el('label',{text:'Wariant'},variants),button('Kopia wariantu',()=>command('Kopia wariantu',d=>{const copy=structuredClone(active(d));copy.id=newId('variant');copy.name+=' · kopia';for(const o of copy.objects)o.id=newId('object');d.variants.push(copy);d.activeVariantId=copy.id;})));
    const list=el('div',{class:'fs-objects','aria-label':'Obiekty'});for(const o of variant.objects){const b=button(o.name,()=>{selected=o.id;draw();});b.setAttribute('aria-pressed',String(selected===o.id));list.append(b);}side.append(list);
    if(object){
      side.append(el('label',{text:'Nazwa obiektu'},el('input',{class:'jk-in',value:object.name,'aria-label':'Nazwa obiektu',onchange:e=>command('Nazwa obiektu',d=>{active(d).objects.find(o=>o.id===selected).name=e.target.value;})})));
      for(const [key,title]of [['position','Pozycja'],['rotation','Obrót °'],['scale','Skala']]){
        const row=el('div',{class:'fs-axes'});for(let i=0;i<3;i++){const value=key==='rotation'?object[key][i]*180/Math.PI:object[key][i];row.append(el('input',{class:'jk-in',type:'number',step:'.1',value:String(Math.round(value*1000)/1000),'aria-label':title+' '+'XYZ'[i],onchange:e=>command(title,d=>{const n=e.target.value.trim()===''?NaN:Number(e.target.value);active(d).objects.find(o=>o.id===selected)[key][i]=key==='rotation'?n*Math.PI/180:n;})}));}side.append(el('label',{text:title},row));
      }
      side.append(button('Duplikuj obiekt',()=>command('Duplikuj',d=>{const copy=structuredClone(active(d).objects.find(o=>o.id===selected));copy.id=newId('object');copy.position[0]+=1;active(d).objects.push(copy);selected=copy.id;})),button('Usuń obiekt',()=>command('Usuń',d=>{active(d).objects=active(d).objects.filter(o=>o.id!==selected);selected=null;})));
    }else side.append(el('p',{class:'fs-help',text:'Dodaj bryłę lub własny GLB. Wybierz obiekt w widoku albo na liście.'}));
    side.append(el('p',{class:'fs-help',text:'Mysz: obrót lewym przyciskiem, przesunięcie prawym, zoom kółkiem. Zapis lokalny dotyczy tej przeglądarki i adresu. Pobierz projekt jako kopię.'}));
    viewport.update(doc,selected);
  }
  const unsubscribe=session.subscribe(draw);listeners.add(draw);draw();
  c.onDispose(()=>{disposed=true;unsubscribe();listeners.delete(draw);viewport.dispose();});
}

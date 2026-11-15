// Source-independent geometry observations, real native UI actions and fresh storage.
// Browser plugin not available; Playwright uses a disposable Chromium profile.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||import.meta.url);
const {chromium}=require('playwright'),here=fileURLToPath(new URL('.',import.meta.url));
const {url,ref}=JSON.parse(await readFile(here+'server.json','utf8'));
const browser=await chromium.launch({headless:true,downloadsPath:here+'downloads',...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const checks=[],errors=[],consoleErrors=[],consoleWarnings=[];
function check(name,ok,detail){checks.push({name,pass:!!ok,detail});console.log((ok?'PASS ':'FAIL ')+name);assert.ok(ok,JSON.stringify(detail));}
async function open(){const ctx=await browser.newContext({viewport:{width:1500,height:1000}});await ctx.route('**/*',r=>new URL(r.request().url()).origin===url?r.continue():r.abort());const p=await ctx.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());if(m.type()==='warning')consoleWarnings.push(m.text());});await p.goto(url);await p.waitForFunction(()=>window.__TWORZYWO?.ready);return p;}
async function state(p){return p.evaluate(()=>__TWORZYWO.session.snapshot());}
async function select(p,id,modifiers=[]){await p.locator(`.fc-node[data-node-id="${id}"]`).click({modifiers});}
async function geometry(p,ids){return p.evaluate(ids=>{const t=__TWORZYWO,v=[...t.views][0],{THREE}=Jaskinia.swiat.three();v.stage.root.updateMatrixWorld(true);const wanted=ids?new Set(ids.flatMap(id=>[id,...t.session.descendants(id)])):null,result={};for(const[id,o]of v.objects){if(!o.isMesh||(wanted&&!wanted.has(id)))continue;const pos=o.geometry.attributes.position,points=[];for(let i=0;i<pos.count;i++)points.push(...new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld).toArray());result[id]={points,uv:Array.from(o.geometry.attributes.uv?.array||[]),maps:[].concat(o.material).map(m=>({color:m.color?.getHex(),src:m.map?.source?.data?.src||null}))};}return result;},ids);}
function equalGeometry(a,b){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort());let max=0,points=0;for(const id of Object.keys(a)){assert.deepEqual(a[id].uv,b[id].uv);assert.deepEqual(a[id].maps,b[id].maps);assert.equal(a[id].points.length,b[id].points.length);a[id].points.forEach((x,i)=>{max=Math.max(max,Math.abs(x-b[id].points[i]));points++;});}return{maxError:max,coordinates:points,pass:max<1e-9};}
let p;
try{
 p=await open();check('native view opens once',await p.locator('.fc-app').count()===1);
 await p.getByRole('button',{name:'Modele próbne',exact:true}).click();await p.waitForFunction(()=>__TWORZYWO.bank.size===2&&__TWORZYWO.session.snapshot().nodes.length>30);await p.evaluate(()=>__TWORZYWO.saved);
 const initial=await state(p),balcony=initial.nodes.find(n=>n.name==='Balkon').id,rail=initial.nodes.find(n=>n.name==='Balustrada').id,root1=initial.nodes.find(n=>n.parent===null).id,root2=initial.nodes.filter(n=>n.parent===null)[1].id;
 check('two different textured sources, 39 meshes',Object.keys(await geometry(p)).length===39);
 await p.locator('.fc-app').screenshot({path:here+'01-source-models.png'});
 // Deliberately difficult transforms are instrumented setup; following detach/reparent are real UI.
 await p.evaluate(({root1,root2})=>{const {THREE}=Jaskinia.swiat.three(),s=__TWORZYWO.session;const pose=(r,sc,pos)=>new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),new THREE.Vector3(...sc)).toArray();s.transform([root1],pose([.2,.5,.3],[-1.4,.75,1.7],[-1,0,1]));s.transform([root2],pose([-.3,.4,-.2],[.8,1.5,1.1],[2,0,-1]));},{root1,root2});
 const before=await geometry(p,[balcony]);await select(p,balcony);await p.getByRole('button',{name:'Odłącz',exact:true}).click();let d=equalGeometry(before,await geometry(p,[balcony]));check('detach preserves real mesh vertices, UV and texture under reflection/shear',d.pass,d);
 await p.locator('.fc-side select').nth(1).selectOption(root2);d=equalGeometry(before,await geometry(p,[balcony]));check('reparent under rotated nonuniform parent preserves appearance',d.pass,d);
 await p.getByRole('button',{name:'Cofnij',exact:true}).click();await p.getByRole('button',{name:'Ponów',exact:true}).click();d=equalGeometry(before,await geometry(p,[balcony]));check('UI undo/redo preserves difficult reparent',d.pass,d);
 // Reset the instrumented setup before the author-facing construction flow.
 await p.evaluate(doc=>__TWORZYWO.session.replace(doc),initial);
 await select(p,balcony);await select(p,rail,['Shift']);const count=initial.nodes.length,partsBefore=await geometry(p,[balcony]);
 await p.getByRole('button',{name:'Połącz',exact:true}).click();let now=await state(p);const assembly=now.nodes.find(n=>!n.source&&n.name==='Moja konstrukcja').id;
 d=equalGeometry(partsBefore,await geometry(p,[balcony]));check('parent+child selection assembles once without changing appearance',now.nodes.length===count+1&&d.pass,d);
 await p.getByTitle('Nazwa części',{exact:true}).fill('Kram wędrowny');await p.getByTitle('Nazwa części',{exact:true}).press('Tab');
 await p.getByRole('button',{name:'Zachowaj część',exact:true}).click();await p.locator('[data-recipe="0"]').click();now=await state(p);const copyA=now.nodes.filter(n=>n.parent===null&&n.name==='Kram wędrowny').find(n=>n.id!==assembly).id;
 await p.locator('[data-recipe="0"]').click();now=await state(p);const copyB=now.nodes.filter(n=>n.parent===null&&n.name==='Kram wędrowny').find(n=>n.id!==assembly&&n.id!==copyA).id;
 const aBefore=await geometry(p,[copyA]),originalBefore=await geometry(p,[assembly]);
 const railB=await p.evaluate(copyB=>{const s=__TWORZYWO.session;return s.descendants(copyB).map(id=>s.node(id)).find(n=>n.name==='Balustrada').id;},copyB);await select(p,railB);
 // Project the visible X cone of the native gizmo; actual input is a mouse drag.
 const gizmo=await p.evaluate(()=>{const v=[...__TWORZYWO.views][0],{THREE}=Jaskinia.swiat.three();v.stage.scene.updateMatrixWorld(true);const c=v.control.getHelper(),out=[];c.traverse(o=>{if(o.name==='X'&&o.isMesh&&o.visible&&o.parent?.visible){const b=new THREE.Box3().setFromObject(o),pos=b.getCenter(new THREE.Vector3()).project(v.stage.camera),r=v.stage.canvas.getBoundingClientRect();out.push({x:r.left+(pos.x+1)*r.width/2,y:r.top+(1-pos.y)*r.height/2,type:o.geometry.type,parent:o.parent?.type,visible:o.visible});}});return out;});
 await writeFile(here+'gizmo.json',JSON.stringify(gizmo,null,2));
 const handle=gizmo[0];assert.ok(handle,'no native X handle');const beforeDrag=await state(p);await p.mouse.move(handle.x,handle.y);await p.mouse.down();await p.mouse.move(handle.x+65,handle.y-12,{steps:12});await p.mouse.up();
 const afterDrag=await state(p);check('real pointer drag changes selected copied part',JSON.stringify(beforeDrag)!==JSON.stringify(afterDrag));
 d=equalGeometry(aBefore,await geometry(p,[copyA]));const originalCheck=equalGeometry(originalBefore,await geometry(p,[assembly]));check('editing copy B leaves copy A and original construction unchanged',d.pass&&originalCheck.pass);
 await p.getByRole('button',{name:'Cofnij',exact:true}).click();check('one undo reverses entire pointer gesture',JSON.stringify(await state(p))===JSON.stringify(beforeDrag));await p.getByRole('button',{name:'Ponów',exact:true}).click();
 await p.locator('.fc-app').screenshot({path:here+'02-three-constructions.png'});
 // Confirm invalid scale preview rollback with real TransformControls event handlers.
 const rejected=await p.evaluate(railB=>{const t=__TWORZYWO,v=[...t.views][0],doc=JSON.stringify(t.session.snapshot());v.control.dispatchEvent({type:'dragging-changed',value:true});v.proxy.scale.x=0;v.proxy.updateMatrixWorld(true);v.control.dispatchEvent({type:'objectChange'});v.control.dispatchEvent({type:'dragging-changed',value:false});return{docSame:doc===JSON.stringify(t.session.snapshot()),shown:v.objects.get(railB).matrix.toArray(),saved:t.session.node(railB).matrix};},railB);
 check('rejected singular edit restores preview to accepted document',rejected.docSame&&rejected.shown.every((x,i)=>Math.abs(x-rejected.saved[i])<1e-9),rejected);
 // Download a real user file and move it into a genuinely fresh origin-storage context.
 await p.evaluate(()=>__TWORZYWO.saved);const finalDoc=await state(p),finalGeometry=await geometry(p),downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Zapisz plik',exact:true}).click();const download=await downloadPromise;await download.saveAs(here+'demo-kram.json');const pack=JSON.parse(await readFile(here+'demo-kram.json','utf8'));
 check('download embeds both needed sources and one reusable recipe',pack.sources.length===2&&pack.recipes.length===1);
 const fresh=await open();check('new context really has empty document/library',await fresh.evaluate(async()=>__TWORZYWO.session.snapshot().nodes.length===0&&(await Jaskinia.materialy.list()).length===0));
 // Same source file name and same internal UUIDs, different geometry: no silent substitution.
 const altered=JSON.parse(pack.sources[0].text);altered.elements[0].from[0]-=40;altered.elements[0].to[0]-=40;
 await fresh.locator('.fc-app input[type=file]').first().setInputFiles({name:pack.sources[0].name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(altered))});await fresh.waitForFunction(()=>__TWORZYWO.bank.size===1);
 await fresh.locator('.fc-app input[type=file]').nth(1).setInputFiles(here+'demo-kram.json');await fresh.waitForFunction(n=>__TWORZYWO.session.snapshot().nodes.length===n,finalDoc.nodes.length);await fresh.evaluate(()=>__TWORZYWO.saved);
 d=equalGeometry(finalGeometry,await geometry(fresh));check('fresh context restores exact document, geometry and texture despite altered namesake',JSON.stringify(finalDoc)===JSON.stringify(await state(fresh))&&d.pass,d);
 await fresh.reload();await fresh.waitForFunction(()=>__TWORZYWO?.ready);d=equalGeometry(finalGeometry,await geometry(fresh));check('local autosave survives page reload with one native view',d.pass&&await fresh.locator('.fc-app').count()===1,d);
 await fresh.locator('.fc-app').screenshot({path:here+'03-restored-work.png'});
 const failure=await fresh.evaluate(async()=>{const t=__TWORZYWO,before=JSON.stringify(t.session.snapshot()),pack=t.packageOf();pack.sources[0].text+=' ';let msg;try{await t.openPackage(pack);}catch(e){msg=e.message;}return{unchanged:before===JSON.stringify(t.session.snapshot()),msg};});check('wrong source hash refuses replacement atomically',failure.unchanged&&failure.msg.includes('odciskiem'),failure);
 // Instrument a near-limit fixture, then exercise the actual capture button across the boundary.
 await fresh.evaluate(assembly=>{const t=__TWORZYWO,r=t.recipes[0];while(t.recipes.length<99)t.recipes.push(structuredClone(r));t.select([assembly]);},assembly);
 await fresh.getByRole('button',{name:'Zachowaj część',exact:true}).click();await fresh.getByRole('button',{name:'Zachowaj część',exact:true}).click();
 check('101st recipe is refused before mutating or saving an unreadable package',await fresh.evaluate(()=>__TWORZYWO.recipes.length===100));
 await fresh.evaluate(async()=>{const t=__TWORZYWO;await t.saved;await t.openPackage(t.packageOf());});check('maximum accepted recipe count is readable',await fresh.evaluate(()=>__TWORZYWO.recipes.length===100));
 const cap=await fresh.evaluate(async()=>{const t=__TWORZYWO,b=[...t.bank.values()][0],doc=JSON.stringify(t.session.snapshot()),added=[];for(let i=t.bank.size;i<30;i++){const k='cap-fixture-'+i;t.bank.set(k,b);added.push(k);}let msg;try{await t.addFiles([{name:b.name,blob:new Blob([b.text+' '])}]);}catch(e){msg=e.message;}const unchanged=doc===JSON.stringify(t.session.snapshot())&&t.bank.size===30;added.forEach(k=>t.bank.delete(k));return{unchanged,msg};});check('31st source is refused before changing the author document',cap.unchanged&&cap.msg.includes('30'),cap);
 check('no uncaught page errors',errors.length===0,errors);
 const unexpected=consoleErrors.filter(x=>!x.includes('Nie można odwrócić macierzy')&&!x.includes('Ta próba mieści 100 zachowanych części'));
 check('console has only the intentional refusal errors',unexpected.length===0,unexpected);
 await writeFile(here+'verification.json',JSON.stringify({ref,url,browser:browser.version(),checks,errors,consoleErrors,consoleWarnings,scope:'Synthetic BB only. Real UI selection, grouping, copying, pointer drag, undo/redo, download, file upload, fresh storage, reload. Affine stress setup and singular input are instrumented. No Owner profile or production/full-suite qualification.'},null,2));
 console.log('RESULT',checks.length,'PASS');
}catch(e){if(p)await p.screenshot({path:here+'verification-failed.png'});await writeFile(here+'verification-failed.json',JSON.stringify({checks,errors,error:e.message},null,2));throw e;}finally{await browser.close();}

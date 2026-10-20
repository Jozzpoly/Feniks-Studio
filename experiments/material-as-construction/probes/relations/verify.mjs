// Reproducible, isolated renderer test. Browser plugin/skill not available;
// Playwright uses a fresh profile and refuses requests outside this localhost origin.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||import.meta.url),{chromium}=require('playwright');
const {url,ref}=JSON.parse(await readFile(new URL('server.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const checks=[],errors=[],warnings=[];
const check=(name,ok)=>{checks.push({name,pass:!!ok});assert.ok(ok,name);console.log('PASS '+name);};
try{
 const context=await browser.newContext({viewport:{width:1440,height:950}});
 await context.route('**/*',r=>new URL(r.request().url()).origin===url?r.continue():r.abort());
 const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 await p.goto(url);await p.waitForFunction(()=>window.__RELATION_PROBE);
 check('native instrument, controls and WebGL canvas are visible',await p.locator('.relation-probe').isVisible()&&await p.locator('.relation-probe canvas').isVisible()&&await p.getByLabel('Kąt',{exact:true}).isVisible());
 const observed=()=>p.evaluate(()=>{const t=__RELATION_PROBE;t.stage.root.updateMatrixWorld(true);return t.entries.map(e=>Object.fromEntries(['frame','flap','handle'].map(k=>[k,t.objects.get(e.idMap[k]).matrixWorld.toArray()])));});
 const rest=await observed();
 await p.getByLabel('Egzemplarz',{exact:true}).selectOption('2');
 await p.getByLabel('Kąt',{exact:true}).focus();
 await p.getByLabel('Kąt',{exact:true}).press('End');
 const turned=await observed();
 check('UI drives only the rotated copy',JSON.stringify(rest[0])===JSON.stringify(turned[0])&&JSON.stringify(rest[1])===JSON.stringify(turned[1])&&JSON.stringify(rest[2].flap)!==JSON.stringify(turned[2].flap)&&JSON.stringify(rest[2].frame)===JSON.stringify(turned[2].frame));
 await p.getByLabel('Egzemplarz',{exact:true}).selectOption('1');
 await p.getByLabel('Kąt',{exact:true}).press('End');const beforeAxis=await observed();
 await p.getByRole('button',{name:'Zmień oś kopii',exact:true}).click();const afterAxis=await observed();
 check('copy axis edit changes its visible pose and leaves both neighbours intact',JSON.stringify(beforeAxis[1].flap)!==JSON.stringify(afterAxis[1].flap)&&JSON.stringify(beforeAxis[0])===JSON.stringify(afterAxis[0])&&JSON.stringify(beforeAxis[2])===JSON.stringify(afterAxis[2]));
 await p.getByRole('button',{name:'Sprawdź wyjęcie samej klapy',exact:true}).click();
 check('partial capture exposes the missing endpoint in the UI',await p.getByText('Sama klapa nie zawiera ramy,',{exact:false}).isVisible());
 await p.locator('.relation-probe').screenshot({path:new URL('relation-carriage.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 await p.getByLabel('Kąt',{exact:true}).press('Home');const returned=await observed();
 check('rest pose returns exactly without changing the authored document',JSON.stringify(returned[1])===JSON.stringify(rest[1]));
 check('no runtime or console errors',errors.length===0);
 await writeFile(new URL('verification.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),host:ref,browser:await browser.version(),viewport:{width:1440,height:950},checks,errors,warnings,boundaries:['synthetic geometry; no importer or Owner asset','kinematic, not physical','no Ruch v6.4 integration','UI selects supplied relations; it is not an authoring editor','desktop only; no Owner acceptance']},null,2));
}finally{await browser.close();}

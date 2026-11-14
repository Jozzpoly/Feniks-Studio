import {I,translation} from '../../core.mjs';
export const yaw = a => [Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1];
export const pitch = a => [1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1];
export function fixture() {
 const node=(id,parent,matrix,source=null)=>({id,parent,matrix,source,name:'cube'});
 return {doc:{format:'feniks-construction-probe',version:1,nodes:[
  node('assembly',null,translation(2,1,3)),
  node('frame','assembly',I(),{key:'synthetic-gate',path:'0/0'}),
  node('flap','assembly',translation(.8,0,0),{key:'synthetic-gate',path:'0/1'}),
  node('handle','flap',translation(.65,0,.12),{key:'synthetic-gate',path:'0/1/0'})
 ]},relations:[{id:'hinge',moving:'flap',base:'frame',pivot:[0,0,0],axis:[0,1,0],range:[0,Math.PI/2]}]};
}

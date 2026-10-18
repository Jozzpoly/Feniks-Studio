import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGlb } from '../src/viewport.mjs';

function glb(json, binary) {
  const encoded = new TextEncoder().encode(JSON.stringify(json));
  const jsonLength = Math.ceil(encoded.length / 4) * 4;
  const binLength = binary ? Math.ceil(binary.length / 4) * 4 : 0;
  const result = new ArrayBuffer(20 + jsonLength + (binary ? 8 + binLength : 0));
  const view = new DataView(result);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, result.byteLength, true);
  view.setUint32(12, jsonLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(result, 20, jsonLength).fill(32);
  new Uint8Array(result, 20, encoded.length).set(encoded);
  if (binary) {
    view.setUint32(20 + jsonLength, binLength, true);
    view.setUint32(24 + jsonLength, 0x004e4942, true);
    new Uint8Array(result, 28 + jsonLength, binary.length).set(binary);
  }
  return result;
}

test('accepts a GLB with one local binary buffer', () => {
  const result = validateGlb(glb({ asset: { version: '2.0' }, buffers: [{ byteLength: 3 }] }, new Uint8Array([1, 2, 3])));
  assert.equal(result.asset.version, '2.0');
});

test('rejects truncated, mismatched and non-v2 GLB headers', () => {
  assert.throws(() => validateGlb(new ArrayBuffer(8)), /GLB/i);
  const source = glb({ asset: { version: '2.0' } });
  new DataView(source).setUint32(8, source.byteLength + 4, true);
  assert.throws(() => validateGlb(source), /długo|length/i);
  new DataView(source).setUint32(8, source.byteLength, true);
  new DataView(source).setUint32(4, 1, true);
  assert.throws(() => validateGlb(source), /2/i);
});

test('rejects invalid chunk structure and JSON content', () => {
  const source = glb({ asset: { version: '2.0' } });
  new DataView(source).setUint32(12, source.byteLength, true);
  assert.throws(() => validateGlb(source), /chunk|blok|sekcj/i);
  assert.throws(() => validateGlb(glb({ asset: { version: '1.0' } })), /2/i);
  assert.throws(() => validateGlb(glb(null)), /JSON|obiekt/i);
});

test('rejects network, relative and blob resource references before loading', () => {
  for (const uri of ['https://example.com/a.bin', '../texture.png', 'blob:untrusted', '//example.com/a.bin']) {
    assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, images: [{ uri }] })), /zewnętrzn|URI/i);
  }
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, buffers: [{ uri: 'a.bin', byteLength: 4 }] })), /zewnętrzn|URI/i);
});

test('accepts embedded data images but rejects non-image data references', () => {
  assert.doesNotThrow(() => validateGlb(glb({ asset: { version: '2.0' }, images: [{ uri: 'data:image/png;base64,iVBORw==' }] })));
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, images: [{ uri: 'data:text/html;base64,PHNjcmlwdD4=' }] })), /URI|obraz/i);
});

test('rejects animation, skin and external decoder requirements', () => {
  for (const feature of [{ animations: [{}] }, { skins: [{}] }, { nodes: [{ skin: 0 }] }]) {
    assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, ...feature })), /statycz|animac|skór/i);
  }
  for (const extension of ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_texture_basisu', 'UNSUPPORTED_extension']) {
    assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, extensionsRequired: [extension] })), /rozszerzeni|dekoder/i);
  }
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, extensionsUsed: ['KHR_draco_mesh_compression'] })), /dekoder|rozszerzeni/i);
});

test('accepts built-in static material extensions', () => {
  assert.doesNotThrow(() => validateGlb(glb({ asset: { version: '2.0' }, extensionsRequired: ['KHR_materials_unlit', 'KHR_texture_transform'] })));
});

test('rejects missing or out of bounds binary data', () => {
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, buffers: [{ byteLength: 4 }] })), /bufor|BIN/i);
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, buffers: [{ byteLength: 8 }] }, new Uint8Array(4))), /bufor|BIN/i);
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, buffers: [{ byteLength: 4 }], bufferViews: [{ buffer: 0, byteOffset: 3, byteLength: 4 }] }, new Uint8Array(4))), /bufor|zakres/i);
});

test('rejects cyclic or dangling node graphs before GLTFLoader traversal', () => {
  for (const nodes of [[{ children: [0] }], [{ children: [1] }, { children: [0] }], [{ children: [9] }]]) {
    assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, nodes })), /węz|cykl|node/i);
  }
  assert.throws(() => validateGlb(glb({ asset: { version: '2.0' }, nodes: [{}], scenes: [{ nodes: [2] }] })), /węz|node/i);
});

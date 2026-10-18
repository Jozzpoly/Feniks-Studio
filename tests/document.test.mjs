import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, createSession, newId, validateDocument } from '../src/document.mjs';

const DATA_URL = 'data:model/gltf-binary;base64,Z2xURgIAAAAMAAAA';
const box = (id = 'object-one') => ({
  id, name: 'Podest', kind: 'box', assetId: null,
  position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], color: '#b49a74',
});

function place() {
  const document = createDocument();
  document.assets.push({ id: 'asset-one', name: 'Model.glb', dataUrl: DATA_URL });
  document.variants[0].objects.push(box());
  return document;
}

test('new documents are valid empty independent places with one active variant', () => {
  const a = createDocument(), b = createDocument();
  assert.deepEqual(validateDocument(a), a);
  assert.equal(a.format, 'feniks-place');
  assert.equal(a.version, 1);
  assert.equal(a.variants.length, 1);
  assert.equal(a.activeVariantId, a.variants[0].id);
  assert.deepEqual(a.variants[0].objects, []);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.variants[0].id, b.variants[0].id);
  assert.notEqual(newId('object'), newId('object'));
});

test('validation returns an owned copy, preserving all variants and original names', () => {
  const input = place();
  input.name = '  Moje miejsce  ';
  input.variants.push({ id: 'variant-b', name: 'B', objects: [box()] });
  const copy = validateDocument(input);
  assert.deepEqual(copy, input);
  copy.variants[1].objects[0].position[1] = 492;
  assert.equal(input.variants[1].objects[0].position[1], 0);
  copy.assets[0].name = 'inna';
  assert.equal(input.assets[0].name, 'Model.glb');
});

test('all variants and embedded assets survive portable JSON round trip', () => {
  const input = place();
  input.variants.push({ id: 'variant-b', name: 'B', objects: [{
    ...box(), kind: 'glb', assetId: 'asset-one', position: [25, 492, -1000],
  }] });
  input.activeVariantId = 'variant-b';
  const output = validateDocument(JSON.parse(JSON.stringify(validateDocument(input))));
  assert.deepEqual(output, input);
  assert.equal(output.variants[1].objects[0].position[1], 492);
});

test('unsupported versions, unknown fields and malformed document roots are rejected', () => {
  for (const value of [null, [], 'place', 12, undefined]) assert.throws(() => validateDocument(value));
  for (const mutate of [
    d => { d.version = 2; },
    d => { d.format = 'another-format'; },
    d => { d.futureMeaning = { shouldNotDisappear: true }; },
    d => { d.variants[0].objects[0].meaning = 'unknown'; },
    d => { delete d.activeVariantId; },
    d => { d.name = 1; },
    d => { d.variants = []; },
  ]) {
    const document = place(); mutate(document);
    assert.throws(() => validateDocument(document));
  }
});

test('IDs are checked for duplicates in each collection and broken references are rejected', () => {
  for (const mutate of [
    d => { d.id = ''; },
    d => { d.assets.push({ ...d.assets[0] }); },
    d => { d.variants.push(structuredClone(d.variants[0])); },
    d => { d.variants[0].objects.push(box()); },
    d => { d.activeVariantId = 'missing'; },
    d => { Object.assign(d.variants[0].objects[0], { kind: 'glb', assetId: 'missing' }); },
    d => { d.variants[0].objects[0].assetId = 'asset-one'; },
    d => { d.variants[0].objects[0].kind = 'script'; },
  ]) {
    const document = place(); mutate(document);
    assert.throws(() => validateDocument(document));
  }
});

test('transforms require three finite numbers and strictly positive scales', () => {
  for (const [field, value] of [
    ['position', [NaN, 0, 0]], ['position', [Infinity, 0, 0]],
    ['rotation', [0, -Infinity, 0]], ['rotation', [0, 0]],
    ['scale', [1, 0, 1]], ['scale', [-1, 1, 1]],
    ['position', ['1', 0, 0]], ['scale', null],
  ]) {
    const document = place(); document.variants[0].objects[0][field] = value;
    assert.throws(() => validateDocument(document));
  }
  const document = place();
  document.variants[0].objects[0].rotation = [0, Math.PI * 4, 0];
  assert.deepEqual(validateDocument(document), document);
});

test('GLB data URLs require canonical MIME/base64 syntax and a bounded payload', () => {
  for (const dataUrl of [
    'https://example.com/model.glb', 'data:text/html;base64,AAAA',
    'data:model/gltf-binary;base64,', 'data:model/gltf-binary;base64,not base64',
    'data:model/gltf-binary;base64,A===', 'data:model/gltf-binary;base64,AAAA=',
  ]) {
    const document = place(); document.assets[0].dataUrl = dataUrl;
    assert.throws(() => validateDocument(document));
  }
  const document = place();
  document.assets[0].dataUrl = 'data:model/gltf-binary;base64,' + 'A'.repeat(4 * Math.ceil((16 * 1024 * 1024 + 3) / 3));
  assert.throws(() => validateDocument(document), /limit|large|size|rozmiar/i);
});

test('aggregate document size and oversized collections are rejected before publication', () => {
  const largeAsset = 'data:model/gltf-binary;base64,' + 'A'.repeat(20 * 1024 * 1024);
  const document = place();
  document.assets = [
    { id: 'asset-a', name: 'a', dataUrl: largeAsset },
    { id: 'asset-b', name: 'b', dataUrl: largeAsset },
  ];
  assert.throws(() => validateDocument(document), /limit|large|size|rozmiar/i);
  const many = place();
  many.variants = Array.from({ length: 65 }, (_, i) => ({ id: `v${i}`, name: 'v', objects: [] }));
  many.activeVariantId = 'v0';
  assert.throws(() => validateDocument(many), /limit|large|size|rozmiar/i);
});

test('non-JSON values and accessor data are refused instead of silently disappearing', () => {
  const document = place();
  Object.defineProperty(document, 'name', { get() { throw new Error('getter executed'); }, enumerable: true });
  assert.throws(() => validateDocument(document), error => error.message !== 'getter executed');
  const sparse = place(); delete sparse.variants[0].objects[0].position[1];
  assert.throws(() => validateDocument(sparse));
  const extraArray = place(); extraArray.variants.extra = true;
  assert.throws(() => validateDocument(extraArray));
});

test('successful edits publish once, invalid edits leave state, revision and history unchanged', () => {
  const session = createSession(place());
  let notifications = 0;
  const unsubscribe = session.subscribe(() => { notifications += 1; });
  assert.equal(session.getRevision(), 0);
  assert.equal(session.execute('Przesuń', draft => { draft.variants[0].objects[0].position[0] = 3; }), true);
  const before = session.getSnapshot(), revision = session.getRevision();
  assert.equal(notifications, 1);
  assert.throws(() => session.execute('Błąd', draft => {
    draft.name = 'Nie zapisuj'; draft.variants[0].objects[0].scale[0] = 0;
  }));
  assert.deepEqual(session.getSnapshot(), before);
  assert.equal(session.getRevision(), revision);
  assert.equal(notifications, 1);
  assert.equal(session.canUndo, true);
  assert.equal(session.undo(), true);
  assert.equal(session.getSnapshot().variants[0].objects[0].position[0], 0);
  unsubscribe();
  session.redo();
  assert.equal(notifications, 2);
});

test('thrown and cancelled commands are atomic and a no-op does not consume history', () => {
  const session = createSession(place()), before = session.getSnapshot();
  assert.throws(() => session.execute('Throw', draft => { draft.name = 'wrong'; throw new Error('stop'); }), /stop/);
  assert.equal(session.execute('Cancel', draft => { draft.name = 'wrong'; return false; }), false);
  assert.equal(session.execute('No-op', () => {}), false);
  assert.deepEqual(session.getSnapshot(), before);
  assert.equal(session.getRevision(), 0);
  assert.equal(session.canUndo, false);
  assert.equal(session.canRedo, false);
});

test('async mutations cannot publish a partially changed document', () => {
  const session = createSession(place()), before = session.getSnapshot();
  assert.throws(() => session.execute('Async', async draft => { draft.name = 'wrong'; }));
  assert.deepEqual(session.getSnapshot(), before);
  assert.equal(session.getRevision(), 0);
});

test('session inputs, retained drafts and old snapshots cannot alias current state', () => {
  const input = place(), session = createSession(input);
  input.variants[0].objects[0].position[0] = 99;
  const old = session.getSnapshot();
  assert.equal(old.variants[0].objects[0].position[0], 0);
  assert.throws(() => { old.variants[0].objects[0].position[0] = 77; }, TypeError);
  let retained;
  session.execute('Move', draft => { retained = draft; draft.variants[0].objects[0].position[0] = 4; });
  retained.variants[0].objects[0].position[0] = 88;
  assert.equal(session.getSnapshot().variants[0].objects[0].position[0], 4);
  assert.equal(old.variants[0].objects[0].position[0], 0);
});

test('forked variants remain independently editable even when object IDs are retained', () => {
  const session = createSession(place());
  session.execute('Fork', draft => {
    draft.variants.push({ ...draft.variants[0], id: 'variant-b', name: 'B' });
    draft.activeVariantId = 'variant-b';
  });
  session.execute('Edit B', draft => { draft.variants[1].objects[0].position[1] = 492; });
  assert.equal(session.getSnapshot().variants[0].objects[0].position[1], 0);
  assert.equal(session.getSnapshot().variants[1].objects[0].position[1], 492);
});

test('undo, redo and replacement advance revision monotonically, including identical replacement', () => {
  const session = createSession(place());
  const revisions = [session.getRevision()];
  session.execute('Rename', draft => { draft.name = 'Zmiana'; }); revisions.push(session.getRevision());
  session.undo(); revisions.push(session.getRevision());
  session.redo(); revisions.push(session.getRevision());
  const current = session.getSnapshot();
  session.replace(current); revisions.push(session.getRevision());
  assert.deepEqual(revisions, [0, 1, 2, 3, 4]);
  assert.equal(session.canUndo, false);
  assert.equal(session.canRedo, false);
  assert.equal(session.undo(), false);
  assert.equal(session.redo(), false);
  assert.equal(session.getRevision(), 4);
});

test('redo survives rejected and no-op edits, but a valid new edit creates a new history branch', () => {
  const session = createSession(place());
  session.execute('One', draft => { draft.name = 'One'; });
  session.undo();
  assert.throws(() => session.execute('Bad', draft => { draft.activeVariantId = 'missing'; }));
  session.execute('Same', () => {});
  assert.equal(session.canRedo, true);
  session.execute('Two', draft => { draft.name = 'Two'; });
  assert.equal(session.canRedo, false);
  session.undo();
  assert.notEqual(session.getSnapshot().name, 'One');
});

test('invalid replacement preserves the current document and both undo/redo state', () => {
  const session = createSession(place());
  session.execute('One', draft => { draft.name = 'One'; });
  session.execute('Two', draft => { draft.name = 'Two'; });
  session.undo();
  const before = session.getSnapshot(), revision = session.getRevision();
  const invalid = structuredClone(before); invalid.version = 2;
  assert.throws(() => session.replace(invalid));
  assert.deepEqual(session.getSnapshot(), before);
  assert.equal(session.getRevision(), revision);
  assert.equal(session.canUndo, true);
  assert.equal(session.canRedo, true);
});

test('nested session commands cannot escape the atomic outer mutation', () => {
  for (const nested of [session => session.undo(), session => session.redo(),
    session => session.replace(place()), session => session.execute('Nested', () => {})]) {
    const session = createSession(place());
    session.execute('Initial', draft => { draft.name = 'Initial'; });
    const before = session.getSnapshot(), revision = session.getRevision();
    assert.throws(() => session.execute('Outer', draft => {
      draft.name = 'Discard';
      nested(session);
    }), /nested/i);
    assert.deepEqual(session.getSnapshot(), before);
    assert.equal(session.getRevision(), revision);
    assert.equal(session.canUndo, true);
    assert.equal(session.canRedo, false);
  }
});

test('subscriber failures do not roll back a commit or prevent other subscribers', t => {
  const errors = t.mock.method(console, 'error', () => {});
  const session = createSession(place()), observed = [];
  session.subscribe(() => { throw new Error('View failed'); });
  session.subscribe((snapshot, revision) => {
    observed.push([snapshot.name, revision]);
    assert.throws(() => session.undo(), /nested/i);
  });
  assert.equal(session.execute('Rename', draft => { draft.name = 'Saved'; }), true);
  assert.deepEqual(observed, [['Saved', 1]]);
  assert.equal(errors.mock.callCount(), 1);
  assert.equal(session.getSnapshot().name, 'Saved');
  assert.equal(session.canUndo, true);
});

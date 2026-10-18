const MiB = 1024 * 1024;
const MAX_DOCUMENT_BYTES = 32 * MiB;
const MAX_ASSET_BYTES = 16 * MiB;
const GLB_PREFIX = 'data:model/gltf-binary;base64,';

function fail(message) { throw new TypeError(message); }

// Read only data properties: accepting getters or extra fields could lose data on export.
function record(value, fields, path) {
  if (!value || typeof value !== 'object' ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(`${path}: expected record`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.length !== fields.length || keys.some(key => !fields.includes(key))) fail(`${path}: unexpected or missing fields`);
  const result = {};
  for (const key of fields) {
    const descriptor = descriptors[key];
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail(`${path}.${key}: expected JSON data property`);
    result[key] = descriptor.value;
  }
  return result;
}

function list(value, max, path) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) fail(`${path}: expected array`);
  if (value.length > max) fail(`${path}: size limit ${max}`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(descriptors).length !== value.length + 1) fail(`${path}: sparse or extended array`);
  const result = [];
  for (let i = 0; i < value.length; i++) {
    const descriptor = descriptors[i];
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail(`${path}[${i}]: expected JSON data property`);
    result.push(descriptor.value);
  }
  return result;
}

function name(value, path) {
  if (typeof value !== 'string' || value.length > 256) fail(`${path}: expected name up to 256 characters`);
  return value;
}

function id(value, path) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value)) fail(`${path}: invalid ID`);
  return value;
}

function unique(value, seen, path) {
  id(value, path);
  if (seen.has(value)) fail(`${path}: duplicate ID ${value}`);
  seen.add(value);
  return value;
}

function vector(value, positive, path) {
  const result = list(value, 3, path);
  if (result.length !== 3 || result.some(n => typeof n !== 'number' || !Number.isFinite(n) || (positive && n <= 0))) {
    fail(`${path}: expected three finite ${positive ? 'positive ' : ''}numbers`);
  }
  return result;
}

export function newId(prefix = 'id') {
  if (typeof prefix !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(prefix)) fail('Invalid ID prefix');
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

export function createDocument() {
  const variantId = newId('variant');
  return {
    format: 'feniks-place', version: 1, id: newId('place'), name: 'Nowe miejsce',
    assets: [], variants: [{ id: variantId, name: 'Wariant A', objects: [] }], activeVariantId: variantId,
  };
}

export function validateDocument(value) {
  const root = record(value, ['format', 'version', 'id', 'name', 'assets', 'variants', 'activeVariantId'], 'document');
  if (root.format !== 'feniks-place' || root.version !== 1) fail('Unsupported document format or version');
  const assetIds = new Set(), variantIds = new Set();
  let assetCharacters = 0, objectCount = 0;
  const assets = list(root.assets, 64, 'assets').map((value, index) => {
    const path = `assets[${index}]`;
    const asset = record(value, ['id', 'name', 'dataUrl'], path);
    unique(asset.id, assetIds, `${path}.id`);
    name(asset.name, `${path}.name`);
    const url = asset.dataUrl;
    if (typeof url !== 'string' || !url.startsWith(GLB_PREFIX)) fail(`${path}: expected embedded GLB data URL`);
    const length = url.length - GLB_PREFIX.length;
    if (length > 4 * Math.ceil(MAX_ASSET_BYTES / 3)) fail(`${path}: GLB size limit 16 MiB`);
    assetCharacters += url.length;
    if (assetCharacters > MAX_DOCUMENT_BYTES) fail('Document size limit 32 MiB');
    const body = url.slice(GLB_PREFIX.length);
    const padding = body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0;
    const payload = body.slice(0, body.length - padding);
    if (!length || length % 4 !== 0 || /[^A-Za-z0-9+/]/.test(payload) || payload.length === 0) fail(`${path}: invalid base64 payload`);
    if (length / 4 * 3 - padding > MAX_ASSET_BYTES) fail(`${path}: GLB size limit 16 MiB`);
    return { id: asset.id, name: asset.name, dataUrl: url };
  });
  const variants = list(root.variants, 64, 'variants').map((value, index) => {
    const path = `variants[${index}]`;
    const variant = record(value, ['id', 'name', 'objects'], path);
    unique(variant.id, variantIds, `${path}.id`);
    name(variant.name, `${path}.name`);
    const objectIds = new Set();
    const objects = list(variant.objects, 10000, `${path}.objects`).map((value, index) => {
      if (++objectCount > 50000) fail('Total object size limit 50000');
      const objectPath = `${path}.objects[${index}]`;
      const object = record(value, ['id', 'name', 'kind', 'assetId', 'position', 'rotation', 'scale', 'color'], objectPath);
      unique(object.id, objectIds, `${objectPath}.id`);
      name(object.name, `${objectPath}.name`);
      if (object.kind !== 'box' && object.kind !== 'glb') fail(`${objectPath}: unsupported kind`);
      if (object.kind === 'box' ? object.assetId !== null : !assetIds.has(object.assetId)) fail(`${objectPath}: invalid asset reference`);
      if (typeof object.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(object.color)) fail(`${objectPath}: invalid color`);
      return {
        id: object.id, name: object.name, kind: object.kind, assetId: object.assetId,
        position: vector(object.position, false, `${objectPath}.position`),
        rotation: vector(object.rotation, false, `${objectPath}.rotation`),
        scale: vector(object.scale, true, `${objectPath}.scale`), color: object.color,
      };
    });
    return { id: variant.id, name: variant.name, objects };
  });
  if (!variants.length || !variantIds.has(root.activeVariantId)) fail('Invalid active variant reference');
  const result = {
    format: root.format, version: root.version, id: id(root.id, 'document.id'), name: name(root.name, 'document.name'),
    assets, variants, activeVariantId: root.activeVariantId,
  };
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength > MAX_DOCUMENT_BYTES) fail('Document size limit 32 MiB');
  return result;
}

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export function createSession(document = createDocument()) {
  let current = freeze(validateDocument(document)), revision = 0, busy = false;
  const past = [], future = [], listeners = new Set();
  function guard() { if (busy) fail('Nested session mutation is not supported'); }
  function publish(next) {
    current = next;
    revision++;
    // A subscriber cannot interleave another revision with this notification batch.
    busy = true;
    try {
      for (const listener of [...listeners]) {
        try { listener(current, revision); }
        catch (error) { console.error('Studio document subscriber failed', error); }
      }
    } finally { busy = false; }
  }
  return {
    getSnapshot: () => current,
    getRevision: () => revision,
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    subscribe(listener) {
      if (typeof listener !== 'function') fail('Expected subscriber function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    execute(label, mutate) {
      guard();
      if (typeof label !== 'string' || typeof mutate !== 'function') fail('Expected command label and mutation function');
      let next;
      busy = true;
      try {
        if (mutate.constructor?.name === 'AsyncFunction') fail('Async mutations are not supported');
        const draft = validateDocument(current);
        const result = mutate(draft);
        if (result && typeof result.then === 'function') {
          // Consume eventual rejection from a mistakenly asynchronous command.
          Promise.resolve(result).catch(() => {});
          fail('Async mutations are not supported');
        }
        if (result === false) return false;
        next = freeze(validateDocument(draft));
        if (JSON.stringify(next) === JSON.stringify(current)) return false;
      } finally { busy = false; }
      past.push(current);
      future.length = 0;
      publish(next);
      return true;
    },
    undo() {
      guard();
      if (!past.length) return false;
      future.push(current);
      publish(past.pop());
      return true;
    },
    redo() {
      guard();
      if (!future.length) return false;
      past.push(current);
      publish(future.pop());
      return true;
    },
    replace(document) {
      guard();
      const next = freeze(validateDocument(document));
      past.length = 0;
      future.length = 0;
      publish(next);
      return true;
    },
  };
}

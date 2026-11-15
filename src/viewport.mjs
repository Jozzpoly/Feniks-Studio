import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const STATIC_EXTENSIONS = new Set([
  'KHR_lights_punctual', 'KHR_materials_anisotropy', 'KHR_materials_clearcoat',
  'KHR_materials_dispersion', 'KHR_materials_emissive_strength', 'KHR_materials_ior',
  'KHR_materials_iridescence', 'KHR_materials_sheen', 'KHR_materials_specular',
  'KHR_materials_transmission', 'KHR_materials_unlit', 'KHR_materials_volume',
  'KHR_mesh_quantization', 'KHR_texture_transform', 'EXT_materials_bump',
  'EXT_mesh_gpu_instancing', 'EXT_texture_avif', 'EXT_texture_webp',
]);
const DECODER_EXTENSIONS = new Set([
  'KHR_draco_mesh_compression', 'KHR_meshopt_compression', 'EXT_meshopt_compression', 'KHR_texture_basisu',
]);
const IMAGE_DATA_URI = /^data:image\/(?:png|jpeg|webp|avif);base64,[A-Za-z0-9+/]*={0,2}$/i;
const BUFFER_DATA_URI = /^data:application\/(?:octet-stream|gltf-buffer);base64,[A-Za-z0-9+/]*={0,2}$/i;

/** Validate the GLB envelope and the static, self-contained subset this editor loads.
 * This is deliberately not a full glTF schema validator; GLTFLoader validates mesh data.
 * Returns the parsed glTF JSON, without fetching or decoding any resource.
 */
export function validateGlb(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer) || arrayBuffer.byteLength < 20) throw new Error('Plik nie jest pełnym GLB.');
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Plik nie ma nagłówka GLB.');
  if (view.getUint32(4, true) !== 2) throw new Error('Obsługiwany jest wyłącznie GLB 2.0.');
  if (view.getUint32(8, true) !== arrayBuffer.byteLength) throw new Error('Długość GLB nie zgadza się z nagłówkiem.');
  let offset = 12;
  let json;
  let binaryLength = null;
  while (offset < arrayBuffer.byteLength) {
    if (offset + 8 > arrayBuffer.byteLength) throw new Error('Niepełny blok GLB.');
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    if (length % 4 || offset + 8 + length > arrayBuffer.byteLength) throw new Error('Błędny zakres bloku GLB.');
    if (offset === 12 && type !== 0x4e4f534a) throw new Error('Pierwszy blok GLB musi zawierać JSON.');
    if (type === 0x4e4f534a && offset === 12) {
      try {
        json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(arrayBuffer, offset + 8, length)));
      } catch { throw new Error('Niepoprawny JSON wewnątrz GLB.'); }
    } else if (type === 0x004e4942 && binaryLength === null) {
      binaryLength = length;
    } else {
      throw new Error('Powtórzony lub nieobsługiwany blok GLB.');
    }
    offset += 8 + length;
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('JSON GLB musi być obiektem.');
  if (json.asset?.version !== '2.0' || (json.asset.minVersion && json.asset.minVersion !== '2.0')) throw new Error('Wymagany jest glTF 2.0.');
  for (const key of ['buffers', 'bufferViews', 'images', 'nodes', 'scenes', 'skins', 'animations', 'extensionsRequired', 'extensionsUsed']) {
    if (json[key] !== undefined && !Array.isArray(json[key])) throw new Error(`Niepoprawna lista ${key} w GLB.`);
  }
  if (json.skins?.length || json.animations?.length || json.nodes?.some(node => node && typeof node === 'object' && 'skin' in node)) {
    throw new Error('Ta pracownia przyjmuje statyczny GLB, bez animacji i skór.');
  }
  for (const extension of json.extensionsRequired ?? []) {
    if (!STATIC_EXTENSIONS.has(extension)) throw new Error(`Nieobsługiwane wymagane rozszerzenie GLB: ${extension}.`);
  }
  // Inspect actual extension keys as well: a malformed file may omit extensionsUsed.
  const queue = [json];
  while (queue.length) {
    const item = queue.pop();
    if (!item || typeof item !== 'object') continue;
    for (const [key, value] of Object.entries(item)) {
      if (key === 'uri' && (typeof value !== 'string' || (!IMAGE_DATA_URI.test(value) && !BUFFER_DATA_URI.test(value)))) {
        throw new Error('Zewnętrzny lub nieobsługiwany URI w GLB. Umieść zasoby wewnątrz pliku.');
      }
      if ((key === 'extensionsUsed' || key === 'extensionsRequired') && Array.isArray(value)) {
        for (const name of value) if (DECODER_EXTENSIONS.has(name)) throw new Error(`Rozszerzenie ${name} wymaga zewnętrznego dekodera.`);
      }
      if (key === 'extensions' && value && typeof value === 'object') {
        for (const name of Object.keys(value)) if (DECODER_EXTENSIONS.has(name)) throw new Error(`Rozszerzenie ${name} wymaga zewnętrznego dekodera.`);
      }
      if (value && typeof value === 'object') queue.push(value);
    }
  }
  for (const image of json.images ?? []) {
    if (!image || typeof image !== 'object' || (image.uri !== undefined && !IMAGE_DATA_URI.test(image.uri))) throw new Error('Nieobsługiwany URI obrazu GLB.');
  }
  for (const [index, buffer] of (json.buffers ?? []).entries()) {
    if (!buffer || !Number.isSafeInteger(buffer.byteLength) || buffer.byteLength < 1) throw new Error('Niepoprawna długość bufora GLB.');
    if (buffer.uri === undefined) {
      if (index !== 0 || binaryLength === null || buffer.byteLength > binaryLength || binaryLength - buffer.byteLength > 3) throw new Error('Brak lub błędny zakres bufora BIN w GLB.');
    } else if (!BUFFER_DATA_URI.test(buffer.uri)) throw new Error('Zewnętrzny lub nieobsługiwany URI bufora GLB.');
  }
  for (const bufferView of json.bufferViews ?? []) {
    const buffer = json.buffers?.[bufferView?.buffer];
    const start = bufferView?.byteOffset ?? 0;
    if (!buffer || !Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(bufferView.byteLength) || bufferView.byteLength < 1 || start + bufferView.byteLength > buffer.byteLength) throw new Error('Błędny zakres widoku bufora GLB.');
  }
  const nodes = json.nodes ?? [];
  const nodeIndex = index => Number.isSafeInteger(index) && index >= 0 && index < nodes.length;
  const parents = new Set();
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || Array.isArray(node) || (node.children !== undefined && !Array.isArray(node.children))) throw new Error('Niepoprawny węzeł GLB.');
    for (const child of node.children ?? []) {
      if (!nodeIndex(child) || parents.has(child)) throw new Error('Błędne odwołanie lub wielu rodziców węzła GLB.');
      parents.add(child);
    }
  }
  const visited = new Set();
  const path = new Set();
  for (let index = 0; index < nodes.length; index++) {
    const stack = [[index, false]];
    while (stack.length) {
      const [current, exit] = stack.pop();
      if (exit) { path.delete(current); visited.add(current); continue; }
      if (path.has(current)) throw new Error('Cykl węzłów w GLB.');
      if (visited.has(current)) continue;
      path.add(current);
      stack.push([current, true]);
      for (const child of nodes[current].children ?? []) stack.push([child, false]);
    }
  }
  for (const scene of json.scenes ?? []) {
    if (!scene || typeof scene !== 'object' || (scene.nodes !== undefined && !Array.isArray(scene.nodes)) || scene.nodes?.some(index => !nodeIndex(index))) throw new Error('Błędne odwołanie węzła sceny GLB.');
  }
  return json;
}

function dataUrlBuffer(dataUrl) {
  const match = /^data:model\/gltf-binary;base64,([A-Za-z0-9+/]*={0,2})$/i.exec(dataUrl);
  if (!match) throw new Error('Zasób musi być GLB zapisanym jako data:model/gltf-binary;base64.');
  let bytes;
  try { bytes = Uint8Array.from(atob(match[1]), character => character.charCodeAt(0)); }
  catch { throw new Error('Niepoprawne kodowanie base64 zasobu GLB.'); }
  validateGlb(bytes.buffer);
  return bytes.buffer;
}

// Cached models and all of their clones share resources; dispose only at cache eviction.
function releaseModel(model) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const images = new Set();
  const collect = object => {
    if (object?.geometry) geometries.add(object.geometry);
    if (object?.isBufferGeometry) geometries.add(object);
    for (const material of Array.isArray(object?.material) ? object.material : [object?.material]) if (material) materials.add(material);
    if (object?.isMaterial) materials.add(object);
    if (object?.isTexture) textures.add(object);
  };
  for (const scene of model.scenes ?? [model.scene]) scene?.traverse(collect);
  for (const object of model.parser?.associations?.keys() ?? []) collect(object);
  for (const object of model.resources ?? []) collect(object);
  for (const material of materials) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) {
    const data = texture.source?.data;
    for (const bitmap of Array.isArray(data) ? data : [data]) if (typeof bitmap?.close === 'function') images.add(bitmap);
    texture.dispose();
  }
  for (const geometry of geometries) geometry.dispose();
  for (const bitmap of images) bitmap.close();
}

/** Owns only the 3D view. Document/history/storage live in the host session. */
export function createViewport(container, { onSelect = () => {}, onError = () => {} } = {}) {
  let disposed = false;
  let renderer;
  const report = error => { if (!disposed) onError(error instanceof Error ? error : new Error(String(error))); };
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (error) {
    report(new Error(`Nie można uruchomić widoku 3D (WebGL): ${error.message}`));
    return { update() {}, frame() {}, dispose() { disposed = true; } };
  }
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
  canvas.setAttribute('aria-label', 'Widok miejsca 3D — przeciągnij, aby obrócić; kółko, aby przybliżyć');
  canvas.tabIndex = 0;
  container.append(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#202830');
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  camera.position.set(7, 6, 8);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.target.set(0, 0.4, 0);
  scene.add(new THREE.HemisphereLight(0xe5efff, 0x777166, 2.5));
  const keyLight = new THREE.DirectionalLight(0xfff5e3, 3.2);
  keyLight.position.set(5, 9, 6);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xc7deff, 1.6);
  fillLight.position.set(-5, 3, -4);
  scene.add(fillLight);
  const grid = new THREE.GridHelper(40, 40, 0x71828c, 0x3a4852);
  scene.add(grid);
  const placements = new Map();
  const rootIds = new WeakMap();
  const cache = new Map();
  let generation = 0;
  let selectedId = null;
  let variantId = null;
  const selectionBox = new THREE.Box3();
  const outline = new THREE.Box3Helper(selectionBox, 0xffd18a);
  outline.material.depthTest = false;
  outline.material.transparent = true;
  outline.material.opacity = 0.95;
  outline.renderOrder = 10;
  outline.visible = false;
  scene.add(outline);

  function updateSelection() {
    const root = placements.get(selectedId)?.root;
    outline.visible = false;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    selectionBox.setFromObject(root);
    outline.visible = !selectionBox.isEmpty();
  }

  function evict(entry) {
    entry.disposed = true;
    if (entry.model) releaseModel(entry.model);
  }

  function modelFor(asset) {
    let entry = cache.get(asset.id);
    if (entry?.dataUrl === asset.dataUrl) return entry;
    if (entry) evict(entry);
    entry = { dataUrl: asset.dataUrl, model: null, disposed: false, promise: null };
    cache.set(asset.id, entry);
    entry.promise = Promise.resolve().then(async () => {
      const binary = dataUrlBuffer(asset.dataUrl);
      const manager = new THREE.LoadingManager();
      const objectUrls = new Set();
      let resourceError = null;
      manager.onError = () => { resourceError = new Error('Nie udało się odczytać osadzonej tekstury lub bufora GLB.'); };
      // GLTFLoader creates blob URLs for internal bufferView images. Every source URI
      // was checked above; this second boundary blocks any other loader URL.
      manager.setURLModifier(url => {
        if (/^blob:/i.test(url)) objectUrls.add(url);
        if (/^(?:data:|blob:)/i.test(url)) return url;
        throw new Error('GLB próbował pobrać zewnętrzny zasób.');
      });
      let parser;
      const loader = new GLTFLoader(manager);
      loader.register(value => { parser = value; return { name: 'FENIKS_resource_tracking' }; });
      let model;
      try {
        model = await loader.parseAsync(binary, '');
        if (resourceError) throw resourceError;
      } catch (error) {
        // Other texture loads can finish after the first failed dependency.
        const pending = [...Object.values(parser?.sourceCache ?? {}), ...Object.values(parser?.textureCache ?? {})];
        const settled = await Promise.allSettled(pending);
        releaseModel({ scenes: model?.scenes ?? [], parser, resources: settled.filter(result => result.status === 'fulfilled').map(result => result.value) });
        throw error;
      } finally {
        // GLTFLoader revokes successful bufferView images itself, but not failed ones.
        for (const url of objectUrls) URL.revokeObjectURL(url);
      }
      if (entry.disposed || disposed) releaseModel(model);
      else entry.model = model;
      return model;
    });
    // A rejected cache promise is consumed by each placement below.
    return entry;
  }

  function removePlacement(id, entry) {
    scene.remove(entry.root);
    if (entry.kind === 'box') releaseModel({ scene: entry.root });
    placements.delete(id);
  }

  function update(document, selection) {
    if (disposed) return;
    generation++;
    selectedId = selection;
    if (variantId !== document.activeVariantId) {
      for (const [id, entry] of placements) removePlacement(id, entry);
      variantId = document.activeVariantId;
    }
    const assets = new Map(document.assets.map(asset => [asset.id, asset]));
    const objects = document.variants.find(variant => variant.id === variantId)?.objects ?? [];
    const ids = new Set(objects.map(object => object.id));
    for (const [id, entry] of placements) if (!ids.has(id)) removePlacement(id, entry);
    for (const object of objects) {
      const asset = object.kind === 'glb' ? assets.get(object.assetId) : null;
      let entry = placements.get(object.id);
      if (entry && (entry.kind !== object.kind || entry.assetData !== asset?.dataUrl)) {
        removePlacement(object.id, entry);
        entry = null;
      }
      if (!entry) {
        const root = new THREE.Group();
        rootIds.set(root, object.id);
        entry = { root, kind: object.kind, assetData: asset?.dataUrl, generation };
        placements.set(object.id, entry);
        scene.add(root);
        if (object.kind === 'box') {
          root.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: object.color, roughness: 0.75, metalness: 0.03 })));
        } else if (asset) {
          const pending = entry;
          modelFor(asset).promise.then(model => {
            if (disposed || placements.get(object.id) !== pending || pending.generation !== generation) return;
            pending.root.add(model.scene.clone(true));
            updateSelection();
          }).catch(error => {
            if (placements.get(object.id) === pending && pending.generation === generation) report(new Error(`Nie można wyświetlić „${asset.name}”: ${error.message}`));
          });
        } else report(new Error(`Brak zasobu GLB obiektu „${object.name}”.`));
      }
      entry.generation = generation;
      entry.root.position.fromArray(object.position);
      entry.root.rotation.set(...object.rotation);
      entry.root.scale.fromArray(object.scale);
      if (object.kind === 'box') entry.root.children[0].material.color.set(object.color);
    }
    for (const [id, entry] of cache) {
      if (!assets.has(id) || assets.get(id).dataUrl !== entry.dataUrl) { evict(entry); cache.delete(id); }
    }
    updateSelection();
  }

  function frame() {
    if (disposed) return;
    const box = new THREE.Box3();
    const selection = placements.get(selectedId)?.root;
    if (selection) box.setFromObject(selection);
    else for (const entry of placements.values()) box.union(new THREE.Box3().setFromObject(entry.root));
    const center = box.isEmpty() ? new THREE.Vector3(0, 0.4, 0) : box.getCenter(new THREE.Vector3());
    const radius = box.isEmpty() ? 3 : Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.1);
    const halfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(camera.aspect, 1));
    const distance = radius / Math.sin(halfFov) * 1.3;
    const direction = camera.position.clone().sub(controls.target).normalize();
    if (!direction.lengthSq()) direction.set(1, 0.8, 1).normalize();
    camera.position.copy(center).addScaledVector(direction, distance);
    controls.target.copy(center);
    camera.near = Math.max(0.001, distance / 10000);
    camera.far = Math.max(1000, distance * 100);
    camera.updateProjectionMatrix();
    controls.update();
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  const down = event => { if (event.button === 0) pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }; };
  const cancel = () => { pointerStart = null; };
  const up = event => {
    const start = pointerStart;
    pointerStart = null;
    if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects([...placements.values()].map(entry => entry.root), true)[0];
    let root = hit?.object;
    // Imported node extras/userData must never impersonate a placement ID.
    while (root && !rootIds.has(root)) root = root.parent;
    onSelect(root ? rootIds.get(root) : null);
  };
  const contextLost = event => { event.preventDefault(); report(new Error('Widok 3D utracił kontekst WebGL. Zamknij i otwórz okno miejsca.')); };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('webglcontextlost', contextLost);
  function resize() {
    if (disposed) return;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  let animation;
  const draw = () => {
    if (disposed) return;
    animation = requestAnimationFrame(draw);
    controls.update();
    renderer.render(scene, camera);
  };
  draw();
  return {
    update,
    frame,
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      cancelAnimationFrame(animation);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('webglcontextlost', contextLost);
      controls.dispose();
      for (const [id, entry] of placements) removePlacement(id, entry);
      for (const entry of cache.values()) evict(entry);
      cache.clear();
      grid.geometry.dispose();
      grid.material.dispose();
      outline.geometry.dispose();
      outline.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

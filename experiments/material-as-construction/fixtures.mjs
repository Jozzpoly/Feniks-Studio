/*
 * Syntetyczne przedmioty próbne dla eksperymentu „Materiał jako tworzywo”.
 * To nie są autorskie mapy ani assety Ownera. Tekstury są rysowane tu na
 * Canvasie, a liczby w geometrii są pikselami Blockbencha (16 px = 1 m).
 */

const SIDES = ['north', 'south', 'east', 'west', 'up', 'down'];
const FULL_UV = [0, 0, 16, 16];

function ids() {
  let n = 0;
  return () => `00000000-0000-4000-8000-${(++n).toString(16).padStart(12, '0')}`;
}

function pixelArt(pattern, palette) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Nie można utworzyć tekstury Canvas dla fixture.');
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let ink = 0;
      if (pattern === 'planks') {
        const row = Math.floor(y / 4);
        const seam = y % 4 === 0 || (y % 4 === 1 && x % 8 === (row % 2 ? 2 : 6));
        const knot = y % 4 === 2 && ((x + row * 3) % 13 === 5 || (x + row * 3) % 13 === 6);
        ink = seam ? 0 : knot ? 2 : ((x + row) % 7 === 0 ? 2 : 1);
      } else if (pattern === 'shingles') {
        const row = Math.floor(y / 4);
        const seam = y % 4 === 0 || (y % 4 === 1 && x % 8 === (row % 2 ? 3 : 7));
        ink = seam ? 0 : ((x + row * 2) % 9 === 0 ? 2 : 1);
      } else if (pattern === 'riveted') {
        const bolt = (x % 8 === 1 || x % 8 === 6) && (y % 8 === 1 || y % 8 === 6);
        const seam = y % 8 === 0 || x % 8 === 0;
        ink = bolt ? 2 : seam ? 0 : ((x + y) % 11 === 0 ? 2 : 1);
      } else if (pattern === 'woven') {
        const seam = x % 4 === 0 || y % 4 === 0;
        ink = seam ? 0 : ((Math.floor(x / 4) + Math.floor(y / 4)) % 3 === 0 ? 2 : 1);
      } else if (pattern === 'enamel') {
        const seam = y % 8 === 0 || x % 8 === 0;
        const glint = (x + 2 * y) % 13 === 0;
        ink = seam ? 0 : glint ? 2 : 1;
      } else {
        ink = ((x + y) % 7 === 0) ? 2 : 1;
      }
      ctx.fillStyle = palette[ink];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return canvas.toDataURL('image/png');
}

function fixtureBuilder() {
  const nextId = ids();
  const elements = [];
  const groups = [];
  const textureRefs = [];

  function texture(name, pattern, palette) {
    const tx = {
      uuid: nextId(),
      name,
      source: pixelArt(pattern, palette),
      uv_width: 16,
      uv_height: 16,
      width: 16,
      height: 16,
      particle: false,
    };
    textureRefs.push(tx);
    return textureRefs.length - 1;
  }

  function cube(name, from, to, textureIndex, options = {}) {
    const uuid = nextId();
    const origin = options.origin || from.map((v, i) => (v + to[i]) / 2);
    const faces = Object.fromEntries(SIDES.map(side => [side, {
      uv: [...FULL_UV],
      texture: textureIndex,
      rotation: 0,
    }]));
    elements.push({
      uuid,
      name,
      type: 'cube',
      from: [...from],
      to: [...to],
      origin: [...origin],
      rotation: [...(options.rotation || [0, 0, 0])],
      inflate: 0,
      visibility: true,
      export: true,
      faces,
    });
    return uuid;
  }

  function triangleMesh(name, origin, triangles, textureIndex) {
    const uuid = nextId();
    const vertices = {};
    const faces = {};
    for (const tri of triangles) {
      const entries = Object.entries(tri.points);
      const keys = entries.map((_, i) => `${tri.name}-v${i}`);
      entries.forEach(([, point], i) => { vertices[keys[i]] = [...point]; });
      const uv = Object.fromEntries(keys.map((key, i) => [key, [[0, 0], [16, 0], [8, 16]][i]]));
      faces[tri.name] = { vertices: keys, uv, texture: textureIndex };
    }
    elements.push({
      uuid,
      name,
      type: 'mesh',
      origin: [...origin],
      rotation: [0, 0, 0],
      vertices,
      faces,
      visibility: true,
      export: true,
    });
    return uuid;
  }

  function group(name, origin, rotation, children = []) {
    const uuid = nextId();
    const entry = {
      uuid,
      name,
      origin: [...origin],
      rotation: [...rotation],
      export: true,
      visibility: true,
      isOpen: true,
    };
    groups.push(entry);
    // Keep transform fields in the outliner as well as groups so the fixture
    // reads through both the older tree shape and the v5 group lookup.
    return { ...entry, children };
  }

  function document(name, root, description) {
    return {
      meta: {
        format_version: '4.10',
        model_format: 'free',
        box_uv: false,
      },
      name,
      model_identifier: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      description,
      resolution: { width: 16, height: 16 },
      elements,
      outliner: [root],
      textures: textureRefs,
      groups,
    };
  }

  return { texture, cube, triangleMesh, group, document };
}

function workshopFixture() {
  const b = fixtureBuilder();
  const wood = b.texture('Deska — miód i cień', 'planks', ['#3d2921', '#966341', '#d0a06b']);
  const roofTex = b.texture('Dach — morska emalia', 'shingles', ['#203b46', '#397c83', '#98c7b0']);
  const iron = b.texture('Okucie — granat i mosiądz', 'riveted', ['#1c2934', '#647785', '#e5bd70']);

  const frame = b.group('Rama warsztatu', [0, 0, 0], [0, 0, 0], [
    b.cube('Ściana zaplecza', [5, 3, 0], [59, 40, 5], wood),
    b.cube('Słup lewy', [0, 0, 0], [6, 48, 8], iron),
    b.cube('Słup prawy', [58, 0, 0], [64, 48, 8], iron),
    b.cube('Nadproże', [6, 42, 0], [58, 48, 8], wood),
  ]);

  const deck = b.group('Podest', [32, 20, 48], [0, 0, 0], [
    b.cube('Deska podestu lewa', [7, 20, 48], [31, 24, 74], wood),
    b.cube('Deska podestu prawa', [33, 20, 48], [57, 24, 74], wood),
    b.cube('Belka podestu', [5, 16, 48], [59, 20, 72], iron),
  ]);

  const rail = b.group('Balustrada', [32, 32, 68], [0, 0, 1], [
    b.cube('Słupek balustrady lewy', [4, 24, 66], [9, 44, 72], iron),
    b.cube('Słupek balustrady środkowy', [30, 24, 66], [35, 44, 72], iron),
    b.cube('Słupek balustrady prawy', [55, 24, 66], [60, 44, 72], iron),
    b.cube('Poręcz przednia górna', [4, 40, 68], [60, 44, 72], wood),
    b.cube('Poręcz przednia dolna', [4, 30, 68], [60, 34, 72], wood),
    b.cube('Poręcz boczna lewa', [4, 32, 50], [9, 36, 68], wood),
    b.cube('Poręcz boczna prawa', [55, 32, 50], [60, 36, 68], wood),
  ]);

  const sign = b.group('Szyld kramu', [32, 38, 70], [0, -5, 0], [
    b.cube('Tablica szyldu', [22, 35, 69], [42, 41, 72], wood),
  ]);
  const roofTriangles = [
    { name: 'połać przód a', points: { a: [-28, -5, -16], b: [28, -5, -16], c: [-28, 4, 0] } },
    { name: 'połać przód b', points: { a: [28, -5, -16], b: [28, 4, 0], c: [-28, 4, 0] } },
    { name: 'połać tył a', points: { a: [-28, 4, 0], b: [28, 4, 0], c: [-28, -5, 16] } },
    { name: 'połać tył b', points: { a: [28, 4, 0], b: [28, -5, 16], c: [-28, -5, 16] } },
    { name: 'szczyt lewy a', points: { a: [-28, -5, -16], b: [-28, 4, 0], c: [-28, -5, 16] } },
    { name: 'szczyt prawy a', points: { a: [28, -5, -16], b: [28, -5, 16], c: [28, 4, 0] } },
  ];
  const roofGroup = b.group('Daszek', [32, 46, 58], [0, 0, -2], [
    b.cube('Wspornik daszku lewy', [8, 24, 49], [12, 47, 55], iron),
    b.cube('Wspornik daszku prawy', [52, 24, 49], [56, 47, 55], iron),
    b.cube('Fascia daszku', [6, 44, 48], [58, 49, 55], wood),
    b.triangleMesh('Dach — klin mesh', [32, 51, 60], roofTriangles, roofTex),
    sign,
  ]);

  const balcony = b.group('Balkon', [32, 20, 48], [0, 0, 0], [deck, rail, roofGroup]);
  const root = b.group('Warsztat — balkon do przerobienia na kram', [0, 0, 0], [0, 0, 0], [frame, balcony]);
  const json = b.document(
    'Fixture próbny — warsztat z balkonem',
    root,
    'Syntetyczny przedmiot do próby odłączania i ponownego łączenia części; nie jest autorską mapą Ownera.'
  );

  return {
    name: 'material-as-construction-workshop.bbmodel',
    blob: new Blob([JSON.stringify(json)], { type: 'application/json' }),
    label: 'Warsztat z balkonem do przebudowy na kram',
  };
}

function carrierFixture() {
  const b = fixtureBuilder();
  const shell = b.texture('Pancerz — grafit i morski enamel', 'enamel', ['#18242d', '#3e7881', '#a8d0c0']);
  const metal = b.texture('Przeguby — stal i mosiądz', 'riveted', ['#212b32', '#677984', '#e6bb69']);
  const cargo = b.texture('Ładunek — tkanina i deska', 'woven', ['#303b2b', '#80824d', '#d2bd7d']);

  const torso = b.group('Tułów', [32, 32, 32], [0, 2, 0], [
    b.cube('Pancerz główny', [16, 29, 18], [48, 43, 46], shell),
    b.cube('Brzuch i podwozie', [22, 22, 22], [42, 29, 42], metal),
    b.cube('Panel przedni', [23, 33, 44], [41, 40, 49], metal),
    b.cube('Płetwa tylna', [25, 31, 15], [39, 38, 20], shell),
  ]);

  const legNodes = [];
  const rows = [
    { name: 'przód', z: 20, kneeZ: 27, bend: -5 },
    { name: 'środek', z: 32, kneeZ: 32, bend: 0 },
    { name: 'tył', z: 44, kneeZ: 37, bend: 5 },
  ];
  for (const row of rows) {
    for (const side of [{ name: 'lewa', sign: -1 }, { name: 'prawa', sign: 1 }]) {
      const left = side.sign < 0;
      const hipX = left ? 20 : 44;
      const kneeX = left ? 11 : 53;
      const upperFrom = left ? [8, 18, row.z - 5] : [40, 18, row.z - 5];
      const upperTo = left ? [24, 31, row.z + 5] : [56, 31, row.z + 5];
      const lowerFrom = left ? [2, 3, row.kneeZ - 6] : [52, 3, row.kneeZ - 6];
      const lowerTo = left ? [12, 19, row.kneeZ + 6] : [62, 19, row.kneeZ + 6];
      const upper = b.cube(`Segment górny — ${row.name} ${side.name}`, upperFrom, upperTo, shell);
      const lower = b.cube(`Segment dolny — ${row.name} ${side.name}`, lowerFrom, lowerTo, metal);
      const knee = b.group('Kolano', [kneeX, 18, row.kneeZ], [0, 0, side.sign * 7], [lower]);
      legNodes.push(b.group(
        `Noga ${row.name} ${side.name}`,
        [hipX, 28, row.z],
        [0, side.sign * 2, side.sign * (row.bend || 4)],
        [upper, knee]
      ));
    }
  }
  const legs = b.group('Nogi — sześć odłączanych zespołów', [32, 28, 32], [0, 0, 0], legNodes);

  const load = b.group('Ładunek', [32, 48, 32], [0, -2, 0], [
    b.cube('Siodło ładunku', [20, 44, 21], [44, 48, 43], metal),
    b.cube('Skrzynia transportowa', [24, 48, 25], [40, 58, 39], cargo),
  ]);
  const crown = b.group('Korona i antena', [32, 60, 32], [1, 0, 0], [
    b.cube('Poprzeczka korony', [19, 59, 29], [45, 62, 35], shell),
    b.cube('Antenna korony', [30, 58, 30], [34, 64, 34], metal),
  ]);
  const cargoAndCrown = b.group('Ładunek / korona', [32, 48, 32], [0, 0, 0], [load, crown]);
  const root = b.group('Mechaniczny nosiciel', [0, 0, 0], [0, 0, 0], [torso, legs, cargoAndCrown]);
  const json = b.document(
    'Fixture próbny — mechaniczny nosiciel',
    root,
    'Syntetyczny wieloczłonowy przedmiot do próby odłączania i ponownego łączenia części; nie jest autorskim assetem Ownera.'
  );

  return {
    name: 'material-as-construction-carrier.bbmodel',
    blob: new Blob([JSON.stringify(json)], { type: 'application/json' }),
    label: 'Mechaniczny nosiciel z ładunkiem i koroną',
  };
}

export async function createFixtures() {
  return [workshopFixture(), carrierFixture()];
}

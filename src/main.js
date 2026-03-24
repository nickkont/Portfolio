import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// ─── Projects data ───────────────────────────────────────────────────────────
/** @typedef {{ label: string, href: string }} ProjectLink */
/** @type {Array<{ title: string, tech: string, desc: string, color: number, links?: ProjectLink[], wip?: boolean }>} */
const PROJECTS = [
  {
    title: 'Kindred',
    tech: 'Cross-platform · In progress',
    desc: 'A period tracking app built for iOS and Android—thoughtful, private, and easy to use. Currently in active development.',
    wip: true,
    links: [],
    color: 0xc45c7a,
  },
  {
    title: 'Lead Agent',
    tech: 'Python · CLI · Web',
    desc: 'An AI-powered CLI tool that automates B2B lead generation — scrapes, qualifies, and enriches company prospects using LLMs, then exports ready-to-use lead lists for outreach.',
    links: [
      { label: 'GitHub', href: 'https://github.com/nickkont/Lead-Agent' },
    ],
    color: 0x8b4513,
  },
  {
    title: 'CheckMate',
    tech: 'Swift · iOS',
    desc: 'Split the bill down to the cent—including tax and tip. Snap receipts, assign items, save checks, and share totals (including Venmo requests).',
    links: [
      { label: 'GitHub', href: 'https://github.com/nickkont/CheckMate' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/checkmate-check-splitting/id6742667685' },
    ],
    color: 0x2e7d8a,
  },
  {
    title: 'Kingdom World',
    tech: 'Swift · iOS · iPad',
    desc: 'A fast side-scrolling action game: dodge, fight, collect coins, unlock weapons and cosmetics, and fill your bestiary as you save the kingdom.',
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/us/app/kingdom-world/id6752544752' },
    ],
    color: 0x8b4513,
  },
  {
    title: 'Eventra',
    tech: 'Web · Team project',
    desc: 'An event-contract marketplace (think Kalshi-style) for trading on future outcomes—sports, politics, and campus-specific markets—with live data and community features.',
    links: [
      { label: 'GitHub', href: 'https://github.com/nickkont/csc47300-s2026-team-10minutetimer' },
    ],
    color: 0x5c6bc0,
  },
  {
    title: 'TrueBite',
    tech: 'React · Flask · Firebase · AI',
    desc: 'AI-enabled restaurant ordering: role-based dashboards, real-time orders and delivery, forums, wallets—and a RAG chatbot (local menu embeddings + Gemini) with voice menu search.',
    links: [
      { label: 'GitHub', href: 'https://github.com/bshiribaiev/TrueBite' },
    ],
    color: 0xd84315,
  },
];

// ─── Scene setup ─────────────────────────────────────────────────────────────
const container = document.getElementById('canvas-container');
const W = window.innerWidth;
const H = window.innerHeight;

/** Cap DPR — full Retina resolution doubles fragment cost for minimal visual gain here. */
function getEffectivePixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 1.5);
}

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance',
  stencil: false,
});
renderer.setPixelRatio(getEffectivePixelRatio());
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue
scene.fog = new THREE.FogExp2(0xc9e8f5, 0.025);

const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
camera.position.set(0, 1.7, 0);
camera.lookAt(0, 1.7, -5);

// ─── Lighting ─────────────────────────────────────────────────────────────────
// Bright daytime ambient — fills everything with sky-blue bounce light
const ambientLight = new THREE.AmbientLight(0xd0e8ff, 3.5);
scene.add(ambientLight);

// Sun — strong warm directional light from upper-right
const sunLight = new THREE.DirectionalLight(0xfff5e0, 4.0);
sunLight.position.set(20, 30, -10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 120;
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;
scene.add(sunLight);

// Soft fill light from opposite side (sky dome bounce)
const fillLight = new THREE.DirectionalLight(0xaad4ff, 1.2);
fillLight.position.set(-15, 10, 5);
scene.add(fillLight);

// Hemisphere light — sky above, warm ground below
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0xc8b89a, 1.5);
scene.add(hemiLight);

// Street lamps still exist but are dim in daylight
function addStreetLamp(x, z) {
  const light = new THREE.PointLight(0xffffff, 0.1, 6, 2);
  light.position.set(x, 4.5, z);
  scene.add(light);
}

// ─── Street geometry ──────────────────────────────────────────────────────────
const STREET_LENGTH = 80;
const STREET_WIDTH = 8;

// Wide ground plane — covers everything so sky never shows through
const groundGeo = new THREE.PlaneGeometry(160, STREET_LENGTH + 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0xa0987e, roughness: 0.95 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.set(0, -0.02, -STREET_LENGTH / 2 + 5);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

// Road surface
const roadGeo = new THREE.PlaneGeometry(STREET_WIDTH, STREET_LENGTH);
const roadMat = new THREE.MeshStandardMaterial({
  color: 0x4a4e58,
  roughness: 0.95,
  metalness: 0.05,
});
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -STREET_LENGTH / 2 + 5);
road.receiveShadow = true;
scene.add(road);

// Sidewalks — wide flat concrete, no barriers
function makeSidewalk(x) {
  const geo = new THREE.BoxGeometry(10, 0.12, STREET_LENGTH);
  const mat = new THREE.MeshStandardMaterial({ color: 0xbdb5a5, roughness: 0.88 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, 0.06, -STREET_LENGTH / 2 + 5);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
makeSidewalk(-9);
makeSidewalk(9);

// Center dashed lines
for (let i = 0; i < 14; i++) {
  const geo = new THREE.PlaneGeometry(0.12, 1.4);
  const mat = new THREE.MeshStandardMaterial({ color: 0x888866, roughness: 1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.005, -i * 5 - 2);
  scene.add(mesh);
}

// ─── Buildings (background filler) ───────────────────────────────────────────
function randomRange(a, b) { return a + Math.random() * (b - a); }

// Curated building palette — distinct, readable colors
const BUILDING_PALETTE = [
  { wall: 0xb5604a, mortar: 0x8a4535 }, // terracotta brick
  { wall: 0x7a8fa0, mortar: 0x5a6f80 }, // slate blue
  { wall: 0xc49a6c, mortar: 0x9a7450 }, // sandy tan
  { wall: 0x7a8870, mortar: 0x5a6850 }, // sage concrete
  { wall: 0x9e7060, mortar: 0x7a5045 }, // warm brown brick
  { wall: 0x6e7f8a, mortar: 0x4e5f6a }, // blue-gray
  { wall: 0xba8855, mortar: 0x8a6035 }, // amber brick
  { wall: 0x8a6a7a, mortar: 0x6a4a5a }, // dusty mauve
];

// Generate a canvas brick/panel texture
function makeBrickTexture(wallHex, mortarHex, width = 256, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const wc = new THREE.Color(wallHex);
  const mc = new THREE.Color(mortarHex);
  const mortarStr = `rgb(${~~(mc.r*255)},${~~(mc.g*255)},${~~(mc.b*255)})`;
  const brickStr  = `rgb(${~~(wc.r*255)},${~~(wc.g*255)},${~~(wc.b*255)})`;

  // Fill with mortar
  ctx.fillStyle = mortarStr;
  ctx.fillRect(0, 0, width, height);

  const brickH = 20;
  const brickW = 46;
  const gap = 3;
  const rows = Math.ceil(height / (brickH + gap)) + 1;

  for (let row = 0; row < rows; row++) {
    const offsetX = row % 2 === 0 ? 0 : (brickW + gap) / 2;
    const y = row * (brickH + gap);
    const cols = Math.ceil(width / (brickW + gap)) + 1;
    for (let col = 0; col < cols; col++) {
      const x = col * (brickW + gap) - offsetX;
      // slight per-brick color variation
      const vary = (Math.random() - 0.5) * 0.06;
      const r = Math.min(255, Math.max(0, ~~(wc.r * 255) + vary * 255));
      const g = Math.min(255, Math.max(0, ~~(wc.g * 255) + vary * 255));
      const b = Math.min(255, Math.max(0, ~~(wc.b * 255) + vary * 255));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + gap / 2, y + gap / 2, brickW, brickH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Generate a concrete panel texture
function makeConcreteTexture(wallHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const wc = new THREE.Color(wallHex);

  ctx.fillStyle = `rgb(${~~(wc.r*255)},${~~(wc.g*255)},${~~(wc.b*255)})`;
  ctx.fillRect(0, 0, 256, 256);

  // Horizontal panel lines
  ctx.strokeStyle = `rgba(0,0,0,0.18)`;
  ctx.lineWidth = 2;
  for (let y = 32; y < 256; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }
  // Vertical panel lines
  ctx.strokeStyle = `rgba(0,0,0,0.10)`;
  ctx.lineWidth = 1.5;
  for (let x = 64; x < 256; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
  }
  // Noise grain
  for (let i = 0; i < 3000; i++) {
    const px = Math.random() * 256, py = Math.random() * 256;
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(px, py, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ─── Shared window texture ────────────────────────────────────────────────────
// Opaque tinted-glass pane: dark interior + diagonal reflection streaks.
// No transparency needed — this is how city windows look from the street.
function makeWindowTex(tint = '#0d1a28', frameColor = '#1e2a36') {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 192;
  const ctx = canvas.getContext('2d');

  // Window frame
  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, 128, 192);

  // Dark tinted glass interior
  ctx.fillStyle = tint;
  ctx.fillRect(6, 6, 116, 180);

  // Primary diagonal highlight (upper-left glow)
  ctx.save();
  ctx.globalAlpha = 0.28;
  const grad1 = ctx.createLinearGradient(6, 6, 60, 90);
  grad1.addColorStop(0, '#c8e8ff');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(62, 6);
  ctx.lineTo(10, 80);
  ctx.closePath();
  ctx.fill();

  // Secondary narrower streak
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(72, 6);
  ctx.lineTo(88, 6);
  ctx.lineTo(44, 90);
  ctx.lineTo(32, 90);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Pre-bake a few window tint variants
const WIN_TEXTURES = [
  makeWindowTex('#0d1a28', '#1e2a36'),  // near-black blue
  makeWindowTex('#0e1c20', '#1c2c30'),  // dark teal
  makeWindowTex('#12181a', '#222828'),  // very dark
];

let _buildingIndex = 0;

function makeBuilding(x, z, w, h, d) {
  const palette = BUILDING_PALETTE[_buildingIndex % BUILDING_PALETTE.length];
  _buildingIndex++;

  const useBrick = _buildingIndex % 3 !== 0; // mix brick and concrete
  const tex = useBrick
    ? makeBrickTexture(palette.wall, palette.mortar)
    : makeConcreteTexture(palette.wall);

  // Scale texture repeat by building size so bricks are always ~same size
  tex.repeat.set(w * 0.8, h * 0.5);

  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Dark rooftop parapet/cornice — visually caps each building
  const corniceGeo = new THREE.BoxGeometry(w + 0.3, 0.35, d + 0.3);
  const corniceMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.mortar).multiplyScalar(0.65),
    roughness: 0.9,
  });
  const cornice = new THREE.Mesh(corniceGeo, corniceMat);
  cornice.position.set(x, h + 0.18, z);
  cornice.castShadow = true;
  scene.add(cornice);

  // Dark vertical trim on left & right edges — separates adjacent buildings
  const trimW = 0.18;
  const trimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.mortar).multiplyScalar(0.5),
    roughness: 0.9,
  });
  for (const side of [-1, 1]) {
    const trimGeo = new THREE.BoxGeometry(trimW, h + 0.35, d + 0.1);
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(x + side * (w / 2 + trimW / 2), h / 2, z);
    scene.add(trim);
  }

  // Windows — opaque canvas-painted tinted glass, no transparency tricks
  const winCols = Math.max(1, Math.floor(w / 1.4));
  const winRows = Math.max(1, Math.floor((h - 2) / 2.0));
  const faceSide = x > 0 ? -1 : 1;
  const winTex = WIN_TEXTURES[_buildingIndex % WIN_TEXTURES.length];

  for (let row = 0; row < winRows; row++) {
    for (let c = 0; c < winCols; c++) {
      if (Math.random() < 0.7) {
        const spacing = w / (winCols + 1);
        const wx = x - w / 2 + spacing * (c + 1);
        const wy = 1.8 + row * 2.0;
        const faceZ = z + faceSide * (d / 2 + 0.015);

        const wGeo = new THREE.PlaneGeometry(0.55, 0.75);
        const wMat = new THREE.MeshStandardMaterial({
          map: winTex,
          roughness: 0.1,
          metalness: 0.15,
        });
        const win = new THREE.Mesh(wGeo, wMat);
        win.position.set(wx, wy, faceZ);
        win.rotation.y = faceSide > 0 ? 0 : Math.PI;
        scene.add(win);
      }
    }
  }
}

// Scatter background buildings — pushed further out so they don't overlap storefronts
const _rng = (() => { let s = 42; return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; })();

for (let i = 0; i < 12; i++) {
  const z = -i * 7 - 14;
  const wL = 4 + _rng() * 4, hL = 9 + _rng() * 12, dL = 4 + _rng() * 4;
  const wR = 4 + _rng() * 4, hR = 9 + _rng() * 12, dR = 4 + _rng() * 4;
  makeBuilding(-16 - _rng() * 3, z, wL, hL, dL);
  makeBuilding( 16 + _rng() * 3, z, wR, hR, dR);
}

// ─── Street lamps ─────────────────────────────────────────────────────────────
const LAMP_SPACING = 8;
const lampPositions = [];
for (let i = 0; i < 9; i++) {
  const z = -i * LAMP_SPACING - 2;
  lampPositions.push({ x: -4.5, z });
  lampPositions.push({ x: 4.5, z });
  addStreetLamp(-4.5, z);
  addStreetLamp(4.5, z);
}

function makeLampPost(x, z) {
  const armLen = 1.2;
  const headR = 0.18;
  // Left sidewalk (x < 0): arm extends +X toward street; right: -X toward street
  const towardStreet = x < 0 ? 1 : -1;

  const poleGeo = new THREE.CylinderGeometry(0.04, 0.06, 5, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x7a8a9a, roughness: 0.6, metalness: 0.5 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 2.5, z);
  scene.add(pole);

  // Arm: horizontal along X, centered between pole and tip
  const armGeo = new THREE.CylinderGeometry(0.03, 0.03, armLen, 6);
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.rotation.z = Math.PI / 2;
  const armCenterX = x + towardStreet * (armLen / 2);
  arm.position.set(armCenterX, 4.9, z);
  scene.add(arm);

  // Globe at the far end of the arm (past pole), sitting on the tip
  const headGeo = new THREE.SphereGeometry(headR, 8, 8);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xdde8ee,
    roughness: 0.3,
    metalness: 0.6,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(x + towardStreet * (armLen + headR * 0.35), 4.9, z);
  scene.add(head);
}

for (const lp of lampPositions.filter((_, i) => i % 2 === 0)) {
  makeLampPost(lp.x, lp.z);
}

// ─── Project stores (shop facades) ───────────────────────────────────────────
// Each project needs a unique Z. Pairs used to share Z (same "row"), so getNearestStore
// always picked the first of the pair—CheckMate & Eventra never showed.
const FIRST_STORE_Z = -10;
const STORE_Z_STEP = 5; // distance along the street between consecutive storefronts
const storeObjects = []; // { mesh, project, side, zPos, signMesh }

/** Keep 3D sign within storefront width (~5 units); trim + ellipsis if needed. */
function shortenStorefrontTitle(title, maxChars = 14) {
  const t = title.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(3, maxChars - 1)).trim()}…`;
}

function makeStorefrontLabelMesh(project, font) {
  const text = shortenStorefrontTitle(project.title);
  const geo = new TextGeometry(text, {
    font,
    size: 0.23,
    depth: 0.04,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 1,
  });
  geo.computeBoundingBox();
  geo.center();
  const bb = geo.boundingBox;
  const w = bb.max.x - bb.min.x;
  const maxW = 4.1;
  const scale = w > maxW ? maxW / w : 1;

  const mat = new THREE.MeshStandardMaterial({
    color: project.color,
    emissive: project.color,
    emissiveIntensity: 0.12,
    roughness: 0.55,
    metalness: 0.25,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeStore(project, index, font) {
  const side = index % 2 === 0 ? -1 : 1; // left or right
  const z = FIRST_STORE_Z - index * STORE_Z_STEP;
  const xBase = side * 7.2;

  const group = new THREE.Group();
  scene.add(group);

  // Each storefront gets its own brick texture derived from a neutral palette
  const STORE_WALL_COLORS = [
    { wall: 0xc8a882, mortar: 0x9a7855 }, // warm sandstone
    { wall: 0xb07060, mortar: 0x805040 }, // terracotta
    { wall: 0x8090a0, mortar: 0x607080 }, // stone blue
    { wall: 0xa89878, mortar: 0x786848 }, // limestone
    { wall: 0x9a8878, mortar: 0x7a6858 }, // warm gray
    { wall: 0x7a9080, mortar: 0x5a7060 }, // sage
  ];
  const storeWall = STORE_WALL_COLORS[index % STORE_WALL_COLORS.length];
  const storeTex = makeBrickTexture(storeWall.wall, storeWall.mortar, 256, 256);
  storeTex.repeat.set(2.5, 1.5);

  // Building body
  const bodyGeo = new THREE.BoxGeometry(5, 6, 4);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: storeTex,
    color: 0xffffff,
    roughness: 0.85,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(xBase, 3, z);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Front face toward the camera (both sidewalks): depth 4 → near face at z + 2. Do not use `side`
  // here — left stores had side=-1 and were placed on z - 2 (facing down the road).
  const frontZ = z + 2.01;

  // Facade (front face) — slightly lighter plaster over brick
  const facadeTex = makeConcreteTexture(storeWall.wall);
  facadeTex.repeat.set(2, 1.2);
  const facadeGeo = new THREE.PlaneGeometry(5, 6);
  const facadeMat = new THREE.MeshStandardMaterial({
    map: facadeTex,
    color: 0xffffff,
    roughness: 0.75,
  });
  const facade = new THREE.Mesh(facadeGeo, facadeMat);
  facade.position.set(xBase, 3, frontZ);
  facade.rotation.y = 0;
  group.add(facade);

  // Dark corner trim on storefront edges — visually separates it
  const storeTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(storeWall.mortar).multiplyScalar(0.55),
    roughness: 0.9,
  });
  for (const ts of [-1, 1]) {
    const tg = new THREE.BoxGeometry(0.18, 6.3, 4.1);
    const tm = new THREE.Mesh(tg, storeTrimMat);
    tm.position.set(xBase + ts * 2.59, 3, z);
    group.add(tm);
  }
  // Rooftop parapet
  const parapetGeo = new THREE.BoxGeometry(5.4, 0.4, 4.3);
  const parapetMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(storeWall.mortar).multiplyScalar(0.7),
    roughness: 0.9,
  });
  const parapet = new THREE.Mesh(parapetGeo, parapetMat);
  parapet.position.set(xBase, 6.2, z);
  parapet.castShadow = true;
  group.add(parapet);

  // Awning
  const awningGeo = new THREE.BoxGeometry(5.0, 0.15, 1.4);
  const awningColor = new THREE.Color(project.color).multiplyScalar(0.6);
  const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.7 });
  const awning = new THREE.Mesh(awningGeo, awningMat);
  awning.position.set(xBase, 4.0, z + 2.7);
  awning.castShadow = true;
  group.add(awning);

  // Stripe on awning
  const stripeGeo = new THREE.BoxGeometry(5.0, 0.02, 1.4);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: project.color,
    emissive: project.color,
    emissiveIntensity: 0.4,
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(xBase, 4.08, z + 2.7);
  group.add(stripe);

  // Door
  const doorGeo = new THREE.BoxGeometry(0.9, 2.2, 0.08);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5c4a3a, roughness: 0.6 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(xBase, 1.1, z + 2.06);
  group.add(door);

  // Door frame
  const dfGeo = new THREE.BoxGeometry(1.05, 2.35, 0.06);
  const dfMat = new THREE.MeshStandardMaterial({ color: project.color, roughness: 0.5, metalness: 0.3 });
  const df = new THREE.Mesh(dfGeo, dfMat);
  df.position.set(xBase, 1.175, z + 2.04);
  group.add(df);

  // Display windows — opaque canvas tinted pane inside a colored frame
  const storeWinTex = makeWindowTex('#0a1520', '#' + project.color.toString(16).padStart(6, '0'));
  const faceZ = z + 2.03;
  for (let w = 0; w < 2; w++) {
    const wx = xBase + (w === 0 ? -1.4 : 1.4);

    // Colored window frame (slightly proud of facade)
    const frameGeo = new THREE.BoxGeometry(1.18, 1.48, 0.06);
    const frameMat = new THREE.MeshStandardMaterial({
      color: project.color,
      roughness: 0.5,
      metalness: 0.2,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(wx, 2.0, faceZ - 0.01);
    group.add(frame);

    // Opaque tinted-glass pane (canvas painted)
    const winGeo = new THREE.PlaneGeometry(1.04, 1.34);
    const winMat = new THREE.MeshStandardMaterial({
      map: storeWinTex,
      roughness: 0.08,
      metalness: 0.15,
    });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(wx, 2.0, faceZ + 0.035);
    win.rotation.y = 0;
    group.add(win);

    // Window sill
    const sillGeo = new THREE.BoxGeometry(1.22, 0.08, 0.18);
    const sillMat = new THREE.MeshStandardMaterial({ color: 0x6a6058, roughness: 0.7 });
    const sill = new THREE.Mesh(sillGeo, sillMat);
    sill.position.set(wx, 1.26, z + 2.12);
    group.add(sill);
  }

  // 3D extruded name above awning (toward camera / +Z face)
  const sign = makeStorefrontLabelMesh(project, font);
  sign.position.set(xBase, 4.62, z + 2.14);
  group.add(sign);

  // Glow light under awning
  const glowLight = new THREE.PointLight(project.color, 0.3, 6, 2);
  glowLight.position.set(xBase, 3.8, z + 3.2);
  scene.add(glowLight);

  storeObjects.push({ group, project, side, zPos: z, sign, glowLight });
}

const storefrontFont = await new FontLoader().loadAsync('/fonts/helvetiker_regular.typeface.json');
PROJECTS.forEach((proj, i) => makeStore(proj, i, storefrontFont));

// ─── Particles (city ambience) ────────────────────────────────────────────────
const particleCount = 140;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
  positions[i * 3 + 1] = Math.random() * 12;
  positions[i * 3 + 2] = Math.random() * -70 - 2;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.3,
});
scene.add(new THREE.Points(particleGeo, particleMat));

// ─── Scroll / camera animation ────────────────────────────────────────────────
const scrollEl = document.getElementById('scroll-capture');
let scrollProgress = 0; // 0..1

// Total walkable Z — end a few units past the last storefront so TrueBite still highlights
const LAST_STORE_Z = FIRST_STORE_Z - (PROJECTS.length - 1) * STORE_Z_STEP;
const WALK_END_Z = LAST_STORE_Z - 4;
const CAM_START_Z = 0;
const CAM_END_Z = WALK_END_Z;

// Camera target (lerped)
const camTarget = { z: CAM_START_Z, y: 1.7 };
const camActual = { z: CAM_START_Z, y: 1.7 };

const contactCard = document.getElementById('contact-card');

scrollEl.addEventListener(
  'scroll',
  () => {
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    scrollProgress = max > 0 ? scrollEl.scrollTop / max : 0;
    camTarget.z = CAM_START_Z + scrollProgress * (CAM_END_Z - CAM_START_Z);

    // Fade out connect card once user starts scrolling
    const scrolled = scrollProgress > 0.03;
    contactCard.style.opacity = scrolled ? '0' : '1';
    contactCard.style.pointerEvents = scrolled ? 'none' : 'auto';
  },
  { passive: true },
);

// ─── UI refs ──────────────────────────────────────────────────────────────────
const namePlate    = document.getElementById('name-plate');
const scrollHint   = document.getElementById('scroll-hint');
const projectCard  = document.getElementById('project-card');
const cardTitle    = document.getElementById('card-title');
const cardTech     = document.getElementById('card-tech');
const cardDesc     = document.getElementById('card-desc');
const cardLinksEl  = document.getElementById('card-links');
const dotsEl       = document.getElementById('dots');
const streetLabel  = document.getElementById('street-label');

// Build progress dots
const dotEls = [];
PROJECTS.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot';
  dotsEl.appendChild(d);
  dotEls.push(d);
});

let activeProject = -1;

function setActiveProject(index) {
  if (index === activeProject) return;
  activeProject = index;

  dotEls.forEach((d, i) => d.classList.toggle('active', i === index));

  if (index >= 0) {
    const proj = PROJECTS[index];
    cardTitle.textContent = proj.title;
    cardTech.textContent  = proj.tech;
    cardDesc.textContent  = proj.desc;
    cardLinksEl.innerHTML = '';
    const links = proj.links && proj.links.length ? proj.links : [];
    if (links.length) {
      for (const { label, href } of links) {
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = `${label} →`;
        cardLinksEl.appendChild(a);
      }
    } else if (proj.wip) {
      const span = document.createElement('span');
      span.className = 'card-wip';
      span.textContent = 'In development — links coming soon';
      cardLinksEl.appendChild(span);
    }
    projectCard.classList.add('show');
  } else {
    projectCard.classList.remove('show');
  }
}

// ─── Determine which store is closest to camera ───────────────────────────────
// Directional window: show card 12 units before reaching a store, hide 3 units after passing.
// camZ - zPos > 0 → camera approaching; < 0 → camera has passed.
const CARD_LEAD  = 9; // units ahead of store to show card
const CARD_TRAIL =  3; // units past store before hiding card

function getNearestStore(camZ) {
  let closest = -1;
  let bestLead = -Infinity;

  storeObjects.forEach(({ zPos }, i) => {
    const lead = camZ - zPos; // positive = approaching, negative = passed
    if (lead >= -CARD_TRAIL && lead <= CARD_LEAD) {
      // Within the directional window — pick the one whose store is closest ahead
      if (lead > bestLead) {
        bestLead = lead;
        closest = i;
      }
    }
  });

  return closest;
}

// ─── Resume modal — pause WebGL while PDF is open (iframe + PDF are GPU-heavy) ─
const RESUME_PDF_URL = '/Nickolaos-Kontonicolaou_Resume.pdf#view=FitH';
const resumeModal = document.getElementById('resume-modal');
const resumeIframe = document.getElementById('resume-iframe');
const resumeOpenBtn = document.getElementById('resume-open');
const resumeCloseBtn = document.getElementById('resume-close');
const resumeBackdrop = document.getElementById('resume-backdrop');

let sceneRenderEnabled = true;

function updateSceneRenderState() {
  sceneRenderEnabled = !resumeModal.classList.contains('is-open') && !document.hidden;
}

function openResumeModal() {
  resumeModal.classList.add('is-open');
  resumeModal.setAttribute('aria-hidden', 'false');
  resumeIframe.src = RESUME_PDF_URL;
  scrollEl.style.overflow = 'hidden';
  updateSceneRenderState();
}

function closeResumeModal() {
  resumeModal.classList.remove('is-open');
  resumeModal.setAttribute('aria-hidden', 'true');
  resumeIframe.src = 'about:blank';
  scrollEl.style.overflow = '';
  updateSceneRenderState();
}

resumeOpenBtn.addEventListener('click', openResumeModal);
resumeCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeResumeModal();
});
resumeBackdrop.addEventListener('click', closeResumeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && resumeModal.classList.contains('is-open')) {
    closeResumeModal();
  }
});

document.addEventListener('visibilitychange', updateSceneRenderState);

// ─── Animation loop ───────────────────────────────────────────────────────────
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  if (!sceneRenderEnabled) return;

  frame++;

  // Smooth camera movement
  camActual.z += (camTarget.z - camActual.z) * 0.07;
  camActual.y += (camTarget.y - camActual.y) * 0.07;

  camera.position.set(0, camActual.y, camActual.z);

  // Subtle camera sway (walking feel)
  camera.position.y = camActual.y + Math.sin(frame * 0.04) * 0.025;
  camera.rotation.z = Math.sin(frame * 0.04) * 0.003;

  camera.lookAt(0, camActual.y - 0.05, camActual.z - 8);

  // Animate store glow lights
  storeObjects.forEach(({ glowLight }, i) => {
    glowLight.intensity = 0.5 + Math.sin(frame * 0.02 + i) * 0.15;
  });

  // Particles: update every other frame (half the CPU work, same drift speed)
  if ((frame & 1) === 0) {
    const pos = particleGeo.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3 + 1] -= 0.004;
      if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = 12;
    }
    pos.needsUpdate = true;
  }

  // UI updates
  const scrolled = scrollProgress > 0.02;

  namePlate.style.opacity  = scrolled ? '0' : '1';
  scrollHint.style.opacity = scrolled ? '0' : '1';
  dotsEl.classList.toggle('show', scrolled);
  streetLabel.classList.toggle('show', scrolled);

  // Nearest project detection
  const nearest = getNearestStore(camActual.z);
  setActiveProject(nearest);

  renderer.render(scene, camera);
}

animate();

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.setSize(w, h);
});

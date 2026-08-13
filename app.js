const $ = (id) => document.getElementById(id);
const home = $('home');
const arUi = $('arUi');
const status = $('status');
const result = $('result');
const roll = $('roll');
let scene = null;
let die = null;
let target = null;
let rolling = false;
let tracking = false;
let targetBlobUrl = null;
let arStarted = false;

$('qrurl').textContent = location.href;
if (window.QRCode) new QRCode($('qrcode'), { text: location.href, width: 180, height: 180 });

function setStatus(text) { status.textContent = text; }

function loadImage(img) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve(img);
  return new Promise((resolve, reject) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', reject, { once: true });
  });
}

async function compileCustomTarget() {
  // In MindAR 1.2.x the compiler is exposed as MINDAR.IMAGE.Compiler.
  const Compiler = window.MINDAR?.IMAGE?.Compiler;
  if (!Compiler) throw new Error('MindAR compiler did not load. Please refresh and try again.');
  const img = $('targetImage');
  await loadImage(img);
  setStatus('Preparing the DICE AR target…');
  const compiler = new Compiler();
  await compiler.compileImageTargets([img], (progress) => {
    setStatus(`Preparing DICE AR target… ${Math.round(progress * 100)}%`);
  });
  const buffer = await compiler.exportData();
  if (targetBlobUrl) URL.revokeObjectURL(targetBlobUrl);
  targetBlobUrl = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }));
  return targetBlobUrl;
}

function buildScene(targetUrl) {
  const root = $('arRoot');
  scene = document.createElement('a-scene');
  scene.id = 'arScene';
  scene.setAttribute('mindar-image', `imageTargetSrc: ${targetUrl}; autoStart: true; uiLoading: no; uiError: no; uiScanning: no; maxTrack: 1; warmupTolerance: 2; missTolerance: 5`);
  scene.setAttribute('color-space', 'sRGB');
  scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights; alpha: true');
  scene.setAttribute('vr-mode-ui', 'enabled: false');
  scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

  const camera = document.createElement('a-camera');
  camera.setAttribute('position', '0 0 0');
  camera.setAttribute('look-controls', 'enabled: false');

  target = document.createElement('a-entity');
  target.id = 'target';
  target.setAttribute('mindar-image-target', 'targetIndex: 0');
  target.addEventListener('targetFound', () => {
    tracking = true;
    setStatus('DICE AR target found! Tap Roll Dice.');
    roll.classList.remove('hidden');
  });
  target.addEventListener('targetLost', () => {
    tracking = false;
    setStatus('Target lost — point the camera at the DICE AR card again.');
    roll.classList.add('hidden');
  });

  die = document.createElement('a-entity');
  die.id = 'die';
  die.setAttribute('position', '0 0.15 0');
  die.setAttribute('scale', '0.45 0.45 0.45');
  die.innerHTML = `
    <a-box width="0.7" height="0.7" depth="0.7" color="#f5f5f5" material="roughness: 0.25"></a-box>
    <a-text value="1" align="center" color="#111" width="1.5" position="0 0 0.356"></a-text>
    <a-text value="6" align="center" color="#111" width="1.5" position="0 0 -0.356" rotation="0 180 0"></a-text>
    <a-text value="3" align="center" color="#111" width="1.5" position="0.356 0 0" rotation="0 90 0"></a-text>
    <a-text value="4" align="center" color="#111" width="1.5" position="-0.356 0 0" rotation="0 -90 0"></a-text>
    <a-text value="2" align="center" color="#111" width="1.5" position="0 0.356 0" rotation="-90 0 0"></a-text>
    <a-text value="5" align="center" color="#111" width="1.5" position="0 -0.356 0" rotation="90 0 0"></a-text>`;
  target.appendChild(die);
  scene.appendChild(camera);
  scene.appendChild(target);
  root.appendChild(scene);

  scene.addEventListener('arReady', () => setStatus('Point your camera at the printed DICE AR target.'), { once: true });
  scene.addEventListener('arError', () => setStatus('Camera/AR could not start. Allow camera access and reload.'), { once: true });
}

async function startWebAR() {
  if (arStarted) return;
  arStarted = true;
  home.classList.add('hidden');
  arUi.classList.remove('hidden');
  setStatus('Loading WebAR…');
  try {
    const targetUrl = await compileCustomTarget();
    buildScene(targetUrl);
    setStatus('Starting camera…');
  } catch (error) {
    console.error(error);
    setStatus(`Could not prepare WebAR: ${error.message}`);
    arStarted = false;
  }
}

function rollDice() {
  if (!tracking || rolling || !die?.object3D) return;
  rolling = true;
  roll.classList.add('hidden');
  setStatus('Rolling…');
  const n = 1 + Math.floor(Math.random() * 6);
  const start = performance.now();
  const fromX = die.object3D.rotation.x;
  const fromY = die.object3D.rotation.y;
  const fromZ = die.object3D.rotation.z;
  const turnsX = Math.PI * (4 + Math.floor(Math.random() * 3));
  const turnsY = Math.PI * (5 + Math.floor(Math.random() * 3));
  const turnsZ = Math.PI * (3 + Math.floor(Math.random() * 3));
  function animate(now) {
    const p = Math.min(1, (now - start) / 1000);
    const eased = 1 - Math.pow(1 - p, 3);
    die.object3D.rotation.set(fromX + turnsX * eased, fromY + turnsY * eased, fromZ + turnsZ * eased);
    die.object3D.position.y = 0.15 + Math.sin(p * Math.PI) * 0.18;
    if (p < 1) requestAnimationFrame(animate);
    else {
      die.object3D.rotation.set(0, 0, 0);
      die.object3D.position.y = 0.15;
      result.textContent = n;
      setStatus(`You rolled ${n}!`);
      roll.textContent = 'ROLL AGAIN';
      roll.classList.remove('hidden');
      rolling = false;
    }
  }
  requestAnimationFrame(animate);
}

function preview() {
  home.classList.add('hidden');
  arUi.classList.remove('hidden');
  $('previewStage').classList.remove('hidden');
  const d = document.createElement('div');
  d.className = 'preview-die';
  [1, 6, 3, 4, 2, 5].forEach((n, i) => {
    const f = document.createElement('div');
    f.className = ['face front', 'face back', 'face right', 'face left', 'face top', 'face bottom'][i];
    f.textContent = n;
    d.appendChild(f);
  });
  $('previewStage').appendChild(d);
  setStatus('3D preview — tap Roll Dice');
  roll.classList.remove('hidden');
  roll.onclick = () => { result.textContent = 1 + Math.floor(Math.random() * 6); };
}

$('start').onclick = startWebAR;
$('preview').onclick = preview;
roll.onclick = rollDice;
$('exit').onclick = () => location.reload();

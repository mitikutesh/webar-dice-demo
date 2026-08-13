const $ = (id) => document.getElementById(id);
const home = $('home');
const scene = $('arScene');
const arUi = $('arUi');
const status = $('status');
const result = $('result');
const roll = $('roll');
const die = $('die');
const target = $('target');
let rolling = false;
let tracking = false;

$('qrurl').textContent = location.href;
if (window.QRCode) new QRCode($('qrcode'), { text: location.href, width: 180, height: 180 });

function setStatus(text) { status.textContent = text; }

function startWebAR() {
  home.classList.add('hidden');
  scene.classList.remove('hidden');
  arUi.classList.remove('hidden');
  setStatus('Starting camera…');
  const system = scene.systems['mindar-image-system'];
  if (!system) {
    setStatus('WebAR engine failed to load. Check your connection and refresh.');
    return;
  }
  scene.addEventListener('arReady', () => setStatus('Point your camera at the printed AR target.'), { once: true });
  scene.addEventListener('arError', () => setStatus('Camera/AR could not start. Allow camera access and reload.'), { once: true });
  target.addEventListener('targetFound', () => {
    tracking = true;
    setStatus('Target found! Tap Roll Dice.');
    roll.classList.remove('hidden');
  });
  target.addEventListener('targetLost', () => {
    tracking = false;
    setStatus('Target lost — point the camera at the target again.');
    roll.classList.add('hidden');
  });
  system.start();
}

function rollDice() {
  if (!tracking || rolling) return;
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
window.addEventListener('resize', () => scene.components?.['mindar-image']?.resize?.());

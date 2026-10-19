import * as THREE from 'three';
import { createDie, landingQuaternion } from './die-model.mjs';

const button = document.getElementById('dice-display');
const art = document.getElementById('die-art');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
} catch {
  // The accessible SVG die remains usable when WebGL is unavailable.
}
if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'die-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.6, 1.6, 1.6, -1.6, .1, 20);
  camera.position.z = 7;
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const die = createDie();
  scene.add(die);
  let animationFrame = 0;
  let contextLost = false;
  const render = () => { if (!contextLost) renderer.render(scene, camera); };
  const resize = () => {
    const size = button.clientWidth;
    renderer.setSize(size, size, false);
    render();
  };
  const show = value => {
    cancelAnimationFrame(animationFrame);
    die.quaternion.copy(landingQuaternion(value));
    canvas.dataset.value = String(value);
    render();
  };
  const roll = (value, duration) => {
    cancelAnimationFrame(animationFrame);
    if (duration <= 100) { show(value); return; }
    const from = new THREE.Euler().setFromQuaternion(die.quaternion);
    const tumble = new THREE.Quaternion().setFromEuler(new THREE.Euler(from.x + Math.PI * 3, from.y + Math.PI * 4, from.z + Math.PI));
    const target = landingQuaternion(value);
    const start = performance.now();
    const frame = now => {
      const t = Math.min((now - start) / duration, 1);
      if (t < .55) {
        const turn = t / .55;
        die.rotation.set(from.x + Math.PI * 3 * turn, from.y + Math.PI * 4 * turn, from.z + Math.PI * turn);
      } else {
        const settle = Math.min((t - .55) / .2, 1);
        die.quaternion.slerpQuaternions(tumble, target, 1 - (1 - settle) ** 3);
      }
      render();
      if (t < 1 && !contextLost) animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
  };
  window.rollFiveDie = { show, roll };
  button.append(canvas);
  resize();
  show(Number(art.getAttribute('data-value')) || 6);
  button.classList.add('has-3d');
  new ResizeObserver(resize).observe(button);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(animationFrame);
    button.classList.remove('has-3d');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    show(Number(art.getAttribute('data-value')) || 6);
    button.classList.add('has-3d');
  });
}

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const faces = [
  { value: 6, rotation: [0, 0, 0], normal: [0, 0, 1] },
  { value: 1, rotation: [0, Math.PI, 0], normal: [0, 0, -1] },
  { value: 4, rotation: [0, Math.PI / 2, 0], normal: [1, 0, 0] },
  { value: 3, rotation: [0, -Math.PI / 2, 0], normal: [-1, 0, 0] },
  { value: 2, rotation: [-Math.PI / 2, 0, 0], normal: [0, 1, 0] },
  { value: 5, rotation: [Math.PI / 2, 0, 0], normal: [0, -1, 0] }
];
const patterns = {
  1: [5], 2: [1, 9], 3: [1, 5, 9],
  4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9]
};
const restingTilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(.22, -.32, .035));

export function landingQuaternion(value) {
  const face = faces.find(face => face.value === value);
  if (!face) throw new RangeError('A die result must be from 1 to 6');
  const align = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...face.normal), new THREE.Vector3(0, 0, 1));
  return restingTilt.clone().multiply(align);
}

export function createDie() {
  const die = new THREE.Group();
  const geometry = new RoundedBoxGeometry(2, 2, 2, 6, .22);
  const ink = new THREE.MeshBasicMaterial({ color: 0x100e0d });
  const outline = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x100e0d, side: THREE.BackSide }));
  outline.scale.setScalar(1.035);
  die.add(outline);
  const body = new THREE.Mesh(geometry, new THREE.MeshToonMaterial({ color: 0xffffff }));
  die.add(body);
  const pipGeometry = new THREE.CircleGeometry(.145, 40);
  for (const face of faces) {
    const group = new THREE.Group();
    group.userData.value = face.value;
    group.rotation.set(...face.rotation);
    for (const position of patterns[face.value]) {
      const pip = new THREE.Mesh(pipGeometry, ink);
      pip.position.set(((position - 1) % 3 - 1) * .48, (1 - Math.floor((position - 1) / 3)) * .48, 1.003);
      group.add(pip);
    }
    die.add(group);
  }
  die.quaternion.copy(landingQuaternion(6));
  return die;
}

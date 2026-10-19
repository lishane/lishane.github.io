import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDie, faces, landingQuaternion } from '../src/die-model.mjs';

const die = createDie();
const numberedFaces = die.children.filter(child => child.userData.value);
assert.equal(numberedFaces.length, 6);
for (const face of numberedFaces) {
  assert.equal(face.children.length, face.userData.value, 'each fixed face has its correct number of pips');
}
for (const face of faces) {
  const opposite = faces.find(other => new THREE.Vector3(...face.normal).dot(new THREE.Vector3(...other.normal)) < -.99);
  assert.equal(face.value + opposite.value, 7);
  const landing = landingQuaternion(face.value);
  const facing = faces.map(other => ({
    value: other.value,
    score: new THREE.Vector3(...other.normal).applyQuaternion(landing).z
  })).sort((a,b) => b.score-a.score);
  assert.equal(facing[0].value, face.value, 'the winning physical face must face the camera');
  assert(facing[0].score > .9, 'the winner stays almost face-on for readability');
  assert(facing[0].score > facing[1].score*2.5, 'side faces must not compete with the result');
}
assert.throws(() => landingQuaternion(0), RangeError);
assert.throws(() => landingQuaternion(7), RangeError);
console.log('PASS: six physical faces, correct fixed pips/opposites, and an unambiguous winning face for every 3D landing.');

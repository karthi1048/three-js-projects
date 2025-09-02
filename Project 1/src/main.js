import './style.css'

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const width = window.innerWidth;
const height = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias : true });
renderer.setSize(width, height);

document.body.appendChild(renderer.domElement); // this is the canvas element

const fov = 75;    // 75deg Field-of-view
const aspect = width / height;
const near = 0.1;  // Anything closer to camera than 0.1 units wil be invisible.
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const geometry = new THREE.IcosahedronGeometry(1.0, 2);
const material = new THREE.MeshStandardMaterial({
  color : 0xffffff,
  flatShading : true
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe : true
});
const wireMesh = new THREE.Mesh(geometry, wireMat);
wireMesh.scale.setScalar(1.001);
// wireMesh is added as a child to mesh
mesh.add(wireMesh);

const light = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(light);

function animate(t=0) {
  requestAnimationFrame(animate);  // API that helps animation
  // mesh.scale.setScalar(Math.cos(t*0.001 + 1.0));
  // mesh.rotation.y = t*0.0001;
  renderer.render(scene, camera);
  controls.update();
}

animate();
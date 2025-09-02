import './style.css'
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import getStarfield from "./getStarfield.js";
import { getFresnelMat } from "./getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);

document.body.appendChild(renderer.domElement);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

new OrbitControls(camera, renderer.domElement);

// To emulate planet properties separately in a group
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;  // axial tilt of planet
scene.add(earthGroup)

const loader = new THREE.TextureLoader();  // Used to load & map texture images on a object
const geometry = new THREE.IcosahedronGeometry(1, 12);

// Material when light touches
const earthMat = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthMap1k.jpg"),
  specularMap: loader.load("./textures/02_earthSpec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthBump1k.jpg"),
  bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(geometry, earthMat);
earthGroup.add(earthMesh);

// Material when light not touches
const lightMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthLights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightMesh = new THREE.Mesh(geometry, lightMat);
earthGroup.add(lightMesh);

const cloudMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthCloudMap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthCloudMapTrans.jpg'),
  // alphaTest: 0.3,
});
const cloudMesh = new THREE.Mesh(geometry, cloudMat);
cloudMesh.scale.setScalar(1.003);
earthGroup.add(cloudMesh);

const fresnelMat = getFresnelMat();
const fresnelMesh = new THREE.Mesh(geometry, fresnelMat);
fresnelMesh.scale.setScalar(1.01);
earthGroup.add(fresnelMesh);

// adding stars using custom module file
const stars = getStarfield({ numStars: 1000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.002;
  lightMesh.rotation.y += 0.002;
  cloudMesh.rotation.y += 0.0023;
  fresnelMesh.rotation.y += 0.002;

  renderer.render(scene, camera);
}

animate();

// helps us to resize the camera as the window changes
function handleWindowResize () {
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', handleWindowResize, false);
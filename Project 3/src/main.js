import './style.css'
import spline from "./spline.js";
import * as THREE from "three";
// These 3 imports for Glow effect
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Spline is a representation of line in a 3D space, which is the basis for Tube geometry.

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;

// Adds fog like look to scene by reducing visibility to camera long-range
scene.fog = new THREE.FogExp2(0x000000, 0.3);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// post-processing the scene with bloom effect
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 3.5;
bloomPass.radius = 0;
// create a new effect composer that uses renderer
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Example line geometry from the spline for visualization
// const points = spline.getPoints(100);
// const geometry = new THREE.BufferGeometry().setFromPoints(points);
// const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const line = new THREE.Line(geometry, material);
// scene.add(line);

// Creating tube geometry from the spline
// Parameters: path, tubularSegments = divisions along length, radius, radialSegments = divisions along radius, closed
const tubeGeo = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);

// Creating edges geometry from spline for the tubeGeo
const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
const tubeLines = new THREE.LineSegments(edges, lineMat);          // determines which line segments to render based on the "edges"
// NOTE: tubeLines is the Mesh here
scene.add(tubeLines);

// Random Boxes
const numBoxes = 50;
const size = 0.075;
const boxGeo = new THREE.BoxGeometry(size, size, size);
// Box is going look like box helper
for (let i = 0; i < numBoxes; i += 1) {

    // Grabbing the point, all along it & evenly spaced then offsetting it by modulo to get number between 0 & 1
    const p = (i / numBoxes + Math.random() * 0.1) % 1;
    // Use that position along that point, offset by little randomness.
    const pos = tubeGeo.parameters.path.getPointAt(p);
    pos.x += Math.random() - 0.4;
    pos.z += Math.random() - 0.4;
    // Add random rotation for that box for 3 points in vector
    const rotate = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    // using edge geometry for boxes
    const edges = new THREE.EdgesGeometry(boxGeo, 0.2);

    // Box color will also change in loop (red to purple) using the points(p) for the hue
    const color = new THREE.Color().setHSL(0.7 - p, 1, 0.5);
    const lineMat = new THREE.LineBasicMaterial({ color });
    const boxLines = new THREE.LineSegments(edges, lineMat);    // Mesh
    // setting the position & rotation for the box to add it to scene
    boxLines.position.copy(pos);
    boxLines.rotation.set(rotate.x, rotate.y, rotate.z);
    scene.add(boxLines);
}

// For camera fly through
function updateCamera(t) {
    const time = t * 0.1;
    const loopTime = 10 * 1000;                 // total time for full loop
    const p = (time % loopTime) / loopTime;     // grab a point(p) along the spline between 0 & 1
    const pos = tubeGeo.parameters.path.getPointAt(p);                    // get the position on that spline based on 'p'
    const lookAt = tubeGeo.parameters.path.getPointAt((p + 0.03) % 1);    // get the position upto which camera will look
    camera.position.copy(pos);                                            // move to that position
    camera.lookAt(lookAt);                                                // look at the position which is slightly ahead from 'p'
}

// t is the timestamp for that frame
function animate(t = 0) {
    requestAnimationFrame(animate);
    updateCamera(t);
    composer.render(scene, camera);     // uses the composer for rendering
    controls.update();
}

animate();

function handleWindowResize() {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}
window.addEventListener('resize', handleWindowResize, false);

// IMPROVEMENTS TO CONSIDER
// - Different geometries inside, load models, Or other primitives
// - Animate things inside or load animated model, move it along with camera
// - Experiment with look of the tube, work with "Shaders".
// - Use lights.
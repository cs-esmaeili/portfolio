// import * as THREE from 'three';
// import { initLight } from './lights'
// import { createCamera } from './camera'
// import { loadGLTF } from './loader';
// import { initControls } from './controls'
// import { setupEvents } from './events'
// import { initRenderer } from './renderer'

// const canvas = document.getElementById("experience-canvas");

// let { width, height, aspect } = {
//     width: window.innerWidth,
//     height: window.innerHeight,
//     aspect: window.innerWidth / window.innerHeight
// }
// const intersectObjectsNames = ["tablo1", "tablo2", "tablo3"];
// const intersectObjects = [];
// let intersectObject = null;
// let zamin = null;

// let character = { instance: null, boundingBox: null, moveDistance: 7, jumpHeight: 5, isMoving: false, moveDuration: 0.2 };

// const scene = new THREE.Scene();
// const camera = createCamera(aspect);
// initLight(scene);

// loadGLTF(scene,intersectObjectsNames,intersectObjects,
//     ()=> {
//         if (character.boundingBox) {
//             const boxHelper = new THREE.Box3Helper(character.boundingBox, 0x00ff00); // سبز
//             scene.add(boxHelper);
//         }
//     },
//     character,zamin
// )


// const controls = initControls(camera, canvas);
// const renderer = initRenderer(canvas, width, height);
// const raycaster = new THREE.Raycaster();
// const pointer = new THREE.Vector2();


// setupEvents(camera, renderer, pointer, width, height, aspect,
//     () => intersectObject,
//     () => character,
//     (newCharacter) => character = newCharacter,
//     scene,
//     () => zamin
// );

// const animate = () => {

//     raycaster.setFromCamera(pointer, camera);
//     const intersects = raycaster.intersectObjects(intersectObjects);

//     if (intersects.length > 0) {
//         document.body.style.cursor = "pointer";
//         if (intersectObject != intersects[0].object.parent)
//             intersectObject = intersects[0].object.parent;
//     } else {
//         document.body.style.cursor = "default";
//         intersectObject = null;
//     }

//     controls.update();
//     renderer.render(scene, camera);
// }
// renderer.setAnimationLoop(animate);


import * as THREE from 'three';
const RAPIER = await import('@dimforge/rapier3d');
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const canvas = document.getElementById("experience-canvas");
import { loadGLTF } from './loader';
import { initLight } from './lights';
import { createRapierDebugRenderer } from './rapierDebug';

// ---------- Rapier world setup ----------
const gravity = { x: 0, y: -9.81, z: 0 };
const world = new RAPIER.World(gravity);

// Static ground collider
const groundColliderDesc = RAPIER.ColliderDesc.cuboid(5, 0.1, 5);
world.createCollider(groundColliderDesc);

// ---------- Three.js scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 10);

const controls = new OrbitControls(camera, canvas);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
initLight(scene);

const intersectObjectsNames = ["tablo1", "tablo2", "tablo3"];
const intersectObjects = [];
let intersectObject = null;
let zamin = null;
let character = { instance: null, boundingBox: null, body: null, moveDistance: 7, jumpHeight: 5, isMoving: false, moveDuration: 0.2 };

let charBody = null;
let debugRenderer = null;

loadGLTF(scene, intersectObjectsNames, intersectObjects, () => {
    // Bounding box دقیق
    const boundingBox = new THREE.Box3().setFromObject(character.instance, true);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    const halfX = size.x / 2;
    const halfY = size.y / 2;
    const halfZ = size.z / 2;

    // Rigid body در مرکز اصلی
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(center.x, center.y, center.z);
    const charBody = world.createRigidBody(bodyDesc);

    // ✅ offsetY برای پایین بردن Collider بدون جابه‌جایی Body
    const offsetY = size.y * 0.1; // اینو به دلخواهت تست کن

    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfX, halfY, halfZ)
        .setTranslation(0, -offsetY, 0); // فقط کلایدر میاد پایین

    world.createCollider(colliderDesc, charBody);

    // ذخیره
    character.body = charBody;


    // Debug renderer
    debugRenderer = createRapierDebugRenderer(world, scene, RAPIER);
}, character, zamin);

// ---------- Animation loop ----------
function animate() {
    requestAnimationFrame(animate);

    if (debugRenderer) debugRenderer.update();

    world.step();

    if (character.body && character.instance) {
        const pos = character.body.translation();
        const rot = character.body.rotation();

        character.instance.position.set(pos.x, pos.y, pos.z);
        character.instance.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();


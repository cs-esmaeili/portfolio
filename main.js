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
// import { setupEvents } from './events'

// ---------- Rapier world setup ----------
const gravity = { x: 0, y: -9.81, z: 0 };
const world = new RAPIER.World(gravity);

// ---------- Three.js scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 155);

const controls = new OrbitControls(camera, canvas);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
initLight(scene);

const intersectObjectsNames = ["tablo1", "tablo2", "tablo3"];
const intersectObjects = [];
let intersectObject = null;
let zamin = { instance: null };
let character = { instance: null, boundingBox: null, body: null, moveDistance: 7, jumpHeight: 5, isMoving: false, moveDuration: 0.2 };

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

    // Rigid body برای کاراکتر
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(center.x, center.y, center.z);
    const charBody = world.createRigidBody(bodyDesc);

    // offsetY برای پایین بردن کلایدر
    const offsetY = size.y * 0.1;
    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfX, halfY, halfZ)
        .setTranslation(0, -offsetY, 0);

    world.createCollider(colliderDesc, charBody);
    character.body = charBody;

    // ------------------ ✅ ساخت کلایدر دقیق زمین (trimesh) ------------------
    zamin.instance.traverse((child) => {
        if (child.isMesh && child.geometry) {
            let geo = child.geometry.clone();
            geo.applyMatrix4(child.matrixWorld); // اعمال ترنسفورم کامل

            geo = geo.toNonIndexed(); // تبدیل به NonIndexed برای دسترسی راحت‌تر

            const posAttr = geo.attributes.position;
            const vertices = [];
            for (let i = 0; i < posAttr.count; i++) {
                vertices.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            }

            const indices = [];
            for (let i = 0; i < posAttr.count; i++) {
                indices.push(i);
            }

            const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
                .setTranslation(0, 0, 0); // چون از قبل transform اعمال شده

            world.createCollider(colliderDesc);

            console.log("✅ Trimesh collider created for ground mesh:", child.name);
        }
    });
    // ------------------------------------------------------------------------

    // ✅ Debug renderer with ground object passed
    debugRenderer = createRapierDebugRenderer(world, scene, RAPIER, zamin.instance);
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
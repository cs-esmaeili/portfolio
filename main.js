import * as THREE from 'three';
const RAPIER = await import('@dimforge/rapier3d');
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadGLTF } from './loader';
import { initLight } from './lights';
import { createRapierDebugRenderer } from './rapierDebug';
import { setupEvents } from './events'
import { createCamera } from './camera';

// ---------- Configuration ----------
const CONFIG = {
    canvas: document.getElementById("experience-canvas"),
    intersectObjectsNames: ["tablo1", "tablo2", "tablo3"], // Add more tablo objects here
    gravity: { x: 0, y: -9.81, z: 0 },
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 100, z: 155 }
    },
    character: {
        startPosition: { x: 0, y: 25, z: 25 },
        moveDistance: 7,
        jumpHeight: 5,
        moveDuration: 0.2
    }
};

// ---------- Global Variables ----------
let world, scene, camera, controls, renderer, debugRenderer;
let intersectObjects = [];
let intersectObject = null;
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();

let { width, height, aspect } = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight
}

// Game objects
let character = {
    instance: null,
    boundingBox: null,
    body: null,
    moveDistance: CONFIG.character.moveDistance,
    jumpHeight: CONFIG.character.jumpHeight,
    isMoving: false,
    moveDuration: CONFIG.character.moveDuration
};

let zamin = { instance: null };

// ---------- Initialization Functions ----------
function initPhysics() {
    world = new RAPIER.World(CONFIG.gravity);
    console.log('✅ Physics world initialized');
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    console.log('✅ Scene initialized');
}


function initControls() {
    controls = new OrbitControls(camera, CONFIG.canvas);
    console.log('✅ Controls initialized');
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ canvas: CONFIG.canvas });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    console.log('✅ Renderer initialized');
}


function initDebugRenderer() {
    debugRenderer = createRapierDebugRenderer(world, scene, RAPIER);
    console.log('✅ Debug renderer initialized');
}


// ---------- Character Physics Setup ----------
function setupCharacterPhysics() {
    if (!character.instance) {
        console.warn('Character instance not found for physics setup');
        return;
    }

    // Calculate bounding box
    const boundingBox = new THREE.Box3().setFromObject(character.instance, true);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    // Create physics body
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(center.x, center.y, center.z);
    const charBody = world.createRigidBody(bodyDesc);

    // Create collider with slight offset
    const halfX = size.x / 2;
    const halfY = size.y / 2;
    const halfZ = size.z / 2;
    const offsetY = size.y * 0.1;

    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfX, halfY, halfZ)
        .setTranslation(0, -offsetY, 0);

    world.createCollider(colliderDesc, charBody);
    character.body = charBody;

    console.log('✅ Character physics body created');
}

// ---------- Raycasting ----------
function handleRaycasting() {
    if (intersectObjects.length === 0) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(intersectObjects, true);

    if (intersects.length > 0) {
        document.body.style.cursor = "pointer";
        const newIntersectObject = intersects[0].object.parent;

        if (intersectObject !== newIntersectObject) {
            intersectObject = newIntersectObject;
            // You can add hover effects here
        }
    } else {
        document.body.style.cursor = "default";
        intersectObject = null;
    }
}

// ---------- Animation Loop ----------
function animate() {
    requestAnimationFrame(animate);

    // Update physics
    world.step();

    // Update debug renderer
    if (debugRenderer) {
        debugRenderer.update();
    }

    // Update character position from physics
    if (character.body && character.instance) {
        const pos = character.body.translation();
        const rot = character.body.rotation();

        character.instance.position.set(pos.x, pos.y, pos.z);
        character.instance.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }

    // Handle raycasting
    handleRaycasting();

    // Update controls and render
    controls.update();
    renderer.render(scene, camera);
}


// ---------- Main Initialization ----------
function init() {
    console.log('🚀 Initializing application...');

    // Initialize core systems
    initPhysics();
    initScene();
    camera = createCamera(aspect);
    initControls();
    initRenderer();
    initLight(scene);
    initDebugRenderer();

    setupEvents(camera, renderer, pointer, width, height, aspect,
        () => intersectObject,
        () => character.body,
        (newCharacter) => character = newCharacter,
    );

    // Load GLTF models
    loadGLTF(
        scene,
        CONFIG.intersectObjectsNames,
        intersectObjects,
        onLoadComplete,
        character,
        zamin,
        world,
        RAPIER,
        debugRenderer
    );
}

function onLoadComplete() {
    console.log('🎉 All models loaded successfully');

    // Setup character physics after models are loaded
    setupCharacterPhysics();

    // Start animation loop
    animate();

    console.log('✅ Application fully initialized');
}

// ---------- Start Application ----------
init();
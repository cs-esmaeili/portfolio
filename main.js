import * as THREE from 'three';
import { initLight } from './lights'
import { createCamera } from './camera'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHHelper } from 'three-mesh-bvh';
import { initControls } from './controls'
import { setupEvents } from './events'
import { initRenderer } from './renderer'

const canvas = document.getElementById("experience-canvas");

let { width, height, aspect } = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight
}
const intersectObjectsNames = ["tablo1", "tablo2", "tablo3"];
const intersectObjects = [];
let intersectObject = null;
let zamin = null;

let character = { instance: null, boundingBox: null, moveDistance: 7, jumpHeight: 5, isMoving: false, moveDuration: 0.2 };

const scene = new THREE.Scene();
const camera = createCamera(aspect);
initLight(scene);


const loader = new GLTFLoader();
loader.load('./blender/export.glb',
    (glb) => {
        glb.scene.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;

            if (intersectObjectsNames.includes(child.name)) {
                intersectObjects.push(child);
            }

            if (child.name === "character") {
                character.instance = child;
                character.boundingBox = new THREE.Box3().setFromObject(child);
            }
            if (child.name === "zamin") {
                zamin = child;
                child.traverse(mesh => {
                    if (mesh.isMesh) {
                        mesh.geometry.computeBoundsTree = computeBoundsTree;
                        mesh.geometry.disposeBoundsTree = disposeBoundsTree;
                        mesh.raycast = acceleratedRaycast;

                        mesh.geometry.computeBoundsTree();

                        const visualizer = new MeshBVHHelper(mesh, 10);
                        scene.add(visualizer);
                    }
                });
            }
        });
        scene.add(glb.scene);
        if (character.boundingBox) {
            const boxHelper = new THREE.Box3Helper(character.boundingBox, 0x00ff00); // سبز
            scene.add(boxHelper);
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error(error);
    }
);


const controls = initControls(camera, canvas);
const renderer = initRenderer(canvas, width, height);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


setupEvents(camera, renderer, pointer, width, height, aspect,
    () => intersectObject,
    () => character,
    (newCharacter) => character = newCharacter,
    scene,
    () => zamin
);

const animate = () => {

    if (character.instance && character.boundingBox) {
        character.boundingBox.setFromObject(character.instance);
    }

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(intersectObjects);

    if (intersects.length > 0) {
        document.body.style.cursor = "pointer";
        if (intersectObject != intersects[0].object.parent)
            intersectObject = intersects[0].object.parent;
    } else {
        document.body.style.cursor = "default";
        intersectObject = null;
    }

    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
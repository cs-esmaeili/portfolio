import * as THREE from 'three';
import { initLight } from './lights'
import { createCamera } from './camera'
import { loadGLTF } from './loader'
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
let character = { instance: null, moveDistance:7, jumpHeight: 5, isMoving: false, moveDuration: 0.2 };

const scene = new THREE.Scene();
const camera = createCamera(aspect);
initLight(scene);

loadGLTF(scene, intersectObjectsNames, intersectObjects, () => {
    console.log("compelete");
}, character);

const controls = initControls(camera, canvas);
const renderer = initRenderer(canvas, width, height);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


setupEvents(camera, renderer, pointer, width, height, aspect,
    () => intersectObject,
    () => character,
    (newCharacter) => character = newCharacter
);

const animate = () => {

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
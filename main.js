import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.getElementById("experience-canvas");

let { width, height, aspect } = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspect: window.innerWidth / window.innerHeight
}


const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000);
// const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
camera.position.set(-130.3280648196836, 109.50533110356795, 174.44622076887495);





const initLight = () => {
    const ambientLight = new THREE.AmbientLight(0x404040, 30);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF ,4);
    directionalLight.castShadow = true;
    directionalLight.position.set(-50, 250, -180);
    directionalLight.shadow.camera.left = -250;
    directionalLight.shadow.camera.right = 250;
    directionalLight.shadow.camera.top = 250;
    directionalLight.shadow.camera.bottom = -250;
    directionalLight.shadow.normalBias = 2;

    directionalLight.shadow.mapSize.set(4096, 4096);
    scene.add(directionalLight);

    const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(shadowHelper);

    const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(helper);

}
initLight();




const loader = new GLTFLoader();

loader.load('./blender/export.glb',
    (glb) => {
        scene.add(glb.scene);
        glb.scene.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
        })
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error(error);

    });



const controls = new OrbitControls(camera, canvas);
controls.update();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1;
// renderer.toneMapping = THREE.ACESFilmicToneMapping;

const animate = () => {

    controls.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);


const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const aspect = width / height;

    camera.aspect = aspect;
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener("resize", onResize);
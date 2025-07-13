import * as THREE from 'three';

export const initLight = (scene) => {
    const ambientLight = new THREE.AmbientLight(0x404040, 30);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 4);
    directionalLight.castShadow = true;
    directionalLight.position.set(-50, 250, -180);
    directionalLight.shadow.camera.left = -250;
    directionalLight.shadow.camera.right = 250;
    directionalLight.shadow.camera.top = 250;
    directionalLight.shadow.camera.bottom = -250;
    directionalLight.shadow.normalBias = 2;

    directionalLight.shadow.mapSize.set(4096, 4096);
    scene.add(directionalLight);

    // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // scene.add(shadowHelper);

    // const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
    // scene.add(helper);

}
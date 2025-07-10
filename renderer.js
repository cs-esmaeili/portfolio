import * as THREE from 'three';

export const initRenderer= (canvas, width, height) => {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1;

    return renderer;
}
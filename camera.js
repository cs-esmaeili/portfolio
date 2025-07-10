import * as THREE from 'three';

export const createCamera = (aspect) => {
    const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000);
    camera.position.set(-130.328, 109.505, 174.446);
    return camera;
};

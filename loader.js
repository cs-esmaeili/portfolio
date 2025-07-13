import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const loadGLTF = (scene, intersectObjectsNames, intersectObjects, onComplete, character, zamin) => {
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
                }
            });
            scene.add(glb.scene);
            onComplete();
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error(error);
        }
    );
};

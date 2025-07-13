import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

export const loadGLTF = (scene, intersectObjectsNames, intersectObjects, onComplete, character, zamin) => {
    const loader = new GLTFLoader();

    loader.load('./blender/export.glb',
        (glb) => {
            let characterGroup = null;

            glb.scene.traverse((child) => {
                if (child.name === "character") {
                    characterGroup = child;
                }
            });

            if (characterGroup) {
                // اضافه به صحنه
                scene.add(characterGroup);

                // Scale و موقعیت
                characterGroup.scale.set(0.1, 0.1, 0.1);
                characterGroup.position.set(0, 2, 3);

                // آپدیت کامل ماتریس
                characterGroup.updateWorldMatrix(true, true);

                // Bounding box دقیق بعد از scale و pos
                const box = new THREE.Box3().setFromObject(characterGroup,true);

                character.boundingBox = box;
                character.instance = characterGroup;

                console.log('Character group added:', characterGroup);
            } else {
                console.warn('Character group not found!');
            }

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

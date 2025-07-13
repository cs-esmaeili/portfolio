import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

export const loadGLTF = (scene, intersectObjectsNames, intersectObjects, onComplete, character, zamin) => {
    const loader = new GLTFLoader();

    loader.load('./blender/export.glb',
        (glb) => {
            let characterGroup = null;
            let groundGroup = null;
            let others = [];

            glb.scene.traverse((child) => {
                if (child.name === "character") {
                    characterGroup = child;
                } else if (child.name === "zamin") {  // فرض نام گروه ground "zamin" است
                    groundGroup = child;
                } else {
                    others.push[child];
                }
            });

            if (characterGroup) {
                scene.add(characterGroup);
                // characterGroup.scale.set(0.1, 0.1, 0.1);
                characterGroup.position.set(0, 25, 25);
                characterGroup.updateWorldMatrix(true, true);

                character.boundingBox = new THREE.Box3().setFromObject(characterGroup, true);
                character.instance = characterGroup;

                console.log('Character group added:', characterGroup);
            } else {
                console.warn('Character group not found!');
            }

            if (groundGroup) {
                scene.add(groundGroup);
                // groundGroup.scale.set(0.1, 0.1, 0.1); // مثل character، اگر لازم هست
                groundGroup.position.set(0, 0, 0);    // تنظیم موقعیت زمین

                groundGroup.updateWorldMatrix(true, true);

                zamin.instance = groundGroup;

                console.log('Ground group added:', groundGroup);
            } else {
                console.warn('Ground group not found!');
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

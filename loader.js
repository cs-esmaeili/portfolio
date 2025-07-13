import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

export const loadGLTF = (scene, intersectObjectsNames, intersectObjects, onComplete, character, zamin, world, RAPIER, debugRenderer) => {
    const loader = new GLTFLoader();

    loader.load('./blender/export.glb',
        (glb) => {
            const loadedObjects = {
                character: null,
                zamin: null,
                tablos: []
            };

            // Categorize objects
            glb.scene.traverse((child) => {
                if (child.name === "character") {
                    loadedObjects.character = child;
                } else if (child.name === "zamin") {
                    loadedObjects.zamin = child;
                } else if (intersectObjectsNames.includes(child.name)) {
                    loadedObjects.tablos.push(child);
                    intersectObjects.push(child); // Add to intersect objects array
                }
            });

            // Setup character
            setupCharacter(loadedObjects.character, scene, character);

            // Setup ground (zamin)
            setupGround(loadedObjects.zamin, scene, zamin, world, RAPIER, debugRenderer);

            // Setup tablo objects
            setupTablos(loadedObjects.tablos, scene, world, RAPIER, debugRenderer);

            onComplete();
        },
        (xhr) => {
            console.log(`Loading progress: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('Error loading GLTF:', error);
        }
    );
};

function setupCharacter(characterGroup, scene, character) {
    if (!characterGroup) {
        console.warn('Character group not found in GLTF!');
        return;
    }

    scene.add(characterGroup);
    characterGroup.position.y = 25;
    characterGroup.updateWorldMatrix(true, true);

    character.boundingBox = new THREE.Box3().setFromObject(characterGroup, true);
    character.instance = characterGroup;

    console.log('✅ Character loaded and positioned');
}

function setupGround(groundGroup, scene, zamin, world, RAPIER, debugRenderer) {
    if (!groundGroup) {
        console.warn('Ground group not found in GLTF!');
        return;
    }

    scene.add(groundGroup);
    groundGroup.updateWorldMatrix(true, true);

    zamin.instance = groundGroup;

    // Create physics collider for ground
    createTrimeshCollider(groundGroup, world, RAPIER, 'ground');

    // Add debug wireframe for ground
    if (debugRenderer) {
        debugRenderer.addGroundWireframe(groundGroup);
    }

    console.log('✅ Ground loaded with physics collider');
}

function setupTablos(tabloObjects, scene, world, RAPIER, debugRenderer) {
    if (tabloObjects.length === 0) {
        console.warn('No tablo objects found in GLTF!');
        return;
    }

    tabloObjects.forEach((tabloObject) => {
        scene.add(tabloObject);
        tabloObject.updateWorldMatrix(true, true);

        // Create physics collider for tablo
        createTrimeshCollider(tabloObject, world, RAPIER, 'tablo');

        // Add debug wireframe for tablo
        if (debugRenderer) {
            debugRenderer.addTabloWireframe(tabloObject);
        }

        console.log(`✅ Tablo object '${tabloObject.name}' loaded with physics collider`);
    });
}

function createTrimeshCollider(object, world, RAPIER, type = 'static') {
    if (!object || !world || !RAPIER) {
        console.error('Missing required parameters for trimesh collider creation');
        return;
    }

    let colliderCount = 0;

    object.traverse((child) => {
        if (child.isMesh && child.geometry) {
            try {
                // Clone and prepare geometry
                let geometry = child.geometry.clone();
                geometry.applyMatrix4(child.matrixWorld);
                geometry = geometry.toNonIndexed();

                // Extract vertices
                const positionAttribute = geometry.attributes.position;
                const vertices = [];
                for (let i = 0; i < positionAttribute.count; i++) {
                    vertices.push(
                        positionAttribute.getX(i),
                        positionAttribute.getY(i),
                        positionAttribute.getZ(i)
                    );
                }

                // Create indices
                const indices = [];
                for (let i = 0; i < positionAttribute.count; i++) {
                    indices.push(i);
                }

                // Create collider
                const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices)
                    .setTranslation(0, 0, 0);

                world.createCollider(colliderDesc);
                colliderCount++;

                console.log(`✅ Trimesh collider created for ${type} mesh: ${child.name}`);
            } catch (error) {
                console.error(`Failed to create trimesh collider for ${child.name}:`, error);
            }
        }
    });

    console.log(`✅ Total ${colliderCount} trimesh colliders created for ${type}: ${object.name}`);
}
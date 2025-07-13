import * as THREE from 'three';

export function createRapierDebugRenderer(world, scene, RAPIER) {
    const colliderMeshes = new Map(); // Map to track collider -> mesh pairs
    const staticObjectWireframes = []; // Array to store wireframes for static objects

    function createColliderMesh(collider) {
        const shapeType = collider.shapeType();
        let mesh;
        let material;

        // Different colors for different types
        if (shapeType === RAPIER.ShapeType.Cuboid) {
            material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }); // Red for character
            const he = collider.halfExtents();
            const geometry = new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2);
            mesh = new THREE.Mesh(geometry, material);

        } else if (shapeType === RAPIER.ShapeType.Ball) {
            material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }); // Green for balls
            const radius = collider.radius();
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            mesh = new THREE.Mesh(geometry, material);

        } else if (shapeType === RAPIER.ShapeType.TriMesh) {
            material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }); // Blue for trimesh
            
            // Create a simple box as placeholder for trimesh visualization
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            mesh = new THREE.Mesh(geometry, material);
            
            // Position it at the collider's position
            const pos = collider.translation();
            mesh.position.set(pos.x, pos.y, pos.z);
            
        } else {
            console.warn("Unsupported shape type for debug renderer:", shapeType);
            return null;
        }

        return mesh;
    }

    function addWireframeForObject(object, color = 0x00ffff) {
        if (!object) return;

        object.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const wireframeGeometry = new THREE.WireframeGeometry(child.geometry.clone());
                const wireframeMaterial = new THREE.LineBasicMaterial({ color });
                const wireframeLine = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                
                // Apply the complete transform
                wireframeLine.applyMatrix4(child.matrixWorld);
                
                scene.add(wireframeLine);
                staticObjectWireframes.push(wireframeLine);
                
                // console.log(`Added wireframe for mesh: ${child.name} in object: ${object.name}`);
            }
        });
    }

    function scanAndUpdateColliders() {
        const currentColliders = new Set();

        // Scan all colliders in the world
        world.forEachCollider((collider) => {
            const colliderHandle = collider.handle;
            currentColliders.add(colliderHandle);

            // If this collider doesn't have a mesh yet, create one
            if (!colliderMeshes.has(colliderHandle)) {
                const mesh = createColliderMesh(collider);
                if (mesh) {
                    scene.add(mesh);
                    colliderMeshes.set(colliderHandle, mesh);
                    // console.log(`Added debug mesh for collider type: ${collider.shapeType()}`);
                }
            }
        });

        // Remove meshes for colliders that no longer exist
        for (const [handle, mesh] of colliderMeshes) {
            if (!currentColliders.has(handle)) {
                scene.remove(mesh);
                colliderMeshes.delete(handle);
                console.log(`Removed debug mesh for deleted collider`);
            }
        }
    }

    function update() {
        // Check for new colliders and update existing ones
        scanAndUpdateColliders();

        // Update positions of dynamic colliders
        world.forEachCollider((collider) => {
            const mesh = colliderMeshes.get(collider.handle);
            if (mesh) {
                const shapeType = collider.shapeType();
                
                // TriMesh colliders are usually static, so we don't need to update their position
                if (shapeType !== RAPIER.ShapeType.TriMesh) {
                    const pos = collider.translation();
                    const rot = collider.rotation();
                    mesh.position.set(pos.x, pos.y, pos.z);
                    mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
                }
            }
        });
    }

    // Public methods
    return {
        update,
        addWireframeForObject,
        
        // Method to add wireframe for ground (zamin)
        addGroundWireframe: (zaminObject) => {
            addWireframeForObject(zaminObject, 0x00ffff); // Cyan for ground
        },
        
        // Method to add wireframe for tablo objects
        addTabloWireframe: (tabloObject) => {
            addWireframeForObject(tabloObject, 0xffff00); // Yellow for tablos
        },
        
        // Method to cleanup
        cleanup: () => {
            // Remove all debug meshes
            for (const mesh of colliderMeshes.values()) {
                scene.remove(mesh);
            }
            colliderMeshes.clear();
            
            // Remove all wireframes
            staticObjectWireframes.forEach(wireframe => {
                scene.remove(wireframe);
            });
            staticObjectWireframes.length = 0;
        }
    };
}
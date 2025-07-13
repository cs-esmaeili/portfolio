import * as THREE from 'three';

export function createRapierDebugRenderer(world, scene, RAPIER, zaminObject = null) {
    const colliders = [];

    function createColliderMesh(collider) {
        const shapeType = collider.shapeType();
        let mesh;

        if (shapeType === RAPIER.ShapeType.Cuboid) {
            const he = collider.halfExtents();
            const geometry = new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2);
            mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
            );

        } else if (shapeType === RAPIER.ShapeType.Ball) {
            const radius = collider.radius();
            const geometryBall = new THREE.SphereGeometry(radius, 16, 16);
            mesh = new THREE.Mesh(
                geometryBall,
                new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
            );

        } else if (shapeType === RAPIER.ShapeType.TriMesh) {
            console.log("TriMesh collider detected - creating wireframe visualization");
            
            // For trimesh, create a simple bounding box wireframe
            const geometry = new THREE.BoxGeometry(200, 2, 200); // Adjust size as needed
            mesh = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
            );
            
            // Position it at the collider's position
            const pos = collider.translation();
            mesh.position.set(pos.x, pos.y, pos.z);
            
        } else {
            console.warn("Unsupported shape type for debug renderer:", shapeType);
            return null;
        }

        return mesh;
    }

    // ساخت کلایدر مش‌ها و افزودن به صحنه
    world.forEachCollider((collider) => {
        const mesh = createColliderMesh(collider);
        if (mesh) {
            scene.add(mesh);
            colliders.push({ collider, mesh });
        }
    });

    // اگر zamin object وجود داشت، wireframe جدا برای همه mesh های آن اضافه کن
    if (zaminObject) {
        zaminObject.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const groundWireframe = new THREE.WireframeGeometry(child.geometry.clone());
                const groundWireframeLine = new THREE.LineSegments(
                    groundWireframe,
                    new THREE.LineBasicMaterial({ color: 0x00ffff }) // Cyan color
                );
                groundWireframeLine.position.copy(child.position);
                groundWireframeLine.quaternion.copy(child.quaternion);
                groundWireframeLine.scale.copy(child.scale);
                
                // Apply the parent's transform
                groundWireframeLine.applyMatrix4(child.matrixWorld);
                
                scene.add(groundWireframeLine);
                console.log("Added wireframe for ground mesh:", child.name);
            }
        });
    }

    function update() {
        for (const { collider, mesh } of colliders) {
            const shapeType = collider.shapeType();
            
            // TriMesh colliders are usually static, so we don't need to update their position
            if (shapeType === RAPIER.ShapeType.TriMesh) {
                continue;
            }
            
            const pos = collider.translation();
            const rot = collider.rotation();
            mesh.position.set(pos.x, pos.y, pos.z);
            mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
        }
    }

    return {
        update,
    };
}
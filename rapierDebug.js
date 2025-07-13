import * as THREE from 'three';

export function createRapierDebugRenderer(world, scene, RAPIER) {
    const colliderMeshes = [];

    function createColliderMesh(collider) {
        const shapeType = collider.shapeType();
        let mesh;

        if (shapeType === RAPIER.ShapeType.Cuboid) {
            const he = collider.halfExtents();
            const geometry = new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));

        } else if (shapeType === RAPIER.ShapeType.Ball) {
            const radius = collider.radius();
            const geometryBall = new THREE.SphereGeometry(radius, 16, 16);
            mesh = new THREE.Mesh(geometryBall, new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));

        } else {
            console.warn("Unsupported shape type:", shapeType);
            return null;
        }

        return mesh;
    }

    const colliders = [];

    world.forEachCollider((collider) => {
        const mesh = createColliderMesh(collider);
        if (mesh) {
            scene.add(mesh);
            colliders.push({ collider, mesh });
        }
    });

    function update() {
        for (const { collider, mesh } of colliders) {
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

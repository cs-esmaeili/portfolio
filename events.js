import { showModal, hideModal } from './modal';
import { gsap } from "gsap";
import * as THREE from 'three';
import { MeshBVH, MeshBVHHelper, INTERSECTED, NOT_INTERSECTED } from 'three-mesh-bvh';


// تابع بررسی برخورد
const checkCollision = (character, targetPosition, scene, getZamin) => {
    const zamin = getZamin();
    if (!character.instance) return false;


    // ایجاد جعبه موقتی برای موقعیت هدف
    const tempBox = new THREE.Box3().copy(character.boundingBox);
    const currentPosition = character.instance.position.clone();
    tempBox.translate(targetPosition.clone().sub(currentPosition));

    const boxHelper = new THREE.Box3Helper(tempBox, 0x00ff00);
    scene.add(boxHelper);

    let collisionDetected = false;


    console.log("2");

    zamin.traverse(child => {
        if (child.isMesh && child.geometry && child.geometry.boundsTree) {
            const matrixWorld = child.matrixWorld;

            child.geometry.boundsTree.shapecast({
                intersectsBounds: box => box.intersectsBox(tempBox),
                intersectsTriangle: tri => {
                    // Clone and transform points
                    const a = tri.a.clone().applyMatrix4(matrixWorld);
                    const b = tri.b.clone().applyMatrix4(matrixWorld);
                    const c = tri.c.clone().applyMatrix4(matrixWorld);

                    // Create a new box from transformed triangle
                    const triBox = new THREE.Box3().setFromPoints([a, b, c]);

                    if (triBox.intersectsBox(tempBox)) {
                        collisionDetected = true;
                        return true; // Stop traversal
                    }
                    return false;
                }
            });
        }
    });

    console.log("3");

    return collisionDetected;

};

// تابع تنظیم رویدادها
export const setupEvents = (camera, renderer, pointer, width, height, aspect, getIntersectObject, getCharacter, setCharacter, scene, getZamin) => {
    const frustumSize = 100;

    const onResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        aspect = width / height;

        camera.left = -aspect * frustumSize / 2;
        camera.right = aspect * frustumSize / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;

        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    const rayCasterClick = () => {
        const intersectObject = getIntersectObject();
        if (!intersectObject) return null;
        showModal(intersectObject.name);
    };

    const onMouseMove = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    };

    const moveCharacter = (character, targetPosition, targerRotation) => {


        setCharacter({ ...character, isMoving: true });

        // بررسی برخورد قبل از حرکت
        const collision = checkCollision(character, targetPosition, scene, getZamin);
        console.log("collision  = " + collision);

        const t1 = gsap.timeline({
            onComplete: () => {
                setCharacter({ ...character, isMoving: false });
            }
        });

        t1.to(character.instance.position, {
            x: targetPosition.x,
            z: targetPosition.z,
            duration: character.moveDuration
        });

        t1.to(character.instance.rotation, {
            y: targerRotation,
            duration: character.moveDuration
        }, 0);

        t1.to(character.instance.position, {
            y: character.instance.position.y + character.jumpHeight,
            duration: character.moveDuration / 2,
            yoyo: true,
            repeat: 1,
        }, 0);
    };

    const onKeyDown = (event) => {


        const key = event.key.toLowerCase();
        const character = getCharacter();
        if (character.isMoving) return;
        console.log("down");

        const targetPosition = new THREE.Vector3().copy(character.instance.position);
        let targerRotation = 0;

        switch (key) {
            case "w":
            case "arrowup":
                targetPosition.z += - character.moveDistance;
                targerRotation = - Math.PI / 2;
                break;
            case "s":
            case "arrowdown":
                targetPosition.z += character.moveDistance;
                targerRotation = Math.PI / 2;
                break;
            case "a":
            case "arrowleft":
                targetPosition.x += - character.moveDistance;
                targerRotation = 0;
                break;
            case "d":
            case "arrowright":
                targetPosition.x += character.moveDistance;
                targerRotation = Math.PI;
                break;
            default:
                return;
        }
        moveCharacter(character, targetPosition, targerRotation);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener('click', rayCasterClick);
    window.addEventListener('pointermove', onMouseMove);
    const modalExitButton = document.querySelector(".modal-exit-button");
    modalExitButton.addEventListener("click", hideModal);
};
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Helicopter = () => {
    const model = useGLTF("/models/helicopter/scene.gltf");

    const mainRotorRef = useRef(null);
    const tailRotorRef = useRef(null);
    const helicopterRef = useRef(null);

    const isFlying = useRef(false);
    const rotorSpeed = useRef(0);
    const lift = useRef(0);

    useEffect(() => {
        if (!model.scene) return;

        model.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                // child.receiveShadow = true;
            }

            if (child.name.toLowerCase().includes("circle002_16")) {
                mainRotorRef.current = child;
            }

            if (child.name.toLowerCase().includes("circle001_21")) {
                tailRotorRef.current = child;
            }
        });

        isFlying.current = true;
    }, [model]);

    useFrame((_, delta) => {
        if (isFlying.current) {
            // سریع‌تر چرخش بگیر تا زودتر به سرعت بالا برسد
            rotorSpeed.current = Math.min(rotorSpeed.current + delta * 15, 60); // سرعت نهایی 60

            // ولی با تأخیر پرواز کن، وقتی به حداقل سرعت رسید شروع به پرواز کن
            if (rotorSpeed.current > 30) {
                lift.current = Math.min(lift.current + delta * 2, 5); // آهسته‌تر بالا رفتن
                if (helicopterRef.current) {
                    helicopterRef.current.position.y = lift.current;
                }
            }
        }

        if (mainRotorRef.current) {
            mainRotorRef.current.rotation.y += delta * rotorSpeed.current;
        }

        if (tailRotorRef.current) {
            tailRotorRef.current.rotation.x += delta * rotorSpeed.current * 2;
        }
    });

    return (
        <group ref={helicopterRef}>
            <primitive object={model.scene} castShadow />
        </group>
    );
};

export default Helicopter;

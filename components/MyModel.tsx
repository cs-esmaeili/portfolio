"use client";

import { useGLTF } from "@react-three/drei";

export default function MyModel() {
    const gltf = useGLTF("/model/final.glb", true);

    return <primitive object={gltf.scene} />;
}

// این باعث میشه مدل فقط یک بار لود بشه
useGLTF.preload("/models/final.glb");

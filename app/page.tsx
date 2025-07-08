"use client";


import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MyModel from "@/components/MyModel";


export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas>
        {/* نور محیط */}
        <ambientLight intensity={2} />
        {/* نور نقطه‌ای */}
        <pointLight position={[20, 20, 10]} />
        {/* کنترل دوربین */}
        <OrbitControls />
        <MyModel/>
      </Canvas>
    </div>
  );
}

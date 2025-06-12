'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Helicopter from '@/components/Helicopter';
import { Suspense } from 'react';

export default function Home() {
  return (
    <Canvas shadows>

      <OrbitControls />
      <ambientLight />
      <directionalLight
        intensity={3}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />


      <mesh position-y={-0.5} rotation-x={- Math.PI * 0.5} scale={1000} receiveShadow>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
      {/* 
      <mesh position={[0,0,4]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={'orange'} />
      </mesh> */}

      <Suspense>
        <Helicopter />
      </Suspense>

    </Canvas >
  );
}

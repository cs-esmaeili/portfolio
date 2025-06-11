'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three';

export default function Home() {
  return (
    <Canvas>
      <OrbitControls />
      <ambientLight />
      <directionalLight />
      <mesh position-y={-0.5} rotation-x={- Math.PI * 0.5} scale={10}>
        <planeGeometry />
        <meshStandardMaterial color="greenyellow" />
      </mesh>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>

    </Canvas>
  );
}

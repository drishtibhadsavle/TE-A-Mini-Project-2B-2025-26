import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const BookModel = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={meshRef}>
        {/* Book cover back */}
        <mesh position={[0, 0, -0.22]} castShadow>
          <boxGeometry args={[2.4, 3.4, 0.05]} />
          <meshStandardMaterial color="#312e81" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Pages */}
        <mesh position={[0.05, 0, 0]} castShadow>
          <boxGeometry args={[2.28, 3.28, 0.38]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
        </mesh>
        {/* Book cover front */}
        <mesh position={[0, 0, 0.22]} castShadow>
          <boxGeometry args={[2.4, 3.4, 0.05]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* Spine */}
        <mesh position={[-1.18, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 3.4, 0.5]} />
          <meshStandardMaterial color="#3730a3" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Title stripe */}
        <mesh position={[0, 0.8, 0.26]}>
          <boxGeometry args={[1.8, 0.3, 0.01]} />
          <meshStandardMaterial color="#a5b4fc" roughness={0.5} metalness={0.1} emissive="#4338ca" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
};

const SceneContent = () => (
  <>
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 8, 5]} intensity={2} castShadow />
    <directionalLight position={[-5, -2, -5]} intensity={0.5} color="#a5b4fc" />
    <pointLight position={[0, 5, 3]} intensity={1.2} color="#818cf8" />
    <BookModel />
    <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={8} blur={2} far={4} />
  </>
);

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export const ThreeDScene = () => {
  return (
    <CanvasErrorBoundary>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '55%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.85,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 7], fov: 40 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
};

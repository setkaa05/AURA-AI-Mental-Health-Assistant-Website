import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Emotion, EMOTION_COLORS } from '../../types';

interface OrbMeshProps {
  emotion: Emotion;
  size?: number;
}

function OrbMesh({ emotion, size = 1.5 }: OrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = EMOTION_COLORS[emotion] || '#7c3aed';

  const distortSpeed: Record<Emotion, number> = {
    anger:    1.8, disgust: 0.8, fear: 1.4, joy: 1.2,
    neutral:  0.5, sadness: 0.6, surprise: 1.6,
  };
  const distortFactor: Record<Emotion, number> = {
    anger:    0.7, disgust: 0.4, fear: 0.6, joy: 0.45,
    neutral:  0.25, sadness: 0.35, surprise: 0.65,
  };

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[size, 128, 128]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distortFactor[emotion]}
          speed={distortSpeed[emotion]}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

interface AuraOrbProps {
  emotion: Emotion;
  size?: number;
  className?: string;
  canvasSize?: number;
}

export default function AuraOrb({ emotion, size = 1.5, className = '', canvasSize = 300 }: AuraOrbProps) {
  const color = EMOTION_COLORS[emotion] || '#7c3aed';

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: canvasSize,
        height: canvasSize,
        filter: `drop-shadow(0 0 ${canvasSize * 0.1}px ${color}88)`,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={color} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
        <OrbMesh emotion={emotion} size={size} />
      </Canvas>
    </div>
  );
}

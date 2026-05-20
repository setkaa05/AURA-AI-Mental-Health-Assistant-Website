import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Emotion, EMOTION_COLORS } from '../../types';

interface ParticlesProps {
  count?: number;
  emotion: Emotion;
}

function Particles({ count = 120, emotion }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const color = EMOTION_COLORS[emotion] || '#7c3aed';

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3]     = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 2] = 0;
    }
    return [pos, vel];
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      positions[i * 3]     += Math.sin(t * 0.3 + i * 0.1) * 0.003;
      positions[i * 3 + 1] += Math.cos(t * 0.2 + i * 0.15) * 0.004;
      // Wrap around
      if (positions[i * 3]     >  10) positions[i * 3]     = -10;
      if (positions[i * 3]     < -10) positions[i * 3]     =  10;
      if (positions[i * 3 + 1] >  10) positions[i * 3 + 1] = -10;
      if (positions[i * 3 + 1] < -10) positions[i * 3 + 1] =  10;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.z = t * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.06} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

interface ConnectionLinesProps {
  emotion: Emotion;
}

function ConnectionLines({ emotion }: ConnectionLinesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const color = EMOTION_COLORS[emotion] || '#7c3aed';

  const geometry = useMemo(() => {
    const nodes = Array.from({ length: 20 }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 4,
    ));

    const points: THREE.Vector3[] = [];
    nodes.forEach((n, i) => {
      nodes.forEach((m, j) => {
        if (i < j && n.distanceTo(m) < 4) {
          points.push(n, m);
        }
      });
    });

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = clock.getElapsedTime() * 0.01;
      linesRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </lineSegments>
  );
}

interface NeuralBackgroundProps {
  emotion: Emotion;
  className?: string;
}

export default function NeuralBackground({ emotion, className = '' }: NeuralBackgroundProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Particles count={80} emotion={emotion} />
        <ConnectionLines emotion={emotion} />
      </Canvas>
    </div>
  );
}

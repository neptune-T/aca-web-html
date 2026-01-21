"use client";

import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Center, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const BUNNY_PLY_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/models/bunny.ply`;

function InteractiveBunny({ url }: { url: string }) {
  const geometry = useLoader(PLYLoader, url) as THREE.BufferGeometry;
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useLayoutEffect(() => {
    if (!geometry) return;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;
    const center = new THREE.Vector3();
    box.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1.2 / maxDim;
    geometry.scale(scaleFactor, scaleFactor, scaleFactor);
  }, [geometry]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (shaderRef.current) {
      shaderRef.current.uniforms.uHover.value.copy(e.point);
    }
  };

  const handlePointerLeave = () => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uHover.value.set(9999, 9999, 9999);
    }
  };

  const materialArgs = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffffff') },
      uHover: { value: new THREE.Vector3(9999, 9999, 9999) },
      uInteractionRadius: { value: 0.35 },
      uInteractionStrength: { value: 0.5 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      uniform float uTime;
      uniform vec3 uHover;
      uniform float uInteractionRadius;
      uniform float uInteractionStrength;
      uniform float uPixelRatio;
      varying float vIntensity;
      void main() {
        vec3 newPosition = position;
        float dist = distance(position, uHover);
        float influence = smoothstep(uInteractionRadius, 0.0, dist);
        vec3 displacement = normal * influence * uInteractionStrength;
        float breath = sin(uTime * 2.0 + position.y * 4.0) * 0.02;
        newPosition += displacement + (normal * breath);
        vec4 viewPosition = viewMatrix * modelMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = (3.0 + influence * 12.0) * uPixelRatio;
        gl_PointSize *= (1.0 / -viewPosition.z);
        vIntensity = influence;
      }
    `,
    fragmentShader: `
      varying float vIntensity;
      uniform vec3 uColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if(d > 0.5) discard;
        vec3 finalColor = mix(uColor, vec3(0.2, 0.8, 1.0), vIntensity);
        float alpha = 0.6 + vIntensity * 0.4;
        alpha *= (1.0 - d * 2.0);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  };

  return (
    <group>
      <mesh visible={false} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
        <primitive object={geometry} />
        <meshBasicMaterial />
      </mesh>
      <points>
        <primitive object={geometry} />
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          args={[materialArgs]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

const PlanetOrbit = ({
  radius,
  speed,
  color,
  size,
  offset = 0,
}: {
  radius: number;
  speed: number;
  color: string;
  size: number;
  offset?: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += speed * delta;
    }
  });

  return (
    <group>
      <Line points={points} color="#888888" lineWidth={1} transparent opacity={0.3} />
      <group ref={groupRef} rotation={[0, 0, offset]}>
        <mesh position={[radius, 0, 0]}>
          <circleGeometry args={[size, 32]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

function SolarSystem() {
  return (
    <group rotation={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#ef4444" wireframe />
      </mesh>
      <PlanetOrbit radius={0.6} speed={0.6} color="#4ade80" size={0.06} offset={1} />
      <PlanetOrbit radius={0.9} speed={0.4} color="#3b82f6" size={0.05} offset={3} />
      <PlanetOrbit radius={1.3} speed={0.25} color="#d97706" size={0.04} offset={4} />
      <PlanetOrbit radius={1.7} speed={0.15} color="#6b7280" size={0.08} offset={0} />
    </group>
  );
}

function LoadingBunny() {
  return (
    <Html center>
      <div className="text-white font-mono text-sm bg-black/50 p-2 rounded backdrop-blur-sm whitespace-nowrap">
        LOADING MODEL...
      </div>
    </Html>
  );
}

export default function HomeHeroScene({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 40 }}
      dpr={[1, 2]}
      gl={{ powerPreference: 'high-performance', alpha: true }}
    >
      <color attach="background" args={[isDarkMode ? '#101010' : '#ffffff']} />
      <OrbitControls enableZoom={false} enablePan={false} minDistance={2} maxDistance={5} rotateSpeed={0.5} />
      <React.Suspense fallback={<LoadingBunny />}>
        <Center>{isDarkMode ? <InteractiveBunny url={BUNNY_PLY_URL} /> : <SolarSystem />}</Center>
      </React.Suspense>
    </Canvas>
  );
}





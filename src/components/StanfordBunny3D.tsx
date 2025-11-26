
"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';


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
    const scaleFactor = 1.2 / maxDim; // 略微增大一点
    geometry.scale(scaleFactor, scaleFactor, scaleFactor);
  }, [geometry]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      shaderRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;

      // const currentHover = shaderRef.current.uniforms.uHover.value;
      // currentHover.lerp(new THREE.Vector3(9999, 9999, 9999), 0.05); 
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
  }

  // Define material inside component
  const materialArgs = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffffff') },
      uHover: { value: new THREE.Vector3(9999, 9999, 9999) },
      uInteractionRadius: { value: 0.35 }, 
      uInteractionStrength: { value: 0.5 },
      uPixelRatio: { value: 1 }
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

        gl_PointSize = (3.0 + influence * 12.0) * uPixelRatio; // 动态大小
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
    `
  };

  return (
    <group>
      {/* 隐形碰撞体 */}
      <mesh 
        visible={false} 
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <primitive object={geometry} />
        <meshBasicMaterial />
      </mesh>

      {/* 视觉层 */}
      <points> {/* No pointerEvents */}
        <primitive object={geometry} />
        <shaderMaterial
          ref={shaderRef}
          attach="material"
          args={[materialArgs]} // Use dynamic args
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function Loading() {
  return (
    <Html center>
      <div className="text-white font-mono text-sm bg-black/50 p-2 rounded backdrop-blur-sm whitespace-nowrap">
        LOADING MODEL...
      </div>
    </Html>
  );
}

const BUNNY_PLY_URL = '/models/bunny.ply';

export default function OptimizedScene() {
  const bgColor = '#101010';
  const textColor = 'text-white';
  const textOpacity = 'text-white/60';
  const dividerColor = 'bg-white/30';

  return (
    <div className="w-full h-full relative overflow-hidden select-none" style={{ background: bgColor }}> 
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className={`text-2xl font-bold tracking-tighter ${textColor}`}>INTERACTIVE_MESH</h1>
        <div className={`h-px w-20 my-2 ${dividerColor}`} />
        <p className={`font-mono text-xs ${textOpacity}`}>
          OPTIMIZATION: PROXY_GEOMETRY_HIT_TEST<br/>
          STATUS: 60 FPS LOCKED
        </p>
      </div>

      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ powerPreference: "high-performance" }}
      >
        <color attach="background" args={[bgColor]} /> 
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
          rotateSpeed={0.5}
          dampingFactor={0.05}
        />

        <React.Suspense fallback={<Loading />}>
          <Center>
            <InteractiveBunny url={BUNNY_PLY_URL} />
          </Center>
        </React.Suspense>
      </Canvas>
    </div>
  );
}
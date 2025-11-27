"use client";

import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Center, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { Sun, Moon, ArrowRight } from 'lucide-react'; // 需安装图标库: npm install lucide-react
import Link from 'next/link';

// ==========================================
// PART 1: 黑夜模式 - 你的粒子兔子 (代码保持不变)
// ==========================================

const InteractionShaderMaterial = {
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
  `
};

// 请确保 public 文件夹下有此模型
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
  }

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
          args={[InteractionShaderMaterial]}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// ==========================================
// PART 2: 白天模式 - 仿 Outer Wilds 星系系统
// ==========================================

// 单个轨道和行星组件
const PlanetOrbit = ({ radius, speed, color, size, offset = 0 }: { radius: number, speed: number, color: string, size: number, offset?: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  // 计算圆环轨迹的点 (用于画轨道线)
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  // 旋转动画
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += speed * delta;
    }
  });

  return (
    <group>
      {/* 轨道线 - 淡淡的灰色 */}
      <Line points={points} color="#888888" lineWidth={1} transparent opacity={0.3} />
      
      {/* 旋转组：包含行星 */}
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
      {/* 中心恒星 - 红色线框风格 */}
      <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#ef4444" wireframe />
      </mesh>

      {/* 各种轨道行星 - 模拟图1的颜色和布局 */}
      <PlanetOrbit radius={0.6} speed={0.6} color="#4ade80" size={0.06} offset={1} /> {/* 绿色 */}
      <PlanetOrbit radius={0.9} speed={0.4} color="#3b82f6" size={0.05} offset={3} /> {/* 蓝色 */}
      <PlanetOrbit radius={1.3} speed={0.25} color="#d97706" size={0.04} offset={4} /> {/* 棕色 */}
      <PlanetOrbit radius={1.7} speed={0.15} color="#6b7280" size={0.08} offset={0} /> {/* 灰色 */}
    </group>
  );
}

// ==========================================
// PART 3: 主页面布局与逻辑
// ==========================================

function Loading() {
  return (
    <Html center>
      <div className="text-xs font-mono p-2 bg-gray-200 dark:bg-black/50 rounded text-black dark:text-white backdrop-blur-sm">
        LOADING...
      </div>
    </Html>
  );
}

export default function PortfolioPage() {
  // 默认开启黑夜模式 (True = 黑夜/兔子, False = 白天/星系)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 样式配置：根据 isDarkMode 切换
  const styles = {
    bg: isDarkMode ? 'bg-[#050505]' : 'bg-[#F9F9F9]',
    text: isDarkMode ? 'text-white' : 'text-[#1a1a1a]',
    subText: isDarkMode ? 'text-white/60' : 'text-black/60',
    cardBorder: isDarkMode ? 'border-white/10' : 'border-black/5',
    canvasBg: isDarkMode ? '#101010' : '#F0F0F0',
    buttonPrimary: isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800',
    buttonOutline: isDarkMode ? 'border-white/30 hover:bg-white/10' : 'border-black/20 hover:bg-black/5',
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-700 ease-in-out ${styles.bg} ${styles.text} flex flex-col items-center justify-center p-6 md:p-12 font-sans overflow-hidden relative selection:bg-purple-500/30`}>
      
      {/* 顶部导航栏 */}
      <nav className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
         <div className="font-bold text-lg tracking-tight">Plote Motion Field</div>
         
         <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={`hidden md:inline cursor-pointer hover:opacity-70 transition-opacity ${styles.subText}`}>Home</Link>
            <Link href="/notes" className={`hidden md:inline cursor-pointer hover:opacity-70 transition-opacity ${styles.subText}`}>Notes</Link>
            <Link href="/papers" className={`hidden md:inline cursor-pointer hover:opacity-70 transition-opacity ${styles.subText}`}>Papers</Link>
            <Link href="/about" className={`hidden md:inline cursor-pointer hover:opacity-70 transition-opacity ${styles.subText}`}>About</Link>
            
            {/* 主题切换按钮 */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full border border-current hover:opacity-60 transition-all active:scale-95"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
         </div>
      </nav>

      {/* 主要内容区域：左右布局 */}
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-12 mt-16 md:mt-0">
        
        {/* 左侧：文字内容 */}
        <div className="w-full md:w-5/12 flex flex-col space-y-8 z-10 text-left">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              Plote Motion Field
            </h1>
            <p className="text-xl font-light opacity-80 mb-4 tracking-wide">
              Generative Motion Journal
            </p>
            <p className={`text-sm md:text-base leading-relaxed ${styles.subText} max-w-md`}>
              Reconstructing the academic homepage: circular trajectories, beam scanning, 
              and discrete particles form a cyclical visual system.
              <br /><br />
              Retaining a sense of technology and futurism in a minimalist 
              {isDarkMode ? ' dark particle ' : ' light orbital '} system.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/notes" className={`px-8 py-3 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center gap-2 ${styles.buttonPrimary}`}>
              Explore Notes <ArrowRight size={16} />
            </Link>
            <Link href="/papers" className={`px-8 py-3 rounded-lg border text-sm font-bold tracking-wide transition-all ${styles.buttonOutline}`}>
              View Papers
            </Link>
          </div>
        </div>

        {/* 右侧：3D 卡片容器 */}
        <div className="w-full md:w-6/12 flex justify-center md:justify-end">
          <div className={`relative w-full aspect-square md:max-w-[550px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 border ${styles.cardBorder}`}>
            
            {/* 卡片内部左上角的装饰文字 */}
            <div className={`absolute top-6 left-6 z-10 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-60 mix-blend-difference'}`}>
              <h2 className="text-lg font-bold uppercase tracking-widest">
                {isDarkMode ? 'INTERACTIVE_MESH' : 'ORBITAL_SYSTEM'}
              </h2>
              <div className={`h-px w-12 my-2 ${isDarkMode ? 'bg-white/30' : 'bg-black/30'}`} />
              <p className="font-mono text-[10px] opacity-70">
                STATUS: 60 FPS LOCKED<br/>
                MODE: {isDarkMode ? 'PARTICLE_FLOW' : 'GRAVITY_SIM'}
              </p>
            </div>

            {/* 3D 场景 */}
            <Canvas
              camera={{ position: [0, 0, 3], fov: 40 }}
              dpr={[1, 2]}
              gl={{ powerPreference: "high-performance", alpha: true }}
            >
              {/* 动态背景色 */}
              <color attach="background" args={[styles.canvasBg]} />
              
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                minDistance={2}
                maxDistance={5}
                rotateSpeed={0.5}
              />

              <React.Suspense fallback={<Loading />}>
                <Center>
                  {/* 根据模式切换渲染的内容 */}
                  {isDarkMode ? (
                    <InteractiveBunny url={BUNNY_PLY_URL} />
                  ) : (
                    <SolarSystem />
                  )}
                </Center>
              </React.Suspense>
            </Canvas>
          </div>
        </div>

      </div>
    </div>
  );
}
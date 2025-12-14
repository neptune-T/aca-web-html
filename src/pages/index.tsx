"use client";

import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Center, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { FaBook, FaFlask, FaUser, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

// 引入拆分出去的 Header 组件
import Header from '@/components/Header';
import Head from 'next/head';

// ==========================================
// PART 1: 3D 兔子组件 (完整逻辑 - 保持不变)
// ==========================================
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
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// ==========================================
// PART 2: 星际系统组件 (保持不变)
// ==========================================
const PlanetOrbit = ({ radius, speed, color, size, offset = 0 }: { radius: number, speed: number, color: string, size: number, offset?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  useFrame((state, delta) => {
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

// ==========================================
// PART 3: 页面主逻辑
// ==========================================

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = isDarkMode ? '#050505' : '#F9F9F9';
  }, [isDarkMode]);

  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: 'easeOut' } 
    },
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#050505]' : 'bg-[#F9F9F9]',
    
    // --- 字体颜色 ---
    heroTitle: isDarkMode ? 'text-white drop-shadow-md' : 'text-black',
    heroSubtitle: isDarkMode ? 'text-gray-200' : 'text-gray-800',
    heroBody: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    
    // --- 参数网格 ---
    statsLabel: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    statsValue: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    statsBorder: isDarkMode ? 'border-white/10' : 'border-black/10',

    // --- 大卡片样式 (Academic Profile) ---
    academicProfileCard: isDarkMode
      ? 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 shadow-2xl rounded-3xl p-10 md:p-16'
      : 'bg-white/80 backdrop-blur-md border border-black/5 shadow-2xl rounded-3xl p-10 md:p-16',

    // --- Footer ---
    newFooterContainer: isDarkMode
      ? 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 shadow-lg text-gray-200 rounded-3xl p-8 md:p-10'
      : 'bg-white/80 backdrop-blur-md border border-black/5 shadow-lg text-gray-800 rounded-3xl p-8 md:p-10',
    footerDivider: isDarkMode ? 'bg-white/10' : 'bg-black/10',
    footerIcon: isDarkMode ? 'hover:text-white text-gray-400' : 'hover:text-black text-gray-500',

    cardBorder: isDarkMode ? 'border-white/10' : 'border-black/5',
    cardBg: isDarkMode ? 'bg-[#101010]' : 'bg-white', 
    buttonPrimary: isDarkMode ? 'bg-white text-black hover:bg-gray-200 border-transparent' : 'bg-black text-white hover:bg-gray-800 border-transparent',
    buttonOutline: isDarkMode ? 'border-white/30 hover:bg-white/10 text-white' : 'border-black/20 hover:bg-black/5 text-black',
    
    // --- 学术专栏 (Columns) 样式 ---
    glassCard: isDarkMode 
      ? 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 hover:bg-[#222] transition-all duration-300 shadow-lg' 
      : 'bg-white/80 backdrop-blur-md border border-black/5 hover:bg-white shadow-lg',
    
    columnText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    columnTitle: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    
    // --- [修改] 图标背景 - 统一为单色调 ---
    iconBgMono: isDarkMode ? 'bg-white/10' : 'bg-gray-100',
    // --- [修改] 图标颜色 - 自适应 ---
    iconColor: isDarkMode ? 'text-white' : 'text-gray-900',

    // --- [修改] 标签条样式 - 统一为单色调 ---
    tagMono: isDarkMode 
      ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-black/5',
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-700 ease-in-out ${theme.bg} font-sans selection:bg-purple-500/30 flex flex-col`}>
      
      <Head>
        <title>Tianshan Zhang | 张天山</title>
        <meta name="description" content="Personal academic homepage" />
      </Head>

      {/* HEADER */}
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* HERO SECTION (保持不变) */}
      <section className="relative w-full min-h-screen flex flex-col justify-center p-6 md:p-12">
        {/* -mt-16 md:-mt-24 保持视觉重心上提 */}
        <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-12 -mt-16 md:-mt-24">
          <div className="w-full md:w-5/12 flex flex-col space-y-8 z-10 text-left">
            <div>
              <h1 className={`text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] transition-colors duration-500 ${theme.heroTitle}`}>
                Tianshan Zhang 
              </h1>
              <p className={`text-xl font-light mb-4 tracking-wide transition-colors duration-500 ${theme.heroSubtitle}`}>
              B.S. Candidate
              </p>
              <p className={`text-sm md:text-base leading-relaxed max-w-md transition-colors duration-500 ${theme.heroBody}`}>
              Computer Science and Materials Science
                <br /><br />
                A view of computer graphics, expressed through {isDarkMode ? 'physical simulation' : 'generative imaging'}.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className={`px-8 py-3 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center gap-2 border ${theme.buttonPrimary}`}>
                Explore Notes <ArrowRight size={16} />
              </button>
              <button className={`px-8 py-3 rounded-lg border text-sm font-bold tracking-wide transition-all ${theme.buttonOutline}`}>
                View Papers
              </button>
            </div>
              <div className={`grid grid-cols-3 gap-4 pt-8 border-t transition-colors duration-500 ${theme.statsBorder}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-1 ${theme.statsLabel}`}>FIELD</p>
                  <p className={`text-lg font-bold ${theme.statsValue}`}>CS & AI</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-1 ${theme.statsLabel}`}>INTEREST</p>
                  <p className={`text-lg font-bold ${theme.statsValue}`}>{isDarkMode ? '3D Vision' : 'GenAI'}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest mb-1 ${theme.statsLabel}`}>ROLE</p>
                  <p className={`text-lg font-bold ${theme.statsValue}`}>Research Intern</p>
                </div>
            </div>
          </div>
          <div className="w-full md:w-6/12 flex justify-center md:justify-end">
            <div className={`relative w-full aspect-square md:max-w-[550px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 border ${theme.cardBorder} ${theme.cardBg}`}>
              <div className={`absolute top-6 left-6 z-10 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {isDarkMode ? 'INTERACTIVE_MESH' : 'ORBITAL_SYSTEM'}
                </h2>
                <div className={`h-px w-12 my-2 ${isDarkMode ? 'bg-white/30' : 'bg-black/30'}`} />
                <p className="font-mono text-[10px] opacity-70">
                  STATUS: 60 FPS LOCKED<br/>
                  MODE: {isDarkMode ? 'PARTICLE_FLOW' : 'GRAVITY_SIM'}
                </p>
              </div>
              <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]} gl={{ powerPreference: "high-performance", alpha: true }}>
                <color attach="background" args={[isDarkMode ? '#101010' : '#ffffff']} />
                <OrbitControls enableZoom={false} enablePan={false} minDistance={2} maxDistance={5} rotateSpeed={0.5} />
                <React.Suspense fallback={<LoadingBunny />}>
                  <Center>
                    {isDarkMode ? ( <InteractiveBunny url={BUNNY_PLY_URL} /> ) : ( <SolarSystem /> )}
                  </Center>
                </React.Suspense>
              </Canvas>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className={`py-20 relative z-20 transition-colors duration-700 flex-grow`}>
        {/* Profile - 大毛玻璃卡片包裹 */}
        <motion.div 
          id="profile"
          className={`px-4 md:px-10 lg:px-20 max-w-6xl mx-auto mb-24 ${theme.academicProfileCard}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeInVariants}
        >
          <motion.h2 className={`text-3xl md:text-5xl font-bold mb-16 text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Academic Profile
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* Research Interests - [修改] 增加分行和列表结构 */}
              <div>
                  <h3 className={`text-3xl font-bold mb-8 opacity-90 ${theme.columnTitle}`}>Research Interests</h3>
                  <ul className={`${theme.columnText} leading-relaxed text-lg space-y-6`}>
                    <li>
                      <strong className={`block mb-2 ${theme.columnTitle} opacity-90`}>Theoretical Generative Modeling (Image & Video)</strong>
                      My research is grounded in the theoretical foundations of generative modeling. I approach this from a mathematical perspective, specifically studying Diffusion and Autoregressive models through their connections to Markov processes, SDEs, and Boltzmann-type distributions.
                    </li>
                    <li>
                      <strong className={`block mb-2 ${theme.columnTitle} opacity-90`}>Interactive & Navigable 3D Environments</strong>
                      I am interested in the autonomous generation of navigable 3D scenes. My goal is to develop systems that can generate complex 3D environments where users or agents can freely move and interact, bridging the gap between static 3D assets and dynamic virtual spaces.
                    </li>
                  </ul>
              </div>
              
              {/* Biography - [修改] 增加分段 */}
              <div>
                  <h3 className={`text-3xl font-bold mb-8 opacity-90 ${theme.columnTitle}`}>Biography</h3>
                  <div className={`${theme.columnText} leading-relaxed text-lg space-y-6 text-justify`}>
                    <p>
                      I am an undergraduate with a dual focus in Computer Science and Materials Science. My passion lies in understanding complex systems from first principles—ranging from deriving the Maxwell-Boltzmann distribution and Schrödinger equation in statistical mechanics, to engineering core systems in computer science.
                    </p>
                    <p>
                      My technical background is rooted in hands-on systems programming. I have implemented a compiler front-end (from source to AST/IR) and extended the xv6 operating system with advanced features like copy-on-write fork and priority-based scheduling.
                    </p>
                    <p>

                    </p>
                  </div>
              </div>
          </div>
          
          {/* Affiliations
          <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className={`text-2xl font-bold mb-8 opacity-90 ${theme.columnTitle}`}>Affiliations</h3>
              <div className="flex flex-wrap gap-4">
                  <div className={`px-6 py-3 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors cursor-default text-sm font-medium`}>
                    Peking University (Visiting)
                  </div>
                  <div className={`px-6 py-3 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors cursor-default text-sm font-medium`}>
                    Institute of Automation, CAS (Visiting)
                  </div>
              </div>
          </div> */}
        </motion.div>

        {/* Columns - [修改] 应用单色调主题 */}
        <div className={`px-4 md:px-10 lg:px-20 max-w-7xl mx-auto border-t pt-20 mb-10 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
            <motion.h2 
              className={`text-3xl md:text-4xl font-bold mb-16 text-center ${theme.columnTitle}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInVariants}
            >
              Academic Columns
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* 1. Notes */}
                <motion.div 
                  className={`p-8 rounded-2xl border border-transparent ${theme.glassCard}`}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInVariants}
                >
                    <div className="flex items-center mb-6">
                        {/* [修改] 使用 iconBgMono 和 iconColor */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${theme.iconBgMono}`}>
                            <FaFlask className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                        <h3 className={`text-xl font-bold tracking-wide ${theme.columnTitle}`}>Notes</h3>
                    </div>
                    <p className={`${theme.columnText} mb-8 text-sm h-16 leading-relaxed`}>Research notes and methodological insights from my ongoing projects.</p>
                    <div className="space-y-3">
                        {/* [修改] 使用 tagMono */}
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Cognitive Models
                        </a>
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Experimental Design
                        </a>
                    </div>
                </motion.div>
                
                {/* 2. Papers */}
                <motion.div 
                  className={`p-8 rounded-2xl border border-transparent ${theme.glassCard}`}
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.1}} variants={fadeInVariants}
                >
                    <div className="flex items-center mb-6">
                          {/* [修改] 使用 iconBgMono 和 iconColor */}
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${theme.iconBgMono}`}>
                            <FaBook className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                        <h3 className={`text-xl font-bold tracking-wide ${theme.columnTitle}`}>Papers</h3>
                    </div>
                    <p className={`${theme.columnText} mb-8 text-sm h-16 leading-relaxed`}>Critical reviews and summaries of influential papers in AI.</p>
                    <div className="space-y-3">
                        {/* [修改] 使用 tagMono */}
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Recent Publications
                        </a>
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Classic Papers
                        </a>
                    </div>
                </motion.div>

                {/* 3. About Me */}
                <motion.div 
                  className={`p-8 rounded-2xl border border-transparent ${theme.glassCard}`}
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.2}} variants={fadeInVariants}
                >
                    <div className="flex items-center mb-6">
                        {/* [修改] 使用 iconBgMono 和 iconColor */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${theme.iconBgMono}`}>
                            <FaUser className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                        <h3 className={`text-xl font-bold tracking-wide ${theme.columnTitle}`}>About Me</h3>
                    </div>
                    <p className={`${theme.columnText} mb-8 text-sm h-16 leading-relaxed`}>Personal reflections on academic life and philosophy.</p>
                    <div className="space-y-3">
                        {/* [修改] 使用 tagMono */}
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Academic Journey
                        </a>
                        <a href="#" className={`block w-full py-2.5 px-4 rounded text-xs font-medium tracking-wide transition-all ${theme.tagMono}`}>
                           Teaching Philosophy
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* FOOTER (保持不变) */}
      <footer className="w-full py-10 px-4 md:px-10 lg:px-20 flex justify-center relative z-10">
        <div className={`w-full max-w-6xl rounded-3xl border p-8 md:p-10 transition-all duration-500 ${theme.newFooterContainer}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h3 className="text-xl font-bold tracking-tight mb-1">Plote</h3>
               <p className="opacity-80 text-sm">Academic Homepage</p>
            </div>
            <div className="flex gap-6 items-center">
               <a href="#" className={`transition-colors duration-300 ${theme.footerIcon}`} aria-label="GitHub"> <FaGithub size={24} /> </a>
               <a href="#" className={`transition-colors duration-300 ${theme.footerIcon}`} aria-label="LinkedIn"> <FaLinkedin size={24} /> </a>
               <a href="#" className={`transition-colors duration-300 ${theme.footerIcon}`} aria-label="Twitter"> <FaTwitter size={24} /> </a>
            </div>
          </div>
          <div className={`w-full h-px my-8 ${theme.footerDivider}`}></div>
          <div className="text-center text-sm opacity-60">
            <p>© 2025 Plote. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
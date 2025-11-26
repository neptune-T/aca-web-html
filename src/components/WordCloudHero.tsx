"use client";

import { motion, Variants, useSpring, useMotionValue, MotionValue, useAnimation } from 'framer-motion';
import { useMemo, useRef, useEffect } from 'react';
import StanfordBunny3D from './StanfordBunny3D';

// --- Constants ---
const ACCENT_COLOR = "#FF003C"; 
const SVG_CENTER = 260; // SVG 的中心点坐标

// [修复] 兔子模型常量
const BUNNY_SCALE = 800; // [修改] 缩小兔子 (从 1000 -> 800)
const CONNECT_THRESHOLD = 25; // [修改] 增大连接阈值 (从 20 -> 25)

// [修复] 物理模型常量 (使用“热力学/排斥”)
const REPULSION_RADIUS = 70; // 排斥半径
const REPULSION_STRENGTH = 100; // 排斥强度
const EVENT_HORIZON_RADIUS = 30; // “事件视界” (加热) 半径
const SPRING_CONFIG = { stiffness: 200, damping: 30 }; // 弹簧物理

const SPEC_ITEMS = [
  { label: 'Loop', value: '03' },
  { label: 'Mode', value: 'Monochrome' },
  { label: 'Field', value: 'Motion Graphic' },
];

// --- 动画 Vatiants ---
const svgVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: 'easeOut',
      staggerChildren: 0.005, // 更快的交错
    },
  },
};

// --- 类型定义 ---
interface ParticleData {
  id: string;
  baseX: number;
  baseY: number;
  x: MotionValue<number>; 
  y: MotionValue<number>;
}

// --- 子组件 ---

/**
  * [修改 1] 粒子子组件 (隐形)
  * 物理逻辑不变，渲染半径 r={0}
  */
interface ParticleProps {
  particle: ParticleData;
  mouseX: MotionValue<number | null>;
  mouseY: MotionValue<number | null>;
}

const Particle: React.FC<ParticleProps> = ({ particle, mouseX, mouseY }) => {
  const { baseX, baseY, x, y } = particle; 

  const visualX = useSpring(x, SPRING_CONFIG);
  const visualY = useSpring(y, SPRING_CONFIG);
  const colorControls = useAnimation();
  
  const isHot = useRef(false);
  const coolingTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearCoolingTimer = () => {
    if (coolingTimeout.current) {
      clearTimeout(coolingTimeout.current);
      coolingTimeout.current = null;
    }
  };

  useEffect(() => {
    const mouseListener = () => {
      const mx = mouseX.get();
      const my = mouseY.get();
      
      let distance = Infinity;
      let isBeingHeated = false; // "加热"
      let isBeingPushed = false; // "排斥"

      if (mx !== null && my !== null) {
        const dx = visualX.get() - mx;
        const dy = visualY.get() - my;
        distance = Math.sqrt(dx * dx + dy * dy);

        // 检查状态
        if (distance < EVENT_HORIZON_RADIUS) { // 强排斥 + 加热
          isBeingHeated = true; 
          isBeingPushed = true; 
        } else if (distance < REPULSION_RADIUS) { // 弱排斥
          isBeingHeated = false;
          isBeingPushed = true; 
        }
      }

      // --- 状态 1: “排斥” (热力学) ---
      if (isBeingPushed) {
        // 粒子被“推开”
        const angle = Math.atan2(visualY.get() - my!, visualX.get() - mx!);
        const force = (1 - distance / REPULSION_RADIUS) * REPULSION_STRENGTH; 
        const targetX = baseX + Math.cos(angle) * force;
        const targetY = baseY + Math.sin(angle) * force;
        x.set(targetX);
        y.set(targetY);
      }
      
      // --- 状态 2: “加热” (变红) ---
      if (isBeingHeated) {
        clearCoolingTimer(); 
        colorControls.stop(); 
        colorControls.set({ fill: ACCENT_COLOR });
        isHot.current = true;
      }
      
      // --- 状态 3: “冷却” (脱离热源) ---
      if (!isBeingPushed) { // 鼠标移出画布 或 移出排斥范围
        // 1. 位置弹回
        x.set(baseX);
        y.set(baseY);
        
        // 2. 检查是否需要开始“冷却” (热痕逻辑)
        if (isHot.current && coolingTimeout.current === null) {
          isHot.current = false; 
          coolingTimeout.current = setTimeout(() => {
            colorControls.start({
              fill: "white",
              transition: { duration: 3, ease: "easeOut" } // 3秒褪色
            });
            coolingTimeout.current = null; 
          }, 1000); // 1秒的热痕
        }
      }
    };

    const unsubX = mouseX.onChange(mouseListener);
    const unsubY = mouseY.onChange(mouseListener);

    return () => {
      unsubX();
      unsubY();
      clearCoolingTimer();
    };
  }, [baseX, baseY, mouseX, mouseY, x, y, visualX, visualY, colorControls]);

  return (
    <motion.circle
      r={0} // [修改 1] 粒子半径设为 0
      initial={{ fill: "white" }} 
      animate={colorControls} 
      style={{ x: visualX, y: visualY }} 
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    />
  );
};

/**
  * [修改 2 & 3] 晶格线条子组件
  * 端点动态化 + 移除透明度变化
  */
interface LatticeLineProps {
  p1: ParticleData;
  p2: ParticleData;
}

const LatticeLine: React.FC<LatticeLineProps> = ({ p1, p2 }) => {
  // [修改 2] 为线条端点创建弹簧
  const x1 = useSpring(p1.x, SPRING_CONFIG);
  const y1 = useSpring(p1.y, SPRING_CONFIG);
  const x2 = useSpring(p2.x, SPRING_CONFIG);
  const y2 = useSpring(p2.y, SPRING_CONFIG);
  
  // [修改 3] 移除了 totalDisplacement 和 opacity 的 useTransform 逻辑

  return (
    <motion.line
      x1={x1} // [修改 2] 绑定弹簧
      y1={y1} // [修改 2] 绑定弹簧
      x2={x2} // [修改 2] 绑定弹簧
      y2={y2} // [修改 2] 绑定弹簧
      stroke="rgba(255, 255, 255, 0.3)" // [修改 3] 固定透明度
      strokeWidth={1}
      // [修改 3] 移除了 style={{ opacity }}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    />
  );
};


/**
  * 子组件：左侧的文本内容和规格 (无需改动)
  */
const HeroContent: React.FC = () => (
  <div className="z-10 space-y-8 self-center text-gray-900 max-w-xl">
    <p className="text-sm tracking-widest text-gray-500 uppercase">Generative Motion Journal</p>
    <h1 className="text-5xl font-bold tracking-tight">Plote Motion Field</h1>
    <p className="text-lg text-gray-600 leading-relaxed">
      Reconstructing the academic homepage: circular trajectories, beam scanning, and discrete particles form a cyclical visual system, retaining a sense of technology and futurism in a minimalist black and white palette.
    </p>
    <div className="flex flex-wrap gap-3">
      <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full">Motion System</span>
      <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full">World Model Log</span>
      <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-full">Research Notation</span>
    </div>
    <div className="h-px w-16 bg-gray-200 my-6" />
    <div className="grid grid-cols-3 gap-6 text-sm text-gray-500">
      {SPEC_ITEMS.map((item) => (
        <div key={item.label} className="flex flex-col">
          <span className="uppercase tracking-wider">{item.label}</span>
          <span className="text-xl font-medium text-gray-900">
            {item.label === 'Loop' ? (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {item.value}
              </motion.span>
            ) : (
              item.value
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// [数据] 斯坦福兔子的 2D 顶点数据 (无需改动)
const BUNNY_VERTICES = [
  [0.021, -0.063], [0.038, -0.058], [0.052, -0.051], [0.063, -0.041], [0.068, -0.029], [0.07, -0.017], [0.07, -0.005], [0.068, 0.006], [0.064, 0.016], [0.058, 0.024], [0.051, 0.03], [0.042, 0.035], [0.032, 0.038], [0.022, 0.041], [0.012, 0.043], [0.002, 0.044], [-0.009, 0.045], [-0.02, 0.046], [-0.03, 0.046], [-0.041, 0.046], [-0.051, 0.045], [-0.061, 0.044], [-0.07, 0.042], [-0.078, 0.04], [-0.086, 0.038], [-0.093, 0.035], [-0.1, 0.032], [-0.106, 0.028], [-0.111, 0.024], [-0.115, 0.02], [-0.119, 0.015], [-0.122, 0.01], [-0.124, 0.005], [-0.126, -0.001], [-0.127, -0.006], [-0.128, -0.012], [-0.128, -0.018], [-0.128, -0.023], [-0.127, -0.029], [-0.126, -0.035], [-0.124, -0.04], [-0.122, -0.045], [-0.119, -0.05], [-0.116, -0.054], [-0.112, -0.058], [-0.108, -0.061], [-0.103, -0.064], [-0.098, -0.066], [-0.093, -0.068], [-0.087, -0.069], [-0.081, -0.07], [-0.075, -0.071], [-0.069, -0.071], [-0.063, -0.071], [-0.057, -0.071], [-0.051, -0.07], [-0.045, -0.069], [-0.039, -0.068], [-0.033, -0.067], [-0.027, -0.066], [-0.02, -0.064], [-0.014, -0.063], [-0.007, -0.062], [0.0, -0.062], [0.008, -0.062], [0.014, -0.062], [0.081, -0.022], [0.084, -0.011], [0.085, 0.001], [0.084, 0.012], [0.082, 0.022], [0.078, 0.031], [0.073, 0.038], [0.066, 0.044], [0.059, 0.049], [0.051, 0.052], [0.043, 0.055], [0.034, 0.057], [0.025, 0.059], [0.016, 0.06], [0.007, 0.06], [-0.002, 0.06], [-0.012, 0.06], [-0.021, 0.059], [-0.03, 0.058], [-0.04, 0.056], [-0.049, 0.054], [-0.058, 0.052], [-0.067, 0.049], [-0.076, 0.046], [-0.085, 0.042], [-0.093, 0.038], [-0.101, 0.033], [-0.109, 0.028], [-0.115, 0.023], [-0.121, 0.018], [-0.126, 0.012], [-0.131, 0.006], [-0.135, -0.001], [-0.138, -0.007], [-0.141, -0.013], [-0.143, -0.02], [-0.145, -0.026], [-0.146, -0.032], [-0.147, -0.038], [-0.147, -0.045], [-0.147, -0.051], [-0.146, -0.057], [-0.145, -0.063], [-0.143, -0.069], [-0.141, -0.075], [-0.138, -0.08], [-0.135, -0.086], [-0.131, -0.091], [-0.127, -0.096], [-0.122, -0.1], [-0.117, -0.104], [-0.111, -0.107], [-0.105, -0.11], [-0.099, -0.112], [-0.092, -0.114], [-0.085, -0.115], [-0.078, -0.116], [-0.071, -0.116], [-0.064, -0.116], [-0.057, -0.115], [-0.05, -0.114], [-0.043, -0.112], [-0.036, -0.11], [-0.029, -0.107], [-0.023, -0.104], [-0.017, -0.1], [-0.011, -0.096], [-0.005, -0.091], [0.001, -0.086], [0.007, -0.08], [0.013, -0.075], [0.019, -0.069], [0.025, -0.063], [0.031, -0.057], [0.037, -0.051], [0.042, -0.045], [0.047, -0.038], [0.051, -0.032], [0.055, -0.026], [0.058, -0.02], [0.06, -0.013], [0.062, -0.007], [0.064, -0.001], [0.091, -0.028], [0.094, -0.017], [0.096, -0.006], [0.096, 0.006], [0.094, 0.017], [0.091, 0.028], [0.033, 0.061], [0.024, 0.063], [0.015, 0.064], [0.005, 0.065], [-0.005, 0.065], [-0.015, 0.064], [-0.024, 0.063], [-0.034, 0.061], [-0.12, 0.031], [-0.128, 0.028], [-0.135, 0.024], [-0.141, 0.02], [-0.147, 0.016], [-0.152, 0.011], [-0.156, 0.006], [-0.159, 0.001], [-0.162, -0.005], [-0.164, -0.011], [-0.165, -0.017], [-0.166, -0.023], [-0.166, -0.029], [-0.166, -0.035], [-0.165, -0.041], [-0.164, -0.047], [-0.162, -0.053], [-0.159, -0.059], [-0.156, -0.064], [-0.152, -0.07], [-0.147, -0.075], [-0.141, -0.08], [-0.135, -0.085], [-0.128, -0.089], [-0.12, -0.092], [0.092, 0.076], [0.092, 0.085], [0.092, 0.094], [0.092, 0.102], [0.09, 0.111], [0.088, 0.119], [0.086, 0.127], [0.083, 0.134], [0.08, 0.141], [0.077, 0.148], [0.073, 0.154], [0.069, 0.159], [0.064, 0.164], [0.06, 0.169], [0.055, 0.173], [0.05, 0.176], [0.045, 0.179], [0.04, 0.182], [0.035, 0.184], [0.03, 0.185], [0.025, 0.186], [0.02, 0.187], [0.015, 0.187], [0.01, 0.188], [0.005, 0.188], [0.0, 0.188], [-0.005, 0.188], [-0.01, 0.188], [-0.015, 0.187], [-0.02, 0.187], [-0.025, 0.186], [-0.03, 0.185], [-0.035, 0.184], [-0.04, 0.182], [-0.045, 0.179], [-0.05, 0.176], [-0.055, 0.173], [-0.06, 0.169], [-0.064, 0.164], [-0.069, 0.159], [-0.073, 0.154], [-0.077, 0.148], [-0.08, 0.141], [-0.083, 0.134], [-0.086, 0.127], [-0.088, 0.119], [-0.09, 0.111], [-0.092, 0.102], [-0.092, 0.094], [-0.092, 0.085], [-0.092, 0.076], [0.086, 0.053], [0.082, 0.058], [0.077, 0.063], [0.071, 0.067], [0.064, 0.07], [0.057, 0.073], [0.05, 0.075], [0.043, 0.076], [0.035, 0.077], [0.027, 0.077], [0.019, 0.077], [0.01, 0.077], [0.002, 0.076], [-0.007, 0.075], [-0.015, 0.074], [-0.023, 0.072], [-0.031, 0.07], [-0.039, 0.067], [-0.047, 0.064], [-0.054, 0.061], [-0.062, 0.057], [-0.069, 0.053], [-0.076, 0.049], [-0.084, 0.044], [-0.091, 0.039], [-0.097, 0.034], [-0.104, 0.029], [-0.11, 0.024], [-0.116, 0.019], [-0.122, 0.013], [-0.127, 0.007], [-0.131, 0.0], [-0.135, -0.006], [-0.138, -0.013], [-0.141, -0.019], [-0.144, -0.025], [-0.146, -0.031], [-0.147, -0.037], [-0.148, -0.044], [-0.148, -0.05], [-0.148, -0.056], [-0.147, -0.062], [-0.146, -0.068], [-0.144, -0.074], [-0.141, -0.079], [-0.138, -0.085], [-0.134, -0.09], [-0.13, -0.095], [-0.126, -0.099], [-0.121, -0.103], [-0.115, -0.106], [-0.11, -0.109], [-0.104, -0.112], [-0.098, -0.114], [-0.091, -0.115], [-0.084, -0.116], [-0.077, -0.117], [-0.07, -0.117], [-0.063, -0.117], [-0.056, -0.116], [-0.049, -0.115], [-0.042, -0.113], [-0.035, -0.11], [-0.028, -0.108], [-0.022, -0.105], [-0.016, -0.101], [-0.01, -0.097], [-0.004, -0.092], [0.002, -0.087], [0.008, -0.081], [0.014, -0.076], [0.02, -0.07], [0.026, -0.064]
];

/**
  * [修改] 子组件：右侧的 SVG 动态图形
 * [修复] 修复了 useSpring(null) 的 TypeScript Bug
  */
const MotionGraphic: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // [修复] 分离 mouseX/Y (给粒子, 可为 null) 和 followerX/Y (给弹簧, 不可为 null)
  const mouseX = useMotionValue<number | null>(null);
  const mouseY = useMotionValue<number | null>(null);
  // [新增] 专门为 useSpring 准备的、不可为 null 的值
  const followerX = useMotionValue(SVG_CENTER); 
  const followerY = useMotionValue(SVG_CENTER);

  const followerControls = useAnimation(); // 鼠标跟随器的控制器
  
  // 为鼠标跟随器创建弹簧动画
  const springFollowerX = useSpring(followerX, SPRING_CONFIG);
  const springFollowerY = useSpring(followerY, SPRING_CONFIG);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
    followerX.set(x);
    followerY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(null);
    mouseY.set(null);
  };

  // 创建粒子数据
  const particles = useMemo(() => {
    return BUNNY_VERTICES.map(([x, y], i) => {
      const baseX = SVG_CENTER + x * BUNNY_SCALE;
      const baseY = SVG_CENTER + y * BUNNY_SCALE;
      return {
        id: `particle-${i}`,
        baseX,
        baseY,
        x: useMotionValue(baseX),
        y: useMotionValue(baseY),
      };
    });
  }, []);


  const latticeLines = useMemo(() => {
    const lines: Array<{ p1: ParticleData; p2: ParticleData }> = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.baseX - p2.baseX;
        const dy = p1.baseY - p2.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < CONNECT_THRESHOLD) {
          lines.push({ p1, p2 });
        }
      }
    }
    return lines;
  }, [particles]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <motion.svg
        ref={svgRef}
        width="520"
        height="520"
        viewBox="0 0 520 520"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        variants={svgVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 晶格线条 */}
        {latticeLines.map((line, i) => (
          <LatticeLine key={`line-${i}`} p1={line.p1} p2={line.p2} />
        ))}
        
        {/* 粒子 */}
        {particles.map((particle) => (
          <Particle
            key={particle.id}
            particle={particle}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        ))}

        {/* 鼠标跟随器 */}
        <motion.circle
          cx={springFollowerX}
          cy={springFollowerY}
          r={5}
          fill={ACCENT_COLOR}
          opacity={0.6}
          animate={followerControls}
        />
      </motion.svg>
    </div>
  );
};


const WordCloudHero: React.FC = () => { 
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white py-20">
      <div className="relative z-10 mx-auto max-w-6xl grid gap-12 px-6 md:grid-cols-[1fr 1fr] items-center">
        <HeroContent />
        <StanfordBunny3D />
      </div>
    </section>
  );
};

export default WordCloudHero; 
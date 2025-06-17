"use client";

import { motion } from 'framer-motion';

const wordsData = [
  { text: 'Variational Inference', size: 38, y: '45%', x: '65%' },
  { text: 'Bayesian Learning', size: 36, y: '60%', x: '40%' },
  { text: 'Optimal Transport', size: 34, y: '70%', x: '35%' },
  { text: 'Score Matching', size: 32, y: '25%', x: '20%' },
  { text: 'Fokker-Planck Equation', size: 30, y: '15%', x: '30%' },
  { text: 'Stochastic Process', size: 30, y: '65%', x: '75%' },
  { text: 'Causal Inference', size: 28, y: '40%', x: '45%' },
  { text: 'Manifold Learning', size: 28, y: '80%', x: '50%' },
  { text: 'Function Approximation', size: 26, y: '20%', x: '60%' },
  { text: 'Generalization Bound', size: 26, y: '35%', x: '75%' },
  { text: 'KL Divergence', size: 24, y: '30%', x: '55%' },
  { text: 'Entropy Minimization', size: 24, y: '85%', x: '65%' },
  { text: 'PAC Learning', size: 22, y: '30%', x: '15%' },
  { text: 'Latent Variable Model', size: 22, y: '50%', x: '25%' },
  { text: 'Hilbert Space', size: 20, y: '25%', x: '80%' },
  { text: 'Symbolic Reasoning', size: 20, y: '45%', x: '55%' },
  { text: 'Neural ODE', size: 20, y: '75%', x: '60%' },
  { text: 'Jacobian Matrix', size: 18, y: '40%', x: '10%' },
  { text: 'Gradient Descent', size: 18, y: '20%', x: '45%' },
  { text: 'Expectation Maximization', size: 18, y: '15%', x: '85%' },
  { text: 'Backpropagation', size: 16, y: '90%', x: '45%' },
  { text: 'Stochastic Optimization', size: 16, y: '10%', x: '70%' },
  { text: 'Empirical Risk Minimization', size: 16, y: '55%', x: '10%' },
  { text: 'Regularization', size: 14, y: '90%', x: '30%' },
  { text: 'Information Geometry', size: 14, y: '25%', x: '65%' },
  { text: 'Reproducing Kernel', size: 14, y: '70%', x: '85%' },
  { text: 'Rademacher Complexity', size: 12, y: '60%', x: '20%' },
  { text: 'VC Dimension', size: 12, y: '85%', x: '15%' },
  { text: 'Metric Space', size: 12, y: '10%', x: '15%' },
  { text: 'Theoretical Bounds', size: 12, y: '15%', x: '55%' },
  { text: 'Neural Networks', size: 14, y: '55%', x: '80%' },
];

const WordCloudHero: React.FC = () => {
  return (
    <section className="h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Floating Circles */}
      <div className="floating-circle bg-pku-red/40 w-40 h-40" style={{ top: '10%', left: '10%', animationDelay: '0s' }}></div>
      <div className="floating-circle bg-klein-blue/40 w-32 h-32" style={{ top: '20%', right: '15%', animationDelay: '2s' }}></div>
      <div className="floating-circle bg-pku-red/40 w-24 h-24" style={{ bottom: '15%', left: '20%', animationDelay: '4s' }}></div>
      <div className="floating-circle bg-klein-blue/40 w-52 h-52" style={{ bottom: '25%', right: '10%', animationDelay: '6s' }}></div>

      {/* Word Cloud */}
      <div className="absolute inset-0 z-10">
        {wordsData.map((word, i) => (
          <motion.div
            key={i}
            className="absolute whitespace-nowrap font-medium"
            style={{
              top: word.y,
              left: word.x,
              fontSize: word.size,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Inter, sans-serif',
              color: '#0f59a4',
              cursor: 'pointer'
            }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -6, 0]
            }}
            transition={{
              opacity: { delay: i * 0.05, duration: 0.5 },
              scale: { delay: i * 0.05, duration: 0.5 },
              y: {
                delay: i * 0.2,
                duration: 6,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut'
              }
            }}
            whileHover={{
              color: '#8A0000',
              scale: 1.15,
              y: 0,
              transition: { duration: 0.2, y: { duration: 0.2, ease: 'easeOut' } }
            }}
          >
            {word.text}
          </motion.div>
        ))}
      </div>

      {/* Center Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
        <h1 id="plote-logo-main" className="text-8xl font-black tracking-tighter">Plote</h1>
        <p className="text-xl text-gray-300 mt-2">Researcher • Scholar • Thinker</p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
         <a href="#profile" className="text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
         </a>
      </div>
    </section>
  );
};

export default WordCloudHero; 
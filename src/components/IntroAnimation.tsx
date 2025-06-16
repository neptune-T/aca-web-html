"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const keywords = ["Generative AI", "Cognitive Science", "Diffusion", "Score Function", "Latent Space", "Transformer", "Variational Inference", "Symbolic Reasoning", "Knowledge Representation", "Neural-Symbolic Integration", "Cognitive Architecture", "Manifold Learning", "Optimal Transport", "Stochastic Process", "Bayesian Inference", "Posterior Sampling", "Fokker-Planck Equation", "Denoising Process", "Reverse SDE", "Noise Schedule", "Classifier-Free Guidance", "Latent Diffusion", "Autoregressive Modeling", "Token Embedding", "Positional Encoding", "Discrete Codebook", "Vector Quantization", "Style Transfer", "Attention Mechanism", "Residual Connection", "Multimodal Learning", "Image-to-Image", "Guided Sampling", "Content Conditioning", "Perceptual Loss", "Gram Matrix", "AdaIN Modulation", "ELBO Objective", "KL Divergence", "Entropy Minimization"];

const randomPositions = keywords.map(() => ({
  top: `${Math.random() * 80 + 10}%`,
  left: `${Math.random() * 80 + 10}%`,
  rotate: Math.random() * 40 - 20,
}));

const IntroAnimation = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      () => setStep(1), // Show keywords
      () => setStep(2), // Hide keywords
      () => setStep(3), // Show blue splash, centered
      () => setStep(4), // Expand splash to fill screen
      onAnimationComplete,
    ];
    
    const timeouts = [3500, 500, 200, 800];
    let delay = 100;
    for (let i = 0; i < sequence.length; i++) {
      setTimeout(sequence[i], delay);
      delay += timeouts[i] || 0;
    }
  }, [onAnimationComplete]);

  return (
    <AnimatePresence>
      {step < 5 && (
         <motion.div
           className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden"
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
         >
           <AnimatePresence>
             {step === 1 && (
               <div className="w-full h-full relative">
                 {keywords.map((word, index) => (
                   <motion.div
                     key={word}
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     transition={{ duration: 0.5, delay: index * 0.15 }}
                     style={{
                       position: 'absolute',
                       top: randomPositions[index].top,
                       left: randomPositions[index].left,
                       rotate: randomPositions[index].rotate,
                     }}
                     className="text-white font-ibm-plex-serif text-2xl md:text-4xl whitespace-nowrap"
                   >
                     {word}
                   </motion.div>
                 ))}
               </div>
             )}
           </AnimatePresence>

           {step >= 3 && (
              <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: step === 4 ? 150 : 1 }}
               transition={{ duration: 1.0, ease: [0.6, 0.01, -0.05, 0.95] }}
               className="w-24 h-24 rounded-full bg-klein-blue"
             />
           )}
         </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation; 
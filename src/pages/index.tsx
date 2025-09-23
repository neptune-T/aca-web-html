"use client";

import WordCloudHero from '@/components/WordCloudHero';
import { motion, Variants } from 'framer-motion';
import { FaBook, FaFlask, FaUser } from 'react-icons/fa';

const Home = () => {
  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <main>
      {/* NEW Hero Section with Word Cloud - Now transparent */}
      <WordCloudHero />

      {/* Academic Introduction - With a semi-transparent card background for readability */}
      <motion.section 
        id="profile"
        className="py-20 px-4 md:px-10 lg:px-20 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="bg-black/30 backdrop-blur-sm p-8 md:p-12 rounded-xl">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-10 text-center text-white"
            variants={fadeInVariants}
          >
            Academic Profile
          </motion.h2>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16" variants={fadeInVariants}>
              <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">Research Interests</h3>
                  <p className="text-gray-300 leading-relaxed">
                    

                    My research interests lie in the theoretical foundations of generative modeling and their application to creating structurally coherent and physically plausible content. I approach this from a mathematical perspective, specifically studying diffusion and autoregressive models through their connections to Markov processes, stochastic differential equations, and Boltzmann-type distributions. My initial focus is on applying these principles to enhance structure-aware image generation, ensuring synthesized images are not just visually convincing but also compositionally sound. Building upon this, I extend these concepts from 2D to 3D, aiming to develop generative systems that understand the physical world. I am particularly intrigued by creating physically-grounded 3D models that possess an intrinsic understanding of their own geometry and material properties, which I see as a crucial step towards realistically modeling Human-Object Interaction (HOI). By ensuring models are grounded in physical reality, we can better simulate how objects respond to interaction. This same principle extends to resolving key challenges in video generation, where ensuring long-term temporal consistency remains a significant hurdle. My ultimate ambition is to contribute to the development of World Models by creating generative systems that unify rigorous mathematical modeling with a deep, intuitive grasp of physical dynamics and creative intelligence.

                  </p>
              </div>
              <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-100">Biography</h3>
                  <p className="text-gray-300 leading-relaxed">
                  I am an undergraduate with a dual academic focus in Computer Science and a physics-intensive Materials Science program. My passion for physics lies in understanding complex systems by deriving their behavior from first principles. I particularly enjoy rigorously working through foundational derivations, from using statistical mechanics to derive the Maxwell-Boltzmann distribution and Planck's law of black-body radiation, to exploring the fundamental postulates that lead to the Schrödinger equation in quantum mechanics. During my sophomore year, I delved into foundational computer science through hands-on systems projects. In compilers, I implemented a miniature front-end pipeline that transforms source code into an Abstract Syntax Tree (AST) and then into an intermediate representation, upon which I applied semantic analysis and basic optimizations. In operating systems, I extended the xv6 kernel through a series of experiments, engineering core functionalities such as copy-on-write fork to optimize memory usage, as well as sophisticated process schedulers and thread pool optimizations to ensure fair resource allocation under concurrent workloads. Over the past two years, my focus has converged on the intersection of machine learning, mathematical reasoning, and interactive 3D generation. I have explored the theoretical underpinnings of diffusion models by investigating concepts such as Schrödinger Bridges with my knowledge of mathematical statistics. More recently, my work has shifted towards application, where I am exploring 3D interactivity from a physics-based perspective. My current goal is to develop AI systems that can understand and interact with the world in a physically coherent manner.

                  
                  </p>
              </div>
          </motion.div>
          
          <motion.div className="mb-16" variants={fadeInVariants}>
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Selected Publications</h3>
              {/* <ul className="space-y-4">
                  <li className="border-l-4 pl-4 border-klein-blue/70">
                      <p className="font-medium text-gray-200">&quot;Cognitive Architectures for Explainable AI&quot;</p>
                      <p className="text-gray-400">Nature Machine Intelligence, 2023</p>
                  </li>
                  <li className="border-l-4 pl-4 border-klein-blue/70">
                      <p className="font-medium text-gray-200">&quot;Neural-Symbolic Integration in Large Language Models&quot;</p>
                      <p className="text-gray-400">AAAI Conference, 2022</p>
                  </li>
                  <li className="border-l-4 pl-4 border-klein-blue/70">
                      <p className="font-medium text-gray-200">&quot;Knowledge Representation in Hybrid Learning Systems&quot;</p>
                      <p className="text-gray-400">Journal of Artificial Intelligence Research, 2021</p>
                  </li>
              </ul> */}
          </motion.div>
          
          <motion.div variants={fadeInVariants}>
              <h3 className="text-2xl font-semibold mb-4 text-gray-100">Affiliations</h3>
              <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-full bg-gray-500/30 text-gray-200 transition-colors hover:bg-blue-400/50 hover:text-white">Peking University (Visiting)</div>
                  <div className="px-4 py-2 rounded-full bg-gray-500/30 text-gray-200 transition-colors hover:bg-blue-400/50 hover:text-white">Institute of Automation，Chinese Academy of Sciences (Visiting)</div>
              </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Academic Columns - Styling updated for dark background */}
      <section className="py-20 px-4 md:px-10 lg:px-20">
          <div className="max-w-6xl mx-auto">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-10 text-center text-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeInVariants}
              >
                Academic Columns
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div className="p-6 rounded-lg group backdrop-blur-sm bg-black/20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--peking-red)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaFlask className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-100">笔记</h3>
                      </div>
                      <p className="text-gray-300 mb-4">Research notes and methodological insights from my ongoing projects and experiments.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-500/20 hover:bg-red-500/40">Cognitive Models</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-500/20 hover:bg-blue-500/40">Experimental Design</a>
                      </div>
                  </motion.div>
                  
                  <motion.div className="p-6 rounded-lg group backdrop-blur-sm bg-black/20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.2}} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                           <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--klein-blue)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaBook className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-100">论文介绍</h3>
                      </div>
                      <p className="text-gray-300 mb-4">Critical reviews and summaries of influential papers in AI and cognitive science.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-500/20 hover:bg-blue-500/40">Recent Publications</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-500/20 hover:bg-red-500/40">Classic Papers</a>
                      </div>
                  </motion.div>

                  <motion.div className="p-6 rounded-lg group backdrop-blur-sm bg-black/20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.4}} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--peking-red)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaUser className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-100">关于我</h3>
                      </div>
                      <p className="text-gray-300 mb-4">Personal reflections on academic life, research philosophy, and interdisciplinary thinking.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-500/20 hover:bg-red-500/40">Academic Journey</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-500/20 hover:bg-blue-500/40">Teaching Philosophy</a>
                      </div>
                  </motion.div>
              </div>
        </div>
      </section>
      </main>
  );
};

export default Home;

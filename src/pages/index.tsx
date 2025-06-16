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
      {/* NEW Hero Section with Word Cloud */}
      <WordCloudHero />

      {/* Academic Introduction */}
      <motion.section 
        id="profile"
        className="py-20 px-4 md:px-10 lg:px-20 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInVariants}
      >
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-klein-blue">Academic Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Research Interests</h3>
                  <p className="text-gray-600 leading-relaxed">
                      My research focuses on the intersection of artificial intelligence and cognitive science, 
                      exploring how computational models can enhance our understanding of human learning processes. 
                      I&apos;m particularly interested in neural-symbolic integration and knowledge representation.
                  </p>
              </div>
              <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Biography</h3>
                  <p className="text-gray-600 leading-relaxed">
                      I received my Ph.D. from Peking University, where I worked on developing novel frameworks 
                      for machine learning interpretability. Prior to that, I completed my undergraduate studies 
                      at Tsinghua University with honors in Computer Science and Cognitive Psychology.
                  </p>
              </div>
          </div>
          
          <div className="mb-16">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Selected Publications</h3>
              <ul className="space-y-4">
                  <li className="border-l-4 pl-4 border-klein-blue/50">
                      <p className="font-medium text-gray-800">&quot;Cognitive Architectures for Explainable AI&quot;</p>
                      <p className="text-gray-500">Nature Machine Intelligence, 2023</p>
                  </li>
                  <li className="border-l-4 pl-4 border-klein-blue/50">
                      <p className="font-medium text-gray-800">&quot;Neural-Symbolic Integration in Large Language Models&quot;</p>
                      <p className="text-gray-500">AAAI Conference, 2022</p>
                  </li>
                  <li className="border-l-4 pl-4 border-klein-blue/50">
                      <p className="font-medium text-gray-800">&quot;Knowledge Representation in Hybrid Learning Systems&quot;</p>
                      <p className="text-gray-500">Journal of Artificial Intelligence Research, 2021</p>
                  </li>
              </ul>
          </div>
          
          <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Affiliations</h3>
              <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-blue-100 hover:text-klein-blue">Peking University</div>
                  <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-blue-100 hover:text-klein-blue">Tsinghua University</div>
                  <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-blue-100 hover:text-klein-blue">MIT Media Lab (Visiting)</div>
                  <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-blue-100 hover:text-klein-blue">Stanford AI Lab (Visiting)</div>
              </div>
          </div>
      </motion.section>

      {/* Academic Columns */}
      <section className="py-20 px-4 md:px-10 lg:px-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-10 text-center text-klein-blue"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeInVariants}
              >
                Academic Columns
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div className="academic-card bg-white p-6 rounded-lg group" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--peking-red)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaFlask className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-800">笔记</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Research notes and methodological insights from my ongoing projects and experiments.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-50 hover:bg-red-100">Cognitive Models</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-50 hover:bg-blue-100">Experimental Design</a>
                      </div>
                  </motion.div>
                  
                  <motion.div className="academic-card bg-white p-6 rounded-lg group" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.2}} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                           <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--klein-blue)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaBook className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-800">论文介绍</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Critical reviews and summaries of influential papers in AI and cognitive science.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-50 hover:bg-blue-100">Recent Publications</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-50 hover:bg-red-100">Classic Papers</a>
                      </div>
                  </motion.div>

                  <motion.div className="academic-card bg-white p-6 rounded-lg group" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{delay: 0.4}} variants={fadeInVariants}>
                      <div className="flex items-center mb-4">
                          <motion.div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--peking-red)' }} whileHover={{ scale: 1.1, rotate: 5 }}>
                              <FaUser className="w-5 h-5 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold chinese-font text-gray-800">关于我</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Personal reflections on academic life, research philosophy, and interdisciplinary thinking.</p>
                      <div className="space-y-2">
                          <a href="#" className="block px-3 py-1 rounded text-sm text-peking-red bg-red-50 hover:bg-red-100">Academic Journey</a>
                          <a href="#" className="block px-3 py-1 rounded text-sm text-klein-blue bg-blue-50 hover:bg-blue-100">Teaching Philosophy</a>
                      </div>
                  </motion.div>
              </div>
        </div>
      </section>
      </main>
  );
};

export default Home;

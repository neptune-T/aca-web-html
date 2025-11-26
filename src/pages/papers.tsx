import { getSortedPapersData } from '@/lib/papers'; // 引入刚才第一步写好的逻辑
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
// 如果没有安装 lucide-react，请运行 npm install lucide-react
import { Calendar, MapPin, Users, FileText, Github, Globe } from 'lucide-react';

// --- 数据获取 (Next.js 服务端渲染) ---
export async function getStaticProps() {
  const allPapersData = getSortedPapersData();
  return {
    props: {
      allPapersData,
    },
  };
}

// 定义 Paper 类型
type Paper = {
  id: string;
  title: string;
  date: string;
  image?: string;
  summary: string;
  authors: string;
  venue: string;
  url?: string;          
  arxiv_url?: string;    
  github_url?: string;   
  huggingface_url?: string;
};

export default function Papers({ allPapersData }: { allPapersData: Paper[] }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 强制同步 Body 背景
  useEffect(() => {
    const bg = isDarkMode ? '#050505' : '#F9F9F9';
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;
  }, [isDarkMode]);

  // --- 样式主题 (保持黑白高对比 + 毛玻璃) ---
  const theme = {
    wrapper: isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F9F9F9] text-[#1a1a1a]',
    
    titleColor: isDarkMode ? 'text-white' : 'text-black',
    textColor: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    metaColor: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    accentColor: isDarkMode ? 'text-blue-300' : 'text-blue-600',

    // 卡片：深灰毛玻璃 vs 白毛玻璃
    card: isDarkMode
      ? 'bg-[#141414]/90 backdrop-blur-md border border-white/10 hover:border-white/30 shadow-xl'
      : 'bg-white/90 backdrop-blur-md border border-black/5 hover:border-black/10 shadow-sm hover:shadow-md',
    
    // 链接按钮
    linkBtn: isDarkMode
      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
      : 'bg-black/5 hover:bg-black/10 text-black border border-black/5',
      
    divider: isDarkMode ? 'border-white/10' : 'border-black/10',
  };

  return (
    <>
      <Head>
        <title>Papers | Plote Motion Field</title>
        <meta name="description" content="Selected publications and research papers." />
      </Head>

      <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500/30 flex flex-col ${theme.wrapper}`}>
        
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <main className="flex-grow pt-32 md:pt-40 px-4 md:px-10 lg:px-20 pb-20 max-w-7xl mx-auto w-full">
          
          {/* 标题区域 */}
          <header className="mb-20 text-center md:text-left">
            <motion.h1 
              className={`text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight ${theme.titleColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Publications
            </motion.h1>
            <motion.p 
              className={`text-lg md:text-xl max-w-3xl leading-relaxed ${theme.textColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Selected research papers, conference proceedings, and preprints in Computer Vision and Generative AI.
            </motion.p>
          </header>

          {/* 论文列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allPapersData.map((paper, index) => (
              <motion.article
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={`group rounded-3xl flex flex-col transition-all duration-300 overflow-hidden ${theme.card}`}
              >
                
                {/* 1. 封面图区域 */}
                {paper.image && (
                  <div className="relative w-full h-64 overflow-hidden border-b border-opacity-10 border-gray-500">
                    <img 
                      src={paper.image} 
                      alt={paper.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {paper.venue}
                    </div>
                  </div>
                )}

                {/* 2. 内容区域 */}
                <div className="p-8 flex flex-col flex-grow">
                  
                  {!paper.image && (
                    <div className={`flex items-center gap-2 text-xs font-mono mb-4 uppercase tracking-wider ${theme.accentColor}`}>
                      <MapPin size={12} />
                      <span className="font-bold">{paper.venue}</span>
                    </div>
                  )}

                  <h2 className={`text-2xl font-bold mb-3 leading-tight group-hover:underline decoration-2 decoration-current underline-offset-4 ${theme.titleColor}`}>
                    {paper.title}
                  </h2>

                  <div className={`flex items-start gap-2 text-sm mb-5 ${theme.metaColor}`}>
                    <Users size={14} className="mt-1 flex-shrink-0" />
                    <span className="italic">{paper.authors}</span>
                  </div>

                  <p className={`text-sm leading-relaxed mb-8 line-clamp-3 flex-grow ${theme.textColor}`}>
                    {paper.summary}
                  </p>

                  {/* 3. 底部操作栏 */}
                  <div className={`pt-6 border-t border-dashed flex flex-wrap items-center gap-3 ${theme.divider}`}>
                    <div className={`flex items-center gap-2 text-xs font-mono mr-auto opacity-60 ${theme.metaColor}`}>
                      <Calendar size={12} />
                      {/* 防止 substr 报错，增加空值检查 */}
                      {(paper.date || '').substring(0, 7)}
                    </div>

                    {paper.arxiv_url && (
                      <a href={paper.arxiv_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${theme.linkBtn}`}>
                        <FileText size={14} /> Paper
                      </a>
                    )}
                    {paper.github_url && (
                      <a href={paper.github_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${theme.linkBtn}`}>
                        <Github size={14} /> Code
                      </a>
                    )}
                    {paper.url && (
                      <a href={paper.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${theme.linkBtn}`}>
                        <Globe size={14} /> Website
                      </a>
                    )}
                  </div>

                </div>
              </motion.article>
            ))}
          </div>

          {allPapersData.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <p className={`text-xl ${theme.textColor}`}>No papers found.</p>
            </div>
          )}

        </main>


      </div>
    </>
  );
}
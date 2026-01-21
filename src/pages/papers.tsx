import { getSortedPapersData } from '@/lib/papers';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Calendar, MapPin, Users, FileText, Github, Globe, Link as LinkIcon } from 'lucide-react';
import { withBasePath } from '@/lib/basePath';

// --- 类型定义 (移到顶部是更好的实践) ---
type Paper = {
  id: string;
  title: string;
  date: string;
  image?: string;
  video?: string;
  summary: string;
  authors: string;
  venue: string;
  url?: string;
  arxiv_url?: string;
  github_url?: string;
  huggingface_url?: string;
};

// --- 数据获取 ---
export async function getStaticProps() {
  const rawData = getSortedPapersData();
  
  // 🟢 修复：添加 eslint-disable 注释来允许这里使用 any
  // 因为 md gray-matter 解析出的原始数据类型确实很难定义，使用 any 是合理的妥协
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allPapersData = rawData.map((paper: any) => ({
    ...paper,
    // 如果是 Date 对象就转 ISO 字符串，如果是字符串就保持原样
    date: paper.date instanceof Date ? paper.date.toISOString() : String(paper.date),
  }));

  return {
    props: {
      allPapersData,
    },
  };
}

export default function Papers({ allPapersData }: { allPapersData: Paper[] }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const MY_NAME = 'Tianshan Zhang';
  const renderAuthors = (authors: string) => {
    if (!authors || !authors.includes(MY_NAME)) return <span className="italic">{authors}</span>;
    const parts = authors.split(MY_NAME);
    return (
      <span className="italic">
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <span
                className={`not-italic font-extrabold ${
                  isDarkMode ? 'text-white drop-shadow-sm' : 'text-black'
                }`}
              >
                {MY_NAME}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  // 强制同步 Body 背景
  useEffect(() => {
    const bg = isDarkMode ? '#050505' : '#F9F9F9';
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;
  }, [isDarkMode]);

  // --- 样式主题 ---
  const theme = {
    wrapper: isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F9F9F9] text-[#1a1a1a]',
    titleColor: isDarkMode ? 'text-white' : 'text-black',
    textColor: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    metaColor: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    accentColor: isDarkMode ? 'text-blue-300' : 'text-blue-600',

    // 卡片：深灰玻璃 vs 白玻璃
    card: isDarkMode
      ? 'bg-[#141414] border border-white/10 hover:border-white/30 shadow-xl overflow-hidden'
      : 'bg-white border border-black/5 hover:border-black/10 shadow-sm hover:shadow-md overflow-hidden',
    
    // 链接按钮 (Small Pills)
    linkBtn: isDarkMode
      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
      : 'bg-black/5 hover:bg-black/10 text-black border border-black/5',
      
    divider: isDarkMode ? 'border-white/10' : 'border-black/10',
  };

  const linkBtnByType = (type: 'paper' | 'code' | 'website' | 'huggingface') => {
    if (type === 'huggingface') {
      return isDarkMode
        ? 'bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-200 border border-yellow-400/30'
        : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200';
    }
    if (type === 'paper') {
      return isDarkMode
        ? 'bg-[#B31B1B]/15 hover:bg-[#B31B1B]/25 text-[#ffb4b4] border border-[#B31B1B]/35'
        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200';
    }
    if (type === 'website') {
      return isDarkMode
        ? 'bg-blue-400/15 hover:bg-blue-400/25 text-blue-200 border border-blue-400/30'
        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200';
    }
    // code
    return theme.linkBtn;
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

          {/* 论文列表 (Grid Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {allPapersData.map((paper, index) => (
              <motion.article
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={`group rounded-3xl flex flex-col transition-all duration-300 ${theme.card}`}
              >
                
                {/* 1. 封面区域（优先视频，其次图片） */}
                {(paper.video || paper.image) && (
                  <div className="relative w-full h-64 overflow-hidden border-b border-opacity-10 border-gray-500">
                    {paper.video ? (
                      <video
                        className="w-full h-full object-cover"
                        src={withBasePath(paper.video)}
                        poster={paper.image ? withBasePath(paper.image) : undefined}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={withBasePath(paper.image!)}
                        alt={paper.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-md text-white border border-white/10 z-10">
                      {paper.venue}
                    </div>
                  </div>
                )}

                {/* 2. 内容区域 */}
                <div className="p-8 flex flex-col flex-grow">
                  
                  {/* Meta Info (没有图片时显示 Venue) */}
                  {!paper.image && (
                    <div className={`flex items-center gap-2 text-xs font-mono mb-4 uppercase tracking-wider ${theme.accentColor}`}>
                      <MapPin size={12} />
                      <span className="font-bold">{paper.venue}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className={`text-2xl font-bold mb-3 leading-tight group-hover:underline decoration-2 decoration-current underline-offset-4 ${theme.titleColor}`}>
                    {paper.title}
                  </h2>

                  {/* Authors */}
                  <div className={`flex items-start gap-2 text-sm mb-5 ${theme.metaColor}`}>
                    <Users size={14} className="mt-1 flex-shrink-0" />
                    {renderAuthors(paper.authors)}
                  </div>

                  {/* Summary */}
                  <p className={`text-sm leading-relaxed mb-8 line-clamp-3 flex-grow ${theme.textColor}`}>
                    {paper.summary}
                  </p>

                  {/* 3. 底部操作栏 (链接按钮) */}
                  <div className={`pt-6 border-t border-dashed flex flex-wrap items-center gap-3 ${theme.divider}`}>
                    <div className={`flex items-center gap-2 text-xs font-mono mr-auto opacity-60 ${theme.metaColor}`}>
                      <Calendar size={12} />
                      {paper.date.substring(0, 7)}
                    </div>

                    {paper.arxiv_url && (
                      <a
                        href={paper.arxiv_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${linkBtnByType('paper')}`}
                      >
                        <FileText size={14} /> arXiv
                      </a>
                    )}
                    {paper.github_url && (
                      <a href={paper.github_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${linkBtnByType('code')}`}>
                        <Github size={14} /> Code
                      </a>
                    )}
                    {paper.url && (
                      <a href={paper.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${linkBtnByType('website')}`}>
                        <Globe size={14} /> Website
                      </a>
                    )}
                    {paper.huggingface_url && (
                      <a href={paper.huggingface_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${linkBtnByType('huggingface')}`}>
                        <LinkIcon size={14} /> HuggingFace
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
import { getSortedNotesData } from '@/lib/notes';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import { Calendar, ArrowRight } from 'lucide-react';

// --- 数据获取 (保持不变) ---
export async function getStaticProps() {
  const allNotesData = getSortedNotesData();
  return {
    props: {
      allNotesData,
    },
  };
}

type Note = {
  id: string;
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  coverImage?: string;
};

export default function Notes({ allNotesData }: { allNotesData: Note[] }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // 强制同步 Body 背景，防止边缘闪白
  useEffect(() => {
    const bg = isDarkMode ? '#050505' : '#F9F9F9';
    document.body.style.backgroundColor = bg;
    document.documentElement.style.backgroundColor = bg;
  }, [isDarkMode]);

  const uniqueTags = ['all', ...new Set(allNotesData.flatMap(note => note.tags || []))];
  const filteredNotes = selectedTag === 'all' 
    ? allNotesData 
    : allNotesData.filter(note => note.tags?.includes(selectedTag));

  // --- 样式主题 (强制高对比度) ---
  const theme = {
    // 全局背景
    wrapper: isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F9F9F9] text-[#1a1a1a]',
    
    // 文字颜色 (强制指定，防止继承错误)
    titleColor: isDarkMode ? 'text-white' : 'text-black',
    textColor: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    metaColor: isDarkMode ? 'text-gray-500' : 'text-gray-400',

    // 卡片样式：黑夜模式用深灰底+白边框，白天用白底
    card: isDarkMode
      ? 'bg-[#141414] border border-white/10 hover:border-white/30 hover:bg-[#1a1a1a] shadow-xl'
      : 'bg-white border border-black/5 hover:border-black/10 shadow-sm hover:shadow-md',
    
    // 标签筛选按钮
    // 选中：黑夜(白底黑字)，白天(黑底白字) -> 确保最醒目
    filterBtnActive: isDarkMode 
      ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
      : 'bg-black text-white font-bold shadow-lg',
    
    // 未选中：黑夜(深灰底白字)，白天(浅灰底黑字)
    filterBtnInactive: isDarkMode
      ? 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
      : 'bg-black/5 text-gray-600 border border-black/5 hover:bg-black/10 hover:text-black',
      
    // 卡片内部小标签
    tagPill: isDarkMode 
      ? 'bg-white/5 text-gray-400 border border-white/10' 
      : 'bg-black/5 text-gray-600 border border-black/5',
    
    // 箭头圆圈背景
    arrowBg: isDarkMode 
      ? 'bg-white text-black' // 黑夜模式下箭头背景是白色，箭头是黑色
      : 'bg-black text-white', // 白天模式下箭头背景是黑色，箭头是白色

    divider: isDarkMode ? 'border-white/10' : 'border-black/10',
  };

  return (
    <>
      <Head>
        <title>Notes | Plote Motion Field</title>
        <meta name="description" content="Research notes and methodological insights." />
      </Head>

      <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500/30 flex flex-col ${theme.wrapper}`}>
        
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <main className="flex-grow pt-32 md:pt-40 px-4 md:px-10 lg:px-20 pb-20 max-w-7xl mx-auto w-full">
          
          {/* 标题区域 */}
          <header className="mb-16 text-center md:text-left">
            <motion.h1 
              className={`text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight ${theme.titleColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Research Notes
            </motion.h1>
            <motion.p 
              className={`text-lg md:text-xl max-w-2xl leading-relaxed ${theme.textColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              A collection of thoughts, explorations, and research findings in the field of Generative AI and Cognitive Science.
            </motion.p>
          </header>

          {/* 标签筛选区 */}
          <motion.div 
            className="mb-16 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
                  selectedTag === tag ? theme.filterBtnActive : theme.filterBtnInactive
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* 笔记卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(({ id, date, title, summary, tags, coverImage }, index) => (
              <motion.div
                key={id}
                layoutId={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
              >
                <Link href={`/notes/${id}`} legacyBehavior>
                  <a className={`group block h-full rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between ${theme.card}`}>
                    
                    {coverImage && (
                      <img 
                        src={coverImage} 
                        alt={title}
                        className="w-full h-40 object-cover rounded-lg mb-6"
                      />
                    )}

                    <div>
                      {/* 日期 */}
                      <div className={`flex items-center gap-2 text-xs font-mono mb-6 uppercase tracking-wider ${theme.metaColor}`}>
                        <Calendar size={14} />
                        <span>{date}</span>
                      </div>

                      {/* 标题 - 强制高亮 */}
                      <h2 className={`text-2xl font-bold mb-4 group-hover:underline decoration-2 decoration-current underline-offset-4 transition-all line-clamp-2 ${theme.titleColor}`}>
                        {title}
                      </h2>

                      {/* 摘要 */}
                      <p className={`text-sm leading-relaxed mb-8 line-clamp-3 ${theme.textColor}`}>
                        {summary}
                      </p>
                    </div>

                    {/* 底部标签栏 */}
                    <div className={`flex items-center justify-between mt-auto pt-6 border-t border-dashed ${theme.divider}`}>
                      <div className="flex flex-wrap gap-2">
                        {tags && tags.slice(0, 2).map(tag => (
                          <span 
                            key={tag} 
                            className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide ${theme.tagPill}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* 箭头按钮 */}
                      <div className={`p-3 rounded-full transition-transform duration-300 group-hover:-rotate-45 shadow-lg ${theme.arrowBg}`}>
                        <ArrowRight size={18} />
                      </div>
                    </div>

                  </a>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 空状态 */}
          {filteredNotes.length === 0 && (
            <div className="text-center py-20 opacity-50">
              <p className={`text-xl ${theme.textColor}`}>No notes found with this tag.</p>
            </div>
          )}

        </main>



      </div>
    </>
  );
}
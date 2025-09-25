import { getSortedPapersData } from '@/lib/papers';
import { motion } from 'framer-motion';
import { SiArxiv, SiGithub, SiHuggingface } from 'react-icons/si';
import Image from 'next/image';

export async function getStaticProps() {
  const allPapersData = getSortedPapersData();
  return {
    props: {
      allPapersData,
    },
  };
}

type Paper = {
  id: string;
  title: string;
  image: string;
  summary: string;
  authors: string;
  venue: string;
  url?: string;
  arxiv_url?: string;
  github_url?: string;
  huggingface_url?: string;
  gifUrl?: string; // 添加 GIF 图片字段
};

export default function Papers({ allPapersData = [] }: { allPapersData: Paper[] }) {
  // 获取基础路径
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // 处理资源路径函数
  const withBasePath = (path: string): string => {
    if (path.startsWith('http')) return path;
    return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
  };

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Papers
          </motion.h1>
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Summaries and reviews of academic papers in Generative AI.
          </motion.p>
        </header>

        <main>
          <ul className="space-y-8">
            {allPapersData.map(({ 
              id, 
              title, 
              image, 
              url, 
              arxiv_url, 
              github_url, 
              huggingface_url, 
              summary, 
              authors, 
              venue,
              gifUrl
            }, index) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              >
                <div className="block p-3 rounded-lg backdrop-blur-[20px] border-none transition-all duration-300 hover:shadow-md hover:bg-[rgba(156, 95, 95, 0.65)] hover:border-gray-700">
                  <div className="flex flex-col md:flex-row items-start md:items-center pl-5">
                    <div className="md:w-1/3 mb-4 md:mb-0 md:pr-6">
                      <Image 
                        src={withBasePath(image)} 
                        alt={title} 
                        width={400} 
                        height={300} 
                        className="w-full h-auto rounded-md shadow-sm" 
                      />
                    </div>
                    <div className="md:w-2/3">
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold text-gray-100 mb-1 hover:text-blue-300">
                          {title}
                        </a>
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-100 mb-1">{title}</h2>
                      )}
                      <p className="text-sm text-gray-300 mt-1">{summary}</p>
                      <p className="text-sm text-indigo-300 mt-1">Authors: {authors}</p>
                      <p className="text-sm text-purple-400 mt-1">Venue: {venue}</p>
                      <div className="flex mt-2">
                        {arxiv_url && (
                          <a href={arxiv_url} target="_blank" rel="noopener noreferrer" className="mr-4 text-gray-400 hover:text-red-500">
                            <SiArxiv className="text-xl" />
                          </a>
                        )}
                        {github_url && (
                          <a href={github_url} target="_blank" rel="noopener noreferrer" className="mr-4 text-gray-400 hover:text-gray-800">
                            <SiGithub className="text-xl" />
                          </a>
                        )}
                        {huggingface_url && (
                          <a href={huggingface_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500">
                            <SiHuggingface className="text-xl" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 添加 GIF 展示区域 */}
                  {gifUrl && (
                    <div className="mt-4 px-5">
                      <img 
                        src={withBasePath(gifUrl)} 
                        alt={`${title} 演示`} 
                        className="rounded-lg shadow-lg w-full max-w-2xl mx-auto"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
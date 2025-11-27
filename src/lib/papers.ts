import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 指向你的 _papers 文件夹
const papersDirectory = path.join(process.cwd(), '_papers');

interface Paper {
  id: string;
  title: string;
  image: string;
  summary: string;
  authors: string;
  venue: string;
  date: string; // Add this
  url?: string;
  arxiv_url?: string;
  github_url?: string;
  huggingface_url?: string;
  gifUrl?: string;
}

export const getSortedPapersData = (): Paper[] => {
  // 1. 检查文件夹是否存在，防止报错
  if (!fs.existsSync(papersDirectory)) {
    console.warn("'_papers' directory not found. Please create it in the root folder.");
    return [];
  }

  // 2. 读取文件名
  const fileNames = fs.readdirSync(papersDirectory);
  
  const allPapersData: Paper[] = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(papersDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // 3. 验证必要字段
      if (!matterResult.data.title || !matterResult.data.date) {
        return null;
      }

      return {
        id,
        ...matterResult.data as Omit<Paper, 'id'>, // Type as Paper fields
      };
    })
    // 过滤掉格式不对的 null
    .filter((paper): paper is Paper => paper !== null);

  // 4. 按日期排序
  return allPapersData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}
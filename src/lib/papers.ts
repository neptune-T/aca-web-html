import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 指向你的 _papers 文件夹
const papersDirectory = path.join(process.cwd(), '_papers');

export function getSortedPapersData() {
  // 1. 检查文件夹是否存在，防止报错
  if (!fs.existsSync(papersDirectory)) {
    console.warn("'_papers' directory not found. Please create it in the root folder.");
    return [];
  }

  // 2. 读取文件名
  const fileNames = fs.readdirSync(papersDirectory);
  
  const allPapersData = fileNames
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
        title: matterResult.data.title,
        // 确保日期转换为字符串，防止序列化错误
        date: matterResult.data.date instanceof Date ? matterResult.data.date.toISOString() : matterResult.data.date,
        image: matterResult.data.image || null,
        summary: matterResult.data.summary || '',
        authors: matterResult.data.authors || '',
        venue: matterResult.data.venue || '',
        url: matterResult.data.url || '',
        arxiv_url: matterResult.data.arxiv_url || '',
        github_url: matterResult.data.github_url || '',
        huggingface_url: matterResult.data.huggingface_url || '',
      };
    })
    // 过滤掉格式不对的 null
    .filter((paper): paper is any => paper !== null);

  // 4. 按日期排序
  return allPapersData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}
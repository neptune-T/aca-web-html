import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

const papersDirectory = path.join(process.cwd(), '_papers');

export function getSortedPapersData() {
  if (!fs.existsSync(papersDirectory)) {
    console.warn("'_papers' directory not found. No papers will be displayed.");
    return [];
  }

  const fileNames = fs.readdirSync(papersDirectory);
  const allPapersData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(papersDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      if (!matterResult.data.title || !matterResult.data.date || !matterResult.data.image || !matterResult.data.summary || !matterResult.data.authors || !matterResult.data.venue) {
        console.warn(`Paper with id '${id}' is missing required frontmatter and will be skipped.`);
        return null;
      }

      return {
        id,
        title: matterResult.data.title,
        date: matterResult.data.date instanceof Date ? matterResult.data.date.toISOString() : matterResult.data.date,
        image: matterResult.data.image,
        summary: matterResult.data.summary,
        authors: matterResult.data.authors,
        venue: matterResult.data.venue,
        url: matterResult.data.url || '',
        arxiv_url: matterResult.data.arxiv_url || '',
        github_url: matterResult.data.github_url || '',
        huggingface_url: matterResult.data.huggingface_url || '',
      };
    })
    .filter((paper): paper is { id: string; title: string; date: string; image: string; summary: string; authors: string; venue: string; url: string; arxiv_url: string; github_url: string; huggingface_url: string; } => paper !== null);

  return allPapersData.sort((a, b) => {
    if (!a || !b) return 0;
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { withBasePath } from '@/lib/basePath';

const notesDirectory = path.join(process.cwd(), '_notes');

export function getSortedNotesData() {
  if (!fs.existsSync(notesDirectory)) {
    console.warn("'_notes' directory not found. No notes will be displayed.");
    return [];
  }

  const fileNames = fs.readdirSync(notesDirectory);
  const allNotesData = fileNames
    .filter((fileName) => fileName.endsWith('.md')) // Ensure we only process markdown files
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(notesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // Extract first image from content
      const imageRegex = /!\[.*?\]\((.*?)\)/;
      const match = imageRegex.exec(matterResult.content);
      const coverImage = match ? withBasePath(match[1]) : '';

      if (!matterResult.data.title || !matterResult.data.date || !matterResult.data.summary) {
        console.warn(`Note with id '${id}' is missing required frontmatter and will be skipped.`);
        return null;
      }

      return {
        id,
        coverImage,
        ...(matterResult.data as { title: string; date: string; summary: string; tags?: string[] }),
      };
    })
    .filter((note): note is { id: string; coverImage: string; title: string; date: string; summary: string; tags?: string[] } => note !== null);

  return allNotesData.sort((a, b) => {
    if (a && b) {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    }
    return 0;
  });
}

export function getAllNoteIds() {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(notesDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md')) // Ensure we only process markdown files
    .map((fileName) => {
      return {
        params: {
          id: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

export async function getNoteData(id: string) {
  const fullPath = path.join(notesDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(matterResult.content);
  let contentHtml = processedContent.toString();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (basePath) {
    // 让 markdown 里写的 /img/... /notes/... 在 basePath 部署下也能正常工作
    contentHtml = contentHtml
      .replace(/(src|href)="\/(?!\/)/g, `$1="${basePath}/`);
  }

  // Extract first image from content
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = imageRegex.exec(matterResult.content);
  const coverImage = match ? withBasePath(match[1]) : '';

  return {
    id,
    contentHtml,
    coverImage,
    ...(matterResult.data as { title: string; date: string; summary: string; tags?: string[] }),
  };
} 
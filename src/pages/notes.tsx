import { getSortedNotesData } from '@/lib/notes';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Head from 'next/head';

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
};

export default function Notes({ allNotesData }: { allNotesData: Note[] }) {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const uniqueTags = ['all', ...new Set(allNotesData.flatMap(note => note.tags || []))];

  const filteredNotes = selectedTag === 'all' 
    ? allNotesData 
    : allNotesData.filter(note => note.tags?.includes(selectedTag));

  return (
    <>
      <Head>
        <title>Notes | My Personal Website</title>
        <meta name="description" content="A collection of thoughts and explorations in Generative AI." />
      </Head>
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <motion.h1 
              className="text-5xl font-extrabold tracking-tight text-old-red sm:text-6xl md:text-7xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              My Notes
            </motion.h1>
            <motion.p 
              className="mt-6 max-w-2xl mx-auto text-xl text-gray-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              A collection of thoughts, explorations, and research findings in the field of Generative AI.
            </motion.p>
          </header>

          <div className="mb-12 flex justify-center flex-wrap gap-3">
            {uniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTag === tag
                    ? 'bg-white/20 text-white shadow-md'
                    : 'bg-black/10 text-gray-300 hover:bg-black/20'
                } backdrop-blur-md border border-white/10 hover:border-white/20`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>

          <main>
            <ul className="space-y-8">
              {filteredNotes.map(({ id, date, title, summary, tags }, index) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  <Link href={`/notes/${id}`} legacyBehavior>
                    <a className="block p-8 rounded-xl bg-black/50 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:shadow-2xl hover:shadow-klein-blue/20 transform hover:-translate-y-1">
                      <p className="text-sm text-gray-100 mb-2 opacity-90">{date}</p>
                      <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
                      <p className="text-lg text-gray-100 mb-4 opacity-90">{summary}</p>
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-500/40 backdrop-blur-md rounded-full border border-red-300/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </main>
        </div>
      </div>
    </>
  );
} 
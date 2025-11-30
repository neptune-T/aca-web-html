import { getAllNoteIds, getNoteData } from '@/lib/notes';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/Header';

interface IParams extends ParsedUrlQuery {
  id: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllNoteIds();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as IParams;
  const noteData = await getNoteData(id);
  return {
    props: {
      noteData,
    },
  };
};

type NoteData = {
  title: string;
  date: string;
  contentHtml: string;
  coverImage?: string;
};

export default function Note({ noteData }: { noteData: NoteData }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <>
      <Head>
        <title>{noteData.title} | Plote</title>
      </Head>
      <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-purple-500/30 flex flex-col ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F9F9F9] text-[#1a1a1a]'}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <motion.div 
          className="flex-grow pt-32 md:pt-40 px-4 md:px-10 lg:px-20 pb-20 max-w-7xl mx-auto w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-10">
            <Link href="/notes" legacyBehavior>
              <a className="inline-flex items-center text-gray-300 hover:text-white transition-colors font-medium">
                <FiArrowLeft className="mr-2" />
                Back to all notes
              </a>
            </Link>
          </div>
          <div className="bg-black/30 backdrop-blur-lg p-8 md:p-12 rounded-xl">
            <article className="prose prose-lg prose-invert max-w-none 
                            prose-h1:text-4xl prose-h1:font-bold prose-h1:text-old-red 
                            prose-a:text-klein-blue hover:prose-a:text-opacity-80
                            prose-strong:text-gray-100
                            prose-code:text-old-red prose-code:bg-gray-500/20 prose-code:rounded-md prose-code:px-1.5 prose-code:py-1">
              <h1>{noteData.title}</h1>
              <p className="text-gray-400 text-base -mt-4 mb-8">{noteData.date}</p>
              <div dangerouslySetInnerHTML={{ __html: noteData.contentHtml }} />
            </article>
          </div>
        </motion.div>
      </div>
    </>
  );
} 
import { getAllNoteIds, getNoteData } from '@/lib/notes';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
};

export default function Note({ noteData }: { noteData: NoteData }) {
  return (
    <>
      <Head>
        <title>{noteData.title} | Plote</title>
      </Head>
      <motion.div 
        className="min-h-screen py-24 sm:py-32 dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
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
        </div>
      </motion.div>
    </>
  );
} 
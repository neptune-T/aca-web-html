import { getAllNoteIds, getNoteData } from '@/lib/notes';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';
import { FiArrowLeft } from 'react-icons/fi';

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
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-24 sm:py-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/notes" legacyBehavior>
              <a className="inline-flex items-center text-klein-blue hover:text-opacity-80 transition-colors">
                <FiArrowLeft className="mr-2" />
                Back to all notes
              </a>
            </Link>
          </div>
          <article className="prose prose-lg dark:prose-invert max-w-none prose-h1:text-4xl prose-h1:font-bold prose-h1:text-peking-red prose-a:text-klein-blue hover:prose-a:text-opacity-80">
            <h1>{noteData.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base -mt-4 mb-8">{noteData.date}</p>
            <div dangerouslySetInnerHTML={{ __html: noteData.contentHtml }} />
          </article>
        </div>
      </div>
    </>
  );
} 
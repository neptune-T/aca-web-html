import { getSortedNotesData } from '@/lib/notes';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
};

export default function Notes({ allNotesData }: { allNotesData: Note[] }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            My Notes
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            A collection of thoughts, explorations, and research findings in the field of Generative AI.
          </p>
        </header>

        <main>
          <ul className="space-y-8">
            {allNotesData.map(({ id, date, title, summary }, index) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/notes/${id}`} legacyBehavior>
                  <a className="block p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 border border-transparent hover:border-klein-blue dark:hover:border-klein-blue">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{date}</p>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{summary}</p>
                  </a>
                </Link>
              </motion.li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
} 
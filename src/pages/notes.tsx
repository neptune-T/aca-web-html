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
    <div className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl"
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

        <main>
          <ul className="space-y-8">
            {allNotesData.map(({ id, date, title, summary }, index) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
              >
                <Link href={`/notes/${id}`} legacyBehavior>
                  <a className="block p-8 rounded-xl bg-black/20 backdrop-blur-sm transition-all duration-300 hover:bg-black/40 hover:shadow-2xl hover:shadow-klein-blue/20 transform hover:-translate-y-1">
                    <p className="text-sm text-gray-400 mb-2">{date}</p>
                    <h2 className="text-3xl font-bold text-gray-100 mb-3">{title}</h2>
                    <p className="text-lg text-gray-300">{summary}</p>
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
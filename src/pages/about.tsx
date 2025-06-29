import { FaTrophy } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen text-gray-200">
      <main className="pt-28 pb-16 container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-bold font-ibm-plex-serif text-white mb-8">About Me</h1>
        
        <section className="mb-12 bg-black/20 backdrop-blur-sm p-8 rounded-lg">
          <p className="text-lg leading-relaxed text-gray-300">
            I am a passionate student with a deep interest in the intersection of mathematics, physics, and artificial intelligence.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-300">
            This page contains my academic profile, curriculum vitae, and contact information.
          </p>
        </section>

        {/* Honors and Awards Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
            <FaTrophy className="mr-3 text-klein-blue" />
            Honors & Awards
          </h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-klein-blue bg-black/20 backdrop-blur-sm rounded-r-lg">
              <p className="font-semibold text-lg text-gray-100">National Bronze Medal</p>
              <p className="text-gray-400">Chinese Mathematical Olympiad (CMO), 2021</p>
            </div>
            <div className="p-4 border-l-4 border-pku-red bg-black/20 backdrop-blur-sm rounded-r-lg">
              <p className="font-semibold text-lg text-gray-100">First Prize (Provincial Level)</p>
              <p className="text-gray-400">Chinese Chemistry Olympiad (CChO), 2020</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About; 
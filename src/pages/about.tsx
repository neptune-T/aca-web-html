import Header from '@/components/Header';

const About = () => {
  return (
    <div>
      <Header />
      <main className="pt-24 container mx-auto px-6">
        <h1 className="text-4xl font-bold font-ibm-plex-serif text-klein-blue">About</h1>
        <p className="mt-4 text-lg text-gray-600">CV, contact information, etc.</p>
        {/* Add more detailed about content here */}
      </main>
    </div>
  );
};

export default About; 
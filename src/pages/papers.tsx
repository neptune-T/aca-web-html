import Header from '@/components/Header';

const Papers = () => {
  return (
    <div>
      <Header />
      <main className="pt-24 container mx-auto px-6">
        <h1 className="text-4xl font-bold font-ibm-plex-serif text-klein-blue">Papers</h1>
        <p className="mt-4 text-lg text-gray-600">Summaries and reviews of academic papers.</p>
        {/* Add paper list or cards here */}
      </main>
    </div>
  );
};

export default Papers; 
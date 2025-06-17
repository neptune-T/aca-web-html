import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="py-10 px-4 md:px-10 lg:px-20 mt-20">
      <div className="max-w-6xl mx-auto bg-black/20 backdrop-blur-sm p-8 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-xl font-bold" style={{ color: 'var(--peking-red)' }}>Plote</p>
            <p className="text-gray-300">Academic Homepage</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaGithub size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin size={24} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-500/30 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Plote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
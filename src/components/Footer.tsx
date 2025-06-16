import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="py-10 px-4 md:px-10 lg:px-20 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-xl font-bold" style={{ color: 'var(--peking-red)' }}>Plote</p>
            <p className="text-gray-600">Academic Homepage</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-pku-red transition-colors">
              <FaGithub size={24} />
            </a>
            <a href="#" className="text-gray-500 hover:text-klein-blue transition-colors">
              <FaLinkedin size={24} />
            </a>
            <a href="#" className="text-gray-500 hover:text-pku-red transition-colors">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Plote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
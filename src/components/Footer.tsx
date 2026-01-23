import { useTheme } from '@/context/ThemeContext';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const { theme: currentTheme } = useTheme();
  const isDarkMode = currentTheme === 'dark';

  const newFooterContainer = isDarkMode
    ? 'bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 shadow-lg text-gray-200 rounded-3xl p-8 md:p-10'
    : 'bg-white/80 backdrop-blur-md border border-black/5 shadow-lg text-gray-800 rounded-3xl p-8 md:p-10';

  const footerDivider = isDarkMode ? 'bg-white/10' : 'bg-black/10';
  const footerIcon = isDarkMode ? 'hover:text-white text-gray-400' : 'hover:text-black text-gray-500';

  return (
    <footer className="w-full py-10 px-4 md:px-10 lg:px-20 flex justify-center relative z-10">
      <div className={`w-full max-w-6xl rounded-3xl border p-8 md:p-10 transition-all duration-500 ${newFooterContainer}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight mb-1">Plote</h3>
            <p className="opacity-80 text-sm">Academic Homepage</p>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className={`transition-colors duration-300 ${footerIcon}`} aria-label="GitHub"> <FaGithub size={24} /> </a>
            <a href="#" className={`transition-colors duration-300 ${footerIcon}`} aria-label="LinkedIn"> <FaLinkedin size={24} /> </a>
            <a href="#" className={`transition-colors duration-300 ${footerIcon}`} aria-label="Twitter"> <FaTwitter size={24} /> </a>
          </div>
        </div>
        <div className={`w-full h-px my-8 ${footerDivider}`}></div>
        <div className="text-center text-sm opacity-60">
          <p>© 2025 Plote · “We can only see a short distance ahead, but we can see plenty there that needs to be done.” — Alan Turing</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
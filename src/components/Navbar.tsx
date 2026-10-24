import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Language, TranslationSet } from '../types';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  t: TranslationSet;
}

const languages: Language[] = ['ru', 'lv', 'en'];

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  t,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNextLanguage = () => {
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    onLanguageChange(languages[nextIndex]);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#110f13]/92 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-[#110f13]/90 via-[#110f13]/40 to-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <a
          href="#hero"
          className="text-white font-serif-cormorant font-semibold text-lg sm:text-xl tracking-[0.25em] sm:tracking-[0.3em] uppercase hover:text-[#FFB86B] transition-colors duration-300 whitespace-nowrap shrink-0"
        >
          STUDIO PLATINUM
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6 lg:gap-8">
            <li>
              <a
                href="#works"
                className="text-xs tracking-[0.18em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] transition-colors relative py-1 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFB86B] hover:after:w-full after:transition-all after:duration-300"
              >
                {t.navWorks}
              </a>
            </li>
            <li>
              <a
                href="#configurator"
                className="text-xs tracking-[0.18em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] transition-colors relative py-1 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFB86B] hover:after:w-full after:transition-all after:duration-300"
              >
                {t.navConfigurator}
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="text-xs tracking-[0.18em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] transition-colors relative py-1 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFB86B] hover:after:w-full after:transition-all after:duration-300"
              >
                {t.navAbout}
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-xs tracking-[0.18em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] transition-colors relative py-1 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#FFB86B] hover:after:w-full after:transition-all after:duration-300"
              >
                {t.navContact}
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-3 pl-4 border-l border-white/20">
            {/* Language Switcher */}
            <button
              onClick={handleNextLanguage}
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[#E8E8E8] hover:text-[#FFB86B] transition-colors uppercase px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 whitespace-nowrap shrink-0"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFB86B]" />
              <span>{currentLanguage.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={handleNextLanguage}
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-[#E8E8E8] px-2 py-1 rounded-md bg-white/10 border border-white/15"
          >
            <Globe className="w-3 h-3 text-[#FFB86B]" />
            <span>{currentLanguage.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#FFB86B] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#110f13]/98 border-b border-white/10 px-6 py-6 shadow-2xl space-y-4 text-center animate-fadeIn">
          <a
            href="#works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-[0.2em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] py-1.5"
          >
            {t.navWorks}
          </a>
          <a
            href="#configurator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-[0.2em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] py-1.5"
          >
            {t.navConfigurator}
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-[0.2em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] py-1.5"
          >
            {t.navAbout}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-[0.2em] uppercase text-[#E8E8E8] hover:text-[#FFB86B] py-1.5"
          >
            {t.navContact}
          </a>
        </div>
      )}
    </header>
  );
};

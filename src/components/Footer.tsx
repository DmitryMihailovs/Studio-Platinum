import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 py-10 bg-[#0d0b0e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-xs text-[#A9A3B1] text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <span className="font-serif-cormorant font-semibold text-white tracking-widest uppercase text-sm">
            STUDIO PLATINUM
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <p>© 2026 SIA STUDIO PLATINUM. All rights reserved.</p>
        </div>

        <button
          onClick={scrollToTop}
          type="button"
          className="flex items-center gap-2 text-white/70 hover:text-[#FFB86B] uppercase tracking-widest text-[11px] transition-colors group cursor-pointer"
        >
          <span>Back to Top</span>
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-[#FFB86B] group-hover:text-[#110f13] transition-all">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </footer>
  );
};

import React from 'react';
import { ArrowDown, Sliders } from 'lucide-react';
import { TranslationSet } from '../types';

interface HeroProps {
  t: TranslationSet;
}

export const Hero: React.FC<HeroProps> = ({ t }) => {
  return (
    <section id="hero" className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      {/* Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="images/hero.jpg"
          alt="Studio Platinum Bespoke Interior Furniture Design"
          className="w-full h-full object-cover object-[center_82%] scale-105 transition-transform duration-[3000ms] hover:scale-110 filter brightness-[0.88] contrast-[1.05]"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#110f13]/80 via-[#110f13]/50 to-[#110f13]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#110f13]/40 to-[#110f13]" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#FFB86B] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] text-white/80 font-medium">SIA STUDIO PLATINUM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-cormorant font-semibold text-white leading-[1.08] tracking-tight max-w-3xl mx-auto drop-shadow-xl">
          {t.heroTitle}
        </h1>

        <p className="text-base sm:text-xl text-[#A9A3B1] max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          {t.heroDescription}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#configurator"
            className="btn-luxury btn-accent-luxury group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#FFB86B]" />
              <span>{t.heroPrimaryButton}</span>
            </span>
          </a>

          <a
            href="#works"
            className="btn-luxury border-white/20 text-white/90 hover:text-white group"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>{t.heroSecondaryButton}</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
            </span>
          </a>
        </div>
      </div>

      {/* Decorative Bottom Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/60">SCROLL</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#FFB86B] to-transparent animate-bounce" />
      </div>
    </section>
  );
};

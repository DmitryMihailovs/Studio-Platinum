import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { TranslationSet } from '../types';

interface AboutProps {
  t: TranslationSet;
}

export const AboutSection: React.FC<AboutProps> = ({ t }) => {
  return (
    <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Designer Portrait / Editorial Photograph */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group aspect-[4/5] lg:aspect-[4/5] max-h-[620px] w-full">
            <img
              src="images/about.jpg"
              alt="Studio Platinum Lead Designer & Craftsman"
              className="w-full h-full object-cover object-center filter grayscale-[15%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] uppercase text-[#FFB86B]">
            <span>ABOUT STUDIO</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif-cormorant font-semibold text-white tracking-tight">
            {t.aboutTitle}
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-[#A9A3B1] font-light leading-relaxed">
            <p>{t.aboutText1}</p>
            <p>{t.aboutText2}</p>
          </div>

          {/* Value highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <Award className="w-5 h-5 text-[#FFB86B] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Precision Craft</h4>
                <p className="text-xs text-white/60 font-light mt-0.5">High accuracy fittings and seamless textures.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FFB86B] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Turnkey Delivery</h4>
                <p className="text-xs text-white/60 font-light mt-0.5">Measurement, design, production, and installation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

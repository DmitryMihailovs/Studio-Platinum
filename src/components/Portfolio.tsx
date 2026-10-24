import React, { useState, useEffect } from 'react';
import { Eye, ArrowUpRight, Grid, Layers, PackageOpen, Columns3, Sparkles, Box, Home, Armchair, Lamp, Bed, Tv, Folder, LayoutGrid } from 'lucide-react';
import { PortfolioItem, TranslationSet } from '../types';
import { fetchCategories, CategoryRecord } from '../lib/supabase';

interface PortfolioProps {
  works: PortfolioItem[];
  t: TranslationSet;
  currentLanguage: string;
  onOpenLightbox: (index: number) => void;
}

function getCategoryIcon(iconName: string) {
  switch (iconName?.toLowerCase()) {
    case 'layers': return Layers;
    case 'packageopen': return PackageOpen;
    case 'columns3': return Columns3;
    case 'sparkles': return Sparkles;
    case 'box': return Box;
    case 'home': return Home;
    case 'armchair': return Armchair;
    case 'lamp': return Lamp;
    case 'bed': return Bed;
    case 'tv': return Tv;
    case 'folder': return Folder;
    case 'layoutgrid': return LayoutGrid;
    default: return Grid;
  }
}

export const Portfolio: React.FC<PortfolioProps> = ({
  works,
  t,
  currentLanguage,
  onOpenLightbox,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    fetchCategories().then((cats) => {
      setCategories(cats.filter((c) => c.is_active));
    });
  }, []);

  const filteredWorks = works.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const previewCount = 6;
  const displayWorks = filteredWorks.slice(0, previewCount);
  const hasMore = filteredWorks.length > previewCount;

  return (
    <section id="works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-4">
        <h2 className="text-3xl sm:text-5xl font-serif-cormorant font-semibold text-white tracking-tight">
          {t.worksTitle}
        </h2>
        <p className="text-base sm:text-lg text-[#A9A3B1] font-light leading-relaxed">
          {t.worksDescription}
        </p>

        {/* Category filter tabs — dynamically generated from Supabase */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: 'all', label: t.galleryViewAll, icon: Grid },
            ...categories.map((cat) => ({
              id: cat.id,
              label: currentLanguage === 'ru' ? cat.name_ru : currentLanguage === 'lv' ? cat.name_lv : cat.name_en,
              icon: getCategoryIcon(cat.icon),
            })),
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs uppercase tracking-widest px-4 py-2.5 rounded-full transition-all duration-300 border flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFB86B]/20 text-[#FFB86B] border-[#FFB86B]/40 font-medium shadow-lg'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFB86B]' : 'text-white/50'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout - Bento Style on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 auto-rows-[260px] sm:auto-rows-[280px]">
        {displayWorks.map((item, index) => {
          let spanClass = 'lg:col-span-4 lg:row-span-1';
          if (displayWorks.length === 1) {
            spanClass = 'lg:col-span-8 lg:col-start-3 lg:row-span-2';
          } else if (displayWorks.length === 2) {
            spanClass = 'lg:col-span-6 lg:row-span-2';
          } else if (displayWorks.length === 3) {
            spanClass = 'lg:col-span-4 lg:row-span-2';
          } else {
            const isFirst = index === 0 && selectedCategory === 'all';
            const isSecond = index === 1 && selectedCategory === 'all';
            const isFifth = index === 4 && selectedCategory === 'all';

            if (isFirst) spanClass = 'lg:col-span-8 lg:row-span-2';
            else if (isSecond) spanClass = 'lg:col-span-4 lg:row-span-2';
            else if (isFifth) spanClass = 'lg:col-span-8 lg:row-span-1';
          }

          return (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(works.findIndex((w) => w.id === item.id))}
              className={`group relative bg-[#1F1C24] rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[#FFB86B]/10 hover:shadow-2xl border border-white/5 ${spanClass}`}
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter brightness-[0.88] group-hover:brightness-100"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Hover Badge / Action */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="p-3 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[#FFB86B]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10 space-y-1 transform transition-transform duration-300">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFB86B] font-semibold">
                  {item.category?.toUpperCase() || 'BESPOKE WORK'}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif-cormorant font-semibold text-white group-hover:text-[#FFB86B] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-white/70 line-clamp-2 font-light hidden sm:block">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}

        {/* View All Card */}
        {hasMore && (
          <div
            onClick={() => onOpenLightbox(0)}
            className="group relative lg:col-span-4 lg:row-span-1 bg-gradient-to-br from-white/10 via-white/5 to-white/0 rounded-3xl overflow-hidden cursor-pointer p-8 flex flex-col items-center justify-center text-center border border-white/15 hover:border-[#FFB86B]/50 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="p-4 rounded-full bg-[#FFB86B]/15 text-[#FFB86B] mb-4 group-hover:scale-110 transition-transform">
              <Grid className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-serif-cormorant font-semibold text-white mb-2">
              +{filteredWorks.length - previewCount} {t.worksTitle}
            </h4>
            <p className="text-xs text-white/60 mb-6 font-light max-w-xs">
              {t.worksDescription}
            </p>
            <button className="btn-luxury btn-accent-luxury text-xs py-2.5 px-6">
              {t.galleryViewAll}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

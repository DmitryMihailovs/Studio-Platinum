import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Ruler, Layers, Sparkles, Send } from 'lucide-react';
import { PortfolioItem } from '../types';

interface LightboxModalProps {
  isOpen: boolean;
  currentIndex: number;
  works: PortfolioItem[];
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onOrderSimilar?: (item: PortfolioItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  currentIndex,
  works,
  onClose,
  onSelectIndex,
  onOrderSimilar,
}) => {
  const currentWork = works[currentIndex];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (works.length === 0) return;
    onSelectIndex((currentIndex + 1) % works.length);
  }, [currentIndex, works.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (works.length === 0) return;
    onSelectIndex((currentIndex - 1 + works.length) % works.length);
  }, [currentIndex, works.length, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentWork) return null;

  const imagesList = currentWork.images && currentWork.images.length > 0
    ? currentWork.images
    : [currentWork.image];

  const activeImage = imagesList[activeImageIndex] || currentWork.image;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-y-auto animate-fadeIn p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar */}
      <div className="max-w-7xl mx-w-full w-full flex items-center justify-between text-white/80 z-20 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#FFB86B]">
            STUDIO PLATINUM · BESPOKE CATALOG
          </span>
          <span className="text-white/30">|</span>
          <span className="text-xs tracking-widest text-white/70">
            {currentIndex + 1} / {works.length}
          </span>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Close Product Details"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area: Split View (Photos Left, Specs & Details Right) */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-start">
        
        {/* Left: Image Viewer & Thumbnails */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-[#16131a] border border-white/10 shadow-2xl flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
            {/* Navigation Arrows */}
            {works.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  type="button"
                  className="absolute left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#FFB86B] text-white hover:text-[#110f13] backdrop-blur-md transition-all shadow-xl"
                  aria-label="Previous item"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  type="button"
                  className="absolute right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-[#FFB86B] text-white hover:text-[#110f13] backdrop-blur-md transition-all shadow-xl"
                  aria-label="Next item"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <img
              src={activeImage}
              alt={currentWork.title}
              className="max-h-[600px] w-full object-contain mx-auto transition-all duration-300"
            />
          </div>

          {/* Multiple photographs thumbnail switcher */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {imagesList.map((imgSrc, imgIdx) => (
                <button
                  key={imgIdx}
                  onClick={() => setActiveImageIndex(imgIdx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === imgIdx
                      ? 'border-[#FFB86B] scale-105 shadow-md shadow-[#FFB86B]/20'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Rich Product Specifications & Description */}
        <div className="lg:col-span-5 bg-[#19161D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#FFB86B] font-semibold">
              {currentWork.category?.toUpperCase() || 'BESPOKE FURNITURE'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-cormorant font-semibold text-white tracking-tight">
              {currentWork.title}
            </h2>
          </div>

          <p className="text-sm text-[#A9A3B1] font-light leading-relaxed">
            {currentWork.fullDescription || currentWork.description}
          </p>

          {/* Specifications List (hiding empty fields) */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs uppercase tracking-widest text-white/60 font-medium">
              Технические характеристики
            </h4>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {currentWork.dimensions && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#FFB86B]" /> Габариты (Ш×В×Г):
                  </span>
                  <span className="text-white font-medium text-right">{currentWork.dimensions}</span>
                </div>
              )}

              {currentWork.mainMaterial && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FFB86B]" /> Основной материал:
                  </span>
                  <span className="text-white font-medium text-right">{currentWork.mainMaterial}</span>
                </div>
              )}

              {currentWork.finishColor && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50">Отделка и покрытие:</span>
                  <span className="text-white font-medium text-right">{currentWork.finishColor}</span>
                </div>
              )}

              {currentWork.hardware && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50">Фурнитура:</span>
                  <span className="text-white font-medium text-right">{currentWork.hardware}</span>
                </div>
              )}

              {currentWork.materials && currentWork.materials.length > 0 && !currentWork.mainMaterial && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50">Материалы:</span>
                  <span className="text-white font-medium text-right">{currentWork.materials.join(', ')}</span>
                </div>
              )}

              {currentWork.availability && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/50">Сроки / статус:</span>
                  <span className="text-white font-medium text-right">{currentWork.availability}</span>
                </div>
              )}

              {currentWork.priceLabel && (
                <div className="flex justify-between py-2 border-b border-white/5 text-sm font-semibold">
                  <span className="text-[#FFB86B]">Стоимость:</span>
                  <span className="text-[#FFB86B] text-right">{currentWork.priceLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA: Order similar item */}
          <div className="pt-4">
            <button
              onClick={() => {
                if (onOrderSimilar) {
                  onOrderSimilar(currentWork);
                } else {
                  onClose();
                  const elem = document.getElementById('configurator');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              type="button"
              className="btn-luxury btn-accent-luxury w-full py-4 text-xs font-semibold shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Заказать похожий объект</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

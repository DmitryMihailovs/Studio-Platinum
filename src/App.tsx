import React, { useState, useEffect } from 'react';
import { Language, PortfolioItem } from './types';
import { translations } from './data/translations';
import { initialPortfolioItems, shuffleArray } from './data/portfolio';
import { fetchPublishedPortfolio } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { OrderForm } from './components/OrderForm';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LightboxModal } from './components/LightboxModal';
import { AdminPanel } from './components/AdminPanel';
import { ResetPasswordView } from './components/ResetPasswordView';

export const App: React.FC = () => {
  // Language state
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'ru' || saved === 'lv' || saved === 'en') return saved;
    return 'ru';
  });

  const t = translations[currentLanguage] || translations.ru;

  // Sync document title and html lang attribute
  useEffect(() => {
    document.title = t.pageTitle;
    document.documentElement.lang = currentLanguage;
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage, t.pageTitle]);

  // Check if URL is /reset-password
  const [isResetPasswordRoute, setIsResetPasswordRoute] = useState<boolean>(() => {
    return window.location.pathname.includes('/reset-password') || window.location.hash.includes('type=recovery');
  });

  // Check if URL is /admin/login or /admin
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.includes('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsResetPasswordRoute(window.location.pathname.includes('/reset-password') || window.location.hash.includes('type=recovery'));
      setIsAdminRoute(window.location.pathname.includes('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Portfolio items state with Supabase fetch and local fallback
  const [works, setWorks] = useState<PortfolioItem[]>(() => shuffleArray(initialPortfolioItems));

  const loadPortfolio = async () => {
    const remoteWorks = await fetchPublishedPortfolio();
    if (remoteWorks && remoteWorks.length > 0) {
      setWorks(remoteWorks);
    } else {
      setWorks(shuffleArray(initialPortfolioItems));
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  // Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [orderInitialNote, setOrderInitialNote] = useState<string | null>(null);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleOrderSimilar = (item: PortfolioItem) => {
    setLightboxOpen(false);
    setOrderInitialNote(`Интересует изделие по мотивам проекта: "${item.title}" (${item.dimensions || item.category || ''}). Хочу заказать аналогичный или индивидуальный объект.`);
    const elem = document.getElementById('configurator');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  // If user navigated to /reset-password, render password recovery view
  if (isResetPasswordRoute) {
    return (
      <ResetPasswordView
        currentLanguage={currentLanguage}
        onBackToLogin={() => {
          window.history.pushState({}, '', '/admin');
          setIsResetPasswordRoute(false);
          setIsAdminRoute(true);
        }}
      />
    );
  }

  // If user navigated to /admin, render the secure AdminPanel view directly
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#110f13] text-[#E8E8E8] relative flex flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              setIsAdminRoute(false);
            }}
            className="text-xs uppercase tracking-widest text-[#FFB86B] hover:underline"
          >
            ← Back to Public Website
          </a>
        </div>
        <div className="w-full max-w-4xl">
          <AdminPanel
            isOpen={true}
            works={works}
            t={t}
            onClose={() => {
              window.history.pushState({}, '', '/');
              setIsAdminRoute(false);
            }}
            onRefreshWorks={loadPortfolio}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110f13] text-[#E8E8E8] selection:bg-[#FFB86B]/30 selection:text-white relative">
      {/* Navigation */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        t={t}
      />

      {/* Main Content Flow */}
      <main>
        {/* 1. Hero Showcase */}
        <Hero t={t} />

        {/* 2. Bento Portfolio */}
        <Portfolio
          works={works}
          t={t}
          currentLanguage={currentLanguage}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* 3. Bespoke Custom Furniture Order Form */}
        <OrderForm
          t={t}
          currentLanguage={currentLanguage}
          initialNote={orderInitialNote}
        />

        {/* 4. About Studio & Craftsman */}
        <AboutSection t={t} />

        {/* 5. Direct Contact Hub */}
        <ContactSection t={t} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Fullscreen Gallery Lightbox & Product Details Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        works={works}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={setLightboxIndex}
        onOrderSimilar={handleOrderSimilar}
      />
    </div>
  );
};

export default App;

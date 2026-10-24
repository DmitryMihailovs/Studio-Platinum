import React from 'react';
import { Phone, Mail, MessageCircle, Send, Facebook, Instagram } from 'lucide-react';
import { TranslationSet } from '../types';

interface ContactProps {
  t: TranslationSet;
}

export const ContactSection: React.FC<ContactProps> = ({ t }) => {
  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] uppercase text-[#FFB86B]">
          <span>GET IN TOUCH</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-serif-cormorant font-semibold text-white tracking-widest uppercase">
          {t.contactTitle}
        </h2>

        <p className="text-base sm:text-lg text-[#A9A3B1] font-light max-w-xl mx-auto leading-relaxed">
          Ready to discuss your custom furniture design or schedule an on-site consultation? Reach out directly via messaging or phone.
        </p>

        {/* Messaging & Social Action Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="https://wa.me/37128322206"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury btn-accent-luxury min-w-[160px] py-4 px-8 text-xs font-semibold"
          >
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#FFB86B]" />
              <span>WhatsApp</span>
            </span>
          </a>

          <a
            href="https://t.me/+37128322206"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury min-w-[160px] py-4 px-8 text-xs font-semibold"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FFB86B]" />
              <span>Telegram</span>
            </span>
          </a>

          <a
            href="https://www.facebook.com/share/196WxomGJg/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury min-w-[160px] py-4 px-8 text-xs font-semibold"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Facebook className="w-4 h-4 text-[#FFB86B]" />
              <span>Facebook</span>
            </span>
          </a>

          <a
            href="https://www.instagram.com/_studioplatinum_?utm_source=qr&igsh=MXBlaGIxaXY1MjA1YQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury min-w-[160px] py-4 px-8 text-xs font-semibold"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-[#FFB86B]" />
              <span>Instagram</span>
            </span>
          </a>
        </div>

        {/* Contact info details */}
        <div className="pt-8 space-y-3 text-[#A9A3B1] text-sm sm:text-base font-light border-t border-white/10 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4 text-[#FFB86B]" />
            <span>{t.contactPhoneLabel}</span>
            <a href="tel:+37128322206" className="text-white hover:text-[#FFB86B] font-medium transition-colors">
              +371 28 322 206
            </a>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-[#FFB86B]" />
            <span>{t.contactEmailLabel}</span>
            <a href="mailto:info@studioplatinum.lv" className="text-white hover:text-[#FFB86B] font-medium underline transition-colors">
              info@studioplatinum.lv
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

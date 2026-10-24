import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Ruler,
  Layers,
  Upload,
  MessageCircle,
  Send,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Check,
  FileImage,
  Paperclip
} from 'lucide-react';
import { ConfiguratorState, TranslationSet } from '../types';

interface BespokeConfiguratorProps {
  t: TranslationSet;
  initialCategory?: string;
}

const woodSwatches = [
  { id: 'smoked_oak', name: 'Smoked Dark Oak', hex: '#2A231D', desc: 'Deep smoked texture with rich natural grain.' },
  { id: 'american_walnut', name: 'American Walnut', hex: '#4A3B32', desc: 'Warm, refined architectural walnut veneer.' },
  { id: 'natural_ash', name: 'Natural Scandinavian Ash', hex: '#8A7B6E', desc: 'Light, serene organic grain with protective eco-finish.' },
  { id: 'black_enamel', name: 'Matte Graphite Enamel', hex: '#1C1A1F', desc: 'Ultra-matte graphite enamel over solid wood.' },
];

const metalSwatches = [
  { id: 'brushed_brass', name: 'Brushed Solid Brass', hex: '#FFB86B', desc: 'Hand-polished warm brass accents.' },
  { id: 'matte_steel', name: 'Black Anodized Steel', hex: '#26262B', desc: 'Architectural shadow gap steel profiles.' },
  { id: 'bronze', name: 'Patinated Dark Bronze', hex: '#634B35', desc: 'Hand-rubbed dark bronze hardware.' },
];

export const BespokeConfigurator: React.FC<BespokeConfiguratorProps> = ({
  t,
  initialCategory,
}) => {
  const [step, setStep] = useState<number>(1);

  const [config, setConfig] = useState<ConfiguratorState>({
    category: (initialCategory as any) || 'dresser',
    widthMm: 1800,
    heightMm: 850,
    depthMm: 480,
    primaryMaterial: 'smoked_oak',
    metalAccent: 'brushed_brass',
    finishColor: 'Natural Luster',
    lightingEnabled: true,
    specialRequests: '',
    attachedImageName: undefined,
    attachedImageDataUrl: undefined,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setConfig((prev) => ({
        ...prev,
        attachedImageName: file.name,
        attachedImageDataUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const sanitizeDimension = (value: number, min = 100, max = 10000): number => {
    if (isNaN(value) || value <= 0) return min;
    return Math.max(min, Math.min(max, Math.round(value)));
  };

  const getMaterialName = (id: string) => {
    return woodSwatches.find((w) => w.id === id)?.name || id;
  };

  const getMetalName = (id: string) => {
    return metalSwatches.find((m) => m.id === id)?.name || id;
  };

  // Build inquiry text payload
  const buildInquiryText = () => {
    const wood = getMaterialName(config.primaryMaterial);
    const metal = getMetalName(config.metalAccent);
    const text = `STUDIO PLATINUM — CUSTOM FURNITURE INQUIRY
Type: ${config.category.toUpperCase()}
Dimensions: ${config.widthMm}mm (W) x ${config.heightMm}mm (H) x ${config.depthMm}mm (D)
Wood/Veneer: ${wood}
Metal/Hardware: ${metal}
Integrated LED: ${config.lightingEnabled ? 'Yes' : 'No'}
Notes: ${config.specialRequests || 'None'}
Attachment: ${config.attachedImageName ? config.attachedImageName : 'None'}`;
    return encodeURIComponent(text);
  };

  return (
    <section id="configurator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="bg-[#1F1C24] border border-white/10 rounded-[32px] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow Ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB86B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB86B]/10 border border-[#FFB86B]/20 text-[#FFB86B] text-xs uppercase tracking-widest font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BESPOKE DESIGN STUDIO</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif-cormorant font-semibold text-white tracking-tight">
            {t.configuratorTitle}
          </h2>

          <p className="text-sm sm:text-base text-[#A9A3B1] font-light">
            {t.configuratorSubtitle}
          </p>
        </div>

        {/* 5-Step Progress Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-10 pb-6 border-b border-white/10">
          {[
            { num: 1, label: t.step1Category },
            { num: 2, label: t.step2Dimensions },
            { num: 3, label: t.step3Materials },
            { num: 4, label: t.step4SpecsUpload },
            { num: 5, label: t.step5SummaryHandoff },
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => setStep(st.num)}
              className={`p-3 rounded-2xl text-left transition-all ${
                step === st.num
                  ? 'bg-[#FFB86B]/20 border border-[#FFB86B]/40 text-white font-medium'
                  : step > st.num
                  ? 'bg-white/5 text-[#FFB86B] border border-white/10'
                  : 'bg-white/5 text-white/40 border border-transparent hover:text-white/70'
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest font-mono">STEP 0{st.num}</div>
              <div className="text-xs truncate font-medium mt-0.5">{st.label}</div>
            </button>
          ))}
        </div>

        {/* Step Views */}
        <div className="min-h-[380px] flex flex-col justify-between">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-serif-cormorant font-semibold text-white">
                Select Furniture Type / Выберите тип мебели
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'dresser', title: 'Dresser / Комод', desc: 'Low or tall storage console with precision drawers' },
                  { id: 'wardrobe', title: 'Wardrobe / Шкаф', desc: 'Custom built-in or free-standing wardrobe system' },
                  { id: 'shelf', title: 'Shelving / Стеллаж', desc: 'Architectural living room shelving & library unit' },
                  { id: 'table', title: 'Dining Table / Стол', desc: 'Bespoke dining or executive conference table' },
                  { id: 'console', title: 'Media Console / Консоль', desc: 'Wall-mounted TV console with acoustic fabric' },
                  { id: 'custom', title: 'Custom Object / Авторский Объект', desc: 'Individual architectural furniture piece' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setConfig({ ...config, category: item.id as any })}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      config.category === item.id
                        ? 'bg-[#FFB86B]/15 border-[#FFB86B] text-white shadow-xl ring-1 ring-[#FFB86B]/30'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-base text-white">{item.title}</h4>
                      {config.category === item.id && <Check className="w-5 h-5 text-[#FFB86B]" />}
                    </div>
                    <p className="text-xs text-white/60 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DIMENSIONS WITH SANITIZATION */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3">
                <Ruler className="w-6 h-6 text-[#FFB86B]" />
                <h3 className="text-xl font-serif-cormorant font-semibold text-white">
                  Architectural Dimensions / Габариты объекта
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Width */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between text-sm text-white">
                    <span className="font-medium">{t.widthLabel}</span>
                    <span className="font-mono text-[#FFB86B] font-bold">{config.widthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="50"
                    value={config.widthMm}
                    onChange={(e) => setConfig({ ...config, widthMm: Number(e.target.value) })}
                    className="w-full accent-[#FFB86B] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="300"
                    max="5000"
                    value={config.widthMm}
                    onChange={(e) =>
                      setConfig({ ...config, widthMm: sanitizeDimension(Number(e.target.value), 300, 5000) })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-center font-mono text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                  />
                </div>

                {/* Height */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between text-sm text-white">
                    <span className="font-medium">{t.heightLabel}</span>
                    <span className="font-mono text-[#FFB86B] font-bold">{config.heightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="4000"
                    step="50"
                    value={config.heightMm}
                    onChange={(e) => setConfig({ ...config, heightMm: Number(e.target.value) })}
                    className="w-full accent-[#FFB86B] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="300"
                    max="4000"
                    value={config.heightMm}
                    onChange={(e) =>
                      setConfig({ ...config, heightMm: sanitizeDimension(Number(e.target.value), 300, 4000) })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-center font-mono text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                  />
                </div>

                {/* Depth */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between text-sm text-white">
                    <span className="font-medium">{t.depthLabel}</span>
                    <span className="font-mono text-[#FFB86B] font-bold">{config.depthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="10"
                    value={config.depthMm}
                    onChange={(e) => setConfig({ ...config, depthMm: Number(e.target.value) })}
                    className="w-full accent-[#FFB86B] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="150"
                    max="1500"
                    value={config.depthMm}
                    onChange={(e) =>
                      setConfig({ ...config, depthMm: sanitizeDimension(Number(e.target.value), 150, 1500) })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-center font-mono text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MATERIALS */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              {/* Primary Wood Selection */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#FFB86B] mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{t.primaryWoodLabel}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {woodSwatches.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setConfig({ ...config, primaryMaterial: w.id })}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all ${
                        config.primaryMaterial === w.id
                          ? 'bg-[#FFB86B]/15 border-[#FFB86B] text-white ring-1 ring-[#FFB86B]/30'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0 border border-white/20 shadow-inner"
                        style={{ backgroundColor: w.hex }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{w.name}</div>
                        <div className="text-xs text-white/60 font-light">{w.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metal Hardware Selection */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-[#FFB86B] mb-3">
                  {t.metalHardwareLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {metalSwatches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setConfig({ ...config, metalAccent: m.id })}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                        config.metalAccent === m.id
                          ? 'bg-[#FFB86B]/15 border-[#FFB86B] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: m.hex }}
                      />
                      <div className="text-xs font-semibold text-white">{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LED Lighting Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{t.ledLightingLabel}</div>
                  <div className="text-xs text-white/60 font-light">Warm LED 3000K touch-dimmable light lines</div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, lightingEnabled: !config.lightingEnabled })}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    config.lightingEnabled
                      ? 'bg-[#FFB86B] text-[#110f13]'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {config.lightingEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SPECS & ATTACHMENT */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-xl font-serif-cormorant font-semibold text-white">
                Client Specifications & Image Attachment / ТЗ и эскизы
              </h3>

              {/* Textarea */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/80 mb-2">
                  {t.clientNotesLabel}
                </label>
                <textarea
                  value={config.specialRequests}
                  onChange={(e) => setConfig({ ...config, specialRequests: e.target.value })}
                  rows={4}
                  placeholder="Опишите особенности помещения, вырезы под плинтус, фурнитуру..."
                  className="w-full bg-black/40 border border-white/15 focus:border-[#FFB86B] rounded-2xl p-4 text-sm text-white placeholder-white/40 focus:outline-none"
                />
              </div>

              {/* File Attachment Upload */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/80 mb-2">
                  {t.uploadPhotoLabel}
                </label>
                <div className="border-2 border-dashed border-white/20 hover:border-[#FFB86B] rounded-2xl p-6 text-center bg-white/5 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {config.attachedImageDataUrl ? (
                    <div className="flex items-center justify-center gap-4">
                      <img
                        src={config.attachedImageDataUrl}
                        alt="Attached Reference"
                        className="w-16 h-16 rounded-xl object-cover border border-white/20"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-[#FFB86B] flex items-center gap-1.5">
                          <FileImage className="w-4 h-4" />
                          <span>{config.attachedImageName}</span>
                        </p>
                        <p className="text-[11px] text-white/50">Click or drop new file to replace</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#FFB86B] mx-auto mb-2" />
                      <p className="text-xs text-white/80 font-medium">
                        {t.uploadPhotoHint}
                      </p>
                      <p className="text-[11px] text-white/40 mt-1">PNG, JPG, WEBP up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY & HANDOFF */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-black/50 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#FFB86B] font-semibold">
                      CONFIRMED SPECIFICATION
                    </span>
                    <h3 className="text-2xl font-serif-cormorant font-semibold text-white mt-0.5">
                      {config.category.toUpperCase()} — CUSTOM ORDER
                    </h3>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-[#FFB86B]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/5 p-4 rounded-xl space-y-1">
                    <div className="text-white/50 uppercase tracking-wider">Dimensions</div>
                    <div className="font-mono text-sm text-white font-bold">
                      {config.widthMm} x {config.heightMm} x {config.depthMm} mm
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl space-y-1">
                    <div className="text-white/50 uppercase tracking-wider">Primary Wood / Veneer</div>
                    <div className="text-sm text-white font-semibold">
                      {getMaterialName(config.primaryMaterial)}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl space-y-1">
                    <div className="text-white/50 uppercase tracking-wider">Metal & Hardware</div>
                    <div className="text-sm text-white font-semibold">
                      {getMetalName(config.metalAccent)}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl space-y-1">
                    <div className="text-white/50 uppercase tracking-wider">LED Accent Lighting</div>
                    <div className="text-sm text-white font-semibold">
                      {config.lightingEnabled ? 'Included (3000K Warm)' : 'None'}
                    </div>
                  </div>

                  {config.attachedImageName && (
                    <div className="bg-white/5 p-4 rounded-xl space-y-1 sm:col-span-2 flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-[#FFB86B]" />
                      <div>
                        <div className="text-white/50 uppercase tracking-wider">Attachment</div>
                        <div className="text-xs text-white font-medium">{config.attachedImageName}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transparency Notice */}
                <div className="p-4 rounded-2xl bg-[#FFB86B]/10 border border-[#FFB86B]/20 text-xs text-white/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#FFB86B] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Direct Craftsman Handoff Notice:</span>
                    <span>{t.transparencyNote}</span>
                  </div>
                </div>

                {/* Direct Handoff Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={`https://wa.me/37128322206?text=${buildInquiryText()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-luxury btn-accent-luxury flex-1 py-4 text-xs font-semibold"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{t.submitWhatsApp}</span>
                    </span>
                  </a>

                  <a
                    href={`https://t.me/+37128322206?text=${buildInquiryText()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-luxury border-white/20 flex-1 py-4 text-xs font-semibold"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 text-[#FFB86B]" />
                      <span>{t.submitTelegram}</span>
                    </span>
                  </a>

                  <a
                    href={`mailto:info@studioplatinum.lv?subject=Studio Platinum Custom Inquiry&body=${buildInquiryText()}`}
                    className="btn-luxury border-white/20 flex-1 py-4 text-xs font-semibold"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-[#FFB86B]" />
                      <span>{t.submitEmail}</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-luxury border-white/20 text-xs py-2.5 px-6"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prevStep}</span>
                </span>
              </button>
            ) : <div />}

            {step < 5 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-luxury btn-accent-luxury text-xs py-2.5 px-6 ml-auto"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>{t.nextStep}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

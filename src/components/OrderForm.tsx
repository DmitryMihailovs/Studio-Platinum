import React, { useState, useEffect } from 'react';
import { Sparkles, Send, CheckCircle2, Upload, AlertCircle, X, Check, Image as ImageIcon } from 'lucide-react';
import { TranslationSet } from '../types';
import { submitInquiry, uploadInquiryAttachment, fetchCategories, CategoryRecord } from '../lib/supabase';

interface OrderFormProps {
  t: TranslationSet;
  currentLanguage: string;
  initialNote?: string | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({ t, currentLanguage, initialNote }) => {
  // Categories state (fetched from Supabase or defaults to 5 approved categories)
  const [categories, setCategories] = useState<CategoryRecord[]>([
    { id: 'console', name_ru: 'Консоль / Сервант', name_lv: 'Konsole / Sānu skapis', name_en: 'Console / Sideboard', icon: 'Columns3', is_active: true, display_order: 1 },
    { id: 'kitchen', name_ru: 'Кухня', name_lv: 'Virtuve', name_en: 'Kitchen', icon: 'Home', is_active: true, display_order: 2 },
    { id: 'wardrobe', name_ru: 'Шкафы / Гардеробная', name_lv: 'Skapji / Walk-in garderobe', name_en: 'Wardrobe / Walk-in Closet', icon: 'PackageOpen', is_active: true, display_order: 3 },
    { id: 'bathroom', name_ru: 'Мебель для ванной', name_lv: 'Vannas istabas mēbeles', name_en: 'Bathroom Furniture', icon: 'Lamp', is_active: true, display_order: 4 },
    { id: 'custom', name_ru: 'Другой проект', name_lv: 'Cits projekts', name_en: 'Other Custom Project', icon: 'Sparkles', is_active: true, display_order: 5 },
  ]);

  useEffect(() => {
    fetchCategories().then((res) => {
      if (res && res.length > 0) {
        setCategories(res.filter(c => c.is_active));
      }
    });
  }, []);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [furnitureType, setFurnitureType] = useState('console');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (initialNote) {
      setDescription(initialNote);
    }
  }, [initialNote]);

  // Multiple image upload state (up to 5 images, max 8MB each)
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError(null);
    const newFiles = [...selectedFiles];

    if (newFiles.length + files.length > 5) {
      setFileError(
        currentLanguage === 'ru'
          ? 'Максимально можно загрузить до 5 изображений.'
          : currentLanguage === 'lv'
          ? 'Maksimāli var augšupielādēt līdz 5 attēliem.'
          : 'Maximum of 5 images allowed.'
      );
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        setFileError(
          currentLanguage === 'ru'
            ? 'Поддерживаются только изображения (JPEG, PNG, WebP, AVIF).'
            : currentLanguage === 'lv'
            ? 'Tiek atbalstīti tikai attēli (JPEG, PNG, WebP, AVIF).'
            : 'Only image files (JPEG, PNG, WebP, AVIF) are supported.'
        );
        continue;
      }

      // Validate size limit (8MB)
      if (file.size > 8 * 1024 * 1024) {
        setFileError(
          currentLanguage === 'ru'
            ? `Файл ${file.name} превышает 8 МБ.`
            : currentLanguage === 'lv'
            ? ` Fails ${file.name} pārsniedz 8 MB.`
            : `File ${file.name} exceeds 8MB size limit.`
        );
        continue;
      }

      const preview = URL.createObjectURL(file);
      newFiles.push({ file, preview, name: file.name });
    }

    setSelectedFiles(newFiles);
    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const updated = [...selectedFiles];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setSelectedFiles(updated);
    setFileError(null);
  };

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = currentLanguage === 'ru' ? 'Введите ваше имя' : currentLanguage === 'lv' ? 'Ievadiet savu vārdu' : 'Full name is required';
    }
    if (!description.trim()) {
      errors.description = currentLanguage === 'ru' ? 'Опишите ваш проект' : currentLanguage === 'lv' ? 'Aprakstiet savu projektu' : 'Project description is required';
    }
    if (!phone.trim() && (!email.trim() || !validateEmail(email))) {
      errors.contact = currentLanguage === 'ru'
        ? 'Укажите телефон, WhatsApp или корректный email для связи'
        : currentLanguage === 'lv'
        ? 'Norādiet tālruni, WhatsApp vai derīgu e-pastu saziņai'
        : 'Please provide a phone number, WhatsApp, or valid email for contact';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const item of selectedFiles) {
        const path = await uploadInquiryAttachment(item.file);
        if (path) {
          uploadedUrls.push(path);
        }
      }

      const primaryImageUrl = uploadedUrls[0] || undefined;

      const res = await submitInquiry({
        full_name: fullName,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        furniture_type: furnitureType,
        description,
        budget: budget || undefined,
        preferred_contact: phone.trim() ? 'phone/whatsapp' : 'email',
        image_url: primaryImageUrl,
        images: uploadedUrls,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit inquiry');
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (res.id) {
        setInquiryId(res.id);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(
        err.message ||
          (currentLanguage === 'ru'
            ? 'Ошибка сохранения заявки. Пожалуйста, проверьте соединение и попробуйте снова.'
            : 'Failed to save inquiry. Please check your connection and try again.')
      );
    }
  };

  // Trilingual copy
  const copy = {
    ru: {
      eyebrow: 'STUDIO PLATINUM · BESPOKE FURNITURE',
      title: 'Расскажите о вашем проекте',
      description: 'Заполните заявку, и мастерская Studio Platinum разработает для вас эксклюзивное мебельное решение по индивидуальным размерам.',
      nameLabel: 'Ваше имя *',
      namePlaceholder: 'Иван Петров',
      phoneLabel: 'Телефон или WhatsApp *',
      phonePlaceholder: '+371 28 000 000',
      emailLabel: 'Email (необязательно)',
      emailPlaceholder: 'ivan@example.com',
      categoryLabel: 'Выберите категорию мебели',
      descLabel: 'Описание проекта и ваши пожелания *',
      descPlaceholder: 'Опишите ваши идеи, желаемые размеры, материалы, особенности интерьера...',
      budgetLabel: 'Ориентировочный бюджет',
      uploadLabel: 'Референсы, эскизы и чертежи (до 5 файлов, макс. 8 МБ каждый)',
      uploadHint: 'Перетащите изображения или нажмите для выбора',
      privacyNotice: 'Нажимая кнопку, вы даете согласие на обработку персональных данных для обсуждения вашего проекта.',
      submitBtn: 'Отправить заявку',
      submittingBtn: 'Отправка заявки...',
      successTitle: 'Заявка успешно принята!',
      successDesc: 'Благодарим вас за доверие к Studio Platinum. Наш мастер изучит ваш проект и свяжется с вами в ближайшее время.',
      inquiryIdLabel: 'Номер вашей заявки:',
      anotherInquiry: 'Отправить еще один запрос',
      budgets: [
        { value: '', label: 'Выберите бюджет (необязательно)' },
        { value: '1000-3000', label: '1 000 € – 3 000 €' },
        { value: '3000-6000', label: '3 000 € – 6 000 €' },
        { value: '6000-12000', label: '6 000 € – 12 000 €' },
        { value: 'over-12000', label: 'Более 12 000 €' },
      ]
    },
    lv: {
      eyebrow: 'STUDIO PLATINUM · BESPOKE FURNITURE',
      title: 'Pastāstiet par savu projektu',
      description: 'Aizpildiet pieteikumu, un Studio Platinum darbnīca izstrādās jums ekskluzīvu mēbeļu risinājumu pēc individuāliem izmēriem.',
      nameLabel: 'Jūsu vārds *',
      namePlaceholder: 'Jānis Bērziņš',
      phoneLabel: 'Tālrunis vai WhatsApp *',
      phonePlaceholder: '+371 28 000 000',
      emailLabel: 'E-pasts (pēc izvēles)',
      emailPlaceholder: 'janis@example.com',
      categoryLabel: 'Izvēlieties mēbeļu kategoriju',
      descLabel: 'Projekta apraksts un jūsu vēlmes *',
      descPlaceholder: 'Aprakstiet savas idejas, vēlamos izmērus, materiālus, dizaina prasības...',
      budgetLabel: 'Aptuvenais budžets',
      uploadLabel: 'Atsauces, skices un rasējumi (līdz 5 failiem, maks. 8 MB katram)',
      uploadHint: 'Ievelciet attēlus vai noklikšķiniet, lai izvēlētos',
      privacyNotice: 'Nospiežot pogu, jūs piekrītat personas datu apstrādei jūsu projekta apspriešanai.',
      submitBtn: 'Nosūtīt pieteikumu',
      submittingBtn: 'Nosūta pieteikumu...',
      successTitle: 'Pieteikums veiksmīgi saņemts!',
      successDesc: 'Paldies par uzticību Studio Platinum. Mūsu meistars izskatīs jūsu projektu un drīz sazināsies.',
      inquiryIdLabel: 'Jūsu pieteikuma numurs:',
      anotherInquiry: 'Nosūtīt jaunu pieteikumu',
      budgets: [
        { value: '', label: 'Izvēlieties budžetu (pēc izvēles)' },
        { value: '1000-3000', label: '1 000 € – 3 000 €' },
        { value: '3000-6000', label: '3 000 € – 6 000 €' },
        { value: '6000-12000', label: '6 000 € – 12 000 €' },
        { value: 'over-12000', label: 'Vairāk nekā 12 000 €' },
      ]
    },
    en: {
      eyebrow: 'STUDIO PLATINUM · BESPOKE FURNITURE',
      title: 'Tell us about your project',
      description: 'Fill out the inquiry form, and the Studio Platinum workshop will craft an exclusive custom-sized furniture solution for you.',
      nameLabel: 'Your Name *',
      namePlaceholder: 'John Smith',
      phoneLabel: 'Phone or WhatsApp *',
      phonePlaceholder: '+371 28 000 000',
      emailLabel: 'Email (Optional)',
      emailPlaceholder: 'john@example.com',
      categoryLabel: 'Select Furniture Category',
      descLabel: 'Project Description & Vision *',
      descPlaceholder: 'Describe your ideas, desired dimensions, wood or metal finishes, design features...',
      budgetLabel: 'Estimated Budget',
      uploadLabel: 'Reference Images & Drawings (Up to 5 files, max 8MB each)',
      uploadHint: 'Drag and drop images or click to select',
      privacyNotice: 'By submitting this form, you consent to the processing of personal data to discuss your project.',
      submitBtn: 'Submit Inquiry',
      submittingBtn: 'Submitting Inquiry...',
      successTitle: 'Inquiry Successfully Received!',
      successDesc: 'Thank you for choosing Studio Platinum. Our craftsman will review your project and contact you shortly.',
      inquiryIdLabel: 'Inquiry ID:',
      anotherInquiry: 'Submit Another Inquiry',
      budgets: [
        { value: '', label: 'Select estimated budget (Optional)' },
        { value: '1000-3000', label: '€1,000 – €3,000' },
        { value: '3000-6000', label: '€3,000 – €6,000' },
        { value: '6000-12000', label: '€6,000 – €12,000' },
        { value: 'over-12000', label: 'More than €12,000' },
      ]
    }
  }[currentLanguage] || {
    eyebrow: 'STUDIO PLATINUM · BESPOKE FURNITURE',
    title: 'Tell us about your project',
    description: 'Fill out the inquiry form, and the Studio Platinum workshop will craft an exclusive custom-sized furniture solution for you.',
    nameLabel: 'Your Name *',
    namePlaceholder: 'John Smith',
    phoneLabel: 'Phone or WhatsApp *',
    phonePlaceholder: '+371 28 000 000',
    emailLabel: 'Email (Optional)',
    emailPlaceholder: 'john@example.com',
    categoryLabel: 'Select Furniture Category',
    descLabel: 'Project Description & Vision *',
    descPlaceholder: 'Describe your ideas, desired dimensions, wood or metal finishes, design features...',
    budgetLabel: 'Estimated Budget',
    uploadLabel: 'Reference Images & Drawings (Up to 5 files, max 8MB each)',
    uploadHint: 'Drag and drop images or click to select',
    privacyNotice: 'By submitting this form, you consent to the processing of personal data to discuss your project.',
    submitBtn: 'Submit Inquiry',
    submittingBtn: 'Submitting Inquiry...',
    successTitle: 'Inquiry Successfully Received!',
    successDesc: 'Thank you for choosing Studio Platinum. Our craftsman will review your project and contact you shortly.',
    inquiryIdLabel: 'Inquiry ID:',
    anotherInquiry: 'Submit Another Inquiry',
    budgets: [
      { value: '', label: 'Select estimated budget (Optional)' },
      { value: '1000-3000', label: '€1,000 – €3,000' },
      { value: '3000-6000', label: '€3,000 – €6,000' },
      { value: '6000-12000', label: '€6,000 – €12,000' },
      { value: 'over-12000', label: 'More than €12,000' },
    ]
  };

  return (
    <section id="configurator" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-[#1F1C24] border border-white/10 rounded-[32px] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB86B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFB86B]/10 border border-[#FFB86B]/20 text-[#FFB86B] text-[11px] uppercase tracking-widest font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{copy.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif-cormorant font-semibold text-white tracking-tight">
            {copy.title}
          </h2>

          <p className="text-sm sm:text-base text-[#A9A3B1] font-light leading-relaxed">
            {copy.description}
          </p>
        </div>

        <div className="border-t border-white/10 mb-8" />

        {submitSuccess ? (
          <div className="bg-black/50 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif-cormorant font-semibold text-white">
                {copy.successTitle}
              </h3>
              <p className="text-sm text-[#A9A3B1] font-light max-w-md mx-auto leading-relaxed">
                {copy.successDesc}
              </p>
            </div>
            {inquiryId && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 font-mono max-w-sm mx-auto flex items-center justify-between">
                <span className="text-white/60">{copy.inquiryIdLabel}</span>
                <span className="text-[#FFB86B] font-bold">{inquiryId}</span>
              </div>
            )}
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setFullName('');
                setPhone('');
                setEmail('');
                setDescription('');
                setBudget('');
                setSelectedFiles([]);
                setInquiryId(null);
              }}
              className="btn-luxury btn-accent-luxury text-xs py-3 px-8 cursor-pointer"
            >
              {copy.anotherInquiry}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1. Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                {copy.nameLabel}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all ${
                  validationErrors.fullName ? 'border-red-500' : 'border-white/15 focus:border-[#FFB86B] focus:ring-1 focus:ring-[#FFB86B]/30'
                }`}
              />
              {validationErrors.fullName && (
                <p className="text-[11px] text-red-400">{validationErrors.fullName}</p>
              )}
            </div>

            {/* 2. Contact Details (Phone/WhatsApp required, Email optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                  {copy.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={copy.phonePlaceholder}
                  className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all ${
                    validationErrors.contact ? 'border-red-500' : 'border-white/15 focus:border-[#FFB86B] focus:ring-1 focus:ring-[#FFB86B]/30'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                  {copy.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#FFB86B] focus:ring-1 focus:ring-[#FFB86B]/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                />
              </div>
            </div>
            {validationErrors.contact && (
              <p className="text-[11px] text-red-400 mt-1">{validationErrors.contact}</p>
            )}

            {/* 3. Five Vertically Stacked Furniture Category Radio Options */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                {copy.categoryLabel}
              </label>
              <div className="space-y-2.5">
                {categories.map((cat) => {
                  const labelText = currentLanguage === 'ru' ? cat.name_ru : currentLanguage === 'lv' ? cat.name_lv : cat.name_en;
                  const isSelected = furnitureType === cat.id;
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFB86B]/10 border-[#FFB86B] text-white shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/25 text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-[#FFB86B] bg-[#FFB86B]' : 'border-white/30 bg-transparent'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#121015]" />}
                        </div>
                        <span className="text-sm font-medium">{labelText}</span>
                      </div>
                      <input
                        type="radio"
                        name="furnitureType"
                        value={cat.id}
                        checked={isSelected}
                        onChange={(e) => setFurnitureType(e.target.value)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Project Description */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                {copy.descLabel}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={copy.descPlaceholder}
                className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none transition-all ${
                  validationErrors.description ? 'border-red-500' : 'border-white/15 focus:border-[#FFB86B] focus:ring-1 focus:ring-[#FFB86B]/30'
                }`}
              />
              {validationErrors.description && (
                <p className="text-[11px] text-red-400">{validationErrors.description}</p>
              )}
            </div>

            {/* 5. Estimated Budget */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                {copy.budgetLabel}
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#16131a] border border-white/15 focus:border-[#FFB86B] focus:ring-1 focus:ring-[#FFB86B]/30 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              >
                {copy.budgets.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Reference Images Upload (Up to 5 files, max 8MB each) */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                {copy.uploadLabel} ({selectedFiles.length}/5)
              </label>

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {selectedFiles.map((fileObj, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-white/20 bg-black/40 aspect-square flex items-center justify-center">
                      <img src={fileObj.preview} alt={fileObj.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <span className="text-[10px] text-white truncate">{fileObj.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="self-end p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < 5 && (
                <div className="border border-dashed border-white/25 hover:border-[#FFB86B] rounded-2xl p-6 text-center bg-white/5 hover:bg-white/[0.07] transition-all relative cursor-pointer flex flex-col items-center justify-center gap-2 group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#FFB86B]/10 border border-[#FFB86B]/20 flex items-center justify-center text-[#FFB86B] group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">{copy.uploadHint}</span>
                  <span className="text-[10px] text-white/40">JPEG, PNG, WebP, AVIF up to 8MB</span>
                </div>
              )}
              {fileError && <p className="text-[11px] text-red-400">{fileError}</p>}
            </div>

            {/* Privacy notice */}
            <p className="text-[11px] text-white/40 font-light leading-relaxed">
              {copy.privacyNotice}
            </p>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxury btn-accent-luxury w-full py-4 text-xs font-semibold shadow-xl cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#110f13] border-t-transparent" />
                      <span>{copy.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{copy.submitBtn}</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

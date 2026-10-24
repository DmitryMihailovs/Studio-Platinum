export type Language = 'ru' | 'lv' | 'en';

export interface PortfolioItem {
  id: string;
  image: string;
  images?: string[];
  title: string;
  description: string;
  fullDescription?: string;
  category?: 'dresser' | 'wardrobe' | 'shelf' | 'kitchen' | 'living' | 'custom';
  year?: string;
  materials?: string[];
  dimensions?: string;
  width?: string;
  height?: string;
  depth?: string;
  mainMaterial?: string;
  finishColor?: string;
  hardware?: string;
  priceLabel?: string;
  availability?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

export interface CatalogItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: 'dresser' | 'wardrobe' | 'shelf' | 'table' | 'console' | 'custom';
  dimensions: string;
  materials: string[];
  description: string;
  leadTime: string;
}

export interface MaterialSwatch {
  id: string;
  name: string;
  category: 'wood' | 'metal' | 'glass' | 'accent';
  colorHex: string;
  description: string;
  texturePattern?: string;
}

export interface ConfiguratorState {
  category: 'dresser' | 'wardrobe' | 'shelf' | 'table' | 'console' | 'custom';
  widthMm: number;
  heightMm: number;
  depthMm: number;
  primaryMaterial: string;
  metalAccent: string;
  finishColor: string;
  lightingEnabled: boolean;
  specialRequests: string;
  attachedImageName?: string;
  attachedImageDataUrl?: string;
}

export interface TranslationSet {
  navWorks: string;
  navCatalog: string;
  navConfigurator: string;
  navAbout: string;
  navContact: string;
  heroTitle: string;
  heroDescription: string;
  heroButton: string;
  heroPrimaryButton: string;
  heroSecondaryButton: string;
  worksTitle: string;
  worksDescription: string;
  catalogTitle: string;
  catalogDescription: string;
  catalogInquire: string;
  configuratorTitle: string;
  configuratorSubtitle: string;
  designOptionDresser: string;
  designOptionWardrobe: string;
  designOptionShelf: string;
  step1Category: string;
  step2Dimensions: string;
  step3Materials: string;
  step4SpecsUpload: string;
  step5SummaryHandoff: string;
  nextStep: string;
  prevStep: string;
  submitWhatsApp: string;
  submitTelegram: string;
  submitEmail: string;
  transparencyNote: string;
  aboutTitle: string;
  aboutText1: string;
  aboutText2: string;
  contactTitle: string;
  contactPhoneLabel: string;
  contactEmailLabel: string;
  galleryHint: string;
  galleryViewAll: string;
  languageLabel: string;
  pageTitle: string;
  adminTitle: string;
  adminPrototypeNote: string;
  addNewWork: string;
  editWork: string;
  deleteWork: string;
  saveChanges: string;
  cancel: string;
  widthLabel: string;
  heightLabel: string;
  depthLabel: string;
  primaryWoodLabel: string;
  metalHardwareLabel: string;
  ledLightingLabel: string;
  uploadPhotoLabel: string;
  uploadPhotoHint: string;
  clientNotesLabel: string;
  customCategoryLabel: string;
}

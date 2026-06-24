const galleryImageFiles = [
  'images/1.jpeg',
  'images/2.jpeg',
  'images/3.jpeg',
  'images/4.jpeg',
  'images/5.jpeg',
  'images/6.jpeg',
  'images/7.jpeg',
  'images/8.jpg',
  'images/9.JPG',
  'images/10.jpg',
  'images/11.jpg',
  'images/12.jpg',
  'images/13.JPG',
  'images/14.JPG',
  'images/15.jpg'
];

let galleryWorks = galleryImageFiles.map((file, idx) => ({
  image: file,
  title: `Работа ${idx + 1}`,
  description: `Фотография проекта ${idx + 1}. Нажмите для просмотра в полном формате.`
}));
let currentWorkIndex = 0;
let currentLanguage = 'ru';

// Fisher-Yates shuffle algorithm for randomizing gallery order
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGalleryHint(lang) {
  return translations[lang]?.galleryHint || translations.ru.galleryHint;
}

function renderWorkCards(data, lang = currentLanguage, previewCount = 6) {
  const grid = document.getElementById('works-grid');
  if (!grid) return;
  const copy = translations[lang] || translations.ru;
  const preview = data.slice(0, previewCount);
  grid.innerHTML = preview.map((item, index) => `
      <div class="work-card" data-index="${index}">
        <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      </div>
    `).join('');

  if (data.length > previewCount) {
    grid.insertAdjacentHTML('beforeend', `
      <div class="work-card work-card--viewall" data-action="view-all">
        <div class="viewall-inner">
          <button id="gallery-viewall-button" class="btn btn-accent">${copy.galleryViewAll || 'View all'}</button>
        </div>
      </div>
    `);
  }
}

function renderModalThumbnails(data) {
  const thumbs = document.getElementById('modal-thumbnails');
  if (!thumbs) return;
  thumbs.innerHTML = data.map((item, index) => `
      <button class="modal-thumb" type="button" data-index="${index}" aria-label="Просмотр ${item.title}">
        <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
      </button>
    `).join('');
}

function openModal(index) {
  currentWorkIndex = index;
  showModalSlide(currentWorkIndex);
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function showModalSlide(index) {
  const works = galleryWorks;
  const normalized = (index + works.length) % works.length;
  currentWorkIndex = normalized;
  const work = works[normalized];
  const modalImg = document.getElementById('modal-img');
  if (modalImg) {
    modalImg.src = work.image;
    modalImg.alt = work.title;
  }
  // caption removed per design — keep only image and counter
  document.getElementById('modal-counter').textContent = `${normalized + 1} / ${works.length}`;
  document.querySelectorAll('.modal-thumb').forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === normalized);
  });
}

function nextModalSlide() {
  showModalSlide(currentWorkIndex + 1);
}

function prevModalSlide() {
  showModalSlide(currentWorkIndex - 1);
}

function initGallery() {
  // Try to load gallery data from data/gallery.json (managed by Netlify CMS)
  fetch('data/gallery.json').then(res => {
    if (res.ok) return res.json();
    throw new Error('no gallery data');
  }).then(json => {
    if (json && Array.isArray(json.images)) {
      galleryWorks = json.images.map((it, idx) => ({
        image: it.image,
        title: it.title || `Работа ${idx + 1}`,
        description: it.description || `Фотография проекта ${idx + 1}.`
      }));
    }
  }).catch(() => {
    // ignore — use built-in images
  }).finally(() => {
    // Shuffle gallery order on each page load
    galleryWorks = shuffleArray(galleryWorks);
    renderWorkCards(galleryWorks, currentLanguage);
    renderModalThumbnails(galleryWorks);
    initDesignGenerator();
  });

  const nextButton = document.querySelector('.modal-next');
  const prevButton = document.querySelector('.modal-prev');
  const closeButton = document.querySelector('.modal-close');
  const modalOverlay = document.getElementById('modal');
  const thumbContainer = document.getElementById('modal-thumbnails');
  const grid = document.getElementById('works-grid');

  if (nextButton) nextButton.addEventListener('click', event => { event.stopPropagation(); nextModalSlide(); });
  if (prevButton) prevButton.addEventListener('click', event => { event.stopPropagation(); prevModalSlide(); });
  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', event => {
    if (event.target === modalOverlay) closeModal();
  });

  if (grid) {
    grid.addEventListener('click', event => {
      const card = event.target.closest('.work-card');
      if (!card) return;
      const action = card.dataset.action;
      if (action === 'view-all') {
        openModal(0);
        return;
      }
      const index = Number(card.dataset.index);
      if (!Number.isNaN(index)) openModal(index);
    });
  }

  if (thumbContainer) {
    thumbContainer.addEventListener('click', event => {
      const button = event.target.closest('.modal-thumb');
      if (!button) return;
      const index = Number(button.dataset.index);
      openModal(index);
    });
  }

  document.addEventListener('keydown', event => {
    if (document.getElementById('modal').style.display !== 'block') return;
    if (event.key === 'ArrowRight') nextModalSlide();
    if (event.key === 'ArrowLeft') prevModalSlide();
    if (event.key === 'Escape') closeModal();
  });
}

document.addEventListener('DOMContentLoaded', initGallery);

const translations = {
  ru: {
    navWorks: 'Портфолио',
    navAbout: 'Обо мне',
    navContact: 'Контакты',
    heroTitle: 'Мебель как искусство',
    heroDescription: 'Фактуры, свет и тишина в каждом изделии',
    heroButton: 'Перейти к портфолио',
    worksTitle: 'Портфолио',
    worksDescription: 'Отборные студийные проекты — от уникальных предметов до комплексных интерьерных решений.',
    aboutTitle: 'Обо мне',
    aboutText1: 'Я создаю премиальную мебель на заказ и реализую проекты различного уровня сложности — от изящных авторских форм до полного меблирования интерьеров. Каждый объект разрабатывается с учетом стиля, архитектуры и потребностей клиента.',
    aboutText2: 'Мой подход сочетает выразительную эстетику, четкую конструктивность и высокое качество исполнения. Я создаю уникальные изделия и мебельные решения, которые делают пространство завершенным и запоминающимся.',
    designTitle: 'Генератор идеи мебели',
    designDescription: 'Опишите желаемый комод или шкаф, и система покажет примерное визуальное решение.',
    designInputLabel: 'Описание мебели',
    designInputPlaceholder: 'Например: комод из темного дерева с открытыми нишами и латунными ручками',
    designTypeLabel: 'Тип мебели',
    designOptionDresser: 'Комод',
    designOptionWardrobe: 'Шкаф',
    designOptionShelf: 'Стеллаж',
    designButton: 'Получить пример',
    designResultTextDefault: 'Примерное визуальное решение будет здесь',
    designEmptyText: 'Опишите мебель, чтобы увидеть пример.',
    contactTitle: 'Контакты',
    contactPhoneLabel: 'Тел:',
    contactEmailLabel: 'Email:',
    galleryHint: 'Просмотреть',
    galleryViewAll: 'Показать все',
    languageLabel: 'Язык',
    pageTitle: 'STUDIO PLATINUM | Дизайн мебели',
  },
  lv: {
    navWorks: 'Portfolio',
    navAbout: 'Par mani',
    navContact: 'Kontakti',
    heroTitle: 'Mēbeles kā māksla',
    heroDescription: 'Faktūras, gaisma un klusums katrā izstrādājumā',
    heroButton: 'Pāriet uz portfeli',
    worksTitle: 'Portfolio',
    worksDescription: 'Atlasīti studijas projekti — no autoru mēbelēm līdz pilniem interjera risinājumiem.',
    aboutTitle: 'Par mani',
    aboutText1: 'Es izstrādāju augstvērtīgas dizaina mēbeles pēc pasūtījuma un īstenoju projektus dažādā sarežģītībā — no smalkiem objektiem līdz pilnām interjera koncepcijām. Katrs risinājums tiek veidots ar uzmanību pret telpu, materiāliem un klienta vajadzībām.',
    aboutText2: 'Mana pieeja apvieno izteiksmīgu formu, klusu eleganci un tehnisku izcilību. Es radīšu unikālu mēbeli vai pilnu mēbeļu risinājumu, kas piešķirs telpai raksturu un kvalitāti.',
    designTitle: 'Mēbeļu ideju ģenerators',
    designDescription: 'Aprakstiet vēlamo komodu vai skapi un sistēma parādīs aptuvenu vizuālu risinājumu.',
    designInputLabel: 'Mēbeles apraksts',
    designInputPlaceholder: 'Piemēram: tumša koka komode ar atvērtiem plauktiem un misiņa rokturiem',
    designTypeLabel: 'Mēbeles tips',
    designOptionDresser: 'Komode',
    designOptionWardrobe: 'Skapis',
    designOptionShelf: 'Plaukts',
    designButton: 'Saņemt paraugu',
    designResultTextDefault: 'Aptuvenais vizuālais risinājums būs šeit',
    designEmptyText: 'Aprakstiet mēbeli, lai redzētu paraugu.',
    contactTitle: 'Kontakti',
    contactPhoneLabel: 'Tālrunis:',
    contactEmailLabel: 'E-pasts:',
    galleryHint: 'Skatīt',
    galleryViewAll: 'Skatīt visu',
    languageLabel: 'Valoda',
    pageTitle: 'STUDIO PLATINUM | Mēbeļu dizains',
  },
  en: {
    navWorks: 'Portfolio',
    navAbout: 'About',
    navContact: 'Contact',
    heroTitle: 'Furniture as art',
    heroDescription: 'Textures, light and quiet in every piece',
    heroButton: 'View portfolio',
    worksTitle: 'Portfolio',
    worksDescription: 'Selected studio projects — from bespoke furniture to complete interior solutions.',
    aboutTitle: 'About me',
    aboutText1: 'I create premium custom furniture and deliver projects of varying complexity — from refined signature pieces to complete furniture schemes. Every work is conceived with strong design intent, carefully chosen materials, and precise execution.',
    aboutText2: 'My approach balances striking form, calm luxury, and technical excellence. I produce unique furniture and full-scale bespoke solutions that elevate modern interiors.',
    designTitle: 'Furniture idea generator',
    designDescription: 'Describe the desired dresser or wardrobe and the system will show an approximate visual concept.',
    designInputLabel: 'Furniture description',
    designInputPlaceholder: 'For example: a dark wood dresser with open shelves and brass handles',
    designTypeLabel: 'Furniture type',
    designOptionDresser: 'Dresser',
    designOptionWardrobe: 'Wardrobe',
    designOptionShelf: 'Shelving',
    designButton: 'Get preview',
    designResultTextDefault: 'An approximate visual concept will appear here',
    designEmptyText: 'Describe the furniture to see a preview.',
    contactTitle: 'Contact',
    contactPhoneLabel: 'Phone:',
    contactEmailLabel: 'Email:',
    galleryHint: '',
    galleryViewAll: 'View all',
    languageLabel: 'Language',
    pageTitle: 'STUDIO PLATINUM | Furniture design',
  }
};

const languageToggle = document.getElementById('language-toggle');
const defaultLanguage = localStorage.getItem('language') || 'ru';
const languageOrder = ['ru', 'lv', 'en'];
if (languageToggle) {
  languageToggle.textContent = defaultLanguage.toUpperCase();
  languageToggle.dataset.lang = defaultLanguage;
  applyLanguage(defaultLanguage);
  languageToggle.addEventListener('click', () => {
    const current = languageToggle.dataset.lang || defaultLanguage;
    const nextIndex = (languageOrder.indexOf(current) + 1) % languageOrder.length;
    const selected = languageOrder[nextIndex];
    languageToggle.dataset.lang = selected;
    languageToggle.textContent = selected.toUpperCase();
    localStorage.setItem('language', selected);
    applyLanguage(selected);
  });
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function applyLanguage(lang) {
  currentLanguage = lang;
  const copy = translations[lang] || translations.ru;
  setText('nav-works', copy.navWorks);
  setText('nav-about', copy.navAbout);
  setText('nav-contact', copy.navContact);
  setText('hero-title', copy.heroTitle);
  setText('hero-description', copy.heroDescription);
  setText('hero-button', copy.heroButton);
  setText('works-title', copy.worksTitle);
  setText('works-description', copy.worksDescription);
  setText('about-title', copy.aboutTitle);
  setText('about-text-1', copy.aboutText1);
  setText('about-text-2', copy.aboutText2);
  setText('contact-title', copy.contactTitle);
  setText('contact-phone-label', copy.contactPhoneLabel);
  setText('contact-email-label', copy.contactEmailLabel);
  setText('gallery-viewall-button', copy.galleryViewAll || '');
  setText('design-title', copy.designTitle);
  setText('design-description', copy.designDescription);
  setText('design-input-label', copy.designInputLabel);
  setPlaceholder('design-input', copy.designInputPlaceholder);
  setText('design-type-label', copy.designTypeLabel);
  setText('design-option-dresser', copy.designOptionDresser);
  setText('design-option-wardrobe', copy.designOptionWardrobe);
  setText('design-option-shelf', copy.designOptionShelf);
  setText('design-button', copy.designButton);
  setText('design-result-text', copy.designResultTextDefault);
  renderWorkCards(galleryWorks, lang);
  document.title = copy.pageTitle || document.title;
}

function setPlaceholder(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.placeholder = text;
  }
}

function generateDesignPreview(description, typeLabel) {
  const title = typeLabel || 'Furniture idea';
  const shortDesc = description ? description.slice(0, 120) : 'Describe your piece and generate a visual idea.';
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2b2730"/><stop offset="100%" stop-color="#151215"/></linearGradient></defs><rect width="900" height="600" fill="url(%23g)"/><text x="50%" y="42%" text-anchor="middle" fill="#fff" font-family="Inter, sans-serif" font-size="44" font-weight="700">${title}</text><text x="50%" y="52%" text-anchor="middle" fill="#fff" font-family="Inter, sans-serif" font-size="20">${shortDesc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text><text x="50%" y="88%" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Inter, sans-serif" font-size="14">Примерная визуализация / Concept preview</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function initDesignGenerator() {
  const designForm = document.getElementById('design-form');
  const designInput = document.getElementById('design-input');
  const designType = document.getElementById('design-type');
  const designImage = document.getElementById('design-image');
  const designResultText = document.getElementById('design-result-text');

  if (!designForm || !designInput || !designType || !designImage || !designResultText) return;

  designForm.addEventListener('submit', event => {
    event.preventDefault();
    const description = designInput.value.trim();
    const selectedType = designType.selectedOptions[0]?.textContent || designType.value;
    if (!description) {
      designResultText.textContent = translations[currentLanguage].designEmptyText;
      designImage.style.backgroundImage = 'none';
      return;
    }
    designResultText.textContent = '';
    const previewSrc = generateDesignPreview(description, selectedType);
    designImage.style.backgroundImage = `url('${previewSrc}')`;
    designImage.style.backgroundSize = 'cover';
    designImage.style.backgroundPosition = 'center';
  });
}

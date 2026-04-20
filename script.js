const rawCasesData = Array.isArray(window.portfolioCases) ? window.portfolioCases : [];

function normalizeCases(data) {
  const counts = new Map();

  return data.map((item, index) => {
    const baseId = typeof item.id === "string" && item.id.trim()
      ? item.id.trim()
      : `case-${index + 1}`;
    const nextCount = (counts.get(baseId) || 0) + 1;
    const caseKey = nextCount === 1 ? baseId : `${baseId}-${nextCount}`;

    counts.set(baseId, nextCount);

    return {
      ...item,
      caseKey,
      image: typeof item.image === "string" ? item.image.trim() : ""
    };
  });
}

const casesData = normalizeCases(rawCasesData);
const caseDetails = Object.fromEntries(casesData.map((item) => [item.caseKey, item]));

const modal = document.querySelector("#case-modal");
const casesGrid = document.querySelector("#cases-grid");
const modalTitle = document.querySelector("#modal-title");
const modalType = document.querySelector("#modal-type");
const modalSeverity = document.querySelector("#modal-severity");
const modalSummary = document.querySelector("#modal-summary");
const modalDescription = document.querySelector("#modal-description");
const modalImpact = document.querySelector("#modal-impact");
const modalLearning = document.querySelector("#modal-learning");
const modalRecommendations = document.querySelector("#modal-recommendations");
const modalImage = document.querySelector("#modal-image");
const modalImageFallback = document.querySelector("#modal-image-fallback");
const modalImageLabel = document.querySelector("#modal-image-label");
const closeButton = document.querySelector(".modal-close");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const dynamicRoleText = document.querySelector("#dynamic-role-text");
const terminalTitle = document.querySelector("#terminal-title");
const terminalBody = document.querySelector("#terminal-body");

const carouselState = {
  root: null,
  track: null,
  slides: [],
  prevButton: null,
  nextButton: null,
  currentIndex: 0,
  itemsPerView: 1,
  maxIndex: 0,
  autoplayId: null,
  resizeId: null
};

let lastFocusedElement = null;
let activeRoleIndex = 0;
let activeTerminalScenario = 0;

const rotatingRoles = [
  "lógica de aplicação",
  "bug hunting",
  "análise de vulnerabilidades"
];

const terminalScenarios = [
  {
    title: "HTTP request analysis",
    lines: [
      { text: "> analyzing request...", className: "is-command" },
      { text: "> method: GET", className: "is-muted" },
      { text: "> endpoint: /api/user?id=125", className: "is-network" },
      { text: "> modifying parameter...", className: "is-command" },
      { text: "> id=126", className: "is-network" },
      { text: "> response: 200 OK", className: "is-highlight" },
      { text: "> unauthorized data returned", className: "is-alert" },
      { text: "> vulnerability detected: IDOR", className: "is-alert" },
      { text: "> severity: critical", className: "is-alert" }
    ]
  },
  {
    title: "Traffic inspection",
    lines: [
      { text: "Frame 1024: 1514 bytes on wire", className: "is-network" },
      { text: "Source: 192.168.0.10", className: "is-muted" },
      { text: "Destination: 172.217.28.78", className: "is-muted" },
      { text: "Protocol: TCP", className: "is-network" },
      { text: "Info: GET /api/user?id=127", className: "is-network" },
      { text: "Status: 200 OK", className: "is-highlight" },
      { text: "Alert: Sensitive data exposure detected", className: "is-alert" }
    ]
  },
  {
    title: "Network monitoring",
    lines: [
      { text: "> ping api.server.com", className: "is-command" },
      { text: "64 bytes from api.server.com: icmp_seq=1 ttl=64 time=23ms", className: "is-network" },
      { text: "64 bytes from api.server.com: icmp_seq=2 ttl=64 time=19ms", className: "is-network" },
      { text: "64 bytes from api.server.com: icmp_seq=3 ttl=64 time=21ms", className: "is-network" },
      { text: "> monitoring response patterns...", className: "is-command" },
      { text: "> anomaly detected", className: "is-alert" }
    ]
  },
  {
    title: "Application logic",
    lines: [
      { text: "> analyzing authentication flow...", className: "is-command" },
      { text: "> missing ownership validation", className: "is-alert" },
      { text: "> user_id parameter not verified", className: "is-muted" },
      { text: "> access control bypass confirmed", className: "is-alert" },
      { text: "> vulnerability class: Broken Access Control", className: "is-highlight" }
    ]
  },
  {
    title: "Professional posture",
    lines: [
      { text: "> vulnerability validated", className: "is-command" },
      { text: "> exploitation: controlled", className: "is-muted" },
      { text: "> data access: minimal", className: "is-muted" },
      { text: "> status: reported responsibly", className: "is-highlight" },
      { text: "> building trust through security", className: "is-command" }
    ]
  }
];

function getItemsPerView() {
  if (window.innerWidth <= 700) {
    return 1;
  }

  if (window.innerWidth <= 1080) {
    return 2;
  }

  return 3;
}

function showModalFallback(caseItem) {
  if (!modalImage || !modalImageFallback || !modalImageLabel) {
    return;
  }

  modalImage.hidden = true;
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  modalImageFallback.hidden = false;
  modalImageLabel.textContent = caseItem.title;
}

function updateModalImage(caseItem) {
  if (!modalImage || !modalImageFallback || !modalImageLabel) {
    return;
  }

  if (!caseItem.image) {
    showModalFallback(caseItem);
    return;
  }

  modalImage.onload = () => {
    modalImage.hidden = false;
    modalImageFallback.hidden = true;
  };

  modalImage.onerror = () => {
    showModalFallback(caseItem);
  };

  modalImageLabel.textContent = caseItem.title;
  modalImage.alt = `Imagem do ${caseItem.title}`;
  modalImage.src = caseItem.image;
}

function openModal(caseKey) {
  const selectedCase = caseDetails[caseKey];

  if (
    !selectedCase ||
    !modal ||
    !closeButton ||
    !modalTitle ||
    !modalType ||
    !modalSeverity ||
    !modalSummary ||
    !modalDescription ||
    !modalImpact ||
    !modalLearning ||
    !modalRecommendations
  ) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modalTitle.textContent = selectedCase.title;
  modalType.textContent = selectedCase.type;
  modalSeverity.textContent = selectedCase.severity;
  modalSeverity.className = `modal-severity ${selectedCase.severityClass}`;
  modalSummary.textContent = selectedCase.summary;
  modalDescription.textContent = selectedCase.description;
  modalImpact.textContent = selectedCase.impact;
  modalLearning.textContent = selectedCase.learning;
  modalRecommendations.textContent = selectedCase.recommendations;
  updateModalImage(selectedCase);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeButton.focus();
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function createCaseMedia(caseItem) {
  const media = document.createElement("div");
  const image = document.createElement("img");
  const fallback = document.createElement("div");
  const fallbackTag = document.createElement("span");
  const fallbackTitle = document.createElement("strong");

  media.className = "case-media";
  image.className = "case-media-image";
  fallback.className = "case-media-fallback";
  fallbackTag.className = "case-media-kicker";
  fallbackTitle.className = "case-media-title";

  fallbackTag.textContent = caseItem.tag || "Case";
  fallbackTitle.textContent = caseItem.title;

  fallback.append(fallbackTag, fallbackTitle);
  media.append(image, fallback);

  if (!caseItem.image) {
    image.hidden = true;
    return media;
  }

  image.alt = `Imagem do ${caseItem.title}`;
  image.src = caseItem.image;
  image.onload = () => {
    image.hidden = false;
    fallback.hidden = true;
  };
  image.onerror = () => {
    image.hidden = true;
    fallback.hidden = false;
  };

  return media;
}

function createCaseCard(caseItem) {
  const slide = document.createElement("div");
  const article = document.createElement("article");
  const meta = document.createElement("div");
  const tag = document.createElement("span");
  const severity = document.createElement("span");
  const body = document.createElement("div");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  const actions = document.createElement("div");
  const button = document.createElement("button");

  slide.className = "case-slide";
  article.className = "case-card";
  meta.className = "case-meta";
  tag.className = "case-tag";
  severity.className = `severity ${caseItem.severityClass}`;
  body.className = "case-card-body";
  summary.className = "case-summary";
  actions.className = "case-actions";
  button.className = "button button-tertiary details-button";
  button.type = "button";
  button.dataset.case = caseItem.caseKey;

  tag.textContent = caseItem.tag;
  severity.textContent = caseItem.severity;
  title.textContent = caseItem.title;
  summary.textContent = caseItem.summary;
  button.textContent = "Ver detalhes";
  button.addEventListener("click", () => {
    openModal(caseItem.caseKey);
  });

  meta.append(tag, severity);
  body.append(meta, title, summary);
  actions.append(button);
  article.append(createCaseMedia(caseItem), body, actions);
  slide.appendChild(article);

  return slide;
}

function updateCarouselPosition() {
  if (!carouselState.root || !carouselState.track || !carouselState.slides.length) {
    return;
  }

  const firstSlide = carouselState.slides[0];
  const gapValue = window.getComputedStyle(carouselState.track).gap;
  const gap = Number.parseFloat(gapValue) || 0;
  const slideWidth = firstSlide.getBoundingClientRect().width;
  const offset = carouselState.currentIndex * (slideWidth + gap);

  carouselState.track.style.transform = `translateX(-${offset}px)`;

  if (carouselState.prevButton) {
    carouselState.prevButton.disabled = carouselState.maxIndex <= 0;
  }

  if (carouselState.nextButton) {
    carouselState.nextButton.disabled = carouselState.maxIndex <= 0;
  }
}

function updateCarouselMetrics() {
  if (!carouselState.root) {
    return;
  }

  carouselState.itemsPerView = getItemsPerView();
  carouselState.maxIndex = Math.max(0, carouselState.slides.length - carouselState.itemsPerView);
  carouselState.currentIndex = Math.min(carouselState.currentIndex, carouselState.maxIndex);
  carouselState.root.style.setProperty("--cases-per-view", String(carouselState.itemsPerView));
  updateCarouselPosition();
}

function stopCarouselAutoplay() {
  if (carouselState.autoplayId) {
    window.clearInterval(carouselState.autoplayId);
    carouselState.autoplayId = null;
  }
}

function goToCase(index) {
  if (!carouselState.slides.length) {
    return;
  }

  if (index < 0) {
    carouselState.currentIndex = carouselState.maxIndex;
  } else if (index > carouselState.maxIndex) {
    carouselState.currentIndex = 0;
  } else {
    carouselState.currentIndex = index;
  }

  updateCarouselPosition();
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();

  if (carouselState.maxIndex <= 0) {
    return;
  }

  carouselState.autoplayId = window.setInterval(() => {
    goToCase(carouselState.currentIndex + 1);
  }, 4500);
}

function initializeCarousel(carousel) {
  carouselState.root = carousel;
  carouselState.track = carousel.querySelector(".cases-track");
  carouselState.prevButton = carousel.querySelector("[data-action='prev']");
  carouselState.nextButton = carousel.querySelector("[data-action='next']");
  carouselState.counter = carousel.querySelector(".cases-counter");
  carouselState.slides = Array.from(carousel.querySelectorAll(".case-slide"));
  carouselState.currentIndex = 0;

  if (carouselState.prevButton) {
    carouselState.prevButton.addEventListener("click", () => {
      goToCase(carouselState.currentIndex - 1);
      startCarouselAutoplay();
    });
  }

  if (carouselState.nextButton) {
    carouselState.nextButton.addEventListener("click", () => {
      goToCase(carouselState.currentIndex + 1);
      startCarouselAutoplay();
    });
  }

  carousel.addEventListener("mouseenter", stopCarouselAutoplay);
  carousel.addEventListener("mouseleave", startCarouselAutoplay);
  carousel.addEventListener("focusin", stopCarouselAutoplay);
  carousel.addEventListener("focusout", startCarouselAutoplay);

  updateCarouselMetrics();
  startCarouselAutoplay();
}

function renderCases() {
  if (!casesGrid) {
    return;
  }

  casesGrid.innerHTML = "";

  if (!casesData.length) {
    const emptyCard = document.createElement("article");
    const title = document.createElement("h3");
    const description = document.createElement("p");

    emptyCard.className = "case-card case-card-empty reveal";
    title.textContent = "Nenhum case publicado ainda";
    description.textContent = "Adicione novos itens em cases/cases.js para que eles apareçam aqui automaticamente.";
    emptyCard.append(title, description);
    casesGrid.appendChild(emptyCard);
    return;
  }

  const carousel = document.createElement("div");
  const header = document.createElement("div");
  const intro = document.createElement("div");
  const introLabel = document.createElement("span");
  const introText = document.createElement("p");
  const nav = document.createElement("div");
  const prevButton = document.createElement("button");
  const nextButton = document.createElement("button");
  const viewport = document.createElement("div");
  const track = document.createElement("div");

  carousel.className = "cases-carousel reveal";
  header.className = "cases-carousel-header";
  intro.className = "cases-carousel-intro";
  introLabel.className = "cases-carousel-label";
  introText.className = "cases-carousel-copy";
  nav.className = "cases-carousel-nav";
  prevButton.className = "cases-arrow";
  nextButton.className = "cases-arrow";
  viewport.className = "cases-viewport";
  track.className = "cases-track";

  introLabel.textContent = "Case archive";
  introText.textContent = "Navegue pelos estudos com setas ou deixe a rotação automática destacar seus trabalhos.";
  prevButton.type = "button";
  nextButton.type = "button";
  prevButton.dataset.action = "prev";
  nextButton.dataset.action = "next";
  prevButton.setAttribute("aria-label", "Mostrar case anterior");
  nextButton.setAttribute("aria-label", "Mostrar próximo case");
  prevButton.textContent = "‹";
  nextButton.textContent = "›";

  casesData.forEach((caseItem) => {
    track.appendChild(createCaseCard(caseItem));
  });

  nav.append(prevButton, nextButton);
  intro.append(introLabel, introText);
  header.append(intro, nav);
  viewport.appendChild(track);
  carousel.append(header, viewport);
  casesGrid.appendChild(carousel);

  initializeCarousel(carousel);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof HTMLElement && target.dataset.close === "true") {
      closeModal();
    }
  });
}

if (closeButton) {
  closeButton.addEventListener("click", closeModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && modal.classList.contains("is-open")) {
    closeModal();
  }
});

window.addEventListener("resize", () => {
  if (carouselState.resizeId) {
    window.clearTimeout(carouselState.resizeId);
  }

  carouselState.resizeId = window.setTimeout(() => {
    updateCarouselMetrics();
  }, 120);
});

function toggleMenu() {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen && window.innerWidth <= 760);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", toggleMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

function observeRevealElements() {
  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

function updateDynamicRole() {
  if (!dynamicRoleText) {
    return;
  }

  activeRoleIndex = (activeRoleIndex + 1) % rotatingRoles.length;
  dynamicRoleText.animate(
    [
      { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
      { opacity: 0, filter: "blur(6px)", transform: "translateY(-8px)" }
    ],
    { duration: 240, easing: "ease" }
  ).onfinish = () => {
    dynamicRoleText.textContent = rotatingRoles[activeRoleIndex];
    dynamicRoleText.animate(
      [
        { opacity: 0, filter: "blur(6px)", transform: "translateY(8px)" },
        { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" }
      ],
      { duration: 320, easing: "ease" }
    );
  };
}

if (dynamicRoleText) {
  window.setInterval(updateDynamicRole, 2800);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function typeTerminalLine(lineElement, text) {
  lineElement.classList.add("current");

  for (const character of text) {
    lineElement.textContent += character;
    terminalBody.scrollTop = terminalBody.scrollHeight;
    await wait(15);
  }

  lineElement.classList.remove("current");
}

async function runTerminalScenario() {
  if (!terminalTitle || !terminalBody) {
    return;
  }

  const scenario = terminalScenarios[activeTerminalScenario];
  terminalTitle.textContent = scenario.title;
  terminalBody.animate(
    [
      { opacity: 1, filter: "blur(0px)" },
      { opacity: 0.22, filter: "blur(4px)" },
      { opacity: 1, filter: "blur(0px)" }
    ],
    { duration: 360, easing: "ease" }
  );

  terminalBody.innerHTML = "";
  terminalBody.scrollTop = 0;

  for (const line of scenario.lines) {
    const paragraph = document.createElement("p");
    paragraph.className = `terminal-line ${line.className || ""}`.trim();
    terminalBody.appendChild(paragraph);
    await typeTerminalLine(paragraph, line.text);
    await wait(150);
  }

  await wait(2200);
  activeTerminalScenario = (activeTerminalScenario + 1) % terminalScenarios.length;
  runTerminalScenario();
}

renderCases();
observeRevealElements();
runTerminalScenario();

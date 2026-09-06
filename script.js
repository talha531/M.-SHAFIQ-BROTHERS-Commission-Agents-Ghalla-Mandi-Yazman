const panels = [...document.querySelectorAll(".panel")];
const navLinks = [...document.querySelectorAll(".nav-links a[data-target]")];
const nextButtons = [...document.querySelectorAll("[data-next]")];
const langButtons = [...document.querySelectorAll(".lang")];
const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

let currentIndex = 0;
let isMoving = false;

function setPanelClasses(index) {
  panels.forEach((panel, i) => {
    panel.classList.remove("active", "prev");
    if (i === index) panel.classList.add("active");
    else if (i < index) panel.classList.add("prev");
  });
}

function goToSection(id, updateHash = true) {
  const index = panels.findIndex(panel => panel.dataset.section === id);
  if (index === -1) return;

  currentIndex = index;
  setPanelClasses(index);

  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.target === id);
  });

  panels.forEach(panel => {
    panel.scrollTop = 0;
  });

  nav?.classList.remove("open");
  menu?.classList.remove("is-open");
  menu?.setAttribute("aria-expanded", "false");

  if (updateHash && location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    goToSection(link.dataset.target);
  });
});

nextButtons.forEach(button => {
  button.addEventListener("click", () => goToSection(button.dataset.next));
});

menu?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-expanded", String(open));
});

function setLanguage(lang) {
  lang = lang === "ur" ? "ur" : "en";

  document.querySelectorAll("[data-en][data-ur]").forEach(el => {
    const value = el.getAttribute(`data-${lang}`);
    if (value !== null) el.innerHTML = value;
  });

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  document.body.classList.toggle("urdu", lang === "ur");

  langButtons.forEach(button => {
    const active = button.dataset.lang === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  try {
    localStorage.setItem("msb-language", lang);
  } catch (_) {}
}

langButtons.forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

let savedLang = "en";
try {
  savedLang = localStorage.getItem("msb-language") || "en";
} catch (_) {}
setLanguage(savedLang);

function moveNext() {
  if (currentIndex < panels.length - 1) goToSection(panels[currentIndex + 1].dataset.section);
}
function movePrevious() {
  if (currentIndex > 0) goToSection(panels[currentIndex - 1].dataset.section);
}

window.addEventListener("wheel", event => {
  if (isMoving) return;

  const activePanel = panels[currentIndex];
  const canScrollDown = activePanel.scrollTop + activePanel.clientHeight < activePanel.scrollHeight - 4;
  const canScrollUp = activePanel.scrollTop > 4;

  if (Math.abs(event.deltaY) < 15) return;

  // Long pages can still be read vertically. At the edge, the wheel moves horizontally.
  if (event.deltaY > 0) {
    if (canScrollDown) return;
    event.preventDefault();
    isMoving = true;
    moveNext();
  } else {
    if (canScrollUp) return;
    event.preventDefault();
    isMoving = true;
    movePrevious();
  }

  setTimeout(() => { isMoving = false; }, 700);
}, { passive:false });

let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", event => {
  const t = event.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, {passive:true});

window.addEventListener("touchend", event => {
  const t = event.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy)) return;

  if (dx < 0) moveNext();
  else movePrevious();
}, {passive:true});

window.addEventListener("keydown", event => {
  if (["ArrowRight","PageDown"].includes(event.key)) {
    event.preventDefault();
    moveNext();
  } else if (["ArrowLeft","PageUp"].includes(event.key)) {
    event.preventDefault();
    movePrevious();
  } else if (event.key === "Home") {
    event.preventDefault();
    goToSection("home");
  } else if (event.key === "End") {
    event.preventDefault();
    goToSection("contact");
  }
});

window.addEventListener("hashchange", () => {
  const id = location.hash.replace("#", "");
  if (id) goToSection(id, false);
});

const initialId = location.hash.replace("#", "");
if (panels.some(panel => panel.dataset.section === initialId)) {
  goToSection(initialId, false);
} else {
  goToSection("home", false);
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const body = document.body;

const themeToggle = document.querySelector(".theme-toggle");
const themeToggleIcon = document.querySelector(".theme-toggle-icon");
const storedTheme = localStorage.getItem("portfolio-theme");

const applyTheme = (theme) => {
  body.dataset.theme = theme;

  if (!themeToggle || !themeToggleIcon) return;

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Enable light mode" : "Enable dark mode"
  );
  themeToggleIcon.innerHTML = isDark ? "&#9728;" : "&#9790;";
};

applyTheme(storedTheme || "light");

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
});

const staggerGroups = [".project-grid", ".notes-list", ".skill-tree"];

staggerGroups.forEach((selector) => {
  document.querySelectorAll(selector).forEach((group) => {
    group.querySelectorAll(".scroll-fade").forEach((item, index) => {
      if (!item.style.getPropertyValue("--reveal-delay")) {
        item.style.setProperty("--reveal-delay", `${index * 90}ms`);
      }
    });
  });
});

const fadeBlocks = document.querySelectorAll(".scroll-fade");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else if (entry.boundingClientRect.top > 0) {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -10% 0px",
  }
);

fadeBlocks.forEach((block) => fadeObserver.observe(block));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });
});

const certificateEntryCard = document.querySelector(".certificate-entry-card");
const certificateTrigger = document.querySelector(".certificate-trigger");
const certificateCards = document.querySelectorAll(".certificate-card");
const certificateModal = document.querySelector(".certificate-modal");
const certificateZoomImage = document.querySelector(".certificate-zoom-image");
const certificateModalTitle = document.querySelector("#certificate-modal-title");
const certificateOpenFile = document.querySelector(".certificate-open-file");

const playCertificateTransition = () => {
  const overlay = document.createElement("div");
  overlay.className = "screen-transition";
  overlay.setAttribute("transition-style", "in:wipe:cinematic");
  overlay.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = "Opening certificate vault";
  overlay.appendChild(label);

  body.appendChild(overlay);
};

const goToCertificatesPage = () => {
  if (!certificateEntryCard) return;

  certificateEntryCard.classList.add("is-flipping");
  if (!prefersReducedMotion.matches) {
    playCertificateTransition();
  }

  window.setTimeout(() => {
    window.location.href = "./certificates.html";
  }, prefersReducedMotion.matches ? 0 : 700);
};

certificateTrigger?.addEventListener("click", (event) => {
  event.preventDefault();
  goToCertificatesPage();
});

certificateEntryCard?.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  goToCertificatesPage();
});

const openCertificateModal = (title, pdfSrc, previewSrc) => {
  if (!certificateModal || !certificateZoomImage || !certificateModalTitle || !certificateOpenFile) {
    return;
  }

  certificateModalTitle.textContent = title;
  certificateZoomImage.src = previewSrc;
  certificateZoomImage.alt = title;
  certificateOpenFile.href = pdfSrc;
  certificateModal.classList.add("is-open");
  certificateModal.setAttribute("aria-hidden", "false");
  body.classList.add("certificate-modal-open");
};

const closeCertificateModal = () => {
  if (!certificateModal || !certificateZoomImage) return;

  certificateModal.classList.remove("is-open");
  certificateModal.setAttribute("aria-hidden", "true");
  body.classList.remove("certificate-modal-open");

  window.setTimeout(() => {
    if (!certificateModal.classList.contains("is-open")) {
      certificateZoomImage.src = "";
      certificateZoomImage.alt = "";
    }
  }, 240);
};

certificateCards.forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.dataset.certTitle || "Certificate";
    const src = card.dataset.certSrc;
    const preview = card.dataset.certPreview;
    if (!src || !preview) return;

    openCertificateModal(title, src, preview);
  });
});

document.querySelectorAll("[data-cert-close]").forEach((button) => {
  button.addEventListener("click", closeCertificateModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCertificateModal();
  }
});

const parallaxBlocks = document.querySelectorAll("[data-parallax]");
let targetScrollY = window.scrollY;
let easedScrollY = window.scrollY;
let ticking = false;

const updateParallax = () => {
  parallaxBlocks.forEach((block) => {
    const factor = Number(block.dataset.parallax) || 0;
    const rect = block.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const blockCenter = rect.top + rect.height / 2;
    const distance = (blockCenter - viewportCenter) / window.innerHeight;
    const shiftY = distance * factor * -1;
    block.style.transform = `translate3d(0, ${shiftY}px, 0)`;
  });
};

const animateScroll = () => {
  const delta = targetScrollY - easedScrollY;
  easedScrollY += delta * 0.09;

  if (Math.abs(delta) < 0.1) {
    easedScrollY = targetScrollY;
  }

  root.style.setProperty("--scroll-eased", easedScrollY.toFixed(2));
  updateParallax();

  if (Math.abs(targetScrollY - easedScrollY) > 0.1) {
    requestAnimationFrame(animateScroll);
  } else {
    ticking = false;
  }
};

const requestSmoothUpdate = () => {
  targetScrollY = window.scrollY;

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(animateScroll);
  }
};

updateParallax();
window.addEventListener("scroll", requestSmoothUpdate, { passive: true });
window.addEventListener("resize", updateParallax);

const floatingUi = document.querySelectorAll(".floating-ui");

window.addEventListener("pointermove", (event) => {
  if (window.innerWidth < 920 || prefersReducedMotion.matches) return;

  const x = (event.clientX / window.innerWidth - 0.5) * 10;
  const y = (event.clientY / window.innerHeight - 0.5) * 10;

  floatingUi.forEach((node, index) => {
    const depth = (index + 1) * 0.28;
    node.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
  });
});

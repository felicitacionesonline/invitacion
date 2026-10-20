const eventDate = new Date("2026-10-24T20:00:00-04:00");
const countdown = document.querySelector("#countdown");
const eventMessage = document.querySelector("#event-message");
const cover = document.querySelector("#cover");
const invitation = document.querySelector("#invitacion");
const openButton = document.querySelector("#open-invitation");
const messageField = document.querySelector("#whatsapp-message");
const whatsappLink = document.querySelector("#whatsapp-link");
const musicToggle = document.querySelector("#music-toggle");
const backgroundMusic = document.querySelector("#background-music");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateCountdown() {
  const remaining = eventDate.getTime() - Date.now();

  if (remaining <= 0) {
    countdown.hidden = true;
    eventMessage.hidden = false;
    return;
  }

  const seconds = Math.floor(remaining / 1000);
  document.querySelector("#days").textContent = String(Math.floor(seconds / 86400)).padStart(3, "0");
  document.querySelector("#hours").textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
  document.querySelector("#minutes").textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  document.querySelector("#seconds").textContent = String(seconds % 60).padStart(2, "0");
}

function openInvitation() {
  document.body.classList.add("is-open");
  cover.classList.add("is-opening");
  invitation.removeAttribute("inert");
  invitation.setAttribute("aria-hidden", "false");
  window.setTimeout(() => cover.setAttribute("aria-hidden", "true"), 1000);
  document.querySelector("#inicio").setAttribute("tabindex", "-1");
  window.setTimeout(() => document.querySelector("#inicio").focus({ preventScroll: true }), 350);
}

function updateWhatsAppLink() {
  whatsappLink.href = `https://wa.me/59174953926?text=${encodeURIComponent(messageField.value.trim())}`;
}

function createSparkles() {
  const sparkles = document.querySelector("#sparkles");
  const count = window.innerWidth < 600 ? 18 : 30;

  for (let index = 0; index < count; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.setProperty("--size", `${2 + Math.random() * 3}px`);
    sparkle.style.setProperty("--duration", `${2.5 + Math.random() * 3}s`);
    sparkle.style.setProperty("--delay", `${Math.random() * 5}s`);
    sparkles.append(sparkle);
  }
}

async function toggleMusic() {
  if (musicToggle.getAttribute("aria-pressed") === "true") {
    backgroundMusic.pause();
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Activar música de fondo");
    musicToggle.title = "Activar música de fondo";
    return;
  }

  try {
    await backgroundMusic.play();
    musicToggle.setAttribute("aria-pressed", "true");
    musicToggle.setAttribute("aria-label", "Silenciar música de fondo");
    musicToggle.title = "Silenciar música de fondo";
  } catch (error) {
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Activar música de fondo");
    musicToggle.title = error.name === "NotSupportedError"
      ? "El formato del archivo de audio no es compatible con este navegador"
      : "No se pudo reproducir el archivo de audio";
  }
}

openButton.addEventListener("click", openInvitation);
messageField.addEventListener("input", updateWhatsAppLink);
musicToggle.addEventListener("click", toggleMusic);

updateCountdown();
window.setInterval(updateCountdown, 1000);
updateWhatsAppLink();

if (!reduceMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

if (!reduceMotion.matches) createSparkles();
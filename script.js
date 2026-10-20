const eventDate = new Date("2026-10-24T20:00:00-04:00");
const countdown = document.querySelector("#countdown");
const eventMessage = document.querySelector("#event-message");
const cover = document.querySelector("#cover");
const invitation = document.querySelector("#invitacion");
const openButton = document.querySelector("#open-invitation");
const messageField = document.querySelector("#whatsapp-message");
const whatsappLink = document.querySelector("#whatsapp-link");
const musicToggle = document.querySelector("#music-toggle");
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
  whatsappLink.href = `https://wa.me/59168837629?text=${encodeURIComponent(messageField.value.trim())}`;
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

let audioContext;
let musicTimer;
let noteIndex = 0;
const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

function playNote() {
  if (!audioContext || audioContext.state !== "running") return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.value = notes[noteIndex % notes.length];
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.045, now + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 1.4);
  noteIndex += 1;
}

async function toggleMusic() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      musicToggle.title = "La música no está disponible en este navegador";
      return;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "running") {
    window.clearInterval(musicTimer);
    await audioContext.suspend();
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Activar música de fondo");
    musicToggle.title = "Activar música de fondo";
    return;
  }

  await audioContext.resume();
  playNote();
  musicTimer = window.setInterval(playNote, 850);
  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "Silenciar música de fondo");
  musicToggle.title = "Silenciar música de fondo";
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
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
let musicOutput;
let reverbDelay;
let reverbOutput;
let musicTimer;
let noteIndex = 0;
const progression = [
  [261.63, 329.63, 392, 523.25],
  [220, 261.63, 329.63, 440],
  [174.61, 220, 261.63, 349.23],
  [196, 246.94, 293.66, 392]
];

function createMusicOutput() {
  musicOutput = audioContext.createGain();
  reverbDelay = audioContext.createDelay(1.5);
  reverbOutput = audioContext.createGain();

  musicOutput.gain.value = 0.7;
  reverbDelay.delayTime.value = 0.42;
  reverbOutput.gain.value = 0.18;
  musicOutput.connect(audioContext.destination);
  reverbDelay.connect(reverbOutput);
  reverbOutput.connect(audioContext.destination);
}

function playTone(frequency, startTime, duration, volume, type = "sine") {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.035);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(envelope);
  envelope.connect(musicOutput);
  envelope.connect(reverbDelay);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

function playAmbientBeat() {
  if (!audioContext || audioContext.state !== "running") return;
  const now = audioContext.currentTime;
  const beat = noteIndex % 12;
  const chord = progression[Math.floor(beat / 3)];
  const position = beat % 3;

  playTone(chord[position], now, 1.05, 0.035);
  if (position === 0) playTone(chord[0] / 2, now, 1.35, 0.045, "triangle");
  if (position === 2) playTone(chord[3] * 2, now, 1.4, 0.012);
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
    createMusicOutput();
  }

  if (musicToggle.getAttribute("aria-pressed") === "true") {
    window.clearInterval(musicTimer);
    if (audioContext.state === "running") await audioContext.suspend();
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Activar música de fondo");
    musicToggle.title = "Activar música de fondo";
    return;
  }

  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "Silenciar música de fondo");
  musicToggle.title = "Silenciar música de fondo";

  try {
    await audioContext.resume();
    if (musicToggle.getAttribute("aria-pressed") !== "true") {
      if (audioContext.state === "running") await audioContext.suspend();
      return;
    }
    playAmbientBeat();
    musicTimer = window.setInterval(playAmbientBeat, 700);
  } catch {
    musicToggle.setAttribute("aria-pressed", "false");
    musicToggle.setAttribute("aria-label", "Activar música de fondo");
    musicToggle.title = "El navegador no permitió iniciar el audio";
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
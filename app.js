/* ========================================
   FOR JESSICA
   Drop her pictures in the photos folder as:
   photos/1.jpg  photos/2.jpg  photos/3.jpg ...
   jpg, jpeg, png, or webp all work.
======================================== */
const WISH = {
  name: "Jessica",
  opener: "To my best friend. My person. The girl who makes every day feel special.",
  lines: [
    "You’ve had my whole heart through everything, and I honestly can’t imagine my life without you in it.",
    "I pray this new year wraps you in joy, peace, and every little thing you’ve been wishing for.",
    "Thank you for being you.",
    "You’re my best friend today… and maybe, this year, you’ll let me be more than that.",
  ],
  closer: "I love you so much. Let’s make today unforgettable.",
  photos: [
    "photos/1.jpg",
    "photos/2.jpg",
    "photos/3.jpg",
    "photos/4.jpg",
    "photos/5.jpg",
    "photos/6.jpg",
    "photos/7.jpg",
    "photos/8.jpg",
  ],
};

const herName =
  new URLSearchParams(window.location.search).get("name")?.trim() || WISH.name;

document.getElementById("her-name").textContent = herName;
document.getElementById("wish-open").textContent = WISH.opener;
document.getElementById("wish-close").textContent = WISH.closer;

const wishLines = document.getElementById("wish-lines");
WISH.lines.forEach((line) => {
  const p = document.createElement("p");
  p.className = "wish-line";
  p.textContent = line;
  wishLines.appendChild(p);
});

const canSpeak = "speechSynthesis" in window;
let voiceOn = true;
let chosenVoice = null;
let loveScreenOpen = false;

function loadVoices() {
  if (!canSpeak) {
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return;
  }
  const preferred = [
    "Samantha",
    "Google UK English Female",
    "Google US English",
    "Microsoft Aria",
    "Microsoft Zira",
    "Karen",
    "Moira",
  ];
  chosenVoice =
    preferred.map((name) => voices.find((voice) => voice.name.includes(name))).find(Boolean) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ||
    voices[0];
}

if (canSpeak) {
  loadVoices();
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  window.setInterval(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
    }
  }, 8000);
}

let loveScreenReady = false;
let wishSpeechStarted = false;
let speechToken = 0;

function stopSpeech() {
  speechToken += 1;
  if (canSpeak) {
    window.speechSynthesis.cancel();
  }
}

function makeUtterance(text, rate) {
  loadVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }
  utterance.lang = chosenVoice?.lang || "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  return utterance;
}

function speakText(text, rate = 0.9) {
  if (!canSpeak || !voiceOn || !text) {
    return;
  }
  window.speechSynthesis.speak(makeUtterance(text, rate));
}

function waitForLoveScreenThenWish(token) {
  if (token !== speechToken || !voiceOn || wishSpeechStarted) {
    return;
  }
  if (loveScreenReady) {
    wishSpeechStarted = true;
    window.setTimeout(() => {
      if (token !== speechToken || !voiceOn) {
        return;
      }
      speakWish();
    }, 450);
    return;
  }
  window.setTimeout(() => {
    if (token !== speechToken || !voiceOn || wishSpeechStarted) {
      return;
    }
    if (loveScreenReady) {
      waitForLoveScreenThenWish(token);
      return;
    }
    const keep = makeUtterance(".", 0.7);
    keep.volume = 0.01;
    keep.onend = () => waitForLoveScreenThenWish(token);
    keep.onerror = () => waitForLoveScreenThenWish(token);
    window.speechSynthesis.speak(keep);
  }, 350);
}

function queueCountdownVoice() {
  if (!canSpeak || !voiceOn) {
    return;
  }
  stopSpeech();
  const token = speechToken;
  loveScreenReady = false;
  wishSpeechStarted = false;
  loadVoices();
  try {
    window.speechSynthesis.resume();
  } catch (error) {
    // iOS can throw if the engine is not ready yet
  }

  const nums = ["3", "2", "1"];
  let index = 0;

  const speakNextNumber = () => {
    if (token !== speechToken || !voiceOn) {
      return;
    }
    if (index >= nums.length) {
      waitForLoveScreenThenWish(token);
      return;
    }
    const utterance = makeUtterance(nums[index], 0.8);
    index += 1;
    utterance.onend = speakNextNumber;
    utterance.onerror = speakNextNumber;
    window.speechSynthesis.speak(utterance);
  };

  speakNextNumber();
}

function speakWish() {
  if (!canSpeak || !voiceOn) {
    return;
  }
  loadVoices();
  try {
    window.speechSynthesis.resume();
  } catch (error) {
    // ignore
  }
  speakText(`Happy Birthday, ${herName}.`, 0.88);
  speakText(WISH.opener, 0.88);
  WISH.lines.forEach((line) => speakText(line, 0.88));
  speakText(WISH.closer, 0.88);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 720px)").matches;

function viewSize() {
  const viewport = window.visualViewport;
  return {
    w: Math.round(viewport?.width || window.innerWidth),
    h: Math.round(viewport?.height || window.innerHeight),
  };
}

function cameraDistance() {
  const { w, h } = viewSize();
  const shortest = Math.min(w, h);
  if (w <= 720) {
    return shortest < 400 ? 740 : 660;
  }
  if (h < 520 && w > h) {
    return 640;
  }
  return 500;
}

const wrap = document.getElementById("canvas-wrap");
const intro = document.getElementById("intro");
const introCopy = document.getElementById("intro-copy");
const countdown = document.getElementById("countdown");
const countdownNum = document.getElementById("countdown-num");
const countdownLabel = document.querySelector(".countdown-label");
const countdownRing = document.querySelector(".countdown-ring");
const replay = document.getElementById("replay");
const eyebrow = document.getElementById("eyebrow");
const nameEl = document.getElementById("her-name");
const wishEl = document.getElementById("wish");
const wishOpen = document.querySelector(".wish-open");
const wishClose = document.querySelector(".wish-close");
const glow = document.querySelector(".glow");
const memories = document.getElementById("memories");
const bgPhoto = document.getElementById("bg-photo-img");

gsap.set(bgPhoto, { autoAlpha: 0, scale: 0.92, y: 28 });

function fitPhoto() {
  if (!bgPhoto) {
    return;
  }
  const nativeW = bgPhoto.naturalWidth || 774;
  const nativeH = bgPhoto.naturalHeight || 1024;
  const { w, h } = viewSize();
  const pad = w <= 720 ? 24 : 32;
  bgPhoto.style.maxWidth = `${Math.min(nativeW, Math.max(180, w - pad))}px`;
  bgPhoto.style.maxHeight = `${Math.min(nativeH, Math.max(220, h - pad))}px`;
}

if (bgPhoto) {
  if (bgPhoto.complete) {
    fitPhoto();
  } else {
    bgPhoto.addEventListener("load", fitPhoto);
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, viewSize().w / Math.max(viewSize().h, 1), 1, 3000);
camera.position.z = cameraDistance();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.75 : 2));
renderer.setSize(viewSize().w, viewSize().h, false);
renderer.setClearColor(0x000000, 0);
wrap.appendChild(renderer.domElement);

function sizeScene() {
  const { w, h } = viewSize();
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  camera.position.z = cameraDistance();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, w <= 720 ? 1.75 : 2));
  renderer.setSize(w, h, false);
  fitPhoto();
}

sizeScene();

function createSprite() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,230,240,1)");
  gradient.addColorStop(0.45, "rgba(255,160,196,0.85)");
  gradient.addColorStop(0.72, "rgba(255,130,180,0.35)");
  gradient.addColorStop(1, "rgba(255,170,200,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function sampleHeart() {
  const path = document.querySelector("#heart-path");
  const length = path.getTotalLength();
  const step = isMobile ? 0.2 : 0.11;
  const targets = [];
  const delays = [];
  const durations = [];

  if (length > 1) {
    for (let i = 0; i < length; i += step) {
      const point = path.getPointAtLength(i);
      const vector = new THREE.Vector3(point.x, -point.y, 0);
      vector.x += (Math.random() - 0.5) * 30;
      vector.y += (Math.random() - 0.5) * 30;
      vector.z += (Math.random() - 0.5) * 70;
      vector.x -= 600 / 2;
      vector.y -= -552 / 2;
      targets.push(vector);
      delays.push(i * 0.002);
      durations.push(gsap.utils.random(2, 5));
    }
    return { targets, delays, durations };
  }

  const countFallback = isMobile ? 5500 : 9000;
  for (let i = 0; i < countFallback; i += 1) {
    const t = (i / countFallback) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const vector = new THREE.Vector3(x * 13, y * 13, 0);
    vector.x += (Math.random() - 0.5) * 30;
    vector.y += (Math.random() - 0.5) * 30;
    vector.z += (Math.random() - 0.5) * 70;
    targets.push(vector);
    delays.push(i * 0.0007);
    durations.push(gsap.utils.random(2, 5));
  }

  return { targets, delays, durations };
}

function makeColors(count) {
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color("#ff8ab4"),
    new THREE.Color("#ff9ec4"),
    new THREE.Color("#ffb7d5"),
    new THREE.Color("#ffd0e4"),
    new THREE.Color("#ffe8f1"),
    new THREE.Color("#ffffff"),
  ];

  for (let i = 0; i < count; i += 1) {
    const color = palette[i % palette.length].clone();
    color.offsetHSL((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.2) * 0.12);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return colors;
}

const { targets, delays, durations } = sampleHeart();
const count = targets.length;
const positions = new Float32Array(count * 3);
const rest = new Float32Array(count * 3);
const start = new THREE.Vector3(0, 0, 0);

for (let i = 0; i < count; i += 1) {
  positions[i * 3] = start.x;
  positions[i * 3 + 1] = start.y;
  positions[i * 3 + 2] = start.z;
  rest[i * 3] = targets[i].x;
  rest[i * 3 + 1] = targets[i].y;
  rest[i * 3 + 2] = targets[i].z;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(makeColors(count), 3));

const material = new THREE.PointsMaterial({
  size: isMobile ? 4.4 : 3.6,
  map: createSprite(),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  sizeAttenuation: true,
  opacity: 1,
});

const heart = new THREE.Points(geometry, material);
scene.add(heart);

const ease = gsap.parseEase("power2.inOut");
const clock = { t: 0 };
let maxTime = 0;
for (let i = 0; i < count; i += 1) {
  const end = delays[i] + durations[i];
  if (end > maxTime) {
    maxTime = end;
  }
}
let formed = false;
let pointerX = 0;
let pointerY = 0;
let showStarted = false;
let replayLock = false;

const rotX = gsap.quickTo(heart.rotation, "x", { duration: 1.4, ease: "power3.out" });
const rotY = gsap.quickTo(heart.rotation, "y", { duration: 1.4, ease: "power3.out" });

function placeParticles(time, snap) {
  for (let i = 0; i < count; i += 1) {
    const local = snap ? 1 : (time - delays[i]) / durations[i];
    const p = ease(Math.max(0, Math.min(1, local)));
    positions[i * 3] = start.x + (rest[i * 3] - start.x) * p;
    positions[i * 3 + 1] = start.y + (rest[i * 3 + 1] - start.y) * p;
    positions[i * 3 + 2] = start.z + (rest[i * 3 + 2] - start.z) * p;
  }
  geometry.attributes.position.needsUpdate = true;
}

function driftParticles(elapsed) {
  for (let i = 0; i < count; i += 1) {
    const wobble = 1.8 + (i % 7) * 0.12;
    positions[i * 3] = rest[i * 3] + Math.sin(elapsed * 0.7 + i * 0.13) * wobble;
    positions[i * 3 + 1] = rest[i * 3 + 1] + Math.cos(elapsed * 0.55 + i * 0.09) * wobble;
    positions[i * 3 + 2] = rest[i * 3 + 2] + Math.sin(elapsed * 0.4 + i * 0.05) * 3.2;
  }
  geometry.attributes.position.needsUpdate = true;
}

function resetWishPieces() {
  const slide = isMobile ? 72 : 120;
  gsap.set(wishEl, { autoAlpha: 0 });
  gsap.set(wishOpen, { autoAlpha: 0, y: isMobile ? -48 : -90, x: 0 });
  gsap.set(".wish-line:nth-child(1)", { autoAlpha: 0, x: -slide, y: 0 });
  gsap.set(".wish-line:nth-child(2)", { autoAlpha: 0, x: slide, y: 0 });
  gsap.set(".wish-line:nth-child(3)", { autoAlpha: 0, x: -slide, y: isMobile ? 8 : 24 });
  gsap.set(".wish-line:nth-child(4)", { autoAlpha: 0, x: slide, y: isMobile ? 8 : 24 });
  gsap.set(wishClose, { autoAlpha: 0, y: isMobile ? 48 : 100, x: 0 });
}

gsap.set([eyebrow, nameEl, replay, glow], { autoAlpha: 0 });
resetWishPieces();

const words = gsap.timeline({ paused: true });
words
  .fromTo(
    eyebrow,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 1.4, ease: "power2.out" },
    reduceMotion ? 0 : 2.8
  )
  .to(glow, { autoAlpha: 1, duration: 2.4, ease: "power2.out" }, reduceMotion ? 0 : 3.6)
  .fromTo(
    nameEl,
    { autoAlpha: 0, y: 18 },
    { autoAlpha: 1, y: 0, duration: 1.8, ease: "power3.out" },
    reduceMotion ? 0.15 : 5.2
  )
  .set(wishEl, { autoAlpha: 1 }, reduceMotion ? 0.2 : 6.4)
  .to(
    wishOpen,
    { autoAlpha: 1, y: 0, x: 0, duration: 2.2, ease: "power2.inOut" },
    reduceMotion ? 0.25 : 6.5
  )
  .to(
    ".wish-line:nth-child(1)",
    { autoAlpha: 1, x: 0, y: 0, duration: 2.1, ease: "power2.inOut" },
    reduceMotion ? 0.3 : "+=0.55"
  )
  .to(
    ".wish-line:nth-child(2)",
    { autoAlpha: 1, x: 0, y: 0, duration: 2.1, ease: "power2.inOut" },
    reduceMotion ? 0.35 : "+=0.5"
  )
  .to(
    ".wish-line:nth-child(3)",
    { autoAlpha: 1, x: 0, y: 0, duration: 2.1, ease: "power2.inOut" },
    reduceMotion ? 0.4 : "+=0.5"
  )
  .to(
    ".wish-line:nth-child(4)",
    { autoAlpha: 1, x: 0, y: 0, duration: 2.1, ease: "power2.inOut" },
    reduceMotion ? 0.45 : "+=0.5"
  )
  .to(
    wishClose,
    { autoAlpha: 1, y: 0, x: 0, duration: 2.3, ease: "power2.inOut" },
    reduceMotion ? 0.5 : "+=0.6"
  )
  .add(showPhotos, "+=0.2")
  .to(replay, { autoAlpha: 1, duration: 1 }, "+=0.3")
  .add(() => replay.classList.add("is-on"));

const gather = gsap.timeline({ paused: true });
gather.to(clock, {
  t: maxTime,
  duration: reduceMotion ? 0.01 : maxTime,
  ease: "none",
  onUpdate() {
    if (!formed) {
      placeParticles(clock.t, reduceMotion);
    }
  },
  onComplete() {
    formed = true;
    startHeartbeat();
  },
});

let beat;
function startHeartbeat() {
  if (beat) {
    beat.kill();
  }
  beat = gsap.timeline({ repeat: -1, repeatDelay: 0.72 });
  beat
    .to(heart.scale, { x: 1.045, y: 1.045, z: 1.045, duration: 0.16, ease: "power2.out" })
    .to(heart.scale, { x: 1, y: 1, z: 1, duration: 0.18, ease: "power2.in" })
    .to(heart.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.16, ease: "power2.out" })
    .to(heart.scale, { x: 1, y: 1, z: 1, duration: 0.28, ease: "power2.in" });
}

function revealPhoto() {
  gsap.fromTo(
    bgPhoto,
    { autoAlpha: 0, scale: 0.92, y: 28 },
    { autoAlpha: 1, scale: 1, y: 0, duration: 2.2, ease: "power2.out" }
  );
}

function openLoveScreen() {
  gsap.to(intro, {
    autoAlpha: 0,
    duration: 0.9,
    ease: "power2.inOut",
    onComplete() {
      intro.style.pointerEvents = "none";
    },
  });
  loveScreenOpen = true;
  loveScreenReady = true;
  revealPhoto();
  gather.play(0);
  words.play(0);
  waitForLoveScreenThenWish(speechToken);

function playCountdownThenOpen() {
  const labels = {
    3: "ready?",
    2: "almost",
    1: "for you",
    0: "open your heart",
  };

  gsap.set(countdown, { autoAlpha: 1, visibility: "visible" });
  gsap.set(countdownNum, { autoAlpha: 0, scale: 0.5 });
  gsap.set(countdownLabel, { autoAlpha: 0, y: 8 });
  gsap.set(countdownRing, { autoAlpha: 0, scale: 0.72 });

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: openLoveScreen,
  });

  tl.to(introCopy, { autoAlpha: 0, y: -16, duration: 0.5 }).to(
    countdownRing,
    { autoAlpha: 1, scale: 1, duration: 0.75, ease: "power2.out" },
    "<0.12"
  );

  [3, 2, 1, 0].forEach((n, index) => {
    const last = index === 3;
    tl.add(() => {
      countdownNum.textContent = String(n);
      countdownLabel.textContent = labels[n];
    })
      .fromTo(
        countdownNum,
        { autoAlpha: 0, scale: 0.48 },
        { autoAlpha: 1, scale: 1, duration: reduceMotion ? 0.12 : 0.7, ease: "back.out(1.5)" }
      )
      .fromTo(
        countdownLabel,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: reduceMotion ? 0.1 : 0.45 },
        "<"
      )
      .to(
        countdownRing,
        { scale: 1.1, duration: reduceMotion ? 0.1 : 0.5, ease: "sine.out" },
        "<"
      )
      .to(countdownRing, { scale: 1, duration: reduceMotion ? 0.1 : 0.5, ease: "sine.in" });

    if (last) {
      tl.to(countdownNum, {
        scale: 1.38,
        duration: reduceMotion ? 0.15 : 0.75,
        ease: "power2.in",
      });
    } else {
      tl.to(
        countdownNum,
        { autoAlpha: 0, scale: 1.22, duration: reduceMotion ? 0.1 : 0.42, ease: "power2.in" },
        "+=0.28"
      ).to(countdownLabel, { autoAlpha: 0, duration: reduceMotion ? 0.08 : 0.3 }, "<");
    }
  });
}

function startShow() {
  if (showStarted) {
    return;
  }
  showStarted = true;
  intro.style.cursor = "default";
  queueCountdownVoice();
  playCountdownThenOpen();
}

function replayShow() {
  if (replayLock) {
    return;
  }
  replayLock = true;
  window.setTimeout(() => {
    replayLock = false;
  }, 700);
  formed = false;
  clock.t = 0;
  if (beat) {
    beat.kill();
  }
  heart.scale.set(1, 1, 1);
  replay.classList.remove("is-on");
  gsap.set([eyebrow, nameEl, replay, glow], { autoAlpha: 0, y: 0, scale: 1 });
  resetWishPieces();
  gsap.set("#memories .memory", { autoAlpha: 0, scale: 0.86, y: 18 });
  gsap.set(bgPhoto, { autoAlpha: 0, scale: 0.92, y: 28 });
  placeParticles(0, false);
  revealPhoto();
  gather.play(0);
  words.play(0);
  stopSpeech();
  speakWish();
}

function bindActivate(el, handler) {
  const go = (event) => {
    handler(event);
  };
  el.addEventListener("click", go);
  el.addEventListener(
    "touchend",
    (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
      go(event);
    },
    { passive: false }
  );
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(event);
    }
  });
}

function loadPhoto(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function preparePhotos() {
  const candidates = [];
  WISH.photos.forEach((src) => {
    candidates.push(src);
    if (/\.jpg$/i.test(src)) {
      candidates.push(src.replace(/\.jpg$/i, ".jpeg"));
      candidates.push(src.replace(/\.jpg$/i, ".png"));
      candidates.push(src.replace(/\.jpg$/i, ".webp"));
    }
  });

  const results = await Promise.all(candidates.map(loadPhoto));
  const found = [];
  const seen = new Set();
  results.forEach((src) => {
    if (!src) {
      return;
    }
    const key = src.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    found.push(src);
  });

  found.forEach((src) => {
    const card = document.createElement("figure");
    card.className = "memory";
    const image = document.createElement("img");
    image.src = src;
    image.alt = "Jessica";
    card.appendChild(image);
    memories.appendChild(card);
  });

  gsap.set(".memory", { autoAlpha: 0, scale: 0.86, y: 18 });
}

function showPhotos() {
  const cards = document.querySelectorAll("#memories .memory");
  if (!cards.length) {
    return;
  }
  gsap.to(cards, {
    autoAlpha: 1,
    scale: 1,
    y: 0,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.18,
  });
}

preparePhotos();

bindActivate(intro, startShow);
bindActivate(replay, replayShow);

const voiceToggle = document.getElementById("voice-toggle");
function syncVoiceButton() {
  voiceToggle.textContent = voiceOn ? "Sound on" : "Sound off";
  voiceToggle.setAttribute("aria-pressed", voiceOn ? "true" : "false");
}
voiceToggle.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  voiceOn = !voiceOn;
  syncVoiceButton();
  if (!voiceOn) {
    stopSpeech();
  } else if (loveScreenOpen) {
    stopSpeech();
    speakWish();
  }
});

window.addEventListener("pointermove", (event) => {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerY = (event.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener("resize", sizeScene);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", sizeScene);
}

const renderClock = new THREE.Clock();

function render() {
  requestAnimationFrame(render);
  const elapsed = renderClock.getElapsedTime();

  if (formed && !reduceMotion) {
    driftParticles(elapsed);
  }

  rotY(pointerX * 0.28);
  rotX(-pointerY * 0.16);
  heart.rotation.z = Math.sin(elapsed * 0.15) * 0.03;

  renderer.render(scene, camera);
}

render();

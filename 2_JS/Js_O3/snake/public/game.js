/* ==========================================================================
   JUEGO SALCHICHA SNAKE - LÓGICA COMPLETA DE JUEGO (FRONTEND)
   ========================================================================== */

// --- CONFIGURACIÓN E INTRODUCCIÓN GENERAL ---
let GRID_SIZE = 15; // Menos celdas = cuadrados y sprites más grandes en el mismo canvas
const CANVAS_SIZE = 1000;
let TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
const SNAKE_DRAW_SCALE = 2.05; // La salchicha ocupa casi toda la celda
const BONE_DRAW_SCALE = 1.75;
const BRICK_DRAW_SCALE = 1.38;
const MAX_CANVAS_DPR = 2.5;
const SPRITE_UPSCALE_MARGIN = 1.15;

// --- CONTROLADOR DE SONIDO (música + efectos + UI) ---
class AudioController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("salchicha_muted") === "true";
    this.sfxVolume = this.loadVolume("salchicha_sfx_volume", 0.85);
    this.musicVolume = this.loadVolume("salchicha_music_volume", 0.4);

    this.eatAudio = new Audio("/audios/masticar.m4a");
    this.eatAudio.preload = "auto";
    this.hitAudio = new Audio("/audios/golpe.mp3");
    this.hitAudio.preload = "auto";

    const musicSources = [
      "/audios/musica de fondo.m4a",
      "/audios/musica de fondo.mp4",
    ];
    this.musicAudio = new Audio(encodeURI(musicSources[0]));
    this.musicAudio.loop = true;
    this.musicAudio.preload = "auto";
    this.musicFileOk = false;
    this.musicAudio.addEventListener("canplaythrough", () => {
      this.musicFileOk = true;
    });
    this.musicAudio.addEventListener("error", () => {
      if (this.musicAudio.src.includes(musicSources[0])) {
        this.musicAudio.src = encodeURI(musicSources[1]);
        this.musicAudio.load();
        return;
      }
      this.musicFileOk = false;
    });

    this.ambientNodes = null;
    this.applyVolumes();
    this.updateMuteIcon();
  }

  loadVolume(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === "") return fallback;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
  }

  saveVolume(key, value) {
    localStorage.setItem(key, String(Math.min(1, Math.max(0, value))));
  }

  applyVolumes() {
    const sfx = this.muted ? 0 : this.sfxVolume;
    const music = this.muted ? 0 : this.musicVolume;
    this.eatAudio.volume = sfx;
    this.hitAudio.volume = sfx;
    if (this.musicAudio) this.musicAudio.volume = music;
    if (this.ambientNodes?.gain) {
      this.ambientNodes.gain.gain.setTargetAtTime(
        music * 0.12,
        this.ctx?.currentTime || 0,
        0.08,
      );
    }
  }

  setSfxVolume(value) {
    this.sfxVolume = Math.min(1, Math.max(0, value));
    this.saveVolume("salchicha_sfx_volume", this.sfxVolume);
    this.applyVolumes();
  }

  setMusicVolume(value) {
    this.musicVolume = Math.min(1, Math.max(0, value));
    this.saveVolume("salchicha_music_volume", this.musicVolume);
    this.applyVolumes();
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("salchicha_muted", this.muted);
    this.applyVolumes();
    this.updateMuteIcon();
    if (this.muted) this.stopMusic();
    else this.startMusic();
    this.playClick();
  }

  updateMuteIcon() {
    const muteBtn = document.getElementById("mute-btn");
    if (!muteBtn) return;
    if (this.muted) {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      muteBtn.classList.add("muted");
    } else {
      muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      muteBtn.classList.remove("muted");
    }
  }

  startMusic() {
    if (this.muted || this.musicVolume <= 0) return;
    this.init();
    const tryPlayFile = () => {
      this.stopAmbient();
      this.musicAudio.volume = this.musicVolume;
      return this.musicAudio.play();
    };
    if (this.musicFileOk) {
      tryPlayFile().catch(() => this.startAmbient());
      return;
    }
    tryPlayFile()
      .then(() => {
        this.musicFileOk = true;
      })
      .catch(() => this.startAmbient());
  }

  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
    this.stopAmbient();
  }

  startAmbient() {
    if (this.muted || this.musicVolume <= 0 || this.ambientNodes) return;
    this.init();
    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1, now + 1.2);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(196, now);
    osc2.frequency.setValueAtTime(246, now);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    osc1.start(now);
    osc2.start(now);

    this.ambientNodes = { gain, osc1, osc2 };
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    const { gain, osc1, osc2 } = this.ambientNodes;
    const t = this.ctx?.currentTime || 0;
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);
      osc1.stop(t + 0.45);
      osc2.stop(t + 0.45);
    } catch (_) {
      /* ya detenido */
    }
    this.ambientNodes = null;
  }

  playClick() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      300,
      this.ctx.currentTime + 0.05,
    );

    gain.gain.setValueAtTime(0.05 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playEat() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.eatAudio.currentTime = 0;
    this.eatAudio.play().catch(() => {});
  }

  playLevelUp() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();

    const notes = [261.63, 329.63, 392.0, 523.25];
    const now = this.ctx.currentTime;
    const peak = 0.08 * this.sfxVolume;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(peak, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.15);
    });
  }

  playGameOver() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.hitAudio.currentTime = 0;
    const hitSound = this.hitAudio.play();
    if (hitSound && typeof hitSound.catch === "function") {
      hitSound.catch(() => this.playGeneratedGameOver());
    }
  }

  playGeneratedGameOver() {
    if (this.muted || this.sfxVolume <= 0) return;
    this.init();

    const now = this.ctx.currentTime;

    // Oscilador de tono bajo descendente
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.6);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.6);

    // Generar algo de ruido blanco para simular la explosión
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(10, now + 0.4);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch (e) {
      console.warn("No se pudo reproducir ruido de explosión", e);
    }
  }
}

// Instanciar controlador de sonido
const sound = new AudioController();

function getRenderDpr() {
  return Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
}

function applyCanvasRenderQuality(context) {
  if (!context) return;
  context.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in context) {
    context.imageSmoothingQuality = "high";
  }
}

function getSpriteCacheSize() {
  const dpr = getRenderDpr();
  return Math.ceil(
    Math.max(
      getSnakeDrawSize(),
      TILE_SIZE * BONE_DRAW_SCALE,
      TILE_SIZE * BRICK_DRAW_SCALE,
    ) *
      dpr *
      SPRITE_UPSCALE_MARGIN,
  );
}

async function upscaleSpriteSource(img) {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  const target = getSpriteCacheSize();
  const maxSide = Math.max(naturalW, naturalH);

  if (!naturalW || !naturalH || maxSide >= target) {
    return img;
  }

  let current = img;
  let currentW = naturalW;
  let currentH = naturalH;

  // Escalado por pasos 2× suele verse más nítido que un solo salto grande
  while (Math.max(currentW, currentH) < target) {
    const step = Math.min(2, target / Math.max(currentW, currentH));
    const nextW = Math.min(Math.round(currentW * step), target);
    const nextH = Math.min(Math.round(currentH * step), target);

    const scratch = document.createElement("canvas");
    scratch.width = nextW;
    scratch.height = nextH;
    const sctx = scratch.getContext("2d");
    applyCanvasRenderQuality(sctx);
    sctx.drawImage(current, 0, 0, nextW, nextH);

    const upgraded = new Image();
    upgraded.src = scratch.toDataURL("image/png");
    await upgraded.decode();
    current = upgraded;

    currentW = nextW;
    currentH = nextH;
  }

  return current;
}

function getHeadImageKey(direction) {
  switch (direction) {
    case "arriba":
      return "cabeza_arriba";
    case "abajo":
      return "cabeza_abajo";
    case "izquierda":
      return "cabeza_izquierda";
    default:
      return "cabeza_derecha";
  }
}

function getSpriteImage(assetLoader, key, fallbacks = []) {
  const keys = [key, ...fallbacks];
  for (const k of keys) {
    const img = assetLoader?.images?.[k];
    if (img && !img.__broken) return img;
  }
  return null;
}

function cloneSnakeSegments(snake = []) {
  return snake.map((segment) => ({ x: segment.x, y: segment.y }));
}

function smoothStep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function interpolateSegment(current, previous, progress) {
  if (!current || !previous) return current;
  const eased = smoothStep(progress);
  return {
    x: previous.x + (current.x - previous.x) * eased,
    y: previous.y + (current.y - previous.y) * eased,
  };
}

function drawSnakeFromLoader(ctx, player, assetLoader, options = {}) {
  const len = player.snake.length;
  if (len === 0 || !ctx || !assetLoader) return;

  const drawSize = getSnakeDrawSize();
  const headKey = getHeadImageKey(player.direction);
  const previousSnake = options.previousSnake || player.previousSnake || [];
  const progress = Number.isFinite(options.progress) ? options.progress : 1;

  for (let i = len - 1; i >= 0; i--) {
    const seg = player.snake[i];
    const renderSeg = interpolateSegment(seg, previousSnake[i], progress);
    const cx = renderSeg.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = renderSeg.y * TILE_SIZE + TILE_SIZE / 2;

    if (i === 0) {
      const headImg = getSpriteImage(assetLoader, headKey, [
        "cabeza_derecha",
        "cabeza_arriba",
        "cabeza_abajo",
        "cabeza_izquierda",
      ]);
      if (!headImg) continue;
      drawSprite(ctx, headImg, cx - drawSize / 2, cy - drawSize / 2, drawSize, drawSize);
    } else if (i === len - 1) {
      const tailImg = getSpriteImage(assetLoader, "cola", ["cuerpo"]);
      if (!tailImg) continue;
      const prev = player.snake[i - 1];
      const angle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.rotate(Math.PI);
      drawSprite(ctx, tailImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    } else {
      const bodyImg = getSpriteImage(assetLoader, "cuerpo");
      if (!bodyImg) continue;
      const prev = player.snake[i - 1];
      const next = player.snake[i + 1];
      const isVertical = prev.x === seg.x && next.x === seg.x;
      ctx.save();
      ctx.translate(cx, cy);
      if (isVertical) ctx.rotate(Math.PI / 2);
      else if (prev.y !== seg.y && next.x !== seg.x) {
        const dy = prev.y - next.y;
        const dx = prev.x - next.x;
        if (dx !== 0 && dy !== 0) ctx.rotate(Math.atan2(dy, dx));
      }
      drawSprite(ctx, bodyImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    }
  }
}

function setupHiDpiCanvas(canvasEl) {
  if (!canvasEl) return null;

  const dpr = getRenderDpr();
  canvasEl.width = Math.round(CANVAS_SIZE * dpr);
  canvasEl.height = Math.round(CANVAS_SIZE * dpr);

  const context = canvasEl.getContext("2d");
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  applyCanvasRenderQuality(context);
  return context;
}

function drawSprite(context, image, x, y, width, height) {
  if (!image || !context) return;
  applyCanvasRenderQuality(context);
  context.drawImage(
    image,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
  );
}

// --- CARGADOR DE IMÁGENES ---
class AssetLoader {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;
  }

  // Cargar una imagen y devolver una promesa
  loadImage(key, src) {
    this.totalCount++;
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.onload = async () => {
        try {
          if (img.decode) await img.decode();
          this.images[key] = await upscaleSpriteSource(img);
        } catch {
          this.images[key] = img;
        }
        this.loadedCount++;
        resolve(this.images[key]);
      };
      img.onerror = () => {
        console.warn(`No se pudo cargar la imagen: ${src}`);
        const fallback = new Image();
        fallback.__broken = true;
        this.images[key] = fallback;
        resolve(fallback);
      };
    });
  }

  async loadCommonAssets() {
    const promises = [];
    if (!this.images["hueso"]) {
      promises.push(this.loadImage("hueso", "/img/hueso.png"));
    }
    if (!this.images["ladrillo"]) {
      promises.push(this.loadImage("ladrillo", "/img/ladrillo.png"));
    }
    if (promises.length) await Promise.all(promises);
  }

  // Cargar todo el conjunto de sprites para una skin específica
  async loadSkin(skinFolder) {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;

    const basePath = `/img/${skinFolder}`;
    const leftHeadSrc =
      skinFolder === "salchicha blancoy marron"
        ? `${basePath}/caabeza izquierda.png`
        : `${basePath}/cabeza izquierda.png`;

    const promises = [
      this.loadImage("cabeza_arriba", `${basePath}/cabeza arriba.png`),
      this.loadImage("cabeza_abajo", `${basePath}/cabeza abajo.png`),
      this.loadImage("cabeza_izquierda", leftHeadSrc),
      this.loadImage("cabeza_derecha", `${basePath}/cabeza derecha.png`),
      this.loadImage("cuerpo", `${basePath}/cuerpo.png`),
      this.loadImage("cola", `${basePath}/cola.png`),
    ];

    await Promise.all(promises);
    await this.loadCommonAssets();
  }
}

function getSnakeDrawSize() {
  return TILE_SIZE * SNAKE_DRAW_SCALE;
}

function drawGardenBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, "#3f9d45");
  gradient.addColorStop(0.48, "#66bb6a");
  gradient.addColorStop(1, "#2f8b38");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      ctx.fillStyle =
        (x + y) % 2 === 0
          ? "rgba(255, 255, 255, 0.045)"
          : "rgba(15, 79, 25, 0.055)";
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.13)";
  for (let i = 0; i < 200; i++) {
    const x = (i * 73) % CANVAS_SIZE;
    const y = (i * 97) % CANVAS_SIZE;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(18, 70, 24, 0.26)";
  ctx.lineWidth = 2;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(CANVAS_SIZE, i * TILE_SIZE);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE + 1, 0);
    ctx.lineTo(i * TILE_SIZE + 1, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE + 1);
    ctx.lineTo(CANVAS_SIZE, i * TILE_SIZE + 1);
    ctx.stroke();
  }
}

function drawBoneSprite(ctx, bone, boneImage) {
  if (!boneImage) return;
  const time = Date.now();
  const pulse = 0.5 + 0.5 * Math.sin(time / 180);
  const scale = BONE_DRAW_SCALE + 0.1 * Math.sin(time / 140);
  const size = TILE_SIZE * scale;
  const offset = (size - TILE_SIZE) / 2;
  const cx = bone.x * TILE_SIZE + TILE_SIZE / 2;
  const cy = bone.y * TILE_SIZE + TILE_SIZE / 2;
  const glowR = TILE_SIZE * (0.62 + 0.1 * pulse);

  ctx.save();
  ctx.globalAlpha = 0.2 + 0.18 * pulse;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, "rgba(255, 236, 179, 0.95)");
  glow.addColorStop(0.55, "rgba(255, 213, 79, 0.35)");
  glow.addColorStop(1, "rgba(255, 213, 79, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawSprite(
    ctx,
    boneImage,
    bone.x * TILE_SIZE - offset,
    bone.y * TILE_SIZE - offset,
    size,
    size,
  );
}

function isVersusModeActive() {
  return (
    gameState.gameMode === "versus" &&
    typeof Versus1v1 !== "undefined" &&
    Versus1v1.isRunning()
  );
}

function syncMenuSettingsFromDOM() {
  const modeRadio = document.querySelector('input[name="game-mode"]:checked');
  if (modeRadio) gameState.gameMode = modeRadio.value;

  const obstaclesRadio = document.querySelector('input[name="obstacles"]:checked');
  if (obstaclesRadio) {
    gameState.obstaclesEnabled = obstaclesRadio.value === "on";
  }

  const diffRadio = document.querySelector('input[name="difficulty"]:checked');
  if (diffRadio) gameState.difficulty = diffRadio.value;

  const sizeRadio = document.querySelector('input[name="board-size"]:checked');
  if (sizeRadio) gameState.boardSize = parseInt(sizeRadio.value, 10);

  GRID_SIZE = gameState.boardSize;
  TILE_SIZE = CANVAS_SIZE / GRID_SIZE;
}

function updateGameScreenPanel() {
  const soloGuide = document.getElementById("keyboard-guide-solo");
  const versusGuide = document.getElementById("keyboard-guide-versus");
  const panelDesc = document.getElementById("game-panel-desc");
  const skinSection = document.querySelector(".active-skin-preview");
  const activeSkinTitle = document.getElementById("active-skin-title");
  const soloActiveBadge = document.getElementById("solo-active-dog-badge");
  const versusActiveSkins = document.getElementById("versus-active-skins");
  const isVersus = gameState.gameMode === "versus";

  if (soloGuide) soloGuide.style.display = isVersus ? "none" : "block";
  if (versusGuide) versusGuide.style.display = isVersus ? "block" : "none";
  if (skinSection) skinSection.style.display = "block";
  if (activeSkinTitle) {
    activeSkinTitle.textContent = isVersus ? "Skins Activas:" : "Compañero Activo:";
  }
  if (soloActiveBadge) soloActiveBadge.hidden = isVersus;
  if (versusActiveSkins) versusActiveSkins.hidden = !isVersus;

  const mobileStrip = document.getElementById("mobile-active-strip");
  if (mobileStrip) mobileStrip.style.display = isVersus ? "none" : "flex";

  const touchHint = document.getElementById("canvas-touch-hint");
  if (touchHint) {
    touchHint.textContent = isVersus
      ? "J1: joystick izquierdo · J2: joystick derecho"
      : "Joystick para mover · desliza en el tablero";
  }

  document.body.classList.toggle("versus-mobile-controls", isVersus);

  if (panelDesc) {
    panelDesc.textContent = isVersus
      ? "Dos jugadores en la misma pantalla. En celular: joysticks abajo (J1 izq. · J2 der.). En PC: WASD y flechas."
      : "Pasea con tu perrito salchicha por el patio floral y devora todos los deliciosos huesos.";
  }

  updateLevelVisibility();
  updateActiveSkinPreview();
}

const assets = new AssetLoader();

// --- ESTADOS DE JUEGO ---
let gameState = {
  // Configuración
  activeSkin: "salchicha marron",
  difficulty: "normal",
  boardSize: 15, // 12 = celdas enormes, 15 = grandes, 18 = mediano
  gameMode: "solo", // 'solo' o 'versus'
  obstaclesEnabled: localStorage.getItem("salchicha_obstacles") === "true",
  highScore: parseInt(localStorage.getItem("salchicha_highscore")) || 0,

  // Variables de Partida
  snake: [], // Array de objetos {x, y}
  direction: "derecha", // derecha, izquierda, arriba, abajo
  nextDirection: "derecha",
  score: 0,
  level: 1,
  speed: 130, // Tiempo en ms entre ticks
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  newRecordDuringGame: false,
  timeStarted: 0,
  totalPlayTime: 0,

  // Recursos en mapa
  bone: { x: 0, y: 0 },
  bricks: [], // Array de objetos {x, y}
  gardenDecorations: [], // Decoraciones procedimentales del patio de flores

  // Ciclo
  lastTickTime: 0,
  previousSnake: [],
};

// Sincronizar estadísticas en la interfaz (Móvil y Escritorio)
function updateUIStats() {
  // Stats móviles
  if (scoreVal) scoreVal.textContent = gameState.score;
  if (levelVal) levelVal.textContent = gameState.level;
  if (highscoreVal) highscoreVal.textContent = gameState.highScore;

  // Stats escritorio
  const desktopScore = document.getElementById("desktop-score");
  const desktopLevel = document.getElementById("desktop-level");
  const desktopHighscore = document.getElementById("desktop-highscore");
  const desktopTime = document.getElementById("desktop-time");
  const desktopDiff = document.getElementById("desktop-diff");

  if (desktopScore) desktopScore.textContent = gameState.score;
  if (desktopLevel) desktopLevel.textContent = gameState.level;
  if (desktopHighscore) desktopHighscore.textContent = gameState.highScore;
  updatePlayTimeDisplay(desktopTime);

  if (desktopDiff) {
    const diffNames = {
      facil: "Paseo (Fácil)",
      normal: "Trote (Normal)",
      dificil: "Carrera (Difícil)",
    };
    const diffLabel = diffNames[gameState.difficulty] || "Normal";
    const obsLabel = gameState.obstaclesEnabled ? " · Ladrillos 🧱" : " · Sin obstáculos";
    desktopDiff.textContent =
      gameState.gameMode === "versus" ? diffLabel : diffLabel + obsLabel;
  }

  updateLevelVisibility();
  updateActiveSkinPreview();
}

function shouldShowLevelStats() {
  return gameState.gameMode !== "solo" || gameState.obstaclesEnabled;
}

function updateLevelVisibility() {
  const showLevel = shouldShowLevelStats();
  const mobileLevelItem = levelVal?.closest(".hud-item");
  const desktopLevelCard = document.getElementById("desktop-level")?.closest(".desktop-stat-card");
  const finalLevelRow = document.getElementById("final-level")?.closest(".stat-row");

  if (mobileLevelItem) mobileLevelItem.style.display = showLevel ? "" : "none";
  if (desktopLevelCard) desktopLevelCard.style.display = showLevel ? "" : "none";
  if (finalLevelRow) finalLevelRow.style.display = showLevel ? "" : "none";
}

function getCurrentPlayTime() {
  if (gameState.isPlaying && !gameState.isGameOver && gameState.timeStarted) {
    return Math.max(0, Math.floor((Date.now() - gameState.timeStarted) / 1000));
  }
  return gameState.totalPlayTime || 0;
}

function formatPlayTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updatePlayTimeDisplay(target = document.getElementById("desktop-time")) {
  if (target) target.textContent = formatPlayTime(getCurrentPlayTime());
}

function saveHighScoreIfNeeded(score = gameState.score) {
  const bestSaved = parseInt(localStorage.getItem("salchicha_highscore"), 10) || 0;
  const bestScore = Math.max(bestSaved, gameState.highScore || 0);

  if (score > bestScore) {
    gameState.highScore = score;
    localStorage.setItem("salchicha_highscore", String(score));
    updateMenuBestScores();
    return true;
  }

  gameState.highScore = bestScore;
  return false;
}

const SKIN_DISPLAY_NAMES = {
  "salchicha marron": "Marrón 🤎",
  "salchicha negro": "Negro 🖤",
  "salchicha gris": "Gris 💙",
  "salchicha blancoy marron": "Blanco y Marrón 🤍",
};

function getSkinHeadImageSrc(skinId) {
  return `/img/${skinId}/cabeza abajo.png`;
}

function updateActiveSkinPreview() {
  const headImg = document.getElementById("active-skin-head");
  const headImgMobile = document.getElementById("active-skin-head-mobile");
  const label = document.getElementById("active-skin-display");
  const labelMobile = document.getElementById("active-skin-display-mobile");
  const mobileStrip = document.getElementById("mobile-active-strip");
  const versusHead1 = document.getElementById("versus-active-head-1");
  const versusHead2 = document.getElementById("versus-active-head-2");
  const versusName1 = document.getElementById("versus-active-name-1");
  const versusName2 = document.getElementById("versus-active-name-2");
  const skin = gameState.activeSkin || "salchicha marron";
  const name = SKIN_DISPLAY_NAMES[skin] || "Marrón 🤎";
  const isVersus = gameState.gameMode === "versus";

  if (label) label.textContent = name;
  if (labelMobile) labelMobile.textContent = name;
  if (mobileStrip) mobileStrip.style.display = isVersus ? "none" : "flex";

  const applyHead = (img) => {
    if (!img) return;
    img.alt = name;
    img.src = getSkinHeadImageSrc(skin);
    img.onerror = function onHeadFallback() {
      this.onerror = null;
      this.src = `/img/${skin}/cabeza.png`;
    };
  };

  applyHead(headImg);
  applyHead(headImgMobile);

  const applyVersusSkin = (img, labelEl, skinId, fallbackName) => {
    const displayName = SKIN_DISPLAY_NAMES[skinId] || fallbackName;
    if (labelEl) labelEl.textContent = displayName;
    if (!img) return;
    img.alt = displayName;
    img.src = getSkinHeadImageSrc(skinId);
    img.onerror = function onVersusHeadFallback() {
      this.onerror = null;
      this.src = `/img/${skinId}/cabeza derecha.png`;
    };
  };

  let versusController = null;
  try {
    versusController = typeof Versus1v1 !== "undefined" ? Versus1v1 : null;
  } catch (_) {
    versusController = null;
  }

  const versusSkin1 = versusController?.skins?.player1 || "salchicha marron";
  const versusSkin2 = versusController?.skins?.player2 || "salchicha negro";

  applyVersusSkin(versusHead1, versusName1, versusSkin1, "J1");
  applyVersusSkin(versusHead2, versusName2, versusSkin2, "J2");
}

// --- REFERENCIAS DEL DOM ---
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const gameoverOverlay = document.getElementById("gameover-overlay");
let gameCanvasEl = document.getElementById("game-canvas");
let ctx = setupHiDpiCanvas(gameCanvasEl);

function getGameCanvas() {
  gameCanvasEl = document.getElementById("game-canvas");
  return gameCanvasEl;
}

function refreshGameContext() {
  const c = getGameCanvas();
  if (c) ctx = setupHiDpiCanvas(c);
  return ctx;
}

/* --- Modales (reemplazo de alert / confirm) --- */
function showAppModal({ title, message, confirmText = "Aceptar", cancelText = null }) {
  return new Promise((resolve) => {
    const modal = document.getElementById("app-modal");
    const titleEl = document.getElementById("app-modal-title");
    const messageEl = document.getElementById("app-modal-message");
    const confirmBtn = document.getElementById("app-modal-confirm");
    const cancelBtn = document.getElementById("app-modal-cancel");

    if (!modal) {
      resolve(true);
      return;
    }

    titleEl.textContent = title || "";
    messageEl.innerHTML = message || "";
    confirmBtn.textContent = confirmText;

    if (cancelText) {
      cancelBtn.textContent = cancelText;
      cancelBtn.classList.remove("hidden");
    } else {
      cancelBtn.classList.add("hidden");
    }

    const close = (result) => {
      modal.classList.add("hidden");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      modal.querySelector(".app-modal-backdrop").onclick = null;
      resolve(result);
    };

    confirmBtn.onclick = () => close(true);
    cancelBtn.onclick = () => close(false);
    modal.querySelector(".app-modal-backdrop").onclick = () => close(false);

    modal.classList.remove("hidden");
  });
}

function updateMenuBestScores() {
  const solo = parseInt(localStorage.getItem("salchicha_highscore")) || 0;
  const soloEl = document.getElementById("menu-highscore-solo");
  const versusEl = document.getElementById("menu-highscore-versus");

  if (soloEl) soloEl.textContent = solo;

  try {
    const v = JSON.parse(localStorage.getItem("salchicha_versus_best") || "{}");
    if (versusEl) versusEl.textContent = `${v.player1 || 0} - ${v.player2 || 0}`;
  } catch {
    if (versusEl) versusEl.textContent = "0 - 0";
  }
}

const scoreVal = document.getElementById("score-val");
const levelVal = document.getElementById("level-val");
const highscoreVal = document.getElementById("highscore-val");

const pauseOverlay = document.getElementById("pause-overlay");
const alertBanner = document.getElementById("alert-banner");
const alertText = document.getElementById("alert-text");

const startBtn = document.getElementById("start-btn");
const resumeBtn = document.getElementById("resume-btn");
const pauseBtn = document.getElementById("pause-btn");
const gameSettingsBtn = document.getElementById("game-settings-btn");
const gameThemeBtn = document.getElementById("game-theme-btn");
const quitBtn = document.getElementById("quit-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");

function initTouchUi() {
  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) document.body.classList.add("has-touch");

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!document.body.classList.contains("game-active")) return;
      const t = e.target;
      if (t.closest?.(".virtual-joystick, .joystick-base, .canvas-container, .control-btn")) {
        e.preventDefault();
      }
    },
    { passive: false },
  );
}

// --- INICIALIZACIÓN Y CONFIGURACIÓN ---
window.addEventListener("load", () => {
  initTouchUi();
  setupSettingsModal();
  refreshGameContext();
  sound.startMusic();
  setupSkinCards();
  setupDifficultyButtons();
  setupBoardSizeButtons(); // Cargar manejador del tamaño del tablero
  setupObstaclesButtons();
  setupGameModeButtons(); // Cargar manejador del modo de juego
  syncObstaclesMenuUI();
  if (typeof Versus1v1 !== "undefined") Versus1v1.initMenu();
  setupInputListeners();
  setupTouchControls();
  setupScrollTopButton(); // Botón para volver arriba

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (Versus1v1?.playing) Versus1v1.onResize?.();
      else refreshGameContext();
    }, 120);
  });

  updatePreviewImages("salchicha marron");
  updateActiveSkinPreview();
  updateUIStats();
  updateMenuBestScores();
});

// Botón Volver Arriba
function setupScrollTopButton() {
  const btn = document.getElementById("scroll-top-btn");
  if (!btn) return;

  const syncVisibility = () => {
    const menuIsActive = document.getElementById("menu-screen")?.classList.contains("active");
    btn.classList.toggle("is-visible", Boolean(menuIsActive && window.scrollY > 220));
  };

  btn.addEventListener("click", () => {
    sound.playClick();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  window.addEventListener("scroll", syncVisibility, { passive: true });
  window.addEventListener("resize", syncVisibility);
  syncVisibility();
}

// Selector de Skins (Menú)
function setupSkinCards() {
  const cards = document.querySelectorAll(".skin-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      gameState.activeSkin = card.getAttribute("data-skin");

      sound.playClick();
      updatePreviewImages(gameState.activeSkin);
      updateActiveSkinPreview();
    });
  });
}

// Actualizar vista previa del perro salchicha
function updatePreviewImages(skin) {
  const previewHead = document.getElementById("preview-head");
  const previewBody1 = document.querySelector(".preview-body-1");
  const previewBody2 = document.querySelector(".preview-body-2");
  const previewTail = document.querySelector(".preview-tail");

  const basePath = `/img/${skin}`;
  previewHead.src = `${basePath}/cabeza abajo.png`;
  previewBody1.src = `${basePath}/cuerpo.png`;
  previewBody2.src = `${basePath}/cuerpo.png`;
  previewTail.src = `${basePath}/cola.png`;
}

// Selector de Dificultades (Menú)
function setupDifficultyButtons() {
  const diffLabels = document.querySelectorAll(".diff-btn");
  diffLabels.forEach((label) => {
    label.addEventListener("click", () => {
      diffLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
      const radio = label.querySelector("input");
      gameState.difficulty = radio.value;
      sound.playClick();
    });
  });
}

// Selector de Tamaños de Tablero (Menú)
function setupBoardSizeButtons() {
  const sizeLabels = document.querySelectorAll(".size-btn");
  sizeLabels.forEach((label) => {
    label.addEventListener("click", () => {
      sizeLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
      const radio = label.querySelector("input");
      gameState.boardSize = parseInt(radio.value);

      // Aplicar dinámicamente
      GRID_SIZE = gameState.boardSize;
      TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

      sound.playClick();
    });
  });
}

function syncObstaclesMenuUI() {
  const obstaclesSection = document.getElementById("obstacles-section");
  const soloSkinSection = document.getElementById("solo-skin-section");
  const versusSkinsSection = document.getElementById("versus-skins-section");

  if (obstaclesSection) {
    obstaclesSection.style.display =
      gameState.gameMode === "versus" ? "none" : "block";
  }
  if (soloSkinSection) {
    soloSkinSection.style.display =
      gameState.gameMode === "versus" ? "none" : "block";
  }
  if (versusSkinsSection) {
    versusSkinsSection.style.display =
      gameState.gameMode === "versus" ? "block" : "none";
  }

  document.querySelectorAll(".obstacle-btn").forEach((label) => {
    const radio = label.querySelector('input[name="obstacles"]');
    const isOn = radio.value === "on";
    label.classList.toggle("active", isOn === gameState.obstaclesEnabled);
    radio.checked = isOn === gameState.obstaclesEnabled;
  });
}

function setupObstaclesButtons() {
  const obstacleLabels = document.querySelectorAll(".obstacle-btn");

  obstacleLabels.forEach((label) => {
    label.addEventListener("click", () => {
      obstacleLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
      const radio = label.querySelector("input");
      gameState.obstaclesEnabled = radio.value === "on";
      localStorage.setItem(
        "salchicha_obstacles",
        gameState.obstaclesEnabled ? "true" : "false",
      );
      sound.playClick();
      updateUIStats();
    });
  });
}

// Selector de Modo de Juego (Menú)
function setupGameModeButtons() {
  const modeLabels = document.querySelectorAll(".mode-btn");

  modeLabels.forEach((label) => {
    label.addEventListener("click", () => {
      modeLabels.forEach((l) => l.classList.remove("active"));
      label.classList.add("active");
      const radio = label.querySelector("input");
      gameState.gameMode = radio.value;

      syncObstaclesMenuUI();
      updateGameScreenPanel();
      if (gameState.gameMode === "versus" && typeof Versus1v1 !== "undefined") {
        Versus1v1.refreshSliderLayout();
      }
      updateUIStats();
      updateMenuBestScores();
      sound.playClick();
    });
  });
}

// --- CONFIGURACIÓN DE ENTRADAS (TECLADO Y MÓVIL) ---
function setupInputListeners() {
  // Teclas de dirección
  window.addEventListener("keydown", (e) => {
    if (gameState.gameMode === "versus") {
      if (typeof Versus1v1 !== "undefined") Versus1v1.onKeyDown(e);
      return;
    }

    // Modo solo (original)
    if (!gameState.isPlaying || gameState.isGameOver) return;

    // Prevenir scrolling de barra espaciadora y flechas en pantalla
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    ) {
      e.preventDefault();
    }

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        if (gameState.direction !== "abajo") gameState.nextDirection = "arriba";
        break;
      case "ArrowDown":
      case "s":
      case "S":
        if (gameState.direction !== "arriba") gameState.nextDirection = "abajo";
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        if (gameState.direction !== "derecha")
          gameState.nextDirection = "izquierda";
        break;
      case "ArrowRight":
      case "d":
      case "D":
        if (gameState.direction !== "izquierda")
          gameState.nextDirection = "derecha";
        break;
      case " ": // Barra espaciadora
        togglePause();
        break;
    }
  });

  // Botones HUD / Control
  startBtn.addEventListener("click", () => beginGameWithCountdown());
  resumeBtn.addEventListener("click", togglePause);

  pauseBtn.addEventListener("click", () => {
    sound.playClick();
    togglePause();
  });

  gameSettingsBtn?.addEventListener("click", () => {
    sound.playClick();
    document.getElementById("settings-btn")?.click();
  });

  gameThemeBtn?.addEventListener("click", () => {
    if (window.themeContext) window.themeContext.toggleTheme();
    else document.getElementById("theme-toggle-btn")?.click();
    sound.playClick();
  });

  quitBtn.addEventListener("click", async () => {
    sound.playClick();
    const ok = await showAppModal({
      title: "¿Salir al menú?",
      message: "Se terminará la partida actual.",
      confirmText: "Sí, salir",
      cancelText: "Seguir jugando",
    });
    if (ok) quitToMenu();
  });

  restartBtn.addEventListener("click", () => {
    sound.playClick();
    hideGameOverModal();
    startGame();
  });

  menuBtn.addEventListener("click", () => {
    sound.playClick();
    quitToMenu();
  });
}

// Controles Táctiles (Swipe + D-pad)
function setupTouchControls() {
  let touchStartX = 0;
  let touchStartY = 0;

  const canvasContainer = document.querySelector(".canvas-container");
  if (!canvasContainer) return;

  canvasContainer.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.tagName !== "CANVAS") return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  canvasContainer.addEventListener(
    "touchend",
    (e) => {
      if (e.target.tagName !== "CANVAS") return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const threshold = 30;

      if (isVersusModeActive() && typeof Versus1v1 !== "undefined") {
        Versus1v1.onSwipe(dx, dy, threshold);
        return;
      }

      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver)
        return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > threshold) {
          if (dx > 0 && gameState.direction !== "izquierda") {
            gameState.nextDirection = "derecha";
          } else if (dx < 0 && gameState.direction !== "derecha") {
            gameState.nextDirection = "izquierda";
          }
        }
      } else if (Math.abs(dy) > threshold) {
        if (dy > 0 && gameState.direction !== "arriba") {
          gameState.nextDirection = "abajo";
        } else if (dy < 0 && gameState.direction !== "abajo") {
          gameState.nextDirection = "arriba";
        }
      }
    },
    { passive: true },
  );

  // D-pad virtual
  const dpadUp = document.getElementById("dpad-up");
  const dpadDown = document.getElementById("dpad-down");
  const dpadLeft = document.getElementById("dpad-left");
  const dpadRight = document.getElementById("dpad-right");

  // Asignar eventos tanto de click como touchstart para evitar delays táctiles de 300ms
  const addDpadListener = (el, dir, blockDir) => {
    const handler = (e) => {
      e.preventDefault();
      if (isVersusModeActive() && typeof Versus1v1 !== "undefined") {
        Versus1v1.onDpad(dir);
        return;
      }
      if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver)
        return;
      if (gameState.direction !== blockDir) {
        gameState.nextDirection = dir;
      }
    };
    el.addEventListener("click", handler);
    el.addEventListener("touchstart", handler, { passive: false });
  };

  addDpadListener(dpadUp, "arriba", "abajo");
  addDpadListener(dpadDown, "abajo", "arriba");
  addDpadListener(dpadLeft, "izquierda", "derecha");
  addDpadListener(dpadRight, "derecha", "izquierda");

  const joystickMax = 38;
  const joystickDeadzone = 14;
  const soloBlockedDirection = {
    arriba: "abajo",
    abajo: "arriba",
    izquierda: "derecha",
    derecha: "izquierda",
  };

  document.querySelectorAll(".virtual-joystick").forEach((joystick) => {
    const base = joystick.querySelector(".joystick-base");
    const stick = joystick.querySelector(".joystick-stick");
    const player = joystick.dataset.player;
    let activePointer = null;

    const resetJoystick = () => {
      activePointer = null;
      joystick.classList.remove("is-active");
      if (stick) stick.style.transform = "translate(-50%, -50%)";
    };

    const updateJoystick = (e) => {
      if (!base || !stick || activePointer !== e.pointerId) return;
      e.preventDefault();

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rawDx = e.clientX - centerX;
      const rawDy = e.clientY - centerY;
      const distance = Math.hypot(rawDx, rawDy);
      const scale = distance > joystickMax ? joystickMax / distance : 1;
      const dx = rawDx * scale;
      const dy = rawDy * scale;

      stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      if (distance < joystickDeadzone) return;

      const dir =
        Math.abs(rawDx) > Math.abs(rawDy)
          ? rawDx > 0
            ? "derecha"
            : "izquierda"
          : rawDy > 0
            ? "abajo"
            : "arriba";

      if (player === "solo") {
        if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
          return;
        }
        if (gameState.direction !== soloBlockedDirection[dir]) {
          gameState.nextDirection = dir;
        }
        return;
      }

      if (isVersusModeActive() && typeof Versus1v1 !== "undefined") {
        Versus1v1.onJoystick(Number(player), dir);
      }
    };

    base?.addEventListener("pointerdown", (e) => {
      if (activePointer !== null) return;
      activePointer = e.pointerId;
      joystick.classList.add("is-active");
      joystick.setPointerCapture?.(e.pointerId);
      updateJoystick(e);
    });

    joystick.addEventListener("pointermove", updateJoystick);
    joystick.addEventListener("pointerup", resetJoystick);
    joystick.addEventListener("pointercancel", resetJoystick);
    joystick.addEventListener("lostpointercapture", resetJoystick);
  });
}

// --- LÓGICA CORE DEL JUEGO ---

// Cambiar de pantallas
function showScreen(screenId) {
  hideGameOverModal();
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
  document.getElementById("scroll-top-btn")?.classList.remove("is-visible");

  const inGame = screenId === "game-screen";
  const inMenu = screenId === "menu-screen";
  document.body.classList.toggle("game-active", inGame);
  document.documentElement.classList.toggle("game-active", inGame);

  if (inGame) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    updateGameScreenPanel();
    sound.startMusic();
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.classList.remove("versus-mobile-controls");
    if (inMenu) sound.startMusic();
    else sound.stopMusic();
  }
}

function setupSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const openBtn = document.getElementById("settings-btn");
  const musicSlider = document.getElementById("music-volume-slider");
  const sfxSlider = document.getElementById("sfx-volume-slider");
  const musicVal = document.getElementById("music-volume-value");
  const sfxVal = document.getElementById("sfx-volume-value");
  const musicHint = document.getElementById("music-unavailable-hint");

  if (!modal || !openBtn) return;

  const pct = (v) => `${Math.round(v * 100)}%`;

  const syncSliders = () => {
    if (musicSlider) musicSlider.value = Math.round(sound.musicVolume * 100);
    if (sfxSlider) sfxSlider.value = Math.round(sound.sfxVolume * 100);
    if (musicVal) musicVal.textContent = pct(sound.musicVolume);
    if (sfxVal) sfxVal.textContent = pct(sound.sfxVolume);
    if (musicHint) {
      musicHint.classList.toggle("hidden", sound.musicFileOk);
    }
  };

  const openModal = () => {
    sound.init();
    syncSliders();
    modal.classList.remove("hidden");
    sound.playClick();
  };

  const closeModal = () => {
    modal.classList.add("hidden");
  };

  openBtn.addEventListener("click", openModal);
  document.getElementById("settings-done-btn")?.addEventListener("click", () => {
    sound.playClick();
    closeModal();
  });
  modal.querySelectorAll("[data-close-settings]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  musicSlider?.addEventListener("input", () => {
    const v = Number(musicSlider.value) / 100;
    sound.setMusicVolume(v);
    if (musicVal) musicVal.textContent = pct(v);
    if (v > 0 && !sound.muted) sound.startMusic();
    else sound.stopMusic();
  });

  sfxSlider?.addEventListener("input", () => {
    const v = Number(sfxSlider.value) / 100;
    sound.setSfxVolume(v);
    if (sfxVal) sfxVal.textContent = pct(v);
  });

  syncSliders();
}

function showGameOverModal() {
  if (gameoverOverlay) gameoverOverlay.classList.remove("hidden");
  gameScreen?.classList.add("game-over-active");
}

function hideGameOverModal() {
  if (gameoverOverlay) gameoverOverlay.classList.add("hidden");
  gameScreen?.classList.remove("game-over-active");
}

// Generar flores y hierbas procedimentales para el patio de flores
function generateGardenDecorations() {
  gameState.gardenDecorations = [];

  const flowerColors = [
    "#ff8a80",
    "#e040fb",
    "#29b6f6",
    "#ffb74d",
    "#ff5252",
    "#ea80fc",
  ];
  const flowerTypes = ["daisy", "tulip", "sunflower", "rose", "violet"];

  const totalDecorations = Math.floor(GRID_SIZE * GRID_SIZE * 0.15);

  for (let i = 0; i < totalDecorations; i++) {
    gameState.gardenDecorations.push({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
      type: flowerTypes[Math.floor(Math.random() * flowerTypes.length)],
      // Guardar offset de fase para la animación de respiración de cada flor
      phase: Math.random() * Math.PI * 2,
    });
  }
}

// Salir al menú principal
function quitToMenu() {
  gameState.isPlaying = false;
  gameState.isPaused = false;
  gameState.isGameOver = false;

  if (typeof Versus1v1 !== "undefined") Versus1v1.stop();

  hideGameOverModal();
  pauseOverlay.classList.remove("active");
  if (typeof resetVersusHudLabels === "function") resetVersusHudLabels();
  gameState.highScore = parseInt(localStorage.getItem("salchicha_highscore")) || 0;
  updateUIStats();
  updateMenuBestScores();
  showScreen("menu-screen");
}

// Generar Hueso (Comida)
function getCellKey(x, y) {
  return `${x},${y}`;
}

function isInsideGrid(x, y) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function buildOccupiedCells({ includeSnake = true, includeBone = false, includeBricks = true } = {}) {
  const occupied = new Set();

  if (includeSnake) {
    gameState.snake.forEach((segment) => {
      occupied.add(getCellKey(segment.x, segment.y));
    });
  }

  if (includeBricks) {
    gameState.bricks.forEach((brick) => {
      occupied.add(getCellKey(brick.x, brick.y));
    });
  }

  if (includeBone && gameState.bone) {
    occupied.add(getCellKey(gameState.bone.x, gameState.bone.y));
  }

  return occupied;
}

function findRandomFreeCell(occupiedCells, maxAttempts = GRID_SIZE * GRID_SIZE * 2) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (!occupiedCells.has(getCellKey(x, y))) return { x, y };
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupiedCells.has(getCellKey(x, y))) return { x, y };
    }
  }

  return null;
}

function spawnBone() {
  const occupiedCells = buildOccupiedCells({
    includeSnake: true,
    includeBone: false,
    includeBricks: true,
  });
  const freeCell = findRandomFreeCell(occupiedCells);

  if (freeCell) gameState.bone = freeCell;
}

// --- OBSTÁCULOS: ladrillos fijos que se acumulan al comer ---

function isBrickAt(x, y) {
  if (!isInsideGrid(x, y)) return false;
  return gameState.bricks.some((b) => b.x === x && b.y === y);
}

function getMaxBricks() {
  // ~25 % del tablero como tope para que siga siendo jugable
  return Math.max(8, Math.floor(GRID_SIZE * GRID_SIZE * 0.25));
}

function canPlaceBrick(x, y, minDistFromHead = 3) {
  if (!isInsideGrid(x, y)) return false;

  const occupiedCells = buildOccupiedCells({
    includeSnake: true,
    includeBone: true,
    includeBricks: true,
  });
  if (occupiedCells.has(getCellKey(x, y))) return false;

  const head = gameState.snake[0];
  if (!head) return true;
  const dist = Math.abs(head.x - x) + Math.abs(head.y - y);
  return dist >= minDistFromHead;
}

/** Añade un ladrillo fijo en celda aleatoria (los anteriores no se mueven). */
function addRandomBrick(minDistFromHead = 4) {
  if (!gameState.obstaclesEnabled) return false;
  if (gameState.bricks.length >= getMaxBricks()) return false;

  for (let attempt = 0; attempt < GRID_SIZE * GRID_SIZE * 2; attempt++) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (canPlaceBrick(x, y, minDistFromHead)) {
      gameState.bricks.push({ x, y });
      return true;
    }
  }

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (canPlaceBrick(x, y, minDistFromHead)) {
        gameState.bricks.push({ x, y });
        return true;
      }
    }
  }

  return false;
}

// Pausa
function togglePause() {
  if (gameState.gameMode === "versus") {
    if (typeof Versus1v1 !== "undefined") Versus1v1.togglePause();
    return;
  }

  if (!gameState.isPlaying || gameState.isGameOver) return;

  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    gameState.totalPlayTime = getCurrentPlayTime();
    pauseOverlay.classList.add("active");
  } else {
    pauseOverlay.classList.remove("active");
    gameState.timeStarted = Date.now() - gameState.totalPlayTime * 1000;
    gameState.lastTickTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
  updateUIStats();
}

// Game Over
function handleGameOver(reason) {
  gameState.isPlaying = false;
  gameState.isGameOver = true;

  gameState.totalPlayTime = Math.floor(
    (Date.now() - gameState.timeStarted) / 1000,
  );
  sound.playGameOver();

  // Guardar puntuación máxima
  const isNewRecord =
    gameState.newRecordDuringGame || saveHighScoreIfNeeded(gameState.score);

  // Guardar historial de partidas del modo solo en localStorage
  let soloHistory = JSON.parse(
    localStorage.getItem("salchicha_solo_history") || "[]",
  );
  soloHistory.push({
    date: new Date().toISOString(),
    score: gameState.score,
    level: gameState.level,
    skin: gameState.activeSkin,
    playTime: gameState.totalPlayTime,
    deathReason: reason,
  });
  localStorage.setItem("salchicha_solo_history", JSON.stringify(soloHistory));

  // Actualizar datos de pantalla de muerte
  document.getElementById("final-score").textContent = gameState.score;
  document.getElementById("final-level").textContent = gameState.level;
  document.getElementById("final-bones").textContent = gameState.score;

  const reasonText = document.getElementById("death-reason");
  if (reason === "pared") {
    reasonText.textContent =
      "¡Oh no! El perrito se estrelló contra la pared 🧱";
  } else if (reason === "ladrillo") {
    reasonText.textContent = "¡Ay! Chocaste contra un bloque de ladrillos 🧱";
  } else if (reason === "cuerpo") {
    reasonText.textContent = "¡Uf! ¡El perrito se mordió su propia cola! 🐕";
  }

  const recordBadge = document.getElementById("new-record-badge");
  if (isNewRecord) {
    recordBadge.classList.remove("hidden");
  } else {
    recordBadge.classList.add("hidden");
  }

  updateMenuBestScores();
  updateUIStats();

  setTimeout(() => {
    showGameOverModal();
  }, 800);
}

// --- CUENTA REGRESIVA E INICIO DE PARTIDA ---
let countdownRunning = false;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function beginGameWithCountdown() {
  if (countdownRunning || gameState.isPlaying) return;
  syncMenuSettingsFromDOM();
  if (gameState.gameMode === "versus") {
    await startGame();
    return;
  }

  const overlay = document.getElementById("countdown-overlay");
  const numEl = document.getElementById("countdown-number");
  if (!overlay || !numEl) {
    await startGame();
    return;
  }

  countdownRunning = true;
  if (startBtn) startBtn.disabled = true;
  sound.playClick();

  overlay.classList.remove("hidden");
  const steps = ["3", "2", "1", "¡Ya!"];

  for (const step of steps) {
    numEl.textContent = step;
    numEl.classList.remove("countdown-pop");
    void numEl.offsetWidth;
    numEl.classList.add("countdown-pop");
    await delay(step === "¡Ya!" ? 550 : 1000);
  }

  overlay.classList.add("hidden");
  if (startBtn) startBtn.disabled = false;
  countdownRunning = false;
  await startGame();
}

// --- INICIO DE PARTIDA ---
async function startGame() {
  hideGameOverModal();
  syncMenuSettingsFromDOM();
  gameState.isPlaying = false;
  gameState.isPaused = false;
  gameState.isGameOver = false;

  GRID_SIZE = gameState.boardSize;
  TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

  if (gameState.gameMode === "versus") {
    if (typeof Versus1v1 !== "undefined") await Versus1v1.start();
    return;
  }

  updateGameScreenPanel();

  refreshGameContext();

  // Cargar assets de la skin seleccionada (modo solo)
  await assets.loadSkin(gameState.activeSkin);

  // Resetear estado
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);

  gameState.snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
  gameState.previousSnake = cloneSnakeSegments(gameState.snake);
  gameState.direction = "derecha";
  gameState.nextDirection = "derecha";
  gameState.score = 0;
  gameState.level = 1;
  gameState.highScore = parseInt(localStorage.getItem("salchicha_highscore"), 10) || 0;
  gameState.newRecordDuringGame = false;
  gameState.bricks = [];
  gameState.totalPlayTime = 0;
  gameState.isPlaying = true;
  gameState.isPaused = false;
  gameState.isGameOver = false;
  gameState.timeStarted = Date.now();

  // Velocidad base según dificultad
  const diffSpeeds = { facil: 180, normal: 135, dificil: 90 };
  gameState.speed = diffSpeeds[gameState.difficulty] || 135;

  // Decoraciones, muros fijos (si hay obstáculos) y primer hueso
  generateGardenDecorations();
  if (gameState.obstaclesEnabled) addRandomBrick(4);
  spawnBone();
  updateUIStats();

  showScreen("game-screen");
  pauseOverlay.classList.remove("active");

  gameState.lastTickTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// --- CICLO DE JUEGO PRINCIPAL ---
function gameLoop(time) {
  if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver)
    return;

  const delta = time - gameState.lastTickTime;

  if (delta >= gameState.speed) {
    tick();
    gameState.lastTickTime = time;
  }

  draw();
  updatePlayTimeDisplay();
  requestAnimationFrame(gameLoop);
}

// Actualizar datos del juego en cada tick (Movimiento y Colisiones)
function tick() {
  gameState.previousSnake = cloneSnakeSegments(gameState.snake);
  gameState.direction = gameState.nextDirection;

  // Calcular la nueva posición de la cabeza
  const head = { ...gameState.snake[0] };

  switch (gameState.direction) {
    case "arriba":
      head.y -= 1;
      break;
    case "abajo":
      head.y += 1;
      break;
    case "izquierda":
      head.x -= 1;
      break;
    case "derecha":
      head.x += 1;
      break;
  }

  // 1. Colisión con Paredes
  if (!isInsideGrid(head.x, head.y)) {
    handleGameOver("pared");
    return;
  }

  // 2. Colisión con Ladrillos (Obstáculos)
  if (gameState.obstaclesEnabled && isBrickAt(head.x, head.y)) {
    handleGameOver("ladrillo");
    return;
  }

  // 3. Colisión con propio cuerpo
  // Si el perro salchicha come, el último segmento se conserva; validamos contra todo el cuerpo.
  // Si no comió, el último segmento se moverá, por lo que no choca con él.
  const eaten = head.x === gameState.bone.x && head.y === gameState.bone.y;
  const bodyLimit = eaten ? gameState.snake.length : gameState.snake.length - 1;

  for (let i = 0; i < bodyLimit; i++) {
    if (gameState.snake[i].x === head.x && gameState.snake[i].y === head.y) {
      handleGameOver("cuerpo");
      return;
    }
  }

  // Mover al perro salchicha
  gameState.snake.unshift(head); // Nueva cabeza

  if (eaten) {
    // ¡Comió un hueso!
    gameState.score += 1;
    if (saveHighScoreIfNeeded(gameState.score)) {
      gameState.newRecordDuringGame = true;
    }
    sound.playEat();

    // Animación visual de Pop al Score
    if (scoreVal) {
      scoreVal.classList.remove("animate-pop");
      void scoreVal.offsetWidth; // Reflow para reiniciar animación CSS
      scoreVal.classList.add("animate-pop");
    }

    // Comprobar Nivel Subido (Cada 5 puntos)
    const newLevel = Math.floor(gameState.score / 5) + 1;
    if (newLevel > gameState.level) {
      gameState.level = newLevel;

      // Incrementar velocidad del juego (mínimo de 65ms)
      const baseDiffSpeed =
        gameState.difficulty === "facil"
          ? 180
          : gameState.difficulty === "dificil"
            ? 90
            : 135;
      gameState.speed = Math.max(65, baseDiffSpeed - (gameState.level - 1) * 8);

      if (shouldShowLevelStats()) {
        sound.playLevelUp();
        triggerLevelAlert();
      }
    }

    // Nuevo ladrillo fijo al comer (se acumulan en el patio)
    addRandomBrick(3);

    // Actualizar todos los contadores en pantalla tras comer
    updateUIStats();
    spawnBone();
  } else {
    // No comió, remover el último segmento (la cola avanza)
    gameState.snake.pop();
  }
}

// Alerta visual de nivel subido
function triggerLevelAlert() {
  alertText.textContent = `¡Nivel ${gameState.level}! 🌸`;
  alertBanner.classList.add("active");

  setTimeout(() => {
    alertBanner.classList.remove("active");
  }, 2200);
}

// --- DIBUJADO DE GRÁFICOS ---
function draw() {
  drawGardenBackground(ctx);
  drawGardenFlowers();

  // 1. Dibujar Ladrillos (Obstáculos)
  if (gameState.obstaclesEnabled && gameState.bricks.length > 0) {
    const brickSize = TILE_SIZE * BRICK_DRAW_SCALE;
    const brickOffset = (brickSize - TILE_SIZE) / 2;
    gameState.bricks.forEach((brick) => {
      drawSprite(
        ctx,
        assets.images["ladrillo"],
        brick.x * TILE_SIZE - brickOffset,
        brick.y * TILE_SIZE - brickOffset,
        brickSize,
        brickSize,
      );
    });
  }

  // 2. Dibujar Hueso (Comida) con animación de respiración/escala
  drawBoneSprite(ctx, gameState.bone, assets.images["hueso"]);

  // 3. Dibujar al Perro Salchicha
  drawSnake();
}

// Dibujar flores decorativas en el patio usando gardenDecorations generadas al inicio
function drawGardenFlowers(options = {}) {
  const time = Date.now();
  const blockingSnakes = options.snakes || [gameState.snake];
  const bone = options.bone || gameState.bone;
  const bricks = options.bricks || gameState.bricks;

  // Posiciones fijas en las esquinas y bordes para decoración permanente
  const fixedPositions = [
    { x: 2, y: 2 },
    { x: GRID_SIZE - 3, y: 2 },
    { x: 2, y: GRID_SIZE - 3 },
    { x: GRID_SIZE - 3, y: GRID_SIZE - 3 },
    { x: Math.floor(GRID_SIZE / 2), y: 2 },
    { x: Math.floor(GRID_SIZE / 2), y: GRID_SIZE - 3 },
    { x: 2, y: Math.floor(GRID_SIZE / 2) },
    { x: GRID_SIZE - 3, y: Math.floor(GRID_SIZE / 2) },
    { x: 5, y: 5 },
    { x: GRID_SIZE - 6, y: 5 },
    { x: 5, y: GRID_SIZE - 6 },
    { x: GRID_SIZE - 6, y: GRID_SIZE - 6 },
  ];

  const flowerColors = [
    "#ff8a80",
    "#e040fb",
    "#29b6f6",
    "#ffb74d",
    "#ff5252",
    "#fff176",
  ];

  const isBlocked = (pos) => {
    const isOnSnake = blockingSnakes.some((snake) =>
      snake?.some((s) => Math.round(s.x) === pos.x && Math.round(s.y) === pos.y),
    );
    const isOnBone = bone?.x === pos.x && bone?.y === pos.y;
    const isOnBrick = bricks?.some((b) => b.x === pos.x && b.y === pos.y);
    return isOnSnake || isOnBone || isOnBrick;
  };

  const drawFlowerAt = (pos, idx, sizeFactor = 1) => {
    if (isBlocked(pos)) return;

    const cx = pos.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = pos.y * TILE_SIZE + TILE_SIZE / 2;
    const color = pos.color || flowerColors[idx % flowerColors.length];
    const flowerScale = 1 + 0.1 * Math.sin(time / 500 + (pos.phase || idx));
    const petalRadius = (TILE_SIZE / 3) * flowerScale * sizeFactor;

    ctx.save();
    ctx.globalAlpha = pos.soft ? 0.38 : 0.78;
    ctx.shadowColor = "rgba(255, 255, 255, 0.22)";
    ctx.shadowBlur = TILE_SIZE * 0.08;

    for (let p = 0; p < 5; p++) {
      const angle = (p * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = cx + Math.cos(angle) * (petalRadius * 0.6);
      const py = cy + Math.sin(angle) * (petalRadius * 0.6);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, petalRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#fff176";
    ctx.beginPath();
    ctx.arc(cx, cy, petalRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  gameState.gardenDecorations.forEach((pos, idx) => {
    if (idx % 2 === 0) drawFlowerAt({ ...pos, soft: true }, idx, 0.42);
  });

  fixedPositions.forEach((pos, idx) => {
    drawFlowerAt(pos, idx, 0.72);
  });
  return;

  fixedPositions.forEach((pos, idx) => {
    // No dibujar flores donde está la serpiente, hueso o ladrillos
    const isOnSnake = gameState.snake.some(
      (s) => s.x === pos.x && s.y === pos.y,
    );
    const isOnBone = gameState.bone.x === pos.x && gameState.bone.y === pos.y;
    const isOnBrick = gameState.bricks.some(
      (b) => b.x === pos.x && b.y === pos.y,
    );

    if (!isOnSnake && !isOnBone && !isOnBrick) {
      const cx = pos.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = pos.y * TILE_SIZE + TILE_SIZE / 2;
      const color = flowerColors[idx % flowerColors.length];

      // Pequeño movimiento de respiración para las flores
      const flowerScale = 1 + 0.1 * Math.sin(time / 500 + idx);
      const petalRadius = (TILE_SIZE / 3) * flowerScale;

      // Dibujar pétalos
      for (let p = 0; p < 5; p++) {
        const angle = (p * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * (petalRadius * 0.6);
        const py = cy + Math.sin(angle) * (petalRadius * 0.6);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, petalRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Centro de la flor (amarillo)
      ctx.fillStyle = "#ffeb3b";
      ctx.beginPath();
      ctx.arc(cx, cy, petalRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawSnake() {
  const progress =
    gameState.isPlaying && !gameState.isPaused && gameState.speed
      ? (performance.now() - gameState.lastTickTime) / gameState.speed
      : 1;
  drawSnakeFromLoader(
    ctx,
    {
      snake: gameState.snake,
      previousSnake: gameState.previousSnake,
      direction: gameState.direction,
    },
    assets,
    { progress },
  );
}

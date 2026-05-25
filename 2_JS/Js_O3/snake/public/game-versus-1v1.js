/* ==========================================================================
   MODO 1 VS 1 - Jugador 1: WASD | Jugador 2: Flechas
   ========================================================================== */

const VERSUS_SKINS = [
  { id: "salchicha marron", label: "Marrón 🤎" },
  { id: "salchicha negro", label: "Negro 🖤" },
  { id: "salchicha gris", label: "Gris 💙" },
  { id: "salchicha blancoy marron", label: "Blanco/Marrón 🤍" },
];

const versusSkinCache = {};

function getSkinHeadPreviewUrl(skinId) {
  return `/img/${skinId}/cabeza abajo.png`;
}

function getSkinHeadFallbackUrl(skinId) {
  return `/img/${skinId}/cabeza derecha.png`;
}

async function loadVersusSkinImages(skinId) {
  if (versusSkinCache[skinId]) return versusSkinCache[skinId];
  const loader = new AssetLoader();
  await loader.loadSkin(skinId);
  versusSkinCache[skinId] = loader.images;
  return loader.images;
}

const Versus1v1 = {
  playing: false,
  paused: false,
  gameOver: false,
  rafId: null,
  speed: 140,
  lastTick: 0,
  graceUntil: 0,
  bone: { x: 0, y: 0 },

  skins: { player1: "salchicha marron", player2: "salchicha negro" },
  sliderIndex: { player1: 0, player2: 1 },

  imagesP1: null,
  imagesP2: null,

  player1: null,
  player2: null,

  isRunning() {
    const inGrace = this.graceUntil > 0 && performance.now() < this.graceUntil;
    return this.playing && !this.gameOver && !inGrace;
  },

  initMenu() {
    this.buildSkinSliders();
    this.bindSkinSliders();
  },

  buildSkinSliders() {
    [1, 2].forEach((playerNum) => {
      const track = document.getElementById(`versus-track-${playerNum}`);
      if (!track) return;
      track.innerHTML = "";

      VERSUS_SKINS.forEach((skin, index) => {
        const slide = document.createElement("div");
        slide.className = "versus-slide";
        slide.dataset.index = String(index);
        const img = document.createElement("img");
        img.src = getSkinHeadPreviewUrl(skin.id);
        img.alt = skin.label;
        img.draggable = false;
        img.onerror = function () {
          this.onerror = null;
          this.src = getSkinHeadFallbackUrl(skin.id);
        };
        slide.appendChild(img);
        track.appendChild(slide);
      });
    });

    this.setSliderIndex(1, this.sliderIndex.player1, false);
    this.setSliderIndex(2, this.sliderIndex.player2, false);
  },

  bindSkinSliders() {
    document.querySelectorAll(".versus-slider").forEach((slider) => {
      const player = slider.dataset.player;
      const playerNum = player === "player1" ? 1 : 2;

      slider.querySelector(".versus-prev")?.addEventListener("click", () => {
        const key = player;
        const next =
          (this.sliderIndex[key] - 1 + VERSUS_SKINS.length) % VERSUS_SKINS.length;
        this.setSliderIndex(playerNum, next);
        sound.playClick();
      });

      slider.querySelector(".versus-next")?.addEventListener("click", () => {
        const key = player;
        const next = (this.sliderIndex[key] + 1) % VERSUS_SKINS.length;
        this.setSliderIndex(playerNum, next);
        sound.playClick();
      });
    });
  },

  setSliderIndex(playerNum, index, animate = true) {
    const key = playerNum === 1 ? "player1" : "player2";
    this.sliderIndex[key] = index;
    const skin = VERSUS_SKINS[index];
    this.skins[key] = skin.id;

    const track = document.getElementById(`versus-track-${playerNum}`);
    const label = document.getElementById(`versus-label-${playerNum}`);
    if (!track) return;

    if (label) label.textContent = skin.label;
    if (typeof updateActiveSkinPreview === "function") updateActiveSkinPreview();

    track.querySelectorAll(".versus-slide").forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });

    const applyOffset = () => {
      const viewport = track.parentElement;
      const slideWidth = viewport?.clientWidth || 140;
      track.style.transition = animate
        ? "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)"
        : "none";
      track.style.transform = `translateX(${-index * slideWidth}px)`;
    };

    applyOffset();
    requestAnimationFrame(applyOffset);
  },

  refreshSliderLayout() {
    this.setSliderIndex(1, this.sliderIndex.player1, false);
    this.setSliderIndex(2, this.sliderIndex.player2, false);
  },

  createPlayer(headX, headY, direction, skin) {
    const behind = {
      derecha: { x: -1, y: 0 },
      izquierda: { x: 1, y: 0 },
      arriba: { x: 0, y: 1 },
      abajo: { x: 0, y: -1 },
    }[direction];

    const snake = [{ x: headX, y: headY }];
    for (let i = 1; i < 3; i++) {
      snake.push({
        x: headX + behind.x * i,
        y: headY + behind.y * i,
      });
    }

    return {
      snake,
      previousSnake: cloneSnakeSegments(snake),
      direction,
      nextDirection: direction,
      skin,
      score: 0,
      alive: true,
    };
  },

  /** Spawn en esquinas opuestas, sin ir uno hacia el otro en la misma fila */
  setupVersusSpawn() {
    const g = GRID_SIZE;
    const mid = Math.floor(g / 2);
    const inset = 3;

    // J1: lado izquierdo, sube por el borde
    this.player1 = this.createPlayer(
      inset,
      Math.min(g - 4, mid + 2),
      "arriba",
      this.skins.player1,
    );

    // J2: lado derecho, baja por el borde
    this.player2 = this.createPlayer(
      g - 1 - inset,
      Math.max(3, mid - 2),
      "abajo",
      this.skins.player2,
    );
  },

  async start() {
    this.stop();
    syncMenuSettingsFromDOM();

    GRID_SIZE = gameState.boardSize;
    TILE_SIZE = CANVAS_SIZE / GRID_SIZE;

    this.skins.player1 = VERSUS_SKINS[this.sliderIndex.player1].id;
    this.skins.player2 = VERSUS_SKINS[this.sliderIndex.player2].id;

    this.setupVersusSpawn();
    generateGardenDecorations();

    showScreen("game-screen");
    updateGameScreenPanel();
    document.getElementById("pause-overlay")?.classList.remove("active");

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const c = refreshGameContext();
    if (!c) {
      await showAppModal({
        title: "Error",
        message: "No se encontró el tablero de juego.",
        confirmText: "Entendido",
      });
      return;
    }

    try {
      this.imagesP1 = await loadVersusSkinImages(this.skins.player1);
      this.imagesP2 = await loadVersusSkinImages(this.skins.player2);

      this.playing = true;
      this.paused = false;
      this.gameOver = false;
      this.graceUntil = 0;
      this.lastTick = performance.now();

      this.spawnBone();
      this.updateHud();
      this.draw();
      this.loop();
    } catch (err) {
      console.error("Versus 1v1:", err);
      this.playing = false;
      await showAppModal({
        title: "No se pudo iniciar el 1 vs 1",
        message:
          "Revisa que el servidor esté activo (<code>npm start</code>) y recarga la página.",
        confirmText: "Entendido",
      });
      showScreen("menu-screen");
    }
  },

  onResize() {
    if (!this.playing) return;
    refreshGameContext();
    this.draw();
  },

  stop() {
    this.playing = false;
    this.paused = false;
    this.gameOver = false;
    this.graceUntil = 0;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  loop() {
    if (!this.playing) {
      this.rafId = null;
      return;
    }

    const now = performance.now();
    const inGrace = this.graceUntil > 0 && now < this.graceUntil;

    if (
      !this.paused &&
      !this.gameOver &&
      !inGrace &&
      now - this.lastTick >= this.speed
    ) {
      this.tick();
      this.lastTick = now;
    }

    this.draw(inGrace ? now : 0);
    this.rafId = requestAnimationFrame(() => this.loop());
  },

  spawnBone() {
    for (let attempt = 0; attempt < 500; attempt++) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const blocked = [...this.player1.snake, ...this.player2.snake].some(
        (s) => s.x === x && s.y === y,
      );
      if (!blocked) {
        this.bone = { x, y };
        return;
      }
    }
    this.bone = { x: 0, y: 0 };
  },

  moveHead(head, direction) {
    const h = { ...head };
    if (direction === "arriba") h.y--;
    else if (direction === "abajo") h.y++;
    else if (direction === "izquierda") h.x--;
    else h.x++;
    return h;
  },

  tick() {
    this.player1.previousSnake = cloneSnakeSegments(this.player1.snake);
    this.player2.previousSnake = cloneSnakeSegments(this.player2.snake);

    this.player1.direction = this.player1.nextDirection;
    this.player2.direction = this.player2.nextDirection;

    const head1 = this.moveHead(this.player1.snake[0], this.player1.direction);
    const head2 = this.moveHead(this.player2.snake[0], this.player2.direction);

    if (head1.x === head2.x && head1.y === head2.y) {
      this.endGame("empate");
      return;
    }

    const crash1 =
      head1.x < 0 ||
      head1.x >= GRID_SIZE ||
      head1.y < 0 ||
      head1.y >= GRID_SIZE ||
      this.player1.snake.some((s, i) => i > 0 && s.x === head1.x && s.y === head1.y) ||
      this.player2.snake.some((s) => s.x === head1.x && s.y === head1.y);

    const crash2 =
      head2.x < 0 ||
      head2.x >= GRID_SIZE ||
      head2.y < 0 ||
      head2.y >= GRID_SIZE ||
      this.player2.snake.some((s, i) => i > 0 && s.x === head2.x && s.y === head2.y) ||
      this.player1.snake.some((s) => s.x === head2.x && s.y === head2.y);

    if (crash1) this.player1.alive = false;
    if (crash2) this.player2.alive = false;

    if (!this.player1.alive && !this.player2.alive) {
      this.endGame("empate");
      return;
    }
    if (!this.player1.alive) {
      this.endGame("player2");
      return;
    }
    if (!this.player2.alive) {
      this.endGame("player1");
      return;
    }

    this.player1.snake.unshift(head1);
    this.player2.snake.unshift(head2);

    const ate1 = head1.x === this.bone.x && head1.y === this.bone.y;
    const ate2 = head2.x === this.bone.x && head2.y === this.bone.y;

    if (ate1) {
      this.player1.score++;
      sound.playEat();
      this.spawnBone();
    } else {
      this.player1.snake.pop();
    }

    if (ate2) {
      this.player2.score++;
      sound.playEat();
      if (!ate1) this.spawnBone();
    } else {
      this.player2.snake.pop();
    }

    this.updateHud();
  },

  draw(graceNow = 0) {
    const drawCtx = refreshGameContext();
    if (!drawCtx) return;

    drawGardenBackground(drawCtx);
    drawGardenFlowers({
      snakes: [this.player1.snake, this.player2.snake],
      bone: this.bone,
      bricks: [],
    });

    const boneImg = this.imagesP1?.hueso || this.imagesP2?.hueso;
    drawBoneSprite(drawCtx, this.bone, boneImg);

    const progress =
      this.playing && !this.paused && !this.gameOver
        ? (performance.now() - this.lastTick) / this.speed
        : 1;

    drawSnakeFromLoader(drawCtx, this.player1, { images: this.imagesP1 }, { progress });
    drawSnakeFromLoader(drawCtx, this.player2, { images: this.imagesP2 }, { progress });

    if (graceNow > 0 && this.graceUntil > graceNow) {
      const secs = Math.ceil((this.graceUntil - graceNow) / 1000);
      drawCtx.save();
      drawCtx.fillStyle = "rgba(20, 50, 24, 0.55)";
      drawCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawCtx.font = "700 42px Fredoka, Outfit, sans-serif";
      drawCtx.textAlign = "center";
      drawCtx.textBaseline = "middle";
      drawCtx.fillStyle = "#fff9c4";
      drawCtx.shadowColor = "rgba(255, 213, 79, 0.8)";
      drawCtx.shadowBlur = 16;
      drawCtx.fillText(
        secs > 0 ? `¡Preparados! ${secs}` : "¡Ya!",
        CANVAS_SIZE / 2,
        CANVAS_SIZE / 2 - 12,
      );
      drawCtx.font = "600 18px Outfit, sans-serif";
      drawCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
      drawCtx.shadowBlur = 0;
      drawCtx.fillText("WASD · Flechas", CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 28);
      drawCtx.restore();
    }
  },

  updateHud() {
    const scoreText = `${this.player1.score} - ${this.player2.score}`;
    const best = this.loadBest();

    const scoreVal = document.getElementById("score-val");
    const levelVal = document.getElementById("level-val");
    const desktopScore = document.getElementById("desktop-score");
    const desktopLevel = document.getElementById("desktop-level");
    const desktopHighscore = document.getElementById("desktop-highscore");

    if (scoreVal) scoreVal.textContent = scoreText;
    if (levelVal) levelVal.textContent = "1 VS 1";
    if (desktopScore) desktopScore.textContent = scoreText;
    if (desktopLevel) desktopLevel.textContent = "1 VS 1";
    if (desktopHighscore) desktopHighscore.textContent = `${best.p1} - ${best.p2}`;

    const scoreLabel = document.querySelector(".hud-item .hud-label");
    const levelLabel = document.querySelectorAll(".hud-item .hud-label")[1];
    if (scoreLabel) scoreLabel.textContent = "MARCADOR";
    if (levelLabel) levelLabel.textContent = "MODO";
  },

  loadBest() {
    try {
      const raw = localStorage.getItem("salchicha_versus_best");
      if (raw) {
        const b = JSON.parse(raw);
        return { p1: b.player1 || 0, p2: b.player2 || 0 };
      }
    } catch {
      /* ignore */
    }
    return { p1: 0, p2: 0 };
  },

  saveBest() {
    const best = this.loadBest();
    localStorage.setItem(
      "salchicha_versus_best",
      JSON.stringify({
        player1: Math.max(best.p1, this.player1.score),
        player2: Math.max(best.p2, this.player2.score),
      }),
    );
    updateMenuBestScores();
  },

  endGame(winner) {
    this.playing = false;
    this.gameOver = true;
    this.saveBest();
    sound.playGameOver();

    const best = this.loadBest();
    setTimeout(() => {
      document.getElementById("final-score").textContent =
        `${this.player1.score} - ${this.player2.score}`;
      document.getElementById("final-level").textContent = "1 VS 1";

      const deathReason = document.getElementById("death-reason");
      if (deathReason) {
        if (winner === "empate") {
          deathReason.innerHTML = `¡Empate! 🤝<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
        } else if (winner === "player1") {
          deathReason.innerHTML = `¡Jugador 1 (WASD) gana! 🎉<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
        } else {
          deathReason.innerHTML = `¡Jugador 2 (Flechas) gana! 🎉<br><small>Mejor marcador: ${best.p1} - ${best.p2}</small>`;
        }
      }

      showGameOverModal();
    }, 700);
  },

  togglePause() {
    if (!this.playing || this.gameOver) return;
    this.paused = !this.paused;
    const pauseOverlay = document.getElementById("pause-overlay");
    if (this.paused) pauseOverlay?.classList.add("active");
    else {
      pauseOverlay?.classList.remove("active");
      this.lastTick = performance.now();
    }
  },

  setDirection(player, dir) {
    const p = player === 1 ? this.player1 : this.player2;
    if (!p || !this.playing || this.paused || this.gameOver) return;
    const opposite = {
      arriba: "abajo",
      abajo: "arriba",
      izquierda: "derecha",
      derecha: "izquierda",
    };
    if (p.direction !== opposite[dir]) p.nextDirection = dir;
  },

  onKeyDown(e) {
    const keys = [
      "w", "W", "a", "A", "s", "S", "d", "D",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ",
    ];
    if (keys.includes(e.key)) e.preventDefault();
    if (!this.playing || this.gameOver || this.paused) return;

    const inGrace = this.graceUntil > 0 && performance.now() < this.graceUntil;
    if (e.key === " " && inGrace) return;

    switch (e.key) {
      case "w":
      case "W":
        this.setDirection(1, "arriba");
        break;
      case "s":
      case "S":
        this.setDirection(1, "abajo");
        break;
      case "a":
      case "A":
        this.setDirection(1, "izquierda");
        break;
      case "d":
      case "D":
        this.setDirection(1, "derecha");
        break;
      case "ArrowUp":
        this.setDirection(2, "arriba");
        break;
      case "ArrowDown":
        this.setDirection(2, "abajo");
        break;
      case "ArrowLeft":
        this.setDirection(2, "izquierda");
        break;
      case "ArrowRight":
        this.setDirection(2, "derecha");
        break;
      case " ":
        if (!inGrace) this.togglePause();
        break;
    }
  },

  onSwipe(dx, dy, threshold) {
    if (!this.isRunning() || this.paused) return;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      this.setDirection(1, dx > 0 ? "derecha" : "izquierda");
    } else if (Math.abs(dy) > threshold) {
      this.setDirection(1, dy > 0 ? "abajo" : "arriba");
    }
  },

  onDpad(dir) {
    if (!this.isRunning() || this.paused) return;
    this.setDirection(1, dir);
  },

  onJoystick(player, dir) {
    if (!this.isRunning() || this.paused) return;
    this.setDirection(player, dir);
  },
};

function updateVersusHudLabels() {
  Versus1v1.updateHud();
}

function resetVersusHudLabels() {
  const scoreLabel = document.querySelector(".hud-item .hud-label");
  const levelLabel = document.querySelectorAll(".hud-item .hud-label")[1];
  if (scoreLabel) scoreLabel.textContent = "HUESOS";
  if (levelLabel) levelLabel.textContent = "NIVEL";
}

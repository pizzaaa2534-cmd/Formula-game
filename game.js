const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");

const levelElement = document.getElementById("level");
const scoreElement = document.getElementById("score");
const capitalElement = document.getElementById("capital");
const objectivesList = document.getElementById("objectivesList");
const logElement = document.getElementById("log");

const laneCount = 3;
const laneWidth = canvas.width / laneCount;
const laneCenters = Array.from({ length: laneCount }, (_, index) => index * laneWidth + laneWidth / 2);

const levels = [
  {
    id: "mayo",
    name: "Level 1: Foundation Dash",
    description: "Mayo College experiences unlocked",
    accent: "#00d1b2",
    baseSpeed: 220,
    achievements: [
      {
        id: "academics",
        title: "Commerce Fundamentals Skill",
        detail: "Banked Commerce, Accounting, Economics & Maths mastery.",
        score: 120,
        color: "#ffd700",
      },
      {
        id: "leadership",
        title: "Leadership Sprint Skill",
        detail: "Orchestrated 20+ finance events as Society President.",
        score: 140,
        color: "#f7a21b",
      },
      {
        id: "impact",
        title: "Community Builder Skill",
        detail: "Scaled rural women’s employment with Prayas initiatives.",
        score: 160,
        color: "#ffcf5c",
      },
      {
        id: "resilience",
        title: "Resilience Training Skill",
        detail: "Yoga Nationals shield fuels focus for tougher runs.",
        score: 150,
        color: "#ffe99a",
      },
    ],
    hazards: [
      {
        title: "Club Sponsor Rejection",
        detail: "Potential backer passes on funding the big event.",
        color: "#ff5f6d",
      },
      {
        title: "Competition Cut",
        detail: "Final round slot goes to another school.",
        color: "#f76b8a",
      },
      {
        title: "Committee No",
        detail: "Budget request denied—momentum dips.",
        color: "#ff9f68",
      },
    ],
  },
  {
    id: "warwick",
    name: "Level 2: Warwick Runway",
    description: "Scholarship hustle in motion",
    accent: "#5f8bff",
    baseSpeed: 260,
    achievements: [
      {
        id: "scholarship",
        title: "Global Scholar Skill",
        detail: "Locked the £60k Global Excellence Scholarship.",
        score: 180,
        color: "#8bc6ff",
      },
      {
        id: "operations",
        title: "Operations Maestro Skill",
        detail: "Ran Warwick India Forum Ball logistics for 150+ guests.",
        score: 170,
        color: "#6db8ff",
      },
      {
        id: "relationships",
        title: "Stakeholder Whisperer Skill",
        detail: "Coordinated VIP speakers like Smriti Irani & Barkha Dutt.",
        score: 175,
        color: "#4f9cff",
      },
      {
        id: "doctorai",
        title: "Doctor AI Builder Skill",
        detail: "Deployed preventative healthcare tech across rural clinics.",
        score: 200,
        color: "#93ddff",
      },
    ],
    hazards: [
      {
        title: "Scholarship Deferral",
        detail: "Funding confirmation stalls at the last minute.",
        color: "#ff8a5c",
      },
      {
        title: "Pitch Declined",
        detail: "Innovation judge passes on the prototype demo.",
        color: "#f75990",
      },
      {
        title: "Research Rebuff",
        detail: "Advisor pushes back on project scope—reset required.",
        color: "#ff6f91",
      },
    ],
  },
  {
    id: "internships",
    name: "Level 3: Internship Gauntlet",
    description: "Every placement, one nonstop run",
    accent: "#ffd166",
    baseSpeed: 305,
    achievements: [
      {
        id: "pret",
        title: "Market Insight Skill",
        detail: "Drove Pret India product tests and competitor analytics.",
        score: 180,
        color: "#ffe08a",
      },
      {
        id: "himachal",
        title: "Digital Growth Skill",
        detail: "Lifted Himachal Futuristics reach by 15% through campaigns.",
        score: 190,
        color: "#ffd166",
      },
      {
        id: "blueplanet",
        title: "Sustainability Strategy Skill",
        detail: "Drafted ESG proposals across 15 Blue Planet markets.",
        score: 210,
        color: "#ffc43d",
      },
      {
        id: "allstate",
        title: "Data Intelligence Skill",
        detail: "Ranked top Allstate NI candidate among 2,000+ peers.",
        score: 220,
        color: "#ffb347",
      },
      {
        id: "allnex",
        title: "CSR Design Skill",
        detail: "Built mental health, sustainability & education roadmaps.",
        score: 200,
        color: "#ff9f1c",
      },
      {
        id: "jio",
        title: "Expansion Analyst Skill",
        detail: "Evaluated 90+ Jio sites with cross-functional teams.",
        score: 240,
        color: "#ffbe0b",
      },
    ],
    hazards: [
      {
        title: "Recruiter Rejection",
        detail: "Template email says the role went another way.",
        color: "#ef476f",
      },
      {
        title: "ATS Filter Out",
        detail: "Resume gets screened before the interview stage.",
        color: "#f78c6b",
      },
      {
        title: "Ghosted Interview",
        detail: "Final round disappears—find another lane fast!",
        color: "#f94144",
      },
    ],
  },
];

const player = {
  lane: 1,
  width: 70,
  height: 110,
  x: laneCenters[1] - 35,
  y: canvas.height - 150,
  color: "#00d1b2",
};

const state = {
  running: false,
  paused: false,
  gameOver: false,
  victory: false,
  score: 0,
  capital: 3,
  entities: [],
  pendingAchievements: [],
  collected: new Set(),
  logs: [],
  spawnTimer: 0,
  transitionTimer: 0,
  allowSpawns: true,
  levelIndex: 0,
  lastTimestamp: 0,
};

function resetPlayerPosition() {
  player.lane = 1;
  player.x = laneCenters[player.lane] - player.width / 2;
}

function hexToRgba(hex, alpha = 0.25) {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setTheme(level) {
  document.documentElement.style.setProperty("--accent", level.accent);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(level.accent, 0.25));
  player.color = level.accent;
}

function pushLog(message) {
  state.logs.unshift({ message, timestamp: Date.now() });
  state.logs = state.logs.slice(0, 10);
  renderLog();
}

function renderLog() {
  logElement.innerHTML = state.logs
    .map((entry) => `<p>${entry.message}</p>`)
    .join("");
}

function updateScoreboard(level = levels[Math.min(state.levelIndex, levels.length - 1)]) {
  if (level) {
    levelElement.textContent = `${level.name}\n${level.description}`;
  } else {
    levelElement.textContent = "–";
  }
  scoreElement.textContent = state.score.toLocaleString();
  capitalElement.textContent = state.capital > 0 ? "⚡".repeat(state.capital) : "🛑";
}

function updateObjectives(level) {
  const html = level.achievements
    .map((achievement) => {
      const done = state.collected.has(achievement.id);
      return `<li class="${done ? "done" : ""}"><strong>${achievement.title}</strong><br>${achievement.detail}</li>`;
    })
    .join("");
  objectivesList.innerHTML = html;
}

function cloneAchievements(level) {
  return level.achievements.map((achievement) => ({ ...achievement }));
}

function startGame() {
  const level = levels[0];
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.victory = false;
  state.score = 0;
  state.capital = 3;
  state.entities = [];
  state.pendingAchievements = cloneAchievements(level);
  state.collected = new Set();
  state.logs = [];
  state.spawnTimer = 0.6;
  state.transitionTimer = 0;
  state.allowSpawns = true;
  state.levelIndex = 0;
  state.lastTimestamp = performance.now();
  resetPlayerPosition();
  setTheme(level);
  updateScoreboard(level);
  updateObjectives(level);
  pushLog("Green light! Sprint through Foundation Dash to bank the core skills.");
  requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (!state.running || state.paused || state.gameOver || state.victory) return;
  state.paused = true;
  pushLog("Run paused. Momentum on hold.");
}

function resumeGame() {
  if (!state.running || !state.paused || state.gameOver || state.victory) return;
  state.paused = false;
  state.lastTimestamp = performance.now();
  pushLog("Back on the run—momentum climbing again.");
}

function restartGame() {
  state.running = false;
  startGame();
}

function spawnAchievement(level) {
  if (!state.pendingAchievements.length) return;
  const next = state.pendingAchievements.shift();
  const lane = Math.floor(Math.random() * laneCount);
  state.entities.push({
    type: "coin",
    id: next.id,
    title: next.title,
    detail: next.detail,
    value: next.score,
    color: next.color,
    x: laneCenters[lane] - 30,
    y: -80,
    width: 60,
    height: 60,
  });
}

function spawnHazard(level) {
  const hazard = level.hazards[Math.floor(Math.random() * level.hazards.length)];
  const lane = Math.floor(Math.random() * laneCount);
  state.entities.push({
    type: "hazard",
    title: hazard.title,
    detail: hazard.detail,
    damage: 1,
    color: hazard.color,
    x: laneCenters[lane] - 32,
    y: -80,
    width: 64,
    height: 64,
  });
}

function handleAchievementCollision(entity, level) {
  if (state.collected.has(entity.id)) return;
  state.collected.add(entity.id);
  state.score += entity.value;
  pushLog(`+${entity.value} skill pts: ${entity.title}. ${entity.detail}`);
  updateScoreboard(level);
  updateObjectives(level);

  if (state.collected.size === level.achievements.length) {
    handleLevelCompletion(level);
  }
}

function handleHazardCollision(entity, level) {
  state.capital = Math.max(0, state.capital - (entity.damage || 1));
  pushLog(`Rejection hit: ${entity.title}. ${entity.detail}`);
  updateScoreboard(level);
  if (state.capital === 0) {
    triggerGameOver("Momentum drained by stacked rejections. Hit Restart to relaunch the chase.");
  }
}

function handleLevelCompletion(level) {
  pushLog(`Level cleared: ${level.name}! Skills secured. Setting sights on the next experience.`);
  state.allowSpawns = false;
  state.transitionTimer = 2.3;
  state.entities = [];
}

function triggerVictory() {
  state.running = false;
  state.victory = true;
  pushLog("Finish line crossed! Every experience now fuels the Prisha Advantage.");
  updateScoreboard(levels[levels.length - 1]);
}

function triggerGameOver(message) {
  state.running = false;
  state.gameOver = true;
  pushLog(message);
}

function advanceLevel() {
  state.levelIndex += 1;
  if (state.levelIndex >= levels.length) {
    triggerVictory();
    return;
  }
  const nextLevel = levels[state.levelIndex];
  state.collected = new Set();
  state.pendingAchievements = cloneAchievements(nextLevel);
  state.allowSpawns = true;
  state.transitionTimer = 0;
  state.spawnTimer = 0.6;
  state.entities = [];
  resetPlayerPosition();
  setTheme(nextLevel);
  updateScoreboard(nextLevel);
  updateObjectives(nextLevel);
  pushLog(`New run unlocked: ${nextLevel.name} – ${nextLevel.description}.`);
}

function gameLoop(timestamp) {
  if (!state.running) return;

  if (state.paused) {
    state.lastTimestamp = timestamp;
    requestAnimationFrame(gameLoop);
    return;
  }

  const delta = (timestamp - state.lastTimestamp) / 1000 || 0;
  state.lastTimestamp = timestamp;

  update(delta);
  render();

  requestAnimationFrame(gameLoop);
}

function update(delta) {
  const level = levels[state.levelIndex];

  if (state.transitionTimer > 0) {
    state.transitionTimer -= delta;
    if (state.transitionTimer <= 0) {
      advanceLevel();
    }
    return;
  }

  if (state.allowSpawns) {
    state.spawnTimer -= delta;
    if (state.spawnTimer <= 0) {
      if (state.pendingAchievements.length) {
        spawnAchievement(level);
        if (Math.random() < 0.55) {
          spawnHazard(level);
        }
      } else {
        spawnHazard(level);
      }
      const spawnInterval = Math.max(0.7, 1.3 - state.levelIndex * 0.15);
      state.spawnTimer = spawnInterval;
    }
  }

  const baseSpeed = level.baseSpeed;
  const scoreBoost = Math.min(state.score / 15, 160);
  const speed = baseSpeed + scoreBoost;

  state.entities.forEach((entity) => {
    entity.y += speed * delta;
  });

  state.entities = state.entities.filter((entity) => entity.y < canvas.height + 120);

  state.entities.forEach((entity) => {
    if (isColliding(player, entity)) {
      if (entity.type === "coin") {
        handleAchievementCollision(entity, level);
      } else if (entity.type === "hazard" && !state.gameOver) {
        handleHazardCollision(entity, level);
      }
      entity.y = canvas.height + 200; // move out of bounds to remove next frame
    }
  });
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrack();
  drawPlayer();
  state.entities.forEach((entity) => {
    if (entity.type === "coin") {
      drawCoin(entity);
    } else {
      drawHazard(entity);
    }
  });
  if (state.gameOver) {
    drawOverlay("Momentum Spent", "Press Restart to jump back into the run.");
  } else if (state.victory) {
    drawOverlay("Prisha Advantage Unleashed!", "Every skill secured despite the rejections.");
  }
}

function drawTrack() {
  const level = levels[state.levelIndex];
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#021220");
  gradient.addColorStop(1, "#062a42");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 4;
  for (let i = 1; i < laneCount; i += 1) {
    const x = i * laneWidth;
    ctx.setLineDash([16, 20]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = `${level.accent}33`;
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px 'JetBrains Mono', monospace";
  ctx.fillText(level.name, 24, 38);
}

function drawPlayer() {
  const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, player.color);
  ctx.fillStyle = gradient;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(player.x + 12, player.y + 20, player.width - 24, player.height - 40);
  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(player.x + 18, player.y + 28, player.width - 36, player.height - 90);
}

function drawCoin(coin) {
  ctx.save();
  ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
  ctx.beginPath();
  ctx.fillStyle = coin.color || "#ffd700";
  ctx.shadowColor = "rgba(255, 212, 59, 0.6)";
  ctx.shadowBlur = 18;
  ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0b0f19";
  ctx.font = "bold 12px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("SKL", 0, 4);
  ctx.restore();
}

function drawHazard(hazard) {
  ctx.save();
  ctx.translate(hazard.x + hazard.width / 2, hazard.y + hazard.height / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = hazard.color || "#ff5f6d";
  ctx.shadowColor = "rgba(255, 95, 109, 0.55)";
  ctx.shadowBlur = 14;
  ctx.fillRect(-hazard.width / 2, -hazard.height / 2, hazard.width, hazard.height);
  ctx.restore();
}

function drawOverlay(title, subtitle) {
  ctx.save();
  ctx.fillStyle = "rgba(2, 10, 22, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 48px 'JetBrains Mono', monospace";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "24px 'JetBrains Mono', monospace";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 30);
  ctx.restore();
}

function handleKeyDown(event) {
  if (!state.running || state.paused) return;
  if (["ArrowLeft", "a", "A"].includes(event.key)) {
    event.preventDefault();
    if (player.lane > 0) {
      player.lane -= 1;
      player.x = laneCenters[player.lane] - player.width / 2;
    }
  }
  if (["ArrowRight", "d", "D"].includes(event.key)) {
    event.preventDefault();
    if (player.lane < laneCount - 1) {
      player.lane += 1;
      player.x = laneCenters[player.lane] - player.width / 2;
    }
  }
}

document.addEventListener("keydown", handleKeyDown);

startButton.addEventListener("click", () => {
  if (!state.running) {
    startGame();
  }
});

pauseButton.addEventListener("click", () => {
  pauseGame();
});

resumeButton.addEventListener("click", () => {
  resumeGame();
});

restartButton.addEventListener("click", () => {
  restartGame();
});

// Provide an initial hint in the log even before the game starts.
pushLog("Hit Start Race to launch Prisha's skills run and show how she outruns every rejection.");

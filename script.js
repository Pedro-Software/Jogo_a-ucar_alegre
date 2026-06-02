(() => {
  "use strict";

  const BASE_WIDTH = 960;
  const BASE_HEIGHT = 540;
  const GRAVITY = 1550;
  const MAX_FALL = 980;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => Math.random() * (max - min) + min;

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function centerOf(entity) {
    return { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
  }

  function roundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function fillRound(ctx, x, y, w, h, r, fill) {
    roundedRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function strokeRound(ctx, x, y, w, h, r, stroke, width = 2) {
    roundedRect(ctx, x, y, w, h, r);
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function smileTrail(x, y, count, step, amp = 28, value = 10) {
    return Array.from({ length: count }, (_, i) => ({
      type: "smile",
      x: x + i * step,
      y: y + Math.sin(i * 0.85) * amp,
      value
    }));
  }

  function makePlatforms(list) {
    return list.map((item) => ({
      type: "solid",
      color: "#8ac5ff",
      top: "#ffffff",
      ...item
    }));
  }

  const SKINS = [
    {
      id: "classic",
      name: "Clássica Alegrinho",
      short: "Clássica",
      desc: "Branco, azul e vermelho, pronta para começar a aventura.",
      main: "#2f8cff",
      accent: "#ff4b5c",
      soft: "#eaf5ff",
      dark: "#243a86",
      glow: "#ffd858",
      detail: "label",
      unlockLevel: 0
    },
    {
      id: "market",
      name: "Supermercado Estelar",
      short: "Estelar",
      desc: "Brilhos de corredor, estrelas doces e faixa azul noturna.",
      main: "#3650d7",
      accent: "#ffd858",
      soft: "#dbe6ff",
      dark: "#1d2c73",
      glow: "#91efff",
      detail: "stars",
      unlockLevel: 1
    },
    {
      id: "chef",
      name: "Confeiteiro Doce",
      short: "Confeiteiro",
      desc: "Chapéu de confeiteiro e laço vermelho para a padaria.",
      main: "#ff4b5c",
      accent: "#2f8cff",
      soft: "#fff2f4",
      dark: "#873244",
      glow: "#ffffff",
      detail: "chef",
      unlockLevel: 2
    },
    {
      id: "coffee",
      name: "Café Dourado",
      short: "Café Dourado",
      desc: "Toques dourados para atravessar a mesa do café.",
      main: "#b5792b",
      accent: "#ffd858",
      soft: "#fff1d0",
      dark: "#5c3b22",
      glow: "#ffe9a1",
      detail: "steam",
      unlockLevel: 3
    },
    {
      id: "leaf",
      name: "Folha Aventureira",
      short: "Folha",
      desc: "Capa verde, aura de jardim e energia de quintal.",
      main: "#39b86f",
      accent: "#2f8cff",
      soft: "#e6fff0",
      dark: "#20613d",
      glow: "#9ff29e",
      detail: "leaf",
      unlockLevel: 4
    },
    {
      id: "party",
      name: "Festa Real",
      short: "Festa Real",
      desc: "Coroa, brilho de aniversário e alegria no topo do bolo.",
      main: "#8b55ff",
      accent: "#ffd858",
      soft: "#f1e8ff",
      dark: "#3b2773",
      glow: "#ff8cc6",
      detail: "crown",
      unlockLevel: 5
    }
  ];

  const SKIN_BY_ID = Object.fromEntries(SKINS.map((skin) => [skin.id, skin]));

  const LEVELS = [
    {
      id: 1,
      title: "Fuga do Supermercado",
      subtitle: "O Despertar",
      card: "O Alegrinho ganha vida em uma prateleira alta e corre pelos corredores antes da sacola comum.",
      special: "Planar com leveza",
      unlockSkin: "market",
      width: 3900,
      start: { x: 82, y: 360 },
      checkpoint: { x: 1760, y: 392 },
      finish: { x: 3720, y: 355, w: 62, h: 115 },
      starGoal: 180,
      palette: {
        skyTop: "#0f1f57",
        skyBottom: "#88d4ff",
        ground: "#526188",
        groundTop: "#cbd7ff",
        accent: "#ff4b5c",
        second: "#ffd858",
        third: "#43c878"
      },
      art: "linear-gradient(135deg, #273a8e, #2f8cff 54%, #ffd858)",
      platforms: makePlatforms([
        { x: 0, y: 470, w: 760, h: 70, color: "#526188", top: "#cbd7ff" },
        { x: 855, y: 470, w: 620, h: 70, color: "#526188", top: "#cbd7ff" },
        { x: 1595, y: 470, w: 740, h: 70, color: "#526188", top: "#cbd7ff" },
        { x: 2435, y: 470, w: 1465, h: 70, color: "#526188", top: "#cbd7ff" },
        { x: 320, y: 392, w: 170, h: 20, type: "shelf", color: "#ef6f7a", top: "#ffffff" },
        { x: 620, y: 335, w: 170, h: 20, type: "shelf", color: "#6bbfff", top: "#ffffff" },
        { x: 1020, y: 402, w: 190, h: 20, type: "shelf", color: "#ffd858", top: "#ffffff" },
        { x: 1310, y: 350, w: 180, h: 20, type: "shelf", color: "#43c878", top: "#ffffff" },
        { x: 1730, y: 392, w: 190, h: 20, type: "shelf", color: "#ff8cc6", top: "#ffffff" },
        { x: 2060, y: 412, w: 220, h: 18, type: "conveyor", force: 130, color: "#5d698d", top: "#cbd7ff" },
        { x: 2500, y: 382, w: 170, h: 20, type: "shelf", color: "#ffd858", top: "#ffffff" },
        { x: 2800, y: 330, w: 190, h: 20, type: "shelf", color: "#2f8cff", top: "#ffffff" }
      ]),
      collectibles: [
        ...smileTrail(250, 330, 8, 78),
        ...smileTrail(1030, 340, 8, 78, 22),
        ...smileTrail(1720, 335, 9, 74, 26),
        ...smileTrail(2530, 320, 8, 72, 24)
      ],
      enemies: [
        { type: "cartwheel", x: 535, y: 432, minX: 480, maxX: 720, speed: 85 },
        { type: "salt", x: 1110, y: 416, minX: 1000, maxX: 1390, speed: 72 },
        { type: "pepper", x: 1840, y: 424, minX: 1620, maxX: 2140, speed: 66 },
        { type: "cartwheel", x: 2550, y: 432, minX: 2460, maxX: 2960, speed: 105 }
      ],
      hazards: [
        { type: "fallingProduct", x: 740, y: 105, w: 38, h: 46, delay: 0.3 },
        { type: "fallingProduct", x: 1470, y: 75, w: 42, h: 48, delay: 1.2 },
        { type: "fallingProduct", x: 2310, y: 88, w: 44, h: 44, delay: 2.1 }
      ],
      boss: {
        type: "scanner",
        name: "Scanner do Caixa",
        x: 3330,
        y: 268,
        w: 250,
        h: 168,
        hp: 5,
        arenaStart: 3000,
        weakPoints: [
          { x: 3108, y: 438, w: 70, h: 28 },
          { x: 3230, y: 438, w: 70, h: 28 },
          { x: 3352, y: 438, w: 70, h: 28 }
        ]
      }
    },
    {
      id: 2,
      title: "O Caos da Cozinha de Padaria",
      subtitle: "Farinha, vento e coragem",
      card: "Bancadas gigantes, fornos quentinhos e formigas organizadas no caminho da festa.",
      special: "Correr leve com açúcar",
      unlockSkin: "chef",
      width: 4020,
      start: { x: 82, y: 360 },
      checkpoint: { x: 1850, y: 392 },
      finish: { x: 3838, y: 355, w: 62, h: 115 },
      starGoal: 190,
      palette: {
        skyTop: "#ffe3ad",
        skyBottom: "#fff7df",
        ground: "#b5795b",
        groundTop: "#ffe2c7",
        accent: "#ff4b5c",
        second: "#8ad7ff",
        third: "#ffd858"
      },
      art: "linear-gradient(135deg, #ffe3ad, #ff8cc6 48%, #b5795b)",
      platforms: makePlatforms([
        { x: 0, y: 470, w: 780, h: 70, color: "#b5795b", top: "#ffe2c7" },
        { x: 890, y: 470, w: 620, h: 70, color: "#b5795b", top: "#ffe2c7" },
        { x: 1620, y: 470, w: 790, h: 70, color: "#b5795b", top: "#ffe2c7" },
        { x: 2530, y: 470, w: 1490, h: 70, color: "#b5795b", top: "#ffe2c7" },
        { x: 350, y: 405, w: 190, h: 20, type: "counter", color: "#cf8e6d", top: "#fff0db" },
        { x: 690, y: 348, w: 150, h: 20, type: "counter", color: "#cf8e6d", top: "#fff0db" },
        { x: 1090, y: 390, w: 170, h: 20, type: "fragile", color: "#eec77d", top: "#fff4cc" },
        { x: 1320, y: 338, w: 170, h: 20, type: "counter", color: "#cf8e6d", top: "#fff0db" },
        { x: 1850, y: 390, w: 190, h: 20, type: "counter", color: "#cf8e6d", top: "#fff0db" },
        { x: 2190, y: 342, w: 170, h: 20, type: "fragile", color: "#eec77d", top: "#fff4cc" },
        { x: 2720, y: 386, w: 190, h: 20, type: "counter", color: "#cf8e6d", top: "#fff0db" }
      ]),
      collectibles: [
        ...smileTrail(275, 344, 7, 84, 25),
        ...smileTrail(1030, 333, 7, 84, 24),
        ...smileTrail(1830, 330, 8, 80, 26),
        ...smileTrail(2680, 328, 8, 72, 20),
        { type: "grain", x: 1015, y: 348, value: 0 },
        { type: "grain", x: 2130, y: 326, value: 0 },
        { type: "grain", x: 2860, y: 348, value: 0 }
      ],
      enemies: [
        { type: "rollingPin", x: 565, y: 426, minX: 390, maxX: 720, speed: 80 },
        { type: "flourBag", x: 1435, y: 410, minX: 1250, maxX: 1510, speed: 62 },
        { type: "pepper", x: 2285, y: 424, minX: 2050, maxX: 2380, speed: 72 },
        { type: "rollingPin", x: 2725, y: 426, minX: 2600, maxX: 3080, speed: 95 }
      ],
      hazards: [
        { type: "water", x: 805, y: 456, w: 88, h: 16 },
        { type: "mixerWind", x: 1510, y: 240, w: 210, h: 230, force: -170 },
        { type: "water", x: 2415, y: 456, w: 94, h: 16 },
        { type: "fallingFlour", x: 1760, y: 80, w: 52, h: 52, delay: 1.1 }
      ],
      boss: {
        type: "antQueen",
        name: "Dona Formiga Rainha",
        x: 3380,
        y: 324,
        w: 184,
        h: 124,
        hp: 5,
        arenaStart: 3060,
        puddles: [
          { x: 3150, y: 456, w: 105, h: 14 },
          { x: 3520, y: 456, w: 118, h: 14 }
        ]
      }
    },
    {
      id: 3,
      title: "A Terra do Café Quente",
      subtitle: "Mesa de café da manhã",
      card: "Xícaras, colheres catapulta e um bule elegante testam o salto do Alegrinho.",
      special: "Rebater cubos de gelo",
      unlockSkin: "coffee",
      width: 4050,
      start: { x: 84, y: 360 },
      checkpoint: { x: 1790, y: 392 },
      finish: { x: 3865, y: 355, w: 62, h: 115 },
      starGoal: 190,
      palette: {
        skyTop: "#f9c68c",
        skyBottom: "#fff5dc",
        ground: "#7a4c32",
        groundTop: "#f4c77d",
        accent: "#b5792b",
        second: "#2f8cff",
        third: "#ffd858"
      },
      art: "linear-gradient(135deg, #b5792b, #f9c68c 56%, #2f8cff)",
      platforms: makePlatforms([
        { x: 0, y: 470, w: 900, h: 70, color: "#7a4c32", top: "#f4c77d" },
        { x: 980, y: 470, w: 620, h: 70, color: "#7a4c32", top: "#f4c77d" },
        { x: 1700, y: 470, w: 720, h: 70, color: "#7a4c32", top: "#f4c77d" },
        { x: 2520, y: 470, w: 1530, h: 70, color: "#7a4c32", top: "#f4c77d" },
        { x: 360, y: 386, w: 180, h: 20, type: "toast", color: "#d99646", top: "#ffe2a8" },
        { x: 760, y: 410, w: 130, h: 18, type: "spoon", color: "#b7c7df", top: "#ffffff", launch: -760 },
        { x: 1140, y: 348, w: 160, h: 20, type: "saucer", color: "#82c6ff", top: "#ffffff" },
        { x: 1500, y: 406, w: 130, h: 18, type: "spoon", color: "#b7c7df", top: "#ffffff", launch: -800 },
        { x: 1860, y: 340, w: 190, h: 20, type: "saucer", color: "#ffd858", top: "#ffffff" },
        { x: 2240, y: 385, w: 170, h: 20, type: "toast", color: "#d99646", top: "#ffe2a8" },
        { x: 2750, y: 402, w: 130, h: 18, type: "spoon", color: "#b7c7df", top: "#ffffff", launch: -720 }
      ]),
      collectibles: [
        ...smileTrail(290, 328, 7, 82, 22),
        ...smileTrail(1070, 300, 8, 82, 26),
        ...smileTrail(1850, 292, 8, 82, 24),
        ...smileTrail(2670, 318, 8, 74, 22)
      ],
      enemies: [
        { type: "toast", x: 585, y: 420, minX: 420, maxX: 820, speed: 70 },
        { type: "sweetener", x: 1305, y: 414, minX: 1100, maxX: 1570, speed: 78 },
        { type: "coffeeDrop", x: 2140, y: 424, minX: 1870, maxX: 2370, speed: 88 },
        { type: "toast", x: 2630, y: 420, minX: 2515, maxX: 3020, speed: 72 }
      ],
      hazards: [
        { type: "steam", x: 910, y: 310, w: 70, h: 160, delay: 0 },
        { type: "hotDrop", x: 1630, y: 88, w: 34, h: 42, delay: 1.4 },
        { type: "steam", x: 2420, y: 316, w: 70, h: 154, delay: 1.6 }
      ],
      boss: {
        type: "teapot",
        name: "Bule de Prata",
        x: 3400,
        y: 292,
        w: 190,
        h: 150,
        hp: 5,
        arenaStart: 3070
      }
    },
    {
      id: 4,
      title: "O Quintal dos Perigos",
      subtitle: "Folhas, vento e brincadeira",
      card: "Um caminho vivo entre a casa e o salão, com folhas-skate e um cachorro brincalhão.",
      special: "Deslizar em folha",
      unlockSkin: "leaf",
      width: 4100,
      start: { x: 82, y: 360 },
      checkpoint: { x: 1880, y: 392 },
      finish: { x: 3915, y: 355, w: 62, h: 115 },
      starGoal: 190,
      palette: {
        skyTop: "#86d9ff",
        skyBottom: "#e8fff1",
        ground: "#3f9a5e",
        groundTop: "#a4ed78",
        accent: "#2f8cff",
        second: "#ff8cc6",
        third: "#ffd858"
      },
      art: "linear-gradient(135deg, #43c878, #86d9ff 60%, #ffd858)",
      platforms: makePlatforms([
        { x: 0, y: 470, w: 780, h: 70, color: "#3f9a5e", top: "#a4ed78" },
        { x: 900, y: 470, w: 660, h: 70, color: "#3f9a5e", top: "#a4ed78" },
        { x: 1660, y: 470, w: 820, h: 70, color: "#3f9a5e", top: "#a4ed78" },
        { x: 2600, y: 470, w: 1500, h: 70, color: "#3f9a5e", top: "#a4ed78" },
        { x: 330, y: 392, w: 175, h: 20, type: "hedge", color: "#2d7e4d", top: "#a4ed78" },
        { x: 690, y: 345, w: 180, h: 20, type: "leaf", color: "#43c878", top: "#c9ff91" },
        { x: 1110, y: 382, w: 190, h: 20, type: "hedge", color: "#2d7e4d", top: "#a4ed78" },
        { x: 1515, y: 342, w: 180, h: 20, type: "leaf", color: "#43c878", top: "#c9ff91" },
        { x: 1905, y: 396, w: 180, h: 20, type: "hedge", color: "#2d7e4d", top: "#a4ed78" },
        { x: 2310, y: 350, w: 170, h: 20, type: "leaf", color: "#43c878", top: "#c9ff91" },
        { x: 2780, y: 388, w: 190, h: 20, type: "hedge", color: "#2d7e4d", top: "#a4ed78" }
      ]),
      collectibles: [
        ...smileTrail(300, 330, 8, 80, 26),
        ...smileTrail(1080, 320, 8, 80, 23),
        ...smileTrail(1900, 326, 8, 82, 28),
        ...smileTrail(2700, 322, 8, 74, 20)
      ],
      enemies: [
        { type: "branch", x: 520, y: 418, minX: 385, maxX: 750, speed: 66 },
        { type: "playDog", x: 1280, y: 416, minX: 1030, maxX: 1500, speed: 94 },
        { type: "cutter", x: 2180, y: 424, minX: 1870, maxX: 2460, speed: 120 },
        { type: "branch", x: 2820, y: 418, minX: 2600, maxX: 3020, speed: 70 }
      ],
      hazards: [
        { type: "wind", x: 785, y: 235, w: 170, h: 235, force: 220 },
        { type: "hole", x: 1560, y: 470, w: 100, h: 70 },
        { type: "fallingBranch", x: 2440, y: 70, w: 72, h: 28, delay: 0.8 }
      ],
      boss: {
        type: "dog",
        name: "Vira-Lata Caramelo",
        x: 3380,
        y: 322,
        w: 210,
        h: 125,
        hp: 5,
        arenaStart: 3070,
        bones: [
          { x: 3150, y: 424, w: 42, h: 24 },
          { x: 3310, y: 424, w: 42, h: 24 },
          { x: 3540, y: 424, w: 42, h: 24 }
        ]
      }
    },
    {
      id: 5,
      title: "A Grande Festa de Aniversário",
      subtitle: "O Destino Final",
      card: "Balões, brigadeiros, velinhas e o topo do bolo esperam a última missão doce.",
      special: "Fogos de açúcar",
      unlockSkin: "party",
      width: 4200,
      start: { x: 82, y: 360 },
      checkpoint: { x: 1970, y: 392 },
      finish: { x: 4000, y: 330, w: 70, h: 140 },
      starGoal: 210,
      palette: {
        skyTop: "#ffb7d6",
        skyBottom: "#fff6d9",
        ground: "#c75d9c",
        groundTop: "#ffe4f4",
        accent: "#8b55ff",
        second: "#ffd858",
        third: "#43c878"
      },
      art: "linear-gradient(135deg, #ff8cc6, #8b55ff 48%, #ffd858)",
      platforms: makePlatforms([
        { x: 0, y: 470, w: 820, h: 70, color: "#c75d9c", top: "#ffe4f4" },
        { x: 930, y: 470, w: 690, h: 70, color: "#c75d9c", top: "#ffe4f4" },
        { x: 1720, y: 470, w: 810, h: 70, color: "#c75d9c", top: "#ffe4f4" },
        { x: 2620, y: 470, w: 1580, h: 70, color: "#c75d9c", top: "#ffe4f4" },
        { x: 380, y: 396, w: 175, h: 20, type: "cake", color: "#ff8cc6", top: "#fff7fb" },
        { x: 760, y: 346, w: 180, h: 20, type: "cake", color: "#ffd858", top: "#fff7fb" },
        { x: 1180, y: 400, w: 180, h: 20, type: "slippery", color: "#8b55ff", top: "#f1e8ff" },
        { x: 1560, y: 346, w: 190, h: 20, type: "cake", color: "#ff8cc6", top: "#fff7fb" },
        { x: 1980, y: 394, w: 190, h: 20, type: "slippery", color: "#8b55ff", top: "#f1e8ff" },
        { x: 2370, y: 342, w: 190, h: 20, type: "cake", color: "#ffd858", top: "#fff7fb" },
        { x: 3000, y: 392, w: 190, h: 20, type: "cake", color: "#ff8cc6", top: "#fff7fb" }
      ]),
      collectibles: [
        ...smileTrail(310, 332, 8, 78, 24),
        ...smileTrail(1070, 324, 8, 80, 26),
        ...smileTrail(1880, 324, 9, 78, 24),
        ...smileTrail(2840, 318, 9, 70, 22)
      ],
      enemies: [
        { type: "brigadeiro", x: 610, y: 424, minX: 420, maxX: 790, speed: 88 },
        { type: "beijinho", x: 1290, y: 416, minX: 1030, maxX: 1600, speed: 78 },
        { type: "balloon", x: 2140, y: 404, minX: 1900, maxX: 2480, speed: 70 },
        { type: "brigadeiro", x: 2700, y: 424, minX: 2580, maxX: 3080, speed: 108 }
      ],
      hazards: [
        { type: "candle", x: 845, y: 418, w: 34, h: 54, delay: 0 },
        { type: "tableShake", x: 1640, y: 0, w: 580, h: 540, delay: 0.7 },
        { type: "candle", x: 2540, y: 418, w: 34, h: 54, delay: 1.2 },
        { type: "burstBalloon", x: 2280, y: 160, w: 52, h: 70, delay: 1.8 }
      ],
      boss: {
        type: "hand",
        name: "Monstro do Parabéns: A Mão da Criança",
        x: 3430,
        y: 184,
        w: 210,
        h: 250,
        hp: 6,
        arenaStart: 3100,
        fireworks: [
          { x: 3150, y: 421, w: 42, h: 44 },
          { x: 3370, y: 421, w: 42, h: 44 },
          { x: 3620, y: 421, w: 42, h: 44 }
        ]
      }
    }
  ];

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    ensure() {
      if (!this.enabled) return null;
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          this.enabled = false;
          return null;
        }
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      return this.ctx;
    }

    tone(freq, duration = 0.08, type = "sine", gainValue = 0.08, slide = 1) {
      const ctx = this.ensure();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), now + duration);
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    playJumpSound() {
      this.tone(360, 0.12, "triangle", 0.08, 1.65);
    }

    playCollectSound() {
      this.tone(720, 0.07, "sine", 0.06, 1.45);
      setTimeout(() => this.tone(960, 0.07, "sine", 0.05, 1.2), 45);
    }

    playDamageSound() {
      this.tone(190, 0.16, "sawtooth", 0.06, 0.55);
    }

    playBossHitSound() {
      this.tone(250, 0.08, "square", 0.07, 0.7);
      setTimeout(() => this.tone(520, 0.1, "triangle", 0.06, 1.3), 60);
    }

    playVictorySound() {
      [520, 660, 820, 1040].forEach((freq, i) => {
        setTimeout(() => this.tone(freq, 0.13, "triangle", 0.07, 1.08), i * 90);
      });
    }
  }

  class InputManager {
    constructor() {
      this.down = new Set();
      this.justPressed = new Set();
      this.keyMap = new Map([
        ["ArrowLeft", "left"],
        ["KeyA", "left"],
        ["ArrowRight", "right"],
        ["KeyD", "right"],
        ["Space", "jump"],
        ["KeyW", "jump"],
        ["ShiftLeft", "glide"],
        ["ShiftRight", "glide"],
        ["ArrowUp", "glide"],
        ["KeyE", "ability"],
        ["KeyP", "pause"],
        ["Escape", "pause"]
      ]);
      this.bind();
    }

    bind() {
      window.addEventListener("keydown", (event) => {
        const action = this.keyMap.get(event.code);
        if (!action) return;
        if (["Space", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.code)) {
          event.preventDefault();
        }
        if (!this.down.has(action)) this.justPressed.add(action);
        this.down.add(action);
      });
      window.addEventListener("keyup", (event) => {
        const action = this.keyMap.get(event.code);
        if (action) this.down.delete(action);
      });
      document.querySelectorAll("[data-control]").forEach((button) => {
        const action = button.dataset.control;
        const press = (event) => {
          event.preventDefault();
          if (!this.down.has(action)) this.justPressed.add(action);
          this.down.add(action);
        };
        const release = (event) => {
          event.preventDefault();
          this.down.delete(action);
        };
        button.addEventListener("pointerdown", press);
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("pointerleave", release);
      });
      window.addEventListener("blur", () => {
        this.down.clear();
        this.justPressed.clear();
      });
    }

    isDown(action) {
      return this.down.has(action);
    }

    consume(action) {
      if (!this.justPressed.has(action)) return false;
      this.justPressed.delete(action);
      return true;
    }

    endFrame() {
      this.justPressed.clear();
    }
  }

  class UIManager {
    constructor(game) {
      this.game = game;
      this.screens = {
        home: document.getElementById("screenHome"),
        howTo: document.getElementById("screenHowTo"),
        levels: document.getElementById("screenLevels"),
        skins: document.getElementById("screenSkins"),
        game: document.getElementById("screenGame"),
        final: document.getElementById("screenFinal")
      };
      this.pauseOverlay = document.getElementById("screenPause");
      this.winOverlay = document.getElementById("screenLevelComplete");
      this.gameOverOverlay = document.getElementById("screenGameOver");
      this.transitionLayer = document.getElementById("transition");
      this.transitionText = document.getElementById("transitionText");
      this.levelGrid = document.getElementById("levelGrid");
      this.skinGrid = document.getElementById("skinGrid");
      this.hudEnergy = document.getElementById("hudEnergy");
      this.hudSmiles = document.getElementById("hudSmiles");
      this.hudLevel = document.getElementById("hudLevel");
      this.hudSkin = document.getElementById("hudSkin");
      this.hudPower = document.getElementById("hudPower");
      this.bossHud = document.getElementById("bossHud");
      this.bossName = document.getElementById("bossName");
      this.bossLife = document.getElementById("bossLife");
      this.bindButtons();
    }

    bindButtons() {
      document.getElementById("btnPlay").addEventListener("click", () => {
        this.showLevels();
      });
      document.getElementById("btnQuickStart").addEventListener("click", () => {
        this.game.startLevel(this.game.session.unlockedLevel);
      });
      document.getElementById("btnHowTo").addEventListener("click", () => this.show("howTo"));
      document.getElementById("btnSkinsHome").addEventListener("click", () => this.showSkins());
      document.querySelectorAll(".back-home").forEach((button) => {
        button.addEventListener("click", () => this.show("home"));
      });
      document.getElementById("btnPause").addEventListener("click", () => this.game.pause());
      document.getElementById("btnResume").addEventListener("click", () => this.game.resume());
      document.getElementById("btnRestartPause").addEventListener("click", () => this.game.restartLevel());
      document.getElementById("btnMenuPause").addEventListener("click", () => this.game.exitToLevels());
      document.getElementById("btnRetry").addEventListener("click", () => this.game.restartLevel());
      document.getElementById("btnGameOverMenu").addEventListener("click", () => this.game.exitToLevels());
      document.getElementById("btnNextLevel").addEventListener("click", () => this.game.startLevel(this.game.currentLevel.def.id + 1));
      document.getElementById("btnLevelsWin").addEventListener("click", () => this.game.exitToLevels());
      document.getElementById("btnSkinsWin").addEventListener("click", () => this.showSkins());
      document.getElementById("btnPlayAgain").addEventListener("click", () => {
        this.game.resetSession();
        this.showLevels();
      });
      document.getElementById("btnFinalSkins").addEventListener("click", () => this.showSkins());
    }

    show(name) {
      Object.values(this.screens).forEach((screen) => screen.classList.remove("active"));
      this.hideOverlays();
      this.screens[name].classList.add("active");
    }

    hideOverlays() {
      this.pauseOverlay.hidden = true;
      this.winOverlay.hidden = true;
      this.gameOverOverlay.hidden = true;
    }

    showLevels() {
      this.renderLevels();
      this.show("levels");
    }

    showSkins() {
      this.renderSkins();
      this.show("skins");
    }

    showPause() {
      this.pauseOverlay.hidden = false;
    }

    hidePause() {
      this.pauseOverlay.hidden = true;
    }

    showGameOver() {
      this.gameOverOverlay.hidden = false;
    }

    showLevelComplete(stats) {
      const stars = document.getElementById("winStars");
      const smiles = document.getElementById("winSmiles");
      const skin = document.getElementById("winSkin");
      const next = document.getElementById("btnNextLevel");
      stars.innerHTML = "";
      for (let i = 0; i < 3; i += 1) {
        const star = document.createElement("span");
        star.className = `star${i >= stats.stars ? " dim" : ""}`;
        stars.appendChild(star);
      }
      smiles.textContent = `${stats.smiles} Sorrisos de Açúcar coletados nesta fase.`;
      skin.textContent = `Skin desbloqueada: ${SKIN_BY_ID[stats.skin].name}.`;
      next.hidden = stats.levelId >= LEVELS.length;
      this.winOverlay.hidden = false;
    }

    showFinal() {
      this.renderSkins();
      this.show("final");
    }

    transition(text, callback) {
      this.transitionText.textContent = text;
      this.transitionLayer.hidden = false;
      this.transitionLayer.classList.remove("is-hiding");
      setTimeout(() => {
        callback();
        setTimeout(() => {
          this.transitionLayer.classList.add("is-hiding");
          setTimeout(() => {
            this.transitionLayer.hidden = true;
            this.transitionLayer.classList.remove("is-hiding");
          }, 280);
        }, 260);
      }, 250);
    }

    renderLevels() {
      this.levelGrid.innerHTML = "";
      LEVELS.forEach((level) => {
        const unlocked = level.id <= this.game.session.unlockedLevel;
        const card = document.createElement("article");
        card.className = `level-card-item${unlocked ? "" : " locked"}`;
        card.style.setProperty("--level-art", level.art);

        const title = document.createElement("h3");
        title.textContent = `${level.id}. ${level.title}`;
        const subtitle = document.createElement("p");
        subtitle.textContent = level.subtitle;
        const body = document.createElement("p");
        body.textContent = level.card;
        const special = document.createElement("p");
        special.innerHTML = `<strong>Habilidade:</strong> ${level.special}`;
        const button = document.createElement("button");
        button.textContent = unlocked ? "Jogar fase" : "Bloqueada";
        button.disabled = !unlocked;
        button.addEventListener("click", () => this.game.startLevel(level.id));

        card.append(title, subtitle, body, special, button);
        this.levelGrid.appendChild(card);
      });
    }

    renderSkins() {
      this.skinGrid.innerHTML = "";
      SKINS.forEach((skin) => {
        const unlocked = this.game.session.unlockedSkins.has(skin.id);
        const selected = this.game.session.currentSkin === skin.id;
        const card = document.createElement("article");
        card.className = `skin-card${unlocked ? "" : " locked"}`;
        card.style.setProperty("--skin-main", skin.main);
        card.style.setProperty("--skin-accent", skin.accent);
        card.style.setProperty("--skin-soft", skin.soft);
        card.style.setProperty("--skin-bg", `linear-gradient(135deg, ${skin.soft}, ${skin.glow})`);

        const preview = document.createElement("div");
        preview.className = "skin-preview";
        const pack = document.createElement("div");
        pack.className = "skin-pack";
        preview.appendChild(pack);

        const title = document.createElement("h3");
        title.textContent = skin.name;
        const desc = document.createElement("p");
        desc.textContent = unlocked ? skin.desc : `Conclua a fase ${skin.unlockLevel} para desbloquear.`;
        const button = document.createElement("button");
        button.textContent = selected ? "Selecionada" : unlocked ? "Usar skin" : "Bloqueada";
        button.disabled = !unlocked || selected;
        button.addEventListener("click", () => {
          this.game.setSkin(skin.id);
          this.renderSkins();
        });

        card.append(preview, title, desc, button);
        this.skinGrid.appendChild(card);
      });
    }

    updateHud(game) {
      const player = game.player;
      if (!player || !game.currentLevel) return;
      this.hudEnergy.innerHTML = "";
      for (let i = 0; i < player.maxEnergy; i += 1) {
        const heart = document.createElement("span");
        heart.className = `energy-heart${i >= player.energy ? " empty" : ""}`;
        this.hudEnergy.appendChild(heart);
      }
      this.hudSmiles.textContent = String(player.smiles);
      this.hudLevel.textContent = `${game.currentLevel.def.id}`;
      this.hudSkin.textContent = SKIN_BY_ID[game.session.currentSkin].short;
      const powerRatio = player.cottonTimer > 0 ? player.cottonTimer / player.maxCottonTimer : player.smiles / 100;
      this.hudPower.style.width = `${clamp(powerRatio, 0, 1) * 100}%`;

      const boss = game.currentLevel.boss;
      if (boss && boss.active && !boss.defeated) {
        this.bossHud.hidden = false;
        this.bossName.textContent = boss.name;
        this.bossLife.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
      } else {
        this.bossHud.hidden = true;
      }
    }
  }

  class Particle {
    constructor(x, y, options = {}) {
      this.x = x;
      this.y = y;
      this.vx = options.vx ?? rand(-90, 90);
      this.vy = options.vy ?? rand(-180, -40);
      this.life = options.life ?? rand(0.35, 0.8);
      this.maxLife = this.life;
      this.size = options.size ?? rand(4, 10);
      this.color = options.color ?? "#ffd858";
      this.gravity = options.gravity ?? 280;
      this.shape = options.shape ?? "circle";
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.gravity * dt;
    }

    draw(ctx) {
      const ratio = clamp(this.life / this.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.fillStyle = this.color;
      if (this.shape === "spark") {
        ctx.translate(this.x, this.y);
        ctx.rotate((1 - ratio) * Math.PI);
        ctx.fillRect(-this.size / 2, -1.5, this.size, 3);
        ctx.fillRect(-1.5, -this.size / 2, 3, this.size);
      } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * ratio, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class Platform {
    constructor(data) {
      Object.assign(this, data);
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.broken = false;
      this.timer = 0;
    }

    update(dt) {
      this.vx = 0;
      this.vy = 0;
      if (this.move) {
        this.timer += dt;
        const oldX = this.x;
        const oldY = this.y;
        const wave = Math.sin(this.timer * this.move.speed);
        if (this.move.axis === "x") this.x = this.baseX + wave * this.move.distance;
        if (this.move.axis === "y") this.y = this.baseY + wave * this.move.distance;
        this.vx = (this.x - oldX) / dt;
        this.vy = (this.y - oldY) / dt;
      }
    }

    get solid() {
      return !this.broken && this.type !== "hole";
    }

    draw(ctx, time) {
      if (this.broken) return;
      if (this.type === "conveyor") {
        fillRound(ctx, this.x, this.y, this.w, this.h, 6, this.color);
        ctx.fillStyle = this.top;
        for (let i = 0; i < this.w; i += 34) {
          ctx.fillRect(this.x + ((i + time * 80) % this.w), this.y + 4, 18, 4);
        }
        return;
      }
      if (this.type === "spoon") {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        ctx.rotate(-0.06);
        fillRound(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 9, this.color);
        ctx.fillStyle = this.top;
        ctx.beginPath();
        ctx.ellipse(this.w / 2 - 18, 0, 25, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      if (this.type === "leaf") {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h * 0.72, -0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.top;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + this.h / 2);
        ctx.lineTo(this.x + this.w - 12, this.y + this.h / 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
      fillRound(ctx, this.x, this.y, this.w, this.h, this.h > 24 ? 8 : 6, this.color);
      ctx.fillStyle = this.top;
      ctx.fillRect(this.x + 4, this.y, Math.max(0, this.w - 8), Math.min(8, this.h));
      if (this.type === "fragile") {
        ctx.strokeStyle = "rgba(122, 76, 50, 0.28)";
        ctx.lineWidth = 2;
        for (let i = 20; i < this.w; i += 42) {
          ctx.beginPath();
          ctx.moveTo(this.x + i, this.y + 3);
          ctx.lineTo(this.x + i + 22, this.y + this.h - 3);
          ctx.stroke();
        }
      }
    }
  }

  class Collectible {
    constructor(data) {
      this.type = data.type || "smile";
      this.x = data.x;
      this.y = data.y;
      this.w = this.type === "grain" ? 32 : 28;
      this.h = this.type === "grain" ? 32 : 28;
      this.value = data.value ?? 10;
      this.collected = false;
      this.bob = rand(0, Math.PI * 2);
    }

    update(dt) {
      this.bob += dt * 4;
    }

    draw(ctx) {
      if (this.collected) return;
      const y = this.y + Math.sin(this.bob) * 5;
      if (this.type === "grain") {
        ctx.save();
        ctx.translate(this.x + 16, y + 16);
        ctx.rotate(Math.sin(this.bob) * 0.25);
        fillRound(ctx, -12, -16, 24, 32, 10, "#fff2cc");
        ctx.strokeStyle = "#d99646";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.quadraticCurveTo(8, 0, 0, 12);
        ctx.quadraticCurveTo(-8, 0, 0, -12);
        ctx.stroke();
        ctx.restore();
        return;
      }
      ctx.save();
      ctx.translate(this.x + 14, y + 14);
      ctx.fillStyle = "#ffd858";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#26344d";
      ctx.beginPath();
      ctx.arc(-4, -3, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#26344d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 2, 5, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.restore();
    }
  }

  class Checkpoint {
    constructor(data) {
      this.x = data.x;
      this.y = data.y;
      this.w = 34;
      this.h = 78;
      this.activated = false;
    }

    draw(ctx, time) {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      fillRound(ctx, this.x + 12, this.y - 12, 8, 90, 4, "#ffffff");
      ctx.fillStyle = this.activated ? "#43c878" : "#ff4b5c";
      ctx.beginPath();
      ctx.moveTo(this.x + 20, this.y - 10);
      ctx.quadraticCurveTo(this.x + 62, this.y + Math.sin(time * 4) * 4, this.x + 20, this.y + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffd858";
      ctx.beginPath();
      ctx.arc(this.x + 16, this.y + 80, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Enemy {
    constructor(data) {
      this.type = data.type;
      this.x = data.x;
      this.y = data.y;
      this.w = data.w || 46;
      this.h = data.h || 46;
      this.minX = data.minX;
      this.maxX = data.maxX;
      this.speed = data.speed || 70;
      this.dir = 1;
      this.alive = true;
      this.timer = 0;
      if (["rollingPin", "cutter"].includes(this.type)) {
        this.w = 62;
        this.h = 42;
      }
      if (this.type === "playDog") {
        this.w = 62;
        this.h = 50;
      }
      if (this.type === "balloon") {
        this.w = 48;
        this.h = 64;
      }
    }

    update(dt) {
      if (!this.alive) return;
      this.timer += dt;
      this.x += this.dir * this.speed * dt;
      if (this.x < this.minX) {
        this.x = this.minX;
        this.dir = 1;
      }
      if (this.x + this.w > this.maxX) {
        this.x = this.maxX - this.w;
        this.dir = -1;
      }
      if (["pepper", "toast", "beijinho", "balloon"].includes(this.type)) {
        this.y += Math.sin(this.timer * 5) * 0.55;
      }
    }

    stomp(game) {
      this.alive = false;
      game.player.vy = -430;
      game.audio.playCollectSound();
      for (let i = 0; i < 12; i += 1) {
        game.spawnParticle(this.x + this.w / 2, this.y + this.h / 2, {
          color: ["#ffd858", "#ffffff", "#2f8cff"][i % 3],
          shape: i % 2 ? "spark" : "circle"
        });
      }
    }

    draw(ctx, time) {
      if (!this.alive) return;
      const bob = Math.sin(time * 6 + this.x * 0.01) * 2;
      ctx.save();
      ctx.translate(this.x, this.y + bob);
      if (this.type === "cartwheel") {
        ctx.fillStyle = "#535f84";
        ctx.beginPath();
        ctx.arc(this.w / 2, this.h / 2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.w / 2, this.h / 2, 10, 0, Math.PI * 2);
        ctx.moveTo(this.w / 2 - 18, this.h / 2);
        ctx.lineTo(this.w / 2 + 18, this.h / 2);
        ctx.moveTo(this.w / 2, this.h / 2 - 18);
        ctx.lineTo(this.w / 2, this.h / 2 + 18);
        ctx.stroke();
      } else if (this.type === "salt") {
        fillRound(ctx, 4, 0, 38, 46, 7, "#f4f7ff");
        ctx.fillStyle = "#2f8cff";
        ctx.fillRect(7, 8, 32, 10);
        this.drawFace(ctx, 23, 25, false);
      } else if (this.type === "pepper") {
        fillRound(ctx, 5, 4, 36, 42, 8, "#ff4b5c");
        ctx.fillStyle = "#26344d";
        ctx.fillRect(12, 0, 22, 8);
        this.drawFace(ctx, 23, 27, true);
      } else if (this.type === "rollingPin") {
        fillRound(ctx, 8, 12, 46, 20, 10, "#d99646");
        fillRound(ctx, 0, 16, 12, 12, 6, "#b5795b");
        fillRound(ctx, 50, 16, 12, 12, 6, "#b5795b");
      } else if (this.type === "flourBag") {
        fillRound(ctx, 2, 2, 42, 44, 8, "#fff3dd");
        ctx.fillStyle = "#d99646";
        ctx.fillRect(8, 11, 30, 10);
        this.drawFace(ctx, 23, 28, false);
      } else if (this.type === "toast") {
        fillRound(ctx, 3, 5, 42, 38, 10, "#d99646");
        ctx.strokeStyle = "#7a4c32";
        ctx.lineWidth = 3;
        roundedRect(ctx, 9, 11, 30, 26, 8);
        ctx.stroke();
        this.drawFace(ctx, 24, 27, false);
      } else if (this.type === "sweetener") {
        fillRound(ctx, 3, 0, 40, 46, 8, "#dbe6ff");
        ctx.fillStyle = "#8b55ff";
        ctx.fillRect(8, 8, 30, 10);
        this.drawFace(ctx, 24, 26, true);
      } else if (this.type === "coffeeDrop") {
        ctx.fillStyle = "#7a4c32";
        ctx.beginPath();
        ctx.moveTo(23, 2);
        ctx.quadraticCurveTo(48, 30, 23, 46);
        ctx.quadraticCurveTo(-2, 30, 23, 2);
        ctx.fill();
        this.drawFace(ctx, 23, 29, false, "#ffffff");
      } else if (this.type === "branch") {
        ctx.strokeStyle = "#8b5a36";
        ctx.lineWidth = 9;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(4, 28);
        ctx.lineTo(42, 16);
        ctx.stroke();
        ctx.strokeStyle = "#43c878";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(22, 21);
        ctx.lineTo(36, 5);
        ctx.stroke();
      } else if (this.type === "playDog") {
        fillRound(ctx, 3, 14, 54, 30, 14, "#d8944d");
        ctx.fillStyle = "#bf7434";
        ctx.beginPath();
        ctx.arc(15, 17, 11, 0, Math.PI * 2);
        ctx.arc(45, 17, 11, 0, Math.PI * 2);
        ctx.fill();
        this.drawFace(ctx, 31, 29, false);
      } else if (this.type === "cutter") {
        fillRound(ctx, 0, 16, 62, 26, 6, "#62b65e");
        ctx.fillStyle = "#26344d";
        ctx.beginPath();
        ctx.arc(14, 43, 8, 0, Math.PI * 2);
        ctx.arc(49, 43, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "brigadeiro") {
        ctx.fillStyle = "#6b3b28";
        ctx.beginPath();
        ctx.arc(23, 24, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 9; i += 1) {
          ctx.fillRect(10 + (i * 9) % 28, 9 + ((i * 13) % 26), 5, 2);
        }
      } else if (this.type === "beijinho") {
        ctx.fillStyle = "#fff4d9";
        ctx.beginPath();
        ctx.arc(23, 24, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd858";
        ctx.beginPath();
        ctx.arc(23, 6, 5, 0, Math.PI * 2);
        ctx.fill();
        this.drawFace(ctx, 23, 28, false);
      } else if (this.type === "balloon") {
        ctx.fillStyle = "#2f8cff";
        ctx.beginPath();
        ctx.ellipse(24, 24, 20, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(24, 50);
        ctx.quadraticCurveTo(16, 58, 24, 64);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawFace(ctx, cx, cy, grumpy, color = "#26344d") {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 5, 2, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (grumpy) {
        ctx.arc(cx, cy + 6, 7, Math.PI + 0.2, Math.PI * 2 - 0.2);
      } else {
        ctx.arc(cx, cy, 7, 0.1, Math.PI - 0.1);
      }
      ctx.stroke();
    }
  }

  class Hazard {
    constructor(data) {
      Object.assign(this, data);
      this.timer = data.delay || 0;
      this.baseY = this.y;
      this.baseX = this.x;
      this.active = true;
      this.damageCooldown = 0;
    }

    update(dt, game) {
      this.timer += dt;
      this.damageCooldown = Math.max(0, this.damageCooldown - dt);
      if (["fallingProduct", "fallingFlour", "hotDrop", "fallingBranch"].includes(this.type)) {
        const cycle = 2.6;
        const t = (this.timer % cycle) / cycle;
        this.y = this.baseY + (t < 0.74 ? t / 0.74 : 0) * 390;
        this.active = t < 0.78;
      }
      if (this.type === "tableShake") {
        this.active = Math.sin(this.timer * 2.5) > 0.2;
        if (this.active && game.player && overlap(this, game.player)) {
          game.player.vx += Math.sin(this.timer * 12) * 12;
        }
      }
    }

    apply(game) {
      const player = game.player;
      if (!this.active || !player) return;
      const box = { x: this.x, y: this.y, w: this.w, h: this.h };
      if (this.type === "mixerWind" || this.type === "wind") {
        if (overlap(box, player)) {
          player.vx += (this.force || 120) * game.dt;
          if (Math.random() < 0.35) {
            game.spawnParticle(player.x + rand(0, player.w), player.y + rand(0, player.h), {
              color: "rgba(255,255,255,0.9)",
              vx: (this.force || 120) * 0.55,
              vy: rand(-40, 30),
              gravity: 0,
              life: 0.35,
              shape: "spark"
            });
          }
        }
        return;
      }
      if (this.type === "conveyor") return;
      if (!overlap(box, player)) return;
      if (this.damageCooldown > 0) return;
      if (this.type === "water" && player.cottonTimer > 0) {
        for (let i = 0; i < 4; i += 1) {
          game.spawnParticle(player.x + player.w / 2, player.y + player.h / 2, {
            color: "#ff8cc6",
            vy: rand(-120, -60),
            life: 0.45
          });
        }
        this.damageCooldown = 0.5;
        return;
      }
      if (this.type === "hole") {
        player.takeDamage(game, 1, true);
        this.damageCooldown = 0.7;
        return;
      }
      player.takeDamage(game, 1, ["water", "hotDrop", "candle"].includes(this.type));
      this.damageCooldown = 0.7;
    }

    draw(ctx, time) {
      ctx.save();
      if (this.type === "water") {
        ctx.fillStyle = "rgba(47, 140, 255, 0.72)";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 6);
        ctx.quadraticCurveTo(this.x + this.w / 2, this.y - 3 + Math.sin(time * 6) * 2, this.x + this.w - 8, this.y + 6);
        ctx.stroke();
      } else if (this.type === "mixerWind" || this.type === "wind") {
        ctx.strokeStyle = this.type === "wind" ? "rgba(255,255,255,0.8)" : "rgba(220,240,255,0.82)";
        ctx.lineWidth = 5;
        for (let i = 0; i < 5; i += 1) {
          const yy = this.y + 35 + i * 36;
          ctx.beginPath();
          ctx.moveTo(this.x + 8, yy);
          ctx.bezierCurveTo(this.x + 60, yy - 28, this.x + 110, yy + 28, this.x + this.w - 8, yy);
          ctx.stroke();
        }
        if (this.type === "mixerWind") {
          fillRound(ctx, this.x + this.w - 26, this.y + 72, 34, 100, 8, "#b7c7df");
        }
      } else if (["fallingProduct", "fallingFlour", "hotDrop"].includes(this.type)) {
        if (!this.active) {
          ctx.restore();
          return;
        }
        if (this.type === "hotDrop") {
          ctx.fillStyle = "#7a4c32";
          ctx.beginPath();
          ctx.moveTo(this.x + this.w / 2, this.y);
          ctx.quadraticCurveTo(this.x + this.w, this.y + this.h * 0.65, this.x + this.w / 2, this.y + this.h);
          ctx.quadraticCurveTo(this.x, this.y + this.h * 0.65, this.x + this.w / 2, this.y);
          ctx.fill();
        } else {
          fillRound(ctx, this.x, this.y, this.w, this.h, 7, this.type === "fallingFlour" ? "#fff3dd" : "#ff8cc6");
          ctx.fillStyle = this.type === "fallingFlour" ? "#d99646" : "#2f8cff";
          ctx.fillRect(this.x + 6, this.y + 12, this.w - 12, 10);
        }
      } else if (this.type === "steam") {
        const on = Math.sin((time + this.delay) * 3) > -0.4;
        this.active = on;
        ctx.strokeStyle = on ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.22)";
        ctx.lineWidth = 7;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.moveTo(this.x + 18 + i * 18, this.y + this.h);
          ctx.bezierCurveTo(this.x + 40 + i * 18, this.y + 112, this.x - 5 + i * 18, this.y + 60, this.x + 22 + i * 18, this.y);
          ctx.stroke();
        }
      } else if (this.type === "fallingBranch") {
        if (this.active) {
          ctx.strokeStyle = "#8b5a36";
          ctx.lineWidth = 10;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + 18);
          ctx.lineTo(this.x + this.w, this.y + 8);
          ctx.stroke();
        }
      } else if (this.type === "hole") {
        ctx.fillStyle = "rgba(32, 38, 45, 0.8)";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + 16, this.w / 2, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "candle") {
        fillRound(ctx, this.x, this.y + 14, this.w, this.h - 14, 5, "#ffffff");
        ctx.fillStyle = "#ff8cc6";
        ctx.fillRect(this.x + 6, this.y + 22, this.w - 12, 8);
        const flicker = 1 + Math.sin(time * 12 + this.x) * 0.12;
        ctx.fillStyle = "#ff4b5c";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + 8, 8 * flicker, 13 * flicker, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffd858";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + 10, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "burstBalloon") {
        const on = Math.sin((time + this.delay) * 2.8) > 0.18;
        this.active = on;
        ctx.fillStyle = on ? "#ff4b5c" : "#2f8cff";
        ctx.beginPath();
        ctx.ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (on) {
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 3;
          for (let i = 0; i < 6; i += 1) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.w / 2, this.y + this.h / 2);
            ctx.lineTo(this.x + this.w / 2 + Math.cos(a) * 48, this.y + this.h / 2 + Math.sin(a) * 48);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
  }

  class Projectile {
    constructor(data) {
      Object.assign(this, data);
      this.life = data.life ?? 4;
      this.active = true;
      this.gravity = data.gravity ?? 0;
      this.bounced = false;
    }

    update(dt) {
      if (!this.active) return;
      this.life -= dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.gravity * dt;
      if (this.life <= 0) this.active = false;
    }

    draw(ctx) {
      if (!this.active) return;
      ctx.save();
      if (this.type === "laser") {
        ctx.globalAlpha = 0.84;
        ctx.fillStyle = "#ff244c";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(this.x, this.y + this.h * 0.35, this.w, this.h * 0.3);
      } else if (this.type === "coffee") {
        ctx.fillStyle = "#7a4c32";
        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "ice") {
        fillRound(ctx, this.x, this.y, this.w, this.h, 6, "#d9f6ff");
        strokeRound(ctx, this.x + 3, this.y + 3, this.w - 6, this.h - 6, 5, "#82dfff", 2);
      } else if (this.type === "ant") {
        ctx.fillStyle = "#7a4c32";
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 12, 10, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(this.x + 26, this.y + 12, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7a4c32";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.moveTo(this.x + 12 + i * 7, this.y + 17);
          ctx.lineTo(this.x + 8 + i * 10, this.y + 24);
          ctx.stroke();
        }
      } else if (this.type === "bone") {
        ctx.fillStyle = "#fff7df";
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 8, 6, 0, Math.PI * 2);
        ctx.arc(this.x + 6, this.y + 22, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.w - 6, this.y + 8, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.w - 6, this.y + 22, 6, 0, Math.PI * 2);
        ctx.fill();
        fillRound(ctx, this.x + 5, this.y + 7, this.w - 10, 16, 7, "#fff7df");
      } else if (this.type === "sparkFirework") {
        ctx.fillStyle = "#ffd858";
        ctx.beginPath();
        ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.w = 52;
      this.h = 70;
      this.maxEnergy = 5;
      this.maxCottonTimer = 9;
      this.reset();
    }

    reset(level) {
      const start = level?.def.start || { x: 80, y: 360 };
      this.x = start.x;
      this.y = start.y;
      this.prevX = this.x;
      this.prevY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.onGround = false;
      this.facing = 1;
      this.energy = this.maxEnergy;
      this.smiles = 0;
      this.levelSmiles = 0;
      this.cottonTimer = 0;
      this.invincible = 0;
      this.hurtTimer = 0;
      this.glideMeter = 2.4;
      this.maxGlide = 2.4;
      this.abilityCooldown = 0;
      this.growTimer = 0;
      this.grainCharges = 0;
      this.speedTimer = 0;
      this.leafDash = 0;
      this.leafRide = 0;
      this.coyote = 0;
      this.respawn = { ...start };
      this.anim = 0;
    }

    get rect() {
      return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    update(dt, game) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.anim += dt;
      this.invincible = Math.max(0, this.invincible - dt);
      this.hurtTimer = Math.max(0, this.hurtTimer - dt);
      this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
      this.growTimer = Math.max(0, this.growTimer - dt);
      this.speedTimer = Math.max(0, this.speedTimer - dt);
      this.leafDash = Math.max(0, this.leafDash - dt);
      this.leafRide = Math.max(0, this.leafRide - dt);
      if (this.cottonTimer > 0) {
        this.cottonTimer = Math.max(0, this.cottonTimer - dt);
        if (Math.random() < 0.28) {
          game.spawnParticle(this.x + rand(0, this.w), this.y + rand(0, this.h), {
            color: ["#ff8cc6", "#ffffff", "#ffd858"][Math.floor(rand(0, 3))],
            vy: rand(-80, -20),
            life: 0.5,
            gravity: 120
          });
        }
      }

      const input = game.input;
      let target = 0;
      const baseSpeed = 245 + (this.speedTimer > 0 ? 115 : 0) + (this.leafDash > 0 ? 190 : 0);
      if (input.isDown("left")) target -= baseSpeed;
      if (input.isDown("right")) target += baseSpeed;
      if (target !== 0) this.facing = Math.sign(target);

      const accel = this.onGround ? 1750 : 1050;
      this.vx = lerp(this.vx, target, clamp(accel * dt / Math.max(1, Math.abs(target - this.vx)), 0, 1));
      if (!input.isDown("left") && !input.isDown("right")) {
        this.vx *= this.onGround ? 0.82 : 0.96;
      }

      if (input.consume("jump") && (this.onGround || this.coyote > 0)) {
        this.vy = -560 - (this.growTimer > 0 ? 35 : 0);
        this.onGround = false;
        this.coyote = 0;
        game.audio.playJumpSound();
        this.puff(game, "#ffffff");
      }

      if (input.consume("ability")) {
        game.useAbility();
      }

      const gliding = input.isDown("glide") && !this.onGround && this.vy > 0 && this.glideMeter > 0;
      const gravity = gliding ? 420 : GRAVITY;
      this.vy += gravity * dt;
      if (gliding) {
        this.vy = Math.min(this.vy, 145);
        this.glideMeter = Math.max(0, this.glideMeter - dt);
      }
      this.vy = Math.min(this.vy, MAX_FALL);

      if (this.onGround) {
        this.coyote = 0.09;
        this.glideMeter = Math.min(this.maxGlide, this.glideMeter + dt * 1.6);
      } else {
        this.coyote = Math.max(0, this.coyote - dt);
      }

      this.moveAndCollide(dt, game);

      if (this.y > BASE_HEIGHT + 140) {
        this.takeDamage(game, 1, true);
      }
    }

    moveAndCollide(dt, game) {
      const level = game.currentLevel;
      this.x += this.vx * dt;
      for (const platform of level.platforms) {
        if (!platform.solid || !overlap(this, platform)) continue;
        if (this.vx > 0) this.x = platform.x - this.w;
        if (this.vx < 0) this.x = platform.x + platform.w;
        this.vx = 0;
      }

      this.y += this.vy * dt;
      this.onGround = false;
      for (const platform of level.platforms) {
        if (!platform.solid || !overlap(this, platform)) continue;
        const previousBottom = this.prevY + this.h;
        if (this.vy >= 0 && previousBottom <= platform.y + 14) {
          this.y = platform.y - this.h;
          this.vy = 0;
          this.onGround = true;
          if (platform.vx) this.x += platform.vx * dt;
          if (platform.type === "conveyor") this.vx += (platform.force || 80) * 0.02;
          if (platform.type === "spoon") {
            this.vy = platform.launch || -760;
            this.onGround = false;
            game.audio.playJumpSound();
            game.screenShake = Math.max(game.screenShake, 4);
            this.puff(game, "#d9f6ff");
          }
          if (platform.type === "leaf") {
            this.leafRide = 3.5;
            this.speedTimer = Math.max(this.speedTimer, 1.1);
          }
          if (platform.type === "slippery") this.vx += this.facing * 60;
          if (platform.type === "fragile" && this.growTimer > 0) {
            platform.broken = true;
            this.vy = -330;
            this.onGround = false;
            game.screenShake = Math.max(game.screenShake, 5);
            for (let i = 0; i < 18; i += 1) {
              game.spawnParticle(platform.x + rand(0, platform.w), platform.y + rand(0, platform.h), {
                color: "#fff3dd",
                vx: rand(-130, 130),
                vy: rand(-180, 10)
              });
            }
          }
        } else if (this.vy < 0) {
          this.y = platform.y + platform.h;
          this.vy = 0;
        }
      }

      this.x = clamp(this.x, 0, level.def.width - this.w);
    }

    collect(item, game) {
      item.collected = true;
      if (item.type === "grain") {
        this.grainCharges += 1;
        this.growTimer = Math.max(this.growTimer, 5);
        game.message("Grãos extras: Alegrinho ficou mais forte!");
        for (let i = 0; i < 18; i += 1) game.spawnParticle(item.x + 14, item.y + 14, { color: "#fff2cc" });
        game.audio.playCollectSound();
        return;
      }
      this.smiles += item.value;
      this.levelSmiles += item.value;
      game.audio.playCollectSound();
      for (let i = 0; i < 10; i += 1) {
        game.spawnParticle(item.x + 14, item.y + 14, {
          color: ["#ffd858", "#ffffff", "#ff8cc6"][i % 3],
          shape: i % 2 ? "spark" : "circle"
        });
      }
      if (this.smiles >= 100) {
        this.smiles -= 100;
        this.activateCottonCape(game);
      }
    }

    activateCottonCape(game) {
      this.cottonTimer = this.maxCottonTimer;
      game.screenShake = Math.max(game.screenShake, 6);
      game.message("Capa de algodão-doce ativada!");
      for (let i = 0; i < 46; i += 1) {
        game.spawnParticle(this.x + this.w / 2, this.y + this.h / 2, {
          color: ["#ff8cc6", "#ffffff", "#ffd858"][i % 3],
          vx: Math.cos((i / 46) * Math.PI * 2) * rand(80, 220),
          vy: Math.sin((i / 46) * Math.PI * 2) * rand(80, 220),
          gravity: 30,
          life: 0.75,
          shape: i % 2 ? "spark" : "circle"
        });
      }
    }

    takeDamage(game, amount = 1, respawn = false) {
      if (this.invincible > 0) return;
      this.energy -= amount;
      this.invincible = 1.2;
      this.hurtTimer = 0.6;
      this.vy = -260;
      this.vx = -this.facing * 180;
      game.screenShake = Math.max(game.screenShake, 8);
      game.audio.playDamageSound();
      this.puff(game, "#ff4b5c");
      if (this.energy <= 0) {
        game.gameOver();
        return;
      }
      if (respawn) {
        this.x = this.respawn.x;
        this.y = this.respawn.y;
        this.vx = 0;
        this.vy = 0;
      }
    }

    puff(game, color) {
      for (let i = 0; i < 12; i += 1) {
        game.spawnParticle(this.x + this.w / 2, this.y + this.h, {
          color,
          vx: rand(-90, 90),
          vy: rand(-120, -20),
          life: 0.45,
          gravity: 380
        });
      }
    }

    draw(ctx, game) {
      const skin = SKIN_BY_ID[game.session.currentSkin];
      const hurtFlash = this.hurtTimer > 0 && Math.floor(this.hurtTimer * 18) % 2 === 0;
      const scale = this.growTimer > 0 ? 1.14 : 1;
      const run = this.onGround ? Math.sin(this.anim * 12) : 0;
      const gliding = game.input.isDown("glide") && !this.onGround && this.vy > 0;

      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-this.w / 2, -this.h / 2);

      if (this.cottonTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.58 + Math.sin(this.anim * 8) * 0.08;
        ctx.fillStyle = "#ff8cc6";
        ctx.beginPath();
        ctx.ellipse(this.w / 2, this.h / 2 + 4, 48, 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(this.w / 2 - 16, this.h / 2 - 5, 28, 24, 0, 0, Math.PI * 2);
        ctx.ellipse(this.w / 2 + 18, this.h / 2 - 4, 30, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (skin.detail === "leaf" || this.leafRide > 0) {
        ctx.fillStyle = "rgba(67, 200, 120, 0.82)";
        ctx.beginPath();
        ctx.ellipse(this.facing < 0 ? this.w + 6 : -6, 34, 22, 36, this.facing < 0 ? 0.7 : -0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      if (gliding || skin.detail === "stars") {
        ctx.strokeStyle = skin.glow;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.w / 2, this.h / 2, 46 + Math.sin(this.anim * 8) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "#26344d";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(5, 36);
      ctx.lineTo(-12, 45 + run * 3);
      ctx.moveTo(this.w - 5, 36);
      ctx.lineTo(this.w + 12, 45 - run * 3);
      ctx.stroke();

      ctx.strokeStyle = "#26344d";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(16, this.h - 5);
      ctx.lineTo(10, this.h + 12 + run * 5);
      ctx.moveTo(this.w - 16, this.h - 5);
      ctx.lineTo(this.w - 10, this.h + 12 - run * 5);
      ctx.stroke();

      fillRound(ctx, 4, 0, this.w - 8, this.h, 8, hurtFlash ? "#ffdce1" : "#ffffff");
      fillRound(ctx, 7, 12, this.w - 14, 15, 4, skin.accent);
      fillRound(ctx, 7, 43, this.w - 14, 14, 4, skin.main);
      fillRound(ctx, 10, 27, this.w - 20, 17, 4, skin.soft);
      strokeRound(ctx, 4, 0, this.w - 8, this.h, 8, skin.main, 4);

      ctx.fillStyle = skin.dark;
      ctx.beginPath();
      ctx.arc(20, 31, 5.2, 0, Math.PI * 2);
      ctx.arc(32, 31, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(21.5, 29, 1.8, 0, Math.PI * 2);
      ctx.arc(33.5, 29, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = skin.dark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (this.hurtTimer > 0) {
        ctx.arc(26, 44, 6, Math.PI + 0.15, Math.PI * 2 - 0.15);
      } else {
        ctx.arc(26, 39, 9, 0.12, Math.PI - 0.12);
      }
      ctx.stroke();

      ctx.fillStyle = skin.dark;
      ctx.font = "900 9px Trebuchet MS, Arial";
      ctx.textAlign = "center";
      ctx.fillText("ALEGRE", this.w / 2, 55);

      if (skin.detail === "chef") {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(13, -2, 9, 0, Math.PI * 2);
        ctx.arc(26, -7, 11, 0, Math.PI * 2);
        ctx.arc(39, -2, 9, 0, Math.PI * 2);
        ctx.fill();
        fillRound(ctx, 13, -2, 26, 12, 4, "#ffffff");
        ctx.fillStyle = skin.accent;
        ctx.beginPath();
        ctx.moveTo(26, 59);
        ctx.lineTo(18, 66);
        ctx.lineTo(26, 66);
        ctx.lineTo(34, 66);
        ctx.lineTo(26, 59);
        ctx.fill();
      } else if (skin.detail === "steam") {
        ctx.strokeStyle = skin.glow;
        ctx.lineWidth = 2;
        for (let i = 0; i < 2; i += 1) {
          ctx.beginPath();
          ctx.moveTo(17 + i * 16, -2);
          ctx.bezierCurveTo(7 + i * 16, -14, 27 + i * 16, -19, 19 + i * 16, -31);
          ctx.stroke();
        }
      } else if (skin.detail === "crown") {
        ctx.fillStyle = "#ffd858";
        ctx.beginPath();
        ctx.moveTo(12, -2);
        ctx.lineTo(18, -17);
        ctx.lineTo(26, -5);
        ctx.lineTo(34, -17);
        ctx.lineTo(40, -2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ff4b5c";
        ctx.beginPath();
        ctx.arc(26, -7, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (skin.detail === "stars") {
        ctx.fillStyle = skin.glow;
        for (let i = 0; i < 3; i += 1) {
          ctx.fillRect(7 + i * 15, 7 + Math.sin(this.anim * 4 + i) * 2, 5, 5);
        }
      }

      ctx.restore();
    }
  }

  class Boss {
    constructor(data) {
      Object.assign(this, data);
      this.maxHp = data.hp;
      this.hp = data.hp;
      this.active = false;
      this.defeated = false;
      this.timer = 0;
      this.attackTimer = 0;
      this.hitFlash = 0;
      this.projectiles = [];
      this.weakPoints = (data.weakPoints || []).map((point) => ({ ...point, cooldown: 0 }));
      this.puddles = (data.puddles || []).map((point) => ({ ...point }));
      this.bones = (data.bones || []).map((bone) => ({ ...bone, ready: true, cooldown: 0 }));
      this.fireworks = (data.fireworks || []).map((pad) => ({ ...pad, ready: true, cooldown: 0 }));
      this.handY = data.y;
    }

    update(dt, game) {
      if (this.defeated) return;
      if (!this.active && game.player.x > this.arenaStart) {
        this.active = true;
        game.message(`${this.name} apareceu!`);
        game.screenShake = Math.max(game.screenShake, 4);
      }
      if (!this.active) return;
      this.timer += dt;
      this.attackTimer += dt;
      this.hitFlash = Math.max(0, this.hitFlash - dt);
      this.projectiles.forEach((projectile) => projectile.update(dt));
      this.projectiles = this.projectiles.filter((projectile) => projectile.active);

      if (this.type === "scanner") this.updateScanner(dt, game);
      if (this.type === "antQueen") this.updateAntQueen(dt, game);
      if (this.type === "teapot") this.updateTeapot(dt, game);
      if (this.type === "dog") this.updateDog(dt, game);
      if (this.type === "hand") this.updateHand(dt, game);

      this.projectiles.forEach((projectile) => this.handleProjectileCollision(projectile, game));
    }

    updateScanner(dt, game) {
      this.weakPoints.forEach((point) => {
        point.cooldown = Math.max(0, point.cooldown - dt);
        if (point.cooldown === 0 && game.player.vy > 0 && overlap(game.player, point)) {
          point.cooldown = 1.1;
          game.player.vy = -430;
          this.hit(game, 1);
        }
      });
      if (this.attackTimer > 1.7) {
        this.attackTimer = 0;
        const horizontal = Math.floor(this.timer) % 2 === 0;
        this.projectiles.push(new Projectile({
          type: "laser",
          x: horizontal ? this.arenaStart + 20 : this.x + 42,
          y: horizontal ? 322 + Math.sin(this.timer * 2) * 72 : 150,
          w: horizontal ? 760 : 18,
          h: horizontal ? 15 : 310,
          vx: 0,
          vy: 0,
          life: 0.78
        }));
      }
    }

    updateAntQueen(dt, game) {
      if (this.attackTimer > 1.2) {
        this.attackTimer = 0;
        const fromLeft = Math.random() > 0.5;
        this.projectiles.push(new Projectile({
          type: "ant",
          x: fromLeft ? this.arenaStart + 20 : this.x + this.w - 20,
          y: 428,
          w: 42,
          h: 30,
          vx: fromLeft ? 125 : -125,
          vy: 0,
          life: 5
        }));
      }
      for (const projectile of this.projectiles) {
        if (projectile.type !== "ant" || !projectile.active) continue;
        for (const puddle of this.puddles) {
          if (overlap(projectile, puddle)) {
            projectile.active = false;
            this.hit(game, 1);
            for (let i = 0; i < 10; i += 1) game.spawnParticle(projectile.x, projectile.y, { color: "#8ad7ff" });
            break;
          }
        }
      }
    }

    updateTeapot(dt, game) {
      if (this.attackTimer > 1.05) {
        this.attackTimer = 0;
        this.projectiles.push(new Projectile({
          type: "coffee",
          x: this.x - 8,
          y: this.y + 78,
          w: 24,
          h: 24,
          vx: -250,
          vy: rand(-80, 60),
          gravity: 180,
          life: 4
        }));
      }
      const iceCount = this.projectiles.filter((projectile) => projectile.type === "ice" && projectile.active).length;
      if (iceCount < 2 && Math.floor(this.timer * 10) % 27 === 0) {
        this.projectiles.push(new Projectile({
          type: "ice",
          x: this.arenaStart + 70,
          y: 422,
          w: 34,
          h: 34,
          vx: 0,
          vy: 0,
          gravity: 0,
          life: 7
        }));
      }
      for (const projectile of this.projectiles) {
        if (projectile.type !== "ice" || !projectile.active) continue;
        if (overlap(projectile, game.player) && game.input.isDown("ability")) {
          projectile.vx = 520;
          projectile.vy = -70;
          projectile.bounced = true;
          game.audio.playJumpSound();
        }
        if (projectile.bounced && overlap(projectile, this)) {
          projectile.active = false;
          this.hit(game, 1);
        }
      }
    }

    updateDog(dt, game) {
      this.x = 3380 + Math.sin(this.timer * 1.4) * 52;
      this.bones.forEach((bone) => {
        if (!bone.ready) {
          bone.cooldown -= dt;
          if (bone.cooldown <= 0) bone.ready = true;
        }
      });
      if (this.attackTimer > 1.9) {
        this.attackTimer = 0;
        this.projectiles.push(new Projectile({
          type: "bone",
          x: this.x - 20,
          y: 392,
          w: 40,
          h: 28,
          vx: -230,
          vy: -80,
          gravity: 320,
          life: 2.4
        }));
      }
    }

    updateHand(dt, game) {
      this.x = clamp(game.player.x + 95 + Math.sin(this.timer * 2) * 85, this.arenaStart + 120, this.arenaStart + 570);
      this.handY = this.y + Math.max(0, Math.sin(this.timer * 2.3)) * 115;
      this.fireworks.forEach((pad) => {
        if (!pad.ready) {
          pad.cooldown -= dt;
          if (pad.cooldown <= 0) pad.ready = true;
        }
      });
      const danger = { x: this.x + 28, y: this.handY + 82, w: this.w - 50, h: 130 };
      if (Math.sin(this.timer * 2.3) > 0.55 && overlap(game.player, danger)) {
        game.player.takeDamage(game, 1, false);
      }
      if (this.attackTimer > 2.4) {
        this.attackTimer = 0;
        game.screenShake = Math.max(game.screenShake, 7);
      }
    }

    handleProjectileCollision(projectile, game) {
      if (!projectile.active) return;
      if (projectile.type === "ice" || projectile.type === "sparkFirework") return;
      if (overlap(projectile, game.player)) {
        projectile.active = false;
        game.player.takeDamage(game, 1, false);
      }
    }

    onAbility(game) {
      if (!this.active || this.defeated) return false;
      const player = game.player;
      if (this.type === "teapot") {
        let hit = false;
        for (const projectile of this.projectiles) {
          if (projectile.type === "ice" && projectile.active) {
            const dx = Math.abs(centerOf(projectile).x - centerOf(player).x);
            const dy = Math.abs(centerOf(projectile).y - centerOf(player).y);
            if (dx < 95 && dy < 80) {
              projectile.vx = 560;
              projectile.vy = -90;
              projectile.bounced = true;
              hit = true;
            }
          }
        }
        if (hit) {
          game.audio.playJumpSound();
          player.abilityCooldown = 0.35;
          return true;
        }
      }
      if (this.type === "dog") {
        for (const bone of this.bones) {
          if (bone.ready && Math.abs(player.x - bone.x) < 78 && Math.abs(player.y - bone.y) < 90) {
            bone.ready = false;
            bone.cooldown = 2.4;
            this.hit(game, 1);
            player.abilityCooldown = 0.55;
            for (let i = 0; i < 16; i += 1) game.spawnParticle(bone.x + 20, bone.y + 10, { color: "#fff7df" });
            return true;
          }
        }
      }
      if (this.type === "hand") {
        for (const pad of this.fireworks) {
          if (pad.ready && Math.abs(player.x - pad.x) < 82 && Math.abs(player.y - pad.y) < 100) {
            pad.ready = false;
            pad.cooldown = 2.6;
            this.projectiles.push(new Projectile({
              type: "sparkFirework",
              x: pad.x + 10,
              y: pad.y - 10,
              w: 22,
              h: 22,
              vx: 190,
              vy: -390,
              gravity: 180,
              life: 1.25
            }));
            this.hit(game, 1);
            player.abilityCooldown = 0.55;
            for (let i = 0; i < 26; i += 1) {
              game.spawnParticle(pad.x + 20, pad.y, {
                color: ["#ffd858", "#ff8cc6", "#ffffff"][i % 3],
                vx: rand(-120, 120),
                vy: rand(-260, -70),
                life: 0.75,
                shape: "spark"
              });
            }
            return true;
          }
        }
      }
      return false;
    }

    hit(game, amount = 1) {
      if (this.hitFlash > 0.12) return;
      this.hp = Math.max(0, this.hp - amount);
      this.hitFlash = 0.26;
      game.screenShake = Math.max(game.screenShake, 7);
      game.audio.playBossHitSound();
      for (let i = 0; i < 22; i += 1) {
        game.spawnParticle(this.x + this.w / 2, this.y + this.h / 2, {
          color: ["#ffd858", "#ffffff", "#ff4b5c"][i % 3],
          vx: rand(-180, 180),
          vy: rand(-180, 80),
          life: 0.65,
          shape: i % 2 ? "spark" : "circle"
        });
      }
      if (this.hp <= 0) {
        this.defeated = true;
        this.active = false;
        this.projectiles = [];
        game.message(`${this.name} foi vencido com alegria!`);
        game.audio.playVictorySound();
        for (let i = 0; i < 70; i += 1) {
          game.spawnParticle(this.x + rand(0, this.w), this.y + rand(0, this.h), {
            color: ["#ffd858", "#ff8cc6", "#43c878", "#ffffff"][i % 4],
            vx: rand(-260, 260),
            vy: rand(-360, -40),
            gravity: 240,
            life: rand(0.7, 1.3),
            shape: i % 3 ? "circle" : "spark"
          });
        }
      }
    }

    draw(ctx, time) {
      if (this.defeated) return;
      ctx.save();
      if (this.hitFlash > 0) ctx.globalAlpha = Math.floor(this.hitFlash * 30) % 2 ? 0.6 : 1;
      if (this.type === "scanner") this.drawScanner(ctx, time);
      if (this.type === "antQueen") this.drawAntQueen(ctx, time);
      if (this.type === "teapot") this.drawTeapot(ctx, time);
      if (this.type === "dog") this.drawDog(ctx, time);
      if (this.type === "hand") this.drawHand(ctx, time);
      ctx.restore();
      this.drawWeakItems(ctx, time);
      this.projectiles.forEach((projectile) => projectile.draw(ctx));
    }

    drawScanner(ctx, time) {
      fillRound(ctx, this.x, this.y, this.w, this.h, 8, "#e5edff");
      strokeRound(ctx, this.x, this.y, this.w, this.h, 8, "#26344d", 4);
      fillRound(ctx, this.x + 22, this.y + 26, this.w - 44, 76, 8, "#26344d");
      ctx.fillStyle = "#ff244c";
      ctx.fillRect(this.x + 36, this.y + 56 + Math.sin(time * 5) * 20, this.w - 72, 8);
      ctx.fillStyle = "#2f8cff";
      for (let i = 0; i < 8; i += 1) {
        ctx.fillRect(this.x + 42 + i * 20, this.y + 120, 9, 28);
      }
    }

    drawAntQueen(ctx, time) {
      ctx.fillStyle = "#7a4c32";
      ctx.beginPath();
      ctx.ellipse(this.x + 50, this.y + 70, 48, 38, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x + 110, this.y + 70, 58, 44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd858";
      ctx.beginPath();
      ctx.moveTo(this.x + 62, this.y + 22);
      ctx.lineTo(this.x + 72, this.y + 4);
      ctx.lineTo(this.x + 84, this.y + 22);
      ctx.lineTo(this.x + 96, this.y + 4);
      ctx.lineTo(this.x + 106, this.y + 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.x + 40, this.y + 60, 8, 0, Math.PI * 2);
      ctx.arc(this.x + 72, this.y + 60, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#26344d";
      ctx.beginPath();
      ctx.arc(this.x + 42, this.y + 61, 3, 0, Math.PI * 2);
      ctx.arc(this.x + 74, this.y + 61, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#26344d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x + 57, this.y + 75, 9, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    drawTeapot(ctx, time) {
      const shine = this.hitFlash > 0 ? "#ffffff" : "#d8e3f0";
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.ellipse(this.x + 82, this.y + 86, 75, 58, 0, 0, Math.PI * 2);
      ctx.fill();
      strokeRound(ctx, this.x + 22, this.y + 36, 150, 98, 40, "#8aa0be", 4);
      ctx.fillStyle = "#d8e3f0";
      ctx.beginPath();
      ctx.moveTo(this.x + 145, this.y + 66);
      ctx.quadraticCurveTo(this.x + 218, this.y + 50, this.x + 178, this.y + 102);
      ctx.lineTo(this.x + 146, this.y + 94);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#8aa0be";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(this.x + 36, this.y + 85, 34, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      ctx.fillStyle = "#ffd858";
      ctx.beginPath();
      ctx.arc(this.x + 82, this.y + 28, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(this.x + 58 + i * 24, this.y + 26);
        ctx.bezierCurveTo(this.x + 40 + i * 24, this.y - 14, this.x + 86 + i * 14, this.y - 28, this.x + 64 + i * 24, this.y - 58);
        ctx.stroke();
      }
    }

    drawDog(ctx, time) {
      ctx.fillStyle = "#d8944d";
      ctx.beginPath();
      ctx.ellipse(this.x + 105, this.y + 72, 88, 54, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#bf7434";
      ctx.beginPath();
      ctx.ellipse(this.x + 54, this.y + 42, 34, 36, 0, 0, Math.PI * 2);
      ctx.ellipse(this.x + 78, this.y + 36, 20, 34, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d8944d";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(this.x + 182, this.y + 62);
      ctx.quadraticCurveTo(this.x + 218, this.y + 38 + Math.sin(time * 10) * 8, this.x + 198, this.y + 20);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(this.x + 44, this.y + 38, 7, 0, Math.PI * 2);
      ctx.arc(this.x + 65, this.y + 38, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#26344d";
      ctx.beginPath();
      ctx.arc(this.x + 46, this.y + 39, 3, 0, Math.PI * 2);
      ctx.arc(this.x + 67, this.y + 39, 3, 0, Math.PI * 2);
      ctx.arc(this.x + 55, this.y + 54, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#26344d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x + 56, this.y + 61, 12, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    drawHand(ctx, time) {
      const y = this.handY;
      ctx.fillStyle = "#f2b38d";
      fillRound(ctx, this.x + 42, y + 88, 126, 132, 32, "#f2b38d");
      for (let i = 0; i < 5; i += 1) {
        fillRound(ctx, this.x + 22 + i * 32, y + 32 + Math.sin(time * 4 + i) * 7, 28, 92, 14, "#f2b38d");
      }
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      for (let i = 0; i < 5; i += 1) {
        fillRound(ctx, this.x + 28 + i * 32, y + 42 + Math.sin(time * 4 + i) * 7, 14, 12, 6, "#ffd0b2");
      }
      ctx.fillStyle = "#ff8cc6";
      ctx.beginPath();
      ctx.arc(this.x + 106, y + 145, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    drawWeakItems(ctx, time) {
      if (!this.active && this.type !== "scanner") return;
      if (this.type === "scanner") {
        this.weakPoints.forEach((point, i) => {
          fillRound(ctx, point.x, point.y, point.w, point.h, 7, point.cooldown > 0 ? "#8996aa" : ["#ffd858", "#43c878", "#2f8cff"][i % 3]);
          ctx.fillStyle = "#26344d";
          ctx.font = "900 14px Trebuchet MS, Arial";
          ctx.textAlign = "center";
          ctx.fillText("BOTÃO", point.x + point.w / 2, point.y + 19);
        });
      }
      if (this.type === "antQueen") {
        this.puddles.forEach((puddle) => {
          ctx.fillStyle = "rgba(47, 140, 255, 0.78)";
          ctx.beginPath();
          ctx.ellipse(puddle.x + puddle.w / 2, puddle.y + 7, puddle.w / 2, 10 + Math.sin(time * 5) * 1, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      if (this.type === "dog") {
        this.bones.forEach((bone) => {
          ctx.globalAlpha = bone.ready ? 1 : 0.35;
          new Projectile({ type: "bone", x: bone.x, y: bone.y, w: bone.w, h: bone.h, vx: 0, vy: 0, life: 1 }).draw(ctx);
          ctx.globalAlpha = 1;
        });
      }
      if (this.type === "hand") {
        this.fireworks.forEach((pad) => {
          fillRound(ctx, pad.x, pad.y, pad.w, pad.h, 7, pad.ready ? "#ffd858" : "#8996aa");
          ctx.fillStyle = "#ff4b5c";
          ctx.beginPath();
          ctx.moveTo(pad.x + pad.w / 2, pad.y + 5);
          ctx.lineTo(pad.x + pad.w - 8, pad.y + 24);
          ctx.lineTo(pad.x + 8, pad.y + 24);
          ctx.closePath();
          ctx.fill();
        });
      }
    }
  }

  class Level {
    constructor(def) {
      this.def = def;
      this.platforms = def.platforms.map((platform) => new Platform(platform));
      this.collectibles = def.collectibles.map((item) => new Collectible(item));
      this.enemies = def.enemies.map((enemy) => new Enemy(enemy));
      this.hazards = def.hazards.map((hazard) => new Hazard(hazard));
      this.checkpoint = new Checkpoint(def.checkpoint);
      this.boss = new Boss(def.boss);
      this.finish = { ...def.finish };
      this.message = "";
      this.messageTimer = 0;
    }

    update(dt, game) {
      this.platforms.forEach((platform) => platform.update(dt));
      this.collectibles.forEach((collectible) => collectible.update(dt));
      this.enemies.forEach((enemy) => enemy.update(dt, game));
      this.hazards.forEach((hazard) => hazard.update(dt, game));
      this.boss.update(dt, game);
      if (this.messageTimer > 0) this.messageTimer -= dt;
    }

    draw(ctx, game) {
      const time = game.time;
      drawBackground(ctx, this.def, game.cameraX, time);
      ctx.save();
      ctx.translate(-game.cameraX, 0);

      this.drawFinish(ctx, time);
      this.checkpoint.draw(ctx, time);
      this.platforms.forEach((platform) => platform.draw(ctx, time));
      this.hazards.forEach((hazard) => hazard.draw(ctx, time));
      this.collectibles.forEach((collectible) => collectible.draw(ctx));
      this.enemies.forEach((enemy) => enemy.draw(ctx, time));
      this.boss.draw(ctx, time);
      game.player.draw(ctx, game);
      game.particles.forEach((particle) => particle.draw(ctx));
      ctx.restore();

      if (this.messageTimer > 0) {
        ctx.save();
        ctx.globalAlpha = clamp(this.messageTimer, 0, 1);
        fillRound(ctx, BASE_WIDTH / 2 - 225, 96, 450, 48, 8, "rgba(255,255,255,0.86)");
        ctx.fillStyle = "#243a86";
        ctx.font = "900 17px Trebuchet MS, Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.message, BASE_WIDTH / 2, 126);
        ctx.restore();
      }
    }

    drawFinish(ctx, time) {
      const available = this.boss.defeated;
      ctx.save();
      ctx.globalAlpha = available ? 1 : 0.32;
      ctx.translate(this.finish.x, this.finish.y);
      fillRound(ctx, 16, 0, 16, this.finish.h, 7, "#ffffff");
      ctx.fillStyle = available ? "#43c878" : "#8996aa";
      ctx.beginPath();
      ctx.moveTo(30, 4);
      ctx.quadraticCurveTo(80, 18 + Math.sin(time * 4) * 4, 30, 50);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffd858";
      ctx.beginPath();
      ctx.arc(24, this.finish.h, 15, 0, Math.PI * 2);
      ctx.fill();
      if (available) {
        ctx.strokeStyle = "rgba(255,216,88,0.8)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(38, 48, 44 + Math.sin(time * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  class Game {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.audio = new AudioManager();
      this.input = new InputManager();
      this.ui = new UIManager(this);
      this.session = {
        unlockedLevel: 1,
        unlockedSkins: new Set(["classic"]),
        currentSkin: "classic",
        completed: new Map()
      };
      this.currentLevel = null;
      this.player = new Player(this);
      this.particles = [];
      this.cameraX = 0;
      this.time = 0;
      this.dt = 0;
      this.state = "menu";
      this.screenShake = 0;
      this.last = performance.now();
      this.scaleX = 1;
      this.scaleY = 1;
      this.dpr = 1;
      this.resize();
      window.addEventListener("resize", () => this.resize());
      requestAnimationFrame((now) => this.loop(now));
    }

    resetSession() {
      this.session.unlockedLevel = 1;
      this.session.unlockedSkins = new Set(["classic"]);
      this.session.currentSkin = "classic";
      this.session.completed = new Map();
    }

    setSkin(id) {
      if (!this.session.unlockedSkins.has(id)) return;
      this.session.currentSkin = id;
      if (this.player) this.player.game = this;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
      this.scaleX = rect.width / BASE_WIDTH;
      this.scaleY = rect.height / BASE_HEIGHT;
    }

    startLevel(levelId) {
      const def = LEVELS[levelId - 1];
      if (!def || levelId > this.session.unlockedLevel) return;
      this.ui.transition(`Fase ${levelId}: ${def.subtitle}`, () => {
        this.currentLevel = new Level(def);
        this.player.reset(this.currentLevel);
        this.particles = [];
        this.cameraX = 0;
        this.state = "playing";
        this.ui.show("game");
        this.resize();
        this.ui.hideOverlays();
        this.message(def.title);
      });
    }

    restartLevel() {
      if (!this.currentLevel) return;
      const id = this.currentLevel.def.id;
      this.ui.hideOverlays();
      this.startLevel(id);
    }

    exitToLevels() {
      this.state = "menu";
      this.ui.hideOverlays();
      this.ui.showLevels();
    }

    pause() {
      if (this.state !== "playing") return;
      this.state = "paused";
      this.ui.showPause();
    }

    resume() {
      if (this.state !== "paused") return;
      this.state = "playing";
      this.ui.hidePause();
    }

    gameOver() {
      if (this.state !== "playing") return;
      this.state = "gameOver";
      this.ui.showGameOver();
    }

    completeLevel() {
      const levelId = this.currentLevel.def.id;
      if (this.state !== "playing") return;
      this.state = "complete";
      const skinId = this.currentLevel.def.unlockSkin;
      this.session.unlockedSkins.add(skinId);
      this.session.unlockedLevel = Math.max(this.session.unlockedLevel, Math.min(LEVELS.length, levelId + 1));
      const stars = 1
        + (this.player.energy >= 4 ? 1 : 0)
        + (this.player.levelSmiles >= this.currentLevel.def.starGoal ? 1 : 0);
      this.session.completed.set(levelId, { stars, smiles: this.player.levelSmiles });
      this.audio.playVictorySound();
      if (levelId === LEVELS.length) {
        this.ui.transition("A grande festa ficou pronta!", () => this.ui.showFinal());
        return;
      }
      this.ui.showLevelComplete({
        levelId,
        stars,
        smiles: this.player.levelSmiles,
        skin: skinId
      });
    }

    message(text) {
      if (!this.currentLevel) return;
      this.currentLevel.message = text;
      this.currentLevel.messageTimer = 2.4;
    }

    useAbility() {
      const player = this.player;
      if (player.abilityCooldown > 0 || !this.currentLevel) return;
      const bossHandled = this.currentLevel.boss.onAbility(this);
      if (bossHandled) return;
      const levelId = this.currentLevel.def.id;
      if (levelId === 1) {
        if (!player.onGround) {
          player.vy = Math.min(player.vy, -130);
          player.glideMeter = Math.min(player.maxGlide, player.glideMeter + 0.9);
          player.abilityCooldown = 1.8;
          player.puff(this, "#d9f6ff");
          this.message("Planar ficou mais leve!");
        }
      } else if (levelId === 2) {
        if (player.grainCharges > 0) {
          player.grainCharges -= 1;
          player.speedTimer = 3.2;
          player.abilityCooldown = 1.2;
          player.puff(this, "#fff2cc");
          this.message("Açúcar solto: corrida mais rápida!");
        } else {
          this.message("Colete grãos extras para usar a habilidade.");
          player.abilityCooldown = 0.4;
        }
      } else if (levelId === 3) {
        player.abilityCooldown = 0.4;
        this.message("Use perto de um cubo de gelo contra o Bule!");
      } else if (levelId === 4) {
        player.leafDash = 0.75;
        player.speedTimer = Math.max(player.speedTimer, 1.4);
        player.vx = player.facing * 620;
        player.abilityCooldown = 1.4;
        player.puff(this, "#9ff29e");
        this.message("Deslize de folha ativado!");
      } else if (levelId === 5) {
        player.abilityCooldown = 0.4;
        this.message("Use nos foguetes de açúcar contra a mão!");
      }
    }

    spawnParticle(x, y, options) {
      this.particles.push(new Particle(x, y, options));
      if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
    }

    update(dt) {
      if (this.input.consume("pause")) {
        if (this.state === "playing") this.pause();
        else if (this.state === "paused") this.resume();
      }
      if (this.state !== "playing" || !this.currentLevel) {
        this.input.endFrame();
        return;
      }

      this.dt = dt;
      this.time += dt;
      this.currentLevel.update(dt, this);
      this.player.update(dt, this);

      for (const collectible of this.currentLevel.collectibles) {
        if (!collectible.collected && overlap(this.player, collectible)) {
          this.player.collect(collectible, this);
        }
      }

      const checkpoint = this.currentLevel.checkpoint;
      if (!checkpoint.activated && overlap(this.player, checkpoint)) {
        checkpoint.activated = true;
        this.player.respawn = { x: checkpoint.x, y: checkpoint.y - 20 };
        this.message("Checkpoint doce ativado!");
        this.audio.playCollectSound();
      }

      for (const enemy of this.currentLevel.enemies) {
        if (!enemy.alive || !overlap(this.player, enemy)) continue;
        const previousBottom = this.player.prevY + this.player.h;
        if (this.player.vy > 0 && previousBottom <= enemy.y + 18) {
          enemy.stomp(this);
        } else {
          this.player.takeDamage(this, 1, false);
        }
      }

      for (const hazard of this.currentLevel.hazards) {
        hazard.apply(this);
      }

      const finish = this.currentLevel.finish;
      if (this.currentLevel.boss.defeated && overlap(this.player, finish)) {
        this.completeLevel();
      }

      this.particles.forEach((particle) => particle.update(dt));
      this.particles = this.particles.filter((particle) => particle.life > 0);
      this.screenShake = Math.max(0, this.screenShake - dt * 18);
      this.cameraX = clamp(this.player.x + this.player.w / 2 - BASE_WIDTH * 0.45, 0, this.currentLevel.def.width - BASE_WIDTH);
      this.ui.updateHud(this);
      this.input.endFrame();
    }

    render() {
      const ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(this.scaleX * this.dpr, 0, 0, this.scaleY * this.dpr, 0, 0);

      if (!this.currentLevel) {
        ctx.fillStyle = "#83cffb";
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
        return;
      }

      ctx.save();
      if (this.screenShake > 0) {
        ctx.translate(rand(-this.screenShake, this.screenShake), rand(-this.screenShake, this.screenShake));
      }
      this.currentLevel.draw(ctx, this);
      ctx.restore();
    }

    loop(now) {
      const dt = clamp((now - this.last) / 1000, 0, 0.033);
      this.last = now;
      this.update(dt);
      this.render();
      requestAnimationFrame((time) => this.loop(time));
    }
  }

  function drawBackground(ctx, def, cameraX, time) {
    const p = def.palette;
    const sky = ctx.createLinearGradient(0, 0, 0, BASE_HEIGHT);
    sky.addColorStop(0, p.skyTop);
    sky.addColorStop(0.65, p.skyBottom);
    sky.addColorStop(1, "#ffffff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    if (def.id === 1) drawSupermarket(ctx, def, cameraX, time);
    if (def.id === 2) drawBakery(ctx, def, cameraX, time);
    if (def.id === 3) drawCoffee(ctx, def, cameraX, time);
    if (def.id === 4) drawBackyard(ctx, def, cameraX, time);
    if (def.id === 5) drawParty(ctx, def, cameraX, time);
  }

  function parallaxX(worldX, cameraX, factor) {
    return worldX - cameraX * factor;
  }

  function drawSupermarket(ctx, def, cameraX, time) {
    ctx.save();
    for (let i = -1; i < 9; i += 1) {
      const x = parallaxX(i * 250, cameraX, 0.28) % 2300;
      fillRound(ctx, x, 80, 190, 270, 8, "rgba(255,255,255,0.18)");
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(x + 12, 128, 166, 7);
      ctx.fillRect(x + 12, 202, 166, 7);
      ctx.fillRect(x + 12, 276, 166, 7);
      const colors = ["#ff4b5c", "#ffd858", "#43c878", "#2f8cff"];
      for (let j = 0; j < 12; j += 1) {
        ctx.fillStyle = colors[(i + j + 20) % colors.length];
        fillRound(ctx, x + 20 + (j % 4) * 38, 142 + Math.floor(j / 4) * 74, 24, 42, 4, ctx.fillStyle);
      }
    }
    ctx.fillStyle = "rgba(255,216,88,0.22)";
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      ctx.ellipse(80 + i * 140 + Math.sin(time + i) * 8, 34, 45, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBakery(ctx, def, cameraX, time) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    for (let i = -1; i < 7; i += 1) {
      const x = parallaxX(i * 320, cameraX, 0.22);
      fillRound(ctx, x, 72, 200, 170, 8, "#d99646");
      fillRound(ctx, x + 24, 106, 152, 82, 8, "#26344d");
      ctx.fillStyle = "rgba(255,216,88,0.35)";
      ctx.beginPath();
      ctx.arc(x + 100, 147, 38 + Math.sin(time * 3 + i) * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 7; i += 1) {
      const x = parallaxX(90 + i * 170, cameraX, 0.45);
      ctx.beginPath();
      ctx.moveTo(x, 310);
      ctx.bezierCurveTo(x + 30, 260, x - 25, 210, x + 20, 170);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCoffee(ctx, def, cameraX, time) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    for (let i = -1; i < 8; i += 1) {
      const x = parallaxX(i * 270, cameraX, 0.24);
      ctx.beginPath();
      ctx.ellipse(x + 95, 245, 84, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      fillRound(ctx, x + 32, 175, 128, 86, 8, i % 2 ? "#2f8cff" : "#ff8cc6");
      ctx.strokeStyle = "rgba(255,255,255,0.78)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(x + 158, 215, 28, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 4;
      for (let j = 0; j < 2; j += 1) {
        ctx.beginPath();
        ctx.moveTo(x + 70 + j * 34, 170);
        ctx.bezierCurveTo(x + 54 + j * 34, 130, x + 98 + j * 34, 118, x + 78 + j * 34, 82);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(122,76,50,0.22)";
    ctx.fillRect(0, 452, BASE_WIDTH, 88);
    ctx.restore();
  }

  function drawBackyard(ctx, def, cameraX, time) {
    ctx.save();
    ctx.fillStyle = "rgba(255,216,88,0.85)";
    ctx.beginPath();
    ctx.arc(810, 86, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(67,200,120,0.28)";
    for (let i = -1; i < 8; i += 1) {
      const x = parallaxX(i * 260, cameraX, 0.18);
      ctx.beginPath();
      ctx.moveTo(x, 380);
      ctx.quadraticCurveTo(x + 90, 250, x + 190, 380);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = -1; i < 10; i += 1) {
      const x = parallaxX(i * 150, cameraX, 0.42);
      ctx.strokeStyle = "#8b5a36";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x + 55, 385);
      ctx.lineTo(x + 55, 275);
      ctx.stroke();
      ctx.fillStyle = i % 2 ? "#43c878" : "#2f9b63";
      ctx.beginPath();
      ctx.ellipse(x + 55, 250 + Math.sin(time + i) * 4, 58, 48, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawParty(ctx, def, cameraX, time) {
    ctx.save();
    const colors = ["#ff4b5c", "#ffd858", "#43c878", "#2f8cff", "#8b55ff"];
    for (let i = -2; i < 12; i += 1) {
      const x = parallaxX(i * 118, cameraX, 0.26);
      ctx.fillStyle = colors[(i + 20) % colors.length];
      ctx.beginPath();
      ctx.ellipse(x, 95 + Math.sin(time * 2 + i) * 8, 22, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(38,52,77,0.24)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 125);
      ctx.quadraticCurveTo(x - 12, 190, x + 8, 250);
      ctx.stroke();
    }
    for (let i = -1; i < 7; i += 1) {
      const x = parallaxX(i * 330, cameraX, 0.18);
      fillRound(ctx, x + 22, 245, 260, 74, 8, i % 2 ? "#ff8cc6" : "#ffd858");
      ctx.fillStyle = "#ffffff";
      for (let j = 0; j < 8; j += 1) {
        ctx.beginPath();
        ctx.arc(x + 48 + j * 28, 256, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function bootAlegrinho() {
    window.alegrinhoGame = new Game();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", bootAlegrinho, { once: true });
  } else {
    bootAlegrinho();
  }
})();

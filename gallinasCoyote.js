// ⚙️ Configuración inicial
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");

const boardSize = 400;
const cellSize = 100;
//sonido al devorar 
const sonidoMordida = new Audio('mordida.mp3');
// Generar nodos
const nodos = [];
for (let y = 0; y <= boardSize; y += cellSize) {
  for (let x = 0; x <= boardSize; x += cellSize) {
    nodos.push({ x, y });
  }
}

// 🦊 Estado inicial
let coyote = { x: 200, y: 200, size: 10 };
let gallinas = [
  { x: 400, y: 0 }, { x: 400, y: 100 }, { x: 400, y: 200 },
  { x: 400, y: 300 }, { x: 400, y: 400 }, { x: 300, y: 0 },
  { x: 300, y: 100 }, { x: 300, y: 200 }, { x: 300, y: 300 },
  { x: 300, y: 400 }, { x: 200, y: 0 }, { x: 200, y: 400 }
];
let gallinaSeleccionada = 0;

// 🔗 Conexiones visuales (diagonales que sí están dibujadas)
const diagonalesPermitidas = [
  ["200,0", "100,100"], ["200,0", "300,100"],
  ["100,100", "200,200"], ["300,100", "200,200"],
  ["100,300", "200,200"], ["300,300", "200,200"],
  ["200,400", "100,300"], ["200,400", "300,300"],
  ["0,0", "200,200"], ["400,0", "200,200"],
  ["0,400", "200,200"], ["400,400", "200,200"],
  ["100,0", "200,100"], ["300,0", "200,100"],
  ["100,400", "200,300"], ["300,400", "200,300"]
];

// ✅ Utilidades
function esNodoValido(x, y) {
  return nodos.some(n => n.x === x && n.y === y);
}

function estaLibre(x, y) {
  return !gallinas.some(g => g.x === x && g.y === y) &&
         !(coyote.x === x && coyote.y === y);
}

function hayConexionVisual(x1, y1, x2, y2) {
  const desde = `${x1},${y1}`;
  const hacia = `${x2},${y2}`;
  return diagonalesPermitidas.some(([a, b]) =>
    (a === desde && b === hacia) || (a === hacia && b === desde)
  );
}

// 🎨 Dibujo
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";

  for (let i = 0; i <= boardSize; i += cellSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(boardSize, i);
    ctx.stroke();
  }

  // Rombo
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(400, 200);
  ctx.lineTo(200, 400);
  ctx.lineTo(0, 200);
  ctx.closePath();
  ctx.stroke();

  // Cruz
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 400);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.lineTo(400, 0);
  ctx.stroke();
}

function drawCoyote() {
  ctx.beginPath();
  ctx.arc(coyote.x, coyote.y, coyote.size, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
}

function drawGallinas() {
  gallinas.forEach((g, index) => {
    ctx.beginPath();
    ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = index === gallinaSeleccionada ? "green" : "orange";
    ctx.fill();
  });
}

function updateGame() {
  drawBoard();
  drawCoyote();
  drawGallinas();
}

// 🧠 Movimiento normal
function moverCoyote(dx, dy) {
  const newX = coyote.x + dx * cellSize;
  const newY = coyote.y + dy * cellSize;
  const esDiagonal = dx !== 0 && dy !== 0;

  if (
    esNodoValido(newX, newY) &&
    estaLibre(newX, newY) &&
    (!esDiagonal || hayConexionVisual(coyote.x, coyote.y, newX, newY))
  ) {
    coyote.x = newX;
    coyote.y = newY;
    updateGame();
  }
}

function moverGallina(dx, dy) {
  const gallina = gallinas[gallinaSeleccionada];
  const newX = gallina.x + dx * cellSize;
  const newY = gallina.y + dy * cellSize;
  const esDiagonal = dx !== 0 && dy !== 0;

  if (
    esNodoValido(newX, newY) &&
    estaLibre(newX, newY) &&
    (!esDiagonal || hayConexionVisual(gallina.x, gallina.y, newX, newY))
  ) {
    gallina.x = newX;
    gallina.y = newY;
    updateGame();
  }
}

function cambiarGallina() {
  gallinaSeleccionada = (gallinaSeleccionada + 1) % gallinas.length;
  updateGame();
}

// 🦊 Captura
function intentaCapturaCoyote(dx, dy) {
  const midX = coyote.x + dx * cellSize;
  const midY = coyote.y + dy * cellSize;
  const destX = coyote.x + dx * cellSize * 2;
  const destY = coyote.y + dy * cellSize * 2;

  const gallinaEnMedio = gallinas.find(g => g.x === midX && g.y === midY);
  const diagonal = dx !== 0 && dy !== 0;
  const conexionVisual = !diagonal || hayConexionVisual(coyote.x, coyote.y, destX, destY);

  if (
    gallinaEnMedio &&
    esNodoValido(destX, destY) &&
    estaLibre(destX, destY) &&
    conexionVisual
  ) {
    gallinas = gallinas.filter(g => !(g.x === midX && g.y === midY));
    coyote.x = destX;
    coyote.y = destY;
    updateGame();
  } else {
    moverCoyote(dx, dy);
  }
}

// ⌨️ Controles
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": intentaCapturaCoyote(0, -1); break;
    case "ArrowDown": intentaCapturaCoyote(0, 1); break;
    case "ArrowLeft": intentaCapturaCoyote(-1, 0); break;
    case "ArrowRight": intentaCapturaCoyote(1, 0); break;
    case "q": intentaCapturaCoyote(-1, -1); break;
    case "e": intentaCapturaCoyote(1, -1); break;
    case "z": intentaCapturaCoyote(-1, 1); break;
    case "c": intentaCapturaCoyote(1, 1); break;

    case "w": moverGallina(0, -1); break;
    case "s": moverGallina(0, 1); break;
    case "a": moverGallina(-1, 0); break;
    case "d": moverGallina(1, 0); break;
    case "r": moverGallina(-1, -1); break;
    case "t": moverGallina(1, -1); break;
    case "x": moverGallina(-1, 1); break;
    case "v": moverGallina(1, 1); break;

    case "n": cambiarGallina(); break;
  }
});

window.onload = updateGame;
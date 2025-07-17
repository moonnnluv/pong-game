const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
canvas.style.display = "none";

let isGameRunning = false;

// Constantes del juego
const PADDLE_WIDTH = 12, PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PLAYER_X = 16;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;

// Variables del juego
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = (canvas.width - BALL_SIZE) / 2;
let ballY = (canvas.height - BALL_SIZE) / 2;
let ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 2 * (Math.random() * 2 - 1);

let playerScore = 0, aiScore = 0;

// Funciones auxiliares
function drawRect(x, y, w, h, color="#fff") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color="#fff") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, size=32) {
    ctx.fillStyle = "#fff";
    ctx.font = `${size}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

// Control del jugador con el ratón
canvas.addEventListener("mousemove", function(evt) {
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseY = evt.clientY - rect.top - root.scrollTop;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Limitar dentro del canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Actualiza la IA
function updateAI() {
    // IA simple: mueve el centro de la pala hacia la pelota
    let center = aiY + PADDLE_HEIGHT / 2;
    if (center < ballY + BALL_SIZE/2 - 8) {
        aiY += 2.5;
    } else if (center > ballY + BALL_SIZE/2 + 8) {
        aiY -= 2.5;
    }
    // Limitar dentro del canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Movimiento de la pelota y colisiones
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Colisión con paredes superior e inferior
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballSpeedY = -ballSpeedY;
        ballY = Math.max(0, Math.min(canvas.height - BALL_SIZE, ballY));
    }

    // Colisión con la pala del jugador
    if (ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT &&
        ballX > PLAYER_X - BALL_SIZE) {
        ballSpeedX = -ballSpeedX;
        // Efecto de rebote según punto de impacto
        let hitPos = (ballY + BALL_SIZE/2) - (playerY + PADDLE_HEIGHT/2);
        ballSpeedY = hitPos * 0.15;
        ballX = PLAYER_X + PADDLE_WIDTH; // Evita quedarse pegado
    }

    // Colisión con la pala de la IA
    if (ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT &&
        ballX < AI_X + PADDLE_WIDTH + BALL_SIZE) {
        ballSpeedX = -ballSpeedX;
        let hitPos = (ballY + BALL_SIZE/2) - (aiY + PADDLE_HEIGHT/2);
        ballSpeedY = hitPos * 0.25;
        ballX = AI_X - BALL_SIZE; // Evita quedarse pegado
    }

    // Punto para la IA
    if (ballX < 0) {
        aiScore++;
        resetBall(-1);
    }

    // Punto para el jugador
    if (ballX > canvas.width) {
        playerScore++;
        resetBall(1);
    }
}

function resetBall(dir) {
    ballX = (canvas.width - BALL_SIZE) / 2;
    ballY = (canvas.height - BALL_SIZE) / 2;
    // Lanza la bola hacia el último ganador
    ballSpeedX = 3 * dir;
    ballSpeedY = 2 * (Math.random() * 2 - 1);
}

// Dibuja los objetos del juego
function draw() {
    // Limpia el canvas
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    // Dibuja palas
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#0ff");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f33");

    // Dibuja la pelota
    drawRect(ballX, ballY, BALL_SIZE, BALL_SIZE, "#fff");

    // Línea central punteada
    for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width/2 - 2, y, 4, 16, "#888");
    }

    // Dibuja puntuaciones
    drawText(playerScore, canvas.width/4, 40, 36);
    drawText(aiScore, canvas.width*3/4, 40, 36);
}

// Bucle principal
function gameLoop() {
    if (!isGameRunning) return;

    updateAI();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

const startBtn = document.getElementById("startBtn");
const countdownDiv = document.getElementById("countdown");

startBtn.addEventListener("click", () => {
    startBtn.style.display = "none"; // Oculta el botón
    countdown(3); // Comienza la cuenta regresiva desde 3
});

function countdown(seconds) {
    countdownDiv.innerText = seconds;
    const interval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            countdownDiv.innerText = seconds;
        } else {
            clearInterval(interval);
            countdownDiv.innerText = "";
            canvas.style.display = "block"; // Muestra el juego
            isGameRunning = true;
            gameLoop();
        }
    }, 1000);
}


gameLoop();
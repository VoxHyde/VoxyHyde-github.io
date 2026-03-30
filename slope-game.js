const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Game variables
let gameRunning = true;
let score = 0;
const SLOPE_ANGLE = 0.3;
const GRAVITY = 0.5;

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: 10,
    velocityX: 0,
    velocityY: 0,
    speed: 5
};

// Obstacles array
let obstacles = [];
let obstacleCounter = 0;

// --- INPUT HANDLING ---

const keys = {};
let isTouching = false;
let touchX = 0;
// --- NEW: FULLSCREEN & RESIZE LOGIC ---

function resizeCanvas() {
    // Make the canvas internal resolution match the window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reset player position if they go off-screen during resize
    if (player.x > canvas.width) player.x = canvas.width / 2;
}

function enterFullscreen() {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) { /* Firefox */
        docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) { /* Chrome, Safari, Opera */
        docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) { /* IE/Edge */
        docElm.msRequestFullscreen();
    }
}

// Listen for window resizes
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Call once at start

// --- UPDATED RESTART/START LOGIC ---

function restartGame() {
    // Trigger Fullscreen on the first click/tap
    enterFullscreen();
    
    gameRunning = true;
    score = 0;
    player.x = canvas.width / 2;
    player.velocityX = 0;
    obstacles = [];
    obstacleCounter = 0;
    gameOverScreen.classList.add('hidden');
}
// Keyboard input
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Touch input (Mobile)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents scrolling while playing
    isTouching = true;
    updateTouchPos(e);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateTouchPos(e);
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isTouching = false;
});

function updateTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    // Calculate touch position relative to canvas scale
    touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
}

// --- GAME LOGIC ---

function drawPlayer() {
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawSlope() {
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - canvas.width * SLOPE_ANGLE);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function generateObstacles() {
    obstacleCounter++;
    if (obstacleCounter > 30) {
        const width = Math.random() * 60 + 40;
        const height = 15;
        const x = Math.random() * (canvas.width - width);
        obstacles.push({ x, y: -height, width, height });
        obstacleCounter = 0;
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += 4;
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }
}

function checkCollision() {
    obstacles.forEach(obs => {
        if (player.x + player.radius > obs.x &&
            player.x - player.radius < obs.x + obs.width &&
            player.y + player.radius > obs.y &&
            player.y - player.radius < obs.y + obs.height) {
            endGame();
        }
    });

    const slopeY = canvas.height - player.x * SLOPE_ANGLE;
    if (player.y + player.radius > slopeY + 20) {
        endGame();
    }
}

function updatePlayer() {
    // 1. Keyboard Controls
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
    } 
    // 2. Touch/Finger Controls (Follow finger)
    else if (isTouching) {
        const diff = touchX - player.x;
        // If finger is far enough away, move toward it
        if (Math.abs(diff) > 5) {
            player.velocityX = diff > 0 ? player.speed : -player.speed;
        } else {
            player.velocityX = 0;
        }
    } 
    // 3. Friction when no input
    else {
        player.velocityX *= 0.8;
    }

    player.x += player.velocityX;

    // Bounds
    if (player.x - player.radius < 0) player.x = player.radius;
    if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;

    // Apply gravity/slope positioning
    const slopeY = canvas.height - player.x * SLOPE_ANGLE;
    player.y = slopeY - player.radius;
}

function endGame() {
    gameRunning = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `Final Score: ${score}`;
}

function restartGame() {
    gameRunning = true;
    score = 0;
    player.x = canvas.width / 2;
    player.velocityX = 0;
    obstacles = [];
    obstacleCounter = 0;
    gameOverScreen.classList.add('hidden');
    // Ensure no recursive loops if restartBtn is clicked multiple times
}

restartBtn.addEventListener('click', restartGame);

function gameLoop() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        updatePlayer();
        generateObstacles();
        updateObstacles();
        checkCollision();
        scoreDisplay.textContent = `Score: ${score}`;
    }

    drawSlope();
    drawObstacles();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

gameLoop();
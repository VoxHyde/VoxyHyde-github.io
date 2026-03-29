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

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw player
function drawPlayer() {
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw slope
function drawSlope(offset) {
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - canvas.width * SLOPE_ANGLE);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

// Generate obstacles
function generateObstacles() {
    obstacleCounter++;
    if (obstacleCounter > 30) {
        const width = Math.random() * 60 + 40;
        const height = 15;
        const x = Math.random() * (canvas.width - width);
        obstacles.push({
            x: x,
            y: -height,
            width: width,
            height: height
        });
        obstacleCounter = 0;
    }
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach((obs, index) => {
        obs.y += 4;
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });
}

// Collision detection
function checkCollision() {
    obstacles.forEach(obs => {
        if (player.x + player.radius > obs.x &&
            player.x - player.radius < obs.x + obs.width &&
            player.y + player.radius > obs.y &&
            player.y - player.radius < obs.y + obs.height) {
            endGame();
        }
    });

    // Check if player falls off slope
    const slopeY = canvas.height - player.x * SLOPE_ANGLE;
    if (player.y + player.radius > slopeY + 20) {
        endGame();
    }
}

// Update player
function updatePlayer() {
    // Control movement
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.9; // Friction
    }

    player.x += player.velocityX;

    // Keep player in bounds
    if (player.x - player.radius < 0) player.x = player.radius;
    if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;

    // Apply gravity to keep player on slope
    const slopeY = canvas.height - player.x * SLOPE_ANGLE;
    player.y = slopeY - player.radius;
}

// End game
function endGame() {
    gameRunning = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = `Final Score: ${score}`;
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.velocityX = 0;
    obstacles = [];
    obstacleCounter = 0;
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

restartBtn.addEventListener('click', restartGame);

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameRunning) {
        updatePlayer();
        generateObstacles();
        updateObstacles();
        checkCollision();
        scoreDisplay.textContent = `Score: ${score}`;
    }

    drawSlope(0);
    drawObstacles();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
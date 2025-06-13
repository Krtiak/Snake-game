function randomFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (canvasSize / box)) * box;
        y = Math.floor(Math.random() * (canvasSize / box)) * box;
    } while (snake && snake.some(segment => segment.x === x && segment.y === y));
    return { x, y };
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');

const highScoreDiv = document.getElementById('highScore');
let highScore = localStorage.getItem('snakeHighScore') ? parseInt(localStorage.getItem('snakeHighScore')) : 0;
highScoreDiv.innerText = 'High Score: ' + highScore; // Zobraz high score
if (highScore) {
    highScoreDiv.style.display = 'block'; // Zobraz high score len ak existuje
}

const box = 26; // veľkosť jedného políčka
const canvasSize = 520;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = randomFood();
let score = 0;
let gameInterval = null;
let isGameOver = false;

// Vytvor Game Over overlay a tlačidlo na reštart
let gameOverOverlay = document.createElement('div');
gameOverOverlay.id = 'gameOverOverlay';
gameOverOverlay.style.position = 'absolute';
gameOverOverlay.style.top = '0';
gameOverOverlay.style.left = '0';
gameOverOverlay.style.width = '100%';
gameOverOverlay.style.height = '100%';
gameOverOverlay.style.background = 'rgba(0,0,0,0.7)';
gameOverOverlay.style.display = 'none';
gameOverOverlay.style.flexDirection = 'column';
gameOverOverlay.style.justifyContent = 'center';
gameOverOverlay.style.alignItems = 'center';
gameOverOverlay.style.zIndex = '10';
gameOverOverlay.style.transition = 'opacity 0.4s';
gameOverOverlay.style.opacity = '0';

let gameOverText = document.createElement('div');
gameOverText.innerText = 'GAME OVER!';
gameOverText.style.color = '#e74c3c';
gameOverText.style.fontWeight = 'bold';
gameOverText.style.fontSize = '3rem';
gameOverText.style.marginBottom = '12px';
gameOverText.style.textShadow = '0 2px 16px #fff, 0 0px 8px #e74c3c88';

let restartBtn = document.createElement('button');
restartBtn.innerText = 'Restart Game';
restartBtn.style.marginTop = '20px';
restartBtn.style.padding = '10px 24px';
restartBtn.style.fontSize = '1.2rem';
restartBtn.style.borderRadius = '8px';
restartBtn.style.border = 'none';
restartBtn.style.background = '#74ebd5';
restartBtn.style.color = '#222';
restartBtn.style.cursor = 'pointer';
restartBtn.addEventListener('click', restartGame);

gameOverOverlay.appendChild(gameOverText);
gameOverOverlay.appendChild(restartBtn);

document.getElementById('gameContainer').style.position = 'relative';
document.getElementById('gameContainer').appendChild(gameOverOverlay);

document.addEventListener('keydown', changeDirection);

startGame();

let lastFrameTime = 0;
const snakeSpeed = 8; // počet pohybov za sekundu

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = null;
    food = randomFood();
    score = 0;
    isGameOver = false;
    scoreDiv.innerText = 'Score: 0';
    gameOverOverlay.classList.remove('show');
    gameOverOverlay.style.display = 'none';
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawSnakeAndFood();
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const progress = (timestamp - lastFrameTime) / 1000;
    if (!isGameOver) {
        if (progress > 1 / snakeSpeed) {
            draw();
            lastFrameTime = timestamp;
        }
        requestAnimationFrame(gameLoop); // volaj len ak hra beží
    }
    // Ak je game over, už nevolaj requestAnimationFrame
}

function drawSnakeAndFood() {
    // Nakresli hada
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#74ebd5' : '#222';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }
    // Nakresli jedlo
    ctx.fillStyle = '#e17055';
    ctx.fillRect(food.x, food.y, box, box);
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Nakresli hada a jedlo
    drawSnakeAndFood();

    // Ak direction je null, nič nerob (čaká na prvý pohyb)
    if (!direction) return;

    // Pohyb hada
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    else if (direction === 'UP') head.y -= box;
    else if (direction === 'RIGHT') head.x += box;
    else if (direction === 'DOWN') head.y += box;

    // Kontrola kolízie so stenou alebo so sebou
    if (
        head.x < 0 || head.x >= canvasSize ||
        head.y < 0 || head.y >= canvasSize ||
        collision(head, snake)
    ) {
        gameOver();
        return;
    }

    // Kontrola či had zjedol jedlo
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDiv.innerText = 'Score: ' + score;
        food = randomFood();
    } else {
        snake.pop();
    }

    snake.unshift(head);
}

function changeDirection(event) {
    if (isGameOver) return;
    let newDirection = null;
    if (event.key === 'ArrowLeft' && direction !== 'RIGHT') newDirection = 'LEFT';
    else if (event.key === 'ArrowUp' && direction !== 'DOWN') newDirection = 'UP';
    else if (event.key === 'ArrowRight' && direction !== 'LEFT') newDirection = 'RIGHT';
    else if (event.key === 'ArrowDown' && direction !== 'UP') newDirection = 'DOWN';

    if (newDirection) {
        // Ak je to prvý pohyb, spusti interval
        if (!direction) {
            direction = newDirection;
            if (gameInterval) clearInterval(gameInterval);
            gameInterval = setInterval(draw, 100);
        } else {
            direction = newDirection;
        }
    }
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    isGameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDiv.innerText = 'High Score: ' + highScore;
    }
    gameOverOverlay.classList.add('show');
    gameOverOverlay.style.display = 'flex';
    gameOverText.innerHTML = `
        <span style="color:#e74c3c;font-size:3rem;font-weight:bold;text-shadow:0 2px 16px #fff,0 0px 8px #e74c3c88;">GAME OVER!</span>
        <div style="color:#fff;font-size:1.5rem;margin-top:18px;text-align:center;">Your score:<br><span style="font-size:2.2rem;color:#74ebd5;font-weight:bold;">${score}</span></div>
    `;
}

function restartGame() {
    gameOverOverlay.classList.remove('show');
    gameOverOverlay.style.display = 'none';
    startGame();
}

// Pridaj event listener pre reštart hry pri kliknutí mimo overlay
document.addEventListener('click', function(event) {
    if (isGameOver && !gameOverOverlay.contains(event.target)) {
        restartGame();
    }
});
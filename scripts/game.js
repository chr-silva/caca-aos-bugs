// game.js
let score = 0;
let timeLeft = 5;
let gameInterval;
let timerInterval;
let nextSpawnDelay = 1000; // Começa com 1 segundo (1000ms)
const minSpawnDelay = 300; // Limite máximo de velocidade (0.3 segundos)

// atenção!!! a soma de todas as probabilidades dentro do objeto deve corresponder a 100%!!
const entityTypes = [
    // 35% de chance para o arquivo (0.35)
    { type: 'normal', src: 'assets/entities/file.png', points: -50, prob: 0.35, size: 50 },
    
    // 25% de chance para o escudo (0.25) -> Total normais: 60%
    { type: 'normal', src: 'assets/entities/shield.png', points: -40, prob: 0.25, size: 50},
    
    // 30% de chance para o bug (0.30)
    { type: 'bug', src: 'assets/entities/bug.png', points: 100, prob: 0.30, size: 50 },
    
    // 10% de chance para o vírus (0.10) -> Soma total: 1.0
    { type: 'virus', src: 'assets/entities/virus-1.png', points: 200, prob: 0.10, size: 40 }
];

function gameLoop() {
    if (timeLeft <= 0) return; // Para o loop se o tempo acabou

    spawnEntity();

    // CALCULO DA ACELERAÇÃO:
    // Quanto menos tempo resta, menor o delay.
    // Ex: Em 120s, delay é 1000ms. Em 0s, delay chega perto de 300ms.
    // A cada segundo que passa, subtraímos um pouco do delay.
    
    const progress = (120 - timeLeft) / 120; // Vai de 0 a 1
    nextSpawnDelay = 1000 - (progress * (1000 - minSpawnDelay));

    // Agenda o próximo ícone com o novo delay calculado
    setTimeout(gameLoop, nextSpawnDelay);
}

function initGame() {
    score = 0;
    timeLeft = 5;
    updateUI();
    
    // Loop de criação de ícones (cada 1 segundo)
    gameLoop();
    
    // Loop do cronômetro
    timerInterval = setInterval(() => {
        timeLeft--;
        updateUI();
        if (timeLeft <= 0) finishGame();
    }, 1000);
}

function spawnEntity() {
    const rand = Math.random();
    let cumulativeProb = 0;
    let selectedEntity = entityTypes[0];

    // Lógica de Probabilidade
    for (const entity of entityTypes) {
        cumulativeProb += entity.prob;
        if (rand < cumulativeProb) {
            selectedEntity = entity;
            break;
        }
    }

    createIcon(selectedEntity);
}

function showFeedback(x, y, points) {
    const area = document.getElementById('game-area');
    const span = document.createElement('span');
    
    // Define o símbolo e a classe de cor
    const isPositive = points > 0;
    span.innerText = isPositive ? `+${points}` : points;
    span.className = `floating-text ${isPositive ? 'text-plus' : 'text-minus'}`;
    
    // Posiciona exatamente onde o jogador clicou
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    
    area.appendChild(span);
    
    // Remove do DOM após a animação acabar
    setTimeout(() => {
        span.remove();
    }, 800);
}

function createIcon(entity) {
    const area = document.getElementById('game-area');
    
    // Usa as dimensões da viewport ao invés do container
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    const img = document.createElement('img');
    img.src = entity.src;
    img.className = `icon ${entity.type}`;
    img.style.position = 'absolute';
    img.style.width = `${entity.size}px`;
    img.style.height = `${entity.size}px`;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s';

    // Sorteia dentro dos limites da tela (considerando a barra de status)
    const x = Math.floor(Math.random() * (maxWidth - entity.size));
    const y = Math.floor(Math.random() * (maxHeight - entity.size - 80)) + 80;

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    img.addEventListener('click', function(e) {
        e.stopPropagation();
        showFeedback(e.clientX, e.clientY, entity.points)
        handleScore(entity.points);
        this.remove();
    });

    area.appendChild(img);

    // Pequeno delay para o navegador processar o 'absolute' antes do fade-in
    requestAnimationFrame(() => {
        img.style.opacity = '1';
    });

    setTimeout(() => {
        if (document.body.contains(img)) {
            img.style.opacity = '0';
            setTimeout(() => img.remove(), 400);
        }
    }, 2500);
}

function handleScore(points) {
    score += points;
    if (score < 0) score = 0; // Regra: Nunca negativa
    updateUI();
}

function updateUI() {
    document.getElementById('score').innerText = score;
    document.getElementById('timer').innerText = timeLeft;
}

async function finishGame() {
    clearInterval(timerInterval);
    document.getElementById('game-area').innerHTML = ''; // Limpa ícones

    const playerName = prompt(`Fim de jogo! Pontos: ${score}\nDigite seu nome:`) || "Anônimo";

    // Troca as telas visualmente
    document.getElementById('game-screen').hidden = true;
    document.getElementById('ranking-screen').hidden = false;

    // Chama as funções do leaderboard.js
    await window.saveToGlobalRanking(playerName, score);
    await window.displayRanking();
}

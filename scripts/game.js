// game.js
// const { type } = require("firebase/firestore/pipelines");
//constantes globais pra poupar nosso tempo na hora de debuggar
const TOTAL_GAME_TIME = 60; //tempo inicial em segundos, mudar isso altera o tempo da rodada
const TOTAL_GAME_ROUNDS = 3; //numero de rodadas
const INITIAL_SPAWN_DELAY = 500; //antes 1000
const MIN_SPAWN_DELAY = 200; // Limite máximo de velocidade (0.3 segundos) / antes 300

let score = 0;
let timeLeft = TOTAL_GAME_TIME; 
let timerInterval;
let nextSpawnDelay = INITIAL_SPAWN_DELAY;
let gameInterval;

let isFinishing = false;
let isSoloMode = false;

// Função para iniciar o modo solo
function startSoloGame() {
    isSoloMode = true;
    isFinishing = false;
    score = 0;
    timeLeft = TOTAL_GAME_TIME;

    // LIMPEZA: Garante que não existam timers sobrando de outras partidas
    if (timerInterval) clearInterval(timerInterval);

    document.getElementById('game-area').innerHTML = ""; 
    document.getElementById('menu-grid').hidden = true;
    document.getElementById('game-screen').hidden = false;
    
    if (typeof playMusic === "function") playMusic("game");
    
    startCountdown(() => {
            if (typeof playMusic === "function") playMusic("game");
            initGame(); 
        });
}

function startCountdown(callback) {
    const area = document.getElementById('game-area');
    area.innerHTML = ""; // Limpa a tela
    
    let count = 3;
    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown-overlay';
    // Estilo via JS para garantir que apareça no centro
    Object.assign(countdownDiv.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '120px',
        fontWeight: 'bold',
        color: '#fff',
        zIndex: '1000',
        textShadow: '0 0 20px rgba(86, 162, 192, 0.8)'
    });
    
    area.appendChild(countdownDiv);

    const timer = setInterval(() => {
        if (count > 0) {
            countdownDiv.innerText = count;
            // Efeito opcional de som ou animação aqui
            count--;
        } else if (count === 0) {
            countdownDiv.innerText = "JÁ!";
            count--;
        } else {
            clearInterval(timer);
            countdownDiv.remove();
            callback(); // Aqui ele inicia o jogo de fato
        }
    }, 1000);
}


// atenção!!! a soma de todas as probabilidades dentro do objeto deve corresponder a 100%!!
const entityTypes = [
    // 20% de chance para o arquivo (0.20)
    { type: 'normal', src: 'assets/entities/file.png', points: -50, prob: 0.20, size: 50 },

    // 20% de chance para a engrenagem (0.20)
    { type: 'normal', src: 'assets/entities/cogwheel.png', points: -50, prob: 0.20, size: 50 },
    
    // 20% de chance para o escudo (0.20) -> Total normais: 60%
    { type: 'normal', src: 'assets/entities/shield.png', points: -40, prob: 0.20, size: 50},
    
    // 30% de chance para o bug (0.30)
    { type: 'bug', src: 'assets/entities/bug.png', points: 100, prob: 0.20, size: 50 },
    
    // 10% de chance para o vírus (0.10) -> Soma total: 1.0
    { type: 'virus', src: 'assets/entities/virus-1.png', points: 200, prob: 0.10, size: 40 },

    // 10% de chance para o vírus 2 (0.10)
    { type: 'virus', src: 'assets/entities/virus-2.png', points: 250, prob: 0.10, size: 40 },


];

function gameLoop() {
    if (timeLeft <= 0) return; // Para o loop se o tempo acabou

    spawnEntity();

    // CALCULO DA ACELERAÇÃO:
    // Quanto menos tempo resta, menor o delay.
    // Ex: Em 120s, delay é 1000ms. Em 0s, delay chega perto de 300ms.
    // A cada segundo que passa, subtraímos um pouco do delay.
    
    const progress = (TOTAL_GAME_TIME - timeLeft) / TOTAL_GAME_TIME; // Vai de 0 a 1
    nextSpawnDelay = INITIAL_SPAWN_DELAY - (progress * (INITIAL_SPAWN_DELAY - MIN_SPAWN_DELAY));

    // Agenda o próximo ícone com o novo delay calculado
    setTimeout(gameLoop, nextSpawnDelay);
}

function initGame() {
    // Reset de variáveis de controle do loop
    score = 0;
    timeLeft = TOTAL_GAME_TIME;
    nextSpawnDelay = INITIAL_SPAWN_DELAY;
    
    updateUI();
    
    // Inicia o loop visual
    gameLoop();
    
    // Inicia o cronômetro (apenas um!)
    timerInterval = setInterval(() => {
        timeLeft--;
        updateUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Para o timer IMEDIATAMENTE
            finishGame();
        }
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
    
    // Classes para o CSS tratar a animação
    span.className = `feedback-animation ${isPositive ? 'text-plus' : 'text-minus'}`;
    
    // ESTILOS CRUCIAL PARA POSICIONAMENTO
    span.style.position = 'absolute';
    span.style.left = `${x}px`;
    span.style.top = `${y - 30}px`; // Começa 30px acima do centro do clique
    span.style.transform = 'translateX(-50%)'; // Garante centralização horizontal
    span.style.pointerEvents = 'none'; // Evita que o feedback bloqueie cliques
    span.style.zIndex = '1000';

    area.appendChild(span);
    
    // Remove do DOM após a animação (800ms)
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
        
        // Pega a posição do ícone e calcula o centro
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        showFeedback(centerX, centerY, entity.points);
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

function updateUI() {
    document.getElementById('score').innerText = score;
    document.getElementById('timer').innerText = timeLeft;
}

async function finishGame() {
if (isFinishing) {
    console.log("finishGame já está executando, retornando...");
    return;
}
    isFinishing = true;

    console.log("Jogo finalizado! Verificando modo..."); // Debug 1
    console.log("isSoloMode:", isSoloMode); // Debug adicional
    console.log("window.currentRoomId:", window.currentRoomId); // Debug adicional
    
    clearInterval(timerInterval);
    const finalScore = score; 

    if (isSoloMode) {
        console.log("Entrou no Modo Solo. Chamando tela de resultado..."); // Debug 2
        console.log("Score final:", finalScore); // Debug adicional
        document.getElementById('game-area').innerHTML = "";
        
        // CHAME A FUNÇÃO ASSIM:
        showSoloResult(finalScore); 
        return; 
    }
    //feedback visual imediato: "Sincronizando..."
    const area = document.getElementById('game-area');
    area.innerHTML = `
        <div class="finish-overlay d-flex justify-content-center align-items-center">
            <div class="finish-card text-center animate-pop-in">
                <h1 class="display-3 fw-bold text-white mb-2">FIM DO ROUND!</h1>
                <div class="divider mb-3"></div>
                <p class="h4 text-info animate-pulse">Calculando pontuações do round...</p>
                
                <div class="spinner-container mt-4">
                    <div class="custom-loader"></div>
                </div>
            </div>
        </div>
    `;

    const name = window.playerName; 
    const roomId = window.currentRoomId;

    if (roomId && name) {
            const roomRef = window.firestore.doc(window.db, "rooms", roomId);
            try {
                const snap = await window.firestore.getDoc(roomRef);
                const currentData = snap.data();
                const previousTotal = currentData.players[name].totalScore || 0;

                await window.firestore.updateDoc(roomRef, {
                    // CORRIGIDO AQUI: de finalScoreThisRound para finalScore
                    [`roundScores.round${window.currentRound}.${name}`]: finalScore, 
                    [`players.${name}.totalScore`]: previousTotal + finalScore,
                    status: "lobby"
                });
            } catch (e) { console.error(e); }
        }

    // Aguarda o tempo de segurança
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    document.getElementById('game-screen').hidden = true;
    isFinishing = false;

    if (window.currentRound >= TOTAL_GAME_ROUNDS) {
        // Agora chamamos o showFinalResults que também terá um loading
        showFinalResults();
    } else {
        if (typeof window.showRoundSummary === 'function') window.showRoundSummary();
        document.getElementById('lobby-screen').hidden = false;
    }
}

function handleScore(points) {
    if (isFinishing) return; //não contabiliza pontos se o tempo já acabou (minimiza imprecisão na classificação)
    score += points;
    if (score < 0) score = 0; //impede que pontos sejam negativos
    updateUI();
}

async function showFinalResults() {
    const rankingScreen = document.getElementById('ranking-screen');
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    rankingScreen.hidden = false;
    
    // Tela de Carregamento Estilizada
    leaderboardBody.innerHTML = `
        <div class="text-center py-5 animate-pulse">
            <div class="custom-loader mb-3"></div>
            <h4 class="text-info">PROCESSANDO RESULTADOS FINAIS...</h4>
            <span class="text-muted small">Aguardando sincronização de todos os jogadores</span>
        </div>
    `;

    // Delay de segurança para garantir o "Pacote Soberano" de todos
    await new Promise(resolve => setTimeout(resolve, 2500));

    const roomId = window.currentRoomId;
    const roomRef = window.firestore.doc(window.db, "rooms", roomId);
    const roomSnap = await window.firestore.getDoc(roomRef);
    const data = roomSnap.data();

    leaderboardBody.innerHTML = "";
    
    const playersSorted = Object.entries(data.players)
        .map(([name, info]) => ({
            name: name,
            total: info.totalScore || 0
        }))
        .sort((a, b) => b.total - a.total);

    // 1. Destaque para o Grande Vencedor
    const winner = playersSorted[0];
    const winnerHeader = document.querySelector('#ranking-screen h3');
    winnerHeader.innerHTML = `🏆 <span class="rank-1">${winner.name.toUpperCase()}</span> É O CAMPEÃO!`;
    winnerHeader.className = "display-5 fw-bold mb-4 animate-pop-in";

    // 2. Montagem da Lista
    playersSorted.forEach((player, index) => {
        const isTop3 = index < 3;
        const rankClass = isTop3 ? `rank-${index + 1}` : 'text-white-50';
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`;

        const row = document.createElement('div');
        row.className = `player-row row align-items-center py-3 px-2 border-bottom border-white border-opacity-10 animate-fade-in`;
        row.style.animationDelay = `${index * 0.1}s`; // Efeito de cascata

        row.innerHTML = `
            <div class="col-2 h4 mb-0 ${rankClass}">${medal}</div>
            <div class="col-6 text-start">
                <span class="h5 mb-0 ${index === 0 ? 'fw-bold' : ''}">${player.name}</span>
            </div>
            <div class="col-4 text-end">
                <span class="badge rounded-pill bg-info text-dark px-3">${player.total} PTS</span>
            </div>
        `;
        leaderboardBody.appendChild(row);
    });
}

async function saveSoloScore(score) {
    const playerName = prompt("Parabéns! Qual seu nome para o Ranking?") || "Anônimo";
    
    try {
        await window.firestore.addDoc(window.firestore.collection(window.db, "leaderboard"), {
            name: playerName,
            score: score,
            date: new Date()
        });
        alert("Pontuação salva no Ranking Global!");
        location.reload(); // Volta para o menu
    } catch (e) {
        console.error("Erro ao salvar: ", e);
    }
}

function showSoloResult(score) {
    console.log("showSoloResult chamada com score:", score); // Debug
    
    // Esconde a tela de gameplay COMPLETAMENTE
    const gameScreen = document.getElementById('game-screen');
    if(gameScreen) {
        gameScreen.hidden = true;
        gameScreen.style.display = 'none';
        gameScreen.style.visibility = 'hidden';
        gameScreen.style.zIndex = '-1';
        console.log("game-screen escondido"); // Debug
    }

    const resultScreen = document.getElementById('solo-result-screen');
    console.log("resultScreen encontrado:", resultScreen); // Debug
    
    if (resultScreen) {
        // Força o display para aparecer sobre tudo
        resultScreen.style.display = 'flex'; 
        resultScreen.style.visibility = 'visible';
        resultScreen.style.zIndex = '99999'; // Maior que o game-screen
        resultScreen.hidden = false;
        
        const scoreElement = document.getElementById('final-solo-score');
        console.log("scoreElement encontrado:", scoreElement); // Debug
        
        if (scoreElement) {
            scoreElement.innerText = score;
        }
        
        console.log("Tela de resultado exibida com sucesso!");
    } else {
        // Se cair aqui, o ID no HTML está errado!
        console.error("Erro crítico: Tela de resultado não encontrada no HTML!");
        alert("Erro crítico: Tela de resultado não encontrada no HTML!");
    }
}

async function saveSoloScoreToFirebase(name, score) {
    const btn = document.getElementById('btn-save-solo');
    btn.disabled = true;
    btn.innerText = "SALVANDO...";

    try {
        await window.firestore.addDoc(window.firestore.collection(window.db, "ranking"), {
            name: name,
            score: score,
            date: new Date()
        });
        
        // Sucesso: Feedback visual antes de recarregar
        btn.classList.replace('btn-success', 'btn-primary');
        btn.innerText = "SALVO COM SUCESSO!";
        
        setTimeout(() => location.reload(), 1500);
    } catch (e) {
        console.error("Erro ao salvar:", e);
        btn.disabled = false;
        btn.innerText = "ERRO AO SALVAR. TENTAR DENOVO?";
    }
}

// Event listener para o botão de salvar pontuação solo
document.addEventListener('DOMContentLoaded', () => {
    const btnSaveSolo = document.getElementById('btn-save-solo');
    if (btnSaveSolo) {
        btnSaveSolo.addEventListener('click', () => {
            const playerName = document.getElementById('solo-player-name').value.trim();
            if (!playerName) {
                alert("Por favor, digite seu nome!");
                return;
            }
            const finalScore = parseInt(document.getElementById('final-solo-score').innerText);
            saveSoloScoreToFirebase(playerName, finalScore);
        });
    }
});
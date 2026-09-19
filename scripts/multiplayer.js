// multiplayer.js
let currentRoomId = null;
let isHost = false;
let userAction = ""; //"create" ou "join
let isGameRunning = false;
let isMuted = false;
let unsubscribeRoom = null;

function playMusic(gameMode) {
    const menuMusic = document.getElementById('menu-music');
    const roundMusic = document.getElementById('game-music');

    if (gameMode === "game") {
        menuMusic.pause();
        menuMusic.currentTime = 0;
        if (!isMuted) roundMusic.play().catch(e => console.log("Áudio aguardando interação..."));
    } else {
        roundMusic.pause();
        roundMusic.currentTime = 0;
        if (!isMuted) menuMusic.play().catch(e => console.log("Áudio aguardando interação..."));
    }
}

// Lógica do Botão de Mudo
document.getElementById('btn-mute').addEventListener('click', () => {
    isMuted = !isMuted;
    const menuMusic = document.getElementById('menu-music');
    const roundMusic = document.getElementById('game-music');
    const icon = document.getElementById('mute-icon');

    menuMusic.muted = isMuted;
    roundMusic.muted = isMuted;
    icon.innerText = isMuted ? "🔇" : "🔊";
});

// Inicia música do menu no primeiro clique (contorno de bloqueio do navegador)
document.addEventListener('click', () => {
    const menuMusic = document.getElementById('menu-music');
    if (menuMusic.paused && !isMuted) {
        menuMusic.play().catch(() => {});
    }
}, { once: true });

// NAVEGAÇÃO
document.getElementById('btn-create-lobby').addEventListener('click', () => {
    document.getElementById('menu-grid').hidden = true;
    document.getElementById('join-screen').hidden = false;
    document.getElementById('join-screen-title').innerText = "Criar Nova Sala";
    document.getElementById('room-id-input').hidden = true;
    userAction = "create";
});

// --- FUNÇÕES DE NAVEGAÇÃO ---

//quando clica em "Criar Sala" no menu principal
document.getElementById('btn-join-lobby').addEventListener('click', () => {
    document.getElementById('menu-grid').hidden = true;
    document.getElementById('join-screen').hidden = false;
    document.getElementById('join-screen-title').innerText = "Entrar em uma Sala"; 
    document.getElementById('room-id-input').hidden = false; 
    userAction = "join";
});

//botão de confirmação dentro da join-screen
//quando clica em "Entrar na Sala" no menu principal
document.getElementById('btn-confirm-action').addEventListener('click', () => {
    if (userAction === "create") {
        createRoom();
    } else {
        joinRoom();
    }
});


document.getElementById('btn-back').addEventListener('click', () => {
    if (currentRoomId && !isGameRunning) {
        leaveRoom();
    } else {
        document.getElementById('lobby-screen').hidden = true;
        document.getElementById('join-screen').hidden = true;
        document.getElementById('menu-grid').hidden = false;
    }
})

// --- FUNÇÕES AUXILIARES ---
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function showLobbyUI(roomId) {
    document.getElementById('join-screen').hidden = true;
    document.getElementById('lobby-screen').hidden = false;
    document.getElementById('display-room-id').innerText = roomId;
}

// FIREBASE
async function createRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) return alert("Digite seu nome!");

    const roomId = generateRoomId();
    const roomRef = window.firestore.doc(window.db, "rooms", roomId);
    const roomSeed = Math.floor(Math.random() * Math.pow(10, 6));

    try {
        await window.firestore.setDoc(roomRef, {
            status: "lobby",
            host: playerName,
            seed: roomSeed,
            currentRound: 1,
            roundScores: {},
            createdAt: new Date().getTime(),
            players: {
                [playerName]: { score: 0, totalScore: 0, ready: true }
            }
        });

        
        window.currentRound = 1;
        window.playerName = playerName;
        window.currentRoomId = roomId;
        window.currentSeed = roomSeed;

        isHost = true;
        currentRoomId = roomId;
        startListening(roomId);
        showLobbyUI(roomId);
    } catch (e) {
        console.error("Erro ao criar sala:", e);
    }
}

async function joinRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    const roomId = document.getElementById('room-id-input').value.trim().toUpperCase();

    if (!playerName || !roomId) return alert("Preencha nome e código da sala!");

    const roomRef = window.firestore.doc(window.db, "rooms", roomId);
    const roomSnap = await window.firestore.getDoc(roomRef);

    if (!roomSnap.exists()) return alert("Sala não encontrada!");
    
    try {
        await window.firestore.updateDoc(roomRef, {
            [`players.${playerName}`]: { score: 0, totalScore: 0, ready: true }
        });

        window.playerName = playerName;
        window.currentRoomId = roomId;
        currentRoomId = roomId;
        isHost = false;
        startListening(roomId);
        showLobbyUI(roomId);
    } catch (e) {
        console.error("Erro ao entrar na sala:", e);
    }
}

async function leaveRoom() {
    if (unsubscribeRoom) {
        unsubscribeRoom();
        unsubscribeRoom = null;
    }

    if (currentRoomId && window.playerName) {
        const roomRef = window.firestore.doc(window.db, "rooms", currentRoomId);
        try {
            if (isHost) {
                await window.firestore.deleteDoc(roomRef);
            } else {
                await window.firestore.updateDoc(roomRef, {
                    [`players.${window.playerName}`]: window.firestore.deleteField()
                });
            }
        } catch (e) {
            console.error("Erro ao remover jogador da sala: ", e);
        }
    }

    currentRoomId = null;
    window.currentRoomId = null;
    isHost = false;
    isGameRunning = false;

    document.getElementById('lobby-screen').hidden = true;
    document.getElementById('join-screen').hidden = true;
    if (document.getElementById('round-summary')) {
        document.getElementById('round-summary').hidden = true;
    }
    document.getElementById('menu-grid').hidden = false;

    document.body.classList.remove("game-bg");
    document.body.classList.add("menu-bg");
}

function startListening(roomId) {
    const roomRef = window.firestore.doc(window.db, "rooms", roomId);

    if (unsubscribeRoom) {
        unsubscribeRoom();
    }

    unsubscribeRoom = window.firestore.onSnapshot(roomRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        //sincroniza a rodada atual com o que tá no db pra todos os jogadores
        window.currentRound = data.currentRound || 1;
        window.currentSeed = data.seed || 12345;

        updatePlayerListUI(data.players);

        if (isHost) {
            document.getElementById('btn-start-match').style.display = 'block';
            document.getElementById('wait-message').style.display = 'none';
            
            const roundScores = data.roundScores || {};
            const isReadyToStartNext = roundScores[`round${data.currentRound}`];

            if (!isReadyToStartNext && data.currentRound === 1) {
                document.getElementById('btn-start-match').innerText = "INICIAR PARTIDA";
            } else if (isReadyToStartNext && data.currentRound < 3) {
                document.getElementById('btn-start-match').innerText = `INICIAR RODADA ${data.currentRound + 1}`;
            } else {
                document.getElementById('btn-start-match').innerText = `REINICIAR RODADA ${data.currentRound + 1}`;
            }
        //se o status for "jogando", mudamos pra tela de jogo
        } else {
            document.getElementById('btn-start-match').style.display = 'none';
            document.getElementById('wait-message').style.display = 'block';
        }

        if (data.status === "playing" && !isGameRunning) {
            isGameRunning = true;

            document.getElementById('lobby-screen').hidden = true;
            document.getElementById('game-screen').hidden = false;
            
            const btnBack = document.getElementById('btn-back');
            if (btnBack) btnBack.hidden = true;

            document.body.classList.remove("menu-bg");
            document.body.classList.add("game-bg");

            if (typeof startCountdown === 'function') {
                startCountdown(() => {
                    playMusic("game");
                    if (typeof window.initGame === 'function') window.initGame();
                });
            } else {
                playMusic("game");
                if (typeof window.initGame === 'function') window.initGame();
            }
        } else if (data.status === "lobby") {
            isGameRunning = false;
            const btnBack = document.getElementById('btn-back');
            if (btnBack) btnBack.hidden = false;
            playMusic("menu");
        }
    });
}

function updatePlayerListUI(players) {
    const list = document.getElementById('player-list');
    list.innerHTML = "";
    Object.keys(players).forEach(name => {
        const item = document.createElement('div');
        item.className = "list-group-item bg-dark text-white border-secondary d-flex justify-content-between";
        item.innerHTML = `<span>${name}</span> <span class="badge bg-info">Pronto</span>`;
        list.appendChild(item);
    });
}

document.getElementById('btn-start-match').addEventListener('click', async () => {
    if (!currentRoomId || !isHost) return;
    const roomRef = window.firestore.doc(window.db, "rooms", currentRoomId);
    
    const roomSnap = await window.firestore.getDoc(roomRef);
    const data = roomSnap.data();

    let nextRound = data.currentRound || 1;

    //só incrementamos se o status for lobby E se não for a primeira vez que clicamos
    //verificamos se já existe alguma pontuação salva do round atual para saber se ele acabou
    const roundFinished = data.roundScores && data.roundScores[`round${nextRound}`];

    if (data.status === "lobby" && roundFinished && nextRound < 3) {
        nextRound++;
    }
    
    await window.firestore.updateDoc(roomRef, { 
        status: "playing",
        currentRound: nextRound
    });
});

window.showRoundSummary = async function() {
    const roomId = window.currentRoomId;
    const roomRef = window.firestore.doc(window.db, "rooms", roomId);
    
    //aguarda um segundo extra para garantir que o Firestore processou o increment de todos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const roomSnap = await window.firestore.getDoc(roomRef);
    const data = roomSnap.data();

    const summaryDiv = document.getElementById('round-summary');
    const summaryList = document.getElementById('summary-list');
    const roundNumField = document.getElementById('summary-round-num');

    if (data.players) {
        summaryDiv.hidden = false;
        roundNumField.innerText = window.currentRound;
        summaryList.innerHTML = "";

        //transforma em array e ordena pelo TOTAL acumulado
        const sortedByTotal = Object.entries(data.players)
            .map(([name, info]) => ({
                name: name,
                total: info.totalScore || 0,
                lastRound: data.roundScores[`round${window.currentRound}`]?.[name] || 0
            }))
            .sort((a, b) => b.total - a.total);

        sortedByTotal.forEach((player) => {
            const item = document.createElement('div');
            item.className = "d-flex justify-content-between border-bottom border-info py-2";
            //mostra o Total e, entre parênteses, quanto ele ganhou no round atual
            item.innerHTML = `
                <span>${player.name}</span> 
                <span>
                    <small class="text-warning">(+${player.lastRound})</small> 
                    <strong>${player.total} pts</strong>
                </span>
            `;
            summaryList.appendChild(item);
        });
    }
};
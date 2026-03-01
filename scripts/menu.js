// menu.js
document.addEventListener("DOMContentLoaded", () => {
    const btnStart = document.getElementById("btn-start");
    const menuGrid = document.getElementById("menu-grid");
    const gameScreen = document.getElementById("game-screen");
    const btnRanking = document.getElementById("btn-ranking");
    const rankingScreen = document.getElementById("ranking-screen");

    btnStart.addEventListener("click", () => {
    // 1. Esconde o menu e REMOVE ele do fluxo (display none)
    menuGrid.style.display = "none"; 
    

    // 2. Mostra a tela do jogo
    gameScreen.hidden = false;
    gameScreen.style.display = "block"; // Garante que o game-screen não herde flex

    // 3. Troca o fundo
    document.body.classList.remove("menu-bg");
    document.body.classList.add("game-bg");

    // 4. Inicia o jogo
    initGame();
    });
    
    btnRanking.addEventListener("click", () => {
        menuGrid.hidden = true;
        rankingScreen.hidden = false;
    displayRanking(); // Chama a função que busca no Firebase
    });
});
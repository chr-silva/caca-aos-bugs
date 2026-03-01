// menu.js
document.addEventListener("DOMContentLoaded", () => {
    const btnStart = document.getElementById("btn-start");
    const menuGrid = document.getElementById("menu-grid");
    const gameScreen = document.getElementById("game-screen");
    const btnRanking = document.getElementById("btn-ranking");
    const rankingScreen = document.getElementById("ranking-screen");

    btnStart.addEventListener("click", () => {
    //esconde o menu
    menuGrid.style.display = "none"; 
    

    //tela do jogo
    gameScreen.hidden = false;
    gameScreen.style.display = "block"; //garante que o game-screen não herde flex

    //troca o fundo
    document.body.classList.remove("menu-bg");
    document.body.classList.add("game-bg");

    //inicia o jogo
    initGame();
    });

    //troca pra tela de ranking
    btnRanking.addEventListener("click", () => {
        menuGrid.hidden = true;
        rankingScreen.hidden = false;
    displayRanking(); //chama a função que busca no Firebase
    });
});
// menu.js
document.addEventListener("DOMContentLoaded", () => {
    // const btnStart = document.getElementById("btn-start");
    // const btnJoinLobby = document.getElementById("btn-join-lobby");
    // const btnCreateLobby = document.getElementById("btn-create-lobby");
    const btnHelp = document.getElementById("btn-help");
    const btnRanking = document.getElementById("btn-ranking");
    const btnSoloMode = document.getElementById("btn-solo-mode");
    const menuGrid = document.getElementById("menu-grid");
    // const gameScreen = document.getElementById("game-screen");
    // const joinScreen = document.getElementById("join-screen");
    // const lobbyScreen = document.getElementById("lobby-screen");
    const rankingScreen = document.getElementById("ranking-screen");
    const helpScreen = document.getElementById("help-screen");

    // //event listener do botão de entrar em uma sala já criada
    // btnJoinLobby.addEventListener("click", () => {
    // //esconde o menu
    // menuGrid.style.display = "none"; 
    

    // //tela do jogo
    // joinScreen.hidden = false;
    // joinScreen.style.display = "block"; //garante que o game-screen não herde flex

    // //troca o fundo
    // document.body.classList.remove("menu-bg"); //remove a imagem do menu principal
    // document.body.classList.add("game-bg"); //bg tela de entrar no lobby

    // //inicia o jogo
    // // initGame();
    // });

    // btnCreateLobby.addEventListener("click", () => {
    //     //esconde o menu
    //     menuGrid.style.display = "none";

    //     lobbyScreen.hidden = false;
    //     lobbyScreen.style.display = "block";

    //     //troca o fundo
    //     document.body.classList.remove("menu-bg"); //remove a imagem do menu principal
    //     document.body.classList.add("game-bg"); //bg tela de criar lobby
    // });

    //listener da tela de ranking
    btnRanking.addEventListener("click", () => {
        menuGrid.hidden = true;
        rankingScreen.hidden = false;
        rankingScreen.style.display = "flex";
    displayRanking(); //chama a função que busca no Firebase
    });

    //listener da tela de ajuda
    btnHelp.addEventListener("click", () => {
        menuGrid.hidden = true;
        helpScreen.hidden = false;
        helpScreen.style.display = "flex";
    });

    btnSoloMode.addEventListener("click", () => {
        // 1. Esconde o menu
        menuGrid.hidden = true;
        menuGrid.style.display = "none";

        // 2. Troca o fundo para o clima de jogo
        document.body.classList.remove("menu-bg");
        document.body.classList.add("game-bg");

        // 3. Dispara a função que está no game.js
        if (typeof startSoloGame === "function") {
            startSoloGame();
        } else {
            console.error("Função startSoloGame não encontrada no game.js!");
        }
    }); 
});

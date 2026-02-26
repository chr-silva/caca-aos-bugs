document.addEventListener("DOMContentLoaded", () => {

    const btnStart = document.getElementById("btn-start");
    const menuGrid = document.getElementById("menu-grid");
    const gameScreen = document.getElementById("game-screen");

    btnStart.addEventListener("click", () => {

        menuGrid.style.opacity = "0";

        setTimeout(() => {
            menuGrid.hidden = true;
            gameScreen.hidden = false;
        }, 300);

        // Troca fundo
        document.body.classList.remove("menu-bg");
        document.body.classList.add("game-bg");
        

    });

});
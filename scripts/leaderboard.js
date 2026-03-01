// leaderboard.js

// Função para salvar a pontuação
async function saveToGlobalRanking(playerName, finalScore) {
    if (!window.db || !window.firestore) {
        console.error("Firebase não inicializado corretamente.");
        return;
    }

    try {
        await window.firestore.addDoc(window.firestore.collection(window.db, "ranking"), {
            name: playerName,
            score: finalScore,
            date: new Date().getTime()
        });
        console.log("Sucesso ao salvar no Firebase");
    } catch (e) {
        console.error("Erro ao salvar no ranking global: ", e);
    }
}

// Função para buscar e exibir o ranking
async function displayRanking() {
    const rankingContent = document.getElementById('ranking-content');
    if (!rankingContent) return;

    rankingContent.innerHTML = `<h2 class="text-white">Carregando Busters...</h2>`;

    try {
        const q = window.firestore.query(
            window.firestore.collection(window.db, "ranking"),
            window.firestore.orderBy("score", "desc"),
            window.firestore.limit(5)
        );

        const querySnapshot = await window.firestore.getDocs(q);
        
        let html = `
            <div class="leaderboard-container">
                <h3>TOP 5 BUSTERS</h3>
                <table>
                    <thead>
                        <tr><th>Pos</th><th>Nome</th><th>Pontos</th></tr>
                    </thead>
                    <tbody>`;
        
        let i = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            html += `<tr><td>${i}º</td><td>${data.name}</td><td>${data.score}</td></tr>`;
            i++;
        });

        html += `</tbody></table>
                 <button onclick="window.location.reload()" class="btn btn-darkb-grad mt-3">Voltar ao Menu</button>
                 </div>`;
        
        rankingContent.innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        rankingContent.innerHTML = `<p class="text-white">Erro ao conectar com o servidor.</p>`;
    }
}

// Exporta para o escopo global 
window.saveToGlobalRanking = saveToGlobalRanking;
window.displayRanking = displayRanking;
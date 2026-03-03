// leaderboard.js

async function saveToGlobalRanking(playerName, finalScore) {
    // Verificação de segurança: espera o Firebase estar pronto
    if (!window.db || !window.firestore) {
        console.error("Firebase ainda não carregou. Tentando salvar novamente em 1s...");
        setTimeout(() => saveToGlobalRanking(playerName, finalScore), 1000);
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

async function displayRanking() {
    const tbody = document.getElementById('leaderboard-body');
    const loading = document.getElementById('loading-message');
    
    if (!tbody || !loading) return;

    // Se o banco ainda não conectou, espera um pouquinho e tenta de novo
    if (!window.db) {
        loading.style.display = 'block';
        loading.innerText = "Conectando ao servidor...";
        setTimeout(displayRanking, 500);
        return;
    }

    tbody.innerHTML = '';
    loading.style.display = 'block';
    loading.innerText = "Carregando Caçadores...";

    try {
        const q = window.firestore.query(
            window.firestore.collection(window.db, "ranking"),
            window.firestore.orderBy("score", "desc"),
            window.firestore.limit(5)
        );

        const querySnapshot = await window.firestore.getDocs(q);
        
        loading.style.display = 'none';

        let i = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Criar a linha usando Bootstrap
            const row = document.createElement('div');
            row.className = 'row text-center';
            row.style.padding = '12px 0';
            row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            row.style.margin = '0';
            
            // Destaque para o primeiro lugar
            if (i === 1) {
                row.style.color = '#ffd700';
                row.style.fontWeight = 'bold';
                row.style.fontSize = '1.1em';
            }
            
            // Criar as colunas usando Bootstrap
            const colPos = document.createElement('div');
            colPos.className = 'col-3';
            colPos.textContent = `${i}º`;
            
            const colName = document.createElement('div');
            colName.className = 'col-5';
            colName.textContent = data.name;
            
            const colScore = document.createElement('div');
            colScore.className = 'col-4';
            colScore.textContent = data.score;
            
            // Adicionar hover
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(86, 162, 192, 0.1)';
            });
            row.addEventListener('mouseleave', () => {
                row.style.background = 'transparent';
            });
            
            row.appendChild(colPos);
            row.appendChild(colName);
            row.appendChild(colScore);
            tbody.appendChild(row);
            i++;
        });

        // Caso o banco esteja vazio
        if (i === 1) {
            loading.style.display = 'block';
            loading.innerText = "Nenhum recorde ainda. Seja o primeiro!";
        }

    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        loading.innerText = "Erro ao conectar com o servidor.";
    }
}

// Exporta para o escopo global para uso no menu.js e game.js
window.saveToGlobalRanking = saveToGlobalRanking;
window.displayRanking = displayRanking;
const BaccaratGame = {
    app: null,

    init(app) {
        this.app = app;
        this.render();
    },

    render() {
        this.app.clearUI();
        const main = document.getElementById('mainContent');
        
        const container = document.createElement('div');
        container.className = 'form-container';
        container.style.borderColor = 'var(--danger)';
        container.style.maxWidth = '700px';
        container.innerHTML = `
            <h2 style="color: var(--danger); text-align: center; margin-bottom: 30px;">
                <i class="fas fa-crown"></i> БАККАРА
            </h2>
            
            <div style="display: flex; justify-content: space-around; margin: 40px 0;">
                <div style="text-align: center;">
                    <div style="width: 120px; height: 160px; background: white; border-radius: 10px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; border: 3px solid gold;">
                        <span id="playerCard" style="font-size: 3rem; font-weight: bold;">?</span>
                    </div>
                    <div style="color: white; font-weight: bold; margin-bottom: 5px;">ИГРОК</div>
                    <div id="playerScore" style="color: gold; font-size: 1.2rem;">Очки: ?</div>
                </div>
                
                <div style="text-align: center;">
                    <div style="width: 120px; height: 160px; background: white; border-radius: 10px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; border: 3px solid gold;">
                        <span id="bankerCard" style="font-size: 3rem; font-weight: bold;">?</span>
                    </div>
                    <div style="color: white; font-weight: bold; margin-bottom: 5px;">БАНКИР</div>
                    <div id="bankerScore" style="color: gold; font-size: 1.2rem;">Очки: ?</div>
                </div>
            </div>
            
            <div id="baccaratResult" style="text-align: center; font-size: 1.5rem; margin: 30px 0; min-height: 40px;">
                СДЕЛАЙТЕ СТАВКУ
            </div>
            
            <div class="form-group">
                <label class="form-label">СТАВКА НА:</label>
                <div style="display: flex; gap: 10px;">
                    <button id="betPlayer" class="btn" style="flex: 1;" onclick="BaccaratGame.selectBet('player')">ИГРОК</button>
                    <button id="betBanker" class="btn" style="flex: 1;" onclick="BaccaratGame.selectBet('banker')">БАНКИР</button>
                    <button id="betTie" class="btn btn-warning" style="flex: 1;" onclick="BaccaratGame.selectBet('tie')">НИЧЬЯ</button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">СТАВКА:</label>
                <input type="number" id="baccaratBet" class="form-input" value="100" min="1">
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn" onclick="BaccaratGame.addBet(100)">+100</button>
                    <button class="btn" onclick="BaccaratGame.addBet(500)">+500</button>
                    <button class="btn btn-warning" onclick="BaccaratGame.setMaxBet()">MAX</button>
                </div>
            </div>
            
            <button id="playBtn" class="btn btn-danger" style="width: 100%; height: 60px; font-size: 1.5rem;" onclick="BaccaratGame.play()">
                <i class="fas fa-play"></i> ИГРАТЬ
            </button>
            
            <button class="btn" style="width: 100%; margin-top: 20px;" onclick="CasinoApp.showLobby()">
                <i class="fas fa-arrow-left"></i> ВЫХОД
            </button>
        `;
        
        main.appendChild(container);
        
        // Инициализация
        this.selectedBet = 'player';
        this.updateBetButtons();
    },

    addBet(amount) {
        const input = document.getElementById('baccaratBet');
        const current = parseInt(input.value) || 0;
        input.value = current + amount;
    },

    setMaxBet() {
        const input = document.getElementById('baccaratBet');
        input.value = this.app.getBalance();
    },

    selectBet(type) {
        this.selectedBet = type;
        this.updateBetButtons();
    },

    updateBetButtons() {
        const buttons = {
            player: document.getElementById('betPlayer'),
            banker: document.getElementById('betBanker'),
            tie: document.getElementById('betTie')
        };
        
        // Сбрасываем все кнопки
        Object.values(buttons).forEach(btn => {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn');
        });
        
        // Выделяем выбранную
        buttons[this.selectedBet].classList.remove('btn');
        buttons[this.selectedBet].classList.add('btn-danger');
    },

    play() {
        const betInput = document.getElementById('baccaratBet');
        const bet = parseInt(betInput.value);
        
        if (!bet || bet <= 0) {
            this.app.showNotification('Ставка должна быть больше 0', 'error');
            return;
        }
        
        if (bet > this.app.getBalance()) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }
        
        // Снимаем ставку
        this.app.updateBalance(-bet);
        
        // Отключаем кнопки
        const playBtn = document.getElementById('playBtn');
        playBtn.disabled = true;
        betInput.disabled = true;
        
        // Генерируем результат
        setTimeout(() => {
            const playerScore = Math.floor(Math.random() * 10);
            const bankerScore = Math.floor(Math.random() * 10);
            
            // Показываем результат
            document.getElementById('playerCard').textContent = playerScore;
            document.getElementById('bankerCard').textContent = bankerScore;
            document.getElementById('playerScore').textContent = `Очки: ${playerScore}`;
            document.getElementById('bankerScore').textContent = `Очки: ${bankerScore}`;
            
            // Определяем победителя
            let winner = '';
            let winAmount = 0;
            
            if (playerScore > bankerScore) {
                winner = 'player';
            } else if (bankerScore > playerScore) {
                winner = 'banker';
            } else {
                winner = 'tie';
            }
            
            // Определяем выигрыш
            if (this.selectedBet === winner) {
                if (winner === 'tie') {
                    winAmount = bet * 9;
                } else {
                    winAmount = bet * 2;
                }
            }
            
            // Обновляем баланс
            if (winAmount > 0) {
                this.app.updateBalance(winAmount);
                this.app.showNotification(`Вы выиграли ${winAmount}$!`, 'success');
            }
            
            // Показываем результат
            const resultDiv = document.getElementById('baccaratResult');
            const winnerText = winner === 'player' ? 'ИГРОК' : winner === 'banker' ? 'БАНКИР' : 'НИЧЬЯ';
            resultDiv.innerHTML = `
                <div style="color: ${winAmount > 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: bold;">
                    ПОБЕДА: ${winnerText} ${winAmount > 0 ? '+ ' + winAmount + '$' : ''}
                </div>
                <div style="color: gold; margin-top: 10px;">
                    ${playerScore} : ${bankerScore}
                </div>
            `;
            
            // Восстанавливаем кнопки
            playBtn.disabled = false;
            betInput.disabled = false;
        }, 1000);
    }
};
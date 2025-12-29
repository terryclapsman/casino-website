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
                    <div style="width: 120px; height: 160px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); border-radius: 10px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; border: 3px solid #3498db; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <span id="playerCard" style="font-size: 3rem; font-weight: bold; color: #2c3e50; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">?</span>
                    </div>
                    <div style="color: #3498db; font-weight: bold; margin-bottom: 5px; font-size: 1.2rem;">ИГРОК</div>
                    <div id="playerScore" style="color: gold; font-size: 1.2rem; font-weight: bold;">Очки: ?</div>
                </div>
                
                <div style="text-align: center;">
                    <div style="width: 120px; height: 160px; background: linear-gradient(135deg, #f5f5f5, #e0e0e0); border-radius: 10px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; border: 3px solid #e74c3c; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <span id="bankerCard" style="font-size: 3rem; font-weight: bold; color: #2c3e50; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">?</span>
                    </div>
                    <div style="color: #e74c3c; font-weight: bold; margin-bottom: 5px; font-size: 1.2rem;">БАНКИР</div>
                    <div id="bankerScore" style="color: gold; font-size: 1.2rem; font-weight: bold;">Очки: ?</div>
                </div>
            </div>
            
            <div id="baccaratResult" style="text-align: center; font-size: 1.5rem; margin: 30px 0; min-height: 40px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                СДЕЛАЙТЕ СТАВКУ
            </div>
            
            <div class="form-group">
                <label class="form-label" style="color: var(--text-light); font-size: 1.1rem;">СТАВКА НА:</label>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="betPlayer" class="btn" style="flex: 1; background: #3498db; color: white; font-weight: bold; font-size: 1.1rem; height: 50px;" onclick="BaccaratGame.selectBet('player')">
                        <i class="fas fa-user"></i> ИГРОК
                    </button>
                    <button id="betBanker" class="btn" style="flex: 1; background: #e74c3c; color: white; font-weight: bold; font-size: 1.1rem; height: 50px;" onclick="BaccaratGame.selectBet('banker')">
                        <i class="fas fa-landmark"></i> БАНКИР
                    </button>
                    <button id="betTie" class="btn btn-warning" style="flex: 1; color: #000; font-weight: bold; font-size: 1.1rem; height: 50px;" onclick="BaccaratGame.selectBet('tie')">
                        <i class="fas fa-equals"></i> НИЧЬЯ
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label" style="color: var(--text-light); font-size: 1.1rem;">СТАВКА:</label>
                <input type="number" id="baccaratBet" class="form-input" value="100" min="1" style="font-size: 1.2rem; height: 50px;">
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn" onclick="BaccaratGame.addBet(100)" style="flex: 1; background: #444; height: 40px;">+100</button>
                    <button class="btn" onclick="BaccaratGame.addBet(500)" style="flex: 1; background: #444; height: 40px;">+500</button>
                    <button class="btn btn-warning" onclick="BaccaratGame.setMaxBet()" style="flex: 1; height: 40px;">MAX</button>
                </div>
            </div>
            
            <button id="playBtn" class="btn btn-danger" style="width: 100%; height: 60px; font-size: 1.5rem; font-weight: bold; margin-top: 10px;" onclick="BaccaratGame.play()">
                <i class="fas fa-play"></i> ИГРАТЬ
            </button>
            
            <button class="btn" style="width: 100%; margin-top: 20px; height: 50px; font-size: 1.2rem;" onclick="CasinoApp.showLobby()">
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
            btn.style.opacity = '0.7';
            btn.style.transform = 'scale(0.95)';
        });
        
        // Выделяем выбранную
        buttons[this.selectedBet].style.opacity = '1';
        buttons[this.selectedBet].style.transform = 'scale(1)';
        buttons[this.selectedBet].style.boxShadow = '0 0 15px rgba(255,255,255,0.5)';
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
        playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ИГРА...';
        betInput.disabled = true;
        
        // Генерируем результат
        setTimeout(() => {
            const playerScore = Math.floor(Math.random() * 10);
            const bankerScore = Math.floor(Math.random() * 10);
            
            // Показываем результат с анимацией
            const playerCard = document.getElementById('playerCard');
            const bankerCard = document.getElementById('bankerCard');
            
            playerCard.textContent = playerScore;
            bankerCard.textContent = bankerScore;
            
            document.getElementById('playerScore').textContent = `Очки: ${playerScore}`;
            document.getElementById('bankerScore').textContent = `Очки: ${bankerScore}`;
            
            // Анимация появления
            playerCard.style.animation = 'pulse 0.5s ease 2';
            bankerCard.style.animation = 'pulse 0.5s ease 2';
            
            setTimeout(() => {
                playerCard.style.animation = '';
                bankerCard.style.animation = '';
            }, 1000);
            
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
            }
            
            // Показываем результат
            const resultDiv = document.getElementById('baccaratResult');
            const winnerText = winner === 'player' ? 'ИГРОК' : winner === 'banker' ? 'БАНКИР' : 'НИЧЬЯ';
            const winnerColor = winner === 'player' ? '#3498db' : winner === 'banker' ? '#e74c3c' : '#f39c12';
            
            resultDiv.innerHTML = `
                <div style="color: ${winnerColor}; font-weight: bold; font-size: 1.8rem; margin-bottom: 10px;">
                    ПОБЕДА: ${winnerText}
                </div>
                <div style="color: ${winAmount > 0 ? 'var(--success)' : 'var(--danger)'}; font-size: 1.6rem; font-weight: bold;">
                    ${winAmount > 0 ? '+ ' + winAmount + '$' : 'Вы проиграли'}
                </div>
                <div style="color: gold; margin-top: 10px; font-size: 1.3rem;">
                    ${playerScore} : ${bankerScore}
                </div>
            `;
            
            // Подсветка выигравшей стороны
            if (winner === 'player') {
                document.querySelector('div:has(#playerCard)').style.animation = 'pulse 0.5s ease 3';
            } else if (winner === 'banker') {
                document.querySelector('div:has(#bankerCard)').style.animation = 'pulse 0.5s ease 3';
            }
            
            // Восстанавливаем кнопки
            playBtn.disabled = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> ИГРАТЬ';
            betInput.disabled = false;
            
            // Показываем уведомление
            if (winAmount > 0) {
                this.app.showNotification(`Вы выиграли ${winAmount}$!`, 'success');
            } else {
                this.app.showNotification('Ставка не сыграла', 'warning');
            }
        }, 1000);
    }
};
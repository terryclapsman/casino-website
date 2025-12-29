const DiceGame = {
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
        container.style.borderColor = 'var(--purple)';
        container.style.maxWidth = '600px';
        container.innerHTML = `
            <h2 style="color: var(--purple); text-align: center; margin-bottom: 30px;">
                <i class="fas fa-dice"></i> КОСТИ
            </h2>
            
            <div id="diceResult" style="text-align: center; font-size: 5rem; margin: 40px 0;">
                🎲 🎲
            </div>
            
            <div class="form-group">
                <label class="form-label">ВЫБЕРИТЕ СТАВКУ:</label>
                <select id="diceMode" class="form-input">
                    <option value="high">Больше 7</option>
                    <option value="low">Меньше 7</option>
                    <option value="seven">Ровно 7</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">СТАВКА:</label>
                <input type="number" id="diceBet" class="form-input" value="100" min="1">
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn" onclick="DiceGame.addBet(100)">+100</button>
                    <button class="btn" onclick="DiceGame.addBet(500)">+500</button>
                    <button class="btn btn-warning" onclick="DiceGame.setMaxBet()">MAX</button>
                </div>
            </div>
            
            <button id="rollBtn" class="btn btn-purple" style="width: 100%; height: 60px; font-size: 1.5rem;" onclick="DiceGame.roll()">
                <i class="fas fa-dice"></i> БРОСИТЬ КОСТИ
            </button>
            
            <button class="btn" style="width: 100%; margin-top: 20px;" onclick="CasinoApp.showLobby()">
                <i class="fas fa-arrow-left"></i> НАЗАД
            </button>
        `;
        
        main.appendChild(container);
    },

    addBet(amount) {
        const input = document.getElementById('diceBet');
        const current = parseInt(input.value) || 0;
        input.value = current + amount;
    },

    setMaxBet() {
        const input = document.getElementById('diceBet');
        input.value = this.app.getBalance();
    },

    roll() {
        const betInput = document.getElementById('diceBet');
        const bet = parseInt(betInput.value);
        const mode = document.getElementById('diceMode').value;
        
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
        
        // Отключаем кнопку
        const rollBtn = document.getElementById('rollBtn');
        rollBtn.disabled = true;
        betInput.disabled = true;
        
        // Анимация броска
        this.animateDice(() => {
            // Бросаем кости
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const sum = dice1 + dice2;
            
            // Показываем результат
            const diceResult = document.getElementById('diceResult');
            diceResult.textContent = `${dice1}   ${dice2}`;
            
            // Определяем выигрыш
            let winAmount = 0;
            let message = '';
            
            if ((mode === 'high' && sum > 7) || 
                (mode === 'low' && sum < 7)) {
                winAmount = bet * 2;
                message = `Выпало ${sum}! Вы выиграли ${winAmount}$`;
            } else if (mode === 'seven' && sum === 7) {
                winAmount = bet * 5;
                message = `ДЖЕКПОТ! Выпало 7! Вы выиграли ${winAmount}$`;
            } else {
                message = `Выпало ${sum}. Вы проиграли`;
            }
            
            // Обновляем баланс
            if (winAmount > 0) {
                this.app.updateBalance(winAmount);
                this.app.showNotification(`Вы выиграли ${winAmount}$!`, 'success');
            }
            
            // Показываем сообщение
            this.app.showNotification(message, winAmount > 0 ? 'success' : 'warning');
            
            // Восстанавливаем кнопку
            rollBtn.disabled = false;
            betInput.disabled = false;
        });
    },

    animateDice(callback) {
        const diceResult = document.getElementById('diceResult');
        const frames = 15;
        let currentFrame = 0;
        
        const animate = () => {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            diceResult.textContent = `${dice1}   ${dice2}`;
            
            currentFrame++;
            
            if (currentFrame < frames) {
                setTimeout(animate, 50);
            } else {
                callback();
            }
        };
        
        animate();
    }
};
const SlotsGame = {
    app: null,
    symbols: ['🍒', '🍋', '🍇', '💎', '7', '🔔'],
    reels: [null, null, null],
    spinning: false,

    init(app) {
        this.app = app;
        this.render();
    },

    render() {
        this.app.clearUI();
        const main = document.getElementById('mainContent');
        
        const container = document.createElement('div');
        container.className = 'slots-container';
        container.innerHTML = `
            <h2 style="color: var(--warning); text-align: center; margin-bottom: 30px; font-size: 3rem;">
                🎰 MEGA JACKPOT 🎰
            </h2>
            
            <div class="slots-machine">
                <div id="slotsReels" class="slots-reels">
                    <div class="slot-reel" id="reel1">7</div>
                    <div class="slot-reel" id="reel2">7</div>
                    <div class="slot-reel" id="reel3">7</div>
                </div>
                
                <div id="slotsMessage" style="text-align: center; font-size: 1.5rem; margin: 30px 0; min-height: 40px;">
                    СДЕЛАЙТЕ СТАВКУ
                </div>
            </div>
            
            <div style="background: var(--bg-card); border-radius: 10px; padding: 20px;">
                <div class="form-group">
                    <label class="form-label">СТАВКА:</label>
                    <input type="number" id="slotsBet" class="form-input" value="100" min="1">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn" onclick="SlotsGame.addBet(100)">+100</button>
                        <button class="btn" onclick="SlotsGame.addBet(500)">+500</button>
                        <button class="btn btn-warning" onclick="SlotsGame.setMaxBet()">MAX</button>
                    </div>
                </div>
                
                <button id="spinBtn" class="btn btn-warning" style="width: 100%; height: 60px; font-size: 1.5rem; margin-top: 20px;" onclick="SlotsGame.spin()">
                    <i class="fas fa-redo"></i> КРУТИТЬ
                </button>
            </div>
            
            <button class="btn" style="margin-top: 20px;" onclick="CasinoApp.showLobby()">
                <i class="fas fa-arrow-left"></i> НАЗАД
            </button>
        `;
        
        main.appendChild(container);
    },

    addBet(amount) {
        const input = document.getElementById('slotsBet');
        const current = parseInt(input.value) || 0;
        input.value = current + amount;
    },

    setMaxBet() {
        const input = document.getElementById('slotsBet');
        input.value = this.app.getBalance();
    },

    spin() {
        if (this.spinning) return;
        
        const betInput = document.getElementById('slotsBet');
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
        this.spinning = true;
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;
        betInput.disabled = true;
        
        // Генерируем результат заранее
        this.reels = [
            this.symbols[Math.floor(Math.random() * this.symbols.length)],
            this.symbols[Math.floor(Math.random() * this.symbols.length)],
            this.symbols[Math.floor(Math.random() * this.symbols.length)]
        ];
        
        // Анимация вращения
        this.animateReels(() => {
            // Показываем результат
            document.getElementById('reel1').textContent = this.reels[0];
            document.getElementById('reel2').textContent = this.reels[1];
            document.getElementById('reel3').textContent = this.reels[2];
            
            // Определяем выигрыш
            let winAmount = 0;
            let message = '';
            let messageColor = 'gray';
            
            if (this.reels[0] === this.reels[1] && this.reels[1] === this.reels[2]) {
                // Джекпот
                winAmount = bet * 20;
                message = `ДЖЕКПОТ! +${winAmount}$`;
                messageColor = 'var(--warning)';
                
                // Анимация выигрыша
                document.getElementById('slotsReels').classList.add('win-animation');
                setTimeout(() => {
                    document.getElementById('slotsReels').classList.remove('win-animation');
                }, 1500);
            } else if (this.reels[0] === this.reels[1] || this.reels[1] === this.reels[2] || this.reels[0] === this.reels[2]) {
                // Пара
                winAmount = bet * 3;
                message = `Пара! +${winAmount}$`;
                messageColor = 'var(--success)';
            } else {
                message = 'Пусто...';
            }
            
            // Обновляем баланс и сообщение
            if (winAmount > 0) {
                this.app.updateBalance(winAmount);
                this.app.showNotification(`Вы выиграли ${winAmount}$!`, 'success');
            }
            
            document.getElementById('slotsMessage').innerHTML = `
                <div style="color: ${messageColor}; font-weight: bold;">${message}</div>
            `;
            
            // Восстанавливаем кнопку
            this.spinning = false;
            spinBtn.disabled = false;
            betInput.disabled = false;
        });
    },

    animateReels(callback) {
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];
        
        const spins = 20;
        let currentSpin = 0;
        
        const animate = () => {
            // Показываем случайные символы во время вращения
            reels.forEach(reel => {
                reel.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            });
            
            currentSpin++;
            
            if (currentSpin < spins) {
                // Ускоряемся, затем замедляемся
                const speed = currentSpin < 10 ? 50 : 100 + (currentSpin - 10) * 20;
                setTimeout(animate, speed);
            } else {
                callback();
            }
        };
        
        animate();
    }
};
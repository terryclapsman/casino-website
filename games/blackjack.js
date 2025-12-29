const BlackjackGame = {
    app: null,
    deck: [],
    playerHand: [],
    dealerHand: [],
    bet: 0,
    gameActive: false,

    init(app) {
        this.app = app;
        this.render();
    },

    render() {
        this.app.clearUI();
        const main = document.getElementById('mainContent');
        
        const container = document.createElement('div');
        container.className = 'blackjack-table';
        container.innerHTML = `
            <h2 style="text-align: center; color: #2980b9; margin-bottom: 30px;">
                <i class="fas fa-club"></i> БЛЭКДЖЕК
            </h2>
            
            <div id="bjTable" style="background: #0b3822; border-radius: 20px; padding: 30px; border: 5px solid #3c2f2f;">
                <!-- Дилер -->
                <div style="margin-bottom: 50px;">
                    <h3 style="color: white; margin-bottom: 20px;">ДИЛЕР:</h3>
                    <div id="dealerCards" class="cards-container"></div>
                    <div id="dealerScore" style="text-align: center; color: white; font-size: 1.2rem;"></div>
                </div>
                
                <!-- Игрок -->
                <div>
                    <h3 style="color: white; margin-bottom: 20px;">ВАШИ КАРТЫ:</h3>
                    <div id="playerCards" class="cards-container"></div>
                    <div id="playerScore" style="text-align: center; color: white; font-size: 1.2rem; margin-bottom: 30px;"></div>
                </div>
            </div>
            
            <div id="bjMessage" style="text-align: center; font-size: 1.5rem; margin: 20px 0; min-height: 60px;"></div>
            
            <div style="background: #082818; border-radius: 10px; padding: 20px; margin-top: 30px;">
                <div class="form-group">
                    <label class="form-label">СТАВКА:</label>
                    <input type="number" id="bjBet" class="form-input" value="100" min="1">
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn" onclick="BlackjackGame.addBet(100)">+100</button>
                        <button class="btn" onclick="BlackjackGame.addBet(500)">+500</button>
                        <button class="btn btn-warning" onclick="BlackjackGame.setMaxBet()">MAX</button>
                    </div>
                </div>
                
                <div id="bjControls" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-success" onclick="BlackjackGame.deal()" style="flex: 1;">
                        <i class="fas fa-play"></i> РАЗДАТЬ
                    </button>
                </div>
                
                <div id="bjGameControls" style="display: none; gap: 10px; margin-top: 20px;">
                    <button class="btn" onclick="BlackjackGame.hit()" style="flex: 1;">ЕЩЕ</button>
                    <button class="btn btn-danger" onclick="BlackjackGame.stand()" style="flex: 1;">СТОП</button>
                    <button class="btn btn-warning" onclick="BlackjackGame.doubleDown()" style="flex: 1;">УДВОИТЬ</button>
                </div>
            </div>
            
            <button class="btn" style="margin-top: 20px;" onclick="CasinoApp.showLobby()">
                <i class="fas fa-arrow-left"></i> В МЕНЮ
            </button>
        `;
        
        main.appendChild(container);
    },

    addBet(amount) {
        const input = document.getElementById('bjBet');
        const current = parseInt(input.value) || 0;
        input.value = current + amount;
    },

    setMaxBet() {
        const input = document.getElementById('bjBet');
        input.value = this.app.getBalance();
    },

    createDeck() {
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suits = ['♠', '♣', '♥', '♦'];
        this.deck = [];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({ rank, suit, color: suit === '♥' || suit === '♦' ? 'red' : 'black' });
            }
        }
        
        // Тасовка
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },

    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.rank === 'A') {
                score += 11;
                aces++;
            } else if (['K', 'Q', 'J'].includes(card.rank)) {
                score += 10;
            } else {
                score += parseInt(card.rank);
            }
        }
        
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        
        return score;
    },

    renderCards() {
        const dealerCards = document.getElementById('dealerCards');
        const playerCards = document.getElementById('playerCards');
        const dealerScore = document.getElementById('dealerScore');
        const playerScore = document.getElementById('playerScore');
        
        dealerCards.innerHTML = '';
        playerCards.innerHTML = '';
        
        // Карты дилера
        this.dealerHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.color}`;
            if (index === 1 && this.gameActive) {
                cardEl.className = 'card card-back';
                cardEl.textContent = '?';
            } else {
                cardEl.innerHTML = `<span style="color: ${card.color}">${card.rank}${card.suit}</span>`;
            }
            dealerCards.appendChild(cardEl);
        });
        
        // Карты игрока
        this.playerHand.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.color}`;
            cardEl.innerHTML = `<span style="color: ${card.color}">${card.rank}${card.suit}</span>`;
            playerCards.appendChild(cardEl);
        });
        
        // Очки
        if (this.gameActive) {
            dealerScore.textContent = 'Очки: ?';
        } else {
            const dScore = this.calculateScore(this.dealerHand);
            dealerScore.textContent = `Очки: ${dScore}`;
            dealerScore.style.color = dScore > 21 ? '#e74c3c' : '#2ecc71';
        }
        
        const pScore = this.calculateScore(this.playerHand);
        playerScore.textContent = `Ваши очки: ${pScore}`;
        playerScore.style.color = pScore > 21 ? '#e74c3c' : '#2ecc71';
    },

    deal() {
        const betInput = document.getElementById('bjBet');
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
        this.bet = bet;
        this.gameActive = true;
        
        // Создаем колоду и раздаем
        this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.dealerHand = [this.deck.pop(), this.deck.pop()];
        
        // Обновляем интерфейс
        this.renderCards();
        
        // Показываем/скрываем элементы управления
        document.getElementById('bjControls').style.display = 'none';
        document.getElementById('bjGameControls').style.display = 'flex';
        document.getElementById('bjBet').disabled = true;
        
        // Проверяем блэкджек
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        
        if (playerScore === 21) {
            if (dealerScore === 21) {
                this.endGame('Ничья! Оба имеют блэкджек', 1);
            } else {
                this.endGame('Блэкджек! Вы выиграли', 2.5);
            }
        }
        
        this.updateMessage('Ваш ход');
    },

    hit() {
        this.playerHand.push(this.deck.pop());
        this.renderCards();
        
        const score = this.calculateScore(this.playerHand);
        
        if (score > 21) {
            this.endGame('Перебор!', 0);
        } else if (score === 21) {
            this.stand();
        }
    },

    stand() {
        this.gameActive = false;
        this.renderCards();
        
        // Ход дилера
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.deck.pop());
            this.renderCards();
        }
        
        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);
        
        if (dealerScore > 21 || playerScore > dealerScore) {
            this.endGame('Вы выиграли!', 2);
        } else if (playerScore < dealerScore) {
            this.endGame('Дилер выиграл', 0);
        } else {
            this.endGame('Ничья!', 1);
        }
    },

    doubleDown() {
        if (this.app.getBalance() >= this.bet) {
            // Снимаем еще одну ставку
            this.app.updateBalance(-this.bet);
            this.bet *= 2;
            
            // Берем одну карту
            this.hit();
            
            // Если не перебор, дилер ходит
            if (this.calculateScore(this.playerHand) <= 21) {
                this.stand();
            }
        } else {
            this.app.showNotification('Недостаточно средств для удвоения', 'error');
        }
    },

    endGame(message, multiplier) {
        this.gameActive = false;
        
        const winAmount = Math.floor(this.bet * multiplier);
        if (winAmount > 0) {
            this.app.updateBalance(winAmount);
        }
        
        this.updateMessage(`${message} ${winAmount > 0 ? '+ ' + winAmount + '$' : ''}`);
        
        // Восстанавливаем элементы управления
        document.getElementById('bjControls').style.display = 'block';
        document.getElementById('bjGameControls').style.display = 'none';
        document.getElementById('bjBet').disabled = false;
        
        // Показываем уведомление
        if (winAmount > 0) {
            this.app.showNotification(`Вы выиграли ${winAmount}$!`, 'success');
        }
    },

    updateMessage(text) {
        document.getElementById('bjMessage').textContent = text;
    }
};
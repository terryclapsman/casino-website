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
                    <h3 style="color: white; margin-bottom: 20px; text-align: center;">ДИЛЕР:</h3>
                    <div id="dealerCards" class="cards-container"></div>
                    <div id="dealerScore" style="text-align: center; color: white; font-size: 1.2rem;"></div>
                </div>
                
                <!-- Игрок -->
                <div>
                    <h3 style="color: white; margin-bottom: 20px; text-align: center;">ВАШИ КАРТЫ:</h3>
                    <div id="playerCards" class="cards-container"></div>
                    <div id="playerScore" style="text-align: center; color: white; font-size: 1.2rem; margin-bottom: 30px;"></div>
                </div>
            </div>
            
            <div id="bjMessage" style="text-align: center; font-size: 1.5rem; margin: 20px 0; min-height: 60px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px;"></div>
            
            <div style="background: #082818; border-radius: 10px; padding: 20px; margin-top: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                <!-- Центрированный блок ставки -->
                <div class="form-group" style="text-align: center;">
                    <label class="form-label" style="color: white; font-size: 1.2rem; display: block; margin-bottom: 15px;">СТАВКА:</label>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <input type="number" id="bjBet" class="form-input" value="100" min="1" style="width: 200px; text-align: center; font-size: 1.3rem; height: 50px;">
                    </div>
                    
                    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                        <button class="btn" onclick="BlackjackGame.addBet(100)" style="min-width: 80px; height: 40px;">+100</button>
                        <button class="btn" onclick="BlackjackGame.addBet(500)" style="min-width: 80px; height: 40px;">+500</button>
                        <button class="btn" onclick="BlackjackGame.addBet(1000)" style="min-width: 80px; height: 40px;">+1000</button>
                        <button class="btn btn-warning" onclick="BlackjackGame.setMaxBet()" style="min-width: 80px; height: 40px;">MAX</button>
                    </div>
                </div>
                
                <div id="bjControls" style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-success" onclick="BlackjackGame.deal()" style="width: 200px; height: 60px; font-size: 1.3rem; font-weight: bold;">
                        <i class="fas fa-play"></i> РАЗДАТЬ
                    </button>
                </div>
                
                <div id="bjGameControls" style="display: none; justify-content: center; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                    <button class="btn" onclick="BlackjackGame.hit()" style="min-width: 120px; height: 50px; font-size: 1.1rem;">
                        <i class="fas fa-plus"></i> ЕЩЕ
                    </button>
                    <button class="btn btn-danger" onclick="BlackjackGame.stand()" style="min-width: 120px; height: 50px; font-size: 1.1rem;">
                        <i class="fas fa-hand"></i> СТОП
                    </button>
                    <button class="btn btn-warning" onclick="BlackjackGame.doubleDown()" style="min-width: 140px; height: 50px; font-size: 1.1rem;">
                        <i class="fas fa-times-circle"></i> УДВОИТЬ
                    </button>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn" onclick="CasinoApp.showLobby()" style="width: 200px; height: 50px; font-size: 1.1rem;">
                    <i class="fas fa-arrow-left"></i> В МЕНЮ
                </button>
            </div>
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
        
        this.updateMessage('Ваш ход. Выберите действие');
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
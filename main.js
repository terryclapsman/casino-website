// Основной объект казино
const CasinoApp = {
    currentUser: null,
    db: {},
    games: [
        {
            id: 'roulette',
            name: 'РУЛЕТКА',
            description: 'Classic European',
            color: '#27ae60',
            icon: 'fas fa-compass'
        },
        {
            id: 'blackjack',
            name: 'БЛЭКДЖЕК',
            description: '21 + Double Down',
            color: '#2980b9',
            icon: 'fas fa-club'
        },
        {
            id: 'slots',
            name: 'СЛОТЫ',
            description: 'Jackpot x20',
            color: '#f39c12',
            icon: 'fas fa-slot-machine'
        },
        {
            id: 'dice',
            name: 'КОСТИ',
            description: 'Dice High/Low',
            color: '#8e44ad',
            icon: 'fas fa-dice'
        },
        {
            id: 'baccarat',
            name: 'БАККАРА',
            description: 'Player vs Banker',
            color: '#c0392b',
            icon: 'fas fa-crown'
        }
    ],

    init() {
        this.loadDatabase();
        this.loadSession();
        this.renderNavigation();
        this.showLobby();
        
        // Назначаем обработчик для логотипа
        document.querySelector('.logo').addEventListener('click', () => this.showLobby());
    },

    // Загрузка данных
    loadDatabase() {
        const saved = localStorage.getItem('casino_db');
        this.db = saved ? JSON.parse(saved) : {};
    },

    saveDatabase() {
        localStorage.setItem('casino_db', JSON.stringify(this.db));
    },

    // Сессии
    loadSession() {
        const session = localStorage.getItem('casino_session');
        if (session) {
            const data = JSON.parse(session);
            if (data.currentUser && this.db[data.currentUser]) {
                this.currentUser = data.currentUser;
            }
        }
    },

    saveSession() {
        if (this.currentUser) {
            localStorage.setItem('casino_session', JSON.stringify({
                currentUser: this.currentUser,
                lastLogin: new Date().toISOString()
            }));
        }
    },

    clearSession() {
        localStorage.removeItem('casino_session');
    },

    // Обновление баланса
    updateBalance(amount) {
        if (this.currentUser && this.db[this.currentUser]) {
            this.db[this.currentUser].balance += amount;
            this.saveDatabase();
            this.renderNavigation();
            return this.db[this.currentUser].balance;
        }
        return 0;
    },

    getBalance() {
        return this.currentUser ? this.db[this.currentUser].balance : 0;
    },

    // Очистка интерфейса
    clearUI() {
        const main = document.getElementById('mainContent');
        main.innerHTML = '';
    },

    // Навигация
    renderNavigation() {
        const navRight = document.getElementById('navRight');
        navRight.innerHTML = '';

        if (this.currentUser) {
            const balance = this.db[this.currentUser].balance;
            
            // Баланс
            const balanceEl = document.createElement('div');
            balanceEl.className = 'balance-display';
            balanceEl.innerHTML = `<i class="fas fa-coins"></i> ${balance.toLocaleString()}$`;
            navRight.appendChild(balanceEl);

            // Информация о пользователе
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const avatar = this.db[this.currentUser].avatar || '';
            if (avatar) {
                const img = document.createElement('img');
                img.src = avatar;
                img.className = 'avatar';
                img.alt = 'Аватар';
                userInfo.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-circle avatar-placeholder';
                icon.style.fontSize = '2rem';
                userInfo.appendChild(icon);
            }

            const username = document.createElement('span');
            username.textContent = this.currentUser;
            username.style.fontWeight = '600';
            userInfo.appendChild(username);

            navRight.appendChild(userInfo);

            // Кнопки
            const profileBtn = document.createElement('button');
            profileBtn.className = 'btn btn-secondary';
            profileBtn.innerHTML = '<i class="fas fa-user-cog"></i> КАБИНЕТ';
            profileBtn.onclick = () => this.showProfile();
            navRight.appendChild(profileBtn);

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn btn-danger';
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> ВЫЙТИ';
            logoutBtn.onclick = () => this.logout();
            navRight.appendChild(logoutBtn);
        } else {
            const loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-primary';
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ВХОД';
            loginBtn.onclick = () => this.showLogin();
            navRight.appendChild(loginBtn);

            const registerBtn = document.createElement('button');
            registerBtn.className = 'btn btn-secondary';
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> РЕГИСТРАЦИЯ';
            registerBtn.onclick = () => this.showRegister();
            navRight.appendChild(registerBtn);
        }
    },

    // Лобби
    showLobby() {
        this.clearUI();
        const main = document.getElementById('mainContent');
        
        const container = document.createElement('div');
        container.className = 'lobby-container';
        
        const title = document.createElement('h1');
        title.className = 'lobby-title';
        title.textContent = 'ВЫБЕРИТЕ ИГРУ';
        container.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'games-grid';

        this.games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.style.borderColor = game.color;
            card.onclick = () => this.startGame(game.id);

            const icon = document.createElement('div');
            icon.className = 'game-icon';
            icon.style.color = game.color;
            icon.innerHTML = `<i class="${game.icon}"></i>`;
            card.appendChild(icon);

            const title = document.createElement('h2');
            title.className = 'game-title';
            title.textContent = game.name;
            title.style.color = game.color;
            card.appendChild(title);

            const desc = document.createElement('p');
            desc.className = 'game-desc';
            desc.textContent = game.description;
            card.appendChild(desc);

            const playBtn = document.createElement('button');
            playBtn.className = 'btn';
            playBtn.style.backgroundColor = game.color;
            playBtn.style.color = game.color === '#f39c12' ? '#000' : '#fff';
            playBtn.innerHTML = '<i class="fas fa-play"></i> ИГРАТЬ';
            playBtn.onclick = (e) => {
                e.stopPropagation();
                this.startGame(game.id);
            };
            card.appendChild(playBtn);

            grid.appendChild(card);
        });

        container.appendChild(grid);
        main.appendChild(container);
    },

    // Вход/выход
    showLogin() {
        this.clearUI();
        const main = document.getElementById('mainContent');
        
        const form = document.createElement('div');
        form.className = 'form-container';
        form.style.borderColor = 'var(--primary)';
        
        const title = document.createElement('h2');
        title.className = 'form-title';
        title.textContent = 'ВХОД В СИСТЕМУ';
        title.style.color = 'var(--primary)';
        form.appendChild(title);

        const loginInput = document.createElement('input');
        loginInput.type = 'text';
        loginInput.className = 'form-input';
        loginInput.placeholder = 'Логин';
        loginInput.id = 'loginUsername';
        form.appendChild(createFormGroup('Логин', loginInput));

        const passInput = document.createElement('input');
        passInput.type = 'password';
        passInput.className = 'form-input';
        passInput.placeholder = 'Пароль';
        passInput.id = 'loginPassword';
        form.appendChild(createFormGroup('Пароль', passInput));

        const loginBtn = document.createElement('button');
        loginBtn.className = 'btn btn-primary';
        loginBtn.style.width = '100%';
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ВОЙТИ';
        loginBtn.onclick = () => this.login();
        form.appendChild(loginBtn);

        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-outline';
        backBtn.style.width = '100%';
        backBtn.style.marginTop = '15px';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> ВЕРНУТЬСЯ';
        backBtn.onclick = () => this.showLobby();
        form.appendChild(backBtn);

        main.appendChild(form);
    },

    showRegister() {
        this.clearUI();
        const main = document.getElementById('mainContent');
        
        const form = document.createElement('div');
        form.className = 'form-container';
        form.style.borderColor = 'var(--secondary)';
        
        const title = document.createElement('h2');
        title.className = 'form-title';
        title.textContent = 'НОВЫЙ ИГРОК';
        title.style.color = 'var(--secondary)';
        form.appendChild(title);

        const loginInput = document.createElement('input');
        loginInput.type = 'text';
        loginInput.className = 'form-input';
        loginInput.placeholder = 'Придумайте логин';
        loginInput.id = 'regUsername';
        form.appendChild(createFormGroup('Логин', loginInput));

        const passInput = document.createElement('input');
        passInput.type = 'password';
        passInput.className = 'form-input';
        passInput.placeholder = 'Пароль (минимум 4 символа)';
        passInput.id = 'regPassword';
        form.appendChild(createFormGroup('Пароль', passInput));

        const registerBtn = document.createElement('button');
        registerBtn.className = 'btn btn-secondary';
        registerBtn.style.width = '100%';
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> СОЗДАТЬ АККАУНТ';
        registerBtn.onclick = () => this.register();
        form.appendChild(registerBtn);

        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-outline';
        backBtn.style.width = '100%';
        backBtn.style.marginTop = '15px';
        backBtn.innerHTML = '<i class="fas fa-times"></i> ОТМЕНА';
        backBtn.onclick = () => this.showLobby();
        form.appendChild(backBtn);

        main.appendChild(form);
    },

    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!username || !password) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        if (this.db[username] && this.db[username].password === hashPassword(password)) {
            this.currentUser = username;
            this.saveSession();
            this.renderNavigation();
            this.showLobby();
            this.showNotification('Успешный вход!', 'success');
        } else {
            this.showNotification('Неверный логин или пароль', 'error');
        }
    },

    register() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        
        if (!username || username.length < 3) {
            this.showNotification('Логин должен быть не менее 3 символов', 'error');
            return;
        }
        
        if (!password || password.length < 4) {
            this.showNotification('Пароль должен быть не менее 4 символов', 'error');
            return;
        }
        
        if (this.db[username]) {
            this.showNotification('Логин уже занят', 'error');
            return;
        }
        
        this.db[username] = {
            password: hashPassword(password),
            balance: 1000,
            avatar: '',
            createdAt: new Date().toISOString()
        };
        
        this.saveDatabase();
        this.showNotification('Аккаунт создан! Бонус: 1000$', 'success');
        this.showLogin();
    },

    logout() {
        this.currentUser = null;
        this.clearSession();
        this.renderNavigation();
        this.showLobby();
        this.showNotification('Вы вышли из системы', 'warning');
    },

    // Профиль
    showProfile() {
        if (!this.currentUser) return;
        
        this.clearUI();
        const main = document.getElementById('mainContent');
        
        const container = document.createElement('div');
        container.className = 'form-container';
        container.style.maxWidth = '800px';
        
        const title = document.createElement('h2');
        title.className = 'form-title';
        title.innerHTML = '<i class="fas fa-user-cog"></i> ЛИЧНЫЙ КАБИНЕТ';
        title.style.color = 'gold';
        container.appendChild(title);

        // Секция аватара
        const avatarSection = document.createElement('div');
        avatarSection.className = 'form-group';
        avatarSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${this.db[this.currentUser].avatar ? 
                    `<img src="${this.db[this.currentUser].avatar}" class="avatar" style="width: 100px; height: 100px;">` :
                    `<i class="fas fa-user-circle" style="font-size: 5rem; color: var(--text-gray);"></i>`
                }
            </div>
            <button class="btn btn-secondary" onclick="CasinoApp.uploadAvatar()">
                <i class="fas fa-upload"></i> Загрузить фото
            </button>
        `;
        container.appendChild(avatarSection);

        // Секция безопасности
        const securitySection = document.createElement('div');
        securitySection.className = 'form-group';
        securitySection.innerHTML = `
            <h3 style="color: var(--text-gray); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <i class="fas fa-shield-alt"></i> БЕЗОПАСНОСТЬ
            </h3>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="newNickname" class="form-input" placeholder="Новый никнейм" style="flex: 1;">
                <button class="btn" onclick="CasinoApp.changeNickname()">Сменить ник</button>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="password" id="currentPassword" class="form-input" placeholder="Текущий пароль" style="flex: 1;">
                <input type="password" id="newPassword" class="form-input" placeholder="Новый пароль" style="flex: 1;">
                <button class="btn btn-warning" onclick="CasinoApp.changePassword()">Сменить пароль</button>
            </div>
        `;
        container.appendChild(securitySection);

        // Секция кассы
        const cashSection = document.createElement('div');
        cashSection.className = 'form-group';
        cashSection.innerHTML = `
            <h3 style="color: var(--text-gray); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <i class="fas fa-wallet"></i> КАССА
            </h3>
            <input type="number" id="cashAmount" class="form-input" placeholder="Сумма" style="margin-bottom: 15px;">
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-success" style="flex: 1;" onclick="CasinoApp.cashOperation(1)">
                    <i class="fas fa-plus"></i> ПОПОЛНИТЬ
                </button>
                <button class="btn btn-danger" style="flex: 1;" onclick="CasinoApp.cashOperation(-1)">
                    <i class="fas fa-minus"></i> ВЫВЕСТИ
                </button>
            </div>
        `;
        container.appendChild(cashSection);

        // Кнопка назад
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-primary';
        backBtn.style.width = '100%';
        backBtn.style.marginTop = '20px';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> ВЕРНУТЬСЯ В ЛОББИ';
        backBtn.onclick = () => this.showLobby();
        container.appendChild(backBtn);

        main.appendChild(container);
    },

    // Утилиты
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Старт игры
    startGame(gameId) {
        if (!this.currentUser) {
            this.showNotification('Сначала войдите в аккаунт!', 'warning');
            this.showLogin();
            return;
        }

        switch(gameId) {
            case 'roulette':
                RouletteGame.init(this);
                break;
            case 'blackjack':
                BlackjackGame.init(this);
                break;
            case 'slots':
                SlotsGame.init(this);
                break;
            case 'dice':
                DiceGame.init(this);
                break;
            case 'baccarat':
                BaccaratGame.init(this);
                break;
        }
    }
};

// Хелперы
function createFormGroup(label, input) {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.textContent = label;
    group.appendChild(labelEl);
    
    group.appendChild(input);
    return group;
}

function hashPassword(password) {
    // Простое хеширование для демонстрации
    return btoa(password).split('').reverse().join('');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    CasinoApp.init();
});
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
            try {
                const data = JSON.parse(session);
                if (data.currentUser && this.db[data.currentUser]) {
                    this.currentUser = data.currentUser;
                }
            } catch (e) {
                console.error('Ошибка загрузки сессии:', e);
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
            const avatar = this.db[this.currentUser].avatar || '';
            
            // Контейнер для правой части
            const rightContainer = document.createElement('div');
            rightContainer.className = 'nav-right-container';
            rightContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            `;
            
            // Баланс
            const balanceEl = document.createElement('div');
            balanceEl.className = 'balance-display';
            balanceEl.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(39, 174, 96, 0.1);
                border-radius: 20px;
                border: 2px solid var(--success);
                font-size: 1.3rem;
                font-weight: bold;
            `;
            balanceEl.innerHTML = `<i class="fas fa-coins" style="color: var(--success);"></i> ${balance.toLocaleString()}$`;
            rightContainer.appendChild(balanceEl);

            // Контейнер для пользователя и кнопок
            const userContainer = document.createElement('div');
            userContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
            `;

            // Информация о пользователе
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(255, 255, 255, 0.05);
                padding: 8px 16px;
                border-radius: var(--border-radius);
                min-width: 150px;
            `;
            
            // Аватар
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'avatar-nav';
            avatarContainer.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(241, 196, 15, 0.1);
                border: 2px solid var(--primary);
                overflow: hidden;
            `;
            
            if (avatar && avatar.startsWith('data:image')) {
                // Если это base64 изображение
                const img = document.createElement('img');
                img.src = avatar;
                img.alt = 'Аватар';
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                `;
                avatarContainer.appendChild(img);
            } else if (avatar) {
                // Если это эмодзи
                const emoji = document.createElement('span');
                emoji.textContent = avatar;
                emoji.style.cssText = `
                    font-size: 1.5rem;
                    line-height: 1;
                `;
                avatarContainer.appendChild(emoji);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-user';
                icon.style.cssText = `
                    font-size: 1.2rem;
                    color: var(--primary);
                `;
                avatarContainer.appendChild(icon);
            }
            
            userInfo.appendChild(avatarContainer);

            // Имя пользователя
            const username = document.createElement('span');
            username.textContent = this.currentUser;
            username.style.cssText = `
                font-weight: 600;
                color: var(--text-light);
                font-size: 1.1rem;
            `;
            userInfo.appendChild(username);

            userContainer.appendChild(userInfo);

            // Кнопки
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                display: flex;
                gap: 10px;
            `;

            const profileBtn = document.createElement('button');
            profileBtn.className = 'btn btn-secondary';
            profileBtn.style.cssText = `
                padding: 8px 16px;
                font-size: 0.9rem;
                white-space: nowrap;
            `;
            profileBtn.innerHTML = '<i class="fas fa-user-cog"></i> КАБИНЕТ';
            profileBtn.onclick = () => this.showProfile();
            buttonsContainer.appendChild(profileBtn);

            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn btn-danger';
            logoutBtn.style.cssText = `
                padding: 8px 16px;
                font-size: 0.9rem;
                white-space: nowrap;
            `;
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> ВЫЙТИ';
            logoutBtn.onclick = () => this.logout();
            buttonsContainer.appendChild(logoutBtn);

            userContainer.appendChild(buttonsContainer);
            rightContainer.appendChild(userContainer);
            navRight.appendChild(rightContainer);
        } else {
            // Для неавторизованных пользователей
            const authContainer = document.createElement('div');
            authContainer.style.cssText = `
                display: flex;
                gap: 15px;
            `;

            const loginBtn = document.createElement('button');
            loginBtn.className = 'btn btn-primary';
            loginBtn.style.cssText = `
                padding: 10px 20px;
                font-size: 1rem;
                font-weight: bold;
            `;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ВХОД';
            loginBtn.onclick = () => this.showLogin();
            authContainer.appendChild(loginBtn);

            const registerBtn = document.createElement('button');
            registerBtn.className = 'btn btn-secondary';
            registerBtn.style.cssText = `
                padding: 10px 20px;
                font-size: 1rem;
                font-weight: bold;
            `;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> РЕГИСТРАЦИЯ';
            registerBtn.onclick = () => this.showRegister();
            authContainer.appendChild(registerBtn);

            navRight.appendChild(authContainer);
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
        if (!this.currentUser) {
            this.showNotification('Сначала войдите в аккаунт', 'warning');
            this.showLogin();
            return;
        }
        
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
        const avatar = this.db[this.currentUser].avatar || '';
        avatarSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${avatar ? 
                    `<div id="avatarPreview" style="width: 150px; height: 150px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 4px solid gold; overflow: hidden; cursor: pointer;">
                        ${avatar.startsWith('data:image') ? 
                            `<img src="${avatar}" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover;">` :
                            `<span style="font-size: 4rem;">${avatar}</span>`
                        }
                    </div>` :
                    `<div id="avatarPreview" style="width: 150px; height: 150px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 4px solid gold; cursor: pointer;">
                        <i class="fas fa-user" style="font-size: 4rem; color: #f1c40f;"></i>
                    </div>`
                }
            </div>
            <div style="text-align: center;">
                <input type="file" id="avatarUpload" accept="image/*" style="display: none;" onchange="CasinoApp.handleAvatarUpload(event)">
                <button class="btn btn-secondary" onclick="document.getElementById('avatarUpload').click()">
                    <i class="fas fa-upload"></i> Загрузить фото
                </button>
                <button class="btn btn-outline" onclick="CasinoApp.uploadRandomAvatar()" style="margin-left: 10px;">
                    <i class="fas fa-random"></i> Случайный аватар
                </button>
                <button class="btn btn-danger" onclick="CasinoApp.resetAvatar()" style="margin-left: 10px;">
                    <i class="fas fa-times"></i> Сбросить
                </button>
            </div>
            <small style="color: var(--text-gray); display: block; text-align: center; margin-top: 10px;">
                Нажмите на аватар для увеличения
            </small>
        `;
        container.appendChild(avatarSection);

        // Добавляем обработчик клика на аватар для просмотра
        setTimeout(() => {
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) {
                avatarPreview.onclick = () => {
                    const avatarUrl = this.db[this.currentUser].avatar;
                    if (avatarUrl && avatarUrl.startsWith('data:image')) {
                        showModal('Аватар', `
                            <div style="text-align: center;">
                                <img src="${avatarUrl}" alt="Аватар" style="max-width: 100%; max-height: 400px; border-radius: 10px;">
                                <div style="margin-top: 20px;">
                                    <button class="btn btn-primary" onclick="closeModal()">Закрыть</button>
                                </div>
                            </div>
                        `);
                    }
                };
            }
        }, 100);

        // Информация об аккаунте
        const infoSection = document.createElement('div');
        infoSection.className = 'form-group';
        infoSection.innerHTML = `
            <h3 style="color: var(--text-gray); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <i class="fas fa-info-circle"></i> ИНФОРМАЦИЯ
            </h3>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: var(--text-gray);">Логин:</span>
                    <span style="font-weight: bold;">${this.currentUser}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: var(--text-gray);">Баланс:</span>
                    <span style="font-weight: bold; color: var(--success);">${this.db[this.currentUser].balance}$</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-gray);">Дата регистрации:</span>
                    <span style="font-weight: bold;">${this.db[this.currentUser].createdAt ? new Date(this.db[this.currentUser].createdAt).toLocaleDateString() : 'Неизвестно'}</span>
                </div>
            </div>
        `;
        container.appendChild(infoSection);

        // Секция безопасности (Ник и Пароль)
        const securitySection = document.createElement('div');
        securitySection.className = 'form-group';
        securitySection.innerHTML = `
            <h3 style="color: var(--text-gray); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <i class="fas fa-shield-alt"></i> БЕЗОПАСНОСТЬ
            </h3>
            
            <!-- Смена Ника -->
            <div style="margin-bottom: 25px;">
                <label class="form-label">Смена никнейма:</label>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <input type="text" id="newNickname" class="form-input" placeholder="Новый никнейм" style="flex: 1;">
                    <button class="btn" onclick="CasinoApp.changeNickname()" style="white-space: nowrap;">
                        <i class="fas fa-user-edit"></i> Сменить
                    </button>
                </div>
            </div>
            
            <!-- Смена Пароля -->
            <div>
                <label class="form-label">Смена пароля:</label>
                <div style="margin-top: 8px;">
                    <input type="password" id="currentPassword" class="form-input" placeholder="Текущий пароль" style="margin-bottom: 10px;">
                    <input type="password" id="newPassword" class="form-input" placeholder="Новый пароль (мин. 4 символа)" style="margin-bottom: 15px;">
                    <button class="btn btn-warning" onclick="CasinoApp.changePassword()" style="width: 100%;">
                        <i class="fas fa-key"></i> Сменить пароль
                    </button>
                </div>
            </div>
        `;
        container.appendChild(securitySection);

        // Секция Кассы
        const cashSection = document.createElement('div');
        cashSection.className = 'form-group';
        cashSection.innerHTML = `
            <h3 style="color: var(--text-gray); margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <i class="fas fa-wallet"></i> КАССА
            </h3>
            <div style="margin-bottom: 15px;">
                <input type="number" id="cashAmount" class="form-input" placeholder="Сумма" min="1">
                <small style="color: var(--text-gray); display: block; margin-top: 5px;">Минимальная сумма: 1$</small>
            </div>
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

    // Функции профиля
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            this.showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }
        
        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Изображение слишком большое (максимум 5MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Сохраняем изображение как base64
            this.db[this.currentUser].avatar = e.target.result;
            this.saveDatabase();
            this.showProfile();
            this.renderNavigation();
            this.showNotification('Аватар успешно загружен!', 'success');
        };
        
        reader.onerror = () => {
            this.showNotification('Ошибка при чтении файла', 'error');
        };
        
        reader.readAsDataURL(file);
    },

    uploadRandomAvatar() {
        const emojiAvatars = ['👤', '👨', '👩', '🧑', '🧔', '👴', '👵', '🦸', '🦹', '🧙', '🧛', '🧟', '🤖', '👽', '🎩', '💀'];
        const randomEmoji = emojiAvatars[Math.floor(Math.random() * emojiAvatars.length)];
        
        this.db[this.currentUser].avatar = randomEmoji;
        this.saveDatabase();
        this.showProfile();
        this.renderNavigation();
        this.showNotification('Случайный аватар установлен!', 'success');
    },

    resetAvatar() {
        this.db[this.currentUser].avatar = '';
        this.saveDatabase();
        this.showProfile();
        this.renderNavigation();
        this.showNotification('Аватар сброшен', 'info');
    },

    changeNickname() {
        const newNickInput = document.getElementById('newNickname');
        const newNick = newNickInput.value.trim();
        
        if (!newNick) {
            this.showNotification('Введите новый никнейм', 'error');
            return;
        }
        
        if (newNick.length < 3) {
            this.showNotification('Никнейм должен быть не менее 3 символов', 'error');
            return;
        }
        
        if (newNick === this.currentUser) {
            this.showNotification('Это ваш текущий никнейм', 'warning');
            return;
        }
        
        if (this.db[newNick]) {
            this.showNotification('Этот никнейм уже занят', 'error');
            return;
        }
        
        // Сохраняем данные текущего пользователя
        const userData = this.db[this.currentUser];
        
        // Удаляем старый аккаунт и создаем новый
        delete this.db[this.currentUser];
        this.db[newNick] = userData;
        this.currentUser = newNick;
        
        this.saveDatabase();
        this.saveSession();
        this.renderNavigation();
        
        // Очищаем поле
        newNickInput.value = '';
        
        this.showNotification('Никнейм успешно изменен!', 'success');
        // Обновляем профиль через секунду, чтобы показать изменения
        setTimeout(() => this.showProfile(), 100);
    },

    changePassword() {
        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        
        if (!currentPass) {
            this.showNotification('Введите текущий пароль', 'error');
            return;
        }
        
        if (!newPass) {
            this.showNotification('Введите новый пароль', 'error');
            return;
        }
        
        if (newPass.length < 4) {
            this.showNotification('Новый пароль должен быть не менее 4 символов', 'error');
            return;
        }
        
        // Проверяем текущий пароль
        if (this.db[this.currentUser].password !== hashPassword(currentPass)) {
            this.showNotification('Неверный текущий пароль', 'error');
            return;
        }
        
        // Меняем пароль
        this.db[this.currentUser].password = hashPassword(newPass);
        this.saveDatabase();
        
        // Очищаем поля
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        
        this.showNotification('Пароль успешно изменен!', 'success');
    },

    cashOperation(multiplier) {
        const amountInput = document.getElementById('cashAmount');
        const amount = parseInt(amountInput.value);
        
        if (!amount || amount <= 0) {
            this.showNotification('Введите корректную сумму', 'error');
            return;
        }
        
        if (multiplier === -1) { // Вывод
            if (amount > this.getBalance()) {
                this.showNotification('Недостаточно средств для вывода', 'error');
                return;
            }
        }
        
        this.updateBalance(amount * multiplier);
        amountInput.value = '';
        
        const operation = multiplier === 1 ? 'пополнен' : 'снят';
        this.showNotification(`Баланс успешно ${operation} на ${amount}$`, 'success');
        
        // Обновляем баланс в навигации
        this.renderNavigation();
    },

    // Утилиты
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
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
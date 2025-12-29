// Основной объект казино (дополненный)
const CasinoApp = {
    // ... остальной код остается без изменений до функций профиля ...

    // Профиль (исправленная версия)
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
                    `<img src="${avatar}" class="avatar" style="width: 100px; height: 100px; border: 3px solid gold;">` :
                    `<div style="width: 100px; height: 100px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 3px solid gold;">
                        <i class="fas fa-user" style="font-size: 3rem; color: #f1c40f;"></i>
                    </div>`
                }
            </div>
            <div style="text-align: center;">
                <button class="btn btn-secondary" onclick="CasinoApp.uploadAvatar()">
                    <i class="fas fa-upload"></i> Загрузить фото
                </button>
                <button class="btn btn-outline" onclick="CasinoApp.resetAvatar()" style="margin-left: 10px;">
                    <i class="fas fa-times"></i> Сбросить
                </button>
            </div>
        `;
        container.appendChild(avatarSection);

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

    // Функции профиля (исправленные)
    uploadAvatar() {
        // В браузере без backend используем эмодзи вместо загрузки файлов
        const emojiAvatars = ['👤', '👨', '👩', '🧑', '🧔', '👴', '👵', '🦸', '🦹', '🧙', '🧛', '🧟', '🤖', '👽', '🎩', '💀'];
        const randomEmoji = emojiAvatars[Math.floor(Math.random() * emojiAvatars.length)];
        
        this.db[this.currentUser].avatar = randomEmoji;
        this.saveDatabase();
        this.showProfile();
        this.showNotification('Аватар обновлен!', 'success');
    },

    resetAvatar() {
        this.db[this.currentUser].avatar = '';
        this.saveDatabase();
        this.showProfile();
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
    }
};

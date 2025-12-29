// Функции для работы с UI

function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Закрытие модального окна по клику вне его
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
        closeModal();
    }
});

// Функции профиля (дополнение к CasinoApp)

CasinoApp.uploadAvatar = function() {
    // В реальном приложении здесь был бы загрузчик файлов
    // Для демо просто создаем случайный аватар
    const avatars = [
        '👤', '👨', '👩', '🧑', '🧔', '👴', '👵', '👨‍💻', '👩‍💻', '🦹', '🦸', '🧙', '🧝', '🧛', '🧟'
    ];
    
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    this.db[this.currentUser].avatar = randomAvatar;
    this.saveDatabase();
    this.showProfile();
    this.showNotification('Аватар обновлен!', 'success');
};

CasinoApp.changeNickname = function() {
    const newNick = document.getElementById('newNickname').value.trim();
    
    if (!newNick) {
        this.showNotification('Введите новый никнейм', 'error');
        return;
    }
    
    if (newNick.length < 3) {
        this.showNotification('Никнейм должен быть не менее 3 символов', 'error');
        return;
    }
    
    if (this.db[newNick]) {
        this.showNotification('Этот никнейм уже занят', 'error');
        return;
    }
    
    // Переносим данные
    const data = this.db[this.currentUser];
    delete this.db[this.currentUser];
    this.db[newNick] = data;
    this.currentUser = newNick;
    
    this.saveDatabase();
    this.saveSession();
    this.showNotification('Никнейм успешно изменен!', 'success');
    this.showProfile();
};

CasinoApp.changePassword = function() {
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    
    if (!currentPass || !newPass) {
        this.showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (this.db[this.currentUser].password !== hashPassword(currentPass)) {
        this.showNotification('Неверный текущий пароль', 'error');
        return;
    }
    
    if (newPass.length < 4) {
        this.showNotification('Новый пароль должен быть не менее 4 символов', 'error');
        return;
    }
    
    this.db[this.currentUser].password = hashPassword(newPass);
    this.saveDatabase();
    
    // Очищаем поля
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    
    this.showNotification('Пароль успешно изменен!', 'success');
};

CasinoApp.cashOperation = function(multiplier) {
    const amountInput = document.getElementById('cashAmount');
    const amount = parseInt(amountInput.value);
    
    if (!amount || amount <= 0) {
        this.showNotification('Введите корректную сумму', 'error');
        return;
    }
    
    if (multiplier === -1 && this.getBalance() < amount) {
        this.showNotification('Недостаточно средств для вывода', 'error');
        return;
    }
    
    this.updateBalance(amount * multiplier);
    amountInput.value = '';
    
    const operation = multiplier === 1 ? 'пополнен' : 'снят';
    this.showNotification(`Баланс успешно ${operation} на ${amount}$`, 'success');
};
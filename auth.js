// Дополнительные функции безопасности

// Улучшенное хеширование пароля
function hashPassword(password) {
    // Более сложное хеширование для безопасности
    let hash = 0;
    const prime = 31;
    
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Преобразуем в 32-битное целое
        hash = (hash * prime) ^ char; // Дополнительное перемешивание
    }
    
    // Преобразуем в строку base36 и добавляем соль
    return (hash >>> 0).toString(36) + password.length.toString(36);
}

// Проверка сессии при загрузке
function checkSession() {
    const session = localStorage.getItem('casino_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            const sessionAge = Date.now() - new Date(data.lastLogin).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа
            
            if (data.currentUser && sessionAge < maxAge) {
                // Проверяем, существует ли пользователь в базе
                const db = JSON.parse(localStorage.getItem('casino_db') || '{}');
                if (db[data.currentUser]) {
                    return data.currentUser;
                }
            }
        } catch (e) {
            console.error('Ошибка при проверке сессии:', e);
        }
    }
    return null;
}

// Обновление сессии при действиях пользователя
function updateSession() {
    if (CasinoApp.currentUser) {
        localStorage.setItem('casino_session', JSON.stringify({
            currentUser: CasinoApp.currentUser,
            lastLogin: new Date().toISOString()
        }));
    }
}

// Автоматический выход при неактивности
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (CasinoApp.currentUser) {
        inactivityTimer = setTimeout(() => {
            CasinoApp.showNotification('Сессия истекла из-за неактивности', 'warning');
            CasinoApp.logout();
        }, 30 * 60 * 1000); // 30 минут
    }
}

// Сброс таймера при активности пользователя
const activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Инициализация таймера при загрузке
resetInactivityTimer();

// Проверка существования пользователя перед действиями
function validateUser() {
    if (!CasinoApp.currentUser) {
        CasinoApp.showNotification('Сначала войдите в аккаунт', 'warning');
        CasinoApp.showLogin();
        return false;
    }
    
    if (!CasinoApp.db[CasinoApp.currentUser]) {
        CasinoApp.showNotification('Ошибка: пользователь не найден', 'error');
        CasinoApp.logout();
        return false;
    }
    
    return true;
}

// Защита от XSS атак
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Валидация имени пользователя
function isValidUsername(username) {
    if (!username || username.length < 3) return false;
    if (username.length > 20) return false;
    // Разрешаем только буквы, цифры и подчеркивания
    return /^[a-zA-Z0-9_]+$/.test(username);
}

// Валидация пароля
function isValidPassword(password) {
    if (!password || password.length < 4) return false;
    if (password.length > 50) return false;
    return true;
}

// Обновляем функции регистрации и входа в CasinoApp
CasinoApp.register = function() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    
    if (!isValidUsername(username)) {
        this.showNotification('Логин должен быть 3-20 символов (только буквы, цифры, _)', 'error');
        return;
    }
    
    if (!isValidPassword(password)) {
        this.showNotification('Пароль должен быть 4-50 символов', 'error');
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
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        totalWins: 0
    };
    
    this.saveDatabase();
    this.showNotification('Аккаунт создан! Бонус: 1000$', 'success');
    this.showLogin();
};

CasinoApp.login = function() {
    const username = document.getElementById('loginUsername').value.trim();
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
        
        // Обновляем статистику входа
        updateSession();
    } else {
        this.showNotification('Неверный логин или пароль', 'error');
    }
};

// Функция для очистки старых сессий
function cleanupOldSessions() {
    const session = localStorage.getItem('casino_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            const sessionAge = Date.now() - new Date(data.lastLogin).getTime();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
            
            if (sessionAge > maxAge) {
                localStorage.removeItem('casino_session');
            }
        } catch (e) {
            console.error('Ошибка при очистке сессий:', e);
        }
    }
}

// Функция для сохранения истории игр
function saveGameHistory(game, bet, result, winAmount) {
    if (!CasinoApp.currentUser) return;
    
    const historyKey = `casino_history_${CasinoApp.currentUser}`;
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    history.push({
        game,
        bet,
        result,
        winAmount,
        timestamp: new Date().toISOString(),
        balance: CasinoApp.db[CasinoApp.currentUser].balance
    });
    
    // Ограничиваем историю последними 100 играми
    if (history.length > 100) {
        history = history.slice(-100);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
}

// Функция для получения истории игр
function getGameHistory() {
    if (!CasinoApp.currentUser) return [];
    
    const historyKey = `casino_history_${CasinoApp.currentUser}`;
    return JSON.parse(localStorage.getItem(historyKey) || '[]');
}

// Функция для обновления статистики пользователя
function updateUserStats(game, winAmount) {
    if (!CasinoApp.currentUser) return;
    
    const user = CasinoApp.db[CasinoApp.currentUser];
    if (!user.stats) {
        user.stats = {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            totalWon: 0,
            totalLost: 0,
            games: {}
        };
    }
    
    user.stats.totalGames++;
    
    if (winAmount > 0) {
        user.stats.totalWins++;
        user.stats.totalWon += winAmount;
    } else {
        user.stats.totalLosses++;
        user.stats.totalLost += Math.abs(winAmount);
    }
    
    if (!user.stats.games[game]) {
        user.stats.games[game] = {
            played: 0,
            won: 0,
            lost: 0,
            wonAmount: 0,
            lostAmount: 0
        };
    }
    
    const gameStats = user.stats.games[game];
    gameStats.played++;
    
    if (winAmount > 0) {
        gameStats.won++;
        gameStats.wonAmount += winAmount;
    } else {
        gameStats.lost++;
        gameStats.lostAmount += Math.abs(winAmount);
    }
    
    CasinoApp.saveDatabase();
}

// Инициализация при загрузке с проверкой сессии
document.addEventListener('DOMContentLoaded', () => {
    // Очищаем старые сессии
    cleanupOldSessions();
    
    // Восстанавливаем сессию
    const savedUser = checkSession();
    if (savedUser) {
        CasinoApp.currentUser = savedUser;
    }
    
    // Инициализируем приложение
    CasinoApp.init();
    
    // Показываем уведомление о восстановлении сессии
    if (savedUser) {
        setTimeout(() => {
            CasinoApp.showNotification(`Добро пожаловать обратно, ${savedUser}!`, 'success');
        }, 1000);
    }
});

// Экспортируем функции для использования в играх
window.AuthHelpers = {
    hashPassword,
    checkSession,
    updateSession,
    validateUser,
    sanitizeInput,
    isValidUsername,
    isValidPassword,
    saveGameHistory,
    getGameHistory,
    updateUserStats
};
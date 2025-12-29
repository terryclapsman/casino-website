// Дополнительные функции безопасности

// В реальном приложении используйте более сложное хеширование
function hashPassword(password) {
    // Простое демо-хеширование
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Проверка сессии при загрузке
function checkSession() {
    const session = localStorage.getItem('casino_session');
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.currentUser && Date.now() - new Date(data.lastLogin).getTime() < 24 * 60 * 60 * 1000) {
                return data.currentUser;
            }
        } catch (e) {
            console.error('Ошибка при проверке сессии:', e);
        }
    }
    return null;
}

// Автоматический выход при неактивности
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (CasinoApp.currentUser) {
            CasinoApp.logout();
            CasinoApp.showNotification('Сессия истекла из-за неактивности', 'warning');
        }
    }, 30 * 60 * 1000); // 30 минут
}

// Сброс таймера при активности пользователя
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Инициализация таймера при загрузке
resetInactivityTimer();
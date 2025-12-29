// Функции для работы с UI

function showModal(title, content, options = {}) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    // Добавляем кнопки если указаны в options
    if (options.buttons) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '10px';
        buttonsContainer.style.marginTop = '20px';
        buttonsContainer.style.justifyContent = 'flex-end';
        
        options.buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = button.class || 'btn';
            btn.textContent = button.text;
            btn.onclick = button.onclick;
            buttonsContainer.appendChild(btn);
        });
        
        modalBody.appendChild(buttonsContainer);
    }
    
    modalOverlay.style.display = 'flex';
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

// Закрытие модального окна по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Функция для создания красивых уведомлений
function createNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    // Ограничиваем количество уведомлений
    if (container.children.length > 3) {
        container.removeChild(container.firstChild);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="${icon}" style="font-size: 1.2rem;"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentNode === container) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Переопределяем showNotification в CasinoApp для использования новой функции
CasinoApp.showNotification = createNotification;

// Дополнительные хелперы
function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '$';
}

function validateBet(bet, maxBet) {
    if (!bet || bet <= 0) {
        return { valid: false, message: 'Ставка должна быть больше 0' };
    }
    if (bet > maxBet) {
        return { valid: false, message: 'Недостаточно средств' };
    }
    return { valid: true, message: '' };
}

// Анимация выигрыша
function animateWin(element) {
    element.classList.add('win-animation');
    setTimeout(() => {
        element.classList.remove('win-animation');
    }, 1000);
}

// Загрузка состояния
function showLoading(text = 'Загрузка...') {
    const main = document.getElementById('mainContent');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-container';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        flex-direction: column;
        gap: 20px;
    `;
    
    loadingDiv.innerHTML = `
        <div class="loading" style="width: 60px; height: 60px;"></div>
        <div style="color: white; font-size: 1.2rem;">${text}</div>
    `;
    
    main.appendChild(loadingDiv);
    return loadingDiv;
}

function hideLoading(loadingDiv) {
    if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.remove();
    }
}

// Инициализация игры с проверкой входа
function initGame(gameName, gameFunction) {
    if (!CasinoApp.currentUser) {
        CasinoApp.showNotification('Сначала войдите в аккаунт!', 'warning');
        CasinoApp.showLogin();
        return;
    }
    
    // Показываем загрузку
    const loading = showLoading(`Запуск ${gameName}...`);
    
    // Имитируем загрузку для плавного перехода
    setTimeout(() => {
        hideLoading(loading);
        gameFunction();
    }, 500);
}

// Обновляем функции запуска игр в CasinoApp
CasinoApp.startGame = function(gameId) {
    const gameMap = {
        'roulette': { name: 'Рулетка', func: () => RouletteGame.init(this) },
        'blackjack': { name: 'Блэкджек', func: () => BlackjackGame.init(this) },
        'slots': { name: 'Слоты', func: () => SlotsGame.init(this) },
        'dice': { name: 'Кости', func: () => DiceGame.init(this) },
        'baccarat': { name: 'Баккара', func: () => BaccaratGame.init(this) }
    };
    
    if (gameMap[gameId]) {
        initGame(gameMap[gameId].name, gameMap[gameId].func);
    }
};

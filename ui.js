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

// Функции для работы с формами
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--danger)';
            
            // Убираем красную рамку при исправлении
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    input.style.borderColor = '';
                }
            });
        }
    });
    
    return isValid;
}

// Анимация перехода между экранами
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let opacity = 0;
    const start = performance.now();
    
    function animate(time) {
        opacity = (time - start) / duration;
        if (opacity > 1) opacity = 1;
        
        element.style.opacity = opacity;
        
        if (opacity < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const start = performance.now();
    
    function animate(time) {
        opacity = 1 - (time - start) / duration;
        if (opacity < 0) opacity = 0;
        
        element.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Функция для создания колеса выбора
function createWheel(items, options = {}) {
    const wheel = document.createElement('div');
    wheel.className = 'wheel';
    wheel.style.cssText = `
        width: ${options.size || 300}px;
        height: ${options.size || 300}px;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        border: 4px solid ${options.borderColor || '#f1c40f'};
    `;
    
    const angle = 360 / items.length;
    
    items.forEach((item, index) => {
        const slice = document.createElement('div');
        slice.className = 'wheel-slice';
        slice.style.cssText = `
            position: absolute;
            width: 50%;
            height: 50%;
            transform-origin: 100% 100%;
            transform: rotate(${index * angle}deg) skew(${90 - angle}deg);
            background: ${item.color || getRandomColor()};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        `;
        
        const content = document.createElement('div');
        content.textContent = item.text || item;
        content.style.cssText = `
            transform: rotate(${angle/2}deg) skew(${angle - 90}deg);
            text-align: center;
            width: 100%;
        `;
        
        slice.appendChild(content);
        wheel.appendChild(slice);
    });
    
    return wheel;
}

// Утилитарные функции
function getRandomColor() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#d35400', '#c0392b'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Инициализация UI компонентов при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики для всех кнопок возврата
    document.addEventListener('click', (e) => {
        if (e.target.closest('.back-button') || 
            e.target.textContent.includes('ВЕРНУТЬСЯ') || 
            e.target.textContent.includes('НАЗАД') ||
            e.target.textContent.includes('ВЫХОД')) {
            if (!e.target.closest('.game-card')) {
                // Не делаем ничего, если это кнопка в карточке игры
                e.preventDefault();
            }
        }
    });
    
    // Добавляем анимацию загрузки при переходе между страницами
    const originalClearUI = CasinoApp.clearUI;
    CasinoApp.clearUI = function() {
        const main = document.getElementById('mainContent');
        if (main.children.length > 0) {
            fadeOut(main, 200);
            setTimeout(() => {
                originalClearUI.call(this);
                setTimeout(() => fadeIn(main, 200), 50);
            }, 200);
        } else {
            originalClearUI.call(this);
            fadeIn(main, 200);
        }
    };
});

// Экспортируем функции для использования в других модулях
window.UIHelpers = {
    showModal,
    closeModal,
    createNotification,
    formatMoney,
    validateBet,
    animateWin,
    showLoading,
    hideLoading,
    initGame,
    validateForm,
    fadeIn,
    fadeOut,
    createWheel,
    getRandomColor,
    debounce
};
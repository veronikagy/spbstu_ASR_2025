// Основной JavaScript файл для сайта-резюме

// ============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initTheme();
    initNavigation();
    initForm();
    initScrollToTop();
    initAnimations();
    initCurrentYear();
    initMathSymbolsAnimation();

    // Загрузка языка по умолчанию
    loadLanguage('ru');
});

// ============================================
// ТЕМНАЯ ТЕМА
// ============================================
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Проверяем сохраненную тему или системные настройки
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-theme');
    }

    // Обработчик переключения темы
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');

        const isDark = body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Анимация переключения
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    });
}

// ============================================
// НАВИГАЦИЯ
// ============================================
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Переключение мобильного меню
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Эффект при скролле
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// ФОРМА ОБРАТНОЙ СВЯЗИ
// ============================================
function initForm() {
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const modalClose = document.querySelector('.modal-close');

    if (!contactForm) return;

    // Валидация формы
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (validateForm()) {
            // В реальном проекте здесь будет отправка данных на сервер
            // Например, через fetch API

            // Показываем модальное окно успеха
            showSuccessModal();

            // Очищаем форму
            contactForm.reset();
        }
    });

    // Закрытие модального окна
    modalClose.addEventListener('click', function() {
        successModal.classList.remove('active');
    });

    // Закрытие по клику вне модального окна
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal.classList.contains('active')) {
            successModal.classList.remove('active');
        }
    });

    // Валидация полей формы
    function validateForm() {
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');
        let isValid = true;

        // Сброс ошибок
        resetErrors([name, email, subject, message]);

        // Валидация имени
        if (!name.value.trim()) {
            showError(name, 'Пожалуйста, введите ваше имя');
            isValid = false;
        } else if (name.value.trim().length < 2) {
            showError(name, 'Имя должно содержать минимум 2 символа');
            isValid = false;
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError(email, 'Пожалуйста, введите ваш email');
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            showError(email, 'Пожалуйста, введите корректный email');
            isValid = false;
        }

        // Валидация темы
        if (!subject.value.trim()) {
            showError(subject, 'Пожалуйста, введите тему сообщения');
            isValid = false;
        } else if (subject.value.trim().length < 3) {
            showError(subject, 'Тема должна содержать минимум 3 символа');
            isValid = false;
        }

        // Валидация сообщения
        if (!message.value.trim()) {
            showError(message, 'Пожалуйста, введите ваше сообщение');
            isValid = false;
        } else if (message.value.trim().length < 10) {
            showError(message, 'Сообщение должно содержать минимум 10 символов');
            isValid = false;
        }

        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }

        errorElement.textContent = message;
        input.style.borderColor = '#ef4444';
        input.focus();
    }

    function resetErrors(inputs) {
        inputs.forEach(input => {
            input.style.borderColor = '';
            const errorElement = input.closest('.form-group')?.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    }

    function showSuccessModal() {
        successModal.classList.add('active');

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (successModal.classList.contains('active')) {
                successModal.classList.remove('active');
            }
        }, 5000);
    }
}

// ============================================
// КНОПКА "НАВЕРХ"
// ============================================
function initScrollToTop() {
    const scrollButton = document.querySelector('.scroll-top');

    if (!scrollButton) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// АНИМАЦИИ ПРИ СКРОЛЛЕ
// ============================================
function initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ============================================
// ТЕКУЩИЙ ГОД В ФУТЕРЕ
// ============================================
function initCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ============================================
// АНИМАЦИЯ МАТЕМАТИЧЕСКИХ СИМВОЛОВ
// ============================================
function initMathSymbolsAnimation() {
    const symbols = document.querySelectorAll('.math-symbol');

    symbols.forEach((symbol, index) => {
        // Задержка для разнообразия анимаций
        symbol.style.animationDelay = `${index * 0.5}s`;

        // Случайное движение для каждого символа
        symbol.addEventListener('mouseenter', function() {
            this.style.transform = `translateY(-30px) rotate(${Math.random() * 360}deg)`;
            this.style.transition = 'all 0.5s ease';
        });

        symbol.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ
// ============================================

// Эффект параллакса для фона
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Анимация при наведении на карточки проектов
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Плавный скролл для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// АДАПТАЦИЯ ДЛЯ GITHUB PAGES
// ============================================

// Проверяем, находимся ли мы на GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

// Если на GitHub Pages, настраиваем абсолютные пути
if (isGitHubPages) {
    // Обновляем ссылки на ресурсы при необходимости
    document.addEventListener('DOMContentLoaded', function() {
        const baseUrl = window.location.pathname.includes('/resume-sofya-babakhina/')
            ? '/resume-sofya-babakhina/'
            : '/';

        // Обновляем ссылки на CSS и JS файлы
        const stylesheet = document.querySelector('link[href="style.css"]');
        const script = document.querySelector('script[src="script.js"]');

        if (stylesheet && baseUrl !== '/') {
            stylesheet.href = baseUrl + 'style.css';
        }

        if (script && baseUrl !== '/') {
            script.src = baseUrl + 'script.js';
        }
    });
}

// ============================================
// ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
// ============================================

// Копирование email в буфер обмена
document.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', function() {
        const email = 'sofya.babakhina@example.com';

        navigator.clipboard.writeText(email).then(() => {
            // Показываем уведомление об успешном копировании
            const originalText = this.textContent;
            this.textContent = 'Скопировано!';
            this.style.backgroundColor = '#10b981';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '';
            }, 2000);
        });
    });
});

// Ленивая загрузка изображений (для будущих обновлений)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ОБРАБОТЧИКИ ОШИБОК
// ============================================

// Глобальный обработчик ошибок
window.addEventListener('error', function(e) {
    console.error('Произошла ошибка:', e.error);

    // Можно добавить отправку ошибок на сервер для отладки
    // if (typeof ga !== 'undefined') {
    //     ga('send', 'exception', {
    //         exDescription: e.error.message,
    //         exFatal: false
    //     });
    // }
});

// Обработка offline/online состояния
window.addEventListener('offline', function() {
    showNotification('Вы находитесь в офлайн-режиме. Некоторые функции могут быть недоступны.');
});

window.addEventListener('online', function() {
    showNotification('Соединение восстановлено.');
});

function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--color-bg-card);
        color: var(--color-text-primary);
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Показываем уведомление
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Скрываем через 5 секунд
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}
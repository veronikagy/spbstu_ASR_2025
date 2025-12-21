/**
 * Интерактивное резюме Софьи Бабахины
 * Скрипт для валидации формы обратной связи и динамического обновления года в футере
 */

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Установка текущего года в футере
    setCurrentYear();

    // Инициализация формы обратной связи
    initContactForm();

    // Плавная прокрутка к якорям
    initSmoothScroll();
});

/**
 * Устанавливает текущий год в элементе с id "currentYear"
 */
function setCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }
}

/**
 * Инициализирует обработку формы обратной связи
 */
function initContactForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    // Очистка сообщений об ошибках при фокусировке на поле
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            clearError(this.id);
        });
    });

    // Обработка отправки формы
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем стандартную отправку

        if (validateForm()) {
            // Имитация отправки формы
            simulateFormSubmit();
        }
    });
}

/**
 * Валидирует все поля формы
 * @returns {boolean} true если форма валидна, иначе false
 */
function validateForm() {
    let isValid = true;

    // Проверка поля Имя
    const name = document.getElementById('name');
    if (!name.value.trim()) {
        showError('name', 'Пожалуйста, введите ваше имя');
        isValid = false;
    } else if (name.value.trim().length < 2) {
        showError('name', 'Имя должно содержать минимум 2 символа');
        isValid = false;
    }

    // Проверка поля Email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError('email', 'Пожалуйста, введите ваш email');
        isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
        showError('email', 'Пожалуйста, введите корректный email адрес');
        isValid = false;
    }

    // Проверка поля Тема
    const subject = document.getElementById('subject');
    if (!subject.value.trim()) {
        showError('subject', 'Пожалуйста, введите тему сообщения');
        isValid = false;
    }

    // Проверка поля Сообщение
    const message = document.getElementById('message');
    if (!message.value.trim()) {
        showError('message', 'Пожалуйста, введите текст сообщения');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showError('message', 'Сообщение должно содержать минимум 10 символов');
        isValid = false;
    }

    return isValid;
}

/**
 * Показывает сообщение об ошибке для указанного поля
 * @param {string} fieldId - ID поля с ошибкой
 * @param {string} message - Текст сообщения об ошибке
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Добавляем класс ошибки к полю ввода
        const inputElement = document.getElementById(fieldId);
        if (inputElement) {
            inputElement.style.borderColor = '#e53935';
        }
    }
}

/**
 * Очищает сообщение об ошибке для указанного поля
 * @param {string} fieldId - ID поля, для которого очищаем ошибку
 */
function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // Восстанавливаем стандартный цвет границы
        const inputElement = document.getElementById(fieldId);
        if (inputElement) {
            inputElement.style.borderColor = '';
        }
    }
}

/**
 * Имитирует отправку формы (в реальном проекте здесь был бы AJAX-запрос)
 */
function simulateFormSubmit() {
    // Получаем данные формы
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // В реальном приложении здесь был бы fetch или XMLHttpRequest
    // Для демонстрации используем setTimeout для имитации сетевой задержки

    // Показываем индикатор загрузки
    const submitButton = document.querySelector('.btn-submit');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Отправка...';
    submitButton.disabled = true;

    // Имитация задержки сети
    setTimeout(function() {
        // Очищаем форму
        document.getElementById('feedbackForm').reset();

        // Восстанавливаем кнопку
        submitButton.textContent = originalText;
        submitButton.disabled = false;

        // Показываем сообщение об успешной отправке
        alert(`Спасибо, ${name}! Ваше сообщение на тему "${subject}" успешно отправлено. Я свяжусь с вами по адресу ${email} в ближайшее время.`);

        // Прокручиваем страницу к верху формы
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }, 1500);
}

/**
 * Инициализирует плавную прокрутку к якорям
 */
function initSmoothScroll() {
    // Находим все ссылки с якорями внутри страницы
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Пропускаем ссылки, которые не являются якорями к элементам на странице
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Дополнительная функция для улучшения UX: добавляет класс при прокрутке
window.addEventListener('scroll', function() {
    const header = document.querySelector('.hero');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});
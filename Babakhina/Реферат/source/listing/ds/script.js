/**
 * SAWTOOTH DETECTOR - Основной скрипт управления интерфейсом
 * Автоматическое детектирование пилообразных колебаний на токамаке "Глобус-М2"
 * Версия 1.0
 */

// Глобальные переменные состояния приложения
const AppState = {
    isConnected: false,
    isProcessing: false,
    currentDataSource: null,
    currentAlgorithm: 'hybrid',
    detectionCount: 0,
    lastProcessTime: null,
    fileData: null
};

// DOM элементы
const elements = {
    // Кнопки загрузки данных
    loadFileBtn: document.getElementById('loadFileBtn'),
    connectADCBtn: document.getElementById('connectADCBtn'),
    liveModeBtn: document.getElementById('liveModeBtn'),

    // Элементы управления алгоритмами
    modelSelect: document.getElementById('modelSelect'),
    applyModelBtn: document.getElementById('applyModelBtn'),

    // Элементы визуализации
    showRawSignal: document.getElementById('showRawSignal'),
    showProcessed: document.getElementById('showProcessed'),
    showDetections: document.getElementById('showDetections'),
    exportBtn: document.getElementById('exportBtn'),

    // Элементы управления графиками
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    resetViewBtn: document.getElementById('resetViewBtn'),

    // Элементы параметров обработки
    kernelWidth: document.getElementById('kernelWidth'),
    kernelWidthValue: document.getElementById('kernelWidthValue'),
    threshold: document.getElementById('threshold'),
    thresholdValue: document.getElementById('thresholdValue'),
    minDuration: document.getElementById('minDuration'),
    minDurationValue: document.getElementById('minDurationValue'),
    maxDuration: document.getElementById('maxDuration'),
    maxDurationValue: document.getElementById('maxDurationValue'),
    applyParamsBtn: document.getElementById('applyParamsBtn'),
    defaultParamsBtn: document.getElementById('defaultParamsBtn'),

    // Элементы управления обработкой
    startProcessingBtn: document.getElementById('startProcessingBtn'),
    stopProcessingBtn: document.getElementById('stopProcessingBtn'),

    // Элементы статуса
    currentAlgorithmEl: document.getElementById('currentAlgorithm'),
    dataSourceEl: document.getElementById('dataSource'),
    lastProcessTimeEl: document.getElementById('lastProcessTime'),
    detectionCountEl: document.getElementById('detectionCount'),

    // Элементы журнала
    logContent: document.getElementById('logContent'),
    clearLogBtn: document.getElementById('clearLogBtn'),

    // Модальное окно
    fileModal: document.getElementById('fileModal'),
    fileDropArea: document.getElementById('fileDropArea'),
    fileInput: document.getElementById('fileInput'),
    filePreview: document.getElementById('filePreview'),
    confirmLoadBtn: document.getElementById('confirmLoadBtn'),
    cancelLoadBtn: document.getElementById('cancelLoadBtn'),
    modalClose: document.querySelector('.modal__close')
};

/**
 * Инициализация приложения
 */
function initApp() {
    logMessage('Система инициализирована. Ожидание входных данных.', 'system');

    // Настройка обработчиков событий для кнопок загрузки данных
    elements.loadFileBtn.addEventListener('click', openFileModal);
    elements.connectADCBtn.addEventListener('click', connectToADC);
    elements.liveModeBtn.addEventListener('click', enableLiveMode);

    // Настройка обработчиков для выбора алгоритма
    elements.modelSelect.addEventListener('change', updateSelectedAlgorithm);
    elements.applyModelBtn.addEventListener('click', applyAlgorithm);

    // Настройка обработчиков для визуализации
    elements.showRawSignal.addEventListener('change', updateVisualization);
    elements.showProcessed.addEventListener('change', updateVisualization);
    elements.showDetections.addEventListener('change', updateVisualization);
    elements.exportBtn.addEventListener('click', exportData);

    // Настройка обработчиков для управления графиками
    elements.zoomInBtn.addEventListener('click', zoomIn);
    elements.zoomOutBtn.addEventListener('click', zoomOut);
    elements.resetViewBtn.addEventListener('click', resetView);

    // Настройка обработчиков для параметров обработки
    elements.kernelWidth.addEventListener('input', updateKernelWidthValue);
    elements.threshold.addEventListener('input', updateThresholdValue);
    elements.minDuration.addEventListener('input', updateMinDurationValue);
    elements.maxDuration.addEventListener('input', updateMaxDurationValue);
    elements.applyParamsBtn.addEventListener('click', applyParameters);
    elements.defaultParamsBtn.addEventListener('click', resetParameters);

    // Настройка обработчиков для управления обработкой
    elements.startProcessingBtn.addEventListener('click', startProcessing);
    elements.stopProcessingBtn.addEventListener('click', stopProcessing);

    // Настройка обработчиков для журнала
    elements.clearLogBtn.addEventListener('click', clearLog);

    // Настройка обработчиков для модального окна
    elements.fileDropArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileDropArea.addEventListener('dragover', handleDragOver);
    elements.fileDropArea.addEventListener('drop', handleFileDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.confirmLoadBtn.addEventListener('click', confirmFileLoad);
    elements.cancelLoadBtn.addEventListener('click', closeFileModal);
    elements.modalClose.addEventListener('click', closeFileModal);

    // Закрытие модального окна при клике вне его
    elements.fileModal.addEventListener('click', (e) => {
        if (e.target === elements.fileModal) {
            closeFileModal();
        }
    });

    // Инициализация значений параметров
    updateKernelWidthValue();
    updateThresholdValue();
    updateMinDurationValue();
    updateMaxDurationValue();

    // Обновление статуса системы
    updateSystemStatus();
}

/**
 * Добавление сообщения в журнал
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип сообщения (system, success, warning, error)
 */
function logMessage(message, type = 'system') {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    const time = new Date().toLocaleTimeString('ru-RU', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const typeIcon = {
        'system': '🔧',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    }[type] || '📝';

    // Создаем элементы с правильной структурой
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = time;

    const messageSpan = document.createElement('span');
    messageSpan.className = 'log-message';
    messageSpan.textContent = `${typeIcon} ${message}`;

    // Добавляем цвет в зависимости от типа
    switch(type) {
        case 'success':
            messageSpan.style.color = 'var(--color-success)';
            break;
        case 'warning':
            messageSpan.style.color = 'var(--color-warning)';
            break;
        case 'error':
            messageSpan.style.color = 'var(--color-danger)';
            break;
        default:
            messageSpan.style.color = 'var(--color-text)';
    }

    logEntry.appendChild(timeSpan);
    logEntry.appendChild(messageSpan);

    // Добавляем новое сообщение в начало
    elements.logContent.insertBefore(logEntry, elements.logContent.firstChild);

    // Автоматически прокручиваем к самому новому сообщению (внизу)
    elements.logContent.scrollTop = 0;

    // Ограничиваем количество записей в журнале
    const maxEntries = 100;
    const entries = elements.logContent.querySelectorAll('.log-entry');
    if (entries.length > maxEntries) {
        entries[entries.length - 1].remove();
    }
}

// Обновляем функцию очистки журнала
function clearLog() {
    elements.logContent.innerHTML = '<div class="log-entry"><span class="log-time">' +
        new Date().toLocaleTimeString('ru-RU', { hour12: false }) +
        '</span><span class="log-message">📝 Журнал очищен</span></div>';
}

/**
 * Автоматическая очистка старых записей журнала
 */
function autoCleanLog() {
    const entries = elements.logContent.querySelectorAll('.log-entry');
    const maxAge = 30 * 60 * 1000; // 30 минут в миллисекундах

    entries.forEach(entry => {
        const timeText = entry.querySelector('.log-time').textContent;
        const [hours, minutes, seconds] = timeText.split(':').map(Number);
        const now = new Date();
        const entryTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds
        );

        if (now - entryTime > maxAge) {
            entry.remove();
        }
    });
}

// Добавляем периодическую очистку старых записей
setInterval(autoCleanLog, 5 * 60 * 1000); // Каждые 5 минут

/**
 * Открытие модального окна для загрузки файла
 */
function openFileModal() {
    elements.fileModal.style.display = 'flex';
    logMessage('Открыто окно загрузки файла', 'system');
}

/**
 * Закрытие модального окна
 */
function closeFileModal() {
    elements.fileModal.style.display = 'none';
    elements.filePreview.style.display = 'none';
    elements.confirmLoadBtn.disabled = true;
    elements.fileInput.value = '';
}

/**
 * Обработка перетаскивания файла
 * @param {Event} e - Событие перетаскивания
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.fileDropArea.style.borderColor = '#2980b9';
    elements.fileDropArea.style.backgroundColor = '#f8f9fa';
}

/**
 * Обработка сброса файла
 * @param {Event} e - Событие сброса
 */
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.fileDropArea.style.borderColor = '#e0e0e0';
    elements.fileDropArea.style.backgroundColor = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Обработка выбора файла через диалог
 */
function handleFileSelect() {
    const file = elements.fileInput.files[0];
    if (file) {
        handleFile(file);
    }
}

/**
 * Обработка выбранного файла
 * @param {File} file - Выбранный файл
 */
function handleFile(file) {
    // В реальном приложении здесь будет проверка формата файла
    const fileInfo = {
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || 'Неизвестный формат',
        lastModified: new Date(file.lastModified).toLocaleString('ru-RU')
    };

    elements.filePreview.innerHTML = `
        <h4>Информация о файле:</h4>
        <p><strong>Имя:</strong> ${fileInfo.name}</p>
        <p><strong>Размер:</strong> ${fileInfo.size}</p>
        <p><strong>Тип:</strong> ${fileInfo.type}</p>
        <p><strong>Изменен:</strong> ${fileInfo.lastModified}</p>
    `;

    elements.filePreview.style.display = 'block';
    elements.confirmLoadBtn.disabled = false;

    logMessage(`Выбран файл: ${fileInfo.name}`, 'system');
}

/**
 * Подтверждение загрузки файла
 */
function confirmFileLoad() {
    // В реальном приложении здесь будет загрузка и обработка файла
    const fileName = elements.fileInput.files[0]?.name || 'demo_data.mat';

    AppState.currentDataSource = 'file';
    AppState.fileData = {
        name: fileName,
        timestamp: new Date().toISOString()
    };

    // Генерация демо-данных для визуализации
    generateDemoData();

    // Обновление интерфейса
    updateSystemStatus();
    elements.startProcessingBtn.disabled = false;

    logMessage(`Файл "${fileName}" успешно загружен`, 'success');
    closeFileModal();

    // Обновление графика
    updateChartWithDemoData();
}

/**
 * Подключение к АЦП
 */
function connectToADC() {
    // В реальном приложении здесь будет подключение к аппаратному интерфейсу
    AppState.isConnected = true;
    AppState.currentDataSource = 'adc';

    logMessage('Подключение к АЦП...', 'system');

    // Имитация подключения
    setTimeout(() => {
        AppState.isConnected = true;
        updateSystemStatus();
        elements.startProcessingBtn.disabled = false;
        logMessage('Успешно подключено к АЦП. Готово к приему данных.', 'success');
    }, 1000);
}

/**
 * Включение режима эксперимента (live mode)
 */
function enableLiveMode() {
    // В реальном приложении здесь будет настройка режима реального времени
    AppState.currentDataSource = 'live';

    logMessage('Включен режим эксперимента. Ожидание данных в реальном времени...', 'system');

    // Обновление интерфейса
    updateSystemStatus();
    elements.startProcessingBtn.disabled = false;

    // Генерация демо-данных для live режима
    simulateLiveData();
}

/**
 * Обновление выбранного алгоритма
 */
function updateSelectedAlgorithm() {
    const algorithm = elements.modelSelect.value;
    const algorithmNames = {
        'hybrid': 'Гибридный алгоритм',
        'gaussian': 'Детектирование по Гауссу',
        'statistical': 'Статистический анализ (gSPRT)',
        'ml-cnn': 'Модель CNN',
        'ml-lstm': 'Модель LSTM'
    };

    AppState.currentAlgorithm = algorithm;
    logMessage(`Выбран алгоритм: ${algorithmNames[algorithm]}`, 'system');
}

/**
 * Применение выбранного алгоритма
 */
function applyAlgorithm() {
    const algorithm = elements.modelSelect.value;
    const algorithmNames = {
        'hybrid': 'Гибридный алгоритм',
        'gaussian': 'Детектирование по Гауссу',
        'statistical': 'Статистический анализ (gSPRT)',
        'ml-cnn': 'Модель CNN',
        'ml-lstm': 'Модель LSTM'
    };

    logMessage(`Применен алгоритм: ${algorithmNames[algorithm]}`, 'success');

    // Обновление статуса
    elements.currentAlgorithmEl.textContent = algorithmNames[algorithm];

    // Если данные уже загружены, запускаем обработку
    if (AppState.currentDataSource) {
        startProcessing();
    }
}

/**
 * Обновление визуализации
 */
function updateVisualization() {
    const settings = {
        raw: elements.showRawSignal.checked,
        processed: elements.showProcessed.checked,
        detections: elements.showDetections.checked
    };

    logMessage('Настройки визуализации обновлены', 'system');
    // В реальном приложении здесь будет обновление графика
}

/**
 * Экспорт данных
 */
function exportData() {
    // В реальном приложении здесь будет экспорт данных в файл
    logMessage('Экспорт данных начат...', 'system');

    // Имитация экспорта
    setTimeout(() => {
        logMessage('Данные успешно экспортированы в файл "detection_results.csv"', 'success');

        // Создание и скачивание демо-файла
        const demoData = "Time(ms),Channel1,Channel2,Channel3,Detection\n0,0.1,0.2,0.3,0\n1,0.2,0.3,0.4,0\n2,0.8,0.9,1.0,1\n";
        const blob = new Blob([demoData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'detection_results.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 500);
}

/**
 * Увеличение масштаба графика
 */
function zoomIn() {
    logMessage('Увеличение масштаба графика', 'system');
    // В реальном приложении здесь будет управление масштабом графика
}

/**
 * Уменьшение масштаба графика
 */
function zoomOut() {
    logMessage('Уменьшение масштаба графика', 'system');
    // В реальном приложении здесь будет управление масштабом графика
}

/**
 * Сброс вида графика
 */
function resetView() {
    logMessage('Сброс вида графика', 'system');
    // В реальном приложении здесь будет сброс графика
}

/**
 * Обновление значения ширины ядра Гаусса
 */
function updateKernelWidthValue() {
    elements.kernelWidthValue.textContent = `${parseFloat(elements.kernelWidth.value).toFixed(2)} мс`;
}

/**
 * Обновление значения порога детектирования
 */
function updateThresholdValue() {
    elements.thresholdValue.textContent = `${parseFloat(elements.threshold.value).toFixed(1)} σ`;
}

/**
 * Обновление значения минимальной длительности краша
 */
function updateMinDurationValue() {
    elements.minDurationValue.textContent = `${parseFloat(elements.minDuration.value).toFixed(2)} мс`;
}

/**
 * Обновление значения максимальной длительности краша
 */
function updateMaxDurationValue() {
    elements.maxDurationValue.textContent = `${parseFloat(elements.maxDuration.value).toFixed(2)} мс`;
}

/**
 * Применение параметров обработки
 */
function applyParameters() {
    const params = {
        kernelWidth: parseFloat(elements.kernelWidth.value),
        threshold: parseFloat(elements.threshold.value),
        minDuration: parseFloat(elements.minDuration.value),
        maxDuration: parseFloat(elements.maxDuration.value)
    };

    logMessage(`Параметры применены: σ=${params.kernelWidth}мс, порог=${params.threshold}σ`, 'success');

    // В реальном приложении здесь будет применение параметров к алгоритму
}

/**
 * Сброс параметров к значениям по умолчанию
 */
function resetParameters() {
    elements.kernelWidth.value = 0.1;
    elements.threshold.value = 3.5;
    elements.minDuration.value = 0.1;
    elements.maxDuration.value = 2.0;

    updateKernelWidthValue();
    updateThresholdValue();
    updateMinDurationValue();
    updateMaxDurationValue();

    logMessage('Параметры сброшены к значениям по умолчанию', 'system');
}

/**
 * Начало обработки данных
 */
function startProcessing() {
    if (!AppState.currentDataSource) {
        logMessage('Ошибка: нет источника данных', 'error');
        return;
    }

    AppState.isProcessing = true;
    AppState.lastProcessTime = new Date();

    // Обновление интерфейса
    updateSystemStatus();
    elements.startProcessingBtn.disabled = true;
    elements.stopProcessingBtn.disabled = false;

    logMessage('Начало обработки данных...', 'system');

    // Имитация обработки
    simulateProcessing();
}

/**
 * Остановка обработки данных
 */
function stopProcessing() {
    AppState.isProcessing = false;

    // Обновление интерфейса
    updateSystemStatus();
    elements.startProcessingBtn.disabled = false;
    elements.stopProcessingBtn.disabled = true;

    logMessage('Обработка данных остановлена', 'system');
}

/**
 * Обновление статуса системы
 */
function updateSystemStatus() {
    // Обновление отображения источника данных
    const dataSourceNames = {
        'file': 'Файл',
        'adc': 'АЦП',
        'live': 'Режим эксперимента'
    };

    elements.dataSourceEl.textContent = AppState.currentDataSource
        ? dataSourceNames[AppState.currentDataSource]
        : 'Не подключен';

    // Обновление времени последней обработки
    if (AppState.lastProcessTime) {
        elements.lastProcessTimeEl.textContent = AppState.lastProcessTime.toLocaleTimeString('ru-RU');
    }

    // Обновление количества детектированных событий
    elements.detectionCountEl.textContent = `Детектировано: ${AppState.detectionCount} событий`;

    // Обновление состояния кнопок
    if (AppState.isProcessing) {
        elements.startProcessingBtn.disabled = true;
        elements.stopProcessingBtn.disabled = false;
    } else {
        elements.startProcessingBtn.disabled = !AppState.currentDataSource;
        elements.stopProcessingBtn.disabled = true;
    }
}

/**
 * Генерация демонстрационных данных
 */
function generateDemoData() {
    // В реальном приложении здесь будет загрузка реальных данных
    logMessage('Генерация демонстрационных данных...', 'system');

    // Имитация обнаруженных событий
    AppState.detectionCount = Math.floor(Math.random() * 10) + 5;
}

/**
 * Обновление графика демонстрационными данными
 */
function updateChartWithDemoData() {
    const chartArea = document.getElementById('mainChart');

    // Очистка placeholder
    chartArea.innerHTML = '';

    // Создание канваса для графика
    const canvas = document.createElement('canvas');
    canvas.id = 'signalCanvas';
    canvas.width = chartArea.clientWidth - 40;
    canvas.height = chartArea.clientHeight - 40;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    chartArea.appendChild(canvas);

    // В реальном приложении здесь будет отрисовка реальных данных
    // Сейчас просто отобразим сообщение
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('График SXR-сигналов', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '14px Arial';
    ctx.fillText(`Загружено ${AppState.detectionCount} пилообразных событий`, canvas.width / 2, canvas.height / 2 + 10);

    logMessage('График обновлен демонстрационными данными', 'success');
}

/**
 * Имитация обработки данных
 */
function simulateProcessing() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;

        if (progress >= 100) {
            clearInterval(interval);

            // Завершение обработки
            AppState.isProcessing = false;
            AppState.detectionCount = Math.floor(Math.random() * 20) + 10;

            // Обновление интерфейса
            updateSystemStatus();
            elements.startProcessingBtn.disabled = false;
            elements.stopProcessingBtn.disabled = true;

            logMessage(`Обработка завершена. Обнаружено ${AppState.detectionCount} событий`, 'success');

            // Обновление графика
            updateChartWithDemoData();
        }
    }, 100);
}

/**
 * Имитация live данных
 */
function simulateLiveData() {
    logMessage('Начало приема данных в реальном времени...', 'system');

    // Имитация периодического обнаружения событий
    let eventCount = 0;
    const interval = setInterval(() => {
        if (!AppState.isProcessing && AppState.currentDataSource === 'live') {
            eventCount++;
            AppState.detectionCount = eventCount;
            updateSystemStatus();

            if (eventCount % 5 === 0) {
                logMessage(`Обнаружено событие #${eventCount} в реальном времени`, 'success');
            }
        }

        // Остановка через 30 секунд для демонстрации
        if (eventCount >= 30) {
            clearInterval(interval);
            logMessage('Завершение приема live данных (демо-режим)', 'system');
        }
    }, 1000);
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);

// Добавление класса для кнопок навигации при прокрутке
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 10) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    }
});
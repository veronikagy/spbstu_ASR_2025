// --- Данные меню (Симуляция базы данных) ---
const menuItems = [
    // Стартеры
    { id: 1, name: "Начос Гранде", category: "starters", price: 450, desc: "Кукурузные чипсы с сыром, халапеньо и сальсой.", img: "https://placehold.co/300x200/FFC107/5D4037?text=Nachos" },
    { id: 2, name: "Кесадилья с курицей", category: "starters", price: 520, desc: "Тортилья с курицей, сыром и овощами.", img: "https://placehold.co/300x200/FFC107/5D4037?text=Quesadilla" },
    // Салаты
    { id: 3, name: "Салат Тако", category: "salads", price: 480, desc: "Микс салата, говядина, фасоль в хрустящей корзинке.", img: "https://placehold.co/300x200/4CAF50/FFFFFF?text=Taco+Salad" },
    { id: 4, name: "Овощной Микс", category: "salads", price: 390, desc: "Свежие овощи с лаймовой заправкой.", img: "https://placehold.co/300x200/4CAF50/FFFFFF?text=Veggie+Mix" },
    // Супы
    { id: 5, name: "Чили Кон Карне", category: "soups", price: 550, desc: "Острый суп с фаршем и фасолью.", img: "https://placehold.co/300x200/D32F2F/FFFFFF?text=Chili+Soup" },
    // Десерты
    { id: 6, name: "Чуррос", category: "desserts", price: 300, desc: "Жареное тесто с корицей и шоколадом.", img: "https://placehold.co/300x200/5D4037/FFFFFF?text=Churros" },
    // Напитки
    { id: 7, name: "Лимонад Кактус", category: "drinks", price: 250, desc: "Домашний лимонад с грушей и лаймом.", img: "https://placehold.co/300x200/81D4FA/000000?text=Lemonade" },
    { id: 8, name: "Кофе Мексикано", category: "drinks", price: 200, desc: "Черный кофе с острым перцем и шоколадом.", img: "https://placehold.co/300x200/3E2723/FFFFFF?text=Coffee" }
];

// --- Состояние приложения ---
let cart = {}; // Объект для хранения выбранных товаров {id: quantity}

// --- DOM Элементы ---
const menuGrid = document.getElementById('menu-grid');
const tabButtons = document.querySelectorAll('.tab-btn');
const cartItemsContainer = document.getElementById('cart-items');
const totalAmountEl = document.getElementById('total-amount');
const cartCountEl = document.getElementById('cart-count');

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
    renderMenu('all'); // Показать все блюда при загрузке
});

// --- Функции Рендеринга ---

// 1. Отображение меню
function renderMenu(category) {
    menuGrid.innerHTML = ''; // Очистка сетки

    const filteredItems = category === 'all'
        ? menuItems
        : menuItems.filter(item => item.category === category);

    filteredItems.forEach(item => {
        const itemQty = cart[item.id] || 0;

        const card = document.createElement('div');
        card.className = 'menu-item';
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="item-img">
            <div class="item-content">
                <h3 class="item-title">${item.name}</h3>
                <p class="item-desc">${item.desc}</p>
                <div class="item-footer">
                    <span class="item-price">${item.price} ₽</span>
                    <div class="item-controls">
                        ${itemQty > 0
                            ? `<button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                               <span>${itemQty}</span>
                               <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>`
                            : `<button class="btn btn-primary" onclick="updateQuantity(${item.id}, 1)">В заказ</button>`
                        }
                    </div>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// 2. Обновление корзины
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let totalCount = 0;
    let hasItems = false;

    // Проход по всем товарам в базе для поиска добавленных в корзину
    menuItems.forEach(item => {
        if (cart[item.id] > 0) {
            hasItems = true;
            const qty = cart[item.id];
            const sum = item.price * qty;
            total += sum;
            totalCount += qty;

            const cartRow = document.createElement('div');
            cartRow.className = 'cart-item';
            cartRow.innerHTML = `
                <div class="cart-item-title">${item.name}</div>
                <div class="item-controls">
                    <button class="qty-btn" style="width:25px; height:25px; font-size:1rem;" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span style="margin: 0 10px;">${qty}</span>
                    <button class="qty-btn" style="width:25px; height:25px; font-size:1rem;" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div style="margin-left: 15px; font-weight: bold; width: 80px; text-align: right;">${sum} ₽</div>
            `;
            cartItemsContainer.appendChild(cartRow);
        }
    });

    if (!hasItems) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Корзина пуста, амиго. Добавь немного огня!</p>';
    }

    totalAmountEl.textContent = total;
    cartCountEl.textContent = `(${totalCount})`;
}

// --- Логика Управления ---

// Изменение количества товара
window.updateQuantity = function(id, change) {
    if (!cart[id]) cart[id] = 0;
    cart[id] += change;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    // Перерисовка интерфейса
    // Находим текущую активную категорию, чтобы не сбрасывать фильтр
    const activeTab = document.querySelector('.tab-btn.active');
    const currentCategory = activeTab ? activeTab.dataset.category : 'all';

    renderMenu(currentCategory);
    renderCart();
};

// Переключение вкладок категорий
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех
        tabButtons.forEach(b => b.classList.remove('active'));
        // Добавляем нажатому
        btn.classList.add('active');
        // Фильтруем
        renderMenu(btn.dataset.category);
    });
});
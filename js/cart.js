/**
 * Модуль корзины
 */

let cartItems = [];

function loadCart() {
    try {
        const saved = localStorage.getItem('cart');
        cartItems = saved ? JSON.parse(saved) : [];
    } catch {
        cartItems = [];
    }
    updateCartBadge();
    renderCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartBadge();
    renderCart();
}

function addToCartFromCatalog(product) {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }
    saveCart();
    alert('✅ Товар добавлен в корзину!');
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
}

function updateCartQuantity(productId, delta) {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
    }
}

function getCartTotal() {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (total > 0) {
        badge.textContent = total;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="bg-white p-8 rounded-xl border text-center space-y-4">
                <div class="text-slate-300 text-5xl"><i class="fa-solid fa-box-open"></i></div>
                <h3 class="font-bold text-xl text-slate-700">Спецификация запроса пуста</h3>
                <p class="text-slate-500 text-sm">Перейдите в конфигуратор на главной странице, чтобы собрать ТПА-станцию.</p>
                <button onclick="switchTab('home')" class="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition text-sm">
                    <i class="fa-solid fa-gear mr-2"></i>Сконфигурировать ТПА
                </button>
            </div>
        `;
        totalElement.textContent = '0 руб.';
        return;
    }

    container.innerHTML = cartItems.map(item => `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cart-item">
            <div class="flex items-center space-x-4 w-full sm:w-auto">
                <img src="${item.image_url || item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border flex-shrink-0">
                <div>
                    <h4 class="font-bold text-slate-900 text-sm md:text-base leading-snug">${item.name}</h4>
                    <p class="text-sm text-slate-500">${Number(item.price).toLocaleString()} руб.</p>
                </div>
            </div>
            <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                <div class="flex items-center border rounded overflow-hidden bg-slate-50">
                    <button onclick="updateCartQuantity(${item.id}, -1)" 
                            class="px-2.5 py-1 hover:bg-slate-200 text-slate-600 font-bold transition">-</button>
                    <span class="px-3 py-1 text-sm font-semibold">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)" 
                            class="px-2.5 py-1 hover:bg-slate-200 text-slate-600 font-bold transition">+</button>
                </div>
                <div class="text-right min-w-[100px]">
                    <p class="font-bold text-slate-900 text-sm md:text-base">${(item.price * item.quantity).toLocaleString()} руб.</p>
                </div>
                <button onclick="removeFromCart(${item.id})" 
                        class="text-red-500 hover:text-red-700 transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');

    totalElement.textContent = getCartTotal().toLocaleString() + ' руб.';
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    
    if (cartItems.length === 0) {
        alert('Корзина пуста');
        return;
    }

    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const email = document.getElementById('order-email').value.trim();
    const comment = document.getElementById('order-comment').value.trim();

    if (!name || !phone || !email) {
        alert('Заполните все обязательные поля');
        return;
    }

    const itemsString = cartItems.map(item => 
        `${item.name} (${item.quantity} шт.)`
    ).join('; ');

    const totalPrice = getCartTotal();

    try {
        const order = await DB.orders.create({
            client_name: name,
            phone: phone,
            email: email,
            items: itemsString + (comment ? ` [Примечание: ${comment}]` : ''),
            total_price: totalPrice,
            status: 'Новый'
        });

        cartItems = [];
        saveCart();
        renderCart();
        
        alert(`✅ Заказ #${order.id} создан! На ваш email отправлена смета.`);
        switchTab('home');

    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

loadCart();

window.cartItems = cartItems;
window.addToCartFromCatalog = addToCartFromCatalog;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.renderCart = renderCart;
window.handlePlaceOrder = handlePlaceOrder;
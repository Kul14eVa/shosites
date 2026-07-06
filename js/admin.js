/**
 * Модуль администрирования
 */

let isAdminMode = false;

// ============================================================
// ВХОД В АДМИНКУ
// ============================================================
function handleAdminLogin(e) {
    e.preventDefault();
    const login = document.getElementById('admin-login').value;
    const pass = document.getElementById('admin-password').value;
    
    if (login === 'admin' && pass === 'admin123') {
        isAdminMode = true;
        window.isAdminMode = true;
        
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-login-card').classList.add('hidden');
        document.getElementById('admin-add-product-btn').classList.remove('hidden');
        
        loadOrders();
        if (typeof renderCatalog === 'function') renderCatalog();
        if (typeof renderNews === 'function') renderNews();
        alert('✅ Вход в панель дилера выполнен');
    } else {
        alert('❌ Неверный логин или пароль');
    }
}

// ============================================================
// ВЫХОД ИЗ АДМИНКИ
// ============================================================
function handleAdminLogout() {
    isAdminMode = false;
    window.isAdminMode = false;
    
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-login-card').classList.remove('hidden');
    document.getElementById('admin-add-product-btn').classList.add('hidden');
    document.getElementById('nav-admin').classList.add('hidden');
    
    if (typeof renderCatalog === 'function') renderCatalog();
    if (typeof renderNews === 'function') renderNews();
    alert('👋 Выход из панели дилера');
    switchTab('home');
}

// ============================================================
// ЗАГРУЗКА ЗАКАЗОВ
// ============================================================
async function loadOrders() {
    const tableBody = document.getElementById('orders-table-body');
    const countBadge = document.getElementById('orders-count');
    
    tableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-500">Загрузка...</td></tr>';
    
    try {
        const orders = await DB.orders.getAll();
        countBadge.textContent = orders.length;
        
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-400">Нет заказов</td></tr>';
            return;
        }
        
        tableBody.innerHTML = orders.map(order => `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-bold">#${order.id}</td>
                <td class="py-3 px-4 font-medium">${order.client_name}</td>
                <td class="py-3 px-4 text-xs">
                    <p class="font-bold text-slate-900">${order.phone}</p>
                    <p class="text-slate-400">${order.email}</p>
                </td>
                <td class="py-3 px-4 text-xs max-w-xs truncate" title="${order.items}">${order.items}</td>
                <td class="py-3 px-4 font-bold">${Number(order.total_price).toLocaleString()} руб.</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${
                        order.status === 'Новый' ? 'bg-orange-100 text-orange-700' : 
                        order.status === 'В работе' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }">${order.status}</span>
                </td>
                <td class="py-3 px-4">
                    <select onchange="updateOrderStatus(${order.id}, this.value)" 
                            class="bg-white border rounded text-xs px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500">
                        <option value="Новый" ${order.status === 'Новый' ? 'selected' : ''}>Новый</option>
                        <option value="В работе" ${order.status === 'В работе' ? 'selected' : ''}>В работе</option>
                        <option value="Выполнен" ${order.status === 'Выполнен' ? 'selected' : ''}>Выполнен</option>
                    </select>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-red-500">❌ ${error.message}</td></tr>`;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await DB.orders.updateStatus(orderId, newStatus);
        await loadOrders();
        alert('✅ Статус обновлен');
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

// ============================================================
// ЗАГРУЗКА ШАБЛОНА ХАРАКТЕРИСТИК
// ============================================================
function loadSpecTemplate() {
    const textarea = document.getElementById('new-prod-specs');
    if (!textarea) return;
    
    try {
        const template = window.SPEC_TEMPLATE || {};
        textarea.value = JSON.stringify(template, null, 2);
        alert('✅ Шаблон загружен. Измените значения под вашу модель.');
    } catch (e) {
        alert('❌ Ошибка загрузки шаблона: ' + e.message);
    }
}

// ============================================================
// ДОБАВЛЕНИЕ ТОВАРА
// ============================================================
async function handleCreateProduct(e) {
    e.preventDefault();
    
    const title = document.getElementById('new-prod-title').value.trim();
    const price = parseFloat(document.getElementById('new-prod-price').value);
    const desc = document.getElementById('new-prod-desc').value.trim();
    const image = document.getElementById('new-prod-image').value.trim();
    const specsText = document.getElementById('new-prod-specs').value.trim();
    
    if (!title || !price || !desc || !image) {
        alert('❌ Заполните все основные поля');
        return;
    }
    
    let specs = {};
    if (specsText) {
        try {
            specs = JSON.parse(specsText);
        } catch (e) {
            alert('❌ Неверный формат JSON в характеристиках');
            return;
        }
    }
    
    try {
        const productData = {
            name: title,
            price: price,
            description: desc,
            image_url: image,
            specs: specs,
            power: 30.0,
            setup_time: 120,
            screw_life: 8000
        };
        
        const newProduct = await DB.products.create(productData);
        
        if (window.catalogProducts) {
            window.catalogProducts.push(newProduct);
            if (typeof renderCatalog === 'function') renderCatalog();
            if (typeof renderConfigurator === 'function') renderConfigurator();
        }
        
        document.getElementById('new-prod-title').value = '';
        document.getElementById('new-prod-price').value = '';
        document.getElementById('new-prod-desc').value = '';
        document.getElementById('new-prod-image').value = '';
        document.getElementById('new-prod-specs').value = '';
        
        alert('✅ Товар добавлен в базу данных с характеристиками!');
        
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

// ============================================================
// ДОБАВЛЕНИЕ НОВОСТИ
// ============================================================
async function handleCreateNews(e) {
    e.preventDefault();
    
    const title = document.getElementById('new-post-title').value.trim();
    const content = document.getElementById('new-post-content').value.trim();
    const image = document.getElementById('new-post-image').value.trim();
    
    if (!title || !content || !image) {
        alert('❌ Заполните все поля');
        return;
    }
    
    try {
        const today = new Date();
        const dateStr = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
        
        const newsData = {
            title: title,
            content: content,
            image_url: image,
            date: dateStr
        };
        
        const newNews = await DB.news.create(newsData);
        
        if (window.newsItems) {
            window.newsItems.unshift(newNews);
            if (typeof renderNews === 'function') renderNews();
        }
        
        document.getElementById('new-post-title').value = '';
        document.getElementById('new-post-content').value = '';
        document.getElementById('new-post-image').value = '';
        
        alert('✅ Новость опубликована!');
        
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

window.isAdminMode = isAdminMode;
window.loadSpecTemplate = loadSpecTemplate;
window.handleAdminLogin = handleAdminLogin;
window.handleAdminLogout = handleAdminLogout;
window.loadOrders = loadOrders;
window.updateOrderStatus = updateOrderStatus;
window.handleCreateProduct = handleCreateProduct;
window.handleCreateNews = handleCreateNews;
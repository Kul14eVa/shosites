/**
 * Модуль каталога
 */

let catalogProducts = [];

// ============================================================
// ЗАГРУЗКА ТОВАРОВ ИЗ БД
// ============================================================
async function loadProductsFromDB() {
    console.log('📦 loadProductsFromDB вызвана');
    
    try {
        const data = await DB.products.getAll();
        console.log('📦 Получено товаров из БД:', data?.length || 0);
        
        if (data && data.length > 0) {
            catalogProducts = data;
        } else {
            catalogProducts = [];
        }
        
        // СИНХРОНИЗИРУЕМ С ГЛОБАЛЬНОЙ ПЕРЕМЕННОЙ
        window.catalogProducts = catalogProducts;
        
        // После загрузки данных - рендерим каталог
        renderCatalog();
        
        return catalogProducts;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки товаров:', error);
        catalogProducts = [];
        window.catalogProducts = catalogProducts;
        renderCatalog();
        throw error;
    }
}

// ============================================================
// РЕНДЕРИНГ КАТАЛОГА
// ============================================================
function renderCatalog() {
    const container = document.getElementById('catalog-container');
    if (!container) {
        console.warn('⚠️ catalog-container не найден');
        return;
    }

    const isAdmin = window.isAdminMode === true;
    console.log('📦 Рендеринг каталога, товаров:', catalogProducts.length);

    if (catalogProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-12 text-slate-500">
                <i class="fa-solid fa-box-open text-4xl mb-4 block text-slate-300"></i>
                <p class="text-slate-400">Товаров пока нет</p>
                ${isAdmin ? `
                    <button onclick="switchTab('admin')" class="mt-3 text-orange-500 hover:text-orange-400 text-sm font-medium transition">
                        <i class="fa-solid fa-plus mr-1"></i> Добавить первый товар
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = catalogProducts.map(product => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition product-card">
            <div class="relative h-48 bg-slate-100">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="w-full h-full object-cover" loading="lazy" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=No+Image'">
                ${isAdmin ? `
                    <button onclick="deleteProduct(${product.id})" 
                            class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition">
                        <i class="fa-solid fa-trash text-sm"></i>
                    </button>
                ` : ''}
                <span class="absolute bottom-2 left-2 bg-slate-900/80 text-white text-xs px-3 py-1 rounded-full">
                    ${Number(product.price).toLocaleString()} руб.
                </span>
            </div>
            <div class="p-5">
                <h3 class="font-bold text-lg text-slate-900">${product.name}</h3>
                <p class="text-slate-500 text-sm mt-1">${product.description || ''}</p>
                
                <div class="flex items-center justify-between mt-4 pt-4 border-t">
                    <button onclick="showSpecs(${product.id})" 
                            class="text-sm text-orange-500 hover:text-orange-600 font-medium transition flex items-center">
                        <i class="fa-regular fa-file-lines mr-2"></i>Характеристики
                    </button>
                    <button onclick="addToCart(${product.id})" 
                            class="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition">
                        <i class="fa-solid fa-cart-plus mr-2"></i>В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================================
// ПОКАЗ ХАРАКТЕРИСТИК
// ============================================================
function showSpecs(productId) {
    console.log('🔍 showSpecs вызвана с ID:', productId);
    console.log('📦 catalogProducts:', catalogProducts);
    console.log('📦 catalogProducts длина:', catalogProducts.length);
    
    // Проверяем есть ли данные
    if (!catalogProducts || catalogProducts.length === 0) {
        alert('⏳ Данные еще загружаются. Подождите и попробуйте снова.');
        return;
    }
    
    // Ищем товар по ID
    let product = catalogProducts.find(p => p.id === productId);
    
    // Если не нашли - пробуем как строку
    if (!product) {
        product = catalogProducts.find(p => String(p.id) === String(productId));
    }
    
    if (!product) {
        console.error('❌ Товар не найден! ID:', productId);
        console.log('📋 Доступные ID:', catalogProducts.map(p => p.id));
        alert('❌ Товар не найден');
        return;
    }
    
    console.log('✅ Товар найден:', product);
    
    // Проверяем характеристики
    if (!product.specs || Object.keys(product.specs).length === 0) {
        alert('⚠️ У этого товара нет технических характеристик');
        return;
    }
    
    // Вызываем функцию из specs.js
    if (typeof window._showSpecs === 'function') {
        window._showSpecs(productId);
    } else {
        console.error('❌ Модуль specs.js не загружен');
        alert('⚠️ Модуль характеристик не загружен');
    }
}

// ============================================================
// ДОБАВЛЕНИЕ В КОРЗИНУ
// ============================================================
function addToCart(productId) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) {
        alert('❌ Товар не найден');
        return;
    }
    
    if (window.addToCartFromCatalog) {
        window.addToCartFromCatalog(product);
    } else {
        alert('⚠️ Ошибка: корзина не загружена');
    }
}

// ============================================================
// УДАЛЕНИЕ ТОВАРА (ТОЛЬКО ДЛЯ АДМИНА)
// ============================================================
async function deleteProduct(id) {
    if (!window.isAdminMode) {
        alert('⛔ Доступ запрещен');
        return;
    }
    
    const product = catalogProducts.find(p => p.id === id);
    if (!product) {
        alert('Товар не найден');
        return;
    }
    
    if (!confirm(`Удалить товар "${product.name}"?`)) return;
    
    try {
        await DB.products.delete(id);
        catalogProducts = catalogProducts.filter(p => p.id !== id);
        window.catalogProducts = catalogProducts;
        renderCatalog();
        if (typeof renderConfigurator === 'function') renderConfigurator();
        alert('✅ Товар удален');
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

// ============================================================
// ДОБАВЛЕНИЕ ТОВАРА (ТОЛЬКО ДЛЯ АДМИНА)
// ============================================================
async function addProduct(productData) {
    try {
        const newProduct = await DB.products.create(productData);
        catalogProducts.push(newProduct);
        window.catalogProducts = catalogProducts;
        renderCatalog();
        if (typeof renderConfigurator === 'function') renderConfigurator();
        alert('✅ Товар добавлен');
        return newProduct;
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
        throw error;
    }
}

// ============================================================
// ЭКСПОРТ
// ============================================================
window.catalogProducts = catalogProducts;
window.loadProductsFromDB = loadProductsFromDB;
window.renderCatalog = renderCatalog;
window.showSpecs = showSpecs;
window.addToCart = addToCart;
window.deleteProduct = deleteProduct;
window.addProduct = addProduct;

/**
 * Модуль сравнения моделей
 */

let selectedCompareIds = [];

// ============================================================
// РЕНДЕРИНГ ВЫБОРА МОДЕЛЕЙ ДЛЯ СРАВНЕНИЯ
// ============================================================
function renderCompareSelector() {
    const container = document.getElementById('compare-models');
    if (!container) return;

    const products = window.catalogProducts || [];
    console.log('🔍 renderCompareSelector - товаров:', products.length);
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-6 text-slate-400">
                <p>Нет доступных моделей</p>
                <button onclick="switchTab('admin')" class="mt-2 text-orange-500 hover:text-orange-600 text-sm">
                    <i class="fa-solid fa-plus mr-1"></i> Добавить модель
                </button>
            </div>
        `;
        // Очищаем таблицу
        document.getElementById('compare-table').innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-regular fa-hand-pointer text-4xl block mb-3"></i>
                <p>Выберите модели выше для сравнения</p>
            </div>
        `;
        return;
    }

    // Если ничего не выбрано - выбираем первые 3 (или сколько есть)
    if (selectedCompareIds.length === 0 && products.length > 0) {
        selectedCompareIds = products.slice(0, Math.min(3, products.length)).map(p => p.id);
    }

    container.innerHTML = products.map(product => {
        const isSelected = selectedCompareIds.includes(product.id);
        return `
            <div class="border-2 rounded-xl p-4 cursor-pointer transition ${
                isSelected 
                    ? 'border-orange-500 bg-orange-50/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
            }" onclick="toggleCompare(${product.id})">
                <div class="flex justify-between items-center mb-1">
                    <h4 class="font-bold text-slate-900 text-sm">${product.name}</h4>
                    <span class="text-xs ${isSelected ? 'text-orange-500' : 'text-slate-400'}">
                        ${isSelected ? '✅ Выбрано' : '➕ Выбрать'}
                    </span>
                </div>
                <p class="text-[11px] text-slate-500 leading-tight">${product.description || ''}</p>
                <div class="mt-2 text-sm font-bold text-slate-800">${Number(product.price).toLocaleString()} руб.</div>
            </div>
        `;
    }).join('');

    renderCompareTable();
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВЫБОРА МОДЕЛИ
// ============================================================
function toggleCompare(productId) {
    const index = selectedCompareIds.indexOf(productId);
    if (index === -1) {
        if (selectedCompareIds.length >= 3) {
            alert('Можно выбрать не более 3 моделей для сравнения');
            return;
        }
        selectedCompareIds.push(productId);
    } else {
        selectedCompareIds.splice(index, 1);
    }
    renderCompareSelector();
}

// ============================================================
// РЕНДЕРИНГ ТАБЛИЦЫ СРАВНЕНИЯ
// ============================================================
function renderCompareTable() {
    const container = document.getElementById('compare-table');
    if (!container) return;

    const products = window.catalogProducts || [];
    const selected = products.filter(p => selectedCompareIds.includes(p.id));

    if (selected.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-regular fa-hand-pointer text-4xl block mb-3"></i>
                <p>Выберите модели выше для сравнения</p>
            </div>
        `;
        return;
    }

    // Собираем все ключи характеристик из выбранных моделей
    const allKeys = new Set();
    selected.forEach(p => {
        if (p.specs) {
            Object.keys(p.specs).forEach(k => allKeys.add(k));
        }
    });

    if (allKeys.size === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-regular fa-file-lines text-4xl block mb-3"></i>
                <p>У выбранных моделей нет характеристик для сравнения</p>
            </div>
        `;
        return;
    }

    const labels = window.SPEC_META?.labels || {};
    const units = window.SPEC_META?.units || {};

    // Строим таблицу
    let html = `
        <table class="w-full text-sm border-collapse">
            <thead>
                <tr class="bg-slate-50">
                    <th class="py-3 px-4 text-left font-bold text-slate-700 border-b">Параметр</th>
    `;

    selected.forEach(p => {
        html += `
            <th class="py-3 px-4 text-center font-bold text-slate-700 border-b">${p.name}</th>
        `;
    });

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    // Сортируем ключи для красивого отображения
    const sortedKeys = Array.from(allKeys).sort();

    for (const key of sortedKeys) {
        const label = labels[key] || key;
        const unit = units[key] || '';
        
        html += `
            <tr class="border-b hover:bg-slate-50">
                <td class="py-2.5 px-4 text-sm text-slate-600 font-medium">${label}</td>
        `;

        selected.forEach(p => {
            const value = p.specs?.[key];
            const displayValue = (value !== undefined && value !== null && value !== '') 
                ? `${value} ${unit}` 
                : '—';
            html += `
                <td class="py-2.5 px-4 text-center text-sm">${displayValue}</td>
            `;
        });

        html += `
            </tr>
        `;
    }

    // Добавляем строку с ценой
    html += `
        <tr class="border-b bg-slate-50 font-bold">
            <td class="py-3 px-4 text-slate-700">Цена</td>
    `;
    selected.forEach(p => {
        html += `
            <td class="py-3 px-4 text-center text-orange-600">${Number(p.price).toLocaleString()} руб.</td>
        `;
    });
    html += `
        </tr>
    `;

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// ============================================================
// ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ (вызывается после загрузки данных)
// ============================================================
function refreshCompare() {
    console.log('🔄 Обновление сравнения...');
    renderCompareSelector();
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 compare.js загружен');
    // Ждем загрузки товаров с повторными попытками
    let attempts = 0;
    const maxAttempts = 10;
    
    const waitForProducts = setInterval(() => {
        attempts++;
        const products = window.catalogProducts || [];
        console.log(`⏳ Попытка ${attempts}: товаров ${products.length}`);
        
        if (products.length > 0 || attempts >= maxAttempts) {
            clearInterval(waitForProducts);
            if (products.length > 0) {
                console.log('✅ Товары загружены, рендерим сравнение');
                renderCompareSelector();
            } else {
                console.warn('⚠️ Товары не загружены после ' + maxAttempts + ' попыток');
                renderCompareSelector(); // Покажет "Нет доступных моделей"
            }
        }
    }, 300);
});

// Экспорт
window.selectedCompareIds = selectedCompareIds;
window.renderCompareSelector = renderCompareSelector;
window.toggleCompare = toggleCompare;
window.renderCompareTable = renderCompareTable;
window.refreshCompare = refreshCompare;
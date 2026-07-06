/**
 * Модуль отображения технических характеристик
 */

function showSpecsModal(productId) {
    console.log('🔍 showSpecsModal вызвана с ID:', productId);
    
    // Берем товары из ГЛОБАЛЬНОЙ переменной window.catalogProducts
    const products = window.catalogProducts || [];
    console.log('📦 catalogProducts длина:', products.length);
    
    if (products.length === 0) {
        alert('⏳ Данные еще загружаются. Подождите и попробуйте снова.');
        return;
    }
    
    // Ищем товар
    let product = products.find(p => p.id === productId);
    
    if (!product) {
        product = products.find(p => String(p.id) === String(productId));
    }
    
    if (!product) {
        console.error('❌ Товар не найден! ID:', productId);
        console.log('📋 Доступные ID:', products.map(p => p.id));
        alert('❌ Товар не найден');
        return;
    }

    console.log('✅ Товар найден:', product.name);

    const specs = product.specs || {};
    const meta = window.SPEC_META || {};
    const groups = meta.groups || {};
    const labels = meta.labels || {};
    const units = meta.units || {};
    const groupKeys = meta.groupKeys || {};

    const specKeys = Object.keys(specs).filter(k => specs[k] !== undefined && specs[k] !== null && specs[k] !== '');
    if (specKeys.length === 0) {
        alert('⚠️ У этого товара нет технических характеристик');
        return;
    }

    let html = '';

    html += `
        <div class="flex flex-col md:flex-row gap-6 mb-6 pb-4 border-b">
            <div class="flex-shrink-0">
                <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}" 
                     class="w-full md:w-48 h-48 object-cover rounded-xl border">
            </div>
            <div class="flex-grow">
                <h3 class="text-2xl font-bold text-slate-900">${product.name}</h3>
                <p class="text-sm text-slate-500 mt-1">${product.description || ''}</p>
                <div class="mt-3 flex items-center space-x-4">
                    <span class="text-xl font-bold text-orange-600">${Number(product.price).toLocaleString()} руб.</span>
                    <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Модель #${product.id}</span>
                </div>
            </div>
        </div>
    `;

    let hasSpecs = false;
    let groupIndex = 0;
    
    for (const [groupKey, group] of Object.entries(groups)) {
        const keys = groupKeys[groupKey] || [];
        const groupSpecs = keys.filter(k => specs[k] !== undefined && specs[k] !== null && specs[k] !== '');
        
        if (groupSpecs.length === 0) continue;
        hasSpecs = true;
        
        const groupId = 'group-' + groupIndex;
        groupIndex++;

        html += `
            <div class="mb-4 border border-slate-200 rounded-xl overflow-hidden">
                <div class="group-header px-4 py-3 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition" 
                     onclick="toggleSpecGroup('${groupId}')">
                    <span class="font-bold text-slate-700 text-sm">${group.label || groupKey}</span>
                    <i class="fa-solid fa-chevron-down text-slate-400 transition" id="${groupId}-icon"></i>
                </div>
                <div class="group-content p-4" id="${groupId}">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        `;

        for (const key of groupSpecs) {
            const label = labels[key] || key;
            const value = specs[key];
            const unit = units[key] || '';
            html += `
                <div class="flex justify-between items-center py-1.5 px-2 rounded hover:bg-slate-50">
                    <span class="text-sm text-slate-500">${label}</span>
                    <span class="font-semibold text-slate-800">
                        ${value} ${unit}
                    </span>
                </div>
            `;
        }

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    if (!hasSpecs) {
        html += `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-regular fa-file-lines text-4xl block mb-3"></i>
                <p>Нет доступных характеристик для этой модели</p>
            </div>
        `;
    }

    html += `
        <div class="text-center text-xs text-slate-400 pt-4 border-t">
            Всего характеристик: ${specKeys.length}
        </div>
    `;

    const titleEl = document.getElementById('spec-modal-title');
    const contentEl = document.getElementById('spec-modal-content');
    const modalEl = document.getElementById('spec-modal');
    
    if (titleEl) titleEl.textContent = `📊 ${product.name}`;
    if (contentEl) contentEl.innerHTML = html;
    if (modalEl) modalEl.classList.remove('hidden');
}

function toggleSpecGroup(groupId) {
    const content = document.getElementById(groupId);
    const icon = document.getElementById(groupId + '-icon');
    if (!content) return;
    content.classList.toggle('collapsed');
    if (icon) icon.classList.toggle('rotate-180');
}

function closeSpecModal() {
    const modal = document.getElementById('spec-modal');
    if (modal) modal.classList.add('hidden');
}

// Назначаем глобальную функцию
window._showSpecs = showSpecsModal;

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('spec-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeSpecModal();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSpecModal();
    });
    
    console.log('✅ specs.js загружен, _showSpecs назначена');
});

window.showSpecsModal = showSpecsModal;
window.toggleSpecGroup = toggleSpecGroup;
window.closeSpecModal = closeSpecModal;
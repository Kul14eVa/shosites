/**
 * Модуль конфигуратора
 */

let selectedModelId = 2;

function getModels() {
    return window.catalogProducts || [];
}

function getSelectedModel() {
    const models = getModels();
    return models.find(m => m.id === selectedModelId);
}

function getSelectedOptions() {
    const options = [];
    if (document.getElementById('opt-servo')?.checked) options.push('Сервопривод');
    if (document.getElementById('opt-induction')?.checked) options.push('Индукционный нагрев');
    if (document.getElementById('opt-bimetal')?.checked) options.push('Биметаллический узел');
    if (document.getElementById('opt-magnetic')?.checked) options.push('Магнитные плиты');
    return options;
}

function calculateTotalPrice(model, options) {
    if (!model) return 0;
    let total = Number(model.price);
    
    const prices = {
        'Сервопривод': 350000,
        'Индукционный нагрев': 180000,
        'Биметаллический узел': 150000,
        'Магнитные плиты': 420000
    };
    
    if (model.id === 1) {
        prices['Сервопривод'] = 240000;
        prices['Индукционный нагрев'] = 110000;
        prices['Биметаллический узел'] = 110000;
        prices['Магнитные плиты'] = 280000;
    } else if (model.id === 3) {
        prices['Сервопривод'] = 580000;
        prices['Индукционный нагрев'] = 290000;
        prices['Биметаллический узел'] = 260000;
        prices['Магнитные плиты'] = 680000;
    }
    
    options.forEach(opt => {
        if (prices[opt]) total += prices[opt];
    });
    
    return total;
}

function renderConfigurator() {
    const container = document.getElementById('config-base-tpa');
    if (!container) return;

    const models = getModels();
    if (models.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-8 text-slate-400">
                <p>Нет доступных моделей. Добавьте их через админку.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = models.map(model => `
        <div class="border-2 rounded-xl p-4 cursor-pointer transition ${
            model.id === selectedModelId 
                ? 'border-orange-500 bg-orange-50/20' 
                : 'border-slate-200 bg-white hover:border-slate-300'
        }" onclick="selectModel(${model.id})">
            <div class="flex justify-between items-center mb-1">
                <h4 class="font-bold text-slate-900 text-sm">${model.name}</h4>
                <input type="radio" name="base_model" ${model.id === selectedModelId ? 'checked' : ''} 
                       class="text-orange-500 focus:ring-orange-500">
            </div>
            <p class="text-[11px] text-slate-500 leading-tight">${model.description || ''}</p>
            <div class="mt-4 pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span class="text-[10px] text-slate-400 font-bold uppercase">База</span>
                <span class="font-extrabold text-sm text-slate-800">${Number(model.price).toLocaleString()} руб.</span>
            </div>
        </div>
    `).join('');
    
    const model = getSelectedModel();
    if (model) updateOptionPrices(model);
    updateConfigStats();
}

function selectModel(id) {
    selectedModelId = id;
    renderConfigurator();
    updateConfigStats();
}

function updateConfigStats() {
    const model = getSelectedModel();
    if (!model) {
        console.warn('⚠️ Модель не выбрана');
        return;
    }

    const options = getSelectedOptions();
    const totalPrice = calculateTotalPrice(model, options);
    
    const totalEl = document.getElementById('dash-total-price');
    if (totalEl) totalEl.textContent = totalPrice.toLocaleString() + ' руб.';
    
    updateOptionPrices(model);
    
    let powerFactor = 1.0;
    const hasServo = document.getElementById('opt-servo')?.checked;
    const hasInduction = document.getElementById('opt-induction')?.checked;
    const hasBimetal = document.getElementById('opt-bimetal')?.checked;
    const hasMagnetic = document.getElementById('opt-magnetic')?.checked;
    
    if (hasServo) powerFactor -= 0.55;
    if (hasInduction) powerFactor -= 0.15;
    
    const actualPower = (model.power * powerFactor).toFixed(1);
    const powerEl = document.getElementById('dash-power');
    if (powerEl) powerEl.textContent = `${actualPower} кВт/ч`;
    
    const energyClassEl = document.getElementById('dash-energy-class');
    if (energyClassEl) {
        if (hasServo && hasInduction) {
            energyClassEl.textContent = "Класс A+++";
            energyClassEl.className = "text-xs font-extrabold text-white px-2 py-0.5 rounded bg-emerald-600";
        } else if (hasServo) {
            energyClassEl.textContent = "Класс A+";
            energyClassEl.className = "text-xs font-extrabold text-white px-2 py-0.5 rounded bg-emerald-500";
        } else {
            energyClassEl.textContent = "Класс C";
            energyClassEl.className = "text-xs font-extrabold text-white px-2 py-0.5 rounded bg-amber-500";
        }
    }
    
    const tariff = 8.0;
    const baseAnnualCost = model.power * 24 * 350 * tariff;
    const currentAnnualCost = parseFloat(actualPower) * 24 * 350 * tariff;
    const annualSavings = Math.round(baseAnnualCost - currentAnnualCost);
    const savingsEl = document.getElementById('dash-savings');
    if (savingsEl) savingsEl.textContent = `${annualSavings.toLocaleString()} руб. / год`;
    
    const screwEl = document.getElementById('dash-screw-life');
    if (screwEl) screwEl.textContent = `${hasBimetal ? 25000 : model.screw_life} часов`;
    
    const setupEl = document.getElementById('dash-setup-time');
    if (setupEl) setupEl.textContent = `${hasMagnetic ? 10 : model.setup_time} мин`;
}

function updateOptionPrices(model) {
    if (!model) return;
    
    let servoPrice = 350000;
    let inductionPrice = 180000;
    let bimetalPrice = 150000;
    let magneticPrice = 420000;
    
    if (model.id === 1) {
        servoPrice = 240000;
        inductionPrice = 110000;
        bimetalPrice = 110000;
        magneticPrice = 280000;
    } else if (model.id === 3) {
        servoPrice = 580000;
        inductionPrice = 290000;
        bimetalPrice = 260000;
        magneticPrice = 680000;
    }
    
    const servoEl = document.getElementById('opt-price-servo');
    const inductionEl = document.getElementById('opt-price-induction');
    const bimetalEl = document.getElementById('opt-price-bimetal');
    const magneticEl = document.getElementById('opt-price-magnetic');
    
    if (servoEl) servoEl.textContent = `+${servoPrice.toLocaleString()} руб.`;
    if (inductionEl) inductionEl.textContent = `+${inductionPrice.toLocaleString()} руб.`;
    if (bimetalEl) bimetalEl.textContent = `+${bimetalPrice.toLocaleString()} руб.`;
    if (magneticEl) magneticEl.textContent = `+${magneticPrice.toLocaleString()} руб.`;
}

function addConfiguredMachineToCart() {
    console.log('🔍 addConfiguredMachineToCart вызвана');
    
    const model = getSelectedModel();
    if (!model) {
        alert('⚠️ Сначала выберите базовую модель ТПА (кликните на карточку)');
        return;
    }

    const options = getSelectedOptions();
    const totalPrice = calculateTotalPrice(model, options);
    const specTitle = options.length > 0 
        ? `${model.name} (${options.join(", ")})`
        : `${model.name} (Базовая комплектация)`;

    const product = {
        id: Date.now() + Math.random() * 1000,
        name: specTitle,
        price: totalPrice,
        image_url: model.image_url || model.image,
        description: `Конфигурация на базе ${model.name}`,
        quantity: 1,
        isConfigured: true
    };

    try {
        if (typeof window.addToCartFromCatalog === 'function') {
            window.addToCartFromCatalog(product);
        } else {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push(product);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            
            if (typeof window.renderCart === 'function') window.renderCart();
            if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
            
            alert('✅ Конфигурация добавлена в спецификацию!');
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert('❌ Ошибка при добавлении: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Инициализация конфигуратора...');
    setTimeout(() => {
        renderConfigurator();
        updateConfigStats();
        console.log('✅ Конфигуратор инициализирован');
    }, 500);
});

document.addEventListener('change', function(e) {
    if (e.target.id && e.target.id.startsWith('opt-')) {
        console.log('🔄 Изменена опция:', e.target.id);
        updateConfigStats();
    }
});

window.selectedModelId = selectedModelId;
window.getModels = getModels;
window.getSelectedModel = getSelectedModel;
window.getSelectedOptions = getSelectedOptions;
window.calculateTotalPrice = calculateTotalPrice;
window.renderConfigurator = renderConfigurator;
window.selectModel = selectModel;
window.updateConfigStats = updateConfigStats;
window.updateOptionPrices = updateOptionPrices;
window.addConfiguredMachineToCart = addConfiguredMachineToCart;
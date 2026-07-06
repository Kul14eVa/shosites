/**
 * Главный файл - запуск приложения
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Загрузка ПромСтройТех...');
    loadAllData();
});

async function loadAllData() {
    console.log('📦 Загрузка данных...');
    
    try {
        // Загружаем товары
        if (typeof loadProductsFromDB === 'function') {
            await loadProductsFromDB();
            console.log('✅ Товары загружены:', window.catalogProducts?.length || 0);
        }
        
        // Загружаем новости
        if (typeof loadNewsFromDB === 'function') {
            await loadNewsFromDB();
            console.log('✅ Новости загружены:', window.newsItems?.length || 0);
        }
        
        // Рендерим всё
        renderAll();
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
    }
}

function renderAll() {
    console.log('🔄 Рендеринг...');
    
    if (typeof renderCatalog === 'function') {
        renderCatalog();
    }
    
    if (typeof renderConfigurator === 'function') {
        renderConfigurator();
    }
    
    if (typeof updateConfigStats === 'function') {
        updateConfigStats();
    }
    
    if (typeof renderNews === 'function') {
        renderNews();
    }
    
    if (typeof renderCart === 'function') {
        renderCart();
    }
    
    if (typeof generateCaptcha === 'function') {
        generateCaptcha();
    }
    
    const adminBtn = document.getElementById('nav-admin');
    if (adminBtn) adminBtn.classList.add('hidden');
    
    console.log('✅ Приложение готово!');
}

function switchTab(tabId) {
    console.log('🔄 Переключение на вкладку:', tabId);
    
    ['home', 'catalog', 'cart', 'admin'].forEach(id => {
        const tab = document.getElementById('tab-' + id);
        if (tab) tab.classList.add('hidden');
    });
    
    const activeTab = document.getElementById('tab-' + tabId);
    if (activeTab) activeTab.classList.remove('hidden');
    
    ['home', 'catalog', 'cart', 'admin'].forEach(id => {
        const btn = document.getElementById('nav-' + id);
        if (btn) {
            btn.classList.toggle('text-orange-500', id === tabId);
            btn.classList.toggle('text-slate-300', id !== tabId);
        }
    });
    
    if (tabId === 'catalog' && typeof renderCatalog === 'function') {
        renderCatalog();
    }
    if (tabId === 'cart' && typeof renderCart === 'function') {
        renderCart();
    }
    if (tabId === 'admin' && typeof loadOrders === 'function') {
        loadOrders();
    }
}

function calculatePayback() {
    const price = parseFloat(document.getElementById('payback-price').value);
    const shifts = parseInt(document.getElementById('payback-shifts').value);
    const tariff = parseFloat(document.getElementById('payback-tariff').value);
    const savingsKwh = parseFloat(document.getElementById('payback-savings').value);

    if (!price || !shifts || !tariff || !savingsKwh) {
        alert('Заполните все поля');
        return;
    }

    const workDays = 350;
    const hoursPerDay = 24;
    const workHours = workDays * hoursPerDay;

    const yearlySavingsRub = savingsKwh * workHours * tariff;
    const monthlySavingsRub = yearlySavingsRub / 12;
    const paybackMonths = price / monthlySavingsRub;

    document.getElementById('payback-yearly').textContent = yearlySavingsRub.toLocaleString() + ' руб.';
    document.getElementById('payback-monthly').textContent = monthlySavingsRub.toLocaleString() + ' руб.';
    document.getElementById('payback-months').textContent = Math.ceil(paybackMonths);

    const result = document.getElementById('payback-result');
    if (result) {
        result.classList.remove('hidden');
    }
}

let logoClicks = 0;
let typedKeys = '';

function handleLogoClick() {
    logoClicks++;
    if (logoClicks >= 5) {
        activateAdminMode();
        logoClicks = 0;
    }
}

document.addEventListener('keydown', function(e) {
    typedKeys += e.key.toLowerCase();
    if (typedKeys.endsWith('usadm')) {
        activateAdminMode();
        typedKeys = '';
    }
    if (typedKeys.length > 20) {
        typedKeys = typedKeys.substring(typedKeys.length - 10);
    }
});

function activateAdminMode() {
    const adminButton = document.getElementById('nav-admin');
    if (adminButton && adminButton.classList.contains('hidden')) {
        adminButton.classList.remove('hidden');
        alert('🔐 Режим дилера активирован!');
    }
}

function openQrModal(platform) {
    const configs = {
        telegram: {
            name: "Дилер ПСТ Telegram",
            icon: '<i class="fa-brands fa-telegram text-sky-500"></i>',
            url: "https://t.me/promstroytech",
            color: "bg-sky-500 hover:bg-sky-600"
        },
        whatsapp: {
            name: "Отдел ТПА WhatsApp",
            icon: '<i class="fa-brands fa-whatsapp text-emerald-500"></i>',
            url: "https://wa.me/79991234567",
            color: "bg-emerald-500 hover:bg-emerald-600"
        }
    };

    const config = configs[platform];
    if (!config) return;

    document.getElementById('qr-platform-title').textContent = config.name;
    document.getElementById('qr-platform-icon').innerHTML = config.icon;
    
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(config.url);
    document.getElementById('qr-code-img').src = qrUrl;

    const linkBtn = document.getElementById('qr-direct-link');
    linkBtn.href = config.url;
    linkBtn.className = `block w-full text-white font-bold py-2.5 rounded-lg text-sm text-center transition ${config.color}`;

    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQrModal() {
    document.getElementById('qr-modal').classList.add('hidden');
}

function handleConsultationSubmit(e) {
    e.preventDefault();
    alert('✅ Запрос принят. Инженер свяжется с вами.');
    e.target.reset();
}


// ============================================================
// МОДАЛКА ПОДБОРА ОБОРУДОВАНИЯ
// ============================================================
function openEquipmentModal() {
    document.getElementById('equipment-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEquipmentModal() {
    document.getElementById('equipment-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================================
// ОТПРАВКА ЗАЯВКИ НА ПОДБОР ОБОРУДОВАНИЯ
// ============================================================
async function handleEquipmentSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('eq-email').value.trim();
    const phone = document.getElementById('eq-phone').value.trim();
    const name = document.getElementById('eq-name').value.trim();
    const city = document.getElementById('eq-city').value.trim();
    const company = document.getElementById('eq-company').value.trim();
    const description = document.getElementById('eq-description').value.trim();
    
    // Собираем выбранные типы оборудования
    const types = [];
    const checkboxes = document.querySelectorAll('#equipment-form input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        types.push(cb.value);
    });
    
    if (types.length === 0) {
        alert('Пожалуйста, выберите хотя бы один тип оборудования');
        return;
    }
    
    // Формируем текст заявки
    const itemsString = `Заявка на подбор оборудования:
Имя: ${name}
Город: ${city}
Организация: ${company || 'не указана'}
Интересует: ${types.join(', ')}
Описание: ${description || 'не указано'}`;
    
    try {
        const { data, error } = await supabaseClient
            .from('web_orders')
            .insert([{
                client_name: name,
                phone: phone,
                email: email,
                items: itemsString,
                total_price: 0,
                status: 'Новый'
            }])
            .select();
        
        if (error) throw new Error(error.message);
        
        alert('✅ Заявка на подбор оборудования отправлена! Наш специалист свяжется с вами в ближайшее время.');
        closeEquipmentModal();
        document.getElementById('equipment-form').reset();
        
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

window.switchTab = switchTab;
window.handleLogoClick = handleLogoClick;
window.activateAdminMode = activateAdminMode;
window.openQrModal = openQrModal;
window.closeQrModal = closeQrModal;
window.handleConsultationSubmit = handleConsultationSubmit;
window.calculatePayback = calculatePayback;
window.showAuthModal = function() { 
    if (typeof auth?.showModal === 'function') auth.showModal(); 
};
window.logout = function() { 
    if (typeof auth?.logout === 'function') auth.logout(); 
};

window.openEquipmentModal = openEquipmentModal;
window.closeEquipmentModal = closeEquipmentModal;
window.handleEquipmentSubmit = handleEquipmentSubmit;
/**
 * Модуль новостей
 */

let newsItems = [];

function getDefaultNews() {
    return [];
}

async function loadNewsFromDB() {
    try {
        const data = await DB.news.getAll();
        if (data && data.length > 0) {
            newsItems = data;
        } else {
            newsItems = [];
        }
        renderNews();
        console.log(`✅ Загружено ${newsItems.length} новостей`);
    } catch (error) {
        console.error('❌ Ошибка загрузки новостей:', error);
        newsItems = [];
        renderNews();
    }
}

function renderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    const isAdmin = window.isAdminMode === true;

    if (newsItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8 text-slate-400">
                <i class="fa-regular fa-newspaper text-4xl block mb-3"></i>
                <p>Новостей пока нет</p>
                ${isAdmin ? `
                    <button onclick="switchTab('admin')" class="mt-2 text-orange-500 hover:text-orange-600 text-sm">
                        <i class="fa-solid fa-plus mr-1"></i> Добавить новость
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = newsItems.map(item => `
        <div class="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-sm transition relative">
            ${isAdmin ? `
                <button onclick="deleteNews(${item.id})" 
                        class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition text-xs">
                    <i class="fa-solid fa-trash"></i>
                </button>
            ` : ''}
            <img src="${item.image_url}" alt="${item.title}" class="w-full h-40 object-cover rounded-lg mb-3">
            <span class="text-xs text-orange-600 font-semibold uppercase tracking-wider">${item.date}</span>
            <h3 class="font-bold text-slate-900 mt-1">${item.title}</h3>
            <p class="text-slate-600 text-sm mt-1">${item.content}</p>
        </div>
    `).join('');
}

async function addNews(newsData) {
    try {
        const newItem = await DB.news.create(newsData);
        newsItems.unshift(newItem);
        renderNews();
        alert('✅ Новость добавлена');
        return newItem;
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
        throw error;
    }
}

async function deleteNews(id) {
    if (!window.isAdminMode) {
        alert('⛔ Доступ запрещен');
        return;
    }
    
    const newsItem = newsItems.find(n => n.id === id);
    if (!newsItem) {
        alert('Новость не найдена');
        return;
    }
    
    if (!confirm(`Удалить новость "${newsItem.title}"?`)) return;
    
    try {
        await DB.news.delete(id);
        newsItems = newsItems.filter(n => n.id !== id);
        renderNews();
        alert('✅ Новость удалена');
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

window.newsItems = newsItems;
window.loadNewsFromDB = loadNewsFromDB;
window.renderNews = renderNews;
window.addNews = addNews;
window.deleteNews = deleteNews;
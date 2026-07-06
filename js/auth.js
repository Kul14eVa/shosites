/**
 * Модуль авторизации
 */

let currentUser = null;
let captchaText = '';
let captchaTimer = 60;
let captchaInterval = null;

function generateCaptcha() {
    const chars = CONFIG.CAPTCHA_CHARS;
    let result = '';
    for (let i = 0; i < CONFIG.CAPTCHA_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaText = result;
    document.getElementById('captcha-text').textContent = result;
    
    if (captchaInterval) clearInterval(captchaInterval);
    captchaTimer = CONFIG.CAPTCHA_TIMEOUT;
    document.getElementById('captcha-timer').textContent = captchaTimer;
    
    captchaInterval = setInterval(() => {
        captchaTimer--;
        document.getElementById('captcha-timer').textContent = captchaTimer;
        if (captchaTimer <= 0) {
            clearInterval(captchaInterval);
            generateCaptcha();
        }
    }, 1000);
}

function showAuthModal() {
    if (currentUser) {
        document.getElementById('user-dropdown').classList.toggle('hidden');
        return;
    }
    document.getElementById('auth-modal').classList.remove('hidden');
    generateCaptcha();
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    if (captchaInterval) clearInterval(captchaInterval);
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const loginBtn = document.getElementById('tab-btn-login');
    const registerBtn = document.getElementById('tab-btn-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginBtn.className = 'flex-1 pb-3 text-center font-bold text-sm text-orange-500 border-b-2 border-orange-500';
        registerBtn.className = 'flex-1 pb-3 text-center font-bold text-sm text-slate-400 border-b-2 border-transparent';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerBtn.className = 'flex-1 pb-3 text-center font-bold text-sm text-orange-500 border-b-2 border-orange-500';
        loginBtn.className = 'flex-1 pb-3 text-center font-bold text-sm text-slate-400 border-b-2 border-transparent';
        generateCaptcha();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const captcha = document.getElementById('reg-captcha').value.trim().toUpperCase();
    const agree = document.getElementById('reg-agreement').checked;

    if (!agree) {
        alert('Необходимо согласие на обработку данных');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
    }

    if (captcha !== captchaText) {
        alert('Неверный код CAPTCHA');
        generateCaptcha();
        document.getElementById('reg-captcha').value = '';
        return;
    }

    try {
        const exists = await DB.users.exists(email);
        if (exists) {
            alert('Пользователь с таким email уже существует');
            return;
        }

        await DB.users.create(email, password);
        
        loginUser(email);
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-captcha').value = '';
        generateCaptcha();
        alert('✅ Регистрация успешна!');

    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const user = await DB.users.login(email, password);
        
        if (!user) {
            alert('Неверный логин или пароль');
            return;
        }

        loginUser(email);
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        alert(`✅ Добро пожаловать, ${email}!`);

    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}

function loginUser(email) {
    currentUser = email;
    updateUserUI();
    closeAuthModal();
}

function logout() {
    currentUser = null;
    updateUserUI();
    document.getElementById('user-dropdown').classList.add('hidden');
    alert('👋 Вы вышли из аккаунта');
}

function updateUserUI() {
    const badge = document.getElementById('user-online-badge');
    const profileBtn = document.getElementById('user-profile-btn');
    const dropdownEmail = document.getElementById('user-dropdown-email');

    if (currentUser) {
        badge.classList.remove('hidden');
        profileBtn.classList.add('border-emerald-500', 'text-emerald-500');
        dropdownEmail.textContent = currentUser;
    } else {
        badge.classList.add('hidden');
        profileBtn.classList.remove('border-emerald-500', 'text-emerald-500');
        dropdownEmail.textContent = 'user@mail.com';
    }
}

function showAuthError(message) {
    const container = document.getElementById('auth-errors');
    container.textContent = message;
    container.classList.remove('hidden');
    setTimeout(() => container.classList.add('hidden'), 5000);
}

document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('user-dropdown');
    const profileBtn = document.getElementById('user-profile-btn');
    if (dropdown && profileBtn && !profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

window.currentUser = currentUser;
window.logout = logout;
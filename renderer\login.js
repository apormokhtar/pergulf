// login.js

const ADMIN_HASH_KEY = 'pergulf_admin_hash';
const ADMIN_INFO_KEY = 'pergulf_admin_info';
const SHOP_INFO_KEY = 'pergulf_shop_info';

document.addEventListener('DOMContentLoaded', function() {
    const isFirstRun = !localStorage.getItem(ADMIN_HASH_KEY);
    if (isFirstRun) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('setup-section').classList.remove('hidden');
    } else {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('setup-section').classList.add('hidden');
    }
});

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('success-msg').style.display = 'none';
}

function showSuccess(msg) {
    const el = document.getElementById('success-msg');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('error-msg').style.display = 'none';
}

// ==================== ثبت‌نام اولیه ====================
async function handleSetup() {
    const name = document.getElementById('setup-name').value.trim();
    const mobile = document.getElementById('setup-mobile').value.trim();
    const question = document.getElementById('setup-security-question').value;
    const answer = document.getElementById('setup-security-answer').value.trim();
    const shopName = document.getElementById('setup-shop-name').value.trim();
    const shopAddress = document.getElementById('setup-shop-address').value.trim();
    const shopPhone = document.getElementById('setup-shop-phone').value.trim();
    const password = document.getElementById('setup-password').value;
    const confirm = document.getElementById('setup-password-confirm').value;

    if (!name || !mobile || !question || !answer || !shopName || !password) {
        return showError('❌ لطفاً تمام فیلدهای ضروری را پر کنید.');
    }
    if (password !== confirm) {
        return showError('❌ رمز عبور و تکرار آن مطابقت ندارند.');
    }
    if (password.length < 6) {
        return showError('❌ رمز عبور باید حداقل ۶ کاراکتر باشد.');
    }

    const hash = await sha256(password);
    localStorage.setItem(ADMIN_HASH_KEY, hash);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify({ name, mobile, question, answer }));
    localStorage.setItem(SHOP_INFO_KEY, JSON.stringify({ shopName, shopAddress, shopPhone }));

    // ذخیره خودکار مدیر در لیست اشخاص
    const db = JSON.parse(localStorage.getItem('pergulf_db') || '{}');
    db.accounting = db.accounting || {};
    db.accounting.persons = db.accounting.persons || [];
    db.accounting.persons.push({
        id: 'admin-' + Date.now(),
        type: 'natural',
        customerType: 'employee',
        name: name,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        phones: [mobile],
        email: '',
        picture: '',
        nationalCode: '',
        birthDate: '',
        isAdmin: true
    });
    localStorage.setItem('pergulf_db', JSON.stringify(db));

    showSuccess('✅ ثبت‌نام با موفقیت انجام شد. در حال انتقال...');
    setTimeout(() => window.location.href = 'index.html', 1000);
}

// ==================== ورود ====================
async function handleLogin() {
    const password = document.getElementById('login-password').value;
    if (!password) return showError('❌ لطفاً رمز عبور را وارد کنید.');

    const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
    const hash = await sha256(password);

    if (hash === storedHash) {
        window.location.href = 'index.html';
    } else {
        showError('❌ رمز عبور اشتباه است.');
    }
}

// ==================== نمایش/مخفی کردن بخش‌ها ====================
function showRecovery() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('recovery-section').classList.remove('hidden');
    document.getElementById('error-msg').style.display = 'none';
    document.getElementById('success-msg').style.display = 'none';
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('recovery-section').classList.add('hidden');
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('error-msg').style.display = 'none';
    document.getElementById('success-msg').style.display = 'none';
}

// ==================== بازیابی رمز ====================
function checkRecoveryMobile() {
    const mobile = document.getElementById('recovery-mobile').value.trim();
    const savedInfo = JSON.parse(localStorage.getItem(ADMIN_INFO_KEY) || '{}');

    if (mobile !== savedInfo.mobile) {
        return showError('❌ شماره موبایل وارد شده با اطلاعات ثبت‌شده مطابقت ندارد.');
    }

    document.getElementById('recovery-question-text').textContent = savedInfo.question;
    document.getElementById('recovery-qa-section').classList.remove('hidden');
    showSuccess('✅ شماره موبایل تأیید شد. لطفاً به سوال امنیتی پاسخ دهید.');
}

function verifyRecoveryAnswer() {
    const answer = document.getElementById('recovery-answer').value.trim();
    const savedInfo = JSON.parse(localStorage.getItem(ADMIN_INFO_KEY) || '{}');

    if (answer.toLowerCase() !== savedInfo.answer.toLowerCase()) {
        return showError('❌ پاسخ اشتباه است.');
    }

    document.getElementById('recovery-qa-section').classList.add('hidden');
    document.getElementById('recovery-new-password-section').classList.remove('hidden');
    showSuccess('✅ پاسخ صحیح است. لطفاً رمز عبور جدید را وارد کنید.');
}

async function resetPassword() {
    const newPassword = document.getElementById('recovery-new-password').value;
    const confirm = document.getElementById('recovery-new-password-confirm').value;

    if (!newPassword) return showError('❌ لطفاً رمز عبور جدید را وارد کنید.');
    if (newPassword !== confirm) return showError('❌ رمز عبور و تکرار آن مطابقت ندارند.');
    if (newPassword.length < 6) return showError('❌ رمز عبور باید حداقل ۶ کاراکتر باشد.');

    const hash = await sha256(newPassword);
    localStorage.setItem(ADMIN_HASH_KEY, hash);

    showSuccess('✅ رمز عبور با موفقیت تغییر کرد. در حال انتقال...');
    setTimeout(showLogin, 1500);
}

// renderer.js

const APP_DB_KEY = 'pergulf_db';
function getAppDB() {
    const raw = localStorage.getItem(APP_DB_KEY);
    if (raw) {
        try { return JSON.parse(raw) || createDefaultDB(); } catch (e) { return createDefaultDB(); }
    }
    return createDefaultDB();
}
function saveAppDB(db) { localStorage.setItem(APP_DB_KEY, JSON.stringify(db)); }

function createDefaultDB() {
    return {
        persons: [],
        products: [],
        invoices: [],
        vouchers: [],
        settings: {
            businessName: '',
            businessAddress: '',
            businessPhone: '',
            businessEmail: '',
            businessWebsite: '',
            economicCode: '',
            nationalId: '',
            fiscalYearStart: '',
            fiscalYearEnd: '',
            taxRate: 9,
            currency: 'IRR',
            invoiceHeader: '',
            invoiceFooter: '',
            enableSMS: false,
            enableEmail: false,
            language: 'fa',
            theme: 'light',
            dbType: 'localStorage',
            sqliteFile: 'pergulf.db',
            remoteUrl: '',
            remoteKey: ''
        }
    };
}

// منوهای کشویی
document.querySelectorAll('.group-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
        this.classList.toggle('open');
        const sub = document.querySelector(`.submenu[data-group="${this.dataset.group}"]`);
        if (sub) sub.classList.toggle('open');
    });
});

// نگاشت صفحات
const pageMap = {
    'dashboard':             'modules/accounting/dashboard.html',
    'person-new':            'modules/accounting/persons/new.html',
    'persons-list':          'modules/accounting/persons/list.html',
    'goods-new':             'modules/accounting/goods/new.html',
    'goods-list':            'modules/accounting/goods/list.html',
    'sales-quick':           'modules/accounting/sales/quick.html',
    'settings':              'modules/accounting/settings.html'
};
function logout() {
    // پاک کردن session (نه دیتابیس)
    sessionStorage.clear();
    // برگشت به صفحه لاگین
    window.location.href = 'login.html';
}
// بارگذاری صفحه
async function loadPage(page) {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const content = document.getElementById('content');
    const path = pageMap[page] || 'modules/accounting/dashboard.html';

    if (window.electronAPI && window.electronAPI.readModule) {
        try {
            const result = await window.electronAPI.readModule(path);
            if (result.success) {
                content.innerHTML = result.content;
                setTimeout(() => {
                    const initFns = {
                        'person-new': initPersonNewPage,
                        'persons-list': initPersonsListPage,
                        'settings': initSettingsPage
                    };
                    const fn = initFns[page];
                    if (typeof fn === 'function') fn();
                }, 50);
            } else {
                content.innerHTML = `<div class="card"><h2>خطا در بارگذاری</h2></div>`;
            }
        } catch (err) {
            content.innerHTML = `<div class="card"><h2>خطا</h2></div>`;
        }
    } else {
        content.innerHTML = `<div class="card"><h2>خطا: API در دسترس نیست</h2></div>`;
    }
}

// کلیک روی دکمه‌های سایدبار
document.querySelectorAll('.sidebar-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        loadPage(this.dataset.page);
    });
});
function initLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }
}
document.addEventListener('DOMContentLoaded', function() {
    initLogoutButton();
    loadPage('dashboard');
});
// پیش‌فرض
loadPage('dashboard');

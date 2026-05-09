// =================== لیست اشخاص ===================
let currentFilterTab = 'all';
let searchTerm = '';

function initPersonsListPage() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            currentFilterTab = this.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderPersonsList();
        });
    });
    document.getElementById('persons-search')?.addEventListener('input', function() {
        searchTerm = this.value.trim();
        renderPersonsList();
    });
    renderPersonsList();
}

function renderPersonsList() {
    const db = getAppDB();
    const persons = db.accounting?.persons || [];
    let filtered = persons;
    if (currentFilterTab !== 'all') {
        filtered = persons.filter(p => p.customerType === currentFilterTab);
    }
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name || '').toLowerCase().includes(term) ||
            (p.phones || []).some(ph => ph.includes(term))
        );
    }

    const tbody = document.querySelector('#persons-list-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const typeLabels = { customer: 'مشتری', supplier: 'تأمین‌کننده', employee: 'کارمند', other: 'سایر' };

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td><img src="${p.picture || ''}" class="profile-thumb" onerror="this.style.display='none'"></td>
            <td>${p.firstName || p.companyName || '---'}</td>
            <td>${p.lastName || ''}</td>
            <td>${p.nationalCode || p.legalNationalCode || '---'}</td>
            <td>${(p.phones || []).join(', ') || '---'}</td>
            <td>${typeLabels[p.customerType] || p.customerType}</td>
            <td>
                <button class="btn btn-sm" onclick="event.stopPropagation(); editPerson('${p.id}')">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deletePerson('${p.id}')">🗑</button>
            </td>
        `;
        tr.addEventListener('click', () => {
            alert('📋 اطلاعات کامل:\n\n' +
                'نام: ' + (p.name || '---') + '\n' +
                'نوع: ' + (p.type === 'natural' ? 'حقیقی' : 'حقوقی') + '\n' +
                'کد ملی: ' + (p.nationalCode || '---') + '\n' +
                'تلفن: ' + ((p.phones || []).join(', ') || '---') + '\n' +
                'ایمیل: ' + (p.email || '---') + '\n' +
                'آدرس: ' + (p.address || '---')
            );
        });
        tbody.appendChild(tr);
    });

    document.getElementById('persons-count').textContent = filtered.length;
}

function deletePerson(id) {
    if (!confirm('آیا از حذف این شخص اطمینان دارید؟')) return;
    const db = getAppDB();
    db.accounting.persons = db.accounting.persons.filter(p => p.id !== id);
    saveAppDB(db);
    renderPersonsList();
}

function editPerson(id) {
    alert('امکان ویرایش به زودی اضافه می‌شود.');
}

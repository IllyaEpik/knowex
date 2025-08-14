document.addEventListener('DOMContentLoaded', () => {
    const createdTestsContainer = document.querySelector('.created-tests');
    const completedTestsContainer = document.querySelector('.completed-tests');
    const leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
    const rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
    const radioButtons = document.querySelectorAll('input[name="btn"]');

    let currentPage = 0;
    const testsPerPage = 2;

    function showPage(container, page) {
        if (!container) return;
        const tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(test => test.classList.remove('visible'));
        const start = page * testsPerPage;
        const end = start + testsPerPage;
        tests.slice(start, end).forEach(test => {
            test.classList.add('visible');
        });
        leftArrow && (leftArrow.style.opacity = page > 0 ? '1' : '0.3');
        rightArrow && (rightArrow.style.opacity = end < tests.length ? '1' : '0.3');
    }

    function getActiveContainer() {
        const checked = document.querySelector('input[name="btn"]:checked');
        if (!checked) return createdTestsContainer;
        return checked.value === 'option1' ? createdTestsContainer : completedTestsContainer;
    }

    function updateView() {
        const isCreated = document.querySelector('input[name="btn"]:checked').value === 'option1';
        if (createdTestsContainer) createdTestsContainer.style.display = isCreated ? 'block' : 'none';
        if (completedTestsContainer) completedTestsContainer.style.display = !isCreated ? 'block' : 'none';
        currentPage = 0;
        showPage(getActiveContainer(), currentPage);
    }

    radioButtons.forEach(btn => btn.addEventListener('change', updateView));

    leftArrow && leftArrow.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            showPage(getActiveContainer(), currentPage);
        }
    });

    rightArrow && rightArrow.addEventListener('click', () => {
        const container = getActiveContainer();
        const totalTests = container ? container.querySelectorAll('.test').length : 0;
        if ((currentPage + 1) * testsPerPage < totalTests) {
            currentPage++;
            showPage(container, currentPage);
        }
    });

    const toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) {
        const passwordInput = document.getElementById('user-password');
        const icon = toggleBtn.querySelector('img');
        toggleBtn.addEventListener('click', () => {
            if (!passwordInput) return;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon && (icon.src = icon.src.replace('hide_close', 'hide_open') || '/user/images/hide_open.svg');
            } else {
                passwordInput.type = 'password';
                icon && (icon.src = icon.src.replace('hide_open', 'hide_close') || '/user/images/hide_close.svg');
            }
        });
    }

    function createEditModal() {
        if (document.getElementById('editTestModal')) return;
        const modalHtml = `
            <div id="editTestModal" class="edit-modal" style="display:none; position:fixed; inset:0; z-index:9999; align-items:center; justify-content:center;">
                <div class="edit-modal-backdrop" style="position:absolute; inset:0; background:rgba(0,0,0,0.4);"></div>
                <div class="edit-modal-window" role="dialog" aria-modal="true"
                     style="position:relative; max-width:520px; width:90%; background:#fff; padding:18px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.2);">
                    <h3 style="margin-top:0;">Редагувати тест</h3>
                    <form id="editTestForm">
                        <div style="margin-bottom:10px;">
                            <label for="editTestTitle">Назва</label><br>
                            <input id="editTestTitle" name="title" type="text" style="width:100%; padding:8px;" required />
                        </div>
                        <div style="margin-bottom:10px;">
                            <label for="editTestDesc">Опис (опціонально)</label><br>
                            <textarea id="editTestDesc" name="description" style="width:100%; padding:8px;" rows="4"></textarea>
                        </div>
                        <div style="display:flex; gap:8px; justify-content:flex-end;">
                            <button type="button" id="cancelEditBtn">Відміна</button>
                            <button type="submit" id="saveEditBtn">Зберегти</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('editTestModal');
        const backdrop = modal.querySelector('.edit-modal-backdrop');
        const cancelBtn = modal.querySelector('#cancelEditBtn');
        backdrop.addEventListener('click', closeEditModal);
        cancelBtn.addEventListener('click', closeEditModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') closeEditModal();
        });
        modal.querySelector('#editTestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            saveEditFromModal();
        });
    }

    let currentEditingTest = null;
    function openEditModal(testEl) {
        createEditModal();
        currentEditingTest = testEl;
        const modal = document.getElementById('editTestModal');
        const titleInput = modal.querySelector('#editTestTitle');
        const descInput = modal.querySelector('#editTestDesc');
        const titleNode = testEl.querySelector('.test-title') || testEl.querySelector('.name');
        const dataTitle = testEl.dataset.title || (titleNode && titleNode.innerText) || '';
        const dataDesc = testEl.dataset.description || '';
        titleInput.value = dataTitle;
        descInput.value = dataDesc;
        modal.style.display = 'flex';
        setTimeout(() => titleInput.focus(), 50);
    }

    function closeEditModal() {
        const modal = document.getElementById('editTestModal');
        if (!modal) return;
        modal.style.display = 'none';
        currentEditingTest = null;
    }

    function saveEditFromModal() {
        if (!currentEditingTest) return;
        const modal = document.getElementById('editTestModal');
        const titleInput = modal.querySelector('#editTestTitle');
        const descInput = modal.querySelector('#editTestDesc');
        const newTitle = titleInput.value.trim();
        const newDesc = descInput.value.trim();
        let titleNode = currentEditingTest.querySelector('.test-title') || currentEditingTest.querySelector('.name');
        if (titleNode) titleNode.innerText = newTitle;
        currentEditingTest.dataset.title = newTitle;
        currentEditingTest.dataset.description = newDesc;
        const id = currentEditingTest.dataset.id;
        if (id) {
            saveTestToStorage(id, newTitle, newDesc);
        }
        closeEditModal();
    }

    function ensureEditButtons(container) {
        if (!container) return;
        const tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(test => {
            if (test.querySelector('.edit-name')) {
                const btn = test.querySelector('.edit-name');
                if (!btn._hasListener) {
                    btn.addEventListener('click', () => openEditModal(test));
                    btn._hasListener = true;
                }
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'edit-name';
            btn.innerHTML = '<img src="/user/images/edit.svg">';
            btn.addEventListener('click', () => openEditModal(test));
            const actions = test.querySelector('.name-block') || test;
            actions.appendChild(btn);
        });
    }

    function saveTestToStorage(id, title, description) {
        try {
            const key = 'testsData';
            const raw = localStorage.getItem(key);
            const all = raw ? JSON.parse(raw) : {};
            all[id] = { title, description, updatedAt: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(all));
        } catch (err) {
            console.warn('Не удалось сохранить тест в localStorage', err);
        }
    }

    function loadTestsFromStorageApply(container) {
        try {
            const key = 'testsData';
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const all = JSON.parse(raw);
            const tests = Array.from(container.querySelectorAll('.test'));
            tests.forEach(test => {
                const id = test.dataset.id;
                if (!id) return;
                const stored = all[id];
                if (!stored) return;
                const titleNode = test.querySelector('.test-title') || test.querySelector('.name');
                if (titleNode) titleNode.innerText = stored.title;
                else test.dataset.title = stored.title;
                const descNode = test.querySelector('.test-desc');
                if (descNode) descNode.innerText = stored.description;
                else test.dataset.description = stored.description;
            });
        } catch (err) {
            console.warn('Не удалось загрузить тесты из localStorage', err);
        }
    }

    function initEditingFeatures() {
        [createdTestsContainer, completedTestsContainer].forEach(container => {
            if (!container) return;
            ensureEditButtons(container);
            loadTestsFromStorageApply(container);
        });
    }

    const userDesc = document.querySelector('.add-description');
    if (userDesc) {
        const savedDesc = localStorage.getItem('userDescription');
        if (savedDesc) userDesc.value = savedDesc;
        let descTimer = null;
        userDesc.addEventListener('input', () => {
            clearTimeout(descTimer);
            descTimer = setTimeout(() => localStorage.setItem('userDescription', userDesc.value), 600);
        });
        userDesc.addEventListener('blur', () => localStorage.setItem('userDescription', userDesc.value));
    }

    function enableInlineSettings() {
        document.querySelectorAll('.settings-block').forEach(block => {
            const textEl = block.querySelector('.text');
            const imgBtn = block.querySelector('.img_button');
            if (!textEl || !imgBtn) return;
            if (imgBtn._hasListener) return;
            imgBtn.addEventListener('click', () => {
                const field = imgBtn.dataset.field || textEl.dataset.field || null;
                if (field === 'password') {
                    const pwInput = block.querySelector('#user-password');
                    if (!pwInput) return;
                    pwInput.removeAttribute('readonly');
                    pwInput.focus();
                    const savePw = () => {
                        pwInput.setAttribute('readonly', '');
                        localStorage.setItem('setting_password', pwInput.value);
                    };
                    pwInput.addEventListener('blur', savePw, { once: true });
                    pwInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            savePw();
                            pwInput.blur();
                        }
                    });
                    return;
                }
                const curValue = textEl.innerText.trim();
                const input = document.createElement('input');
                input.type = 'text';
                input.value = curValue;
                input.style.width = '100%';
                block.replaceChild(input, textEl);
                input.focus();
                const save = () => {
                    const newVal = input.value.trim();
                    const p = document.createElement('p');
                    p.className = 'text';
                    if (field) p.dataset.field = field;
                    p.innerText = newVal;
                    block.replaceChild(p, input);
                    if (field) {
                        try { localStorage.setItem('setting_' + field, newVal); } catch (e) { }
                    }
                };
                input.addEventListener('blur', save);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        save();
                        input.blur();
                    } else if (e.key === 'Escape') {
                        const p = document.createElement('p');
                        p.className = 'text';
                        if (input.dataset.field) p.dataset.field = input.dataset.field;
                        p.innerText = curValue;
                        block.replaceChild(p, input);
                    }
                });
            });
            imgBtn._hasListener = true;
        });
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(k => {
                if (!k.startsWith('setting_')) return;
                const field = k.replace('setting_', '');
                const val = localStorage.getItem(k);
                const el = document.querySelector(`.settings-block .text[data-field="${field}"]`);
                if (el) el.innerText = val;
                else {
                    if (field === 'password') {
                        const pw = document.querySelector('#user-password');
                        if (pw) pw.value = val;
                    }
                }
            });
        } catch (e) { }
    }

    initEditingFeatures();
    enableInlineSettings();
    updateView();
});
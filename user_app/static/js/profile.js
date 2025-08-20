$(function () {
    var createdTestsContainer = document.querySelector('.created-tests');
    var completedTestsContainer = document.querySelector('.completed-tests');
    var leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
    var rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
    var radioButtons = document.querySelectorAll('input[name="btn"]');
    function rightPrint(text) {
        var messagesContainer = document.querySelector(".messages#messages");
        if (!messagesContainer) return;
        var message = document.createElement("div");
        message.className = "message";
        message.id = "message";
        if (text.toLowerCase().includes('збереж')) {
            message.style.background = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        } else {
            message.style.background = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        message.textContent = text;
        messagesContainer.appendChild(message);
        setTimeout(function () { message.classList.add("show"); }, 100);
        setTimeout(function () { message.classList.add("hide"); setTimeout(function () { message.remove(); }, 500); }, 5000);
    }
    var currentPage = 0;
    var testsPerPage = 2;
    function showPage(container, page) {
        if (!container) return;
        var tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(function (t) { t.classList.remove('visible'); });
        var start = page * testsPerPage;
        var end = start + testsPerPage;
        tests.slice(start, end).forEach(function (t) { t.classList.add('visible'); });
        if (leftArrow) leftArrow.style.opacity = page > 0 ? '1' : '0.3';
        if (rightArrow) rightArrow.style.opacity = end < tests.length ? '1' : '0.3';
    }
    function getActiveContainer() {
        var checked = document.querySelector('input[name="btn"]:checked');
        if (!checked) return createdTestsContainer;
        return checked.value === 'option1' ? createdTestsContainer : completedTestsContainer;
    }
    function updateView() {
        var checked = document.querySelector('input[name="btn"]:checked');
        var isCreated = checked ? checked.value === 'option1' : true;
        if (createdTestsContainer) createdTestsContainer.style.display = isCreated ? 'block' : 'none';
        if (completedTestsContainer) completedTestsContainer.style.display = !isCreated ? 'block' : 'none';
        currentPage = 0;
        showPage(getActiveContainer(), currentPage);
    }
    radioButtons.forEach(function (btn) { btn.addEventListener('change', updateView); });
    if (leftArrow) leftArrow.addEventListener('click', function () {
        if (currentPage > 0) { currentPage--; showPage(getActiveContainer(), currentPage); }
    });
    if (rightArrow) rightArrow.addEventListener('click', function () {
        var container = getActiveContainer();
        var totalTests = container ? container.querySelectorAll('.test').length : 0;
        if ((currentPage + 1) * testsPerPage < totalTests) { currentPage++; showPage(container, currentPage); }
    });
    var toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) {
        var passwordInput = document.getElementById('user-password');
        var icon = toggleBtn.querySelector('img');
        toggleBtn.addEventListener('click', function () {
            if (!passwordInput) return;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                if (icon) icon.src = icon.src.replace('hide_close', 'hide_open') || '/user/images/hide_open.svg';
            } else {
                passwordInput.type = 'password';
                if (icon) icon.src = icon.src.replace('hide_open', 'hide_close') || '/user/images/hide_close.svg';
            }
        });
    }
    function createEditModal() {
        if (document.getElementById('editTestModal')) return;
        var modalHtml = '<div id="editTestModal" class="edit-modal" style="display:none; position:fixed; inset:0; z-index:9999; align-items:center; justify-content:center;">' +
            '<div class="edit-modal-backdrop" style="position:absolute; inset:0; background:rgba(0,0,0,0.4);"></div>' +
            '<div class="edit-modal-window" role="dialog" aria-modal="true" style="position:relative; max-width:520px; width:90%; background:#fff; padding:18px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.2);">' +
            '<h3 style="margin-top:0;">Редагувати тест</h3>' +
            '<form id="editTestForm">' +
            '<div style="margin-bottom:10px;"><label for="editTestTitle">Назва</label><br><input id="editTestTitle" name="title" type="text" style="width:100%; padding:8px;" required /></div>' +
            '<div style="margin-bottom:10px;"><label for="editTestDesc">Опис (опціонально)</label><br><textarea id="editTestDesc" name="description" style="width:100%; padding:8px;" rows="4"></textarea></div>' +
            '<div style="display:flex; gap:8px; justify-content:flex-end;"><button type="button" id="cancelEditBtn">Відміна</button><button type="submit" id="saveEditBtn">Зберегти</button></div>' +
            '</form></div></div>';
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        var modal = document.getElementById('editTestModal');
        var backdrop = modal.querySelector('.edit-modal-backdrop');
        var cancelBtn = modal.querySelector('#cancelEditBtn');
        backdrop.addEventListener('click', closeEditModal);
        cancelBtn.addEventListener('click', closeEditModal);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display === 'flex') closeEditModal(); });
        modal.querySelector('#editTestForm').addEventListener('submit', function (e) { e.preventDefault(); saveEditFromModal(); });
    }
    var currentEditingTest = null;
    function openEditModal(testEl) {
        createEditModal();
        currentEditingTest = testEl;
        var modal = document.getElementById('editTestModal');
        var titleInput = modal.querySelector('#editTestTitle');
        var descInput = modal.querySelector('#editTestDesc');
        var titleNode = testEl.querySelector('.test-title') || testEl.querySelector('.name');
        var dataTitle = testEl.dataset.title || (titleNode && titleNode.innerText) || '';
        var dataDesc = testEl.dataset.description || '';
        titleInput.value = dataTitle;
        descInput.value = dataDesc;
        modal.style.display = 'flex';
        setTimeout(function () { titleInput.focus(); }, 50);
    }
    function closeEditModal() {
        var modal = document.getElementById('editTestModal');
        if (!modal) return;
        modal.style.display = 'none';
        currentEditingTest = null;
    }
    function getCsrfToken() {
        var m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.content : null;
    }
    function saveTestToServer(id, title, description) {
        var csrf = getCsrfToken();
        $.ajax({
            url: '/profile/api/update_test',
            method: 'POST',
            data: JSON.stringify({ id: id, title: title, description: description }),
            contentType: 'application/json',
            headers: csrf ? { 'X-CSRFToken': csrf } : {},
            success: function (data) {
                if (data && data.success) {
                    rightPrint('Тест збережено');
                } else {
                    rightPrint('Помилка: ' + ((data && data.error) ? data.error : 'помилка'));
                    saveTestToLocalFallback(id, title, description);
                }
            },
            error: function (xhr) {
                rightPrint('Помилка мережі — збережено локально (' + xhr.status + ')');
                saveTestToLocalFallback(id, title, description);
            }
        });
    }
    function saveTestToLocalFallback(id, title, description) {
        try {
            var key = 'testsData';
            var raw = localStorage.getItem(key);
            var all = raw ? JSON.parse(raw) : {};
            all[id || ('tmp_' + Date.now())] = { title: title, description: description, updatedAt: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(all));
        } catch (err) {}
    }
    function saveSettingToServer(field, value) {
        var csrf = getCsrfToken();
        $.ajax({
            url: '/profile/api/update_setting',
            method: 'POST',
            data: JSON.stringify({ field: field, value: value }),
            contentType: 'application/json',
            headers: csrf ? { 'X-CSRFToken': csrf } : {},
            success: function (data) {
                if (data && data.success) {
                    rightPrint('Збережено');
                } else {
                    try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                    rightPrint('Помилка: ' + ((data && data.error) ? data.error : 'помилка'));
                }
            },
            error: function (xhr) {
                if (xhr.status === 405 || xhr.status === 415) {
                    var fd = new FormData();
                    fd.append(field, value);
                    $.ajax({
                        url: '/update_user',
                        method: 'POST',
                        data: fd,
                        processData: false,
                        contentType: false,
                        success: function (d2) {
                            if (d2 && d2.success) {
                                rightPrint('Збережено');
                            } else {
                                try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                                rightPrint('Помилка: ' + ((d2 && d2.error) ? d2.error : 'помилка'));
                            }
                        },
                        error: function () {
                            try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                            rightPrint('Помилка мережі — збережено локально');
                        }
                    });
                    return;
                }
                try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                rightPrint('Помилка мережі — збережено локально (' + xhr.status + ')');
            }
        });
    }
    function saveEditFromModal() {
        if (!currentEditingTest) return;
        var modal = document.getElementById('editTestModal');
        var titleInput = modal.querySelector('#editTestTitle');
        var descInput = modal.querySelector('#editTestDesc');
        var newTitle = titleInput.value.trim();
        var newDesc = descInput.value.trim();
        var titleNode = currentEditingTest.querySelector('.test-title') || currentEditingTest.querySelector('.name');
        if (titleNode) titleNode.innerText = newTitle;
        currentEditingTest.dataset.title = newTitle;
        currentEditingTest.dataset.description = newDesc;
        var id = currentEditingTest.dataset.id;
        if (id) saveTestToServer(id, newTitle, newDesc);
        closeEditModal();
    }
    function ensureEditButtons(container) {
        if (!container) return;
        var tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(function (test) {
            if (test.querySelector('.edit-name')) {
                var btn = test.querySelector('.edit-name');
                if (!btn._hasListener) {
                    btn.addEventListener('click', function () { openEditModal(test); });
                    btn._hasListener = true;
                }
                return;
            }
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'edit-name';
            btn.innerHTML = '<img src="/user/images/edit.svg">';
            btn.addEventListener('click', function () { openEditModal(test); });
            var actions = test.querySelector('.name-block') || test;
            actions.appendChild(btn);
        });
    }
    function initEditingFeatures() {
        [createdTestsContainer, completedTestsContainer].forEach(function (container) {
            if (!container) return;
            ensureEditButtons(container);
        });
    }
    var userDesc = document.querySelector('.add-description');
    if (userDesc) {
        var savedDesc = localStorage.getItem('userDescription');
        if (savedDesc) userDesc.value = savedDesc;
        var descTimer = null;
        userDesc.addEventListener('input', function () {
            clearTimeout(descTimer);
            descTimer = setTimeout(function () {
                try { localStorage.setItem('userDescription', userDesc.value); } catch (e) {}
                saveSettingToServer('description', userDesc.value);
            }, 600);
        });
        userDesc.addEventListener('blur', function () {
            try { localStorage.setItem('userDescription', userDesc.value); } catch (e) {}
            saveSettingToServer('description', userDesc.value);
        });
    }
    function enableInlineSettings() {
        document.querySelectorAll('.settings-block').forEach(function (block) {
            var textEl = block.querySelector('.text');
            var imgBtn = block.querySelector('.img_button');
            if (!textEl || !imgBtn) return;
            if (imgBtn._hasListener) return;
            imgBtn.addEventListener('click', function () {
                var field = imgBtn.dataset.field || textEl.dataset.field || null;
                if (field === 'password') {
                    var pwInput = block.querySelector('#user-password');
                    if (!pwInput) return;
                    pwInput.removeAttribute('readonly');
                    pwInput.focus();
                    var savePw = function () {
                        pwInput.setAttribute('readonly', '');
                        saveSettingToServer('password', pwInput.value);
                    };
                    pwInput.addEventListener('blur', savePw, { once: true });
                    pwInput.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter') { e.preventDefault(); pwInput.blur(); }
                    });
                    return;
                }
                var curValue = textEl.innerText.trim();
                var input = document.createElement('input');
                input.type = 'text';
                input.value = curValue;
                input.style.width = '100%';
                var parent = textEl.parentNode;
                try {
                    if (parent && parent.contains(textEl)) parent.replaceChild(input, textEl); else block.appendChild(input);
                } catch (e) { block.appendChild(input); }
                input.focus();
                var save = function () {
                    var newVal = input.value.trim();
                    var p = document.createElement('p');
                    p.className = 'text';
                    if (field) p.dataset.field = field;
                    p.innerText = newVal;
                    try {
                        var pnode = input.parentNode;
                        if (pnode) pnode.replaceChild(p, input); else block.appendChild(p);
                    } catch (err) { try { block.appendChild(p); } catch (e) {} }
                    if (field) { try { localStorage.setItem('setting_' + field, newVal); } catch (e) {} saveSettingToServer(field, newVal); }
                };
                input.addEventListener('blur', function () { save(); }, { once: true });
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
                    if (e.key === 'Escape') { try { var p2 = document.createElement('p'); p2.className = 'text'; p2.innerText = curValue; input.parentNode.replaceChild(p2, input); } catch (e) {} }
                });
            });
            imgBtn._hasListener = true;
        });
        try {
            var keys = Object.keys(localStorage);
            keys.forEach(function (k) {
                if (!k.startsWith('setting_')) return;
                var field = k.replace('setting_', '');
                var val = localStorage.getItem(k);
                var el = document.querySelector('.settings-block .text[data-field="' + field + '"]');
                if (el) el.innerText = val;
                else {
                    if (field === 'password') {
                        var pw = document.querySelector('#user-password');
                        if (pw) pw.value = val;
                    }
                }
            });
        } catch (e) {}
    }
    initEditingFeatures();
    enableInlineSettings();
    updateView();
});
$(function () {
    var createdTestsContainer = document.querySelector('.created-tests');
    var completedTestsContainer = document.querySelector('.completed-tests');
    var leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
    var rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
    var radioButtons = document.querySelectorAll('input[name="btn"]');
    function rightPrint(text) {
        var messagesContainer = document.querySelector(".messages#messages");
        if (!messagesContainer) return;
        var message = document.createElement("div");
        message.className = "message";
        message.id = "message";
        if (text.toLowerCase().includes('збереж')) {
            message.style.background = '#d4edda';
            message.style.color = '#155724';
            message.style.border = '1px solid #c3e6cb';
        } else {
            message.style.background = '#f8d7da';
            message.style.color = '#721c24';
            message.style.border = '1px solid #f5c6cb';
        }
        message.textContent = text;
        messagesContainer.appendChild(message);
        setTimeout(function () { message.classList.add("show"); }, 100);
        setTimeout(function () { message.classList.add("hide"); setTimeout(function () { message.remove(); }, 500); }, 5000);
    }
    var currentPage = 0;
    var testsPerPage = 2;
    function showPage(container, page) {
        if (!container) return;
        var tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(function (t) { t.classList.remove('visible'); });
        var start = page * testsPerPage;
        var end = start + testsPerPage;
        tests.slice(start, end).forEach(function (t) { t.classList.add('visible'); });
        if (leftArrow) leftArrow.style.opacity = page > 0 ? '1' : '0.3';
        if (rightArrow) rightArrow.style.opacity = end < tests.length ? '1' : '0.3';
    }
    function getActiveContainer() {
        var checked = document.querySelector('input[name="btn"]:checked');
        if (!checked) return createdTestsContainer;
        return checked.value === 'option1' ? createdTestsContainer : completedTestsContainer;
    }
    function updateView() {
        var checked = document.querySelector('input[name="btn"]:checked');
        var isCreated = checked ? checked.value === 'option1' : true;
        if (createdTestsContainer) createdTestsContainer.style.display = isCreated ? 'block' : 'none';
        if (completedTestsContainer) completedTestsContainer.style.display = !isCreated ? 'block' : 'none';
        currentPage = 0;
        showPage(getActiveContainer(), currentPage);
    }
    radioButtons.forEach(function (btn) { btn.addEventListener('change', updateView); });
    if (leftArrow) leftArrow.addEventListener('click', function () {
        if (currentPage > 0) { currentPage--; showPage(getActiveContainer(), currentPage); }
    });
    if (rightArrow) rightArrow.addEventListener('click', function () {
        var container = getActiveContainer();
        var totalTests = container ? container.querySelectorAll('.test').length : 0;
        if ((currentPage + 1) * testsPerPage < totalTests) { currentPage++; showPage(container, currentPage); }
    });
    var toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) {
        var passwordInput = document.getElementById('user-password');
        var icon = toggleBtn.querySelector('img');
        toggleBtn.addEventListener('click', function () {
            if (!passwordInput) return;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                if (icon) icon.src = icon.src.replace('hide_close', 'hide_open') || '/user/images/hide_open.svg';
            } else {
                passwordInput.type = 'password';
                if (icon) icon.src = icon.src.replace('hide_open', 'hide_close') || '/user/images/hide_close.svg';
            }
        });
    }
    function createEditModal() {
        if (document.getElementById('editTestModal')) return;
        var modalHtml = '<div id="editTestModal" class="edit-modal" style="display:none; position:fixed; inset:0; z-index:9999; align-items:center; justify-content:center;">' +
            '<div class="edit-modal-backdrop" style="position:absolute; inset:0; background:rgba(0,0,0,0.4);"></div>' +
            '<div class="edit-modal-window" role="dialog" aria-modal="true" style="position:relative; max-width:520px; width:90%; background:#fff; padding:18px; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.2);">' +
            '<h3 style="margin-top:0;">Редагувати тест</h3>' +
            '<form id="editTestForm">' +
            '<div style="margin-bottom:10px;"><label for="editTestTitle">Назва</label><br><input id="editTestTitle" name="title" type="text" style="width:100%; padding:8px;" required /></div>' +
            '<div style="margin-bottom:10px;"><label for="editTestDesc">Опис (опціонально)</label><br><textarea id="editTestDesc" name="description" style="width:100%; padding:8px;" rows="4"></textarea></div>' +
            '<div style="display:flex; gap:8px; justify-content:flex-end;"><button type="button" id="cancelEditBtn">Відміна</button><button type="submit" id="saveEditBtn">Зберегти</button></div>' +
            '</form></div></div>';
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        var modal = document.getElementById('editTestModal');
        var backdrop = modal.querySelector('.edit-modal-backdrop');
        var cancelBtn = modal.querySelector('#cancelEditBtn');
        backdrop.addEventListener('click', closeEditModal);
        cancelBtn.addEventListener('click', closeEditModal);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display === 'flex') closeEditModal(); });
        modal.querySelector('#editTestForm').addEventListener('submit', function (e) { e.preventDefault(); saveEditFromModal(); });
    }
    var currentEditingTest = null;
    function openEditModal(testEl) {
        createEditModal();
        currentEditingTest = testEl;
        var modal = document.getElementById('editTestModal');
        var titleInput = modal.querySelector('#editTestTitle');
        var descInput = modal.querySelector('#editTestDesc');
        var titleNode = testEl.querySelector('.test-title') || testEl.querySelector('.name');
        var dataTitle = testEl.dataset.title || (titleNode && titleNode.innerText) || '';
        var dataDesc = testEl.dataset.description || '';
        titleInput.value = dataTitle;
        descInput.value = dataDesc;
        modal.style.display = 'flex';
        setTimeout(function () { titleInput.focus(); }, 50);
    }
    function closeEditModal() {
        var modal = document.getElementById('editTestModal');
        if (!modal) return;
        modal.style.display = 'none';
        currentEditingTest = null;
    }
    function getCsrfToken() {
        var m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.content : null;
    }
    function saveTestToServer(id, title, description) {
        var csrf = getCsrfToken();
        $.ajax({
            url: '/profile/api/update_test',
            method: 'POST',
            data: JSON.stringify({ id: id, title: title, description: description }),
            contentType: 'application/json',
            headers: csrf ? { 'X-CSRFToken': csrf } : {},
            success: function (data) {
                if (data && data.success) {
                    rightPrint('Тест збережено');
                } else {
                    rightPrint('Помилка: ' + ((data && data.error) ? data.error : 'помилка'));
                    saveTestToLocalFallback(id, title, description);
                }
            },
            error: function (xhr) {
                rightPrint('Помилка мережі — збережено локально (' + xhr.status + ')');
                saveTestToLocalFallback(id, title, description);
            }
        });
    }
    function saveTestToLocalFallback(id, title, description) {
        try {
            var key = 'testsData';
            var raw = localStorage.getItem(key);
            var all = raw ? JSON.parse(raw) : {};
            all[id || ('tmp_' + Date.now())] = { title: title, description: description, updatedAt: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(all));
        } catch (err) {}
    }
    function saveSettingToServer(field, value) {
        var csrf = getCsrfToken();
        $.ajax({
            url: '/profile/api/update_setting',
            method: 'POST',
            data: JSON.stringify({ field: field, value: value }),
            contentType: 'application/json',
            headers: csrf ? { 'X-CSRFToken': csrf } : {},
            success: function (data) {
                if (data && data.success) {
                    rightPrint('Збережено');
                } else {
                    try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                    rightPrint('Помилка: ' + ((data && data.error) ? data.error : 'помилка'));
                }
            },
            error: function (xhr) {
                if (xhr.status === 405 || xhr.status === 415) {
                    var fd = new FormData();
                    fd.append(field, value);
                    $.ajax({
                        url: '/update_user',
                        method: 'POST',
                        data: fd,
                        processData: false,
                        contentType: false,
                        success: function (d2) {
                            if (d2 && d2.success) {
                                rightPrint('Збережено');
                            } else {
                                try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                                rightPrint('Помилка: ' + ((d2 && d2.error) ? d2.error : 'помилка'));
                            }
                        },
                        error: function () {
                            try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                            rightPrint('Помилка мережі — збережено локально');
                        }
                    });
                    return;
                }
                try { localStorage.setItem('setting_' + field, value); } catch (e) {}
                rightPrint('Помилка мережі — збережено локально (' + xhr.status + ')');
            }
        });
    }
    function saveEditFromModal() {
        if (!currentEditingTest) return;
        var modal = document.getElementById('editTestModal');
        var titleInput = modal.querySelector('#editTestTitle');
        var descInput = modal.querySelector('#editTestDesc');
        var newTitle = titleInput.value.trim();
        var newDesc = descInput.value.trim();
        var titleNode = currentEditingTest.querySelector('.test-title') || currentEditingTest.querySelector('.name');
        if (titleNode) titleNode.innerText = newTitle;
        currentEditingTest.dataset.title = newTitle;
        currentEditingTest.dataset.description = newDesc;
        var id = currentEditingTest.dataset.id;
        if (id) saveTestToServer(id, newTitle, newDesc);
        closeEditModal();
    }
    function ensureEditButtons(container) {
        if (!container) return;
        var tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(function (test) {
            if (test.querySelector('.edit-name')) {
                var btn = test.querySelector('.edit-name');
                if (!btn._hasListener) {
                    btn.addEventListener('click', function () { openEditModal(test); });
                    btn._hasListener = true;
                }
                return;
            }
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'edit-name';
            btn.innerHTML = '<img src="/user/images/edit.svg">';
            btn.addEventListener('click', function () { openEditModal(test); });
            var actions = test.querySelector('.name-block') || test;
            actions.appendChild(btn);
        });
    }
    function initEditingFeatures() {
        [createdTestsContainer, completedTestsContainer].forEach(function (container) {
            if (!container) return;
            ensureEditButtons(container);
        });
    }
    var userDesc = document.querySelector('.add-description');
    if (userDesc) {
        var savedDesc = localStorage.getItem('userDescription');
        if (savedDesc) userDesc.value = savedDesc;
        var descTimer = null;
        userDesc.addEventListener('input', function () {
            clearTimeout(descTimer);
            descTimer = setTimeout(function () {
                try { localStorage.setItem('userDescription', userDesc.value); } catch (e) {}
                saveSettingToServer('description', userDesc.value);
            }, 600);
        });
        userDesc.addEventListener('blur', function () {
            try { localStorage.setItem('userDescription', userDesc.value); } catch (e) {}
            saveSettingToServer('description', userDesc.value);
        });
    }
    function enableInlineSettings() {
        document.querySelectorAll('.settings-block').forEach(function (block) {
            var textEl = block.querySelector('.text');
            var imgBtn = block.querySelector('.img_button');
            if (!textEl || !imgBtn) return;
            if (imgBtn._hasListener) return;
            imgBtn.addEventListener('click', function () {
                var field = imgBtn.dataset.field || textEl.dataset.field || null;
                if (field === 'password') {
                    var pwInput = block.querySelector('#user-password');
                    if (!pwInput) return;
                    pwInput.removeAttribute('readonly');
                    pwInput.focus();
                    var savePw = function () {
                        pwInput.setAttribute('readonly', '');
                        saveSettingToServer('password', pwInput.value);
                    };
                    pwInput.addEventListener('blur', savePw, { once: true });
                    pwInput.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter') { e.preventDefault(); pwInput.blur(); }
                    });
                    return;
                }
                var curValue = textEl.innerText.trim();
                var input = document.createElement('input');
                input.type = 'text';
                input.value = curValue;
                input.style.width = '100%';
                var parent = textEl.parentNode;
                try {
                    if (parent && parent.contains(textEl)) parent.replaceChild(input, textEl); else block.appendChild(input);
                } catch (e) { block.appendChild(input); }
                input.focus();
                var save = function () {
                    var newVal = input.value.trim();
                    var p = document.createElement('p');
                    p.className = 'text';
                    if (field) p.dataset.field = field;
                    p.innerText = newVal;
                    try {
                        var pnode = input.parentNode;
                        if (pnode) pnode.replaceChild(p, input); else block.appendChild(p);
                    } catch (err) { try { block.appendChild(p); } catch (e) {} }
                    if (field) { try { localStorage.setItem('setting_' + field, newVal); } catch (e) {} saveSettingToServer(field, newVal); }
                };
                input.addEventListener('blur', function () { save(); }, { once: true });
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
                    if (e.key === 'Escape') { try { var p2 = document.createElement('p'); p2.className = 'text'; p2.innerText = curValue; input.parentNode.replaceChild(p2, input); } catch (e) {} }
                });
            });
            imgBtn._hasListener = true;
        });
        try {
            var keys = Object.keys(localStorage);
            keys.forEach(function (k) {
                if (!k.startsWith('setting_')) return;
                var field = k.replace('setting_', '');
                var val = localStorage.getItem(k);
                var el = document.querySelector('.settings-block .text[data-field="' + field + '"]');
                if (el) el.innerText = val;
                else {
                    if (field === 'password') {
                        var pw = document.querySelector('#user-password');
                        if (pw) pw.value = val;
                    }
                }
            });
        } catch (e) {}
    }
    initEditingFeatures();
    enableInlineSettings();
    updateView();
});
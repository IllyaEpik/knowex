let regBtn = document.getElementById("regBtn");
let line_log = document.querySelector(".line_log");
let logBtn = document.getElementById("logBtn");
let line_reg = document.querySelector(".line_reg");
let reg = document.getElementById("reg");
let auth = document.getElementById("auth");
let regSaveBtn = document.querySelector(".reg_save");
let regEmailInput = document.getElementById("email");
let modalBg = document.getElementById("modal-bg");
let modalForm = document.getElementById("modal-form");
let modalInput = document.getElementById("modal-input");
let modalOk = document.getElementById("modal-ok");
let modalClose = document.getElementById("modal-close");

if (regBtn && logBtn && line_log && line_reg && reg && auth) {
    regBtn.addEventListener("click", () => {
        line_reg.classList.add("select");
        line_log.classList.remove("select");
        reg.hidden = false;
        auth.hidden = true;
    });

    logBtn.addEventListener("click", () => {
        line_reg.classList.remove("select");
        line_log.classList.add("select");
        reg.hidden = true;
        auth.hidden = false;
    });
}

function rightPrint(text, isHtml = false) {
    const messagesContainer = document.querySelector(".messages#messages");

    if (messagesContainer) {
        const message = document.createElement("div");
        message.className = "message";
        message.id = "message";

        // Цвет по содержимому
        if (text.includes('збережено')) {
            message.style.background = '#d4edda'; // светло-зеленый фон
            message.style.color = '#155724';      // темно-зеленый текст
            message.style.border = '1px solid #c3e6cb';
        } else {
            message.style.background = '#f8d7da'; // светло-красный фон
            message.style.color = '#721c24';      // темно-красный текст
            message.style.border = '1px solid #f5c6cb';
        }
        const modalBg = document.getElementById("modal-bg");
        const modalForm = document.getElementById("modal-form");
        if (modalBg && modalForm) {
            modalBg.style.display = "none";
            modalForm.style.display = "none";
        }

        if (isHtml) {
            // Если приходит HTML, парсим и берём только текстовое содержимое body
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                // Если есть body, берём только его текст
                message.textContent = doc.body ? doc.body.textContent.trim() : text;
            } catch {
                message.textContent = text;
            }
        } else {
            message.textContent = text;
        }
        messagesContainer.appendChild(message);

        setTimeout(() => {
            message.classList.add("show");
        }, 100);

        setTimeout(() => {
            message.classList.add("hide");
            setTimeout(() => {
                message.remove();
            }, 500); 
        }, 5000);
    }
}

if (regSaveBtn && regEmailInput && modalBg && modalForm && modalInput) {
    regSaveBtn.addEventListener("click", function(e) {
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm_password").value.trim();
        const nickname = document.getElementById("nickname").value.trim();
        const email = regEmailInput.value.trim().toLowerCase();

        if (!nickname || !email || !password || !confirmPassword) {
            rightPrint("Заповніть усі поля!");
            return;
        }
        if (password !== confirmPassword) {
            rightPrint("Паролі не співпадають!");
            return;
        }

        e.preventDefault();

        // Проверка существования email и nickname через сервер
        fetch("/render_code", {
            method: "POST",
            body: new URLSearchParams({
                email: email,
                nickname: nickname,
                password: password,
                confirm_password: confirmPassword,
                confirm_code: "__check__" // специальный маркер для проверки
            })
        })
        .then(response => response.text())
        .then(text => {
            if (text.trim() !== "OK") {
                rightPrint("Не вдалося зареєструвати користувача");
                return;
            }
            // Если нет ошибок, отправляем код
            fetch("/send_email_code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    modalBg.style.display = "block";
                    modalForm.style.display = "block";
                    modalInput.value = "";
                } else {
                    rightPrint("Помилка надсилання email: " + (data.error || "Невідома помилка"));
                }
            })
            .catch(err => {
                rightPrint("Помилка надсилання email: " + err);
            });
        })
        .catch(err => {
            rightPrint("Помилка перевірки: " + err);
        });
    });
}

if (modalClose && modalBg && modalForm) {
    modalClose.addEventListener("click", function() {
        modalBg.style.display = "none";
        modalForm.style.display = "none";
    });
}

if (modalBg && modalForm) {
    modalBg.addEventListener("click", function(e) {
        if (e.target === modalBg) {
            modalBg.style.display = "none";
            modalForm.style.display = "none";
        }
    });
}

if (modalForm && modalOk) {
    modalOk.addEventListener("click", function(e) {
        e.preventDefault();

        modalForm.querySelectorAll('input[type="hidden"]').forEach(el => el.remove());

        const regForm = document.getElementById("reg");
        ["nickname", "email", "password", "confirm_password"].forEach(name => {
            const input = regForm.querySelector(`[name="${name}"]`);
            if (input) {
                const hidden = document.createElement("input");
                hidden.type = "hidden";
                hidden.name = name;
                hidden.value = input.value;
                modalForm.appendChild(hidden);
            }
        });

        const codeInput = document.getElementById("modal-input");
        if (codeInput) {
            let hidden = modalForm.querySelector('input[name="confirm_code"]');
            if (!hidden) {
                hidden = document.createElement("input");
                hidden.type = "hidden";
                hidden.name = "confirm_code";
                modalForm.appendChild(hidden);
            }
            hidden.value = codeInput.value;
        }

        fetch("/render_code", {
            method: "POST",
            body: new FormData(modalForm)
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                response.text().then(text => rightPrint(text));
            }
        })
        .catch(err => {
            rightPrint("Помилка підтвердження кода: " + err);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('auth');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            const nickname = authForm.querySelector('input[name="nickname"]');
            const password = authForm.querySelector('input[name="password"]');
            if (!nickname.value.trim() || !password.value.trim()) {
                e.preventDefault();
                rightPrint('Введите имя и пароль!');
            }
        });
    }
    const regForm = document.getElementById('reg');
    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            const nickname = regForm.querySelector('input[name="nickname"]');
            const email = regForm.querySelector('input[name="email"]');
            const password = regForm.querySelector('input[name="password"]');
            const confirm = regForm.querySelector('input[name="confirm_password"]');
            if (!nickname.value.trim() || !email.value.trim() || !password.value.trim() || !confirm.value.trim()) {
                e.preventDefault();
                rightPrint('Заповніть усі поля!');
                return;
            }
            if (password.value !== confirm.value) {
                e.preventDefault();
                rightPrint('Паролі не співпадають!');
            }
        });
    }

    const flipToggle = document.getElementById('auth-flip-toggle');
    const authLabel = document.getElementById('authLabel');
    const regLabel = document.getElementById('regLabel');

    function updateLabels() {
        if (flipToggle && flipToggle.checked) {
            authLabel.style.fontWeight = 'normal';
            regLabel.style.fontWeight = 'bold';
        } else {
            authLabel.style.fontWeight = 'bold';
            regLabel.style.fontWeight = 'normal';
        }
    }
    if (flipToggle) {
        flipToggle.addEventListener('change', updateLabels);
        updateLabels();
    }
});
let regBtn = document.getElementById("regBtn")
let line_log = document.querySelector(".line_log")
let logBtn = document.getElementById("logBtn")
let line_reg = document.querySelector(".line_reg")
let reg = document.getElementById("reg")
let auth = document.getElementById("auth")
let regSaveBtn = document.querySelector(".reg_save");
let modalClose = document.getElementById("modal-close");
let regEmailInput = document.getElementById("email");
let modalBg = document.getElementById("modal-bg");
let modalForm = document.getElementById("modal-form");
let modalInput = document.getElementById("modal-input");
let modalOk = document.getElementById("modal-ok");

regBtn.addEventListener("click", ()=> {
    line_reg.classList.add("select"),
    line_log.classList.remove("select")
    reg.hidden = false
    auth.hidden = true
})

logBtn.addEventListener("click", ()=> {
    line_reg.classList.remove("select"),
    line_log.classList.add("select")
    reg.hidden = true
    auth.hidden = false
})


if (regSaveBtn && regEmailInput && modalBg) {
    regSaveBtn.addEventListener("click", function(e) {
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm_password").value.trim();

        if (password === "" || confirmPassword === "") {
            alert("Введите оба пароля!");
            return;
        }
        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }

        if (regEmailInput.value.trim() === "") {
            regEmailInput.focus();
            regEmailInput.placeholder = "Введите email!";
            return;
        }

        e.preventDefault();

        fetch("/send_email_code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: regEmailInput.value.trim() })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modalBg.style.display = "block";
                modalForm.style.display = "block";
                modalInput.value = "";
            } else {
                alert("Ошибка отправки email: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => {
            alert("Ошибка отправки email: " + err);
        });
    });
}

if (modalClose && modalBg && modalForm) {
    modalClose.addEventListener("click", function() {
        modalBg.style.display = "none";
        modalForm.style.display = "none";
    });
}

if (modalForm && modalOk) {
    modalOk.addEventListener("click", function(e) {
        e.preventDefault();

        // Очищаем старые скрытые поля
        modalForm.querySelectorAll('input[type="hidden"]').forEach(el => el.remove());

        // Копируем значения из формы регистрации
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

        // confirm_code из модального input
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
                response.text().then(text => alert(text));
            }
        })
        .catch(err => {
            alert("Ошибка подтверждения кода: " + err);
        });
    });
}
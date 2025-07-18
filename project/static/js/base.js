document.addEventListener("DOMContentLoaded", () => {
    let count = 0
    const themeToggleButton = document.getElementById("theme_change");
    const input = document.querySelector(".input");
    const body = document.body;
    console.log(themeToggleButton)

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme);
        input.checked = 'true'
    }

    themeToggleButton.addEventListener("click", () => {
        console.log(body.classList.contains("dark"))
        if (count){

            if (body.classList.contains("dark")) {
                body.classList.remove("dark");
                localStorage.setItem("theme", "");
            } else {
                body.classList.add("dark");
                localStorage.setItem("theme", "dark"); 
            }
            count = false
        }else{
            count = true
        }
    });
});

document.addEventListener("DOMContentLoaded", 
function () {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
        const messages = messagesContainer.querySelectorAll(".message");

        messages.forEach((message, index) => {
            setTimeout(() => {
                message.classList.add("show");
            }, index * 100); 
        });

        messages.forEach((message, index) => {
            setTimeout(() => {
                message.classList.add("hide");
                setTimeout(() => {
                    message.remove();
                }, 500);
            }, 5000 + index * 1000); 
        });
    }
}
);
function goToTest(event) {
    event.preventDefault();
    const id = document.getElementById('test_id_input').value.trim();
    if (id) {
        fetch(`/test/${id}`, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    window.location.href = `/test/${id}`;
                } else {
                    alert("Test not found. Please check the ID and try again.");
                }
            })
            .catch(() => {
            });
        }
        return false;
    }
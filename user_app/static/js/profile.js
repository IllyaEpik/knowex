document.addEventListener("DOMContentLoaded", () => {
    const hideButtons = document.querySelectorAll("#hide");

    hideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const parent = button.closest(".user_info");
            const textElement = parent.querySelector("h1");

            if (textElement) {
                if (textElement.dataset.originalText === undefined) {
                    textElement.dataset.originalText = textElement.textContent;
                }

                if (textElement.textContent.includes("*")) {
                    textElement.textContent = textElement.dataset.originalText;
                    button.style.backgroundImage = 'url("user_app/static/images/hide_open.png")'; 
                } else {
                    textElement.textContent = "*".repeat(textElement.dataset.originalText.length);
                    button.style.backgroundImage = 'url("user_app/static/images/hide_close.png")'; 
                }
            }
        });
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const hideButtons = document.querySelectorAll("#hide");

    hideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const parent = button.closest(".user_info");
            const textElement = parent.querySelector("span");

            if (textElement) {
                if (textElement.dataset.originalText === undefined) {
                    textElement.dataset.originalText = textElement.textContent;
                }

                if (textElement.textContent.includes("•")) {
                    textElement.textContent = textElement.dataset.originalText;
                    button.id = 'hide'
                } else {
                    textElement.textContent = "•".repeat(textElement.dataset.originalText.length);
                    button.id = 'close'
                }
            }
        });
    });
});

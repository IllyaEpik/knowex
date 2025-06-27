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

window.scrollCarousel = function(btn, dir) {
    const wrapper = btn.closest('.carousel_wrapper');
    if (!wrapper) return;
    // ищем .carousel_container и .container_tests
    const carouselContainer = wrapper.querySelector('.carousel_container');
    if (!carouselContainer) return;
    const tests = carouselContainer.querySelector('.container_tests');
    if (!tests) return;
    const testCard = tests.querySelector('.container_test');
    if (!testCard) return;
    const cardWidth = testCard.offsetWidth + 24; // 24px gap

    // Важно: скроллим carouselContainer, а не tests!
    carouselContainer.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
};

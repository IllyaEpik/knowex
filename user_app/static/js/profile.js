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
    const carouselContainer = wrapper.querySelector('.carousel_container');
    if (!carouselContainer) return;
    const tests = carouselContainer.querySelector('.container_tests');
    if (!tests) return;
    const testCard = tests.querySelector('.container_test');
    if (!testCard) return;
    const cardWidth = testCard.offsetWidth + 24;
    carouselContainer.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
};

document.addEventListener('DOMContentLoaded', () => {
    const passwordSpan = document.getElementById('password-text');
    const toggleBtn = document.getElementById('togglePassword');
    const originalText = passwordSpan.dataset.password?.trim();

    if (!originalText) {
      passwordSpan.textContent = '[немає пароля]';
      toggleBtn.disabled = true;
      return;
    }

    passwordSpan.textContent = '•'.repeat(originalText.length);

    toggleBtn.addEventListener('click', () => {
      const isHidden = passwordSpan.textContent.includes('•');
      if (isHidden) {
        passwordSpan.textContent = originalText;
        toggleBtn.textContent = '🙈';
      } else {
        passwordSpan.textContent = '•'.repeat(originalText.length);
        toggleBtn.textContent = '👁️';
      }
    });
  });
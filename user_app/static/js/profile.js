document.addEventListener('DOMContentLoaded', () => {
    const createdTestsContainer = document.querySelector('.created-tests');
    const completedTestsContainer = document.querySelector('.completed-tests');
    const leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
    const rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
    const radioButtons = document.querySelectorAll('input[name="btn"]');

    let currentPage = 0;
    const testsPerPage = 2;

    function showPage(container, page) {
        const tests = Array.from(container.querySelectorAll('.test'));
        tests.forEach(test => test.classList.remove('visible'));

        const start = page * testsPerPage;
        const end = start + testsPerPage;

        tests.slice(start, end).forEach(test => {
            test.classList.add('visible');
        });

        leftArrow.style.opacity = page > 0 ? '1' : '0.3';
        rightArrow.style.opacity = end < tests.length ? '1' : '0.3';
    }

    function getActiveContainer() {
        return document.querySelector('input[name="btn"]:checked').value === 'option1'
            ? createdTestsContainer
            : completedTestsContainer;
    }

    function updateView() {
        const isCreated = document.querySelector('input[name="btn"]:checked').value === 'option1';

        // Показываем/скрываем контейнеры
        createdTestsContainer.style.display = isCreated ? 'block' : 'none';
        completedTestsContainer.style.display = !isCreated ? 'block' : 'none';

        currentPage = 0;
        showPage(getActiveContainer(), currentPage);
    }

    // Событие на переключение вкладок
    radioButtons.forEach(btn => btn.addEventListener('change', updateView));

    // Клики по стрелкам
    leftArrow.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            showPage(getActiveContainer(), currentPage);
        }
    });

    rightArrow.addEventListener('click', () => {
        const container = getActiveContainer();
        const totalTests = container.querySelectorAll('.test').length;
        if ((currentPage + 1) * testsPerPage < totalTests) {
            currentPage++;
            showPage(container, currentPage);
        }
    });

        const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('user-password');
    const icon = toggleBtn.querySelector('img');

    toggleBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.src = '/static/user/images/hide_open.svg';
        } else {
            passwordInput.type = 'password';
            icon.src = '/static/user/images/hide_close.svg';
        }
    });


    // Инициализация при загрузке
    updateView();
});

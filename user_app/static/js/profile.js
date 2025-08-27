document.addEventListener('DOMContentLoaded', () => {
    const createdTestsContainer = document.querySelector('#created-tests');
    const completedTestsContainer = document.querySelector('#completed-tests');
    const testsContainer = document.querySelector('.tests-block');
    const leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
    const rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
    const isAuthorInput = document.getElementById('is_author');
    const radioButtons = document.querySelectorAll('input[name="btn"]');

    let currentPage = 0;
    let testsPerPage = isAuthorInput.value;

    if (testsPerPage == 4) {
        testsContainer.className = 'tests-block-user';
        createdTestsContainer.className = 'created-tests-user';
        completedTestsContainer.className = 'completed-tests-user';
    }
    else {
        testsContainer.className = 'tests-block';
        createdTestsContainer.className = 'created-tests';
        completedTestsContainer.className = 'completed-tests';
    }

    console.log(testsPerPage);
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
        console.log(currentPage);
    }

    function getActiveContainer() {
        return document.querySelector('input[name="btn"]:checked').value === 'option1'
            ? createdTestsContainer
            : completedTestsContainer;
    }

    function updateView() {
        const isCreated = document.querySelector('input[name="btn"]:checked').value === 'option1';

        createdTestsContainer.style.display = isCreated ? 'flex' : 'none';
        completedTestsContainer.style.display = !isCreated ? 'flex' : 'none';

        currentPage = 0;
        showPage(getActiveContainer(), currentPage);
    }

    radioButtons.forEach(btn => btn.addEventListener('change', updateView));

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
    if (testsPerPage == 2) {
        const toggleBtn = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('user-password');
        console.log(toggleBtn);
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

        const input = document.getElementById("user-password");
    }

    function updateWidth() {
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.font = getComputedStyle(input).font;
    tempSpan.innerText = input.value || input.placeholder || '';
    document.body.appendChild(tempSpan);
    input.style.width = tempSpan.offsetWidth + 10 + "px";
    document.body.removeChild(tempSpan);
    }

    input.addEventListener("input", updateWidth);
    window.addEventListener("load", updateWidth);

    updateView();
});

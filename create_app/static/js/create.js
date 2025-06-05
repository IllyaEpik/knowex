document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.question_form').style.display = 'none';
    document.getElementById('save-form').style.display = 'none';
    document.getElementById('settings_modal').style.display = 'block';

    const listQuestions = document.querySelector('.list_questions');
    if (!listQuestions) {
        console.error('Елемент .list_questions не знайдено!');
        return;
    }
    initPositions();
});

let yQuestion = -60;
let questionOrder = [];

document.getElementById("add_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    let questionCount = 0;
    while (document.getElementById(`question_${questionCount}`)) {
        questionCount++;
    }

    const newButton = document.createElement("button");
    newButton.className = "question_button";
    newButton.id = `question_${questionCount}`;
    newButton.textContent = `Питання ${questionCount + 1}`;
    makeDraggable(newButton);

    yQuestion += getSlotHeight() * 1.2;
    newButton.style.top = `${yQuestion}px`;

    newButton.addEventListener("click", function () {
        selectQuestion(questionCount);
    });

    listQuestions.appendChild(newButton);
    questionOrder.push(newButton);
    newButton.click();
});

document.getElementById("delete_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    let removed = false;
    for (let question of listQuestions.children) {
        if (question.classList.contains('question_button_choosen')) {
            const questionId = question.id.replace('question_', '');
            listQuestions.removeChild(question);
            localStorage.removeItem(`question_${questionId}`);
            questionOrder = questionOrder.filter(q => q !== question);
            removed = true;
            break;
        }
    }

    if (!removed) {
        alert("Список тестів порожній або жодне питання не вибрано!");
    } else {
        const questionForm = document.querySelector('.question_form');
        questionForm.reset();
        questionForm.querySelector("h3").textContent = "Питання:";
        questionForm.querySelector("#options").innerHTML = '';
        if (listQuestions.children.length > 0) {
            listQuestions.children[0].click();
        }
    }
});

document.getElementById("add").addEventListener("click", function (event) {
    event.preventDefault();
    const optionsDiv = document.getElementById("options");
    const newOptionDiv = document.createElement("div");
    newOptionDiv.innerHTML = `
        <input type="text" class="option" placeholder="Новий варіант">
        <button type="button" class="remove_option" name="answer">➖</button>
    `;
    newOptionDiv.querySelector(".remove_option").addEventListener("click", function () {
        newOptionDiv.remove();
    });
    optionsDiv.appendChild(newOptionDiv);
});

document.querySelector('#save-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const listQuestions = document.querySelector(".list_questions");
    const questionForm = document.getElementById("questionForm");
    const selectedButton = document.querySelector('.question_button_choosen');

    if (selectedButton) {
        const questionId = selectedButton.id.replace('question_', '');
        const allInputs = Array.from(questionForm.querySelector('#options').querySelectorAll('input')).map(input => input.value);
        if (!questionForm.querySelector('#question').value || allInputs.length === 0) {
            alert('Заповніть питання та додайте хоча б один варіант відповіді!');
            return;
        }
        const questionData = {
            question: questionForm.querySelector('#question').value,
            correct: questionForm.querySelector('#correctAnswer').value,
            options: allInputs
        };
        localStorage.setItem(`question_${questionId}`, JSON.stringify(questionData));
    }

    let listAllQuestions = [];
    for (let question of listQuestions.children) {
        const questionId = question.id.replace('question_', '');
        const data = JSON.parse(localStorage.getItem(`question_${questionId}`));
        if (data) {
            listAllQuestions.push(data);
        }
    }

    const subject = localStorage.getItem('test_subject') || '';
    const className = localStorage.getItem('test_class_name') || '';
    const testName = localStorage.getItem('test_name') || '';

    $.ajax('/create', {
        type: "POST",
        data: {
            data: JSON.stringify(listAllQuestions),
            subject: subject,
            class_name: className,
            name: testName
        },
        success: function () {
            alert('Тест збережено!');
        },
        error: function () {
            alert('Помилка при збереженні!');
        }
    });
});

function makeDraggable(element) {
    let offsetY, isDragging = false;
    let zIndex = 10;

    element.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetY = e.clientY - parseInt(element.style.top || 0);
        element.style.cursor = 'grabbing';
        element.style.zIndex = ++zIndex;
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            element.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
            const currentTop = parseInt(element.style.top);
            let newIndex = Math.round(currentTop / getSlotHeight());
            newIndex = Math.max(0, Math.min(questionOrder.length - 1, newIndex));
            const currentIndex = questionOrder.indexOf(element);
            if (currentIndex !== -1) {
                questionOrder.splice(currentIndex, 1);
                questionOrder.splice(newIndex, 0, element);
            }
            updateDOM();
        }
    });
}

const listQuestions = document.querySelector('.list_questions');

function initPositions() {
    const questions = Array.from(listQuestions.children);
    let currentTop = 0;
    questions.forEach((question, index) => {
        const height = question.offsetHeight * 1.2;
        question.style.top = `${currentTop}px`;
        currentTop += height;
        questionOrder[index] = question;
    });
}

function getSlotHeight() {
    const firstQuestion = listQuestions.children[0];
    return firstQuestion ? firstQuestion.offsetHeight : 50;
}

function updateDOM() {
    questionOrder.forEach(question => {
        listQuestions.appendChild(question);
    });
    initPositions();
}

function selectQuestion(index) {
    const form = document.getElementById('questionForm');
    const questionTitle = form.querySelector('h3');
    questionTitle.textContent = `Питання №${index + 1}:`;

    const data = JSON.parse(localStorage.getItem(`question_${index}`)) || {};
    form.querySelector('#question').value = data.question || '';
    form.querySelector('#correctAnswer').value = data.correct || '';
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    (data.options || []).forEach(opt => {
        const div = document.createElement('div');
        const input = document.createElement('input');
        const button = document.createElement('button');
        input.type = 'text';
        input.value = opt;
        input.className = 'option';
        input.placeholder = 'Новий варіант';
        button.className = 'remove_option';
        button.name = 'answer';
        button.type = 'button';
        button.textContent = '➖';
        button.addEventListener('click', () => div.remove());
        div.append(input);
        div.append(button);
        optionsDiv.append(div);
    });

    document.getElementById('settings_modal').style.display = 'none';
    document.querySelector('.question_form').style.display = 'block';
    document.getElementById('save-form').style.display = 'block';

    for (let btn of listQuestions.children) {
        btn.classList.remove('question_button_choosen');
    }
    document.getElementById(`question_${index}`).classList.add('question_button_choosen');
}
        // Завантаження поточних налаштувань із localStorage при завантаженні сторінки
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('subject').value = localStorage.getItem('test_subject') || '';
            document.getElementById('class_name').value = localStorage.getItem('test_class_name') || '';
            document.getElementById('test_name').value = localStorage.getItem('test_name') || '';
        });

        // Відкриття вікна налаштувань
        document.getElementById('open_settings').addEventListener('click', function () {
            document.getElementById('settings_modal').style.display = 'block';
            document.querySelector('.question_form').style.display = 'none';
            document.getElementById('save-form').style.display = 'none';
        });

        // Закриття вікна налаштувань
        document.getElementById('close_settings').addEventListener('click', function () {
            document.getElementById('settings_modal').style.display = 'none';
            document.querySelector('.question_form').style.display = 'block';
            document.getElementById('save-form').style.display = 'block';
        });
        

        // Збереження налаштувань
        document.getElementById('settings_form').addEventListener('submit', function (event) {
            event.preventDefault();
            const subject = document.getElementById('subject').value.trim();
            const className = document.getElementById('class_name').value.trim();
            const testName = document.getElementById('test_name').value.trim();

            if (!subject || !className || !testName) {
                alert('Будь ласка, заповніть усі поля!');
                return;
            }

            localStorage.setItem('test_subject', subject);
            localStorage.setItem('test_class_name', className);
            localStorage.setItem('test_name', testName);
            document.getElementById('close_settings').click();
        });


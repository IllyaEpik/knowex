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

        if (isHtml) {
            message.innerHTML = text;
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
let yQuestion = -60;
let questionOrder = [];

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

    document.getElementById("add_question").addEventListener("click", function () {
        let questionCount = 0;
        while (document.getElementById(`question_${questionCount}`)) {
            questionCount++;
        }

        const newButton = document.createElement("button");
        newButton.className = "question_button";
        newButton.type = 'button'
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
    document.getElementById('add').addEventListener('click', function () {
        const optionsDiv = document.getElementById('options');
        const div = document.createElement('div');
        const input = document.createElement('input');
        const button = document.createElement('button');
        input.type = 'text';
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
       rightPrint("Список тестів порожній або жодне питання не вибрано!");
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

document.querySelector('#save-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const listQuestions = document.querySelector(".list_questions");
    const questionForm = document.getElementById("questionForm");
    const selectedButton = document.querySelector('.question_button_choosen');

    if (selectedButton) {
        const questionId = selectedButton.id.replace('question_', '');
        const allInputs = Array.from(questionForm.querySelector('#options').querySelectorAll('input')).map(input => input.value);

        const questionData = {
            question: questionForm.querySelector('#question').value,
            correct: questionForm.querySelector('#correctAnswer').value,
            options: allInputs
        };
        localStorage.setItem(`question_${questionId}`, JSON.stringify(questionData));
    }

    const subject = localStorage.getItem('test_subject') || '';
    const className = localStorage.getItem('test_class_name') || '';
    const testName = localStorage.getItem('test_name') || '';

    let missingFields = [];
    if (!subject) missingFields.push('предмет');
    if (!className) missingFields.push('клас');
    if (!testName) missingFields.push('назва тесту');

    if (missingFields.length > 0) {
        rightPrint('Будь ласка, заповніть: ' + missingFields.join(', ') + '!');
        return;
    }

    let listAllQuestions = [];
    let invalidQuestions = [];

    for (let question of listQuestions.children) {
        const questionId = question.id.replace('question_', '');
        const data = JSON.parse(localStorage.getItem(`question_${questionId}`));

        if (data) {
            let missing = [];
            if (!data.question || !data.question.trim()) missing.push('текст питання');
            if (!data.correct || !data.correct.trim()) missing.push('правильну відповідь');
            if (!Array.isArray(data.options) || data.options.length === 0 || data.options.some(opt => !opt.trim())) missing.push('варіанти відповіді');
            if (missing.length) {
                invalidQuestions.push(
                    `Питання №${parseInt(questionId) + 1}:\n    • ${missing.join('\n    • ')}`
                );
            }
            listAllQuestions.push(data);
        }
    }

    if (invalidQuestions.length > 0) {
        const htmlMsg =
            'Будь ласка, заповніть усі поля у питаннях:<br><br>' +
            invalidQuestions.map(q => q.replace(/\n/g, '<br>')).join('<br><br>');
        rightPrint(htmlMsg, true);
        return;
}
    let Formdata = new FormData();
    Formdata.append('data', JSON.stringify(listAllQuestions));
    Formdata.append('subject', subject);
    Formdata.append('class_name', className);
    Formdata.append('name', testName);
    Formdata.append('description', document.getElementById('description').value || '');
    try {
        Formdata.append('image', document.querySelector('#image').files[0]);
    } catch (error) {}

    $.ajax(
        '/create_test', {
        type: "POST",
        data: Formdata,
        processData: false,
        contentType: false,
        success: function () {
            // Сохраняем текущую тему
            const theme = localStorage.getItem('theme');
            localStorage.clear();
            // Восстанавливаем тему
            if (theme) {
                localStorage.setItem('theme', theme);
            }
            rightPrint('Тест збережено!');
        },
        error: function (xhr) {
            let msg = 'Помилка при збереженні тесту!';
            if (xhr.status === 401) {
                msg = 'Помилка: Ви не авторизовані. Увійдіть у свій акаунт.';
            } else if (xhr.status === 400) {
                msg = 'Помилка: Некоректні дані. Перевірте всі поля.';
            } else if (xhr.status === 413) {
                msg = 'Помилка: Завеликий файл зображення.';
            } else if (xhr.responseJSON && xhr.responseJSON.error) {
                msg = 'Помилка: ' + xhr.responseJSON.error;
            } else if (xhr.status >= 500) {
                msg = 'Внутрішня помилка сервера. Спробуйте пізніше.';
            }
            rightPrint(msg);
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

    document.addEventListener('mouseup', function (event) {
        if (isDragging) {
            isDragging = false;
            
                let old_list = getCoor()
                
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
                
                let new_list = getCoor()
                let match = true
                for (let count=0;count<=old_list.length;count++){
                    match = old_list[count] == new_list[count]                
                    if (!match){
                        break
                    }
                }
                if (match){
                    selectQuestion(Number(event.target.textContent[event.target.textContent.length-1])-1)
                }
        }
    });
}
// document.querySelector('p').textContent
function getCoor(){
    let list = []
    let questions = Array.from(listQuestions.children);
        for (let question of questions){
            list.push(question.style.top)
        }
    return list
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
    
    if (saveSettings()){
    const questionForm = document.getElementById("questionForm");
    const selectedButton = document.querySelector('.question_button_choosen');

    if (selectedButton) {
        const questionId = selectedButton.id.replace('question_', '');
        const allInputs = Array.from(questionForm.querySelector('#options').querySelectorAll('input')).map(input => input.value);

        const questionData = {
            question: questionForm.querySelector('#question').value,
            correct: questionForm.querySelector('#correctAnswer').value,
            options: allInputs
        };
        localStorage.setItem(`question_${questionId}`, JSON.stringify(questionData));
    }



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
}
        // Завантаження поточних налаштувань із localStorage при завантаженні сторінки
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('subject').value = localStorage.getItem('test_subject') || '';
            document.getElementById('class').value = localStorage.getItem('test_class_name') || '';
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
            if (saveSettings()){
                if (document.querySelectorAll('.question_button').length){
                    document.getElementById('settings_modal').style.display = 'none';
                    document.querySelector('.question_form').style.display = 'block';
                    document.getElementById('save-form').style.display = 'block';

                }
            }
        });
        

        // Збереження налаштувань
        function saveSettings() {
            const subject = document.getElementById('subject').value.trim();
            const className = document.getElementById('class').value.trim();
            const testName = document.getElementById('test_name').value.trim();

            let missing = [];
            if (!subject) missing.push('предмет');
            if (!className) missing.push('клас');
            if (!testName) missing.push('назва тесту');
            if (missing.length) {
                rightPrint('Будь ласка, заповніть: ' + missing.join(', ') + '!');
                return false;
            }

            localStorage.setItem('test_subject', subject);
            localStorage.setItem('test_class_name', className);
            localStorage.setItem('test_name', testName);
            // document.getElementById('close_settings').click();
            return true;
        }
    

    document.getElementById('settings_form').addEventListener('submit', function (event) {
        event.preventDefault();
        saveSettings();
    });



document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.question_form').style.display = 'none';
    document.getElementById('save-form').style.display = 'none';
    document.getElementById('settings_modal').style.display = 'block';
});

document.getElementById("add_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    const questionCount = listQuestions.children.length + 1;

    const newButton = document.createElement("button");
    newButton.className = "question_button";
    newButton.id = `question_${questionCount}`;
    newButton.textContent = `question ${questionCount}`;

    newButton.addEventListener("click", function () {
        document.getElementById('settings_modal').style.display = 'none';
        document.querySelector('.question_form').style.display = '';
        document.getElementById('save-form').style.display = '';

        const questionForm = document.getElementById("questionForm");
        const questionTitle = questionForm.querySelector("h3");
        let number = "error";
        try {
            number = questionTitle.textContent.split("№")[1][0];
            document.querySelector(`#question_${number}`).classList.remove('question_button_choosen');
        } catch { }
        this.classList.add('question_button_choosen');
        questionTitle.textContent = `Питання №${questionCount}:`;
        questionForm.style.display = "block";
        if (number != "error") {
            let allDiv = questionForm.querySelector("#options").querySelectorAll("div");
            let allinputs = [];
            for (let div of allDiv) {
                allinputs.push(div.querySelector("input").value);
            }
            let question = {
                "question": questionForm.querySelector("#question").value,
                "correct": questionForm.querySelector("#correctAnswer").value,
                "options": allinputs
            }
            localStorage.setItem(`${number}`, JSON.stringify(question));

            let data = JSON.parse(localStorage.getItem(`${questionCount}`));
            questionForm.querySelector("#question").value = data['question'];
            questionForm.querySelector("#correctAnswer").value = data['correct'];
            questionForm.querySelector("#options").innerHTML = '';
            for (let option of data['options']) {
                let div = document.createElement('div');
                let input = document.createElement('input');
                let button = document.createElement('button');
                input.value = option;
                input.type = 'text';
                input.classList.add('option');
                input.placeholder = 'Новий варіант';
                button.classList.add('remove_option');
                button.name = 'answer';
                button.type = 'button';
                button.textContent = '➖';
                div.append(input);
                div.append(button);
                questionForm.querySelector("#options").append(div);
            }
        }
    });

    listQuestions.appendChild(newButton);
});

document.getElementById("delete_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    if (listQuestions.children.length > 0) {
        for (let question of listQuestions.children) {
            if (question.classList.contains('question_button_choosen')) {
                listQuestions.removeChild(question);
                localStorage.removeItem(question.textContent[question.textContent.length - 1]);
            }
        }
    } else {
        alert("Список тестів порожній!");
    }
    const questionForm = document.querySelector('.question_form');
    questionForm.reset();
    questionForm.querySelector("h3").textContent = "Питання:";
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
    let listAllQuestions = [];
    for (let question of listQuestions.children) {
        listAllQuestions.push(JSON.parse(localStorage.getItem(question.textContent[question.textContent.length - 1])));
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

document.addEventListener('mousedown', function (event) {
    const container = document.querySelector('.container_create_form');
    const list = document.querySelector('.list_container');
    const modal = document.getElementById('settings_modal');
    const questionForm = document.querySelector('.question_form');
    const saveForm = document.getElementById('save-form');
    if (
        !container.contains(event.target) &&
        !list.contains(event.target) &&
        !modal.contains(event.target)
    ) {
        modal.style.display = 'block';
        questionForm.style.display = 'none';
        saveForm.style.display = 'none';
    }
});

document.getElementById('settings_form').addEventListener('submit', function (e) {
    e.preventDefault();
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class_name').value;
    const testName = document.getElementById('test_name').value;
    localStorage.setItem('test_subject', subject);
    localStorage.setItem('test_class_name', className);
    localStorage.setItem('test_name', testName);
});
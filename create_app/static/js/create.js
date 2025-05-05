document.getElementById("add_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    const questionCount = listQuestions.children.length + 1;

    const newButton = document.createElement("button");
    newButton.className = "question_button"; 
    newButton.id = `question_${questionCount}`; 
    newButton.textContent = `question ${questionCount}`;

    newButton.addEventListener("click", function () {
        const questionForm = document.getElementById("questionForm");
        const questionTitle = questionForm.querySelector("h3"); 
        questionTitle.textContent = `Питання №${questionCount}:`; 
        questionForm.style.display = "block";
    });

    listQuestions.appendChild(newButton);
});

document.getElementById("delete_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    if (listQuestions.children.length > 0) {
        listQuestions.removeChild(listQuestions.lastElementChild);
    } else {
        alert("Список тестів порожній!");
    }

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

function saveQuestion(event) {
    event.preventDefault()
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);
    console.log('1312123132132')
    $.ajax('/create', {
                type: "POST",
                data: {
                    correct_answer: correctAnswer,
                    answer: correctAnswer,
                    'options[]': options
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function(data) {
                    console.log('success');
                    alert(data.message);
                },
                error: function(xhr) {
                    alert('Ошибка: ' + xhr.responseText);
                }
            });
        }

document.querySelector('form').addEventListener('submit', 
    function (event) {
    event.preventDefault()
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);
    console.log('1312123132132')
    $.ajax('/create', {
        type: "POST",
        data:{question:question, correctAnswer:correctAnswer, options:options},
        success: function(){
            console.log('success')
    alert(data.message)
    }})
    
    
})
console.log()

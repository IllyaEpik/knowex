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

        let number = "error"
        try{
            number = questionTitle.textContent.split("№")[1][0]
            
        }
        catch{}
        questionTitle.textContent = `Питання №${questionCount}:`; 
        questionForm.style.display = "block";
        if (number != "error"){
            let allDiv = questionForm.querySelector("#options").querySelectorAll("div")
            let allinputs = []
            for (let div of allDiv)  {
                allinputs.push(div.querySelector("input").value)
            }
            let question = {
                "question" :questionForm.querySelector("#question").value,
                "correct": questionForm.querySelector("#correctAnswer").value,
                "options": allinputs 
            }
            localStorage.setItem(`${number}`, JSON.stringify(
                question
            ))
            console.log(localStorage.getItem(`${number}`))
            questionForm.querySelector("#question").value=""
            questionForm.querySelector("#correctAnswer").value=""
            questionForm.querySelector("#options").innerHTML=""
            
        }

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



document.querySelector('form').addEventListener('submit', 
    function (event) {
    event.preventDefault()
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = JSON.stringify(Array.from(document.getElementsByClassName('option')).map(input => input.value));
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

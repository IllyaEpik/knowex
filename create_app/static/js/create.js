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
            // question_3 
            document.querySelector(`#question_${number}`).classList.remove('question_button_choosen')
        }
        catch{}
        this.classList.add('question_button_choosen')
        questionTitle.textContent = `Питання №${questionCount}:`; 
        questionForm.style.display = "block";
        if (number != "error"){
            let allDiv = questionForm.querySelector("#options").querySelectorAll("div")
            let allinputs = []
            for (let div of allDiv)  {
                allinputs.push(div.querySelector("input").value)
            }
            // Hello-go
            let question = {
                "question" :questionForm.querySelector("#question").value,
                "correct": questionForm.querySelector("#correctAnswer").value,
                "options": allinputs 
            }
            localStorage.setItem(`${number}`, JSON.stringify(
                question
            ))
            // questionCount ``

            console.log(localStorage.getItem(`${questionCount}`))
            let data = JSON.parse(localStorage.getItem(`${questionCount}`))
            // let options = ''
            questionForm.querySelector("#question").value = data['question']
            questionForm.querySelector("#correctAnswer").value= data['correct']
            questionForm.querySelector("#options").innerHTML = ''
            for (let option of data['options']){
                let div = document.createElement('div')
                let input = document.createElement('input')
                let button = document.createElement('button')
                input.value = option
                input.type = 'text'
                input.classList.add('option')
                input.placeholder = 'Новий варіант'
                button.classList.add('remove_option')
                button.name = 'answer'
                button.type = 'button'
                button.textContent = '➖'
                div.append(input)
                div.append(button)
                questionForm.querySelector("#options").append(div)
                // options += "<div><button type='button' class='remove_option' name='answer'>➖</button></div>"
            }
            // questionForm.querySelector("#options").innerHTML=options Previous.Hello.Happy BirthdayHello Kivara.Hello.Hello, Satada. Doll.Kukala.Привет капибара пиши давай.Вау, вот он понимает.Это асфальтная дичь, понимаешь, что так хотя бы по пожалуйста.Всё стоя, что мы занимаемся?
            // console.log(questionForm.querySelector("#options").innerHTML)
        }

    });
    
    listQuestions.appendChild(newButton);
});

document.getElementById("delete_question").addEventListener("click", function () {
    const listQuestions = document.querySelector(".list_questions");
    if (listQuestions.children.length > 0) {
        for (let question of listQuestions.children ){
            if (question.classList.contains('question_button_choosen')){
                listQuestions.removeChild(question)

            }
        }
        // listQuestions.removeChild(listQuestions.lastElementChild);
    } else {
        alert("Список тестів порожній!");
    }
    // 
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

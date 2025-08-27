import update from "./update.js";

function add(first = false) {
    let addQuestion = document.querySelector('#addQuestion');
    let addAnswer = document.querySelector('#addAnswer');
    let binInputSrc = document.querySelector('#binInputSrc');
    let QuestionsList = document.querySelector('#QuestionsList');
    let trashSvg = document.querySelector('#trashSvg').value;
    let questionContainer = document.querySelector('.questionContainer');
    if (first){
        questionContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains('removeButton')) {
                let questionButton = e.target.closest('.questionButton');
                if (questionButton.classList.contains('select')) {
                    document.querySelector('#TestQuestion').classList.add('hidden');
                    document.querySelector('#TestSettings').classList.remove('hidden');
                    document.querySelector('#settingButton').classList.add('select');
                    document.querySelectorAll('.questionButton').forEach(b => b.classList.remove('select'));
                }

                questionContainer.querySelectorAll('.questionButton').forEach((button, index) => {
                    button.querySelector('.questionNumber').textContent = index + 1;
                });
                update();
            }
        });

        addQuestion.addEventListener("click", () => {
            let questionNumber = document.querySelectorAll('.questionButton').length + 1;
            questionContainer.innerHTML += `
                <button class="button questionButton">
                    Питання <span class="questionNumber">${questionNumber}</span>
                    <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton">
                </button>`;
            update();
        });
    }
    

    addAnswer.addEventListener("click", () => {
        if (QuestionsList.querySelectorAll(".settings-question-block").length<5){

            let div = document.createElement("div");
            div.className = 'questionForTest';
            let questionNumber = document.querySelector(".select").querySelector(".questionNumber").textContent
            let data = localStorage.getItem(questionNumber)
            
            let selectImg = document.querySelector(".selectImg").parentElement
            div.innerHTML = `
                <div class="settings-question-block">
                    <img src="${trashSvg}" alt="" class="trashQuestionMark">
                    <input type="${selectImg.id == 'OneAnswerQuestion' ? "radio" : "checkbox"}" name="correct" class="isAnswerCorrect">
                </div>
                <textarea class="answerInput">Введіть варіант відповіді...</textarea>
            `;
            // QuestionsList.querySelector("#addAnswer").remove()
            // QuestionsList.append(div);
            // QuestionsList.innerHTML += `
            // <button class="center action" id="addAnswer">
            //     <img src="${addQuestionImg.value}" alt="" class="add-question-icon">
            // </button>
            // `

            QuestionsList.insertBefore(div, QuestionsList.querySelector("#addAnswer"));
            if (QuestionsList.querySelectorAll(".settings-question-block").length>=5){
                QuestionsList.querySelector("#addAnswer").classList.add("hidden")
            }
            update();
        }
    });
}

export default add;
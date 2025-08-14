import update from "./update.js";

function add() {
    let addOneAnswerQuestion = document.querySelector('#addOneAnswerQuestion');
    let addQuestion = document.querySelector('#addQuestion');
    let binInputSrc = document.querySelector('#binInputSrc');
    let QuestionsList = document.querySelector('#QuestionsList');
    let trashSvg = document.querySelector('#trashSvg').value;
    let questionContainer = document.querySelector('.questionContainer');

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

    addOneAnswerQuestion.addEventListener("click", () => {
        let questionNumber = document.querySelectorAll('.questionButton').length + 1;
        questionContainer.innerHTML += `
            <button class="button questionButton">
                Питання <span class="questionNumber">${questionNumber}</span>
                <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton">
            </button>`;
        update();
    });

    addQuestion.addEventListener("click", () => {
        let div = document.createElement("div");
        div.className = 'questionForTest';
        div.innerHTML = `
            <div class="settings-question-block">
                <img src="${trashSvg}" alt="" class="trashQuestionMark">
                <input type="radio" name="correct" class="isAnswerCorrect">
            </div>
            <textarea class="answerInput">Введіть варіант відповіді...</textarea>
        `;
        QuestionsList.append(div);
        update();
    });
}

export default add;
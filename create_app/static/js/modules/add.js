
import update from "./update.js";
// remove
function add(){
    let addOneAnswerQuestion = document.querySelector('#addOneAnswerQuestion')
    let addQuestion = document.querySelector('#addQuestion')
    let binInputSrc = document.querySelector('#binInputSrc')
    let QuestionsList = document.querySelector('#QuestionsList')
    let trashSvg = document.querySelector('#trashSvg').value
    let questionContainer = document.querySelector('.questionContainer')
    addOneAnswerQuestion.addEventListener("click", () => {
        questionContainer.innerHTML += `<button class="button questionButton">Питання <span class="questionNumber">1</span> <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton"></button>`
        
        update()
    })
    
    addQuestion.addEventListener("click", () => {
        let div = document.createElement("div")
        div.className = 'questionForTest'
        
        div.innerHTML = `
            <div class="settings-question-block">
                <img src="${trashSvg}" alt="" class="trashQuestionMark">
                <input type="radio" name="correct" class="isAnswerCorrect">
            </div>
            <textarea class="answerInput">Введіть варіант відповіді...</textarea>
        `
        QuestionsList.append(div)
        update()
    })
    update()
}   
export default add
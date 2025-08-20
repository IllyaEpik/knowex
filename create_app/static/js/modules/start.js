import update from "./update.js"

function start(){
    let questionContainer = document.querySelector(".questionContainer")
    let binInputSrc = document.querySelector('#binInputSrc')
    // questionContainer.innerHTML = ""
    for (let key in localStorage){
        if (count < localStorage.length && !isNaN(Number(key)) && Number(key)!=1){
            // console.log(key)
            // let questionData = localStorage.getItem(key)
            // listAllQuestions.push(questionData)
            questionContainer.innerHTML += `<button class="button questionButton">Питання <span class="questionNumber">${key}</span> <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton"></button>`
        }
        count++
    }
    update()
}
// {/* <div class="questionContainer">
//     <button class="button questionButton">Питання <span class="questionNumber">1</span> <img src="{{ url_for('create.static', filename='images/bin.svg') }}" alt="" class="add-question-icon removeButton"></button>
// </div> */}
export default start
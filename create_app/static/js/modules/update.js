
import load from "./load.js";
import save from "./save.js";
function update(){
    let questionContainer = document.querySelector('.questionContainer')
    let questionButtons = document.querySelectorAll('.questionButton')
    let settingButton = document.getElementById('settingButton')
    let TestSettings = document.getElementById('TestSettings')
    let TestQuestion = document.getElementById('TestQuestion')
    let bins = document.querySelectorAll('.trashQuestionMark')
    let bins2 = document.querySelectorAll('.removeButton')
    let number = 0
    
    
    for (let questionButton of questionButtons){
        questionButton.addEventListener("click", () => {
            save()
            removeSelect(questionButtons)
            TestSettings.classList.add('hidden')
            TestQuestion.classList.remove('hidden')
            settingButton.classList.remove('select')
            questionButton.classList.add("select")  
            load()
    })}
    
    settingButton.addEventListener('click', () => {
        save()
        removeSelect(questionButtons)
        TestSettings.classList.remove('hidden')
        TestQuestion.classList.add('hidden')
        settingButton.classList.add('select')
        load()
    })
    
    for (let bin of bins){
        bin.addEventListener('click', () => {
            bin.parentElement.parentElement.parentElement.querySelectorAll(".questionForTest").length>2 ? bin.parentElement.parentElement.remove() : 1;
        })
    }
    for (let question of questionContainer.querySelectorAll(".questionNumber")){
        number++
        question.textContent=number
    }
    for (let bin2 of bins2){
        bin2.addEventListener('click', () => {bin2.parentElement.remove()})
    }
}
function removeSelect(questionButtons){
    for (let questionButton of questionButtons){
        questionButton.classList.remove("select")
    }
}
export default update
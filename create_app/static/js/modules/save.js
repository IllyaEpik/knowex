function save() {
    let select = document.querySelector('.select')
    // questionForTest
    if (select.id != "settingButton"){
        let questions = document.querySelectorAll(".questionForTest")
        let count = 0
        let saveData = {
            "question":document.querySelector("#questionNameInput").value,
            'answers':[],
            "correct":null
        }
        let answer;
        for (let question of questions){
            answer = question.querySelector("textarea").value
            question.querySelector(".isAnswerCorrect").checked ? saveData.correct = answer : null
            saveData.answers.push(answer)
            count++
        }
        localStorage.setItem(select.querySelector(".questionNumber").textContent,JSON.stringify(saveData))
        console.log()
    }else{

        let objectsToSave = ['class', 'testNameInput', 'subject', 'description']
        // document.querySelector('#class').value
        let data = {}
        for (let object of objectsToSave){
            data[object] = document.querySelector(`#${object}`).value
        }
        localStorage.setItem('settingsOfTest',JSON.stringify(data))
    }
}
export default save
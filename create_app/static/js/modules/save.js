function save() {
    let select = document.querySelector('.select')
    // select = select ? select : document.querySelector("#settingButton")
    // questionForTest
    if (select.id != "settingButton"){
        // let questions = /
        let selectImg = document.querySelector(".selectImg").parentElement
        let count = 0
        let saveData = {
            "question":document.querySelector("#questionNameInput").value,
            'answers':[],
            "correct":[],
            "type":"OneAnswerQuestion"
        }
        if (selectImg.id){
            saveData["type"] = selectImg.id
        }
        
        let answer;
        for (let question of document.querySelectorAll(".questionForTest")){
            console.log(question)
            answer = question.querySelector("textarea").value
            question.querySelector(".isAnswerCorrect").checked ? saveData.correct.push(answer) : null
            saveData.answers.push(answer)
            count++
        }
        if (saveData["type"]=="OneAnswerQuestion"){
            // if (saveData['correct']){
            saveData['correct'] = saveData['correct'][0]
            // }
        }
        console.log(saveData)
        localStorage.setItem(select.querySelector(".questionNumber").textContent,JSON.stringify(saveData))
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
window.addEventListener('beforeunload', save)
export default save
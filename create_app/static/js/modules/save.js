function save() {
    let select = document.querySelector('.select')
    if (select.id != "settingButton"){
        let selectImgEl = document.querySelector(".selectImg");
        let selectImgParent = selectImgEl ? selectImgEl.parentElement : null

        let saveData = {
            "question":document.querySelector("#questionNameInput").value,
            'answers':[],
            "correct":[],
            "type":"OneAnswerQuestion"
        }

        if (selectImgParent){
            if (selectImgParent.id == 'questionType'){
                let sel = selectImgParent.querySelector('select')
                saveData["type"] = sel && sel.value == "2" ? "multipleQuestion" : "OneAnswerQuestion"
            } else {
                saveData["type"] = selectImgParent.id
            }
        }

        let answer
        for (let question of document.querySelectorAll(".questionForTest")){
            answer = question.querySelector("textarea").value
            if (question.querySelector(".isAnswerCorrect").checked){
                saveData.correct.push(answer)
            }
            saveData.answers.push(answer)
        }
        if (saveData["type"]=="OneAnswerQuestion"){
            saveData['correct'] = saveData['correct'][0]
        }
        localStorage.setItem(select.querySelector(".questionNumber").textContent,JSON.stringify(saveData))
    }else{
        let objectsToSave = ['class', 'testNameInput', 'subject', 'description']
        let data = {}
        for (let object of objectsToSave){
            data[object] = document.querySelector(`#${object}`).value
        }
        localStorage.setItem('settingsOfTest',JSON.stringify(data))
    }
}
window.addEventListener('beforeunload', save)
export default save

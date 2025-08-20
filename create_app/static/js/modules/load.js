function load() {
    let select = document.querySelector('.select')
    if (select.id != "settingButton"){
        // QuestionsList
        let current = select.querySelector(".questionNumber").textContent
        let data = JSON.parse(localStorage.getItem(current))
        console.log(data,"load")
        if (!data){
            data = {
                question:"Введіть питання...",
                "answers":[
                    "Введіть варіант відповіді...",
                    "Введіть варіант відповіді..."],
                "correct":null
            }
            localStorage.setItem(current,data)
        }
        // {"question":"Введіть питання...","answers":["Введіть варіант відповіді...","Введіть варіант відповіді..."],"correct":null}
        let QuestionsList = document.querySelector("#QuestionsList")
        let trashSvg = document.querySelector('#trashSvg').value
        document.querySelector("#questionNameInput").value = data.question
        QuestionsList.innerHTML = ''
        for (let answer of data.answers){
            let div = document.createElement("div")
            div.className = 'questionForTest'
            
            div.innerHTML = `
                <div class="settings-question-block">
                    <img src="${trashSvg}" alt="" class="trashQuestionMark">
                    <input type="radio" name="correct" class="isAnswerCorrect"${answer==data.correct ? " checked" : ""}>
                </div>
                <textarea class="answerInput">${answer}</textarea>
            `
            QuestionsList.append(div)
        }
    }else{
        
        let objectsToLoad = ['class', 'subject', 'testNameInput', 'description']
        // 
        let data = JSON.parse(localStorage.getItem("settingsOfTest"))
        if (data){


            for (let object of objectsToLoad){
                document.querySelector(`#${object}`).value = data[object]
            }
        }

        // localStorage.setItem('settingsOfTest',JSON.stringify(data))
    }
}

export default load
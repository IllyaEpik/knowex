import add from "./add.js";
import change from "./change.js"


function load() {
    let select = document.querySelector('.select')
    select = select ? select : document.querySelector("#settingButton")
    if (select.id != "settingButton"){
        change(true)
        let current = select.querySelector(".questionNumber").textContent
        let data = JSON.parse(localStorage.getItem(current))
        let addQuestionImg = document.querySelector("#addQuestionImg")
        if (!data){
            data = {
                question:"Введіть питання...",
                "answers":[
                    "Введіть варіант відповіді...",
                    "Введіть варіант відповіді..."],
                "correct":null,
                "type":"OneAnswerQuestion"
            }
            localStorage.setItem(current,JSON.stringify(data))
        }
        if (data["type"]){
            document.querySelector(`#${data["type"]}`).querySelector("img").classList.add("selectImg")
        }else{
            document.querySelector(`#OneAnswerQuestion`).querySelector("img").classList.add("selectImg")
        }
        let QuestionsList = document.querySelector("#QuestionsList")
        let trashSvg = document.querySelector('#trashSvg').value
        document.querySelector("#questionNameInput").value = data.question
        QuestionsList.innerHTML = ''
        console.log(data)
        let timeCorrect;
        let func;
        
        if (data["type"] == "multipleQuestion"){
            timeCorrect = data.correct ? data.correct : []
            func = (answer) => {return timeCorrect.includes(answer) ? " checked" : ""}
        }else if (data["type"] == "OneAnswerQuestion"){
            timeCorrect = data.correct ? data.correct : null
            func = (answer) => {return timeCorrect == answer ? " checked" : ""}
        }
        for (let answer of data.answers){
            let div = document.createElement("div")
            div.className = 'questionForTest'
            console.log(answer,timeCorrect)
            
            div.innerHTML = `
                <div class="settings-question-block">
                    <img src="${trashSvg}" alt="" class="trashQuestionMark">
                    <input type="${data.type == 'OneAnswerQuestion' ? "radio" : "checkbox"}" name="correct" class="isAnswerCorrect"${func(answer)}>
                </div>
                <textarea class="answerInput">${answer}</textarea>
            `
            if (data["type" == "multipleQuestion"]){
                timeCorrect = timeCorrect.filter((item) => item != answer)
            }else if (data["type" == "OneAnswerQuestion"]){
                timeCorrect = null
            }
            
            QuestionsList.append(div)
        }
    
        QuestionsList.innerHTML += `
            <button class="center action" id="addAnswer">
                <img src="${addQuestionImg.value}" alt="" class="add-question-icon">
            </button>
        `
        
        add()
    }else{
        change(false)
        let objectsToLoad = ['class', 'subject', 'testNameInput', 'description']
        let data = JSON.parse(localStorage.getItem("settingsOfTest"))
        if (data){


            for (let object of objectsToLoad){
                document.querySelector(`#${object}`).value = data[object]
            }
        }
    }
}

export default load
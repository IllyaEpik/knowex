import add from "./add.js";
import change from "./change.js";

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
                question:"",
                "answers":[
                    "",
                    ""],
                "correct":null,
                "type":"OneAnswerQuestion"
            }
            localStorage.setItem(current,JSON.stringify(data))
        }
        if (data["type"]){
            if (data["type"] == "OneAnswerQuestion"){
                let sel = document.querySelector('#questionType').querySelector('select')
                if (sel){ sel.value = "1"; sel.classList.add("selectImg") }
            } else if (data["type"] == "multipleQuestion"){
                let sel = document.querySelector('#questionType').querySelector('select')
                if (sel){ sel.value = "2"; sel.classList.add("selectImg") }
            } else {
                const el = document.querySelector(`#${data["type"]}`)
                if (el && el.querySelector('img')) el.querySelector('img').classList.add("selectImg")
            }
        }else{
            let sel = document.querySelector('#questionType').querySelector('select')
            if (sel) sel.classList.add("selectImg")
        }
        let QuestionsList = document.querySelector("#QuestionsList")
        let trashSvg = document.querySelector('#trashSvg').value
        document.querySelector("#questionNameInput").value = data.question
        QuestionsList.innerHTML = ''
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
            div.innerHTML = `
                <div class="settings-question-block">
                    <img src="${trashSvg}" alt="" class="trashQuestionMark">
                    <input type="${data.type == 'OneAnswerQuestion' ? "radio" : "checkbox"}" name="correct" class="isAnswerCorrect"${func(answer)}>
                </div>
                <textarea class="answerInput" placeholder = "Введіть варіант відповіді...">${answer}</textarea>
            `
            if (data["type" == "multipleQuestion"]){
                timeCorrect = timeCorrect.filter((item) => item != answer)
            }else if (data["type"] == "OneAnswerQuestion"){
                timeCorrect = null
            }
            QuestionsList.append(div)
        }
        QuestionsList.innerHTML += `
            <button class="center action" id="addAnswer">
                <object data="${addQuestionImg.value}" type="image/svg+xml" class="svgToWhite add-question-icon"></object>
            </button>
        `
        let svg = QuestionsList.querySelector("object")
        svg.onload = function () {
            if (body.classList.contains("dark")){
                const realSvg = this.contentDocument.querySelector("path");
                realSvg.style.stroke = "white";
            }
        }
        
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

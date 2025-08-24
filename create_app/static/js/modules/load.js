import add from "./add.js";
import change from "./change.js"


function load() {
    let select = document.querySelector('.select')
    
    if (select.id != "settingButton"){
        change(true)
        // QuestionsList
        let current = select.querySelector(".questionNumber").textContent
        let data = JSON.parse(localStorage.getItem(current))
        let addQuestionImg = document.querySelector("#addQuestionImg")
        console.log(data,"load")
        if (!data){
            data = {
                question:"Введіть питання...",
                "answers":[
                    "Введіть варіант відповіді...",
                    "Введіть варіант відповіді..."],
                "correct":[],
                "type":"OneAnswerQuestion"
            }
            localStorage.setItem(current,data)
        }
        if (data["type"]){
            document.querySelector(`#${data["type"]}`).querySelector("img").classList.add("selectImg")
        }else{
            document.querySelector(`#OneAnswerQuestion`).querySelector("img").classList.add("selectImg")

        }
        // {"question":"Введіть питання...","answers":["Введіть варіант відповіді...","Введіть варіант відповіді..."],"correct":null}
        let QuestionsList = document.querySelector("#QuestionsList")
        let trashSvg = document.querySelector('#trashSvg').value
        document.querySelector("#questionNameInput").value = data.question
        QuestionsList.innerHTML = ''
        let timeCorrect = data.correct
        for (let answer of data.answers){
            let div = document.createElement("div")
            div.className = 'questionForTest'
            // console.log(data.correct.includes(answer))
            
            div.innerHTML = `
                <div class="settings-question-block">
                    <img src="${trashSvg}" alt="" class="trashQuestionMark">
                    <input type="${data.type == 'OneAnswerQuestion' ? "radio" : "checkbox"}" name="correct" class="isAnswerCorrect"${timeCorrect.includes(answer) ? " checked" : ""}>
                </div>
                <textarea class="answerInput">${answer}</textarea>
            `
            timeCorrect = timeCorrect.filter((item) => item != answer)
            
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
function change(activate=true){
    document.querySelectorAll(".action img, .action select").forEach(el => el.classList.remove("selectImg"))
    const questionTypeAction = document.querySelector('#questionType')
    const correctSelect = questionTypeAction ? questionTypeAction.querySelector('select') : null
    for (let action of document.querySelectorAll(".action")){
        action.onclick = () => {}
    }
    if (!activate) return
    if (correctSelect){
        correctSelect.onchange = () => {
            document.querySelectorAll(".action img, .action select").forEach(el => el.classList.remove("selectImg"))
            correctSelect.classList.add("selectImg")
            if (correctSelect.value == "1"){
                for (let input of document.querySelectorAll(".isAnswerCorrect")){
                    input.type = "radio"
                }
            } else {
                for (let input of document.querySelectorAll(".isAnswerCorrect")){
                    input.type = "checkbox"
                }
            }
        }
    }
    for (let action of document.querySelectorAll(".action")){
        if (action.id == "addQuestion" || action.id == "questionType") continue
        if (activate){
            action.onclick = ()=>{
                document.querySelectorAll(".action img, .action select").forEach(el => el.classList.remove("selectImg"))
                const img = action.querySelector('img')
                if (img) img.classList.add("selectImg")
            }
        }else{
            action.onclick = () => {}
        }
    }
}
export default change

function change(activate=true){
    // let multipleQuestion = document.querySelector("#multipleQuestion")
    let actions = [

    ]

    for (let action of document.querySelectorAll(".action")){
        action.querySelector("img").classList.remove("selectImg")
        if (activate){
            if (action.id != "addQuestion"){
                action.onclick = ()=>{
                    for (let action of document.querySelectorAll(".action")){
                        action.querySelector("img").classList.remove("selectImg")
                    }
                    action.querySelector("img").classList.add("selectImg")
                    if (action.id == "OneAnswerQuestion"){
                        for (let input of document.querySelectorAll(".isAnswerCorrect")){
                            input.type = "radio"
                        }
                    }else if (action.id == "multipleQuestion"){
                        for (let input of document.querySelectorAll(".isAnswerCorrect")){
                            input.type = "checkbox"
                        }
                    }
                }
            }
        }else{
            action.onclick = () => {}
        }
    }
}
export default change
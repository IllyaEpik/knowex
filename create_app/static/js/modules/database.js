import $ from "../mainCreate.js";
import save from "./save.js"
import update from "./update.js";
function redirect(key,text){
    update(Number(key))
    const modalWindow = document.querySelector(".modalWindow")
    const background = document.querySelector(".background")
    modalWindow.style.opacity = 1   
    modalWindow.classList.remove("hidden")
    background.classList.remove("hidden")
    modalWindow.querySelector("p").textContent = text
    const remover = () =>{
        modalWindow.style.opacity = 0
        setTimeout(()=>{modalWindow.classList.add("hidden")},200)
        
        background.classList.add("hidden")
    }
    modalWindow.addEventListener("click",remover)
    background.addEventListener("click",remover)
}
function database() {
    
    document.addEventListener("DOMContentLoaded", function(){
        let saveTest = document.querySelector('.saveTest')
        saveTest.addEventListener("click", function(){
            save()
            let settingsData = JSON.parse(localStorage.getItem("settingsOfTest"))
            let listAllQuestions = {}
            let Formdata = new FormData();
            let count = 0;
            for (let key in localStorage){
                if (count < localStorage.length && !isNaN(Number(key))){
                    let questionData = localStorage.getItem(key)
                    listAllQuestions[key] = questionData
                    console.log(key)
                }
                count++
            }
            console.log(listAllQuestions,"aLL")
            let checkList = []
            let error = ""
            for (let key in listAllQuestions){
                let question = JSON.parse(listAllQuestions[key])
                checkList.push(question)
                console.log(question)
                console.log(key,'NUMBER')
                if (question.question == ""){
                    error = `Введіть запитання для питання номер ${Number(key)}`
                    // update(Number(key))
                    redirect(key,error)
                    return;
                }
                for (let answer of question.answers){
                    if (answer==""){
                        error = `не всі відповіді в ${Number(key)} питанні поставлені`
                        redirect(key,error)
                        // update(Number(key))
                        return;
                    }
                }
                console.log(question.correct,'weqqew', typeof question.correct, typeof question.correct,typeof undefined)
                if (typeof question.correct==typeof undefined){
                    error = `ви забули вказати правильну відповідь для запитання номер ${Number(key)}`
                    // break
                    redirect(key,error)
                    return;
                }
                
                // if (question)
            }
            if (!listAllQuestions['1']){
                error = "у тесту немає запитань задайте їх"
            }
            console.log(checkList)
            if ( error==""){
            Formdata.append('data', JSON.stringify(listAllQuestions));
            Formdata.append('subject', settingsData['subject']);
            Formdata.append('class_name', settingsData['class']);
            Formdata.append('name', settingsData['testNameInput']);
            Formdata.append('description', settingsData['description']);
            
            try {
                Formdata.append('image', document.querySelector('#loadImgInput').files[0]);
            } catch (error) {}
            $.ajax(
                '/create_test', {
                type: "POST",
                data: Formdata,
                processData: false,
                contentType: false,
                success: function (response) {
                    
                    // Сохраняем текущую тему
                    const theme = localStorage.getItem('theme');
                    localStorage.clear();
                    // Восстанавливаем тему
                    if (theme) {
                        localStorage.setItem('theme', theme);
                    }
                    alert('Тест збережено!')
                },
                error: function (xhr) {
                    console.log('error',xhr)
                }
                }
            );
            }else{
                alert(error)
            }
        }
    )})
    
}
export default database
import $ from "../mainCreate.js";
import save from "./save.js"
function database() {
    
    document.addEventListener("DOMContentLoaded", function(){
        save()
        let saveTest = document.querySelector('.saveTest')
        saveTest.addEventListener("click", function(){
            let settingsData = JSON.parse(localStorage.getItem("settingsOfTest"))
            let listAllQuestions = []
            let Formdata = new FormData();
            let count = 0;
            for (let key in localStorage){
                if (count < localStorage.length && key!="settingsOfTest" && key!= "theme"){
                    let questionData = localStorage.getItem(key)
                    listAllQuestions.push(questionData)
                }
                count++
            }
            if (listAllQuestions.length){
            Formdata.append('data', JSON.stringify(listAllQuestions));
            Formdata.append('subject', settingsData['subject']);
            Formdata.append('class_name', settingsData['class']);
            Formdata.append('name', settingsData['testNameInput']);
            Formdata.append('description', settingsData['description']);
            
            try {
                Formdata.append('image', document.querySelector('#loadImgInput').files[0]);
            } catch (error) {}
            console.log(listAllQuestions)
            console.log(Formdata.get("data"))
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
                    // rightPrint('Тест збережено!');
                },
                error: function (xhr) {
                    console.log('error',xhr)
                }
                }
            );
            }}
    )})
    
}
export default database
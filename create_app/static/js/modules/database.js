import $ from "../mainCreate.js";
function database() {
    
    document.addEventListener("DOMContentLoaded", function(){
    let saveTest = document.querySelector('.saveTest')
    saveTest.addEventListener("click", function(){
        let settingsData = JSON.parse(localStorage.getItem("settingsOfTest"))
        let listAllQuestions = []
        let Formdata = new FormData();
        let count = 0;
        for (let key in localStorage){
            if (count < localStorage.length && key!="settingsOfTest" && key!= "theme"){
                console.log(key)
                let questionData = localStorage.getItem(key)
                listAllQuestions.push(questionData)

                // {"question":"2+2","answers":["2","4","1","3"],"correct":"2"}
                // const allInputs = Array.from(questionForm.querySelector('#options').querySelectorAll('input')).map(input => input.value);

                // const questionData = {
                //     question: questionForm.querySelector('#question').value,
                //     correct: questionForm.querySelector('#correctAnswer').value,
                //     options: allInputs
                // };
            }
            count++
        }
        
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
                // rightPrint('Тест збережено!');
            },
            error: function (xhr) {
                console.log('error',xhr)
            }
        });
    })})
    
}
export default database
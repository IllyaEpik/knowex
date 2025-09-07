import update from "./update.js"

function start(){
    let questionContainer = document.querySelector(".questionContainer")
    let binInputSrc = document.querySelector('#binInputSrc')
    for (let key in localStorage){
        if (count < localStorage.length && !isNaN(Number(key)) && Number(key)!=1){
            questionContainer.innerHTML += `<button class="button questionButton">Питання <span class="questionNumber">${key}</span> <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton"></button>`
        }
        count++
    }
    update()
    let testImg = document.querySelector("#testImg")

    document.querySelector("#loadImgInput").addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
            testImg.src = e.target.result;
            testImg.style.display = 'block';
            };
            reader.readAsDataURL(file)
        }
    })
}
export default start
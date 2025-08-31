import update from "./update.js"

function start(){
    let questionContainer = document.querySelector(".questionContainer")
    let binInputSrc = document.querySelector('#binInputSrc')
    // questionContainer.innerHTML = ""
    for (let key in localStorage){
        if (count < localStorage.length && !isNaN(Number(key)) && Number(key)!=1){
            // console.log(key)
            // let questionData = localStorage.getItem(key)
            // listAllQuestions.push(questionData)
            questionContainer.innerHTML += `<button class="button questionButton">Питання <span class="questionNumber">${key}</span> <img src="${binInputSrc.value}" alt="" class="add-question-icon removeButton"></button>`
        }
        count++
    }
    update()
    let testImg = document.querySelector("#testImg")

    document.querySelector("#loadImgInput").addEventListener('change', function(event) {
        const file = event.target.files[0];

        // Check if a file was selected
        if (file) {
            // Create a new FileReader object
            const reader = new FileReader();

            // Set up the 'onload' event handler for the reader
            // This function will run when the file has been read
            reader.onload = function(e) {
            // Set the source (src) of the image preview to the result of the reader
            testImg.src = e.target.result;
            // Make the image element visible
            testImg.style.display = 'block';
            };
            reader.readAsDataURL(file)
        }
    })
}
// {/* <div class="questionContainer">
//     <button class="button questionButton">Питання <span class="questionNumber">1</span> <img src="{{ url_for('create.static', filename='images/bin.svg') }}" alt="" class="add-question-icon removeButton"></button>
// </div> */}
export default start
function addOption() {
    const optionsDiv = document.getElementById('options');
    const newOptionDiv = document.createElement('div');
    newOptionDiv.innerHTML = `<input type="text" class="option" placeholder="Новий варіант"> <button onclick="removeOption(this)">➖</button>`;
    optionsDiv.appendChild(newOptionDiv);
}

function removeOption(button) {
    button.parentElement.remove();
}

function saveQuestion(event) {
    event.preventDefault()
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);
    console.log('1312123132132')
    $.ajax('/create', {
        type: "post",
        data: $(this).serialize(),
        success: function(){
            console.log('success')
    }})
    
    alert(data.message)
}
// document.getElementById('add').addEventListener(() => addOption)
// document.createElement()
document.querySelector('form').addEventListener('submit', 
    function (event) {
    event.preventDefault()
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);
    console.log('1312123132132')
    $.ajax('/create', {
        type: "post",
        data:{question:question, correctAnswer:correctAnswer, options:options},
        success: function(){
            console.log('success')
    }})
    
    alert(data.message)
})
console.log()

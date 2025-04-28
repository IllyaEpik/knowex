function addOption() {
    const optionsDiv = document.getElementById('options');
    const newOptionDiv = document.createElement('div');
    newOptionDiv.innerHTML = `<input type="text" class="option" placeholder="Новий варіант"> <button onclick="removeOption(this)">➖</button>`;
    optionsDiv.appendChild(newOptionDiv);
}

function removeOption(button) {
    button.parentElement.remove();
}

function saveQuestion() {
    const question = document.getElementById('question').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);

    fetch('/save_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, correct_answer: correctAnswer, options: options })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
}
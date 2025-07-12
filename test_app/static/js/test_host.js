const socket = io();

socket.emit('join_test', {
    test_id: testId,
    username: hostName,
    role: 'host'
});
const startBtn = document.getElementById('start_test_btn');
const questionContainer = document.getElementById("currentQuestion");
const questionText = document.createElement("p");
questionText.id = "cocain";
let currentQuestion = 1;
let countQuestions = Number(document.getElementById('countQuestion').value);
let testStarted = false;

startBtn.addEventListener('click', () => {
    if (!testStarted) {
        testStarted = true;

        questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
        questionContainer.append(questionText)
        // questionContainer.appendChild(questionText);

        startBtn.textContent = "Наступне питання";

        socket.emit('start_test_command', { test_id: testId });
        socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
    } else {
        if (currentQuestion < countQuestions) {
            currentQuestion++;
            questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
            socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
        } else {
            questionText.textContent = `Тест завершено`;
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId });
        }
    }
});
// nextQuestion
socket.on('nextQuestion', data => {
    console.log('data:', data);
});
socket.on('host_ack', data => {
    console.log('Хост підключений:', data);
});

socket.on('participants_update', participants => {
    const ul = document.getElementById('participants_list');
    ul.innerHTML = '';
    participants.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        ul.appendChild(li);
    });
});

socket.on('update_results', results => {
    const ul = document.getElementById('results_list');
    ul.innerHTML = '';
    for (const [user, score] of Object.entries(results)) {
        const li = document.createElement('li');
        li.textContent = `${user}: ${score} балів`;
        ul.appendChild(li);
    }
});

socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});

socket.on('participant_answered', data => {
    const container = document.getElementById('answers_log');
    const entry = document.createElement('div');

    entry.innerHTML = `
        <strong>${data.user}</strong> відповів: <em>${data.selected}</em><br>
        Правильна відповідь: <strong style="color:green">${data.correct}</strong><br>
        ${data.question_text ? `Питання: ${data.question_text}<br>` : ''}
        <hr>
    `;

    container.prepend(entry); // новые сверху
});

// socket.on('show_correct_answer', data => {
//     const log = document.getElementById('answers_log');
//     const entry = document.createElement('div');

//     entry.innerHTML = `
//         <strong>${data.user}</strong> відповів: <em>${data.selected}</em><br>
//         Питання: <strong>${data.question_text}</strong><br>
//         Правильна відповідь: <span style="color:green">${data.correct}</span><br><hr>
//     `;

//     log.prepend(entry); // новые сверху
// });




const socket = io();
let user_answers = {}

socket.emit('join_test', {
    test_id: testId,
    username: hostName,
    role: 'host'
});
const startBtn = document.getElementById('start_test_btn');
const questionContainer = document.getElementById("currentQuestion");
const questionText = document.createElement("p");
const ul = document.getElementById('participants_list');
questionText.id = "cocain";
let currentCorrectAnswer = undefined;
let questionText2  = document.getElementById("questionText")

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
        for (let answer in user_answers){
                console.log(user_answers[answer].length, currentQuestion)
                if (user_answers[answer].length < currentQuestion){

                    user_answers[answer].push(null)
                }
            }
        if (currentQuestion < countQuestions) {
            currentQuestion++;
            questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
            
            // currentQuestion
            socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
        } else {
            questionText.textContent = `Тест завершено`;
            console.log(user_answers)
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId, user_answers:user_answers });
        }
    }
});
socket.on('correct', correct => {
    currentCorrectAnswer = correct.answer 

});
// следующий вопрос 
socket.on('nextQuestion', data => {
    for(let li of ul.children){
        li.style.color = '#9ca3af';
        // span
        let span = li.querySelector("span")
        span ? span.remove() : false
    }
    questionText2.textContent = data['question_text']

});

socket.on('host_ack', data => {
    console.log('Хост підключений:', data);
});

socket.on('participants_update', participants => {
    ul.innerHTML = '';
    console.log(participants)
    user_answers = {}
    participants.forEach(p => {
        if (!user_answers[p]){

            user_answers[p] = []
        }
        const li = document.createElement('li');
        li.id = `participant-${p}`
        li.textContent = p;
        ul.append(li)
        
    });
});
// получаем ответы пользователя
socket.on('send_answer', answer => {
    // currentCorrectAnswer
    const li = document.getElementById(`participant-${answer.user}`);
    if (li) {
        li.style.color = answer.answer==currentCorrectAnswer ? '#22c55e' : '#ef4444';
        li.innerHTML = `<strong>${answer.user}</strong> <span>(${answer.answer})</span>`;
        console.log(`Updated participant ${answer.user} color to ${li.style.color}`);
    } else {
        console.error(`Participant element not found: participant-${answer.user}`);
    }
        // Child(li);
    user_answers[answer.user].push(answer.answer)
})
socket.on('testEnd', (data) => {
    console.log("Финальные данные:", data);

    const resultsContainer = document.getElementById('final_results');
    const resultsList = document.getElementById('results_list');
    resultsList.innerHTML = '';

    resultsContainer.style.display = 'block';
    resultsContainer.classList.remove('hidden');

    Object.entries(data.users)
        .sort((a, b) => b[1].correct - a[1].correct)
        .forEach(([user, info]) => {
            const li = document.createElement('li');
            li.textContent = `${user}: ${info.correct} з ${data.total_questions}`;
            resultsList.appendChild(li);
        });

    document.getElementById('start_test_btn').disabled = true;
});


socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});

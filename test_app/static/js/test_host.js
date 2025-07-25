const socket = io();
let user_answers = {};
let currentAnswers = [];

socket.emit('join_test', {
    test_id: testId,
    username: hostName,
    role: 'host'
});

const startBtn = document.getElementById('start_test_btn');
const questionContainer = document.getElementById("currentQuestion");
const questionTextElement = document.getElementById("questionText");
const questionProgress = document.getElementById("question-progress");
const answerOptions = document.getElementById("answer-options");
const participantsSection = document.getElementById("participants-section");
const finalResults = document.getElementById("final_results");
let currentCorrectAnswer = undefined;

let currentQuestion = 1;
let countQuestions = Number(document.getElementById('countQuestion').value);
let testStarted = false;

const questionCountElement = document.querySelector('.question-count'); // Додано селектор

// ✅ Генерация случайного ПАСТЕЛЬНОГО цвета
function getRandomColor() {
    const r = Math.floor(Math.random() * 156) + 100; // 100-255
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
}

// ✅ Инициализация прогресса вопросов
function initializeQuestionProgress() {
    questionProgress.innerHTML = '';
    for (let i = 1; i <= countQuestions; i++) {
        const box = document.createElement('div');
        box.className = 'question-box';
        box.textContent = i;
        if (i === 1) box.classList.add('active');
        questionProgress.appendChild(box);
    }
}

// ✅ Отображение вариантов ответа с рандомным цветом
function renderAnswerOptions(answers) {
    answerOptions.innerHTML = '';
    currentAnswers = answers || [];
    currentAnswers.forEach((answer, index) => {
        const option = document.createElement('div');
        option.className = 'answer-option';
        option.textContent = answer;
        option.dataset.index = index;
        const randomColor = getRandomColor();
        option.dataset.bgColor = randomColor; // сохраняем цвет
        option.style.backgroundColor = randomColor;
        option.style.border = "2px solid #ddd";
        answerOptions.appendChild(option);
    });
}

// ✅ Старт теста и переключение вопросов
startBtn.addEventListener('click', () => {
    if (!testStarted) {
        testStarted = true;
        initializeQuestionProgress();
        questionTextElement.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
        questionCountElement.textContent = `Питання: ${currentQuestion} / ${countQuestions}`; // Додано оновлення при старті
        startBtn.textContent = "Наступне питання";
        socket.emit('start_test_command', { test_id: testId });
        socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
    } else {
        for (let user in user_answers) {
            if (user_answers[user].length < currentQuestion) {
                user_answers[user].push(null);
            }
        }
        if (currentQuestion < countQuestions) {
            currentQuestion++;
            questionTextElement.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
            questionCountElement.textContent = `Питання: ${currentQuestion} / ${countQuestions}`; // Додано оновлення при переході
            const boxes = questionProgress.getElementsByClassName('question-box');
            for (let box of boxes) {
                const num = parseInt(box.textContent);
                if (num === currentQuestion) {
                    box.classList.add('active');
                } else if (num < currentQuestion) {
                    box.classList.add('completed');
                } else {
                    box.classList.remove('active', 'completed');
                }
            }
            socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
        } else {
            questionTextElement.textContent = `Тест завершено`;
            questionCountElement.textContent = `Питання: ${countQuestions} / ${countQuestions}`; // Додано оновлення при завершенні
            console.log(user_answers);
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId, user_answers: user_answers });
        }
    }
});

// ✅ Получение правильного ответа
socket.on('correct', (correct) => {
    currentCorrectAnswer = correct.answer;
});

// ✅ Получение следующего вопроса
socket.on('nextQuestion', (data) => {
    if (data.question_text) {
        questionTextElement.textContent = data.question_text;
        renderAnswerOptions(data.answers);
    } else {
        console.error('No question text received:', data);
    }
});

// ✅ Подтверждение подключения хоста
socket.on('host_ack', (data) => {
    console.log('Хост підключений:', data);
});

// ✅ Обновление списка участников
socket.on('participants_update', (participants) => {
    participantsSection.innerHTML = `
        <h3>Учасники: ${participants.length}</h3>
        <ul id="participants_list" class="participants-list"></ul>
    `;
    const ul = document.getElementById('participants_list');
    user_answers = {};
    participants.forEach((p) => {
        if (!user_answers[p]) {
            user_answers[p] = [];
        }
        const li = document.createElement('li');
        li.id = `participant-${p}`;
        li.textContent = p;
        li.className = getParticipantColor(p);
        ul.appendChild(li);
    });
});

// ✅ Обработка ответа участника (НЕ меняем фон, только рамку)
socket.on('send_answer', (answer) => {
    const li = document.getElementById(`participant-${answer.user}`);
    if (li) {
        li.className = answer.answer === currentCorrectAnswer ? 'green' : 'red';
        li.innerHTML = `<strong>${answer.user}</strong> <span>(${answer.answer || 'Без відповіді'})</span>`;

        const option = answerOptions.querySelector(`[data-index="${currentAnswers.indexOf(answer.answer)}"]`);
        if (option) {
            // оставляем исходный цвет
            option.style.backgroundColor = option.dataset.bgColor;
            option.style.border = answer.answer === currentCorrectAnswer
                ? "3px solid #2ecc71"
                : "3px solid #e74c3c";
        }
    } else {
        console.error(`Participant element not found: participant-${answer.user}`);
    }
    user_answers[answer.user].push(answer.answer || null);
});

// ✅ Завершение теста
socket.on('testEnd', (data) => {
    console.log("Финальні дані:", data);
    renderFinalResults(data);
    document.querySelector('.test-container').style.display = 'none';
    finalResults.classList.remove('hidden');
});

// ✅ Финальные результаты
function renderFinalResults(data) {
    const resultsList = document.getElementById('results_list');
    resultsList.innerHTML = '';

    Object.entries(data.users)
        .sort((a, b) => b[1].correct - a[1].correct)
        .forEach(([user, info]) => {
            const totalQuestions = data.total_questions;
            const accuracy = Math.round((info.correct / totalQuestions) * 100);

            const line = document.createElement('div');
            line.className = 'line';

            const userName = document.createElement('div');
            userName.className = 'userName';
            userName.textContent = user;

            const stretchWrap = document.createElement('div');
            stretchWrap.className = 'stretchWrap';

            const answersContainer = document.createElement('div');
            answersContainer.className = 'answers';
            info.questions.forEach((q, index) => {
                const box = document.createElement('div');
                box.className = `answer ${q.is_correct ? 'correct' : 'incorrect'}`;
                box.textContent = index + 1;
                answersContainer.appendChild(box);
            });

            stretchWrap.appendChild(answersContainer);

            const statsBlock = document.createElement('div');
            statsBlock.className = 'statsBlock';
            statsBlock.innerHTML = `
                <div>${accuracy}% Точність</div>
                <div>${info.correct} Балів</div>
            `;

            line.appendChild(userName);
            line.appendChild(stretchWrap);
            line.appendChild(statsBlock);

            resultsList.appendChild(line);
        });
}
socket.on('update_question_status', (data) => {
    const { current_question, total_questions } = data;
    const questionCountElement = document.querySelector('.question-count');
    if (questionCountElement) {
        questionCountElement.textContent = `Питання: ${current_question} / ${total_questions}`;
    }
});
// ✅ Тест закрыт
socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});

// ✅ Цвет участника (рандомно)
function getParticipantColor(username) {
    const colors = ['green', 'red', 'gray', 'yellow'];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}
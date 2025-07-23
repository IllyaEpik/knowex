const socket = io();
let user_answers = {};

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
let questionText2 = document.getElementById("questionText");

let currentQuestion = 1;
let countQuestions = Number(document.getElementById('countQuestion').value);
let testStarted = false;

startBtn.addEventListener('click', () => {
    if (!testStarted) {
        testStarted = true;

        questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
        questionContainer.append(questionText);

        startBtn.textContent = "Наступне питання";

        socket.emit('start_test_command', { test_id: testId });
        socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
    } else {
        for (let answer in user_answers) {
            if (user_answers[answer].length < currentQuestion) {
                user_answers[answer].push(null);
            }
        }
        if (currentQuestion < countQuestions) {
            currentQuestion++;
            questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
            socket.emit('next_question', { test_id: testId, question_number: currentQuestion });
        } else {
            questionText.textContent = `Тест завершено`;
            console.log(user_answers);
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId, user_answers: user_answers });
        }
    }
});

socket.on('correct', correct => {
    currentCorrectAnswer = correct.answer;
});

socket.on('nextQuestion', data => {
    for (let li of ul.children) {
        li.style.color = '#9ca3af';
        let span = li.querySelector("span");
        span ? span.remove() : false;
    }
    questionText2.textContent = data['question_text'];
});

socket.on('host_ack', data => {
    console.log('Хост підключений:', data);
});

socket.on('participants_update', participants => {
    ul.innerHTML = '';
    console.log(participants);
    user_answers = {};
    participants.forEach(p => {
        if (!user_answers[p]) {
            user_answers[p] = [];
        }
        const li = document.createElement('li');
        li.id = `participant-${p}`;
        li.textContent = p;
        ul.append(li);
    });
});

socket.on('send_answer', answer => {

    const li = document.getElementById(`participant-${answer.user}`);
    if (li) {
        li.style.color = answer.answer == currentCorrectAnswer ? '#22c55e' : '#ef4444';
        li.innerHTML = `<strong>${answer.user}</strong> <span>(${answer.answer})</span>`;
        console.log(`Updated participant ${answer.user} color to ${li.style.color}`);
    } else {
        console.error(`Participant element not found: participant-${answer.user}`);
    }
    user_answers[answer.user].push(answer.answer);
});

socket.on('testEnd', (data) => {
    console.log("Финальные данные:", data);
    Object.entries(data.users).forEach(([user, info]) => {
        console.log(`Пользователь ${user} имеет ${info.questions.length} вопросов`);
    });
    localStorage.setItem(`test_results_${data.test}`, JSON.stringify(data));
    renderFinalResults(data);
});

function renderFinalResults(data) {
    const resultsContainer = document.getElementById('final_results');
    const resultsList = document.getElementById('results_list');
    resultsList.innerHTML = '';

    resultsContainer.style.display = 'block';
    resultsContainer.classList.remove('hidden');

    Object.entries(data.users)
        .sort((a, b) => b[1].correct - a[1].correct)
        .forEach(([user, info]) => {
            const totalQuestions = data.total_questions;
            const accuracy = Math.round((info.correct / totalQuestions) * 100);

            // Горизонтальная линия
            const line = document.createElement('div');
            line.style.display = 'flex';
            line.style.alignItems = 'center';
            line.style.gap = '15px';
            line.style.padding = '5px 0';
            line.style.borderBottom = '1px solid #e5e7eb';
            line.style.width = '100%';

            // Ник
            const userName = document.createElement('div');
            userName.textContent = user;
            userName.style.fontWeight = 'bold';
            userName.style.whiteSpace = 'nowrap';
            userName.style.minWidth = '100px';

            // Обёртка, которая расширяется (растягивает линию)
            const stretchWrap = document.createElement('div');
            stretchWrap.style.display = 'flex';
            stretchWrap.style.flexGrow = '1';
            stretchWrap.style.justifyContent = 'flex-start';

            // Блок с квадратиками
            const answersContainer = document.createElement('div');
            answersContainer.classList.add('result');
            info.questions.forEach((q, index) => {
                const box = document.createElement('div');
                box.classList.add('answer');
                box.style.backgroundColor = q.is_correct ? '#22c55e' : '#ef4444';
                box.textContent = index + 1;
                box.style.textAlign = 'center';
                box.style.color = '#fff';
                box.style.lineHeight = '25px';
                answersContainer.appendChild(box);
            });

            stretchWrap.appendChild(answersContainer);

            // Баллы и точность
            const statsBlock = document.createElement('div');
            statsBlock.style.display = 'flex';
            statsBlock.style.flexDirection = 'column';
            statsBlock.style.alignItems = 'flex-end';
            statsBlock.style.minWidth = '80px';
            statsBlock.innerHTML = `
                <div style="font-size:12px;">${accuracy}% Точність</div>
                <div style="font-size:12px;">${info.correct} Балів</div>
            `;

            line.appendChild(userName);
            line.appendChild(stretchWrap);  // Растягиваемое пространство
            line.appendChild(statsBlock);

            resultsList.appendChild(line);
        });
}


socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});
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
// let correctAnswers = 0
// let incorrectAnswers = 0 
// let nullAnwers = 0 
let correctAnswersHistory = [];

let currentQuestion = 1;
let countQuestions = Number(document.getElementById('countQuestion').value);
let testStarted = false;

const questionCountElement = document.querySelector('.question-count');
const questionsSection = document.getElementById('questions-section');
const ratingSection = document.getElementById('rating-section');
const questionsBtn = document.getElementById('questionsBtn');
const ratingBtn = document.getElementById('ratingBtn');
const ratingList = document.getElementById('rating-list');

questionsBtn.addEventListener('click', () => {
    questionsSection.classList.remove('hidden');
    ratingSection.classList.add('hidden');

    ratingBtn.classList.remove("selected")
    questionsBtn.classList.add('selected')
});

ratingBtn.addEventListener('click', () => {
    questionsSection.classList.add('hidden');
    ratingSection.classList.remove('hidden');

    questionsBtn.classList.remove("selected")
    ratingBtn.classList.add("selected")
    renderRating();
});
const endTestBtn = document.getElementById('end_test_btn');
endTestBtn.addEventListener('click', () => {
    socket.emit('end_current_question', { test_id: testId });
});

function renderRating() {
    ratingList.innerHTML = '';
    const total = countQuestions;
    
    Object.entries(user_answers).forEach(([user, answers]) => {
        let correctAnswers = 0, incorrectAnswers = 0, nullAnwers = 0, count = 0;
        answers.forEach(ans => {
            if (ans === null) nullAnwers++;
            else if (ans === correctAnswersHistory[count]) correctAnswers++;
            else incorrectAnswers++;
            count++
        });
        nullAnwers += total - answers.length;

        const oneWidth = 605 / total;

        const block = document.createElement('div');
        block.className = 'rating-block';

        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = user;

        const bar = document.createElement('div');
        bar.className = 'rating-bar';
        function setBar(answers, name){
            const answersWidth = answers * oneWidth;
            if (answers > 0) {
                const correctBar = document.createElement('div');
                correctBar.className = `rating-bar-segment rating-bar-${name}`;
                correctBar.style.width = `${answersWidth}px`;
                correctBar.innerHTML = `<span>${answers}</span>`;
                bar.appendChild(correctBar);
            }
        }
        setBar(correctAnswers, 'correct')
        setBar(incorrectAnswers, 'incorrect')  
        setBar(nullAnwers, 'null')
        

        block.appendChild(name);
        block.appendChild(bar);

        ratingList.appendChild(block);
    });
}
let colors = [
    "#24B9B2",
    "#469597",
    "#5BA199",
    "#217074",
    "#37745B",
    "#2F70AF",
    "#81BECE",
    "#BACBDB"
]
function getRandomColor() {
    let len = colors.length
    let rand = Math.floor(Math.random()*colors.length) // const r = Math.floor(Math.random() * 156) + 100;
    // const g = Math.floor(Math.random() * 156) + 100;
    // const b = Math.floor(Math.random() * 156) + 100;
    // return `rgb(${r}, ${g}, ${b})`;
    // Math.random
    console.log(rand,colors[rand],colors)
    return colors[Number(rand)]
}

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

function renderAnswerOptions(answers) {
    answerOptions.innerHTML = '';
    currentAnswers = answers || [];
    currentAnswers.forEach((answer, index) => {
        const option = document.createElement('div');
        option.className = 'answer-option';
        option.textContent = answer;
        option.dataset.index = index;
        const randomColor = getRandomColor();
        option.dataset.bgColor = randomColor;
        option.style.backgroundColor = randomColor;
        option.style.border = "2px solid #ddd";
        answerOptions.appendChild(option);
    });
}

// function updateParticipantSquare(username, status) {
//     const safeId = encodeURIComponent(username);
//     const square = document.getElementById(`participant-square-${safeId}`);
//     if (!square) return;
//     if (status === 'null') {
//         square.style.backgroundColor = '#bdbdbd'; // gray
//         square.style.border = '1px solid #999';
//     } else if (status === 'correct') {
//         square.style.backgroundColor = '#2ecc71'; // green
//         square.style.border = '1px solid #1ea85a';
//     } else if (status === 'incorrect') {
//         square.style.backgroundColor = '#e74c3c'; // red
//         square.style.border = '1px solid #c53a2b';
//     }
// }

startBtn.addEventListener('click', () => {
    if (!testStarted) {
        testStarted = true;
        initializeQuestionProgress();
        questionTextElement.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
        questionCountElement.textContent = `Питання: ${currentQuestion} / ${countQuestions}`;
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
            questionCountElement.textContent = `Питання: ${currentQuestion} / ${countQuestions}`;
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
            questionCountElement.textContent = `Питання: ${countQuestions} / ${countQuestions}`;
            console.log(user_answers);
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId, user_answers: user_answers });
        }
    }
});
socket.on('correct', (correct) => {
    currentCorrectAnswer = correct.answer;
    // let timesCorrect = currentCorrectAnswer
    // if (our_data.type == 'multiple'){
    //     timesCorrect = JSON.parse(currentCorrectAnswer)
    // }
    // console.log(timesCorrect)
    correctAnswersHistory.push(currentCorrectAnswer)
});

socket.on('nextQuestion', (data) => {
    if (data.question_text) {
        questionTextElement.textContent = data.question_text;
        renderAnswerOptions(data.answers);

        // Object.keys(user_answers).forEach(username => {
        //     updateParticipantSquare(username, 'null');
        // });

    } else {
        console.error('No question text received:', data);
    }
});

socket.on('host_ack', (data) => {
    console.log('Хост підключений:', data);
});

socket.on('participants_update', (participants) => {
    // participantsSection.innerHTML += `
    //     <h3>Учасники: ${participants.length}</h3>
    //     <ul id="participants_list" class="participants-list"></ul>
    // `;
    const participantsCount = document.getElementById('participantsCount');
    participantsCount.textContent = participants.length;
    const ul = document.getElementById('participants_list');
    user_answers = {};
    participants.forEach((p) => {
        if (!user_answers[p]) {
            user_answers[p] = [];
        }
        const li = document.createElement('li');
        li.id = `participant-${p}`;
        
        const square = document.createElement('div');
        const safeId = encodeURIComponent(p);
        square.id = `participant-square-${safeId}`;
        square.className = 'participant-square';
        
        li.appendChild(square);

        const nameSpan = document.createElement('span');
        nameSpan.textContent = p;
        li.appendChild(nameSpan);

        // li.className = getParticipantColor(p);
        ul.appendChild(li);
        // ul.appendChild(startBtn);

    });
});
function isSuperset(a, b) {
    a = new Set(a)
    b = new Set(b)
    for (let elem of b) {
        if (!a.has(elem)) {
            return false;
        }
    }
    return true;
}
socket.on('send_answer', (answer) => {
    const li = document.getElementById(`participant-${answer.user}`);
    if (li) {
        if (answer.type == 'multiple'){
            answer.answer = JSON.parse(answer.answer)
            currentCorrectAnswer = JSON.parse(currentCorrectAnswer)
        }

        console.log(isSuperset(answer.answer, currentCorrectAnswer), answer.answer,currentCorrectAnswer, new Set(answer.answer), new Set(currentCorrectAnswer))
        li.className = isSuperset(answer.answer, currentCorrectAnswer) ? 'green' : 'red';
        // li.innerHTML = `<strong>${answer.user}</strong> <span>(${answer.answer || 'Без відповіді'})</span>`;
        console.log(li)
        // user_answers[answer.user].push(answer.answer)
        // const option = answerOptions.querySelector(`[data-index="${currentAnswers.indexOf(answer.answer)}"]`);
        // if (option) {
        //     option.style.backgroundColor = option.dataset.bgColor;
        //     option.style.border = answer.answer === currentCorrectAnswer
        //         ? "3px solid #2ecc71"
        //         : "3px solid #e74c3c";
        // }
    } else {
        console.error(`Participant element not found: participant-${answer.user}`);
    }

    // if (answer.answer == null || answer.answer === '') {
    //     updateParticipantSquare(answer.user, 'null');
    // } else if (answer.answer === currentCorrectAnswer) {
    //     updateParticipantSquare(answer.user, 'correct');
    // } else {
    //     updateParticipantSquare(answer.user, 'incorrect');
    // }
    
    user_answers[answer.user].push(answer.answer || null);
    renderRating();
});

socket.on('testEnd', (data) => {
    console.log("Финальні дані:", data);
    renderFinalResults(data);
    document.querySelector('.test-container').style.display = 'none';
    finalResults.classList.remove('hidden');
});

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

socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});

// function getParticipantColor(username) {
//     const colors = ['green', 'red', 'gray', 'yellow'];
//     const index = Math.floor(Math.random() * colors.length);
//     return colors[index];
// }


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
            let type = typeof ans == typeof [',13',12312] ? "multiple" : "standart"
            let correct = correctAnswersHistory[count]
            if (type == "multiple"){
                correct = JSON.parse(correct)
                ans == null ? nullAnwers++ : isSuperset(correct,ans) ? correctAnswers++ : incorrectAnswers++
            }else{
                if (ans === null) nullAnwers++;
                else if (ans === correctAnswersHistory[count]) correctAnswers++;
                else incorrectAnswers++;
            }
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
    if (body.classList.contains("dark")){
        return "#495057 "
    }
    let rand = Math.floor(Math.random()*colors.length) 
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
            startBtn.disabled = true;
            socket.emit('end_test', { test_id: testId, user_answers: user_answers });
        }
    }
});
socket.on('correct', (correct) => {
    currentCorrectAnswer = correct.answer;
    correctAnswersHistory.push(currentCorrectAnswer)
});

socket.on('nextQuestion', (data) => {
    if (data.question_text) {
        questionTextElement.textContent = data.question_text;
        renderAnswerOptions(data.answers);

    } else {
    }
});



socket.on('participants_update', (participants) => {

    const participantsCount = document.getElementById('participantsCount');
    participantsCount.textContent = participants.length;
    const ul = document.getElementById('participants_list');
    // user_answers = {};
    participants.forEach((p) => {
        if (!user_answers[p]) {
            user_answers[p] = [];
        
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

            ul.appendChild(li);
        }
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
let typeOfQuestion
socket.on('send_answer', (answer) => {
    const li = document.getElementById(`participant-${answer.user}`);
    if (li) {
        if (answer.type == 'multiple'){
            answer.answer = JSON.parse(answer.answer)
            currentCorrectAnswer = JSON.parse(currentCorrectAnswer)
        }

        li.className = isSuperset(answer.answer, currentCorrectAnswer) ? 'green' : 'red';
    } else {
    }
    
    user_answers[answer.user].push(answer.answer || null);
    renderRating();
});

socket.on('testEnd', (data) => {
    renderFinalResults(data);
    document.querySelector('.test-container').style.display = 'none';
    finalResults.classList.remove('hidden');
});

function renderFinalResults(data) {
    const resultsList = document.getElementById('results_list');
    resultsList.innerHTML = data.diagramm;
    let diagramm = resultsList.querySelector("img")
    diagramm.className = "diagramm"
    let count = 0;
    Object.entries(data.users)
        
        .sort((a, b) => b[1].correct - a[1].correct)
        .forEach(([user, info]) => {
            count++
            const totalQuestions = data.total_questions;
            const accuracy = Math.round((info.correct / totalQuestions) * 100);

            const line = document.createElement('div');
            line.className = 'line';

            const viewButton = document.createElement('button');
            const userName = document.createElement('div');
            userName.className = 'userName';
            userName.textContent = user;
            viewButton.id = `buttonNumber${count}`
            viewButton.className = "viewButton"
            viewButton.textContent = "v"
            userName.append(viewButton)
            
            const stretchWrap = document.createElement('div');
            stretchWrap.className = 'stretchWrap';

            const answersContainer = document.createElement('div');
            answersContainer.className = 'answers';
            let questionsText = `<h3>відповіді ${user}:</h3>`
            info.questions.forEach((q, index) => {
                const box = document.createElement('div');
                let type = q.type
                let options = ""
                let answers = JSON.parse(q.answers)
                box.className = `answer ${q.is_correct ? 'correct' : 'incorrect'}`;
                box.textContent = index + 1;
                answersContainer.appendChild(box);
                let count2 = 0
                for (let option of answers){
                    count2++
                    let isCorrect = false
                    let isUser= false
                    if (type=="multiple"){
                        q.correct_answer = typeof q.correct_answer == typeof "213" ? JSON.parse(q.correct_answer) : q.correct_answer
                        q.user_answer = typeof q.user_answer == typeof "213" ? q.user_answer == "Не було відповіді" ? false :  JSON.parse(q.user_answer) : q.user_answer
                        isCorrect = q.correct_answer.includes(option)
                        isUser = q.user_answer ? q.user_answer.includes(option) : false
                    }else{
                        isCorrect = option == q.correct_answer
                        isUser = option == q.user_answer
                    }
                    options += `
                     <li>
                        <input type="checkbox" name="question-${count2}"
                        id="option-${count2}" disabled ${isUser ? "checked" : ""}
                        
                        >
                        <label for="option-${count2}"
                        class = ${isCorrect ? "correct" : isUser ? "incorrect" : ""}
                        >${option}</label>
                     </li>
                    `
                }
                questionsText += `
                <div class="question-block">
                <b>Питання: ${q.text}</b>
                <ul class="answer-options-result">${options}</ul>
                
                </div>
                `
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

            const listQuestions = document.createElement("div")
            listQuestions.className = "hidden listOfQuestions"
            viewButton.addEventListener("click", () => {
                listQuestions.classList.toggle("hidden")
            })
            resultsList.appendChild(line);
            resultsList.append(listQuestions)



            questionsText+= "<div class='empty'></div>"
            listQuestions.innerHTML = questionsText
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

document.addEventListener("DOMContentLoaded", function () {
    // Скрываем всё кроме .question-code и #rightPanel
    document.querySelectorAll('.test-header, .main-content:not(#rightPanel), #rating-section').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelector('.question-code').style.display = '';
    document.getElementById('rightPanel').style.display = '';

    // После нажатия "Розпочати тест" показываем всё, скрываем код
    const startBtn = document.getElementById('start_test_btn');
    startBtn.addEventListener('click', function () {
        document.querySelectorAll('.test-header, .main-content, #rating-section').forEach(el => {
            el.style.display = '';
        });
        document.querySelector('.question-code').style.display = 'none';
    });
});
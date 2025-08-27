document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    const mainContent = document.querySelector('.main-content');
    const testWait = document.getElementById('testWait');
    const answers = document.getElementById('answer-options');
    const count_questions = document.getElementById('question-progress');
    const resultContainer = document.querySelector('.result-container');
    const testName = document.getElementById('testName');
    const testDate = document.getElementById('testDate');
    const testTime = document.getElementById('testTime');
    const correct = document.getElementById('correct');
    const linkToResult = document.getElementById('linkToResult');
    const questionElem = document.createElement('div');
    const sendButton = document.getElementById('sendButton');
    const loadingButton = document.getElementById('loadingButton');
    const answerForm = document.getElementById('answer_form');
    const overlayWait = document.getElementById('overlay-wait');

    questionElem.className = 'questions-result-list';
    questionElem.style.marginTop = '32px';
    questionElem.innerHTML = `
        <h3>Всі питання та правильні відповіді:</h3>
        <ol></ol>
    `;

    const allQuestions = questionElem.querySelector('ol');
    const testId = window.TEST_ID || null;
    let username = window.USERNAME || null;
    let firstQid = window.FIRST_QID || null;

    function getRandomColor() {
        const r = Math.floor(Math.random() * 156) + 100;
        const g = Math.floor(Math.random() * 156) + 100;
        const b = Math.floor(Math.random() * 156) + 100;
        return `rgb(${r}, ${g}, ${b})`;
    }
    socket.on('show_waiting_screen', () => {
        if (overlayWait) {
            overlayWait.classList.remove('hidden');
            overlayWait.style.display = 'flex';
        }
    });
    socket.on('testEnd', (data) => {
        const link = document.createElement('link');
        overlayWait.classList.add('hidden');
        link.rel = 'stylesheet';
        link.href = linkToResult.value;
        document.head.appendChild(link);
        console.log(data);
        resultContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
        testName.textContent = data.test;
        testDate.textContent = data.time_date;
        testTime.textContent = data.time_text;
        let currentUser = data.users[username];
        console.log(username, currentUser, data);
        correct.textContent = `${currentUser.correct} з ${data.total_questions}`;
        let count = 1;

        for (let question of currentUser.questions) {
            console.log(question);
            let userAnswer = question.user_answer === null || question.user_answer === undefined
                ? 'не було відповіді на питання'
                : question.user_answer;

            allQuestions.innerHTML += `
                <li style="margin-bottom:18px;">
                    <div><b>Питання:</b> ${question.text}</div>
                    <div><b>Правильна відповідь:</b> ${question.correct_answer}</div>
                    <div>
                        <b>Ваша відповідь:</b>
                        <span style="color:${question.is_correct ? '#22c55e' : '#ef4444'};">${userAnswer}</span>
                    </div>
                </li>
            `;
            resultContainer.append(questionElem);
            count++;
        }
    });
    let our_data;
    socket.on('nextQuestion', (data) => {
        console.log('data:', data);
        our_data = data
        overlayWait.classList.add('hidden');
        sendButton.classList.remove('hidden');
        loadingButton.classList.add('hidden');
        document.getElementById('questionText').textContent = data['question_text'];
        count_questions.textContent = `Питання ${data['question_number']} з ${window.COUNT_QUESTIONS}`;
        answers.innerHTML = '';
        let count = 0
        for (let ans of data['answers']) {
            let label = document.createElement('label');
            label.className = 'answer-option';
            label.innerHTML = `<input type="${data.type == "OneAnswerQuestion" ? "radio" : "checkbox"}" id="${count}" name="answer" value="${ans}" class="hidden">${ans}`;
            label.htmlFor = `${count}`
            label.value = `${ans}` 
            label.addEventListener("click", function(){
                    let answers = document.querySelectorAll(".answer-option")
                    for (let answer of answers){
                        console.log(answer.querySelector("input").checked)
                        answer.querySelector("input").checked ? answer.classList.add("selected") : answer.classList.remove("selected")
                        
                    }
                // }
                // label.classList.add("selected")
            })
            // label.name = "answer"
            // label.textContent = `${ans}` 
            label.style.backgroundColor = getRandomColor(); 
            console.log(label)
            answers.append(label);
            count++
        }
    });

    socket.on('user_answer_feedback', (data) => {
        console.log('Answer feedback:', data);
        const answerLabels = answers.querySelectorAll('.answer-option');
        answerLabels.forEach(label => {
            const input = label
            // const input = label.querySelector('input');
            // nothing bad
            label.classList.remove('correct', 'incorrect', 'pending', 'unanswered');
            if (input.value == data.selected_answer) {
                label.classList.add(data.is_correct ? 'correct' : 'incorrect');
            } else if (input.value == data.correct_answer) {
                label.classList.add('correct');
            } else {
                label.classList.add('unanswered');
            }
            label.style.backgroundColor = ''; 
        });
        answerForm.querySelectorAll('input[name="answer"]').forEach(input => {
            input.disabled = true;
        });
        sendButton.disabled = true;
        sendButton.classList.add('hidden');
        loadingButton.classList.remove('hidden');
    });

    if (!testId || !username) {
        console.error('TEST_ID або USERNAME не визначені');
        alert('Помилка: неможливо підключитися до тесту.');
    } else {
        if (username === ' ') {
            username = document.getElementById('username')?.value || 'Гість';
        }

        socket.emit('join_test', {
            test_id: testId,
            username: username,
            role: 'participant'
        });
    }

    socket.on('participant_ack', (d) => {
        console.log(d.msg);
        // alert(d.msg); // Опціонально: додати сповіщення
    });

    socket.on('test_started', (data) => {
        if (data.test_id && data.first_question_id) {
            mainContent.classList.remove('hidden');
            testWait.classList.add('hidden');
        } else {
            console.error('test_id або first_question_id не визначені', data.test_id, data.first_question_id);
        }
    });

    socket.on('test_closed', () => {
        alert('Тест було закрито хостом');
        window.location.href = '/';
    });

    document.addEventListener('submit', function (e) {
        e.preventDefault();
        if (e.target.tagName === 'FORM') {
            // console.log(e.target);
            let selected;
            console.log(our_data)
            if (our_data.type == "OneAnswerQuestion"){
                selected = e.target.querySelector('input[name="answer"]:checked').value;
            }else if (our_data.type == "multiple"){
                let timeSelected = document.querySelectorAll('input[name="answer"]:checked');
                console.log(timeSelected)
                selected = []
                for (let select of timeSelected){
                    selected.push(select.value)
                }
                console.log(selected)
                selected = JSON.stringify(selected)
                console.log(selected)
            }
            console.log(selected)
            if (!selected) {
                alert('Будь ласка, оберіть відповідь.');
                return;
            }
            
            console.log(selected);
            sendButton.classList.add('hidden');
            loadingButton.classList.remove('hidden');
            socket.emit('send_answer', { 'answer': selected, 'user': username, 'test_id': testId, type: our_data.type});
            overlayWait.classList.remove('hidden');
            // $.ajax({
            //     url: window.location.pathname,
            //     type: 'POST',
            //     data: { answer: selectedValue },
            //     success: function (response) {
            //         if (response.error) {
            //             alert('Помилка: ' + response.error);
            //             return;
            //         }
            //         if (response.correct_answer && response.question_text && window.TEST_ID && window.USERNAME) {
            //             socket.emit('participant_answered_with_correct', {
            //                 test_id: window.TEST_ID,
            //                 user: window.USERNAME,
            //                 selected: selectedValue,
            //                 correct: response.correct_answer,
            //                 question_text: response.question_text
            //             });
            //         }
            //         if (response.next_url) {
            //             $.ajax({
            //                 url: response.next_url,
            //                 headers: { 'X-Requested-With': 'XMLHttpRequest' },
            //                 success: function (data) {
            //                     const container = document.querySelector('.question-container');
            //                     if (container) {
            //                         container.innerHTML = data;
            //                         history.pushState({}, '', response.next_url);
            //                     } else {
            //                         console.error('Елемент .question-container не знайдено');
            //                     }
            //                 },
            //                 error: function () {
            //                     alert('Не вдалося завантажити наступне питання.');
            //                 }
            //             });
            //         } else if (response.result_url) {
            //             window.location.href = response.result_url;
            //         }
            //     },
            //     error: function () {
            //         alert('Сталася помилка при перевірці відповіді.');
            //     }
            // });
        }
    });
});
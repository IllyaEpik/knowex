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

    socket.on('testEnd', (data) => {
        const link = document.createElement('link');
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

    socket.on('nextQuestion', (data) => {
        console.log('data:', data);
        sendButton.classList.remove('hidden');
        loadingButton.classList.add('hidden');
        document.getElementById('questionText').textContent = data['question_text'];
        count_questions.textContent = `Питання ${data['question_number']} з ${window.COUNT_QUESTIONS}`;
        answers.innerHTML = '';
        for (let ans of data['answers']) {
            let label = document.createElement('label');
            label.className = 'answer-option';
            label.innerHTML = `<input type="radio" name="answer" value="${ans}" required>${ans}`;
            label.style.backgroundColor = getRandomColor(); 
            answers.append(label);
        }
    });

    socket.on('user_answer_feedback', (data) => {
        console.log('Answer feedback:', data);
        const answerLabels = answers.querySelectorAll('.answer-option');
        answerLabels.forEach(label => {
            const input = label.querySelector('input');
            label.classList.remove('correct', 'incorrect', 'pending', 'unanswered');
            if (input.value === data.selected_answer) {
                label.classList.add(data.is_correct ? 'correct' : 'incorrect');
            } else if (input.value === data.correct_answer) {
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

    // socket.on('user_answer_saved', (data) => {
    //     console.log('Answer saved:', data);
    //     const submitBtn = answerForm.querySelector('#submitBtn');
    //     if (submitBtn) {
    //         submitBtn.disabled = true;
    //         submitBtn.textContent = 'Очікування наступного питання...';
    //         submitBtn.classList.add('loading');
    //         console.log('Answer submitted successfully, waiting for next question');
    //     }
    // });

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
            console.log(e.target);
            const selected = e.target.querySelector('input[name="answer"]:checked');
            if (!selected) {
                alert('Будь ласка, оберіть відповідь.');
                return;
            }
            const selectedValue = selected.value;
            console.log(selectedValue);
            sendButton.classList.add('hidden');
            loadingButton.classList.remove('hidden');
            socket.emit('send_answer', { 'answer': selectedValue, 'user': username, 'test_id': testId });
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
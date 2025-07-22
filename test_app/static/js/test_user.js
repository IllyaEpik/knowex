document.addEventListener('DOMContentLoaded', function () {
    const socket = io();
    const questionContainer = document.getElementById("questionContainer");
    const testWait = document.getElementById("testWait");
    const answers = document.querySelector(".answers");
    const count_questions = document.querySelector("#count_questions");
    const resultContainer = document.querySelector('.result-container')
    const testName = document.querySelector('#testName')
    const testDate = document.querySelector('#testDate')
    const testTime = document.querySelector('#testTime')
    const correct = document.querySelector('#correct')
    const link = document.querySelector('link')
    const linkToResult = document.querySelector('#linkToResult')
    const questionElem = document.createElement('div')
    const sendButton = document.getElementById("sendButton");
    const loadingButton = document.getElementById("loadingButton");


    
    questionElem.className = "questions-result-list"
    questionElem.style.marginTop = '32px'
    questionElem.innerHTML = `
    <h3>Всі питання та правильні відповіді:</h3>
    <ol></ol>
    `

    const allQuestions = questionElem.querySelector('ol')
    const testId = window.TEST_ID || null;
    let username = window.USERNAME || null;
    let firstQid = window.FIRST_QID || null;
    socket.on('testEnd', (data) => {
        link.href = linkToResult.value
        console.log(data)
        resultContainer.classList.remove('hidden')
        questionContainer.classList.add('hidden')
        testName.textContent = data.test
        testDate.textContent = data.time_date
        testTime.textContent = data.time_text
        let currentUser = data.users[username]
        console.log(username,currentUser,data)
        correct.textContent = `${currentUser.correct} з ${data.total_questions}` 
        // {
        //     "text": "3321",
        //     "correct_answer": "312213213",
        //     "user_answer": "312213213",
        //     "is_correct": true
        // }
        let count = 1

    for (let question of currentUser.questions) {
    console.log(question);

        // Если нет ответа, подставляем текст
        let userAnswer = question.user_answer === null || question.user_answer === undefined
            ? "не було відповіді на питання"
            : question.user_answer;

        allQuestions.innerHTML += `
            <li style="margin-bottom:18px;">
                <div><b>Питання:</b> ${question.text}</div>
                <div><b>Правильна відповідь:</b> ${question.correct_answer}</div>
                <div>
                    <b>Ваша відповідь:</b>
                    <span style="color:#ef4444;">${userAnswer}</span>
                </div>
            </li>
        `;

        if (question.is_correct) {
            let spans = allQuestions.querySelectorAll('span');
            spans[spans.length - 1].style.color = '#22c55e';
        }

        document.body.querySelector('.content').append(questionElem);
            count++
        }
        // color:#22c55e;
    });
    socket.on('nextQuestion', data => {
        console.log('data:', data);
        sendButton.classList.remove("hidden")
        loadingButton.classList.add("hidden")
        document.querySelector('#questionText').textContent = data['question_text']
        count_questions.textContent = data['question_number']
        // question_number
        answers.innerHTML = ''
        for (let ans of data['answers']){
            let label = document.createElement('label')
            label.className = 'answer-option'
            label.innerHTML = `<input type="radio" name="answer" value="${ans}" required>${ans} `

            answers.append(label)
        }
    });
    if (!testId || !username) {
        console.error("TEST_ID або USERNAME не визначені");
        alert("Помилка: неможливо підключитися до тесту.");
    } else {
        if (username === " ") {
            username = document.getElementById("username")?.value || "Гість";
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
    //         }
    // });

    socket.on('participant_ack', (d) => {
        console.log(d.msg);
        // alert(d.msg); // Опціонально: додати сповіщення
    });

    socket.on('test_started', (data) => {
        if (data.test_id && data.first_question_id) {
            // window.location.href = `/test/${data.test_id}/user/${data.first_question_id}`;
            questionContainer.classList.remove('hidden')
            testWait.classList.add('hidden')
        } else {
            console.error("test_id або first_question_id не визначені", data.test_id, data.first_question_id);
        }
    });

    socket.on('test_closed', () => {
        alert("Тест було закрито хостом");
        window.location.href = "/";
    });
    
    // result-container
// {% block content %}
// <div class="result-container">
//     <h2>Результати тесту: {{ test.name }}</h2>
//     <p>Дата завершення: {{ time_date }}</p>
//     <p>Час завершення: {{ time_text }}</p>
//     <p>Вірних відповідей: {{ correct }} з {{ total_questions }}</p> 
//     <a href="{{ url_for('test.render_test', test_id=test.id) }}">Повернутися до тесту</a>
// </div>

// {% if questions is defined %}
//     <div class="questions-result-list" style="margin-top:32px;">
//         <h3>Всі питання та правильні відповіді:</h3>
//         <ol>
//             {% for q in questions %}
//                 <li style="margin-bottom:18px;">
//                     <div><b>Питання:</b> {{ q.text }}</div>
//                     <div><b>Правильна відповідь:</b> {{ q.correct_answer }}</div>
//                     {% if q.user_answer is defined %}
//                         <div>
//                             <b>Ваша відповідь:</b>
//                             {% if q.user_answer == q.correct_answer %}
//                                 <span style="color:#22c55e;">{{ q.user_answer }}</span>
//                             {% else %}
//                                 <span style="color:#ef4444;">{{ q.user_answer }}</span>
//                             {% endif %}
//                         </div>
//                     {% endif %}
//                 </li>
//             {% endfor %}
//         </ol>
//     </div>
// {% endif %}
// {% endblock %}
    // document.addEventListener('DOMContentLoaded', function () {
        document.addEventListener('submit', function (e) {
            e.preventDefault();
            if (e.target.tagName === 'FORM') {
                console.log(e.target)
                const selected = e.target.querySelector('input[name="answer"]:checked');
                if (!selected) {
                    alert('Будь ласка, оберіть відповідь.');
                    return;
                }
                const selectedValue = selected.value;
                console.log(selectedValue)
                // <p id="">innerHtml</p>
                sendButton.classList.add("hidden")
                loadingButton.classList.remove("hidden")
                socket.emit("send_answer", {'answer':selectedValue,'user':username,'test_id':testId})
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
                //                         console.error("Елемент .question-container не знайдено");
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






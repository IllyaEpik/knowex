const socket = io();
const questionContainer = document.getElementById("questionContainer");
const testWait = document.getElementById("testWait");
const answers = document.querySelector(".answers");
const count_questions = document.querySelector("#count_questions");
// count_questions
// test
const testId = window.TEST_ID || null;
let username = window.USERNAME || null;
let firstQid = window.FIRST_QID || null;
/* 
    <label class="answer-option">
    <input type="radio" name="answer" value="ans" required>
    ans 
    </label> 
*/
socket.on('nextQuestion', data => {
    console.log('data:', data);
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

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('submit', function (e) {
        e.preventDefault();
        if (e.target.tagName === 'FORM') {
            const selected = e.target.querySelector('input[name="answer"]:checked');
            if (!selected) {
                alert('Будь ласка, оберіть відповідь.');
                return;
            }
            const selectedValue = selected.value;

            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: { answer: selectedValue },
                success: function (response) {
                    if (response.error) {
                        alert('Помилка: ' + response.error);
                        return;
                    }
                    if (response.correct_answer && response.question_text && window.TEST_ID && window.USERNAME) {
                        socket.emit('participant_answered_with_correct', {
                            test_id: window.TEST_ID,
                            user: window.USERNAME,
                            selected: selectedValue,
                            correct: response.correct_answer,
                            question_text: response.question_text
                        });
                    }
                    if (response.next_url) {
                        $.ajax({
                            url: response.next_url,
                            headers: { 'X-Requested-With': 'XMLHttpRequest' },
                            success: function (data) {
                                const container = document.querySelector('.question-container');
                                if (container) {
                                    container.innerHTML = data;
                                    history.pushState({}, '', response.next_url);
                                } else {
                                    console.error("Елемент .question-container не знайдено");
                                }
                            },
                            error: function () {
                                alert('Не вдалося завантажити наступне питання.');
                            }
                        });
                    } else if (response.result_url) {
                        window.location.href = response.result_url;
                    }
                },
                error: function () {
                    alert('Сталася помилка при перевірці відповіді.');
                }
            });
        }
    });
});
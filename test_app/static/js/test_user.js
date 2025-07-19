document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Проверка DOM-элементов с отложенной инициализацией
    function initializeElements(attempt = 1, maxAttempts = 10) {
        const questionContainer = document.getElementById('questionContainer');
        const testWait = document.getElementById('testWait');
        const answers = document.querySelector('.answers');
        const count_questions = document.querySelector('#count_questions');
        const resultContainer = document.querySelector('.result-container');
        const testName = document.querySelector('#testName');
        const testDate = document.querySelector('#testDate');
        const testTime = document.querySelector('#testTime');
        const correct = document.querySelector('#correct');
        const linkToResult = document.querySelector('#linkToResult');
        const questionText = document.querySelector('#questionText');
        const answerForm = document.getElementById('answer_form');

        if (!questionContainer || !testWait || !answers || !count_questions || !resultContainer ||
            !testName || !testDate || !testTime || !correct || !linkToResult || !questionText || !answerForm) {
            console.error(`Attempt ${attempt}: Required DOM elements are missing`, {
                questionContainer: !!questionContainer,
                testWait: !!testWait,
                answers: !!answers,
                count_questions: !!count_questions,
                resultContainer: !!resultContainer,
                testName: !!testName,
                testDate: !!testDate,
                testTime: !!testTime,
                correct: !!correct,
                linkToResult: !!linkToResult,
                questionText: !!questionText,
                answerForm: !!answerForm
            });
            if (attempt < maxAttempts) {
                setTimeout(() => initializeElements(attempt + 1, maxAttempts), 100);
                return null;
            } else {
                alert('Помилка: необхідні елементи сторінки (зокрема форма) не знайдено. Зверніться до адміністратора.');
                return null;
            }
        }
        return { questionContainer, testWait, answers, count_questions, resultContainer, testName, testDate, testTime, correct, linkToResult, questionText, answerForm };
    }

    const elements = initializeElements();
    if (!elements) return;

    const { questionContainer, testWait, answers, count_questions, resultContainer, testName, testDate, testTime, correct, linkToResult, questionText, answerForm } = elements;

    // Создание элемента для результатов
    const questionElem = document.createElement('div');
    questionElem.className = 'questions-result-list';
    questionElem.style.marginTop = '32px';
    questionElem.innerHTML = `
        <h3>Всі питання та правильні відповіді:</h3>
        <ol></ol>
    `;
    const allQuestions = questionElem.querySelector('ol');

    // Проверка глобальных переменных
    const testId = window.TEST_ID || null;
    let username = window.USERNAME || document.getElementById('username_input')?.value || 'Гість';
    if (!username.trim()) username = 'Гість';
    const firstQid = window.FIRST_QID || null;
    const totalQuestions = parseInt(window.TOTAL_QUESTIONS) || 1;

    if (!testId) {
        console.error('TEST_ID не визначено');
        alert('Помилка: неможливо підключитися до тесту.');
        return;
    }

    console.log('Initial setup:', { testId, username, firstQid, totalQuestions });

    // Присоединение к тесту
    socket.emit('join_test', {
        test_id: testId,
        username: username,
        role: 'participant'
    }, (response) => {
        if (response && response.error) {
            console.error('Join test error:', response.error);
            alert(`Помилка приєднання до тесту: ${response.error}`);
        } else {
            console.log('Joined test successfully:', response);
        }
    });

    socket.on('participant_ack', (data) => {
        console.log('Participant acknowledged:', data.msg);
    });

    socket.on('test_started', (data) => {
        console.log('Test started:', data);
        if (!data.test_id || !data.first_question_id) {
            console.error('Invalid test start data:', data);
            alert('Помилка: тест не може бути розпочато через некоректні дані.');
            return;
        }
        questionContainer.classList.remove('hidden');
        questionContainer.style.display = 'block';
        testWait.classList.add('hidden');
        testWait.style.display = 'none';
        console.log('Showing question container, hiding test wait', {
            questionContainerDisplay: questionContainer.style.display,
            questionContainerClass: questionContainer.className,
            testWaitDisplay: testWait.style.display,
            testWaitClass: testWait.className
        });
    });

    socket.on('nextQuestion', (data) => {
        console.log('Отримано дані питання:', data);
        const options = data.options || data.answers || [];
        console.log('Options:', options);
        if (!data.question_text || !Array.isArray(options) || !data.question_number) {
            console.error('Invalid question data:', data);
            alert('Помилка: отримані некоректні дані питання.');
            return;
        }
        questionText.textContent = data.question_text || 'Питання відсутнє';
        count_questions.textContent = `${data.question_number} з ${totalQuestions}`;
        answers.innerHTML = '';
        let validOptions = 0;
        options.forEach((ans, index) => {
            if (!ans || typeof ans !== 'string' || ans.trim() === '') {
                console.warn(`Option ${index} is invalid:`, ans);
                return;
            }
            const label = document.createElement('label');
            label.className = 'answer-option';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.value = ans;
            input.required = true;
            label.appendChild(input);
            label.appendChild(document.createTextNode(ans));
            answers.appendChild(label);

            answers.appendChild(label);
            validOptions++;
        });
        if (validOptions === 0) {
            console.error('No valid options to display');
            answers.innerHTML = '<p style="color: red;">Варіанти відповідей відсутні. Зв\'яжіться з організатором тесту.</p>';
            const submitBtn = answerForm.querySelector('#submitBtn');
            if (submitBtn) submitBtn.disabled = true;
        } else {
            const firstRadio = answers.querySelector('input[name="answer"]');
            if (firstRadio) firstRadio.checked = true;
            const submitBtn = answerForm.querySelector('#submitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.color = '';
                submitBtn.textContent = 'Відправити';
                submitBtn.classList.remove('loading');
            }
        }
        console.log('Updated question text, count, and answers:', {
            questionText: questionText.textContent,
            count_questions: count_questions.textContent,
            answersChildren: answers.children.length,
            validOptions,
            options
        });
        if (questionContainer.classList.contains('hidden') || questionContainer.style.display === 'none') {
            console.warn('questionContainer is hidden, forcing visibility');
            questionContainer.classList.remove('hidden');
            questionContainer.style.display = 'block';
        }
        console.log('questionContainer state:', {
            display: questionContainer.style.display,
            className: questionContainer.className,
            computedDisplay: window.getComputedStyle(questionContainer).display
        });
    });

    socket.on('user_answer_saved', (data) => {
        console.log('Answer saved:', data);
        const submitBtn = answerForm.querySelector('#submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Очікування наступного питання...';
            submitBtn.classList.add('loading');
            console.log('Answer submitted successfully, waiting for next question');
        }
    });

    socket.on('testEnd', (data) => {
        console.log('Test ended:', data);
        if (!data.test || !data.time_date || !data.time_text || !data.total_questions) {
            console.error('Invalid test end data:', data);
            alert('Помилка: отримані некоректні дані результатів.');
            return;
        }
        if (!data.users[username]) {
            console.warn(`No results for user ${username}, initializing empty results`);
            data.users[username] = { questions: [], correct: 0 };
        }
        resultContainer.classList.remove('hidden');
        resultContainer.style.display = 'block';
        questionContainer.classList.add('hidden');
        questionContainer.style.display = 'none';
        testName.textContent = data.test;
        testDate.textContent = data.time_date;
        testTime.textContent = data.time_text;
        const currentUser = data.users[username];
        correct.textContent = `${currentUser.correct} з ${data.total_questions}`;
        allQuestions.innerHTML = '';
        currentUser.questions.forEach((question) => {
            if (!question.text || !question.correct_answer) return;
            const li = document.createElement('li');
            li.style.marginBottom = '18px';
            const textNode = document.createTextNode(question.text);
            const correctAnswerNode = document.createTextNode(question.correct_answer);
            const userAnswerNode = document.createTextNode(question.user_answer || 'Немає відповіді');
            const optionsNode = document.createTextNode(question.options ? question.options.join(', ') : 'Немає варіантів');
            li.innerHTML = `
                <div><b>Питання:</b> </div>
                <div><b>Правильна відповідь:</b> </div>
                <div><b>Ваша відповідь:</b> <span style="color:${question.is_correct ? '#22c55e' : '#ef4444'}"></span></div>
                <div><b>Варіанти:</b> </div>
            `;
            li.querySelector('div:nth-child(1)').appendChild(textNode);
            li.querySelector('div:nth-child(2)').appendChild(correctAnswerNode);
            li.querySelector('span').appendChild(userAnswerNode);
            li.querySelector('div:nth-child(4)').appendChild(optionsNode);
            allQuestions.appendChild(li);
        });
        const content = document.body.querySelector('.content');
        if (content && !content.contains(questionElem)) {
            content.appendChild(questionElem);
        }
        console.log('Test results displayed', {
            testName: testName.textContent,
            correct: correct.textContent
        });
    });

    socket.on('test_closed', () => {
        console.log('Test closed');
        alert('Тест було закрито хостом');
        window.location.href = '/';
    });

    socket.on('error', (err) => {
        console.error('Socket.IO error:', err);
        alert(`Помилка Socket.IO: ${err.message || 'Невідома помилка'}`);
    });

    answerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selected = e.target.querySelector('input[name="answer"]:checked');
        if (!selected) {
            console.warn('No answer selected');
            alert('Будь ласка, оберіть відповідь.');
            return;
        }
        const submitBtn = e.target.querySelector('#submitBtn');
        if (!submitBtn) {
            console.error('Submit button not found in form');
            answers.innerHTML = '<p class="error-message">Помилка: кнопка відправки не знайдена</p>';
            return;
        }
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#000';
        submitBtn.style.color = '#fff';
        submitBtn.textContent = 'Відповідь відправлено...';
        console.log('Submitting answer:', {
            answer: selected.value,
            user: username,
            test_id: testId
        });
        socket.emit('send_answer', {
            answer: selected.value,
            user: username,
            test_id: testId
        }, (response) => {
            if (response && response.error) {
                console.error('Send answer error:', response.error);
                alert(`Помилка при відправці відповіді: ${response.error}`);
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.color = '';
                submitBtn.textContent = 'Відправити';
            } else {
                console.log('Answer sent successfully:', response);
            }
        });
    });
});
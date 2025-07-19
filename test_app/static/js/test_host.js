document.addEventListener('DOMContentLoaded', () => {
    
    // Проверка загрузки Socket.IO
    if (typeof io === 'undefined') {
        console.error('Socket.IO library is not loaded');
        alert('Помилка: бібліотека Socket.IO не завантажена. Перевірте підключення до сервера.');
        const startBtn = document.getElementById('start_test_btn');
        if (startBtn) startBtn.disabled = true;
        return;
    }

    const socket = io({
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    let user_answers = {};
    let currentOptions = [];
    let correctOption = null;
    let optionParticipants = {};
    let currentQuestionAnswered = new Set();

    const startBtn = document.getElementById('start_test_btn');
    const questionContainer = document.getElementById('currentQuestion');
    const optionsContainer = document.getElementById('optionsContainer');
    const countQuestionInput = document.getElementById('countQuestion');
    const participantsList = document.getElementById('participants_list');
    const answersLog = document.getElementById('answers_log');
    const resultsList = document.getElementById('results_list');

    if (!startBtn || !questionContainer || !optionsContainer || !countQuestionInput || !participantsList || !answersLog || !resultsList) {
        console.error('Required DOM elements are missing', {
            startBtn: !!startBtn,
            questionContainer: !!questionContainer,
            optionsContainer: !!optionsContainer,
            countQuestionInput: !!countQuestionInput,
            participantsList: !!participantsList,
            answersLog: !!answersLog,
            resultsList: !!resultsList
        });
        alert('Помилка: необхідні елементи сторінки не знайдено.');
        if (startBtn) startBtn.disabled = true;
        return;
    }

    const questionText = document.createElement('p');
    questionText.id = 'question-text';
    let currentQuestion = 1;
    let countQuestions = Number(window.countQuestions) || 0;
    let testStarted = false;

    socket.emit('join_test', {
        test_id: window.testId,
        username: window.hostName,
        role: 'host'
    }, (response) => {
        console.log('Host join response:', response);
    });

    socket.on('connect', () => {
        console.log('Socket.IO connected');
        startBtn.disabled = false;
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        alert('Помилка підключення до сервера. Перевірте сервер або мережу.');
        startBtn.disabled = true;
        startBtn.textContent = 'Розпочати тест';
    });

    socket.on('disconnect', () => {
        console.warn('Socket.IO disconnected');
        alert('Відключено від сервера. Спробуйте оновити сторінку.');
        startBtn.disabled = true;
        startBtn.textContent = 'Розпочати тест';
    });

    socket.on('host_ack', (data) => {
        console.log('Хост підключений:', data);
        startBtn.disabled = false;
    });

    socket.on('participants_update', (participants) => {
        console.log('Participants update:', participants);
        participantsList.innerHTML = '';
        participants.forEach((p) => {
            if (!p) return;
            if (!user_answers[p]) {
                user_answers[p] = new Array(countQuestions).fill(null);
            }
            const li = document.createElement('li');
            li.textContent = p;
            li.id = `participant-${p}`;
            li.style.color = '#9ca3af';
            participantsList.appendChild(li);
        });
        console.log('Participants list updated, count:', participantsList.children.length);
    });

    socket.on('send_answer', (answer) => {
        console.log('Received send_answer:', answer);
        if (!answer.user || !answer.answer || answer.is_correct === undefined) {
            console.error('Invalid answer data:', answer);
            alert('Помилка: некоректні дані відповіді.');
            return;
        }
        if (!user_answers[answer.user]) {
            user_answers[answer.user] = new Array(countQuestions).fill(null);
        }
        if (user_answers[answer.user].length >= currentQuestion && user_answers[answer.user][currentQuestion - 1] === null) {
            user_answers[answer.user][currentQuestion - 1] = answer.answer;
        } else if (user_answers[answer.user].length < currentQuestion) {
            user_answers[answer.user].push(answer.answer);
        }
        currentQuestionAnswered.add(answer.user);
        console.log('User answers:', user_answers, 'Current question answered:', [...currentQuestionAnswered]);
        const li = document.getElementById(`participant-${answer.user}`);
        if (li) {
            li.style.color = answer.is_correct ? '#22c55e' : '#ef4444';
            li.innerHTML = `<strong>${answer.user}</strong> <span>(${answer.answer})</span>`;
            console.log(`Updated participant ${answer.user} color to ${li.style.color}`);
        } else {
            console.error(`Participant element not found: participant-${answer.user}`);
        }
        updateOptionParticipants(answer.user, answer.answer);
        const entry = document.createElement('div');
        entry.innerHTML = `
            <strong>${answer.user}</strong> відповів: <em>${answer.answer}</em><br>
            Правильна відповідь: <span style="color:${answer.is_correct ? 'green' : 'red'}">${correctOption !== null && currentOptions[correctOption] ? currentOptions[correctOption] : 'Невідомо'}</span><br><hr>
        `;
        answersLog.prepend(entry);
    });

    socket.on('nextQuestion', (data) => {
        console.log('Отримано наступне питання:', data);
        startBtn.disabled = false;

        // Меняем текст кнопки: "Наступне питання" если не последний, иначе "Завершити тест"
        if (currentQuestion < countQuestions - 1) {
            startBtn.textContent = 'Наступне питання';
        } else if (currentQuestion === countQuestions - 1) {
            startBtn.textContent = 'Останнє питання - Завершити тест';
        } else {
            startBtn.textContent = 'Завершити тест';
        }

        const options = data.options || data.answers || [];
        console.log('Options:', options);
        if (!data.question_number || !data.question_text || !Array.isArray(options)) {
            console.error('Invalid question data:', data);
            alert('Помилка: отримані некоректні дані питання.');
            return;
        }
        currentQuestion = data.question_number;
        questionText.textContent = `Питання ${data.question_number} з ${countQuestions}: ${data.question_text}`;
        if (!questionContainer.contains(questionText)) {
            questionContainer.appendChild(questionText);
        }
        for (let user in user_answers) {
            const li = document.getElementById(`participant-${user}`);
            if (li && !currentQuestionAnswered.has(user)) {
                li.style.color = '#9ca3af';
                li.innerHTML = user;
                console.log(`Reset color for ${user} to #9ca3af`);
            }
            if (user_answers[user].length < data.question_number) {
                user_answers[user].push(null);
            }
        }
        currentQuestionAnswered.clear();
        currentOptions = options;
        correctOption = data.correct_option !== undefined ? data.correct_option : null;
        optionParticipants = {};
        updateOptionsDisplay();
        console.log('Question updated, options count:', optionsContainer.children.length);
    });

    socket.on('update_results', (results) => {
        console.log('Received update_results:', results);
        resultsList.innerHTML = '';
        for (const [user, score] of Object.entries(results)) {
            const li = document.createElement('li');
            li.textContent = `${user} правильно відповів на ${score} з ${countQuestions} питань`;
            resultsList.appendChild(li);
        }
    });

    socket.on('testEnd', (data) => {
        console.log('Test ended:', data);
        startBtn.disabled = true;
        startBtn.textContent = 'Тест завершено';
        questionText.textContent = 'Тест завершено';
        optionsContainer.innerHTML = '';
        resultsList.innerHTML = '';
        for (const [user, info] of Object.entries(data.users)) {
            const li = document.createElement('li');
            li.textContent = `${user} правильно відповів на ${info.correct} з ${data.total_questions} питань`;
            resultsList.appendChild(li);
            info.questions.forEach((q, idx) => {
                const subLi = document.createElement('li');
                subLi.style.marginLeft = '20px';
                subLi.innerHTML = `
                    Питання ${idx + 1}: ${q.text}<br>
                    Відповідь: ${q.user_answer || 'Немає'}<br>
                    Правильна: ${q.correct_answer}<br>
                    Варіанти: ${q.options ? q.options.join(', ') : 'Немає'}
                `;
                resultsList.appendChild(subLi);
            });
        }
    });

    socket.on('test_closed', () => {
        console.log('Test closed');
        alert('Тест завершено або хост відключився.');
        window.location.href = '/';
    });

    socket.on('error', (err) => {
        console.error('Socket.IO error:', err);
        alert(`Помилка Socket.IO: ${err.message || 'Невідома помилка'}`);
        startBtn.disabled = false;
        startBtn.textContent = testStarted ? 'Наступне питання' : 'Розпочати тест';
    });

    startBtn.addEventListener('click', () => {
        console.log('Start test button clicked, currentQuestion:', currentQuestion);
        startBtn.disabled = true;
        startBtn.textContent = 'Завантаження...';

        if (!testStarted) {
            testStarted = true;
            questionText.textContent = `Питання ${currentQuestion} з ${countQuestions}`;
            if (!questionContainer.contains(questionText)) {
                questionContainer.appendChild(questionText);
            }
            socket.emit('start_test_command', { test_id: window.testId }, (response) => {
                console.log('Start test response:', response);
                if (response && response.error) {
                    alert(`Помилка запуску тесту: ${response.error}`);
                    startBtn.disabled = false;
                    startBtn.textContent = 'Розпочати тест';
                }
            });
        } else if (currentQuestionAnswered.size < Object.keys(user_answers).length) {
            alert('Не всі учасники відповіли на поточне питання.');
            startBtn.disabled = false;
            startBtn.textContent = 'Наступне питання';
        } else if (currentQuestion < countQuestions) {
            currentQuestion++;
            socket.emit('next_question', { test_id: window.testId, question_number: currentQuestion }, (response) => {
                console.log('Next question response:', response);
                if (response && response.error) {
                    alert(`Помилка переходу до наступного питання: ${response.error}`);
                    startBtn.disabled = false;
                    startBtn.textContent = 'Наступне питання';
                }
            });
        } else {
            socket.emit('end_test', { test_id: window.testId, user_answers }, (response) => {
                console.log('End test response:', response);
                if (response && response.error) {
                    alert(`Помилка завершення тесту: ${response.error}`);
                    startBtn.disabled = false;
                    startBtn.textContent = 'Завершити тест';
                }
            });
        }
    });

    function updateOptionsDisplay() {
        optionsContainer.innerHTML = '';
        if (!Array.isArray(currentOptions)) {
            console.error('Invalid options data:', currentOptions);
            optionsContainer.innerHTML = '<p style="color: red;">Помилка: варіанти відповідей некоректні.</p>';
            return;
        }
        currentOptions.forEach((option, index) => {
            if (!option || typeof option !== 'string') {
                console.warn(`Option ${index} is invalid:`, option);
                return;
            }
            const isCorrect = index === correctOption && correctOption !== null;
            const div = document.createElement('div');
            div.className = `option ${isCorrect ? 'correct' : 'incorrect'}`;
            div.innerHTML = `
                <span>${option}</span>
                <div id="option-participants-${index}" class="participant"></div>
            `;
            optionsContainer.appendChild(div);
        });
        console.log('Updated options display, count:', optionsContainer.children.length);
    }

    function updateOptionParticipants(user, answer) {
        if (!user || !answer) {
            console.warn('Invalid user or answer for updateOptionParticipants:', { user, answer });
            return;
        }
        const index = currentOptions.indexOf(answer);
        if (index === -1) {
            console.warn(`Answer ${answer} not found in currentOptions:`, currentOptions);
            return;
        }
        if (!optionParticipants[index]) {
            optionParticipants[index] = [];
        }
        if (!optionParticipants[index].includes(user)) {
            optionParticipants[index].push(user);
            const participantDiv = document.getElementById(`option-participants-${index}`);
            if (participantDiv) {
                participantDiv.innerHTML = optionParticipants[index].map(u => `<span>${u}</span>`).join(' ');
                console.log(`Updated option participants for option ${index}:`, optionParticipants[index]);
            }
        }
    }
});

socket.on('testEnd', (data) => {
    console.log('Test ended:', data);

    startBtn.disabled = true;
    startBtn.textContent = 'Тест завершено';
    questionText.textContent = 'Тест завершено';
    optionsContainer.innerHTML = '';

    const resultsList = document.getElementById('results_list');
    resultsList.innerHTML = ''; // Очищаем старые результаты

    const title = document.createElement('h2');
    title.textContent = 'Результати тесту';
    resultsList.appendChild(title);

    for (const [user, info] of Object.entries(data.users)) {
        const p = document.createElement('p');
        p.style.fontSize = '16px';
        p.style.margin = '5px 0';
        p.innerHTML = `<strong style="color:#2563eb">${user}</strong> – 
            <span style="color:#22c55e">${info.correct}</span> / 
            <strong>${data.total_questions}</strong> правильних відповідей`;
        resultsList.appendChild(p);
    }
});


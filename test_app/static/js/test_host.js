const socket = io();

socket.emit('join_test', {
    test_id: testId,
    username: hostName,
    role: 'host'
});

document.getElementById('start_test_btn').addEventListener('click', () => {
    socket.emit('start_test_command', { test_id: testId });
});

socket.on('host_ack', data => {
    console.log('Хост підключений:', data);
});

socket.on('participants_update', participants => {
    const ul = document.getElementById('participants_list');
    ul.innerHTML = '';
    participants.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        ul.appendChild(li);
    });
});

socket.on('update_results', results => {
    const ul = document.getElementById('results_list');
    ul.innerHTML = '';
    for (const [user, score] of Object.entries(results)) {
        const li = document.createElement('li');
        li.textContent = `${user}: ${score} балів`;
        ul.appendChild(li);
    }
});

socket.on('test_closed', () => {
    alert("Тест завершено або хост відключився.");
    location.reload();
});

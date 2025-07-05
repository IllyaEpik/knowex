const socket = io();
const testId = window.TEST_ID;
let username = window.USERNAME;
let firstQid = window.FIRST_QID;

if (username == " "){
    username = document.getElementById("username")
}

socket.emit('join_test', {
    test_id: testId,
    username: username,
    role: 'participant'
});

socket.on('participant_ack', (d) => {
    console.log(d.msg);
});

socket.on('test_started', (data) => {
    const testId = data.test_id;
    const firstQid = data.first_question_id;

    if (testId && firstQid) {
        window.location.href = `/test/${testId}/user/${firstQid}`;
    } else {
        console.error("testId или firstQid не определены", testId, firstQid);
    }
});

socket.on('test_closed', () => {
    alert("Тест було закрито хостом");
    window.location.href = "/";
});
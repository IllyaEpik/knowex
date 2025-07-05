
  socket.emit('join_test', {
    test_id: testId,
    username: username,
    role: 'participant'
  });

  document.getElementById('answer_form').addEventListener('submit', function () {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return;

    const isCorrect = selected.dataset.correct === "1";

    socket.emit('submit_answer', {
      test_id: testId,
      username: username,
      is_correct: isCorrect
    });
  });
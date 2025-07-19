import flask, flask_login, random, json, time
from flask import request
from project.config_page import config_page
from create_app.models import Test, Questions
from user_app.models import User
from project.settings import DATABASE, socketio, active_tests, sid_to_username
from flask_socketio import join_room, leave_room, emit

def get_test_cell(test_id):
    test_id = str(test_id)  # ✅ всегда строка
    return active_tests.setdefault(test_id, {
        'participants': set(),
        'results': {},
        'answers': {},
        'host_sid': None,
        'current_question': 0
    })

@config_page("test.html")
def render_test(test_id: int):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    user = User.query.filter(User.create_tests.contains(str(test_id))).first()
    user = user.nickname if user else "Unknown"
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    date = time.localtime(test.date)
    time_of_creation = time.strftime('%H:%M', date)
    date = time.strftime('%d.%m.20%y', date)
    return {
        "test": test,
        "name": user,
        "total_questions": total_questions,
        "date": date,
        "time_of_creation": time_of_creation
    }

@config_page("test_host.html")
def render_test_host(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    return {
        "test": test,
        "test_id": test_id,
        "host_name": flask_login.current_user.nickname,
        'countQuestions': len(test.questions.split())
    }

@config_page("test_user.html")
def render_test_user(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    question_ids = test.questions.split()
    first_qid = int(question_ids[0]) if question_ids else None
    return {
        "current_user": flask_login.current_user.nickname if flask_login.current_user.is_authenticated else "Гість",
        "test": test,
        'count_questions': len(question_ids),
        "first_qid": first_qid,
    }

@config_page("test_user_question.html")
def render_test_user_question(test_id, question_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    if question_id not in question_ids:
        return flask.abort(404)
    current_index = question_ids.index(question_id)
    question = Questions.query.filter_by(id=question_id).first()
    if not question:
        return flask.abort(404)
    answers = []
    if question.answers:
        try:
            answers = json.loads(question.answers)
        except Exception as e:
            print(f"Error parsing answers for question {question_id}: {e}")
            answers = [question.answers]
    if question.correct_answer and question.correct_answer not in answers:
        answers.append(question.correct_answer)
    answers_list = random.sample(answers, len(answers))
    selected = None
    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        is_correct = selected == question.correct_answer
        test_answers = flask.session.get("test_answers", [])
        test_answers = [item for item in test_answers if item["question_id"] != question_id]
        test_answers.append({
            "question_id": question_id,
            "answer": selected,
            "is_correct": is_correct
        })
        flask.session["test_answers"] = test_answers
        flask.session.modified = True
        if flask.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response_data = {
                "correct_answer": question.correct_answer,
                "question_text": question.text
            }
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                response_data["next_url"] = flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id)
            else:
                response_data["result_url"] = flask.url_for("test.test_result", test_id=test_id)
            return flask.jsonify(response_data)
        else:
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.redirect(flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id))
            else:
                return flask.redirect(flask.url_for("test.test_result", test_id=test_id))
    return {
        "test": test,
        "question": question,
        "answers": answers_list,
        "question_id": current_index + 1,
        "total_questions": total_questions,
        "selected": selected,
        "correct_answer": question.correct_answer,
    }

@config_page("test_question.html")
def test_question(test_id, question_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    if question_id not in question_ids:
        return flask.abort(404)
    current_index = question_ids.index(question_id)
    question = Questions.query.filter_by(id=question_id).first()
    if not question:
        return flask.abort(404)
    answers = []
    if question.answers:
        try:
            answers = json.loads(question.answers)
        except Exception as e:
            print(f"Error parsing answers for question {question_id}: {e}")
            answers = [question.answers]
    if question.correct_answer and question.correct_answer not in answers:
        answers.append(question.correct_answer)
    answers_list = random.sample(answers, len(answers))
    selected = None
    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        is_correct = selected == question.correct_answer
        test_answers = flask.session.get("test_answers", [])
        test_answers = [item for item in test_answers if item["question_id"] != question_id]
        test_answers.append({
            "question_id": question_id,
            "answer": selected,
            "is_correct": is_correct
        })
        flask.session["test_answers"] = test_answers
        flask.session.modified = True
        if flask.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.jsonify({
                    "next_url": flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id)
                })
            else:
                return flask.jsonify({
                    "result_url": flask.url_for("test.test_result", test_id=test_id)
                })
        else:
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.redirect(flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id))
            else:
                return flask.redirect(flask.url_for("test.test_result", test_id=test_id))
    return {
        "test": test,
        "question": question,
        "answers": answers_list,
        "question_id": current_index + 1,
        "total_questions": total_questions,
        "selected": selected,
        "correct_answer": question.correct_answer,
    }

@config_page("test_result.html")
def test_result(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    time_complete = time.localtime(time.time())
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    test_answers = flask.session.get("test_answers", [])
    correct = 0
    questions = []
    for qid in question_ids:
        question = Questions.query.filter_by(id=qid).first()
        if not question:
            continue
        user_answer_info = next((item for item in test_answers if item["question_id"] == qid), None)
        user_answer = user_answer_info["answer"] if user_answer_info else None
        is_correct = user_answer_info["is_correct"] if user_answer_info else False
        if is_correct:
            correct += 1
        questions.append({
            "text": question.text,
            "correct_answer": question.correct_answer,
            "user_answer": user_answer,
            "is_correct": is_correct 
        })
    if flask_login.current_user.is_authenticated:
        user = flask_login.current_user
        print(f"User {user.id} completed test {user.complete_tests}")
        if not (str(test.id) in user.complete_tests):
            if user.complete_tests:
                ids = user.complete_tests.split()
                if str(test.id) not in ids:
                    user.complete_tests += f" {test.id}"
                    test.count += 1
            else:
                user.complete_tests = str(test.id)
                test.count += 1
        DATABASE.session.commit()
    flask.session.pop("test_answers", None)
    print({
        "test": test,
        "total_questions": total_questions,
        "time_date": time_date,
        'time_text': time_text,
        "answers": test_answers,
        "correct": correct,
        "questions": questions
    })
    return {
        "test": test,
        "total_questions": total_questions,
        "time_date": time_date,
        'time_text': time_text,
        "correct": correct,
        "questions": questions
    }

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('join_test')
def handle_join(data):
    print(f"Користувач приєднався: {data}")
    test_id = data['test_id']
    username = data['username']
    role = data.get('role', 'participant')
    room_name = f'test_{test_id}'
    join_room(room_name)
    sid_to_username[request.sid] = username
    data_cell = get_test_cell(test_id)
    if role == 'host':
        data_cell['host_sid'] = request.sid
        emit('host_ack', {'msg': 'Хост підключено', 'test_id': test_id}, to=request.sid)
    else:
        data_cell['participants'].add(username)
        data_cell['results'][username] = 0
        data_cell['answers'][username] = []
        emit('participants_update', list(data_cell['participants']), room=room_name)
        emit('participant_ack', {'msg': 'Учасник підключився'}, to=request.sid)

@socketio.on('start_test_command')
def handle_start_cmd(data):
    print(f"Received start_test_command for test_id: {data.get('test_id')}")
    test_id = data.get('test_id')
    if not test_id:
        emit('error', {'message': 'ID тесту не вказано'}, to=request.sid)
        return
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        emit('error', {'message': 'Тест не знайдено'}, to=request.sid)
        return
    room = f'test_{test_id}'
    question_ids = [int(qid) for qid in test.questions.split() if qid]
    if not question_ids:
        emit('error', {'message': 'Немає питань у тесті'}, to=request.sid)
        return
    first_question_id = question_ids[0]
    get_test_cell(test_id)['host_sid'] = request.sid
    emit('test_started', {
        'msg': 'Тест почався!',
        'test_id': test_id,
        'first_question_id': first_question_id
    }, room=room)
    question = Questions.query.get(first_question_id)
    if question:
        answers = []
        if question.answers:
            try:
                answers = json.loads(question.answers)
            except Exception as e:
                print(f"Error parsing answers for question {question.id}: {e}")
        answers = [question.answers]
        if question.correct_answer and question.correct_answer not in answers:
            answers.append(question.correct_answer)
        emit('nextQuestion', {
            'question_text': question.text,
            'question_number': 1,
            'options': answers,
            'correct_option': answers.index(question.correct_answer) if question.correct_answer in answers else -1
        }, room=room)
    else:
        emit('error', {'message': 'Перше питання не знайдено'}, to=request.sid)

@socketio.on('send_answer')
def handle_send_answer(data):
    print(f"Received send_answer: {data}")
    test_id = data.get('test_id')
    username = data.get('user') or data.get('username')
    answer = data.get('answer')
    if not test_id or not username or not answer:
        emit('error', {'message': 'Некоректні дані відповіді'}, to=request.sid)
        return
    cell = get_test_cell(test_id)
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        emit('error', {'message': 'Тест не знайдено'}, to=request.sid)
        return
    question_ids = [int(qid) for qid in test.questions.split() if qid]
    current_question_idx = cell.get('current_question', 0)
    if current_question_idx >= len(question_ids):
        emit('error', {'message': 'Номер питання перевищує кількість питань'}, to=request.sid)
        return
    question = Questions.query.get(question_ids[current_question_idx])
    if not question:
        emit('error', {'message': 'Питання не знайдено'}, to=request.sid)
        return
    is_correct = str(answer) == str(question.correct_answer)
    print(f"Answer check: user={username}, answer={answer}, correct_answer={question.correct_answer}, is_correct={is_correct}")
    cell['answers'].setdefault(username, []).append({
        'question_id': question.id,
        'question_text': question.text,
        'answer': answer,
        'correct_answer': question.correct_answer,
        'is_correct': is_correct
    })
    cell['results'][username] = cell['results'].get(username, 0) + (1 if is_correct else 0)
    emit('send_answer', {
        'user': username,
        'answer': answer,
        'is_correct': is_correct
    }, room=f'test_{test_id}')
    emit('user_answer_saved', {'status': 'ok'}, to=request.sid)

@socketio.on('submit_answer')
def handle_submit_answer(data):
    test_id = data['test_id']
    username = data['username']
    is_ok = data.get('is_correct', False)
    cell = get_test_cell(test_id)
    if not cell:
        return
    cell['results'][username] = cell['results'].get(username, 0) + (1 if is_ok else 0)
    host_sid = cell.get('host_sid')
    if host_sid:
        emit('update_results', cell['results'], to=host_sid)

@socketio.on('save_user_answer')
def handle_save_user_answer(data):
    test_id = data.get('test_id')
    username = data.get('username')
    question_id = data.get('question_id')
    answer = data.get('answer')
    correct_answer = data.get('correct_answer')
    question_text = data.get('question_text')
    cell = get_test_cell(test_id)
    user_answers = cell['answers'].setdefault(username, [])
    user_answers.append({
        'question_id': question_id,
        'question_text': question_text,
        'answer': answer,
        'correct_answer': correct_answer,
        'is_correct': answer == correct_answer
    })
    emit('user_answer_saved', {'status': 'ok'}, to=request.sid)

@socketio.on('participant_answered_with_correct')
def handle_answer_with_correct(data):
    test_id = data.get('test_id')
    user = data.get('user')
    selected = data.get('selected')
    correct = data.get('correct')
    question_text = data.get('question_text')
    cell = get_test_cell(test_id)
    if not cell:
        return
    host_sid = cell.get('host_sid')
    if host_sid:
        emit('show_correct_answer', {
            'user': user,
            'selected': selected,
            'correct': correct,
            'question_text': question_text
        }, to=host_sid)

@socketio.on('next_question')
def handle_next_question(data):
    print(f"Received next_question: {data}")
    test_id = data.get('test_id')
    question_number = data.get('question_number')
    if not test_id or not question_number:
        emit('error', {'message': 'Некоректні дані для наступного питання'}, to=request.sid)
        return
    cell = get_test_cell(test_id)
    if not cell:
        emit('error', {'message': 'Тест не активний'}, to=request.sid)
        return
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        emit('error', {'message': 'Тест не знайдено'}, to=request.sid)
        return
    question_ids = [int(qid) for qid in test.questions.split() if qid]
    if question_number - 1 >= len(question_ids):
        cell['current_question'] = len(question_ids) - 1  # ✅ чтобы не застревало
        emit('error', {'message': 'Номер питання перевищує кількість питань'}, to=request.sid)
        return

    question = Questions.query.get(question_ids[question_number - 1])
    if question:
        answers = []
        if question.answers:
            try:
                answers = json.loads(question.answers)
            except Exception as e:
                print(f"Error parsing answers for question {question.id}: {e}")
        answers = [question.answers]
        if question.correct_answer and question.correct_answer not in answers:
            answers.append(question.correct_answer)
        cell['current_question'] = question_number - 1
        emit('nextQuestion', {
            'question_text': question.text,
            'question_number': question_number,
            'options': answers,
            'correct_option': answers.index(question.correct_answer) if question.correct_answer in answers else -1
        }, room=f'test_{test_id}')
    else:
        emit('error', {'message': 'Питання не знайдено'}, to=request.sid)

@socketio.on('end_test')
def handle_end_test(data):
    test_id = data.get('test_id')
    room = f'test_{test_id}'
    test = Test.query.get(int(test_id))
    if not test:
        emit('error', {'message': 'Тест не знайдено'}, to=request.sid)
        return
    cell = get_test_cell(test_id)
    user_answers = cell['answers']
    print("✅ Ответы из active_tests:", user_answers)
    questions = [qid for qid in test.questions.split() if qid]
    time_complete = time.localtime(time.time())
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)
    data = {
        "test": test.name,
        "time_date": time_date,
        "time_text": time_text,
        "total_questions": len(questions),
        "users": {}
    }
    for username in cell['participants']:
        data["users"][username] = {'questions': [], 'correct': 0}
        answers_list = {a['question_id']: a for a in user_answers.get(username, [])}
        corrects = 0
        for question_id in questions:
            question = Questions.query.get(int(question_id))
            if not question:
                continue
            user_ans_obj = answers_list.get(int(question_id), {})

            ans = user_ans_obj.get('answer')
            is_correct = user_ans_obj.get('is_correct', False)
            options = json.loads(question.answers) if question.answers else []
            if question.correct_answer and question.correct_answer not in options:
                options.append(question.correct_answer)
            data["users"][username]['questions'].append({
                'text': question.text,
                'correct_answer': question.correct_answer,
                'user_answer': ans,
                'is_correct': is_correct,
                'options': options
            })
            if is_correct:
                corrects += 1
        data["users"][username]['correct'] = corrects
    print("Финальные результаты:", data)
    emit('testEnd', data, room=room)
    active_tests.pop(test_id, None)

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    username = sid_to_username.pop(sid, None)
    print(f"Клиент отключился: {sid}, username: {username}")

    for test_id, cell in list(active_tests.items()):
        # Удаляем участника
        if username in cell['participants']:
            cell['participants'].discard(username)
            cell['results'].pop(username, None)
            cell['answers'].pop(username, None)
            emit('participants_update', list(cell['participants']), room=f"test_{test_id}")
            print(f"Участник {username} вышел из теста {test_id}")

        # Хост покинул тест
        if cell.get('host_sid') == sid:
            print(f"Хост {username} покинул тест {test_id}, тест завершён")
            emit('test_closed', room=f"test_{test_id}")
            active_tests.pop(test_id, None)

        # Никого не осталось
        if not cell['participants'] and not cell.get('host_sid'):
            print(f"Тест {test_id} удалён (никого не осталось)")
            active_tests.pop(test_id, None)
import flask, flask_login, random, json, time
from flask import request
from project.config_page import config_page
from create_app.models import Test, Questions
from user_app.models import User
from project.settings import DATABASE, socketio, active_tests, sid_to_username
from flask_socketio import join_room, leave_room, emit




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
    date = time.strftime('%y,%m,%d,%H:%M', date)
    return {
        "test": test,
        "name": user,
        "total_questions": total_questions,
        "date": date
    }

@config_page("test_host.html")
def render_test_host(test_id):
    test = Test.query.filter_by(id=test_id).first()
    test_id = test_id
    return{
        "test": test,
        "test_id": test_id,
        "host_name": flask_login.current_user.nickname,
        'countQuestions': len(test.questions.split(' '))
    }



@config_page("test_user.html")
def render_test_user(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    first_qid = int(test.questions.split()[0])
    return {
        "current_user": flask_login.current_user.nickname if flask_login.current_user.nickname else " ",
        "test": test,
        "first_qid": first_qid,
    }
    
@config_page("test_user_quetion.html")
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
        except Exception:
            answers = [question.answers]
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
        except Exception:
            answers = [question.answers]
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
    time_complete = time.localtime(test.date)
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)
    # time_complete = time.strftime('%y,%m,d,%H:%M', time_complete)
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
    # date = time_complete
    # date_text = f"{date.tm_mday}.{date.tm_mon}.{date.tm_year}"
    # time_text = f"{date.tm_hour}:{date.tm_min}"
    # time_text = time_complete
    
    return {
        "test": test,
        "total_questions": total_questions,
        "time_date": time_date,
        'time_text':time_text,
        "answers": test_answers,
        "correct": correct,
        "questions": questions
    }


@socketio.on('start_test_command')
def handle_start_cmd(data):
    test_id = data['test_id']
    room = f'test_{test_id}'
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return
    question_ids = [int(qid) for qid in test.questions.split()]
    first_question_id = question_ids[0] if question_ids else None
    emit('test_started', {
        'msg': 'Тест почався!',
        'test_id': test_id,
        'first_question_id': first_question_id
    }, room=room)

@socketio.on('join_test')
def handle_join(data):
    print(f"Користувач приєднався: {data}")
    test_id = data['test_id']
    username = data['username']
    role = data.get('role', 'participant')
    room_name = f'test_{test_id}'

    join_room(room_name)
    sid_to_username[request.sid] = username

    data_cell = active_tests.setdefault(test_id, {'participants': set(), 'results': {}})

    if role == 'host':
        data_cell['host_sid'] = request.sid
        emit('host_ack', {'msg': 'Хост підключено', 'test_id': test_id}, to=request.sid)
    else:
        data_cell['participants'].add(username)
        emit('participants_update', list(data_cell['participants']), room=room_name)
        emit('participant_ack', {'msg': 'Учасник підключився'}, to=request.sid)

@socketio.on('submit_answer') 
def handle_answer(data):
    test_id = data['test_id']
    username = data['username']
    is_ok = data.get('is_correct', False)

    cell = active_tests.get(test_id)
    if not cell:
        return

    cell['results'][username] = cell['results'].get(username, 0) + (1 if is_ok else 0)
    host_sid = cell.get('host_sid')
    if host_sid:
        emit('update_results', cell['results'], to=host_sid)



@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    username = sid_to_username.pop(sid, None)

    for test_id, cell in list(active_tests.items()):
        room_name = f'test_{test_id}'
        if cell.get('host_sid') == sid:
            emit('test_closed', room=room_name)
            del active_tests[test_id]
        else:
            if username and username in cell['participants']:
                cell['participants'].remove(username)
                emit('participants_update', list(cell['participants']), room=room_name)

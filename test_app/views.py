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
    username = user.nickname if user else "Unknown"
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    date = time.localtime(test.date)
    time_of_creation = time.strftime('%H:%M', date)
    date = time.strftime('%d.%m.20%y', date)
    return {
        "test": test,
        "name": username,
        "user_id":user.id,
        "total_questions": total_questions,
        "date": date,
        "time_of_creation": time_of_creation
    }

@config_page("test_host.html")
def render_test_host(test_id):
    test = Test.query.filter_by(id=test_id).first()
    test_id = test_id
    return{
        "test": test,
        "test_id": test_id,
        "host_name": flask_login.current_user.nickname,
        'countQuestions': len(test.questions.split(' '))-1
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
        'count_questions':len(test.questions.split(' '))-1,
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
@socketio.on('end_current_question')
def handle_end_current_question(data):
    test_id = data.get('test_id')
    room = f'test_{test_id}'
    test = Test.query.get(int(test_id))
    if not test:
        print(f"Ошибка: тест {test_id} не найден")
        emit('error', {'msg': f'Тест {test_id} не знайдено'}, to=request.sid)
        return
    emit('show_waiting_screen', room=room, skip_sid=request.sid)
    print(f"Событие show_waiting_screen отправлено участникам теста {test_id}")
    
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
    correct = question.correct_answer
    typeOfQuestion = question.type
    if typeOfQuestion == "multiple":
        correct = json.loads(correct)
    if not question:
        return flask.abort(404)

    answers = []
    if question.answers:
        try:
            answers = json.loads(question.answers)
        except Exception:
            answers = [question.answers]
    answers_list = random.sample(answers, len(answers))
    selected = None

    if flask.request.method == "POST":
        if typeOfQuestion == 'standart':
            selected = flask.request.form.get("answer")
            is_correct = selected == correct
        elif typeOfQuestion == 'multiple':
            selected = json.loads(flask.request.form.get("answer"))
            is_correct = len(selected) == len(correct) and set(selected).issuperset(set(correct))
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
    print(
    answers_list,
    current_index + 1,
    total_questions,
    selected,
    question.correct_answer
    )
    return {
        "test": test,
        "question": question,
        "typeOfQuestion":typeOfQuestion,
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
        # typeOfQuestion = "standart"
        # correct = question.correct_answer
        # if type(correct) == type("ewq"):
        #     correct = json.loads(correct)
        #     typeOfQuestion = "multiple"

        user_answer_info = next((item for item in test_answers if item["question_id"] == qid), None)
        user_answer = user_answer_info["answer"] if user_answer_info else None

        # if typeOfQuestion == 'standart':
        #     selected = flask.request.form.get("answer")
        # elif typeOfQuestion == 'multiple':
        #     selected = flask.request.form.getlist("answer")
        #     is_correct = len(selected) == len(correct) and set(selected).issuperset(set(correct))
        is_correct = user_answer_info["is_correct"] if user_answer_info else False
        
        # is_correct = len(user_answer) == len(correct) and set(user_answer).issuperset(set(correct))
        print(user_answer_info["is_correct"])
        if is_correct:
            correct += 1
        options = []
        # correct_options = []
        if question.answers:
            try:
                options = json.loads(question.answers)
            except Exception:
                options = [question.answers]
        # list_to_remove = []
        # for option in options:
        #     if 
        # options.append(question.correct_answer)  # Додаємо правильну відповідь до списку
        options = list(set(options))  # Уникаємо дублікатів
        # {% if type == "standart" %}
        #         {% set is_correct = option == q.correct_answer %}
        #         {% elif type == "multiple" %}
        #         {% set is_correct = option == q.correct_answer %}
        #         {% endif %}
        corrects = question.correct_answer
        if question.type == "multiple":
            corrects = json.loads(corrects)
        print(user_answer,type(user_answer))
        print(User.query.get( test.user),test.user,test)
        # int(total_questions/correct*12)
        questions.append({
            "text": question.text,
            "type": question.type,
            "creator":User.query.get( test.user),
            "correct_answer": corrects,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "options": options,
        })
    
    total_time = getattr(test, 'duration', 330)  # Припустимо 330 секунд
    average_time = total_time / total_questions if total_questions > 0 else 0

    if flask_login.current_user.is_authenticated:
        user = flask_login.current_user
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

    average_time = total_time / total_questions if total_questions > 0 else 0

    null_count = sum(1 for q in questions if q["user_answer"] is None)
    incorrect_count = total_questions - correct - null_count
    print(total_questions,correct)
    return {
        "test": test,        
        "creator": User.query.get(test.user),
        "total_questions": total_questions,
        "time_date": time_date,
        "time_text": time_text,
        "correct": correct,
        "correct_count": correct,
        "incorrect_count": incorrect_count,
        "null_count": null_count,
        "questions": questions,
        "total_time": total_time,
        "average_time": int(average_time),
        "grade":int(correct/total_questions*12) if correct!=0 else 0
    }

# end_test
@socketio.on('end_test')
def end_test(data: dict):
    test_id = data.get("test_id")
    room = f'test_{test_id}'
    test = Test.query.get(int(test_id))
    if not test:
        print("Ошибка: тест не найден")
        return

    user_answers = data.get('user_answers', {})
    questions = [qid for qid in test.questions.split() if qid]
    total_questions = len(questions)

    time_complete = time.localtime(time.time())
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)

    data_to_emit = {
        "test": test.name,
        "time_date": time_date,
        "time_text": time_text,
        "total_questions": total_questions,
        "users": {}
    }

    for username, answers in user_answers.items():
        question_data = []
        corrects = 0

        for i, question_id in enumerate(questions):
            question = Questions.query.get(int(question_id))
            user_answer = answers[i] if i < len(answers) else None
            is_correct = user_answer == question.correct_answer
            correct = question.correct_answer
            if question.type == "multiple":
                print(user_answer,correct, type(correct), type(user_answer))
                user_answer2 = set(user_answer)
                print('gogogg')
                correct = json.loads(correct)
                correct2 = set(correct)
                print('erwetyy')
                is_correct = user_answer2.issuperset(correct2) and correct2.issuperset(user_answer2)
                print('what')
            corrects += is_correct 

            question_data.append({
                "text": question.text,
                "correct_answer": correct,
                "user_answer": user_answer if user_answer else "Не було відповіді",
                "is_correct": is_correct
            })

        data_to_emit["users"][username] = {
            "questions": question_data,
            "correct": corrects
        }

    print("Отправляем testEnd:", data_to_emit)
    emit('testEnd', data_to_emit, room=room)

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

@socketio.on('participant_answered_with_correct')
def handle_answer_with_correct(data):
    test_id = data.get('test_id')
    user = data.get('user')
    selected = data.get('selected')
    correct = data.get('correct')
    question_text = data.get('question_text')

    cell = active_tests.get(test_id)
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
def next_question(data):
    test_id = data.get('test_id')
    question_number = data.get('question_number')
    room_name = f'test_{test_id}'
    test = Test.query.filter_by(id=int(test_id)).first()
    if not test:
        emit('error', {'msg': 'Тест не знайдено'}, room=room_name)
        return

    question_ids = [int(qid) for qid in test.questions.split() if qid]
    if not question_ids or question_number < 1 or question_number > len(question_ids):
        emit('error', {'msg': 'Недійсний номер питання'}, room=room_name)
        return

    question_id = question_ids[question_number - 1]  # Индексация начинается с 0
    question = Questions.query.get(question_id)
    if not question:
        emit('error', {'msg': 'Питання не знайдено'}, room=room_name)
        return

    answers = json.loads(question.answers)
    emit('nextQuestion', {
        'answers': random.sample(answers, len(answers)),
        'question_text': question.text,
        'question_number': question_number,
        "type":question.type
    }, room=room_name)
    cell = active_tests.get(test_id)
    if cell and 'host_sid' in cell:
        emit('correct', {'answer': question.correct_answer}, to=cell['host_sid'])
        # Додано оновлення поточного питання для хоста
        emit('update_question_status', {
            'current_question': question_number,
            'total_questions': len(question_ids)
        }, to=cell['host_sid'])

# @socketio.on('next_question')
# def cqwwewqeweq(data):
#     room_name = f'test_{test_id}'
#     emit('url',{"data":'something'}, room=room)
#     pass

@socketio.on('save_user_answer')
def handle_save_user_answer(data):
    test_id = data.get('test_id')
    username = data.get('username')
    question_id = data.get('question_id')
    answer = data.get('answer')
    correct_answer = data.get('correct_answer')
    question_text = data.get('question_text')

    cell = active_tests.setdefault(test_id, {'participants': set(), 'results': {}, 'answers': {}})
    user_answers = cell['answers'].setdefault(username, [])
    user_answers.append({
        'question_id': question_id,
        'question_text': question_text,
        'answer': answer,
        'correct_answer': correct_answer,
        'is_correct': answer == correct_answer
    })
    # Можно добавить сохранение в базу данных здесь

    emit('user_answer_saved', {'status': 'ok'}, to=request.sid)

@socketio.on('send_answer')
def save_user_answer(data):
    test_id = data.get('test_id')
    room_name = f'test_{test_id}'
    emit('send_answer', data, room=room_name)

from flask import request, jsonify
from project.settings import DATABASE, socketio, active_tests, sid_to_username
def save_result():
    data = flask.request.get_json(silent=True)
    if not data:
        return jsonify({"status": "error", "msg": "No JSON payload"}), 400

    test_id = data.get('test_id')
    total = int(data.get('total', 0))
    correct = int(data.get('correct', 0))
    incorrect = int(data.get('incorrect', total - correct))  
    answers = data.get('answers', None)

    if flask_login.current_user.is_authenticated:
        user = flask_login.current_user
        had_before = any((r.get('test_id') == int(test_id)) for r in user.get_complete_tests())
        user.add_test_result(test_id, total, correct, answers) 

        test = Test.query.get(int(test_id)) if test_id is not None else None
        if test and not had_before:
            test.count = getattr(test, 'count', 0) + 1
            DATABASE.session.commit()
    else:
        pass

    return jsonify({
        "status": "ok",
        "saved": {
            "test_id": test_id,
            "total": total,
            "correct": correct,
            "incorrect": incorrect   
        }
    })
